const https = require('https');

// Productos faltantes a agregar
const remainingProducts = [
    {
        name: "Capuccino",
        price: 45.00,
        drawableResId: "capuccino",
        description: "Delicioso capuccino con espuma cremosa y un toque de canela. Perfecto para acompanar tu pan dulce favorito.",
        category: "Bebidas"
    },
    {
        name: "Dona Rellena",
        price: 25.00,
        drawableResId: "donarellena",
        description: "Dona suave y esponjosa rellena de mermelada de fresa. Endulza tu dia con este clasico favorito.",
        category: "Pan Dulce"
    },
    {
        name: "Pastel de Chocolate",
        price: 200.00,
        drawableResId: "pastelchoco",
        description: "Pastel de chocolate rico y cremoso con cobertura de ganache. Un clasico irresistible.",
        category: "Pasteles"
    },
    {
        name: "Matcha",
        price: 35.00,
        drawableResId: "matcha",
        description: "Pan dulce con sabor a matcha, suave y delicado. Una experiencia unica de sabor.",
        category: "Pan Dulce"
    },
    {
        name: "Oreja",
        price: 20.00,
        drawableResId: "oreja",
        description: "Oreja crujiente y hojaldrada, dulce y deliciosa. Un clasico de la panaderia mexicana.",
        category: "Pan Dulce"
    },
    {
        name: "Volcan",
        price: 30.00,
        drawableResId: "volcan",
        description: "Pan dulce en forma de volcan con relleno sorpresa. Descubre el sabor que esconde dentro.",
        category: "Pan Dulce"
    }
];

function addProduct(productData) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(productData);
        
        const options = {
            hostname: 'dulcehorno.onrender.com',
            path: '/api/products',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            },
            timeout: 30000
        };

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 201) {
                    console.log(`✅ Producto agregado: ${productData.name}`);
                    resolve(responseData);
                } else if (res.statusCode === 409) {
                    console.log(`⚠️  Producto "${productData.name}" ya existe.`);
                    resolve(null);
                } else {
                    console.error(`❌ Error ${productData.name}: ${res.statusCode}`);
                    console.error(`   Respuesta: ${responseData.substring(0, 200)}`);
                    reject(new Error(`Status ${res.statusCode}`));
                }
            });
        });

        req.on('error', (error) => {
            console.error(`❌ Error de conexión para ${productData.name}:`, error.message);
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Timeout'));
        });

        req.write(data);
        req.end();
    });
}

async function addAll() {
    console.log('🔄 Agregando productos faltantes...\n');
    
    for (const product of remainingProducts) {
        try {
            await addProduct(product);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa de 1 segundo
        } catch (error) {
            console.error(`   Error: ${error.message}`);
        }
    }
    
    console.log('\n✨ Verificando productos en producción...\n');
    
    // Verificar productos
    https.get('https://dulcehorno.onrender.com/api/products', (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            try {
                const products = JSON.parse(data);
                console.log(`📊 Total de productos: ${products.length}\n`);
                products.forEach(p => {
                    console.log(`  - ${p.name} (${p.category}): $${p.price}`);
                });
            } catch (e) {
                console.error('Error parseando:', e.message);
            }
        });
    });
}

addAll();

