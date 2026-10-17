# InfoDerecho Colombia

Portal web informativo, gratuito e independiente que ayuda a los hogares colombianos a saber **a qué subsidios y programas sociales del Estado podrían acceder** (Renta Ciudadana, Devolución del IVA, Colombia Mayor, Mi Casa Ya, etc.).

Proyecto final de **Ingeniería Web I** (Universidad, Momento 1, 2026-3).

> **Aviso del propio sitio:** InfoDerecho no es un canal oficial del Gobierno. No hace trámites ni inscripciones; solo orienta.

---

## 1. Estado actual del proyecto

| Área | Estado |
|---|---|
| Diseño en Figma (5 pantallas, versión móvil y escritorio) | Hecho |
| Maquetación HTML/CSS de las 5 pantallas, responsive | Hecho |
| Menú móvil, buscador y filtros del directorio | Hecho |
| Calculadora de línea de pobreza (simulación) | Hecho, con valores de referencia (ver sección 8) |
| Checklist de elegibilidad | Parcial: solo el paso 2 de 4 está diseñado e implementado |
| Botón "Ver detalles" de cada programa | Retirado a petición |
| Botón "Contactar al Equipo" | Pendiente (no hay correo definido) |
| Datos oficiales validados (umbral DANE, SMMLV, requisitos) | Pendiente de revisión |
| Backend / base de datos | No hay. Todo corre en el navegador |

El código se generó a partir del archivo de Figma **"Diseño InfoDerecho"**, usando el MCP oficial de Figma. El diseño es la referencia visual: si algo difiere, manda el Figma.

---

## 2. Cómo ejecutarlo

No requiere instalar nada ni servidor. Es HTML, CSS y JavaScript puros.

1. Descargue o clone el repositorio.
2. Abra `index.html` con doble clic (o con la extensión Live Server de VS Code).
3. Se necesita conexión a internet solo para cargar las fuentes de Google Fonts.

---

## 3. Estructura de carpetas

```
.
├── index.html                 Pantalla de Inicio (raíz)
├── pages/
│   ├── checklist.html         Checklist de elegibilidad
│   ├── programas.html         Directorio de programas
│   ├── calculadora.html       Calculadora de línea de pobreza
│   ├── oficinas.html          Mapa de oficinas de atención (Google Maps)
│   └── acerca.html            Sobre el proyecto
├── css/
│   ├── styles.css             Base compartida (tokens, header, footer, botones, formularios)
│   └── pages.css              Estilos específicos de cada pantalla
├── js/
│   └── main.js                Todo el comportamiento (menú, filtros, calculadora, checklist, mapa)
└── assets/
    ├── img/                   Fotos (hero y rural, en versión móvil y escritorio)
    └── icons/                 íconos SVG (los `*-blue.svg` son las versiones azules para botones blancos)
```

**Por qué `index.html` está en la raíz y el resto en `pages/`:** es la convención habitual (la página principal en la raíz). La consecuencia es que las rutas cambian: desde `index.html` se escribe `css/styles.css`, y desde `pages/*.html` se escribe `../css/styles.css`. Tenga esto presente al crear una página nueva.

---

## 4. Las 6 pantallas

| Archivo | Qué contiene |
|---|---|
| `index.html` | Hero con título y 3 botones de acción, sección "¿Cómo funciona InfoDerecho?" (3 tarjetas), banner de fuentes oficiales |
| `pages/checklist.html` | Barra de progreso, formulario (edad del jefe de hogar, ingreso, menores de 18, departamento), aviso de privacidad |
| `pages/programas.html` | Buscador, chips de filtro (Todos / Extrema Pobreza / Adulto Mayor) y 6 tarjetas de programas |
| `pages/calculadora.html` | Formulario (ingreso y número de miembros), tarjeta de resultado y nota informativa |
| `pages/oficinas.html` | Chips por entidad, mapa de Google Maps, buscador por departamento/municipio y 11 tarjetas de oficinas oficiales |
| `pages/acerca.html` | Descripción del proyecto, imagen, fuentes oficiales (DANE, DPS, DNP), advertencia y contacto |

