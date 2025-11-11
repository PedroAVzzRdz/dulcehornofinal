const https = require('https');

// Productos a agregar a producción
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

function addProductToProduction(productData) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(productData);
        
        const options = {
            hostname: 'dulcehorno.onrender.com',
            path: '/api/products',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
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
                    console.log(`⚠️  Producto "${productData.name}" ya existe. Omitiendo...`);
                    resolve(null);
                } else {
                    console.error(`❌ Error agregando ${productData.name}: ${res.statusCode} - ${responseData}`);
                    reject(new Error(`Status ${res.statusCode}: ${responseData}`));
                }
            });
        });

        req.on('error', (error) => {
            console.error(`❌ Error de conexión para ${productData.name}:`, error.message);
            reject(error);
        });

        req.write(data);
        req.end();
    });
}

async function addAllProducts() {
    console.log('🔄 Agregando productos al servidor de producción...\n');
    
    for (const product of newProducts) {
        try {
            await addProductToProduction(product);
            // Pequeña pausa para no sobrecargar el servidor
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error(`Error con ${product.name}:`, error.message);
        }
    }
    
    console.log('\n✨ Proceso completado!');
    console.log('📱 Reinicia la aplicación Android para ver los nuevos productos.');
}

// Ejecutar
addAllProducts();

