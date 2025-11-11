package com.example.dulcehorno.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.dulcehorno.R;
import com.example.dulcehorno.model.Product;

import java.util.List;

public class ProductAdapter extends RecyclerView.Adapter<ProductAdapter.ProductViewHolder> {

    public interface OnItemClickListener {
        void onItemClick(Product product);
    }

    public interface OnAddClickListener {
        void onAddClick(Product product);
    }

    private final List<Product> productList;
    private final OnItemClickListener itemClickListener;
    private final OnAddClickListener addClickListener;

    public ProductAdapter(List<Product> productList, OnItemClickListener itemClickListener, OnAddClickListener addClickListener) {
        this.productList = productList;
        this.itemClickListener = itemClickListener;
        this.addClickListener = addClickListener;
    }

    @NonNull
    @Override
    public ProductViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_product, parent, false);
        return new ProductViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ProductViewHolder holder, int position) {
        Product p = productList.get(position);
        
        if (p == null) return;

        holder.textName.setText(p.getName() != null ? p.getName() : "");
        holder.textPrice.setText(String.format("$%.2f", p.getPrice()));
        
        // Mostrar stock disponible considerando el carrito
        int availableStock;
        try {
            availableStock = com.example.dulcehorno.ProductManager.getInstance().getAvailableStock(p.getId());
        } catch (Exception e) {
            // Si hay error, mostrar stock del producto directamente
            android.util.Log.e("ProductAdapter", "Error obteniendo stock disponible", e);
            availableStock = p.getAvailableUnits();
        }
        
        // Variable final para usar en el lambda
        final int finalAvailableStock = availableStock;
        
        holder.textStock.setText("Disponibles: " + finalAvailableStock);
        
        // Cambiar color si no hay stock
        if (finalAvailableStock <= 0) {
            holder.textStock.setTextColor(holder.itemView.getContext().getResources().getColor(android.R.color.holo_red_dark, null));
        } else {
            holder.textStock.setTextColor(holder.itemView.getContext().getResources().getColor(android.R.color.darker_gray, null));
        }
        
        // Mantener el botón habilitado para poder mostrar mensaje cuando no hay stock
        // El botón se mostrará con estilo diferente si no hay stock
        holder.buttonAdd.setEnabled(true);
        if (finalAvailableStock <= 0) {
            // Cambiar el texto del botón cuando no hay stock
            holder.buttonAdd.setText("Sin stock");
            holder.buttonAdd.setAlpha(0.6f); // Hacer el botón semi-transparente
        } else {
            holder.buttonAdd.setText("Agregar");
            holder.buttonAdd.setAlpha(1.0f); // Botón completamente opaco
        }

        // Cargar imagen del producto
        try {
            int resId = holder.itemView.getContext().getResources().getIdentifier(
                    p.getDrawableResId(), "drawable", holder.itemView.getContext().getPackageName()
            );
            if (resId != 0) {
                holder.imageProduct.setImageResource(resId);
            } else {
                // Si no se encuentra la imagen, usar una imagen por defecto
                android.util.Log.w("ProductAdapter", "Drawable no encontrado: " + p.getDrawableResId() + " para producto: " + p.getName());
                // Intentar con una imagen por defecto si existe
                int defaultResId = holder.itemView.getContext().getResources().getIdentifier(
                        "logo_app", "drawable", holder.itemView.getContext().getPackageName()
                );
                if (defaultResId != 0) {
                    holder.imageProduct.setImageResource(defaultResId);
                }
            }
        } catch (Exception e) {
            android.util.Log.e("ProductAdapter", "Error cargando imagen", e);
        }

        // click en todo el item → abrir detalle
        holder.itemView.setOnClickListener(v -> {
            if (itemClickListener != null && p != null) {
                itemClickListener.onItemClick(p);
            }
        });

        // click en el botón agregar → pedir cantidad o mostrar mensaje de sin stock
        holder.buttonAdd.setOnClickListener(v -> {
            if (addClickListener != null && p != null) {
                if (finalAvailableStock > 0) {
                    // Hay stock, abrir diálogo para agregar cantidad
                    addClickListener.onAddClick(p);
                } else {
                    // No hay stock, mostrar toast
                    android.widget.Toast.makeText(
                            holder.itemView.getContext(),
                            "Lo sentimos, " + p.getName() + " está agotado",
                            android.widget.Toast.LENGTH_SHORT
                    ).show();
                }
            }
        });
    }

    @Override
    public int getItemCount() {
        return productList.size();
    }

    static class ProductViewHolder extends RecyclerView.ViewHolder {
        ImageView imageProduct;
        TextView textName, textPrice, textStock;
        Button buttonAdd;

        public ProductViewHolder(@NonNull View itemView) {
            super(itemView);
            imageProduct = itemView.findViewById(R.id.imageProduct);
            textName = itemView.findViewById(R.id.textProductName);
            textPrice = itemView.findViewById(R.id.textProductPrice);
            textStock = itemView.findViewById(R.id.textProductStock); // <-- NUEVO
            buttonAdd = itemView.findViewById(R.id.buttonAddToCart);
        }
    }
}
