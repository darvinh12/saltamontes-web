# Saltamontes — Tostadores de café de especialidad

Landing de una sola página para Saltamontes, el proyecto de tueste de Raúl Martínez, caficultor y Q Arabica Grader venezolano. La estructura sigue el modelo de los grandes tostadores de especialidad (hero de video, tienda con fichas técnicas, bandas editoriales, club de suscripción, credenciales) con una capa de efectos propia de GI Group: preloader de marca, scroll cinematográfico con GSAP, botones magnéticos, tarjetas con tilt y cursor personalizado.

Todos los botones llevan a WhatsApp. No hay carrito ni pasarela de pago.

## Estructura

```
saltamontes-web/
├── index.html            La página completa
├── assets/
│   ├── styles.css        Sistema visual (tokens, tipografía, layout)
│   ├── app.js            Comportamiento base: WhatsApp, menú, filtros, carrusel
│   └── effects.js        Animación GSAP: preloader, scroll, cursor
├── images/               Fotos (ver LEEME-fotos-y-videos.txt)
└── videos/               Videos de fondo (hero y manifiesto)
```

Es HTML, CSS y JavaScript puro. GSAP se carga por CDN. No hay build ni dependencias que instalar.

## Lo único que DEBES cambiar para publicar

Abre `assets/app.js` y cambia la primera constante:

```js
const WHATSAPP_NUMBER = "584140000000";   // pon el número real
```

Formato internacional sin +, sin espacios ni guiones. Venezuela: `58` más el número. Ejemplo: `+58 414-123-4567` queda `"584141234567"`.

## Qué más conviene cambiar

1. Fotos y videos reales. Las actuales son de bancos libres (ver `images/CREDITS.md`). La foto `raul.jpg` NO es Raúl, es stock temporal.
2. Testimonios. Los que están son de relleno, hay un comentario en el HTML marcando dónde.
3. Precios. Las tarjetas dicen "Precio Ref.", ponlos reales o déjalos para cerrar por WhatsApp.
4. Instagram. El enlace apunta a `@raulmartinez28`, verifica que sea la cuenta correcta.

## Ver la página en local

Doble clic en `index.html` funciona, pero lo ideal es servirla:

```bash
npx serve .
# o
python -m http.server 8080
```

## Publicar en GitHub y Vercel

El repositorio ya viene inicializado con su primer commit. Para subirlo:

```bash
# Opción A: con GitHub CLI
gh repo create saltamontes-web --public --source . --push

# Opción B: manual
# 1. Crea un repo vacío en github.com
git remote add origin https://github.com/TU-USUARIO/saltamontes-web.git
git push -u origin main
```

Luego en [vercel.com](https://vercel.com) importa el repositorio. Es un sitio estático, no necesita configuración: framework "Other", sin build command, output en la raíz. El `vercel.json` ya activa las URLs limpias.

## Créditos

Demo por GI Group. Fotos y videos temporales de Unsplash y bancos libres, registrados en `images/CREDITS.md`.
