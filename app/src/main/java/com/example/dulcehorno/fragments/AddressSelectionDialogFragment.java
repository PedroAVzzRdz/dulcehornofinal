package com.example.dulcehorno.fragments;

import android.app.AlertDialog;
import android.app.Dialog;
import android.location.Geocoder;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.DialogFragment;

import com.example.dulcehorno.R;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.MapView;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MarkerOptions;

import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class AddressSelectionDialogFragment extends DialogFragment implements OnMapReadyCallback {

    public interface AddressSelectionListener {
        void onAddressSelected(String address, LatLng location);
    }

    private EditText editSearchAddress;
    private TextView textSelectedAddress;
    private Button buttonConfirm;
    private Button buttonCancel;
    private MapView mapView;
    
    private GoogleMap googleMap;
    private AddressSelectionListener listener;
    private String selectedAddress = "";
    private LatLng selectedLocation = null;
    private Geocoder geocoder;
    private ExecutorService executorService;
    private Handler mainHandler;
    private boolean isMapReady = false;
    private static final String MAPVIEW_BUNDLE_KEY = "MapViewBundleKey";

    public static AddressSelectionDialogFragment newInstance() {
        return new AddressSelectionDialogFragment();
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setStyle(DialogFragment.STYLE_NORMAL, android.R.style.Theme_Material_Light_Dialog);
        geocoder = new Geocoder(requireContext(), Locale.getDefault());
        executorService = Executors.newSingleThreadExecutor();
        mainHandler = new Handler(Looper.getMainLooper());
    }

    @NonNull
    @Override
    public Dialog onCreateDialog(@Nullable Bundle savedInstanceState) {
        Dialog dialog = super.onCreateDialog(savedInstanceState);
        if (dialog.getWindow() != null) {
            dialog.getWindow().requestFeature(Window.FEATURE_NO_TITLE);
        }
        return dialog;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.dialog_address_selection, container, false);
        
        editSearchAddress = view.findViewById(R.id.edit_search_address);
        textSelectedAddress = view.findViewById(R.id.text_selected_address);
        buttonConfirm = view.findViewById(R.id.button_confirm);
        buttonCancel = view.findViewById(R.id.button_cancel);
        mapView = view.findViewById(R.id.map_view);

        // Configurar MapView
        Bundle mapViewBundle = null;
        if (savedInstanceState != null) {
            mapViewBundle = savedInstanceState.getBundle(MAPVIEW_BUNDLE_KEY);
        }
        mapView.onCreate(mapViewBundle);
        mapView.getMapAsync(this);

        // Configurar búsqueda de direcciones con delay para evitar muchas llamadas
        final Handler handler = new Handler(Looper.getMainLooper());
        Runnable searchRunnable = null;
        
        editSearchAddress.addTextChangedListener(new TextWatcher() {
            private Runnable searchRunnable;

            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                if (searchRunnable != null) {
                    handler.removeCallbacks(searchRunnable);
                }
            }

            @Override
            public void afterTextChanged(Editable s) {
                if (searchRunnable != null) {
                    handler.removeCallbacks(searchRunnable);
                }
                final String query = s.toString().trim();
                searchRunnable = () -> {
                    if (query.length() > 3) {
                        geocodeAddress(query);
                    } else if (query.isEmpty()) {
                        resetSelection();
                    } else if (query.length() <= 3 && query.length() > 0) {
                        // Si el usuario está escribiendo pero aún no tiene 3 caracteres, no hacer nada
                        textSelectedAddress.setText("Escribiendo...");
                    }
                };
                handler.postDelayed(searchRunnable, 800); // Esperar 800ms después de que el usuario deje de escribir
            }
        });

        buttonConfirm.setOnClickListener(v -> {
            if (selectedLocation != null && !selectedAddress.isEmpty()) {
                if (listener != null) {
                    listener.onAddressSelected(selectedAddress, selectedLocation);
                }
                dismiss();
            } else {
                Toast.makeText(requireContext(), "Por favor, selecciona una dirección válida", Toast.LENGTH_SHORT).show();
            }
        });

        buttonCancel.setOnClickListener(v -> dismiss());
        
        return view;
    }
    
    @Override
    public void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        if (mapView != null) {
            Bundle mapViewBundle = outState.getBundle(MAPVIEW_BUNDLE_KEY);
            if (mapViewBundle == null) {
                mapViewBundle = new Bundle();
                outState.putBundle(MAPVIEW_BUNDLE_KEY, mapViewBundle);
            }
            mapView.onSaveInstanceState(mapViewBundle);
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        if (mapView != null) {
            mapView.onResume();
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        if (mapView != null) {
            mapView.onStart();
        }
        if (getDialog() != null && getDialog().getWindow() != null) {
            // Ajustar el tamaño del diálogo para que sea más grande
            getDialog().getWindow().setLayout(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    (int) (getResources().getDisplayMetrics().heightPixels * 0.9)
            );
        }
    }

    @Override
    public void onStop() {
        super.onStop();
        if (mapView != null) {
            mapView.onStop();
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        if (mapView != null) {
            mapView.onPause();
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (mapView != null) {
            mapView.onDestroy();
        }
        if (executorService != null) {
            executorService.shutdown();
        }
    }

    @Override
    public void onLowMemory() {
        super.onLowMemory();
        if (mapView != null) {
            mapView.onLowMemory();
        }
    }

    private void geocodeAddress(String address) {
        // Mostrar mensaje de búsqueda
        textSelectedAddress.setText("Buscando dirección...");
        
        executorService.execute(() -> {
            try {
                List<android.location.Address> addresses = geocoder.getFromLocationName(address, 1);
                mainHandler.post(() -> {
                    if (addresses != null && !addresses.isEmpty()) {
                        android.location.Address addressResult = addresses.get(0);
                        double latitude = addressResult.getLatitude();
                        double longitude = addressResult.getLongitude();
                        
                        // Validar que las coordenadas sean válidas
                        if (latitude == 0.0 && longitude == 0.0) {
                            showInvalidAddressDialog();
                            resetSelection();
                            return;
                        }
                        
                        selectedLocation = new LatLng(latitude, longitude);
                        
                        // Construir dirección completa
                        StringBuilder fullAddress = new StringBuilder();
                        if (addressResult.getAddressLine(0) != null && !addressResult.getAddressLine(0).isEmpty()) {
                            selectedAddress = addressResult.getAddressLine(0);
                        } else {
                            // Construir dirección manualmente
                            if (addressResult.getThoroughfare() != null) {
                                fullAddress.append(addressResult.getThoroughfare());
                            }
                            if (addressResult.getSubThoroughfare() != null) {
                                if (fullAddress.length() > 0) fullAddress.append(" ");
                                fullAddress.append(addressResult.getSubThoroughfare());
                            }
                            if (addressResult.getLocality() != null) {
                                if (fullAddress.length() > 0) fullAddress.append(", ");
                                fullAddress.append(addressResult.getLocality());
                            }
                            if (addressResult.getAdminArea() != null) {
                                if (fullAddress.length() > 0) fullAddress.append(", ");
                                fullAddress.append(addressResult.getAdminArea());
                            }
                            selectedAddress = fullAddress.toString();
                        }
                        
                        if (selectedAddress.isEmpty()) {
                            showInvalidAddressDialog();
                            resetSelection();
                            return;
                        }
                        
                        updateMapAndUI();
                    } else {
                        showInvalidAddressDialog();
                        resetSelection();
                    }
                });
            } catch (IOException e) {
                Log.e("AddressSelection", "Error geocoding address", e);
                mainHandler.post(() -> {
                    showInvalidAddressDialog();
                    resetSelection();
                });
            } catch (Exception e) {
                Log.e("AddressSelection", "Error inesperado", e);
                mainHandler.post(() -> {
                    showInvalidAddressDialog();
                    resetSelection();
                });
            }
        });
    }
    
    private void showInvalidAddressDialog() {
        new AlertDialog.Builder(requireContext())
                .setTitle("Dirección inválida")
                .setMessage("Ingresa una dirección válida")
                .setPositiveButton("Aceptar", (dialog, which) -> {
                    dialog.dismiss();
                    editSearchAddress.requestFocus();
                })
                .setCancelable(true)
                .show();
    }

    private void updateMapAndUI() {
        if (isMapReady && googleMap != null && selectedLocation != null) {
            try {
                googleMap.clear();
                googleMap.addMarker(new MarkerOptions()
                        .position(selectedLocation)
                        .title(selectedAddress));
                googleMap.animateCamera(CameraUpdateFactory.newLatLngZoom(selectedLocation, 16f));
                
                textSelectedAddress.setText("Dirección: " + selectedAddress);
                buttonConfirm.setEnabled(true);
            } catch (Exception e) {
                Log.e("AddressSelection", "Error updating map", e);
                textSelectedAddress.setText("Dirección: " + selectedAddress);
                buttonConfirm.setEnabled(true);
            }
        } else if (selectedLocation != null && selectedAddress != null && !selectedAddress.isEmpty()) {
            // Si el mapa aún no está listo, guardar la información y actualizar cuando esté listo
            textSelectedAddress.setText("Dirección: " + selectedAddress);
            buttonConfirm.setEnabled(true);
        }
    }

    private void resetSelection() {
        selectedAddress = "";
        selectedLocation = null;
        textSelectedAddress.setText("Dirección: Busca y selecciona una dirección válida");
        buttonConfirm.setEnabled(false);
        if (isMapReady && googleMap != null) {
            googleMap.clear();
            // Restaurar ubicación por defecto
            LatLng defaultLocation = new LatLng(19.4326, -99.1332);
            googleMap.moveCamera(CameraUpdateFactory.newLatLngZoom(defaultLocation, 11f));
            googleMap.addMarker(new MarkerOptions()
                    .position(defaultLocation)
                    .title("Busca una dirección para verla en el mapa"));
        }
    }

    @Override
    public void onMapReady(@NonNull GoogleMap map) {
        googleMap = map;
        isMapReady = true;
        
        try {
            // Configurar opciones del mapa
            googleMap.getUiSettings().setZoomControlsEnabled(true);
            googleMap.getUiSettings().setMyLocationButtonEnabled(false);
            googleMap.getUiSettings().setCompassEnabled(true);
            googleMap.getUiSettings().setMapToolbarEnabled(false);
            
            // Configurar ubicación inicial (México - Ciudad de México)
            LatLng defaultLocation = new LatLng(19.4326, -99.1332);
            googleMap.moveCamera(CameraUpdateFactory.newLatLngZoom(defaultLocation, 11f));
            
            // Si ya hay una dirección seleccionada, actualizar el mapa
            if (selectedLocation != null) {
                updateMapAndUI();
            } else {
                // Mostrar marcador en la ubicación por defecto para que el mapa se vea
                googleMap.addMarker(new MarkerOptions()
                        .position(defaultLocation)
                        .title("Busca una dirección para verla en el mapa"));
            }
            
            // Permitir que el usuario toque el mapa para seleccionar ubicación
            googleMap.setOnMapClickListener(latLng -> {
                selectedLocation = latLng;
                reverseGeocode(latLng);
            });
            
        } catch (Exception e) {
            Log.e("AddressSelection", "Error configuring map", e);
            isMapReady = false;
        }
    }

    private void reverseGeocode(LatLng location) {
        executorService.execute(() -> {
            try {
                List<android.location.Address> addresses = geocoder.getFromLocation(
                        location.latitude, location.longitude, 1);
                mainHandler.post(() -> {
                    if (addresses != null && !addresses.isEmpty()) {
                        android.location.Address address = addresses.get(0);
                        StringBuilder fullAddress = new StringBuilder();
                        
                        if (address.getAddressLine(0) != null) {
                            selectedAddress = address.getAddressLine(0);
                        } else {
                            if (address.getThoroughfare() != null) {
                                fullAddress.append(address.getThoroughfare());
                            }
                            if (address.getSubThoroughfare() != null) {
                                if (fullAddress.length() > 0) fullAddress.append(" ");
                                fullAddress.append(address.getSubThoroughfare());
                            }
                            if (address.getLocality() != null) {
                                if (fullAddress.length() > 0) fullAddress.append(", ");
                                fullAddress.append(address.getLocality());
                            }
                            if (address.getAdminArea() != null) {
                                if (fullAddress.length() > 0) fullAddress.append(", ");
                                fullAddress.append(address.getAdminArea());
                            }
                            selectedAddress = fullAddress.toString();
                        }
                        
                        if (selectedAddress.isEmpty()) {
                            selectedAddress = "Ubicación seleccionada: " + location.latitude + ", " + location.longitude;
                        }
                        
                        updateMapAndUI();
                    } else {
                        selectedAddress = "Ubicación seleccionada: " + location.latitude + ", " + location.longitude;
                        updateMapAndUI();
                    }
                });
            } catch (IOException e) {
                Log.e("AddressSelection", "Error reverse geocoding", e);
                mainHandler.post(() -> {
                    selectedAddress = "Ubicación seleccionada: " + location.latitude + ", " + location.longitude;
                    updateMapAndUI();
                });
            }
        });
    }

    public void setAddressSelectionListener(AddressSelectionListener listener) {
        this.listener = listener;
    }
}
