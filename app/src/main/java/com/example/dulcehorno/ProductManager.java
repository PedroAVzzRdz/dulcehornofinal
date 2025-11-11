package com.example.dulcehorno;

import com.example.dulcehorno.model.CartItem;
import com.example.dulcehorno.model.Product;
import java.util.ArrayList;
import java.util.List;

public class ProductManager {
    private static ProductManager instance;
    private final List<Product> products = new ArrayList<>();

    private ProductManager() {}

    public static synchronized ProductManager getInstance() {
        if (instance == null) {
            instance = new ProductManager();
        }
        return instance;
    }

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> newProducts) {
        products.clear();
        if (newProducts != null) {
            products.addAll(newProducts);
        }
    }

    public void addProduct(Product product) {
        if (product != null) products.add(product);
    }

    public void removeProduct(Product product) {
        products.remove(product);
    }

    public void clear() {
        products.clear();
    }

    public void decreaseProductUnits(String productId, int quantity) {
        for (Product p : products) {
            if (p.getId().equals(productId)) {
                p.setAvailableUnits(Math.max(0, p.getAvailableUnits() - quantity));
                break;
            }
        }
    }
    
    /**
     * Obtiene el stock disponible de un producto considerando lo que está en el carrito
     * @param productId ID del producto
     * @return Stock disponible (stock real - cantidad en carrito)
     */
    public int getAvailableStock(String productId) {
        if (productId == null) return 0;
        
        Product product = getProductById(productId);
        if (product == null) return 0;
        
        int stockReal = product.getAvailableUnits();
        
        // Restar lo que está en el carrito
        try {
            List<CartItem> cartItems = CartManager.getInstance().getCartItems();
            if (cartItems != null) {
                for (CartItem item : cartItems) {
                    if (item != null && item.getProduct() != null && 
                        productId.equals(item.getProduct().getId())) {
                        stockReal -= item.getQuantity();
                        break;
                    }
                }
            }
        } catch (Exception e) {
            // Si hay algún error, retornar el stock real sin considerar el carrito
            android.util.Log.e("ProductManager", "Error calculando stock disponible", e);
        }
        
        return Math.max(0, stockReal);
    }
    
    /**
     * Obtiene un producto por su ID
     */
    public Product getProductById(String productId) {
        for (Product p : products) {
            if (p.getId().equals(productId)) {
                return p;
            }
        }
        return null;
    }
    
    /**
     * Actualiza el stock de un producto
     */
    public void updateProductStock(String productId, int newStock) {
        Product product = getProductById(productId);
        if (product != null) {
            product.setAvailableUnits(newStock);
        }
    }
}
