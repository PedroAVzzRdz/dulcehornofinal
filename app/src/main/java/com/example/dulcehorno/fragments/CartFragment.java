package com.example.dulcehorno.fragments;

import android.app.AlertDialog;
import android.os.Bundle;
import android.text.format.DateFormat;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.dulcehorno.CartManager;
import com.example.dulcehorno.ProductManager;
import com.example.dulcehorno.R;
import com.example.dulcehorno.ReceiptManager;
import com.example.dulcehorno.adapters.CartAdapter;
import com.example.dulcehorno.model.CartItem;
import com.example.dulcehorno.model.Product;
import com.example.dulcehorno.model.Receipt;
import com.example.dulcehorno.network.repository.ProductsRepository;
import com.example.dulcehorno.network.repository.UserRepository;
import com.example.dulcehorno.utils.ErrorHandler;
import com.google.android.gms.maps.model.LatLng;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Random;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.Response;

public class CartFragment extends Fragment {

    private RecyclerView recyclerCart;
    private TextView textTotal;
    private Button buttonPay;

    private CartAdapter adapter;
    private List<CartItem> cartItems;

    private UserRepository userRepository;

    // Listener para actualizaciones del carrito
    private final CartManager.CartChangeListener cartListener = this::onCartUpdated;

    public CartFragment() {}

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_cart, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        recyclerCart = view.findViewById(R.id.recyclerCart);
        textTotal = view.findViewById(R.id.textTotal);
        buttonPay = view.findViewById(R.id.buttonPay);
        userRepository = new UserRepository(requireContext());

        // Obtener los items del carrito
        cartItems = CartManager.getInstance().getCartItems();

        adapter = new CartAdapter(cartItems, cartItem -> {
            // eliminar el producto (usa el product dentro del cartItem)
            CartManager.getInstance().removeFromCart(cartItem.getProduct());
        });

        recyclerCart.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerCart.setAdapter(adapter);

        // Registrar listener
        CartManager.getInstance().addListener(cartListener);

        // Mostrar total inicial
        updateTotal();


