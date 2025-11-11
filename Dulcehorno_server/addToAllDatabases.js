const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');

const url = process.env.MONGODB_URI;
if (!url) {
    console.error("❌ Error: MONGODB_URI no está definida en .env");
    process.exit(1);
}

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

async function addToDatabase(dbName) {
    try {
        // Conectar a la base de datos específica
        const dbUrl = url.replace(/\/[^\/]+$/, `/${dbName}`);
        const conn = await mongoose.createConnection(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
        
        // Definir el schema y modelo para esta conexión
        const productSchema = new mongoose.Schema({
            name: { type: String, required: true },
            price: { type: Number, required: true },
            drawableResId: { type: String, required: true },
            description: { type: String },
            category: { type: String, required: true },
            availableUnits: { type: Number, default: 50 }
        }, { timestamps: true });
        
        const Product = conn.model('Product', productSchema);
        
        console.log(`\n📦 Agregando productos a "${dbName}"...`);
        let added = 0;
        let skipped = 0;
        
        for (const productData of newProducts) {
            const existing = await Product.findOne({ 
                name: productData.name, 
                category: productData.category 
            });
            
            if (existing) {
                skipped++;
                continue;
            }
            
            const product = new Product(productData);
            await product.save();
            added++;
        }
        
        const total = await Product.countDocuments();
        console.log(`  ✅ Agregados: ${added}, Omitidos: ${skipped}, Total: ${total}`);
        
        await conn.close();
        return { added, total };
        
    } catch (error) {
        console.error(`  ❌ Error en ${dbName}:`, error.message);
        return { added: 0, total: 0 };
    }
}

async function main() {
    const databases = ['dulcehorno', 'DulceHornoDB', 'dulce_horno'];
    
    console.log('🔄 Agregando productos a todas las bases de datos...\n');
    
    for (const dbName of databases) {
        await addToDatabase(dbName);
    }
    
    console.log('\n✨ Proceso completado!');
    console.log('📱 Verifica el servidor en Render - puede necesitar reiniciarse.');
    
    process.exit(0);
}

main();

