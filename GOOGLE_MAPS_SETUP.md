# Configuración de Google Maps API

## Pasos para configurar la clave de API de Google Maps

1. **Obtener una clave de API de Google Maps:**
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Crea un nuevo proyecto o selecciona uno existente
   - Habilita las siguientes APIs:
     - Maps SDK for Android
     - Geocoding API (para validar direcciones)
   - Ve a "Credenciales" y crea una nueva clave de API
   - Restringe la clave a tu aplicación Android (opcional pero recomendado)

2. **Configurar la clave en la aplicación:**
   - Abre el archivo `app/src/main/AndroidManifest.xml`
   - Busca la línea que dice `android:value="YOUR_API_KEY"`
   - Reemplaza `YOUR_API_KEY` con tu clave de API real

   ```xml
   <meta-data
       android:name="com.google.android.geo.API_KEY"
       android:value="TU_CLAVE_DE_API_AQUI" />
   ```

3. **Permisos:**
   - Los permisos necesarios ya están agregados en el AndroidManifest.xml:
     - `INTERNET` (requerido para cargar mapas)
     - `ACCESS_FINE_LOCATION` (opcional, para ubicación del usuario)
     - `ACCESS_COARSE_LOCATION` (opcional, para ubicación del usuario)

## Notas importantes

- La aplicación usa Geocoder de Android para validar direcciones, que funciona sin clave de API pero puede tener limitaciones
- Google Maps SDK requiere una clave de API válida para funcionar
- Asegúrate de restringir tu clave de API para evitar uso no autorizado
- La clave de API debe tener habilitadas las APIs mencionadas arriba

## Funcionalidades implementadas

1. **Validación de direcciones:** 
   - El usuario debe buscar una dirección válida
   - La dirección se valida usando Geocoder
   - Se muestra un mapa con la ubicación seleccionada
   - El usuario puede tocar el mapa para seleccionar una ubicación

2. **Confirmación de pedido:**
   - Después de confirmar el pedido, se muestra un diálogo con el mensaje:
     "Tu pedido está en camino, recuerda traer $[cantidad] exacta"

