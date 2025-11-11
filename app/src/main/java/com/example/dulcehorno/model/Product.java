package com.example.dulcehorno.model;

import java.io.Serializable;

public class Product implements Serializable {
    private String id;
    private String name;
    private double price;
    private String drawableResId;
    private String description;
    private String category;
    private int availableUnits;

    // Constructor vacío para Gson
    public Product() {
        this.availableUnits = 50; // Valor por defecto
    }

    // Constructor completo
    public Product(String id, String name, double price, String drawableResId, String description, String category, int availableUnits) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.drawableResId = drawableResId;
        this.description = description;
        this.category = category;
        this.availableUnits = availableUnits;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public double getPrice() { return price; }
    public String getDrawableResId() { return drawableResId; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public int getAvailableUnits() { 
        // Retornar el stock disponible real (puede ser 0)
        return Math.max(0, availableUnits);
    }
    
    public void setAvailableUnits(int units) {
        this.availableUnits = Math.max(0, units);
    }
}

