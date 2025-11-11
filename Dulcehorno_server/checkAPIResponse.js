const https = require('https');

https.get('https://dulcehorno.onrender.com/api/products', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const products = JSON.parse(data);
            console.log(`📊 Total: ${products.length} productos\n`);
            
            // Verificar si tienen availableUnits
            products.forEach(p => {
                console.log(`${p.name}:`);
                console.log(`  - Category: ${p.category}`);
                console.log(`  - Drawable: ${p.drawableResId}`);
                console.log(`  - AvailableUnits: ${p.availableUnits !== undefined ? p.availableUnits : 'NO DEFINIDO'}`);
                console.log(`  - Tiene todos los campos: ${p.id && p.name && p.price && p.drawableResId && p.category}`);
                console.log('');
            });
            
            // Buscar productos nuevos
            console.log('\n🔍 Buscando productos nuevos:');
            const nuevosDrawables = ['capuccino', 'donarellena', 'matcha', 'oreja', 'volcan', 'pastelchoco'];
            nuevosDrawables.forEach(drawable => {
                const found = products.find(p => p.drawableResId === drawable);
                console.log(`  ${found ? '✅' : '❌'} ${drawable}: ${found ? found.name : 'NO ENCONTRADO'}`);
            });
            
        } catch (e) {
            console.error('Error:', e.message);
            console.log('Respuesta:', data.substring(0, 1000));
        }
    });
});

