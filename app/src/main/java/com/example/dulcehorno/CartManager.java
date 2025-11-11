package com.example.dulcehorno;
// CartManager.java

import com.example.dulcehorno.model.CartItem;
import com.example.dulcehorno.model.Product;

import java.util.ArrayList;
import java.util.List;

public class CartManager {

    private static CartManager instance;
    private final List<CartItem> cartItems = new ArrayList<>();
    private final List<CartChangeListener> listeners = new ArrayList<>();

    public interface CartChangeListener { void onCartUpdated(); }

    private CartManager() {}

    public static CartManager getInstance() {
        if (instance == null) instance = new CartManager();
        return instance;
    }

    public void addListener(CartChangeListener l) {
        if (!listeners.contains(l)) listeners.add(l);
    }

    public void removeListener(CartChangeListener l) {
        listeners.remove(l);
    }

    private void notifyListeners() {
        // Crear una copia de la lista para evitar ConcurrentModificationException
        List<CartChangeListener> listenersCopy = new ArrayList<>(listeners);
        for (CartChangeListener l : listenersCopy) {
            try {
                if (l != null) {
                    l.onCartUpdated();
                }
            } catch (Exception e) {
                // Log del error pero continuar con otros listeners
                android.util.Log.e("CartManager", "Error notificando listener", e);
            }
        }
    }

    // Añadir producto con cantidad — si ya existe, sumar la cantidad
    public void addToCart(Product product, int quantity) {
        if (quantity <= 0 || product == null || product.getId() == null) {
            return;
        }
        
        try {
            for (CartItem item : cartItems) {
                if (item != null && item.getProduct() != null && 
                    item.getProduct().getId() != null && 
                    item.getProduct().getId().equals(product.getId())) {
                    item.setQuantity(item.getQuantity() + quantity);
                    notifyListeners();
                    return;
                }
            }
            cartItems.add(new CartItem(product, quantity));
            notifyListeners();
        } catch (Exception e) {
            android.util.Log.e("CartManager", "Error agregando producto al carrito", e);
        }
    }

    public void removeFromCart(Product product) {
        if (product == null || product.getId() == null) {
            return;
        }
        
        try {
            for (int i = 0; i < cartItems.size(); i++) {
                CartItem item = cartItems.get(i);
                if (item != null && item.getProduct() != null && 
                    item.getProduct().getId() != null && 
                    item.getProduct().getId().equals(product.getId())) {
                    cartItems.remove(i);
                    notifyListeners();
                    return;
                }
            }
        } catch (Exception e) {
            android.util.Log.e("CartManager", "Error removiendo producto del carrito", e);
        }
    }

    public List<CartItem> getCartItems() {
        return cartItems;
    }

    public void clearCart() {
        cartItems.clear();
        notifyListeners();
    }

    public double getTotalPrice() {
        double total = 0;
        for (CartItem item : cartItems) total += item.getLineTotal();
        return total;
    }
}