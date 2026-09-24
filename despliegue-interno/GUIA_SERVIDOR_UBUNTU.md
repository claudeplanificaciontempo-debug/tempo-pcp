# TEMPO PCP en el servidor Ubuntu de la empresa

Guía para quien administra el equipo Ubuntu de la red. Son **dos comandos** y no tocan las otras aplicaciones del equipo.

## Qué se instala y qué no

- **Se instala la pantalla del sistema** (un solo archivo, `index.html`) en un **puerto propio**, abierto **solo a la red
  interna** (10.x, 172.16–31.x, 192.168.x). El instalador **elige solo el puerto**: el primero libre desde el `8790`
  (en este equipo el 80 y el 8080 ya los usan las otras aplicaciones).
- **Los datos no se mueven.** Siguen en Supabase (internet), igual que hoy. Los usuarios y contraseñas son los mismos de siempre.
- Queda un **actualizador automático**: cada 15 minutos revisa si hay una versión nueva publicada y la instala. Si la descarga
  llega incompleta o no hay internet, deja la que está funcionando. Si pasa más de 2 horas sin poder revisar, la app lo avisa en
  pantalla («El servidor interno no trae versiones nuevas…»).

## Requisitos

- Ubuntu 20.04 o posterior, con un usuario que tenga `sudo`.
- **IP fija** para este equipo (o una reserva en el DHCP): la dirección que se reparte a la planta lleva la IP.
- Salida a internet:
  - **el servidor** necesita `raw.githubusercontent.com` (para bajar el sistema y sus actualizaciones);
  - **las computadoras y tablets** necesitan `bypdfogmksbxjaiydhlg.supabase.co` (los datos), `cdn.jsdelivr.net` (la librería de
    conexión) y `fonts.googleapis.com` / `fonts.gstatic.com` (la letra). Son los mismos que usan hoy con la dirección pública.

El instalador usa el servidor web que ya esté funcionando en el equipo (**nginx** o **Apache**) y solo le **agrega** un sitio en
el puerto nuevo; a los sitios de las otras aplicaciones no les cambia nada (en Apache tampoco habilita módulos). Si no hay
ninguno funcionando, instala nginx sin ocupar el puerto 80 y sin reiniciar otros servicios.

## Pasos

1. Bajar el instalador:

   ```bash
   curl -fsSL https://raw.githubusercontent.com/claudeplanificaciontempo-debug/tempo-pcp/main/despliegue-interno/instalar.sh -o instalar.sh
   ```

2. Correrlo **sin número** (elige solo un puerto libre):

   ```bash
   sudo bash instalar.sh
   ```

   Dice qué puerto eligió y qué puertos vio ocupados, y **pregunta antes de tocar nada**: si ese puerto es de alguna de las
   otras aplicaciones (aunque esté apagada en ese momento), responder `n` y correrlo con otro número. Al final muestra la
   dirección, por ejemplo `http://192.168.1.50:8790/`.
   - Un puerto en particular: `sudo bash instalar.sh 8795` (si está ocupado, dice quién lo usa, sugiere otro y no hace nada).
   - Sin la pregunta: `sudo bash instalar.sh --si` (también hace falta si se corre sin terminal, por ejemplo desde otro programa).

3. Abrir esa dirección desde una computadora o tablet de la red y entrar con el usuario de siempre. **Cada equipo tiene que
   volver a entrar una vez** (el navegador guarda la sesión por dirección); las agrupaciones y filtros guardados se vuelven a
   elegir. No se pierde ningún dato.

4. **Supabase: no registrar la dirección interna.** «Olvidé mi contraseña» manda un enlace que lleva a la **dirección pública**
   (https); ahí se pone la clave nueva y luego se vuelve a entrar por la interna. Registrar la dirección interna (http, sin
   cifrar) en *Redirect URLs* haría viajar ese enlace por una conexión sin cifrar dentro de la red. Lo único que sí debe estar
   configurado en Supabase → *Authentication* → *URL Configuration* es la **Site URL** = la dirección pública
   (`https://claudeplanificaciontempo-debug.github.io/tempo-pcp/`), como indica `LOGIN_RECUPERAR_CONTRASENA.md`.

5. (Opcional) Un nombre en vez del número: en el DNS interno o en el router, un nombre como `pcp.tempo.local` apuntando a la IP
   del equipo. Entonces se entra con `http://pcp.tempo.local:8790/` (con el puerto que haya elegido). Conviene decidir UNA sola
   forma de entrar (IP o nombre) antes de repartirla: para el navegador son dos direcciones distintas.

## Cómo elige el puerto

