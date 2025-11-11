const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const Product = require('./product');

// Conexión a MongoDB
const url = process.env.MONGODB_URI;
if (!url) {
    console.error("❌ Error: MONGODB_URI no está definida en .env");
    process.exit(1);
}

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Conectado a MongoDB Atlas\n"))
    .catch(err => {
        console.error("❌ Error conectando a MongoDB:", err.message);
        process.exit(1);
    });

async function listProducts() {
    try {
        const products = await Product.find().sort({ category: 1, name: 1 });
        
        console.log(`📊 Total de productos: ${products.length}\n`);
        
        // Agrupar por categoría
        const categories = {};
        products.forEach(p => {
            if (!categories[p.category]) {
                categories[p.category] = [];
            }
            categories[p.category].push(p);
        });
        
        // Mostrar por categoría
        Object.keys(categories).sort().forEach(category => {
            console.log(`\n📦 ${category}:`);
            categories[category].forEach(p => {
                console.log(`  ✅ ${p.name}`);
                console.log(`     Precio: $${p.price}`);
                console.log(`     Drawable: ${p.drawableResId}`);
                console.log(`     Disponibles: ${p.availableUnits || 50}`);
                console.log(`     Descripción: ${p.description || 'Sin descripción'}`);
                console.log('');
            });
        });
        
    } catch (error) {
        console.error("❌ Error listando productos:", error);
    } finally {
        mongoose.connection.close();
        console.log("🔌 Conexión cerrada.");
    }
}

// Ejecutar el script
listProducts();