Todas comparten el mismo **header** (logo + navegación de 6 pestañas) y el mismo **footer** (marca, fuentes oficiales, aviso legal).

---

## 5. HTML: cómo está escrito

- **Un solo HTML por pantalla**, que sirve para móvil y escritorio. No hay archivos separados por tamaño; el CSS decide cómo se ve.
- **Etiquetas semánticas:** `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`, `form`, `label`. Facilita la accesibilidad y la lectura del código.
- **Header y footer están repetidos** en cada archivo (copiados). Es la solución más simple sin framework, pero significa que **un cambio en el menú hay que replicarlo en las 6 páginas**.
- **Pestaña activa:** la página actual lleva la clase `is-active` y `aria-current="page"` en su enlace del menú.
- **Imágenes responsivas con `<picture>`:** el navegador carga la foto de escritorio si la pantalla mide 960 px o más, y la de móvil si no.
  ```html
  <picture>
    <source media="(min-width: 960px)" srcset="assets/img/hero-desktop.png">
    <img src="assets/img/hero-mobile.png" alt="..." loading="lazy">
  </picture>
  ```
- **Texto distinto según el tamaño:** donde el Figma móvil usa un texto más corto que el de escritorio, se escriben ambos y se muestra uno con las clases `.m-only` (solo móvil) y `.d-only` (solo escritorio).
  ```html
  <span class="d-only">Ver detalles</span><span class="m-only">Ver más detalles</span>
  ```
- **Atributos `data-*`:** las tarjetas del directorio llevan `data-tags="extrema-pobreza adulto-mayor"` y los chips llevan `data-filter="..."`. El JavaScript los usa para filtrar.

---

## 6. CSS: cómo está organizado

### Dos archivos, dos responsabilidades
- **`styles.css`** es lo común a todo el sitio: variables, reset, header, footer, botones, campos de formulario, avisos.
- **`pages.css`** es lo propio de cada pantalla, agrupado por secciones con comentarios (`Inicio`, `Checklist / Calculadora`, `Directorio`, `Acerca de`).

### Variables de diseño (tokens)
Los colores y fuentes del Figma están en `:root` al inicio de `styles.css`. **Para cambiar un color, se cambia ahí y se actualiza en todo el sitio.**

| Variable | Valor | Uso |
|---|---|---|
| `--blue` | `#1e4d8c` | Header, footer, títulos, botón principal |
| `--blue-soft` | `#e6eef7` | Estado "puedes aplicar" (fondo) |
| `--amber` / `--amber-soft` | `#8a5300` / `#fdf1dc` | Estado "en trámite" y resultado por encima del umbral |
| `--green` / `--green-soft` | `#1f6b40` / `#e7f3ec` | Progreso, resultados, entidades, estado "activo" |
| `--gray-state` / `--gray-soft` | `#3e4c59` / `#eef1f4` | Estado "no aplica" (nunca en rojo) |
| `--error` | `#b3261e` | Solo errores reales de formulario |
| `--bg` / `--bg-alt` | `#f7f8f5` / `#ebeee8` | Fondos claros |
| `--border` / `--field-border` | `#d3d8d6` / `#7b8794` | Bordes de tarjetas / bordes de campos (contraste ≥ 3:1) |
| `--text` / `--muted` | `#1f2933` / `#5b6670` | Texto principal y secundario |

Tipografías: **Poppins SemiBold** para títulos (`--font-title`) y **Open Sans** (400 y 600) para el texto (`--font-body`).

### Mobile first
Los estilos base son los de **móvil**. Los de escritorio se agregan dentro de:
```css
@media (min-width: 960px) { ... }
```
Hay un único punto de quiebre: **960 px**. Por debajo, el menú es hamburguesa y las tarjetas van en columna; por encima, el menú es horizontal y se usan filas y cuadrículas.

