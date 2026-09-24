# TEMPO PCP en el servidor Ubuntu de la empresa

Guía para quien administra el equipo Ubuntu de la red. Son **dos comandos** y no tocan las otras aplicaciones del equipo.

## Qué se instala y qué no

- **Se instala la pantalla del sistema** (un solo archivo, `index.html`) en un **puerto propio** (por defecto `8080`), abierto
  **solo a la red interna** (10.x, 172.16–31.x, 192.168.x).
- **Los datos no se mueven.** Siguen en Supabase (internet), igual que hoy: el equipo y las computadoras de la planta necesitan
  salida a internet. Los usuarios y contraseñas son los mismos de siempre.
- Queda un **actualizador automático**: cada 15 minutos revisa si hay una versión nueva publicada y la instala. Si la descarga
  llega incompleta, deja la que está funcionando.

## Requisitos

- Ubuntu 20.04 o posterior, con un usuario que tenga `sudo`.
- Salida a internet desde el equipo (para bajar el sistema y sus actualizaciones).
- Un puerto libre. El instalador revisa que nadie lo esté usando; si está ocupado, avisa y no hace nada.

El instalador usa el servidor web que ya tenga el equipo (**nginx** o **Apache**). Si no hay ninguno, instala nginx sin ocupar
el puerto 80.

## Pasos

1. Bajar el instalador:

   ```bash
   curl -fsSL https://raw.githubusercontent.com/claudeplanificaciontempo-debug/tempo-pcp/main/despliegue-interno/instalar.sh -o instalar.sh
   ```

2. Correrlo (cambiar `8080` si ese puerto ya está en uso):

   ```bash
   sudo bash instalar.sh 8080
   ```

   Al final muestra la dirección, por ejemplo `http://192.168.1.50:8080/`.

3. Abrir esa dirección desde una computadora o tablet de la red y entrar con el usuario de siempre.

4. **Para que «olvidé mi contraseña» funcione con la dirección interna:** en Supabase → *Authentication* → *URL Configuration*
   → *Redirect URLs*, agregar la dirección interna (por ejemplo `http://192.168.1.50:8080/`).

5. (Opcional) Un nombre en vez del número: en el DNS interno o en el router, un nombre como `pcp.tempo.local` apuntando a la IP
   del equipo. Entonces se entra con `http://pcp.tempo.local:8080/`.

## Después

| Qué | Dónde |
|---|---|
| Registro de actualizaciones | `/var/lib/tempo-pcp/actualizar.log` |
| Actualizar ya, sin esperar los 15 minutos | `sudo /opt/tempo-pcp/actualizar.sh` |
| Versiones anteriores (las últimas 30) | `/var/lib/tempo-pcp/anteriores/` |
| Volver a una versión anterior | `sudo cp /var/lib/tempo-pcp/anteriores/index-AAAAMMDD-HHMMSS.html /var/www/tempo-pcp/index.html` |
| Registros del servidor web | `/var/log/nginx/tempo-pcp.*.log` (o los de Apache) |
| Quitar el sitio | `sudo bash instalar.sh --quitar` |

## Cosas que conviene saber

- **La dirección pública sigue funcionando** (GitHub Pages) hasta que planificación decida apagarla. Apagarla es aparte y se
  hace cuando la dirección interna ya esté en uso por todos.
- **Sin internet el sistema no funciona**, porque los datos están en Supabase. Si más adelante se quiere que los datos también
  estén en la empresa y funcione sin internet, es otro proyecto: instalar Supabase en este equipo con Docker y pasar los datos.
- El sitio no usa HTTPS dentro de la red. Si se quiere, se agrega después con un certificado interno.
