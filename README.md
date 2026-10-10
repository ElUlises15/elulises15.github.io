# elulises15.github.io

Hub personal de Ulises Bentancor: un solo lugar para encontrar mis proyectos, páginas y juegos.

**Sitio:** https://elulises15.github.io/

Es un sitio estático (HTML + CSS + JavaScript sin frameworks) publicado con GitHub Pages desde la rama `main`
(carpeta raíz). No hay paso de build: lo que está en el repo es lo que se publica.

## Cómo se arma

- `index.html` – estructura de la página.
- `styles.css` – estilos (modo claro/oscuro automático, con botón para cambiarlo).
- `app.js` – lee `projects.json` y arma destacados, buscador, filtros y tarjetas.
- **`projects.json` – la lista de proyectos. Para actualizar el sitio, casi siempre alcanza con tocar solo este archivo.**
- `assets/thumbs/` – capturas de cada proyecto (WebP, 640×400).
- `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `og-image.png`, `robots.txt`, `sitemap.xml`.

## Formato de `projects.json`

Es un array de objetos. Cada proyecto tiene:

| Campo | Tipo | Obligatorio | Descripción |
|---|---|---|---|
| `id` | texto | sí | Identificador único, en minúsculas y con guiones (`paladin-survival-mobile`). |
| `title` | texto | sí | Nombre que se muestra. |
| `category` | texto | sí | `juego` · `web` · `herramienta` · `emprendimiento` · `libro` · `curso` (los de `curso` van a la sección «Proyectos anteriores / de cursada»). |
| `status` | texto | sí | `online` · `en-desarrollo` · `archivado`. |
| `description` | texto | sí | Una o dos oraciones, honestas y en castellano rioplatense. |
| `tags` | array de textos | sí | Etiquetas para el buscador (puede ser `[]`). |
| `liveUrl` | URL https | no | Link para jugar o ver la web. Muestra el botón **Jugar** (si es `juego`) o **Ver web**. |
| `repoUrl` | URL https | no | Repo **público** de GitHub. Muestra el botón **Código**. Nunca poner repos privados. |
| `image` | ruta | no | Captura, por ejemplo `assets/thumbs/<id>.webp`. Si no hay, se dibuja un placeholder según la categoría. |
| `updated` | `AAAA-MM-DD` | sí | Última actualización. La lista se ordena por este campo (más nuevo primero) y el pie muestra el más reciente. |
| `featured` | `true`/`false` | sí | Si es `true`, aparece también en «Destacados» (en el mismo orden que en `projects.json`). |

Ejemplo:

```json
{
  "id": "mi-juego",
  "title": "Mi Juego",
  "category": "juego",
  "status": "online",
  "description": "Juego de plataformas que se juega en el navegador.",
  "tags": ["plataformas", "navegador"],
  "liveUrl": "https://elulises15.github.io/mi-juego/",
  "repoUrl": "https://github.com/ElUlises15/mi-juego",
  "image": "assets/thumbs/mi-juego.webp",
  "updated": "2026-10-10",
  "featured": false
}
```

Proyectos privados o en preproducción: solo nombre, una línea neutral, `"status": "en-desarrollo"` y **sin** `liveUrl` ni `repoUrl`.

## Cómo agregar o actualizar un proyecto

1. Editá `projects.json`: agregá el objeto nuevo (o cambiá `status`, links, `description` y `updated` del que ya existe).
   Revisá que el JSON sea válido: `python3 -m json.tool projects.json > /dev/null`.
2. (Opcional) Sacá una captura del link en vivo a 1280×800 y pasala a WebP 640×400, por ejemplo con Playwright + sharp:

   ```bash
   # captura
   npx playwright screenshot --viewport-size=1280,800 --wait-for-timeout=3000 https://elulises15.github.io/mi-juego/ /tmp/mi-juego.png
   # a WebP 640x400
   node -e "require('sharp')('/tmp/mi-juego.png').resize(640,400).webp({quality:78}).toFile('assets/thumbs/mi-juego.webp')"
   ```

   y poné `"image": "assets/thumbs/mi-juego.webp"`. Sin captura real, dejá el campo afuera (no inventes capturas).
3. Si cambió algo grande, actualizá `<lastmod>` en `sitemap.xml`.
4. Probalo local: `python3 -m http.server 8000` y abrí http://localhost:8000.
5. `git add -A && git commit -m "Agrego mi-juego" && git push`. GitHub Pages lo publica en uno o dos minutos.

## Notas

- Los sitios de cada proyecto (por ejemplo `/paladin-survival-mobile/` o `/web-factory-demo/`) viven en sus propios repos;
  este repo no los toca.
- Sin fuentes externas ni librerías: carga rápido y funciona en celulares viejos.
