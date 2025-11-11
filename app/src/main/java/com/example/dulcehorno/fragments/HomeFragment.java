package com.example.dulcehorno.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.example.dulcehorno.ProductManager;
import com.example.dulcehorno.ReceiptManager;
import com.example.dulcehorno.UserSessionManager;
import com.example.dulcehorno.model.Product;
import com.example.dulcehorno.model.Receipt;
import com.example.dulcehorno.model.UserProfileResponse;
import com.example.dulcehorno.network.repository.ProductsRepository;
import com.example.dulcehorno.network.repository.UserRepository;
import com.example.dulcehorno.utils.ErrorHandler;
import com.example.dulcehorno.R;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.List;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.Response;

public class HomeFragment extends Fragment {

    private UserRepository userRepository;
    private ProductsRepository productsRepository;
    private Gson gson = new Gson();

    public HomeFragment() {}

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View rootView = inflater.inflate(R.layout.fragment_home, container, false);

        userRepository = new UserRepository(requireContext());
        productsRepository = new ProductsRepository(requireContext());

        loadUserProfile();
        loadUserReceipts();
        loadProductsAndShowFragment();

        return rootView;
    }

    private void loadUserProfile() {
        userRepository.getUserProfile(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                e.printStackTrace();
                if (isAdded()) {
                    requireActivity().runOnUiThread(() ->
                            Toast.makeText(getContext(), "Error de conexión", Toast.LENGTH_SHORT).show()
                    );
                    redirectToLogin();
                }
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if (!isAdded()) return;

                String responseBody = response.body() != null ? response.body().string() : "";

                if (response.isSuccessful()) {
                    UserProfileResponse userProfileResponse = gson.fromJson(responseBody, UserProfileResponse.class);
                    UserSessionManager.getInstance().setUserProfile(userProfileResponse);
                } else {
                    String errorMessage = ErrorHandler.getErrorMessage(responseBody);
                    requireActivity().runOnUiThread(() ->
                            Toast.makeText(getContext(), errorMessage, Toast.LENGTH_SHORT).show()
                    );
                    redirectToLogin();
                }
            }
        });
    }

    private void loadUserReceipts() {
        userRepository.getUserReceipts(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                e.printStackTrace();
                if (isAdded()) {
                    requireActivity().runOnUiThread(() ->
                            Toast.makeText(getContext(), "Error de conexión", Toast.LENGTH_SHORT).show()
                    );
                }
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if (!isAdded()) return;

                String responseBody = response.body() != null ? response.body().string() : "";

                if (response.isSuccessful()) {
                    Type listType = new TypeToken<List<Receipt>>() {}.getType();
                    List<Receipt> receipts = gson.fromJson(responseBody, listType);

                    ReceiptManager receiptManager = ReceiptManager.getInstance();
                    receiptManager.clearReceipts();
                    for (Receipt r : receipts) {
                        receiptManager.addReceipt(r);
                    }

                } else {
                    String errorMessage = ErrorHandler.getErrorMessage(responseBody);
                    requireActivity().runOnUiThread(() ->
                            Toast.makeText(getContext(), errorMessage, Toast.LENGTH_SHORT).show()
                    );
                }
            }
        });
    }

    private void loadProductsAndShowFragment() {
        productsRepository.getProducts(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                e.printStackTrace();
                if (isAdded()) {
                    requireActivity().runOnUiThread(() ->
                            Toast.makeText(getContext(), "Error de conexión al obtener productos", Toast.LENGTH_SHORT).show()
                    );
                }
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if (!isAdded()) return;

                String responseBody = response.body() != null ? response.body().string() : "";

                if (response.isSuccessful()) {
                    try {
                        Type listType = new TypeToken<List<Product>>() {}.getType();
                        List<Product> products = gson.fromJson(responseBody, listType);

                        if (products == null || products.isEmpty()) {
                            requireActivity().runOnUiThread(() ->
                                    Toast.makeText(getContext(), "No se encontraron productos", Toast.LENGTH_SHORT).show()
                            );
                            return;
                        }

                        ProductManager productManager = ProductManager.getInstance();
                        productManager.clear();
                        for (Product p : products) {
                            if (p != null && p.getId() != null && p.getName() != null) {
                                productManager.addProduct(p);
                            }
                        }

                        // Mostrar ProductsFragment SOLO después de cargar productos
                        requireActivity().runOnUiThread(() -> {
                            showDefaultFragment();
                            // Log para debug
                            android.util.Log.d("HomeFragment", "Productos cargados: " + productManager.getProducts().size());
                            for (Product prod : productManager.getProducts()) {
                                android.util.Log.d("HomeFragment", "  - " + prod.getName() + " (" + prod.getDrawableResId() + ")");
                            }
                        });

                    } catch (Exception e) {
                        e.printStackTrace();
                        requireActivity().runOnUiThread(() ->
                                Toast.makeText(getContext(), "Error al procesar productos: " + e.getMessage(), Toast.LENGTH_LONG).show()
                        );
                    }

                } else {
                    String errorMessage = ErrorHandler.getErrorMessage(responseBody);
                    requireActivity().runOnUiThread(() ->
                            Toast.makeText(getContext(), errorMessage, Toast.LENGTH_SHORT).show()
                    );
                }
            }
        });
    }

    private void showDefaultFragment() {
        BottomNavigationView bottomNavigationView = requireView().findViewById(R.id.bottomNavigationView);

        // Cargar fragment por defecto: Productos
        getChildFragmentManager()
                .beginTransaction()
                .replace(R.id.homeFragmentContainer, new ProductsFragment())
                .commit();

        // Configurar navegación
        bottomNavigationView.setOnItemSelectedListener(item -> {
            Fragment selectedFragment = null;
            int itemId = item.getItemId();

            if (itemId == R.id.navigation_products) {
                selectedFragment = new ProductsFragment();
            } else if (itemId == R.id.navigation_cart) {
                selectedFragment = new CartFragment();
            } else if (itemId == R.id.navigation_receipts) {
                selectedFragment = new HistoryFragment();
            }

            if (selectedFragment != null) {
                getChildFragmentManager()
                        .beginTransaction()
                        .replace(R.id.homeFragmentContainer, selectedFragment)
                        .commit();
            }

            return true;
        });
    }

    private void redirectToLogin() {
        if (!isAdded()) return;
        requireActivity().runOnUiThread(() -> {
            getParentFragmentManager()
                    .beginTransaction()
                    .replace(R.id.fragmentContainer, new LoginFragment())
                    .addToBackStack(null)
                    .commit();
        });
    }
}
