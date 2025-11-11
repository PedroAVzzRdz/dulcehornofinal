const express = require("express");
const jwt = require("jsonwebtoken");
const User = require('./user');
const Product = require('./product');
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || "mi_secreto_super_seguro";

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Conexión a MongoDB Atlas
const url = process.env.MONGODB_URI;
if (!url) {
    console.error("❌ Error: MONGODB_URI no está definida en .env");
    process.exit(1);
}

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Conectado a MongoDB Atlas"))
    .catch(err => console.error("❌ Error conectando a MongoDB:", err.message));

// ---------------------------------------------
// Endpoints de usuarios
// ---------------------------------------------

// Signup
app.post("/api/signup", async (req, res) => {
    const { email, username, password } = req.body;
    if (!email || !username || !password) return res.status(400).json({ message: 'Datos faltantes' });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(409).json({ message: "Correo ya registrado" });

    const user = new User({ email, username, password });
    await user.save();
    res.status(201).json({ message: "Usuario creado exitosamente" });
});

// Login
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Usuario no registrado" });
    if (user.password !== password) return res.status(401).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "15m" });
    res.json({ token });
});

// ---------------------------------------------
// Endpoints de productos
// ---------------------------------------------

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ category: 1, name: 1 });
        // Asegurar que todos los productos tengan availableUnits
        const productsWithDefaults = products.map(p => ({
            ...p.toObject(),
            availableUnits: p.availableUnits || 50
        }));
        res.status(200).json(productsWithDefaults);
    } catch (error) {
        console.error('Error obteniendo productos:', error);
        res.status(500).json({ message: 'Error al obtener productos' });
    }
});

app.post('/api/products', async (req, res) => {
    const { name, price, drawableResId, description, category, availableUnits } = req.body;
    if (!name || price == null || !drawableResId || !category) return res.status(400).json({ message: 'Faltan campos obligatorios' });

    const existing = await Product.findOne({ name, category });
    if (existing) return res.status(409).json({ message: 'Producto ya existe en esa categoría' });

    const newProduct = new Product({ 
        name, 
        price, 
        drawableResId, 
        description, 
        category, 
        availableUnits: availableUnits || 50 
    });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
});

// ---------------------------------------------
// Middleware de autenticación
// ---------------------------------------------

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token requerido" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Token inválido" });
        req.user = user;
        next();
    });
}

// ---------------------------------------------
// Endpoints protegidos
// ---------------------------------------------

// Obtener historial de compras
app.get('/api/receipts', authenticateToken, async (req, res) => {
    const user = await User.findById(req.user.id).populate('receipts.items.product').select('receipts -_id');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.status(200).json(user.receipts || []);
});

// Obtener perfil
app.get("/api/profile", authenticateToken, async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ id: user.id, username: user.username, email: user.email });
});

// Contar compras
app.get('/api/receipts/count', authenticateToken, async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.status(200).json({ count: user.receipts.length });
});

// Procesar compra
app.post('/api/receipts', authenticateToken, async (req, res) => {
    const { id, requestDate, estimatedArrivalDate, deliveryLocation, items, total } = req.body;
    if (!id || !requestDate || !estimatedArrivalDate || !deliveryLocation || !items || total == null) {
        return res.status(400).json({ message: 'Faltan campos obligatorios en el recibo' });
    }

    const processedItems = [];
    
    // Validar stock y procesar items
    for (const item of items) {
        const productId = item.product?._id || item.product?.id || item.product;
        if (!productId) return res.status(400).json({ message: 'Cada item debe tener un product válido' });
        
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: `Producto con id ${productId} no encontrado` });
        
        // Validar stock disponible
        const requestedQuantity = item.quantity || 0;
        const availableStock = product.availableUnits || 0;
        
        if (requestedQuantity <= 0) {
            return res.status(400).json({ message: `La cantidad para ${product.name} debe ser mayor a 0` });
        }
        
        if (requestedQuantity > availableStock) {
            return res.status(400).json({ 
                message: `No hay suficiente stock para ${product.name}. Disponible: ${availableStock}, Solicitado: ${requestedQuantity}` 
            });
        }
        
        processedItems.push({ product: productId, quantity: requestedQuantity });
    }

    // Actualizar stock de productos
    for (const item of processedItems) {
        const product = await Product.findById(item.product);
        if (product) {
            product.availableUnits = Math.max(0, (product.availableUnits || 0) - item.quantity);
            await product.save();
        }
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    user.receipts.push({ id, requestDate, estimatedArrivalDate, deliveryLocation, items: processedItems, total });
    const savedUser = await user.save();
    res.status(201).json(savedUser);
});

// ---------------------------------------------
// Iniciar servidor
// ---------------------------------------------
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
