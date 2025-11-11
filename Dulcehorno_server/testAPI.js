const https = require('https');

// Test de la API de producción
const url = 'https://dulcehorno.onrender.com/api/products';

console.log('🔍 Probando API de producción...\n');
console.log('URL:', url);

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const products = JSON.parse(data);
            console.log(`✅ Respuesta recibida: ${products.length} productos\n`);
            
            if (products.length === 0) {
                console.log('❌ No hay productos en el servidor de producción');
                console.log('💡 Necesitas agregar los productos al servidor de producción');
            } else {
                console.log('📦 Productos en producción:');
                products.forEach(p => {
                    console.log(`  - ${p.name} (${p.category}): $${p.price}`);
                });
            }
        } catch (error) {
            console.error('❌ Error parseando respuesta:', error.message);
            console.log('Respuesta recibida:', data.substring(0, 500));
        }
    });
}).on('error', (error) => {
    console.error('❌ Error de conexión:', error.message);
    console.log('\n💡 El servidor puede estar apagado o la URL es incorrecta');
});