        buttonPay.setOnClickListener(v -> {
            if (cartItems.isEmpty()) {
                Toast.makeText(getContext(), "El carrito está vacío", Toast.LENGTH_SHORT).show();
                return;
            }

            // Mostrar diálogo de selección de dirección con mapa
            AddressSelectionDialogFragment addressDialog = AddressSelectionDialogFragment.newInstance();
            addressDialog.setAddressSelectionListener((address, location) -> {
                // Cuando se selecciona una dirección válida, proceder con el pedido
                processOrder(address, location);
            });
            addressDialog.show(getParentFragmentManager(), "AddressSelectionDialog");
        });

    }

    private void onCartUpdated() {
        requireActivity().runOnUiThread(() -> {
            adapter.notifyDataSetChanged();
            updateTotal();
        });
    }

    private void updateTotal() {
        double subtotal = CartManager.getInstance().getTotalPrice();
        double total = subtotal + 40.0; // Agregar costo de envío
        textTotal.setText(String.format("Total: $%.2f", total));
    }

    private void processOrder(String location, LatLng locationLatLng) {
        // Generar fechas
        String requestDate = DateFormat.format("dd/MM/yyyy HH:mm", new java.util.Date()).toString();
        Random rnd = new Random();
        int extraDays = rnd.nextInt(5) + 1; // 1..5 días
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_MONTH, extraDays);
        String estimatedArrival = DateFormat.format("dd/MM/yyyy", cal).toString();

        // Copia de los items del carrito
        List<CartItem> itemsForReceipt = new ArrayList<>();
        for (CartItem ci : CartManager.getInstance().getCartItems()) {
            itemsForReceipt.add(new CartItem(ci.getProduct(), ci.getQuantity()));
        }

        double total = CartManager.getInstance().getTotalPrice() + 40.0;

        userRepository.getUserReceiptsCount(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                if (!isAdded() || getActivity() == null) return;
                getActivity().runOnUiThread(() ->
                        Toast.makeText(getContext(), "Error obteniendo número de recibos", Toast.LENGTH_SHORT).show()
                );
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if (!isAdded() || getActivity() == null) return;

                if (!response.isSuccessful()) {
                    getActivity().runOnUiThread(() ->
                            Toast.makeText(getContext(), "No se pudo obtener la cantidad de recibos", Toast.LENGTH_SHORT).show()
                    );
                    return;
                }

                String body = response.body() != null ? response.body().string() : "0";
                int count = 0;
                try {
                    count = Integer.parseInt(body.trim());
                } catch (NumberFormatException ignored) {}

                String id = "re" + (count + 1);
                Receipt receipt = new Receipt(id, requestDate, estimatedArrival, location, itemsForReceipt, total);

                userRepository.addUserReceipt(receipt, new Callback() {
                    @Override
                    public void onFailure(@NonNull Call call, @NonNull IOException e) {
                        if (!isAdded() || getActivity() == null) return;
                        e.printStackTrace();
                        getActivity().runOnUiThread(() ->
                                Toast.makeText(getContext(), "Error procesando la compra", Toast.LENGTH_SHORT).show()
                        );
                    }

                    @Override
                    public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                        if (!isAdded() || getActivity() == null) return;
                        String responseBody = response.body() != null ? response.body().string() : "";

                        if (response.isSuccessful()) {
                            // Agregar recibo al singleton de recibos
                            ReceiptManager.getInstance().addReceipt(receipt);

                            // Actualizar carrito
                            CartManager.getInstance().clearCart();

                            // Recargar productos del servidor para obtener el stock actualizado
                            reloadProductsFromServer(() -> {
                                // Mostrar diálogo de confirmación con el mensaje solicitado
                                getActivity().runOnUiThread(() -> {
                                    showOrderConfirmationDialog(total);
                                });
                            });
                        }
                        else {
                            int statusCode = response.code();
                            String errorMessage = ErrorHandler.getErrorMessage(responseBody);

                            getActivity().runOnUiThread(() -> {
                                Toast.makeText(getContext(), errorMessage, Toast.LENGTH_SHORT).show();
                                if (statusCode == 403) {
                                    getActivity().getSupportFragmentManager()
                                            .beginTransaction()
                                            .replace(R.id.fragmentContainer, new LoginFragment())
                                            .addToBackStack(null)
                                            .commit();
                                }
                            });
                        }
                    }
                });
            }
        });
    }

    /**
     * Recarga los productos del servidor para obtener el stock actualizado
     */
    private void reloadProductsFromServer(Runnable onComplete) {
        ProductsRepository productsRepository = new ProductsRepository(requireContext());
        Gson gson = new Gson();
        
        productsRepository.getProducts(new Callback() {
            @Override
            public void onFailure(@NonNull Call call, @NonNull IOException e) {
                if (!isAdded() || getActivity() == null) return;
                // Si falla, continuar de todas formas
                if (onComplete != null) {
                    getActivity().runOnUiThread(onComplete);
                }
            }

            @Override
            public void onResponse(@NonNull Call call, @NonNull Response response) throws IOException {
                if (!isAdded() || getActivity() == null) return;
                
                String responseBody = response.body() != null ? response.body().string() : "";
                
                if (response.isSuccessful()) {
                    try {
                        Type listType = new TypeToken<List<Product>>() {}.getType();
                        List<Product> products = gson.fromJson(responseBody, listType);
                        
                        if (products != null && !products.isEmpty()) {
                            ProductManager productManager = ProductManager.getInstance();
                            productManager.clear();
                            for (Product p : products) {
                                if (p != null && p.getId() != null && p.getName() != null) {
                                    productManager.addProduct(p);
                                }
                            }
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
                
                // Ejecutar callback
                if (onComplete != null) {
                    getActivity().runOnUiThread(onComplete);
                }
            }
        });
    }

    private void showOrderConfirmationDialog(double totalAmount) {
        String message = String.format("Tu pedido está en camino, recuerda traer $%.2f exacto", totalAmount);
        
        new AlertDialog.Builder(requireContext())
                .setTitle("Pedido Confirmado")
                .setMessage(message)
                .setPositiveButton("Aceptar", (dialog, which) -> {
                    dialog.dismiss();
                })
                .setCancelable(false)
                .show();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        CartManager.getInstance().removeListener(cartListener);
    }
}
