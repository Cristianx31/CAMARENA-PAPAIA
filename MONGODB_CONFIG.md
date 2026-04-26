# Configuración para MongoDB Atlas y Compass
# PAPACLICK - Proyecto de Clasificación de Papas

## Configuración MongoDB Atlas
- **Cluster**: <tu_cluster>.mongodb.net
- **Base de datos**: <tu_base_de_datos>
- **Usuario**: <tu_usuario>
- **Contraseña**: <tu_contraseña>

## String de conexión MongoDB Atlas:
```
mongodb+srv://<tu_usuario>:<tu_contraseña>@<tu_cluster>.mongodb.net/<tu_base_de_datos>?retryWrites=true&w=majority
```

## Configuración MongoDB Compass (Local)
Si prefieres usar MongoDB localmente con Compass:

1. Instalar MongoDB Community Server
2. Instalar MongoDB Compass
3. Usar la conexión: `mongodb://localhost:27017/PapasDB`

## Colecciones creadas automáticamente:
- **usuarios**: Almacena usuarios del sistema
- **variedades_papa**: Almacena las variedades de papa y sus atributos
- **clasificaciones**: Almacena cada clasificación realizada
- **imagenes**: Almacena metadatos de imágenes cargadas
- **trazabilidad**: Almacena el historial de acciones y eventos

## Estructura de datos en predicciones:
```json
{
  "_id": "ObjectId",
  "variedad": "Huayro|Peruanita|Amarilla",
  "condicion": "Apto|No Apto",
  "probabilidad": 0.95,
  "imagen": {
    "nombre": "imagen.jpg",
    "ruta": "uploads/123456-imagen.jpg",
    "tamaño": 1024000
  },
  "timestamp": "2025-09-24T17:30:00.000Z",
  "ip_usuario": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "createdAt": "2025-09-24T17:30:00.000Z",
  "updatedAt": "2025-09-24T17:30:00.000Z"
}
```

## Importante
Usa `.env` para definir `MONGODB_URI` y `MONGODB_LOCAL` en lugar de guardar credenciales en archivos.

## APIs disponibles:
- POST `/api/prediccion` - Guardar nueva predicción
- GET `/api/predicciones` - Listar predicciones
- GET `/api/estadisticas` - Obtener estadísticas
- GET `/api/prediccion/:id` - Obtener predicción por ID
- DELETE `/api/predicciones` - Limpiar todas las predicciones

## Para iniciar el servidor:
```bash
npm start
# o para desarrollo
npm run dev
```