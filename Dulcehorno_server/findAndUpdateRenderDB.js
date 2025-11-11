const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');

const url = process.env.MONGODB_URI;

// Productos que Render está devolviendo actualmente
const renderProducts = [
    { name: "Café Latte", drawableResId: "cafe" },
    { name: "Cuernito", drawableResId: "cuernito" },
    { name: "Dona de chocolate", drawableResId: "dona" },
    { name: "Galleta de Avena", drawableResId: "galleta" },
    { name: "Galleta de chispas", drawableResId: "croissant" },
    { name: "Muffin", drawableResId: "muffin" },
    { name: "Pan de Chocolate", drawableResId: "chcolate" },
    { name: "Pan de chocolate rico", drawableResId: "pan_chocolate" },
    { name: "Pastel de Fresa", drawableResId: "pastelfresa" },
    { name: "Tarta", drawableResId: "tarta" }
];

// Productos nuevos a agregar
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
    },
    {
        name: "Pastel de Chocolate",
        price: 200.00,
        drawableResId: "pastelchoco",
        description: "Pastel de chocolate rico y cremoso con cobertura de ganache. Un clásico irresistible.",
        category: "Pasteles",
        availableUnits: 20
    }
];

async function findRenderDatabase() {
    try {
        // Conectar y buscar en todas las bases de datos posibles
        const databases = ['dulcehorno', 'DulceHornoDB', 'dulce_horno'];
        
        for (const dbName of databases) {
            const dbUrl = url.replace(/\/[^\/]+$/, `/${dbName}`);
            const conn = await mongoose.createConnection(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });
            
            const productSchema = new mongoose.Schema({
                name: String,
                price: Number,
                drawableResId: String,
                description: String,
                category: String,
                availableUnits: Number
            }, { timestamps: true, strict: false });
            
            const Product = conn.model('Product', productSchema, 'products');
            
            // Verificar si tiene los productos que Render está devolviendo
            const foundProducts = await Product.find({ 
                drawableResId: { $in: renderProducts.map(p => p.drawableResId) } 
            });
            
            if (foundProducts.length >= renderProducts.length * 0.8) {
                console.log(`\n✅ Base de datos encontrada: ${dbName}`);
                console.log(`   Productos encontrados: ${foundProducts.length}/${renderProducts.length}`);
                
                // Agregar productos nuevos
                console.log(`\n🔄 Agregando productos nuevos...`);
                let added = 0;
                for (const newProd of newProducts) {
                    const existing = await Product.findOne({ 
                        drawableResId: newProd.drawableResId 
                    });
                    
                    if (!existing) {
                        const product = new Product(newProd);
                        await product.save();
                        console.log(`   ✅ Agregado: ${newProd.name}`);
                        added++;
                    } else {
                        console.log(`   ⚠️  Ya existe: ${newProd.name}`);
                    }
                }
                
                console.log(`\n✨ Proceso completado en ${dbName}`);
                console.log(`   Productos agregados: ${added}`);
                
                // Listar todos los productos
                const allProducts = await Product.find();
                console.log(`\n📊 Total de productos: ${allProducts.length}`);
                allProducts.forEach(p => {
                    console.log(`   - ${p.name} (${p.drawableResId}) - ${p.category}`);
                });
                
                await conn.close();
                return dbName;
            }
            
            await conn.close();
        }
        
        console.log('❌ No se encontró la base de datos que Render está usando');
        return null;
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('🔍 Buscando base de datos que Render está usando...\n');
        await findRenderDatabase();
        mongoose.connection.close();
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error de conexión:', err.message);
        process.exit(1);
    });

