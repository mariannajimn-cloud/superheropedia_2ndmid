# Superhero-pedia — Midterm II

Backend de Node + Express para la plantilla del profesor. El frontend original en `public/` todavía no está conectado: sus llamadas a `/api` y sus campos genéricos deben adaptarse por separado. Este cambio implementa exclusivamente el backend.

## Ejecutar

Requiere Node.js 22 o superior y acceso a Internet para consultar la API externa.

```sh
npm ci
npm start
```

Servidor: http://localhost:3001. Para otro puerto: `PORT=3000 npm start`.
No requiere API key, MongoDB ni archivo `.env`.

## Endpoints

### GET /api/characters

Devuelve el catálogo por ID ascendente:

```json
{ "results": [{ "id": 1, "name": "A-Bomb", "image": "https://..." }] }
```

### GET /api/characters?search=batman

Misma estructura, filtrada por coincidencia parcial en `name`, sin distinguir mayúsculas y omitiendo espacios exteriores. No busca por nombre completo ni ID. Una búsqueda vacía devuelve todo el catálogo. Máximo 100 caracteres; parámetros `search` repetidos son inválidos. Sin coincidencias: HTTP 404.

### GET /api/characters/:id

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

## Integración pendiente para frontend

1. `loadCatalog(searchQuery)` debe llamar a `/api/characters`, añadiendo `search` mediante `URLSearchParams` cuando corresponda; leer `results`.
2. `openDetail(id)` debe llamar a `/api/characters/ID` y pasar el objeto a `populateModal`.
3. Adaptar `populateModal` y los elementos HTML a los campos documentados; no existen `experience`, `types`, `abilities` ni `moves` en este contrato.
4. Los botones Previous/Next usan los IDs de la respuesta para llamar al mismo endpoint de detalle.
5. Para regresar al inicio después de un error, cargar el catálogo sin búsqueda y usar su primer elemento si se necesita abrir la primera ficha. No hay ID inicial fijo en el contrato.
6. Mostrar mensajes del cuerpo de error, valores ausentes y el fallback de imagen; conservar estados de carga y evitar que respuestas antiguas sobrescriban la selección actual.

No se necesita crear endpoints de escritura, usuarios, login ni base de datos para esta consigna.

## Organización

- `server.js`: arranque y puerto.
- `app.js` (raíz): configura Express y sirve la plantilla mediante una ruta absoluta.
- `routes/characters.js`: conecta los endpoints con las funciones del servicio y valida los parámetros.
- `services/characters.js`: funciones para consultar y normalizar la fuente, buscar personajes y calcular la navegación.
- `middleware/errors.js`: errores JSON centralizados.
- `public/`: plantilla original del profesor, sin modificaciones de este trabajo.

## Fuente externa

Se consulta https://akabab.github.io/superhero-api/api/all.json, que contiene las fichas completas. Documentación: https://akabab.github.io/superhero-api/api/.

El servicio consulta la fuente externa en cada solicitud; no conserva una copia de los datos en memoria. Por ello, si la fuente no está disponible, la solicitud devuelve un error `502` o `504`.

## Verificación manual

```sh
curl http://localhost:3001/api/characters
curl 'http://localhost:3001/api/characters?search=batman'
curl 'http://localhost:3001/api/characters?search='
curl http://localhost:3001/api/characters/1
curl http://localhost:3001/api/characters/invalid
curl http://localhost:3001/api/characters/999999
curl 'http://localhost:3001/api/characters?search=batman&search=superman'
```

Revisa el JSON: catálogo, búsqueda y búsqueda vacía deben responder con `results`; el detalle debe incluir `prevId` y `nextId`. Para comprobar el cierre circular, consulta el primer y el último ID del catálogo: el `prevId` del primero debe ser el último, y el `nextId` del último debe ser el primero. El ID inválido y la búsqueda repetida deben responder `400`; un ID inexistente debe responder `404`.

Para revisar el fallo de la fuente, desconecta temporalmente Internet y consulta un endpoint; no hace falta reiniciar el servidor porque cada solicitud consulta la fuente externa. La solicitud sin conexión debe devolver un error `502` o `504`. Al restablecer Internet, vuelve a probar.

El frontend de `public/` permanece sin conectar a estos endpoints y sin cambios en este trabajo.
