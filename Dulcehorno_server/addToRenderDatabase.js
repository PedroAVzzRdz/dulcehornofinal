const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');

const url = process.env.MONGODB_URI;

// Productos que sabemos que Render tiene
const renderExistingProducts = [
    "Café Latte",
    "Cuernito", 
    "Dona de chocolate",
    "Galleta de Avena",
    "Galleta de chispas",
    "Muffin",
    "Pan de Chocolate",
    "Pan de chocolate rico",
    "Pastel de Fresa",
    "Tarta"
];

// Productos nuevos a agregar (los que faltan)
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

async function findAndUpdateDatabase() {
    const databases = ['dulcehorno', 'DulceHornoDB', 'dulce_horno'];
    
    for (const dbName of databases) {
        try {
            const dbUrl = url.replace(/\/[^\/]+$/, `/${dbName}`);
            const conn = await mongoose.createConnection(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
            
            const productSchema = new mongoose.Schema({
                name: { type: String, required: true },
                price: { type: Number, required: true },
                drawableResId: { type: String, required: true },
                description: { type: String },
                category: { type: String, required: true },
                availableUnits: { type: Number, default: 50 }
            }, { timestamps: true, strict: false });
            
            const Product = conn.model('Product', productSchema, 'products');
            
            // Verificar si tiene los productos que Render está devolviendo
            const existingProducts = await Product.find({ name: { $in: renderExistingProducts } });
            
            if (existingProducts.length >= 8) {
                console.log(`\n✅ Base de datos encontrada: ${dbName}`);
                console.log(`   Tiene ${existingProducts.length} de los productos que Render devuelve\n`);
                
                // Agregar productos nuevos
                console.log('🔄 Agregando productos nuevos...\n');
                for (const newProd of newProducts) {
                    const existing = await Product.findOne({ 
                        $or: [
                            { name: newProd.name, category: newProd.category },
                            { drawableResId: newProd.drawableResId }
                        ]
                    });
                    
                    if (existing) {
                        console.log(`⚠️  "${newProd.name}" ya existe. Actualizando...`);
                        // Actualizar el producto existente
                        existing.name = newProd.name;
                        existing.price = newProd.price;
                        existing.drawableResId = newProd.drawableResId;
                        existing.description = newProd.description;
                        existing.category = newProd.category;
                        existing.availableUnits = newProd.availableUnits;
                        await existing.save();
                        console.log(`   ✅ Actualizado: ${newProd.name}`);
                    } else {
                        const product = new Product(newProd);
                        await product.save();
                        console.log(`   ✅ Agregado: ${newProd.name}`);
                    }
                }
                
                // Verificar total
                const total = await Product.countDocuments();
                console.log(`\n📊 Total de productos en ${dbName}: ${total}`);
                
                await conn.close();
                return dbName;
            }
            
            await conn.close();
        } catch (error) {
            console.error(`Error en ${dbName}:`, error.message);
        }
    }
    
    return null;
}

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('🔍 Buscando y actualizando base de datos de Render...\n');
        const dbName = await findAndUpdateDatabase();
        if (dbName) {
            console.log(`\n✅ Base de datos ${dbName} actualizada correctamente`);
            console.log('📱 Reinicia la aplicación Android para ver los cambios');
        } else {
            console.log('\n❌ No se pudo encontrar la base de datos de Render');
            console.log('💡 Necesitas actualizar el código del servidor en Render');
        }
        mongoose.connection.close();
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });

