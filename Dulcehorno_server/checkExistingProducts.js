const https = require('https');

https.get('https://dulcehorno.onrender.com/api/products', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const products = JSON.parse(data);
            console.log(`📊 Productos en producción: ${products.length}\n`);
            
            const productNames = products.map(p => p.name.toLowerCase());
            const productDrawables = products.map(p => p.drawableResId);
            
            console.log('Productos existentes:');
            products.forEach(p => {
                console.log(`  - ${p.name} (${p.category}) - drawable: ${p.drawableResId}`);
            });
            
            console.log('\n🔍 Verificando productos nuevos:');
            const nuevos = [
                'capuccino', 'donarellena', 'cuernito', 'chcolate', 
                'pastelfresa', 'pastelchoco', 'matcha', 'tarta', 'oreja', 'volcan'
            ];
            
            nuevos.forEach(drawable => {
                const exists = productDrawables.includes(drawable);
                console.log(`  ${exists ? '✅' : '❌'} ${drawable}`);
            });
            
        } catch (e) {
            console.error('Error:', e.message);
        }
    });
});

