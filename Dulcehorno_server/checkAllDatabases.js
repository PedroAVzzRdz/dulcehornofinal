const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');

const url = process.env.MONGODB_URI;
if (!url) {
    console.error("❌ Error: MONGODB_URI no está definida en .env");
    process.exit(1);
}

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log("✅ Conectado a MongoDB Atlas\n");
        
        // Obtener todas las bases de datos
        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        
        console.log("📊 Bases de datos disponibles:");
        dbs.databases.forEach(db => {
            console.log(`  - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
        });
        
        // Obtener el nombre de la base de datos actual
        const dbName = mongoose.connection.db.databaseName;
        console.log(`\n🗄️  Base de datos actual: ${dbName}`);
        
        // Listar todas las colecciones
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`\n📦 Colecciones en ${dbName}:`);
        collections.forEach(col => {
            console.log(`  - ${col.name}`);
        });
        
        // Verificar productos en la colección actual
        const Product = require('./product');
        const products = await Product.find();
        console.log(`\n✅ Productos en colección 'products': ${products.length}`);
        
        products.forEach(p => {
            console.log(`  - ${p.name} (${p.drawableResId})`);
        });
        
        mongoose.connection.close();
    })
    .catch(err => {
        console.error("❌ Error:", err.message);
        process.exit(1);
    });

