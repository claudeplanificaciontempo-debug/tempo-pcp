# Pruebas del sistema (simulador local)

- `mock.js`: Supabase falso en memoria (sesión de administrador, tablas vacías). Captura `alert`, responde `confirm` con sí y registra errores en `window.__R`.
- `driver.js`: guion que carga los maestros del `seed()`, categorías y las 5 órdenes de `demo()`, recorre todas las páginas y pestañas, ejecuta el flujo de tintorería (armar por color → confirmar → salió → calidad → liberar a corte, y rechazo → reproceso) y por último pulsa todos los botones de cada página.
- `build.js`: genera `test/.out/index.html` a partir de `index.html`. `server.js`: lo sirve en http://127.0.0.1:8765/.

```
node test/build.js
node test/server.js
```
Abre la URL y en la consola: `__R.done`, `__R.errors`, `__R.checks.filter(c=>!c.ok)`.
