const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const Product = require('./product');
const https = require('https');

const url = process.env.MONGODB_URI;

// Conectar a la base de datos local
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log("✅ Conectado a MongoDB Atlas\n");
        
        // Obtener todos los productos de la base de datos local
        const localProducts = await Product.find();
        console.log(`📦 Productos en BD local: ${localProducts.length}\n`);
        
        // Obtener productos del servidor de Render
        console.log('🔍 Obteniendo productos del servidor de Render...\n');
        const renderProducts = await getRenderProducts();
        
        console.log(`📦 Productos en Render: ${renderProducts.length}\n`);
        
        // Identificar productos faltantes
        const renderDrawables = renderProducts.map(p => p.drawableResId);
        const missingProducts = localProducts.filter(p => !renderDrawables.includes(p.drawableResId));
        
        console.log(`📊 Productos faltantes en Render: ${missingProducts.length}\n`);
        
        if (missingProducts.length > 0) {
            console.log('🔄 Productos que faltan:');
            missingProducts.forEach(p => {
                console.log(`  - ${p.name} (${p.drawableResId}) - ${p.category}`);
            });
            
            console.log('\n💡 SOLUCIÓN:');
            console.log('1. El servidor en Render necesita ser actualizado con el código más reciente');
            console.log('2. O el servidor en Render necesita ser reiniciado');
            console.log('3. O el servidor en Render está usando una base de datos diferente');
            console.log('\n📝 Los productos están en la base de datos, pero Render no los está devolviendo.');
            console.log('   Esto sugiere que Render necesita ser actualizado o reiniciado.');
        } else {
            console.log('✅ Todos los productos están en Render');
        }
        
        mongoose.connection.close();
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });

function getRenderProducts() {
    return new Promise((resolve, reject) => {
        https.get('https://dulcehorno.onrender.com/api/products', (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const products = JSON.parse(data);
                    resolve(products);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

