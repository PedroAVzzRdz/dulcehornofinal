const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const Product = require('./product');

const url = process.env.MONGODB_URI;

async function fixMatchaDescription() {
    try {
        await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("✅ Conectado a MongoDB Atlas\n");

        // Actualizar descripción de Matcha
        const matcha = await Product.findOne({ name: "Matcha" });
        if (matcha) {
            matcha.description = "Bebida de matcha suave y delicada, rica en antioxidantes. Una experiencia única de sabor.";
            await matcha.save();
            console.log("✅ Descripción de Matcha actualizada");
        } else {
            console.log("⚠️  Matcha no encontrado");
        }

        // Actualizar descripción de Pan de Chocolate (ahora es bebida)
        const panChocolate = await Product.findOne({ name: "Pan de Chocolate" });
        if (panChocolate) {
            panChocolate.description = "Bebida caliente de chocolate rico y cremoso. Perfecta para acompañar tu pan dulce favorito.";
            await panChocolate.save();
            console.log("✅ Descripción de Pan de Chocolate actualizada");
        } else {
            console.log("⚠️  Pan de Chocolate no encontrado");
        }

        // Verificar todos los productos
        console.log("\n📊 Verificación final de productos:\n");
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
                console.log(`  ✅ ${p.name}`);
                console.log(`     Drawable: ${p.drawableResId}`);
                console.log(`     Precio: $${p.price}`);
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

fixMatchaDescription();

