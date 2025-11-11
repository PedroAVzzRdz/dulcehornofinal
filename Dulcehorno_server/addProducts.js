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

// Productos a agregar
const newProducts = [
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
        name: "Cuernito",
        price: 22.00,
        drawableResId: "cuernito",
        description: "Cuernito dorado y crujiente con un interior suave. Ideal para el desayuno o merienda.",
        category: "Pan Dulce",
        availableUnits: 50
    },
    {
        name: "Pan de Chocolate",
        price: 28.00,
        drawableResId: "chcolate",
        description: "Pan dulce con chips de chocolate derretido. Un deleite para los amantes del chocolate.",
        category: "Pan Dulce",
        availableUnits: 50
    },
    {
        name: "Pastel de Fresa",
        price: 180.00,
        drawableResId: "pastelfresa",
        description: "Pastel suave y esponjoso cubierto con fresas frescas y crema batida. Perfecto para ocasiones especiales.",
        category: "Pasteles",
        availableUnits: 20
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
        name: "Tarta",
        price: 220.00,
        drawableResId: "tarta",
        description: "Tarta elegante con base crujiente y relleno cremoso. Disponible en varios sabores.",
        category: "Pasteles",
        availableUnits: 15
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

async function addProducts() {
    try {
        console.log("🔄 Iniciando agregado de productos...\n");

        for (const productData of newProducts) {
            // Verificar si el producto ya existe
            const existing = await Product.findOne({ 
                name: productData.name, 
                category: productData.category 
            });

            if (existing) {
                console.log(`⚠️  Producto "${productData.name}" ya existe en la categoría "${productData.category}". Omitiendo...`);
                continue;
            }

            // Crear y guardar el producto
            const product = new Product(productData);
            await product.save();
            console.log(`✅ Producto agregado: ${productData.name} - $${productData.price} (${productData.category})`);
        }

        console.log("\n✨ Proceso completado!");
        console.log(`📊 Total de productos en la base de datos: ${await Product.countDocuments()}`);

    } catch (error) {
        console.error("❌ Error agregando productos:", error);
    } finally {
        mongoose.connection.close();
        console.log("\n🔌 Conexión cerrada.");
    }
}

// Ejecutar el script
addProducts();