### Técnicas de layout que se usan
- **Flexbox** para la mayoría de bloques (header, botones, tarjetas, footer).
- **CSS Grid** para la cuadrícula de 3 columnas del directorio y para el formulario de 2 columnas en escritorio.
- **`display: contents`** en un par de lugares (tarjetas de "¿Cómo funciona?" y página "Acerca de") para reordenar elementos entre móvil y escritorio sin duplicar HTML.
- **Convención de nombres tipo BEM** (`bloque__elemento--modificador`), por ejemplo `.program__entity`, `.btn--outline`, `.footer__rule--mid`.

---

## 7. JavaScript (`js/main.js`)

Un solo archivo, sin librerías. Está envuelto en una función que se ejecuta sola, y **cada bloque se activa únicamente si encuentra sus elementos en la página** (por eso el mismo archivo sirve para las 6).

| Bloque | Páginas | Qué hace |
|---|---|---|
| Menú móvil | todas | El botón hamburguesa muestra/oculta la navegación |
| Directorio | `programas.html` | Filtra las tarjetas por texto y por chip; muestra un mensaje si no hay resultados |
| Calculadora | `calculadora.html` | Divide ingreso entre miembros, compara con el umbral y cambia color y mensaje del resultado |
| Mapa de oficinas | `oficinas.html` | "Ver en el mapa" cambia el mapa de Google Maps embebido; los chips filtran por entidad y el buscador ubica la oficina del departamento o municipio elegido |
| Checklist | `checklist.html` | Al enviar, evalúa reglas simples y lista los programas que podrían aplicar |

Los campos de dinero se formatean con separador de miles mientras se escribe (`700.000`).

**Privacidad:** nada se envía ni se guarda. Todo se calcula en el navegador, como lo promete el aviso del sitio.

---

## 8. Datos de referencia que hay que validar

En la parte superior de `js/main.js` hay dos constantes **puestas como valores de referencia, no como cifras oficiales verificadas**:

```js
const UMBRAL_POBREZA_EXTREMA_COP = 230000; // COP por persona / mes (DANE, pobreza extrema)
const SALARIO_MINIMO_LEGAL_VIGENTE_COP = 1423500; // SMMLV en COP
```

Además, las **reglas del checklist** (qué ingreso o edad califica para qué programa) son una simplificación ilustrativa. Antes de presentar esto como información real, el equipo debe contrastarlas con las fuentes oficiales (DANE, DPS, DNP, SISBÉN IV) y los textos de cada programa.

---

## 9. Assets

- **`assets/logo/`:** `logo-mark.svg` (escudo blanco con balanza e "i" de información, para el header sobre azul) y `favicon.svg` (mismo logo sobre cuadro azul).
- **`assets/icons/`:** íconos SVG exportados del Figma (estilo Lucide): `menu`, `search`, `calculator`, `list-check`, `folder-archive`, `check-circle`, `check-check`, `shield-alert`, `shield-check`, `map-pin`, `chevron-down`, `chevron-right`, `circle-x`, `mail`.
- **`assets/img/`:** `hero-desktop.png`, `hero-mobile.png` (familias), `rural-desktop.png`, `rural-mobile.png` (escuela rural). Pesan alrededor de 1,5 MB cada una; conviene comprimirlas o pasarlas a WebP antes de publicar.

---

## 10. Cómo agregar o cambiar cosas

- **Cambiar un color o fuente:** editar las variables de `:root` en `css/styles.css`.
- **Agregar un programa al directorio:** copiar una `<article class="card program">` en `pages/programas.html`, cambiar el contenido y ajustar `data-tags`. El buscador y los filtros lo reconocen solos.
- **Agregar un filtro nuevo:** añadir un botón `.chip` con `data-filter="nombre"` y poner ese nombre en los `data-tags` de las tarjetas que correspondan.
- **Agregar una página nueva:** copiar una existente dentro de `pages/`, y añadir su enlace al menú de **todas** las páginas.
- **Cambiar el umbral de pobreza o las reglas del checklist:** `js/main.js`.

---

## 11. Fuentes de información del proyecto

DANE (Línea de Pobreza Monetaria), Departamento para la Prosperidad Social (DPS), Departamento Nacional de Planeación (DNP) y SISBÉN IV. El proyecto se alinea con el **ODS 16** (Paz, Justicia e Instituciones Sólidas).
