const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const Product = require('./product');

const url = process.env.MONGODB_URI;

// Mapeo de actualizaciones de categorías
const categoryUpdates = [
    // Pan de Chocolate → Bebidas
    { name: "Pan de Chocolate", newCategory: "Bebidas" },
    // Matcha → Bebidas
    { name: "Matcha", newCategory: "Bebidas" },
    // Tarta → Repostería
    { name: "Tarta", newCategory: "Repostería" },
    // Pastel de Fresa → Repostería
    { name: "Pastel de Fresa", newCategory: "Repostería" },
    // Pastel de Chocolate → Repostería
    { name: "Pastel de Chocolate", newCategory: "Repostería" },
];

// Productos que deben estar en Pan Dulce (verificar que existan)
const panDulceProducts = [
    "Volcán",
    "Oreja",
    "Dona Rellena",
    "Cuernito"
];

// Productos que necesitamos agregar si no existen
const productsToAdd = [
    {
        name: "Galleta de chispas",
        price: 12.50,
        drawableResId: "croissant",
        description: "Galleta crujiente con chispas de chocolate. Deliciosa y dulce.",
        category: "Pan Dulce",
        availableUnits: 50
    },
    {
        name: "Muffin",
        price: 18.00,
        drawableResId: "muffin",
        description: "Muffin esponjoso y suave, perfecto para el desayuno.",
        category: "Pan Dulce",
        availableUnits: 50
    }
];

async function updateCategories() {
    try {
        await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("✅ Conectado a MongoDB Atlas\n");

        // Actualizar categorías
        console.log("🔄 Actualizando categorías...\n");
        for (const update of categoryUpdates) {
            const product = await Product.findOne({ name: update.name });
            if (product) {
                const oldCategory = product.category;
                product.category = update.newCategory;
                await product.save();
                console.log(`✅ ${update.name}: ${oldCategory} → ${update.newCategory}`);
            } else {
                console.log(`⚠️  Producto "${update.name}" no encontrado`);
            }
        }

        // Verificar productos en Pan Dulce
        console.log("\n🔍 Verificando productos en Pan Dulce...\n");
        for (const productName of panDulceProducts) {
            const product = await Product.findOne({ name: productName });
            if (product) {
                if (product.category !== "Pan Dulce") {
                    product.category = "Pan Dulce";
                    await product.save();
                    console.log(`✅ ${productName}: categoría actualizada a Pan Dulce`);
                } else {
                    console.log(`✅ ${productName}: ya está en Pan Dulce`);
                }
            } else {
                console.log(`⚠️  Producto "${productName}" no encontrado`);
            }
        }

        // Agregar productos faltantes
        console.log("\n🔄 Verificando productos faltantes...\n");
        for (const productData of productsToAdd) {
            const existing = await Product.findOne({ 
                $or: [
                    { name: productData.name },
                    { drawableResId: productData.drawableResId }
                ]
            });
            
            if (existing) {
                // Actualizar categoría si existe
                if (existing.category !== productData.category) {
                    existing.category = productData.category;
                    await existing.save();
                    console.log(`✅ ${productData.name}: categoría actualizada a ${productData.category}`);
                } else {
                    console.log(`✅ ${productData.name}: ya existe en ${productData.category}`);
                }
            } else {
                // Agregar producto nuevo
                const product = new Product(productData);
                await product.save();
                console.log(`✅ ${productData.name}: agregado a ${productData.category}`);
            }
        }

        // Listar todos los productos organizados por categoría
        console.log("\n📊 Productos organizados por categoría:\n");
        
        const categories = {};
        const allProducts = await Product.find().sort({ category: 1, name: 1 });
        
        allProducts.forEach(p => {
            if (!categories[p.category]) {
                categories[p.category] = [];
            }
            categories[p.category].push(p);
        });

        Object.keys(categories).sort().forEach(cat => {
            console.log(`📦 ${cat}:`);
            categories[cat].forEach(p => {
                console.log(`  ✅ ${p.name} (${p.drawableResId}): $${p.price}`);
            });
            console.log("");
        });

        console.log("✨ Proceso completado!");
        
        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

updateCategories();