Un puerto cuenta como ocupado si algo lo está escuchando ahora, si lo declara una configuración de nginx, Apache, Caddy o
systemd (también los puertos a los que apuntan sus proxies) o si lo reserva un contenedor de Docker (aunque esté apagado).
**Ojo:** si una de las otras aplicaciones corre de otra forma (pm2, un programa suelto…) y justo está apagada, su puerto puede
parecer libre. Por eso el instalador pregunta antes de seguir.

## Después

| Qué | Dónde |
|---|---|
| Registro de actualizaciones | `/var/lib/tempo-pcp/actualizar.log` |
| Actualizar ya, sin esperar los 15 minutos | `sudo /opt/tempo-pcp/actualizar.sh` |
| Versiones anteriores (las últimas 30) | `/var/lib/tempo-pcp/anteriores/` |
| Volver a una versión anterior | `sudo cp /var/lib/tempo-pcp/anteriores/index-AAAAMMDD-HHMMSS.html /var/www/tempo-pcp/index.html` |
| Configuración del sitio | nginx: `/etc/nginx/conf.d/tempo-pcp.conf` · Apache: `/etc/apache2/sites-available/tempo-pcp.conf` |
| Registros del servidor web | `/var/log/nginx/tempo-pcp.*.log` (o los de Apache) |
| Volver a instalar (queda en el mismo puerto) | `sudo bash instalar.sh` |
| Cambiar de puerto | `sudo bash instalar.sh 8795` |
| Quitar el sitio | `sudo bash instalar.sh --quitar` (si el instalador instaló o encendió nginx, lo deja apagado como estaba, salvo que ahora sirva a otras aplicaciones) |

## Si algo sale mal

En todos estos casos el instalador **se detiene sin dejar nada a medias**, quita lo que haya puesto y el servidor web queda
como estaba; las otras aplicaciones siguen igual. Si era una **reinstalación**, la instalación anterior queda funcionando como estaba.
Lo mismo si se corta la conexión o alguien pulsa Ctrl-C a mitad.

| Mensaje | Qué pasa y qué hacer |
|---|---|
| «No se pudo bajar el sistema» | El equipo no llega a internet (o la red usa un proxy). Probar `curl -I https://raw.githubusercontent.com`. No se tocó el servidor web. |
| «El puerto N ya lo usa otra aplicación» | Muestra quién lo usa y sugiere otro. Correrlo sin número o con el sugerido. |
| «nginx no está funcionando, pero hay otros sitios configurados» | Encender nginx levantaría también esos sitios. Sistemas decide; luego se vuelve a correr. |
| «La configuración de nginx/Apache no pasó la prueba» | Casi siempre es un error que ya estaba en la configuración de otra aplicación. No se recargó nada. |
| «Este nginx no carga /etc/nginx/conf.d» | Es un nginx con configuración propia; hay que agregar el sitio a mano (copiar el de la tabla de arriba). |
| «Otra aplicación tomó el puerto mientras se instalaba» / «no abrió el puerto» / «se apagó al recargar» | El instalador lo detectó, quitó su sitio y dejó el servidor web funcionando (si no pudo, lo dice en grande). Volver a correrlo. |
| «No se pudo instalar nginx» | Ver el error de apt que aparece arriba (candado de apt, repositorio roto…). apt nunca quita paquetes para instalarlo. |
| «Hay un servidor web funcionando fuera de systemd» / «el default está editado» | Es de otra aplicación: el instalador no lo toca. Sistemas decide. |
| «Apache tiene configurado el puerto N y ahora lo usa otra aplicación» | Hay un cambio de otra aplicación pendiente que tumbaría Apache al recargar. El instalador no recarga; revisar ese `Listen`. |
| «Instalado, pero la prueba desde este equipo dio código …» | El servidor web tomó el puerto; revisar el registro de errores que indica el mensaje (a veces es un proxy de la red). |

## Cosas que conviene saber

- **La dirección pública sigue funcionando** (GitHub Pages) y hace falta para recuperar contraseñas. **No apagarla** mientras la
  dirección interna no tenga HTTPS.
- **Sin internet el sistema no funciona**, porque los datos están en Supabase. Si más adelante se quiere que los datos también
  estén en la empresa y funcione sin internet, es otro proyecto: instalar Supabase en este equipo con Docker y pasar los datos.
- El sitio interno no usa HTTPS. Para una fábrica en red interna es aceptable; si se quiere, se agrega después con un
  certificado interno, y entonces sí se puede registrar la dirección interna en Supabase.
- Si alguna vez se cambia el nombre de la cuenta de GitHub o el repositorio pasa a privado, el actualizador deja de traer
  versiones (y la app lo avisa): hay que volver a correr el instalador con la dirección nueva.
