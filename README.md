# Superhero-pedia — Midterm II

Backend de Node + Express para la plantilla del profesor. El frontend de `public/` está conectado al catálogo (`/api`) y al detalle (`/api/:id`), y muestra los campos de detalle disponibles en la respuesta.

## Ejecutar

Requiere Node.js 22 o superior y acceso a Internet para consultar la API externa.

```sh
npm ci
npm start
```

Servidor: http://localhost:3001. Para otro puerto: `PORT=3000 npm start`.
No requiere API key, MongoDB ni archivo `.env`.

## Endpoints

### GET /api

Devuelve el catálogo por ID ascendente:

```json
{ "results": [{ "id": 1, "name": "A-Bomb", "image": "https://..." }] }
```

### GET /api?search=batman

Misma estructura, filtrada por coincidencia parcial en `name`, sin distinguir mayúsculas y omitiendo espacios exteriores. No busca por nombre completo ni ID. Una búsqueda vacía devuelve todo el catálogo. Máximo 100 caracteres; parámetros `search` repetidos son inválidos. Sin coincidencias: HTTP 404.

### GET /api/:id

Devuelve un objeto directamente (sin envoltorio `results`):

| Campo | Tipo / significado |
| --- | --- |
| `id`, `name` | Número entero y nombre del personaje |
| `image` | URL HTTPS o `null`; el frontend debe usar su imagen de respaldo |
| `fullName`, `placeOfBirth` | Texto o `null` |
| `biography` | Resumen construido con datos existentes, o `null`; no es una biografía narrativa externa |
| `aliases` | Arreglo de textos |
| `powerstats` | Objeto con `intelligence`, `strength`, `speed`, `durability`, `power`, `combat`; valores de 0 a 100 o `null` |
| `gender`, `race` | Texto o `null` |
| `height`, `weight` | Arreglos de textos con las unidades que proporciona la fuente |
| `eyeColor`, `hairColor` | Texto o `null` |
| `groupAffiliation` | Texto o `null`; se conserva la descripción de la fuente |
| `publisher`, `alignment`, `occupation`, `firstAppearance` | Datos adicionales: texto o `null` |
| `prevId`, `nextId` | IDs existentes anterior y siguiente en el catálogo completo |

Los vecinos se calculan por posición en el catálogo ordenado, no sumando/restando 1 al ID. El primero enlaza hacia atrás al último y el último hacia adelante al primero, incluso después de una búsqueda. Si solo hay un personaje, ambos vecinos son él mismo.

Los campos opcionales ausentes se representan con `null` o `[]`. Un cero válido de powerstats se conserva. El backend no comprueba si una imagen remota carga: la plantilla ya incluye un fallback para ese caso.

## Errores

Todas las rutas `/api/*` responden errores JSON con esta estructura:

```json
{ "error": { "status": 404, "message": "Character not found." } }
```

- `400`: ID inválido (debe ser entero positivo seguro), búsqueda demasiado larga o repetida.
- `404`: personaje, búsqueda o ruta inexistente.
- `502`: fallo HTTP/red, JSON inválido o catálogo inválido del proveedor.
- `504`: proveedor excede 10 segundos de espera.
- `500`: error interno inesperado, sin detalles internos expuestos.

## Integración del frontend

El catálogo usa `/api` y la búsqueda añade el parámetro `search`; el detalle consulta `/api/:id`. La ficha muestra los campos disponibles en la respuesta, incluidos los valores ausentes y la imagen de respaldo. Previous/Next navega con `prevId` y `nextId`. El catálogo conserva la cuadrícula de la plantilla original y el modal muestra un personaje a la vez. El contrato no incluye `experience`, `types`, `abilities` ni `moves`.

No se necesita crear endpoints de escritura, usuarios, login ni base de datos para esta consigna.

## Organización

- `server.js`: arranque y puerto.
- `app.js` (raíz): configura Express y sirve la plantilla mediante una ruta absoluta.
- `routes/charactersRoutes.js`: conecta los endpoints con las funciones del servicio y valida los parámetros.
- `services/charactersServices.js`: consulta y normaliza la fuente, busca personajes y calcula la navegación.
- `middleware/errors.js`: errores JSON centralizados.
- `public/`: frontend conectado a la API, con los campos de detalle integrados en el modal.

## Fuente externa

Se consulta https://akabab.github.io/superhero-api/api/all.json, que contiene las fichas completas. Documentación: https://akabab.github.io/superhero-api/api/.

El servicio consulta la fuente externa en cada solicitud; no conserva una copia de los datos en memoria. Por ello, si la fuente no está disponible, la solicitud devuelve un error `502` o `504`.

## Verificación manual

```sh
curl http://localhost:3001/api
curl 'http://localhost:3001/api?search=batman'
curl 'http://localhost:3001/api?search='
curl http://localhost:3001/api/1
curl http://localhost:3001/api/invalid
curl http://localhost:3001/api/999999
curl 'http://localhost:3001/api?search=batman&search=superman'
```

Revisa el JSON: catálogo, búsqueda y búsqueda vacía deben responder con `results`; el detalle debe incluir `prevId` y `nextId`. Para comprobar el cierre circular, consulta el primer y el último ID del catálogo: el `prevId` del primero debe ser el último, y el `nextId` del último debe ser el primero. El ID inválido y la búsqueda repetida deben responder `400`; un ID inexistente debe responder `404`.

Para revisar el fallo de la fuente, desconecta temporalmente Internet y consulta un endpoint; no hace falta reiniciar el servidor porque cada solicitud consulta la fuente externa. La solicitud sin conexión debe devolver un error `502` o `504`. Al restablecer Internet, vuelve a probar.

El frontend de `public/` consume el catálogo y el detalle desde estos endpoints; el modal presenta una ficha a la vez.
