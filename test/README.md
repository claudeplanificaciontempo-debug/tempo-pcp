# Pruebas del sistema (simulador local)

- `mock.js`: Supabase falso en memoria (sesión de administrador, tablas vacías). Captura `alert`, responde `confirm` con sí y registra errores en `window.__R`.
- `driver.js`: guion que carga los maestros del `seed()`, categorías y las 5 órdenes de `demo()`, recorre todas las páginas y pestañas, ejecuta el flujo de tintorería (armar por color → confirmar → salió → calidad → liberar a corte, y rechazo → reproceso) y por último pulsa todos los botones de cada página.
- `build.js`: genera `test/.out/index.html` a partir de `index.html`. `server.js`: lo sirve en http://127.0.0.1:8765/.

```
node test/build.js
node test/server.js
```
Abre la URL y en la consola: `__R.done`, `__R.errors`, `__R.checks.filter(c=>!c.ok)`.

## Descargas que deja el simulador

Las pruebas de Ingeniería (IMO14, IMO-V2 y afines) pulsan los botones «Descargar Excel» de
Secuencia y Balanceo con datos inventados («Prueba guion» · T9-A, «Camiseta 4240»). Si el
simulador se corre en un Chrome normal, cada corrida deja en la carpeta de descargas del equipo
archivos como `Secuencia_Prueba_guion (N).xlsx` o `Balanceo_Camiseta_Camiseta_4240 (N).xlsx`.
No tienen datos de planta y se pueden borrar. Para evitarlo, correr el simulador con Chrome
headless apuntando las descargas a una carpeta temporal, por ejemplo:

```
chrome --headless --window-size=1520,1000 --user-data-dir=/tmp/tempo-sim \
  --download-default-directory=/tmp/tempo-sim/descargas http://127.0.0.1:8765/
```
