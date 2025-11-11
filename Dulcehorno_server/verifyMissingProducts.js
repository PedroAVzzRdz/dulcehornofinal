const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const Product = require('./product');

const url = process.env.MONGODB_URI;

// Productos que el usuario menciona que no se ven
const missingProducts = [
    { name: "Dona Rellena", drawable: "donarellena" },
    { name: "Volcán", drawable: "volcan" },
    { name: "Pastel de Chocolate", drawable: "pastelchoco" },
    { name: "Oreja", drawable: "oreja" },
    { name: "Matcha", drawable: "matcha" }
];

async function verifyProducts() {
    try {
        await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("✅ Conectado a MongoDB Atlas\n");

        console.log("🔍 Verificando productos que no se ven...\n");
        
        for (const prod of missingProducts) {
            // Buscar por nombre
            let product = await Product.findOne({ name: prod.name });
            
            // Si no se encuentra por nombre, buscar por drawable
            if (!product) {
                product = await Product.findOne({ drawableResId: prod.drawable });
            }
            
            if (product) {
                console.log(`✅ ${prod.name}:`);
                console.log(`   - Drawable: ${product.drawableResId}`);
                console.log(`   - Categoría: ${product.category}`);
                console.log(`   - Precio: $${product.price}`);
                console.log(`   - Disponibles: ${product.availableUnits}`);
            } else {
                console.log(`❌ ${prod.name}: NO ENCONTRADO`);
                console.log(`   Drawable esperado: ${prod.drawable}`);
            }
            console.log("");
        }

        // Listar todos los productos
        console.log("📊 Todos los productos en la base de datos:\n");
        const allProducts = await Product.find().sort({ category: 1, name: 1 });
        
        const categories = {};
        allProducts.forEach(p => {
            if (!categories[p.category]) {
                categories[p.category] = [];
            }
            categories[p.category].push(p);
        });

        Object.keys(categories).sort().forEach(cat => {
            console.log(`📦 ${cat}:`);
            categories[cat].forEach(p => {
                console.log(`  - ${p.name} (${p.drawableResId})`);
            });
            console.log("");
        });

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

verifyProducts();

