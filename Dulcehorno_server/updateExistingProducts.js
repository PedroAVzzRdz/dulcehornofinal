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
    .then(() => console.log("✅ Conectado a MongoDB Atlas"))
    .catch(err => {
        console.error("❌ Error conectando a MongoDB:", err.message);
        process.exit(1);
    });

async function updateExistingProducts() {
    try {
        console.log("🔄 Actualizando productos existentes...\n");

        // Actualizar todos los productos que no tengan availableUnits
        const result = await Product.updateMany(
            { availableUnits: { $exists: false } },
            { $set: { availableUnits: 50 } }
        );

        console.log(`✅ ${result.modifiedCount} productos actualizados con availableUnits = 50`);
        console.log(`📊 Total de productos en la base de datos: ${await Product.countDocuments()}`);

        // Mostrar todos los productos
        const products = await Product.find();
        console.log("\n📦 Lista de productos:");
        products.forEach(p => {
            console.log(`  - ${p.name} (${p.category}): $${p.price} - Disponibles: ${p.availableUnits || 'N/A'}`);
        });

    } catch (error) {
        console.error("❌ Error actualizando productos:", error);
    } finally {
        mongoose.connection.close();
        console.log("\n🔌 Conexión cerrada.");
    }
}

// Ejecutar el script
updateExistingProducts();

