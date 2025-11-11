const https = require('https');

// Test con un producto simple
const testProduct = {
    name: "Test Product",
    price: 10.00,
    drawableResId: "cafe",
    description: "Test description",
    category: "Bebidas"
};

const data = JSON.stringify(testProduct);

console.log('Datos enviados:', data);
console.log('Longitud:', data.length);

const options = {
    hostname: 'dulcehorno.onrender.com',
    path: '/api/products',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = https.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => responseData += chunk);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log('Respuesta:', responseData);
    });
});

req.on('error', (error) => {
    console.error('Error:', error.message);
});

req.write(data);
req.end();

