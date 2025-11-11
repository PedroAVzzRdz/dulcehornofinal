# 🚀 Instrucciones para Actualizar Render y Mostrar los Productos

## 📊 Situación Actual

- ✅ Los productos nuevos **YA ESTÁN** en la base de datos MongoDB
- ✅ El código del servidor local está actualizado
- ❌ El servidor en Render no está devolviendo los productos nuevos
- ❌ El servidor en Render rechaza peticiones POST para agregar productos

## 🔍 Problema

El servidor en Render (`https://dulcehorno.onrender.com`) está usando:
- Una versión antigua del código
- O una base de datos diferente
- O tiene configuraciones diferentes

## ✅ Solución: Actualizar el Servidor en Render

### Paso 1: Verificar el Código en Render

1. Ve a tu dashboard de Render: https://dashboard.render.com
2. Selecciona tu servicio de backend
3. Ve a la sección "Settings" → "Build & Deploy"
4. Verifica que el código esté actualizado

### Paso 2: Actualizar los Archivos en Render

Asegúrate de que estos archivos estén actualizados en Render:

#### `Dulcehorno_server/index.js`
- El endpoint `GET /api/products` debe estar actualizado (líneas 65-78)
- Debe incluir manejo de `availableUnits`
- Debe ordenar por categoría y nombre

#### `Dulcehorno_server/product.js`
- Debe incluir el campo `availableUnits` en el schema
- Debe tener un valor por defecto de 50

### Paso 3: Verificar Variables de Entorno

1. En Render, ve a "Environment"
2. Verifica que `MONGODB_URI` apunte a la misma base de datos que usas localmente
3. Verifica que `SECRET_KEY` esté configurada
4. Verifica que `PORT` esté configurado (o usa el puerto por defecto)

### Paso 4: Reiniciar el Servicio

1. En Render, ve a "Manual Deploy"
2. Haz clic en "Clear build cache & deploy"
3. Espera a que el despliegue se complete
4. Verifica que el servicio esté funcionando

### Paso 5: Verificar que los Productos Aparezcan

Ejecuta este comando para verificar:

```bash
curl https://dulcehorno.onrender.com/api/products
```

Deberías ver los 10 productos nuevos:
- Capuccino
- Dona Rellena
- Cuernito
- Pan de Chocolate
- Pastel de Fresa
- Pastel de Chocolate
- Matcha
- Tarta
- Oreja
- Volcán

## 🔧 Alternativa: Usar Servidor Local (Para Desarrollo)

Si no puedes actualizar Render inmediatamente, puedes usar el servidor local:

### 1. Cambiar la URL en la Aplicación

Edita `app/src/main/java/com/example/dulcehorno/MyApp.java`:

```java
// Para desarrollo local, cambia la URL:
private final String BASE_URL = "http://TU_IP_LOCAL:3000/api/";
// O usa el emulador:
private final String BASE_URL = "http://10.0.2.2:3000/api/";
```

### 2. Ejecutar el Servidor Local

```bash
cd Dulcehorno_server
node index.js
```

### 3. Reiniciar la Aplicación Android

Los productos deberían aparecer ahora.

## 📝 Verificación

### Verificar Productos en la Base de Datos

```bash
cd Dulcehorno_server
node listProducts.js
```

### Verificar Productos que Devuelve Render

```bash
cd Dulcehorno_server
node testAPI.js
```

### Comparar Diferencias

```bash
cd Dulcehorno_server
node syncProductsToRender.js
```

## ⚠️ Notas Importantes

1. **Los productos YA ESTÁN en la base de datos** - El problema es que Render no los está devolviendo
2. **Render necesita ser actualizado** - El código del servidor en Render debe estar actualizado
3. **Render necesita ser reiniciado** - Después de actualizar el código, reinicia el servicio
4. **Verifica la base de datos** - Asegúrate de que Render use la misma base de datos MongoDB

## 🎯 Productos que Deben Aparecer

### Bebidas
- ✅ Capuccino ($45)

### Pan Dulce
- ✅ Cuernito ($22)
- ✅ Dona Rellena ($25)
- ✅ Pan de Chocolate ($28)
- ✅ Matcha ($35)
- ✅ Oreja ($20)
- ✅ Volcán ($30)

### Pasteles
- ✅ Pastel de Fresa ($180)
- ✅ Pastel de Chocolate ($200)
- ✅ Tarta ($220)

## 🔄 Si los Productos Siguen Sin Aparecer

1. Verifica que Render esté usando la misma base de datos MongoDB
2. Verifica que el código del servidor esté actualizado en Render
3. Reinicia el servicio en Render
4. Verifica los logs de Render para ver si hay errores
5. Verifica que las imágenes PNG estén en `app/src/main/res/drawable/`

## 📱 Después de Actualizar Render

1. Reinicia la aplicación Android
2. Verifica que los productos aparezcan en la sección "Productos"
3. Verifica que las imágenes se muestren correctamente
4. Prueba agregar productos al carrito

