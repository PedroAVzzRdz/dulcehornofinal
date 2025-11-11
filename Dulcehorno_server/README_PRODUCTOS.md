# Guía para Agregar Productos

## Pasos para agregar los nuevos productos

### 1. Actualizar productos existentes (si es necesario)

Si tienes productos antiguos en la base de datos que no tienen el campo `availableUnits`, ejecuta:

```bash
cd Dulcehorno_server
node updateExistingProducts.js
```

Este script agregará `availableUnits: 50` a todos los productos que no lo tengan.

### 2. Agregar los nuevos productos

Ejecuta el script para agregar los nuevos productos:

```bash
cd Dulcehorno_server
node addProducts.js
```

Este script agregará los siguientes productos:

#### Bebidas
- **Capuccino** - $45.00
  - Delicioso capuccino con espuma cremosa y un toque de canela.

#### Pan Dulce
- **Dona Rellena** - $25.00
  - Dona suave y esponjosa rellena de mermelada de fresa.
- **Cuernito** - $22.00
  - Cuernito dorado y crujiente con un interior suave.
- **Pan de Chocolate** - $28.00
  - Pan dulce con chips de chocolate derretido.
- **Matcha** - $35.00
  - Pan dulce con sabor a matcha, suave y delicado.
- **Oreja** - $20.00
  - Oreja crujiente y hojaldrada, dulce y deliciosa.
- **Volcán** - $30.00
  - Pan dulce en forma de volcán con relleno sorpresa.

#### Pasteles
- **Pastel de Fresa** - $180.00
  - Pastel suave y esponjoso cubierto con fresas frescas y crema batida.
- **Pastel de Chocolate** - $200.00
  - Pastel de chocolate rico y cremoso con cobertura de ganache.
- **Tarta** - $220.00
  - Tarta elegante con base crujiente y relleno cremoso.

### 3. Verificar que los productos se agregaron correctamente

Puedes verificar que los productos se agregaron correctamente consultando la API:

```bash
curl http://localhost:3000/api/products
```

O simplemente reinicia la aplicación Android y verifica que los nuevos productos aparezcan en la lista.

## Notas

- Los drawables deben estar en `app/src/main/res/drawable/`
- Los nombres de los drawables deben coincidir exactamente con los especificados en `drawableResId`
- Las categorías se generan automáticamente en la aplicación basándose en los productos
- El campo `availableUnits` tiene un valor por defecto de 50 si no se especifica

## Categorías disponibles

- **Pan Dulce**: Productos de panadería tradicional
- **Pasteles**: Tortas y pasteles
- **Bebidas**: Café y otras bebidas

## Solución de problemas

Si algún producto no aparece:
1. Verifica que el drawable existe en `app/src/main/res/drawable/`
2. Verifica que el nombre del drawable coincida exactamente (case-sensitive)
3. Verifica que el servidor esté ejecutándose
4. Verifica que la conexión a MongoDB esté activa
5. Revisa los logs del servidor para errores

