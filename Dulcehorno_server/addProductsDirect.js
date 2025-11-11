const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const Product = require('./product');

// Conexión a MongoDB (la misma que usa Render)
const url = process.env.MONGODB_URI;
if (!url) {
    console.error("❌ Error: MONGODB_URI no está definida en .env");
    process.exit(1);
}

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Conectado a MongoDB Atlas (misma BD que Render)\n"))
    .catch(err => {
        console.error("❌ Error conectando a MongoDB:", err.message);
        process.exit(1);
    });

// Productos faltantes
const missingProducts = [
    {
        name: "Capuccino",
        price: 45.00,
        drawableResId: "capuccino",
        description: "Delicioso capuccino con espuma cremosa y un toque de canela. Perfecto para acompañar tu pan dulce favorito.",
        category: "Bebidas",
        availableUnits: 50
    },
    {
        name: "Dona Rellena",
        price: 25.00,
        drawableResId: "donarellena",
        description: "Dona suave y esponjosa rellena de mermelada de fresa. Endulza tu día con este clásico favorito.",
        category: "Pan Dulce",
        availableUnits: 50
    },
    {
        name: "Pastel de Chocolate",
        price: 200.00,
        drawableResId: "pastelchoco",
        description: "Pastel de chocolate rico y cremoso con cobertura de ganache. Un clásico irresistible.",
        category: "Pasteles",
        availableUnits: 20
    },
    {
        name: "Matcha",
        price: 35.00,
        drawableResId: "matcha",
        description: "Pan dulce con sabor a matcha, suave y delicado. Una experiencia única de sabor.",
        category: "Pan Dulce",
        availableUnits: 50
    },
    {
        name: "Oreja",
        price: 20.00,
        drawableResId: "oreja",
        description: "Oreja crujiente y hojaldrada, dulce y deliciosa. Un clásico de la panadería mexicana.",
        category: "Pan Dulce",
        availableUnits: 50
    },
    {
        name: "Volcán",
        price: 30.00,
        drawableResId: "volcan",
        description: "Pan dulce en forma de volcán con relleno sorpresa. Descubre el sabor que esconde dentro.",
        category: "Pan Dulce",
        availableUnits: 50
    }
];

async function addMissingProducts() {
    try {
        console.log("🔄 Agregando productos faltantes directamente a la base de datos...\n");

        for (const productData of missingProducts) {
            // Verificar si ya existe por nombre y categoría
            const existing = await Product.findOne({ 
                name: productData.name, 
                category: productData.category 
            });

            if (existing) {
                console.log(`⚠️  "${productData.name}" ya existe. Omitiendo...`);
                continue;
            }

            // Verificar si existe por drawableResId (por si tiene nombre diferente)
            const existingByDrawable = await Product.findOne({ 
                drawableResId: productData.drawableResId 
            });

            if (existingByDrawable) {
                console.log(`⚠️  Producto con drawable "${productData.drawableResId}" ya existe como "${existingByDrawable.name}". Omitiendo...`);
                continue;
            }

            // Crear y guardar el producto
            const product = new Product(productData);
            await product.save();
            console.log(`✅ Agregado: ${productData.name} - $${productData.price} (${productData.category})`);
        }

        console.log("\n✨ Proceso completado!");
        
        // Listar todos los productos
        const allProducts = await Product.find().sort({ category: 1, name: 1 });
        console.log(`\n📊 Total de productos en la BD: ${allProducts.length}\n`);
        
        const categories = {};
        allProducts.forEach(p => {
            if (!categories[p.category]) categories[p.category] = [];
            categories[p.category].push(p);
        });
        
        Object.keys(categories).sort().forEach(cat => {
            console.log(`📦 ${cat}:`);
            categories[cat].forEach(p => {
                console.log(`  - ${p.name} (${p.drawableResId}): $${p.price}`);
            });
        });

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        mongoose.connection.close();
        console.log("\n🔌 Conexión cerrada.");
    }
}

addMissingProducts();

