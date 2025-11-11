const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const Product = require('./product');

const url = process.env.MONGODB_URI;

// Productos esperados según las instrucciones del usuario
const productosEsperados = {
    "Bebidas": [
        { name: "Capuccino", drawable: "capuccino" },
        { name: "Matcha", drawable: "matcha" },
        { name: "Pan de Chocolate", drawable: "chcolate" }
    ],
    "Pan Dulce": [
        { name: "Cuernito", drawable: "cuernito" },
        { name: "Dona Rellena", drawable: "donarellena" },
        { name: "Galleta de chispas", drawable: "croissant" },
        { name: "Muffin", drawable: "muffin" },
        { name: "Oreja", drawable: "oreja" },
        { name: "Volcán", drawable: "volcan" }
    ],
    "Repostería": [
        { name: "Pastel de Chocolate", drawable: "pastelchoco" },
        { name: "Pastel de Fresa", drawable: "pastelfresa" },
        { name: "Tarta", drawable: "tarta" }
    ]
};

async function verificarTodo() {
    try {
        await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("✅ Conectado a MongoDB Atlas\n");
        console.log("🔍 Verificando que todos los productos estén correctamente organizados...\n");

        let todoCorrecto = true;

        // Verificar cada categoría
        for (const [categoria, productos] of Object.entries(productosEsperados)) {
            console.log(`📦 ${categoria}:`);
            
            for (const productoEsperado of productos) {
                const producto = await Product.findOne({ 
                    $or: [
                        { name: productoEsperado.name },
                        { drawableResId: productoEsperado.drawable }
                    ]
                });

                if (producto) {
                    // Verificar categoría
                    if (producto.category === categoria) {
                        console.log(`  ✅ ${producto.name} - Categoría correcta: ${producto.category}`);
                    } else {
                        console.log(`  ❌ ${producto.name} - Categoría incorrecta: ${producto.category} (debería ser: ${categoria})`);
                        todoCorrecto = false;
                    }

                    // Verificar drawable
                    if (producto.drawableResId === productoEsperado.drawable) {
                        console.log(`     Drawable correcto: ${producto.drawableResId}`);
                    } else {
                        console.log(`     ⚠️  Drawable: ${producto.drawableResId} (esperado: ${productoEsperado.drawable})`);
                    }
                } else {
                    console.log(`  ❌ ${productoEsperado.name} - NO ENCONTRADO`);
                    todoCorrecto = false;
                }
            }
            console.log("");
        }

        // Resumen
        console.log("📊 Resumen:");
        const allProducts = await Product.find().sort({ category: 1, name: 1 });
        console.log(`Total de productos en la BD: ${allProducts.length}\n`);

        const categorias = {};
        allProducts.forEach(p => {
            if (!categorias[p.category]) {
                categorias[p.category] = [];
            }
            categorias[p.category].push(p.name);
        });

        Object.keys(categorias).sort().forEach(cat => {
            console.log(`📦 ${cat}: ${categorias[cat].length} productos`);
            categorias[cat].forEach(nombre => {
                console.log(`  - ${nombre}`);
            });
            console.log("");
        });

        if (todoCorrecto) {
            console.log("✅ ¡Todo está correcto! Los productos están organizados correctamente.");
            console.log("📱 Reinicia la aplicación Android para ver los cambios.");
        } else {
            console.log("⚠️  Hay algunos problemas. Revisa los mensajes anteriores.");
        }

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

verificarTodo();

