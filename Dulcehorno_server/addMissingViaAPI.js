const https = require('https');
const http = require('http');

// Productos que faltan en Render
const missingProducts = [
    {
        name: "Capuccino",
        price: 45,
        drawableResId: "capuccino",
        description: "Delicioso capuccino con espuma cremosa y un toque de canela.",
        category: "Bebidas"
    },
    {
        name: "Dona Rellena",
        price: 25,
        drawableResId: "donarellena",
        description: "Dona suave y esponjosa rellena de mermelada de fresa.",
        category: "Pan Dulce"
    },
    {
        name: "Pastel de Chocolate",
        price: 200,
        drawableResId: "pastelchoco",
        description: "Pastel de chocolate rico y cremoso con cobertura de ganache.",
        category: "Pasteles"
    },
    {
        name: "Matcha",
        price: 35,
        drawableResId: "matcha",
        description: "Pan dulce con sabor a matcha, suave y delicado.",
        category: "Pan Dulce"
    },
    {
        name: "Oreja",
        price: 20,
        drawableResId: "oreja",
        description: "Oreja crujiente y hojaldrada, dulce y deliciosa.",
        category: "Pan Dulce"
    },
    {
        name: "Volcan",
        price: 30,
        drawableResId: "volcan",
        description: "Pan dulce en forma de volcan con relleno sorpresa.",
        category: "Pan Dulce"
    }
];

function makeRequest(product) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(product);
        
        const options = {
            hostname: 'dulcehorno.onrender.com',
            port: 443,
            path: '/api/products',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 30000
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 201) {
                    resolve({ success: true, product: product.name });
                } else if (res.statusCode === 409) {
                    resolve({ success: false, reason: 'Ya existe', product: product.name });
                } else {
                    resolve({ success: false, reason: `Status ${res.statusCode}`, product: product.name, response: data });
                }
            });
        });

        req.on('error', (error) => {
            reject({ product: product.name, error: error.message });
        });

        req.on('timeout', () => {
            req.destroy();
            reject({ product: product.name, error: 'Timeout' });
        });

        req.write(postData);
        req.end();
    });
}

async function addProducts() {
    console.log('🔄 Intentando agregar productos faltantes a Render...\n');
    
    for (const product of missingProducts) {
        try {
            console.log(`Intentando agregar: ${product.name}...`);
            const result = await makeRequest(product);
            if (result.success) {
                console.log(`✅ ${result.product} agregado`);
            } else {
                console.log(`⚠️  ${result.product}: ${result.reason}`);
                if (result.response) {
                    console.log(`   Respuesta: ${result.response.substring(0, 100)}`);
                }
            }
            await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos
        } catch (error) {
            console.log(`❌ Error con ${product.name}: ${error.error || error.message}`);
        }
    }
    
    console.log('\n✅ Verificando productos en Render...\n');
    https.get('https://dulcehorno.onrender.com/api/products', (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            try {
                const products = JSON.parse(data);
                console.log(`📊 Total: ${products.length} productos\n`);
                products.forEach(p => {
                    console.log(`  - ${p.name} (${p.drawableResId}) - ${p.category}`);
                });
            } catch (e) {
                console.error('Error:', e.message);
            }
        });
    });
}

addProducts();

