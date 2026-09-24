#!/usr/bin/env bash
# =====================================================================================================
#  TEMPO PCP · instalación en un servidor Ubuntu de la red interna
#
#  Uso:      sudo bash instalar.sh            elige solo un puerto libre (el primero desde el 8790) y pregunta antes de seguir
#            sudo bash instalar.sh 8795       usa ese puerto; si está ocupado, avisa, sugiere otro y no toca nada
#            sudo bash instalar.sh --si       sin preguntar (también con número: 8795 --si)
#            sudo bash instalar.sh --quitar   deshace la instalación (no toca las otras aplicaciones)
#  Qué hace: 1) elige un puerto que no use ninguna otra aplicación de este equipo: lo que escucha ahora, lo que declaran las
#               configuraciones de nginx, Apache, Caddy y systemd (también los destinos de sus proxies) y lo que reserva Docker
#            2) baja la última versión publicada del sistema (sin internet se detiene sin tocar nada)
#            3) usa el servidor web que ya esté funcionando (nginx o Apache) y solo le AGREGA un sitio; si no hay, instala nginx
#            4) comprueba que el servidor web tomó el puerto y sigue funcionando; si algo falla (o se interrumpe), quita su sitio,
#               devuelve la instalación anterior si la había y deja el servidor web como estaba
#            5) deja un actualizador que cada 15 minutos trae la versión nueva y un «latido» que la app revisa
#  Qué NO hace: no mueve datos. Los datos siguen en Supabase (internet), igual que hoy.
#  Se puede volver a correr: sin número reutiliza el puerto en que ya estaba.
# =====================================================================================================
set -euo pipefail
umask 022                                    # en equipos endurecidos (umask 027) el servidor web no podría leer la carpeta

PUERTO_DESDE=8790; PUERTO_HASTA=8899         # rango poco usado (el 8080/8090 los usan muchas aplicaciones)
DIR=/var/www/tempo-pcp                       # lo que el navegador ve
LIB=/var/lib/tempo-pcp                       # copias anteriores, registro, estado de la instalación
BIN=/opt/tempo-pcp                           # el actualizador
CRON=/etc/cron.d/tempo-pcp
ESTADO=$LIB/estado                           # cómo estaba el equipo ANTES de la primera instalación (lo usa --quitar)
PUERTO_ARCH=$LIB/puerto                      # puerto de la última instalación buena
UFW_ARCH=$LIB/ufw                            # reglas de ufw que agregó ESTE instalador (solo esas se borran)
RESP=$LIB/respaldo                           # lo que este instalador apartó (el sitio de ejemplo de nginx)
ANTES=$LIB/antes                             # copia de lo propio antes de volver a instalar (se devuelve si falla)
URL_RAW="https://raw.githubusercontent.com/claudeplanificaciontempo-debug/tempo-pcp/main/index.html"
REDES_INTERNAS=("10.0.0.0/8" "172.16.0.0/12" "192.168.0.0/16" "127.0.0.1" "::1" "fc00::/7" "fe80::/10")
NGX_SITIO=/etc/nginx/conf.d/tempo-pcp.conf   # conf.d lo incluyen el nginx de Ubuntu y el de nginx.org
NGX_VIEJO=/etc/nginx/sites-available/tempo-pcp; NGX_VIEJO_ACT=/etc/nginx/sites-enabled/tempo-pcp   # versión anterior del instalador
NGX_DEFAULT=/etc/nginx/sites-enabled/default
APA_SITIO=/etc/apache2/sites-available/tempo-pcp.conf
APA_ACTIVO=/etc/apache2/sites-enabled/tempo-pcp.conf
APA_PUERTOS=/etc/apache2/ports.conf
MARCA="# tempo-pcp"                          # va en la línea de ARRIBA del «Listen» que se agrega a Apache (Apache no admite comentarios al final)
APT_OPC=(-o DPkg::Lock::Timeout=300)
# banderas (todas definidas desde el principio: set -u)
PRC=""; WEB=""; SVC=""; NGX_ENCENDER=""; NGX_INSTALAR=""; NGX_HAB_ANTES=0; ESTADO_NUEVO=""; RESTAURAR=""; MUDANZA=""
DEFAULT_APARTADO=""; RECARGADO=""; DESHACIENDO=""; OJO=""; ACTUAL=""

# ---------- argumentos ----------
PUERTO=""; QUITAR=""; SI=""
for a in "$@"; do
  case "$a" in
    --quitar) QUITAR=1;;
    --si|-y)  SI=1;;
    -*) echo "Opción desconocida: $a   (se usa: sudo bash $0 [PUERTO] [--si] | --quitar)"; exit 1;;
    *)  if [ -n "$PUERTO" ]; then echo "Un solo puerto, por favor."; exit 1; fi; PUERTO="$a";;
  esac
done

if [ "$(id -u)" -ne 0 ]; then echo "Hay que correrlo con sudo:  sudo bash $0 $*"; exit 1; fi
trap 'if [ -n "$PRC" ]; then rm -f /usr/sbin/policy-rc.d; fi' EXIT
mkdir -p "$LIB"
if command -v flock >/dev/null 2>&1; then exec 8>"$LIB/.instalando"; flock -n 8 || { echo "Ya hay otra corrida del instalador en marcha."; exit 1; }; fi

# ---------- ayudas ----------
estado(){ [ -f "$ESTADO" ] && grep -m1 "^$1=" "$ESTADO" | cut -d= -f2- || true; }
# puerto en que ya quedó instalado (si se corre por segunda vez); vacío si no hay instalación
puerto_actual(){
  local p
  p="$( { for f in "$NGX_SITIO" "$NGX_VIEJO"; do if [ -f "$f" ]; then grep -hE '^\s*listen\s' "$f" | awk '{print $2}' || true; fi; done
          if [ -f "$APA_SITIO" ]; then grep -hoE '^\s*<VirtualHost[^>]*>' "$APA_SITIO" | grep -oE ':[0-9]+' || true; fi
        } 2>/dev/null | tr -d ';:' | grep -E '^[0-9]+$' | head -1 || true)"
  if [ -z "$p" ] && [ -f "$PUERTO_ARCH" ]; then p="$(tr -dc '0-9' < "$PUERTO_ARCH" || true)"; fi
  echo "$p"
}
# quién escucha en un puerto (una línea de «ss -ltnp» por socket; vacío = nadie)
dueno_puerto(){ ss -ltnp 2>/dev/null | awk -v p="$1" 'NR>1{n=split($4,a,":"); if(a[n]==p) print}' || true; }
# ¿todo lo que escucha ahí es de alguno de estos procesos? (vacío = sí)
dueno_es(){
  local d="$1" l ok p; shift
  [ -z "$d" ] && return 0
  while IFS= read -r l; do ok=""; for p in "$@"; do case "$l" in *"\"$p\""*) ok=1;; esac; done; [ -n "$ok" ] || return 1; done <<<"$d"
  return 0
}
# Apache: quita la marca y el «Listen <puerto>» que agregó este instalador; nada más (si lo que sigue a la marca es de otro, se queda)
quitar_apache_listen(){ # $1 = puerto (vacío = el que esté)
  [ -f "$APA_PUERTOS" ] || return 0
  grep -qE "(^| )$MARCA\$" "$APA_PUERTOS" || return 0
  local p="${1:-[0-9]*}"
  sed -i --follow-symlinks -e "/^$MARCA\$/{\$d;N;/\nListen $p\$/d;D}" -e "/^Listen [0-9]* $MARCA\$/d" "$APA_PUERTOS"
}
quitar_sitio_nginx(){ rm -f "$NGX_SITIO" "$NGX_VIEJO" "$NGX_VIEJO_ACT"; }
quitar_sitio_apache(){ # $1 = puerto
  if [ -f "$APA_SITIO" ] || [ -e "$APA_ACTIVO" ] || [ -L "$APA_ACTIVO" ]; then
    a2dissite -q tempo-pcp >/dev/null 2>&1 || rm -f "$APA_ACTIVO"
    rm -f "$APA_SITIO"
  fi
  quitar_apache_listen "${1:-}"
}
tiene_algo_nginx(){ [ -f "$NGX_SITIO" ] || [ -f "$NGX_VIEJO" ] || [ -e "$NGX_VIEJO_ACT" ] || [ -L "$NGX_VIEJO_ACT" ]; }
tiene_algo_apache(){ [ -f "$APA_SITIO" ] || [ -e "$APA_ACTIVO" ] || [ -L "$APA_ACTIVO" ] || { [ -f "$APA_PUERTOS" ] && grep -qE "(^| )$MARCA\$" "$APA_PUERTOS"; }; }
ufw_activo(){
  command -v ufw >/dev/null 2>&1 || return 1
  local s; s="$(LC_ALL=C ufw status 2>/dev/null || true)"
  case "${s%%$'\n'*}" in "Status: active"*) return 0;; esac; return 1
}
ufw_abrir(){ # $1 = puerto; anota solo las reglas que de verdad agregó (las que ya existían son de otro)
  local r o
  for r in "${REDES_INTERNAS[@]}"; do
    case "$r" in 127.0.0.1|*:*) continue;; esac     # IPv6 queda solo en el servidor web: ufw sin IPv6 fallaría
    o="$(LC_ALL=C ufw allow from "$r" to any port "$1" proto tcp 2>&1 || true)"
    case "$o" in *"Rule added"*|*"Rules updated"*) echo "$r $1" >> "$UFW_ARCH";; *Skipping*) ;; *) echo "Aviso: ufw no aceptó la regla para $r: $o";; esac
  done
}
ufw_cerrar(){ # $1 = puerto; solo las reglas que agregó este instalador, y nunca si el puerto ahora es de otra aplicación
  [ -f "$UFW_ARCH" ] && command -v ufw >/dev/null 2>&1 || return 0
  if ! dueno_es "$(dueno_puerto "$1")" nginx apache2; then echo "Aviso: el puerto $1 ahora lo usa otra aplicación: no toco sus reglas de ufw."; return 0; fi
  local r p
  while read -r r p; do [ "$p" = "$1" ] || continue; ufw --force delete allow from "$r" to any port "$p" proto tcp >/dev/null 2>&1 || true; done < "$UFW_ARCH"
  { grep -v " $1\$" "$UFW_ARCH" || true; } > "$UFW_ARCH.tmp"; mv -f "$UFW_ARCH.tmp" "$UFW_ARCH"
}
recargar_si_activo(){ # $1 = nginx | apache2
  if systemctl is-active --quiet "$1" 2>/dev/null; then systemctl reload "$1" || echo "Aviso: $1 no se pudo recargar; revisar con:  sudo systemctl status $1"; fi
}
# recarga y comprueba que siga vivo (el «graceful» de Apache devuelve 0 aunque después se apague); si se apagó, lo vuelve a levantar
recargar_y_comprobar(){ # $1 = nginx | apache2
  systemctl is-active --quiet "$1" 2>/dev/null || return 0
  systemctl reload "$1" || { echo "Aviso: $1 no se pudo recargar; revisar con:  sudo systemctl status $1"; return 0; }
  sleep 2
  if ! systemctl is-active --quiet "$1"; then
    systemctl start "$1" || true; sleep 2
    if systemctl is-active --quiet "$1"; then echo "Aviso: $1 se apagó al recargar y lo volví a arrancar."
    else echo "¡OJO! $1 NO quedó funcionando. Revisar ya:  sudo systemctl status $1   y   sudo journalctl -u $1 -n 30"; OJO=1; fi
  fi
}
# nginx: el sitio de ejemplo solo cuenta como «de ejemplo» si es el enlace del paquete Y su contenido no se editó
default_es_de_ejemplo(){
  { [ -L "$NGX_DEFAULT" ] && [ "$(readlink -f "$NGX_DEFAULT")" = "$(readlink -f /etc/nginx/sites-available/default 2>/dev/null)" ]; } || return 1
  local md5p md5a
  md5p="$(dpkg-query -W -f='${Conffiles}\n' nginx-common 2>/dev/null | awk '$1=="/etc/nginx/sites-available/default"{print $2}' || true)"
  md5a="$(md5sum /etc/nginx/sites-available/default 2>/dev/null | awk '{print $1}' || true)"
  [ -n "$md5p" ] && [ "$md5p" = "$md5a" ]
}
devolver_default(){
  if { [ -e "$RESP/nginx-sites-enabled-default" ] || [ -L "$RESP/nginx-sites-enabled-default" ]; } && [ ! -e "$NGX_DEFAULT" ] && [ ! -L "$NGX_DEFAULT" ]; then
    mv "$RESP/nginx-sites-enabled-default" "$NGX_DEFAULT"; echo "Devolví el sitio de ejemplo de nginx."
  fi
}
otros_sitios_nginx(){ # sitios de nginx además del nuestro (el de ejemplo del paquete, sin editar, no cuenta)
  find /etc/nginx/sites-enabled /etc/nginx/conf.d -mindepth 1 -maxdepth 1 ! -name 'tempo-pcp*' ! -name default 2>/dev/null || true
  if { [ -e "$NGX_DEFAULT" ] || [ -L "$NGX_DEFAULT" ]; } && ! default_es_de_ejemplo; then echo "$NGX_DEFAULT (no es el de ejemplo del paquete, o está editado)"; fi
}
nginx_listens(){ # puertos que abre la configuración que nginx carga
  command -v nginx >/dev/null 2>&1 || return 0
  local c; c="$(nginx -T 2>/dev/null || true)"
  grep -E '^\s*listen\s' <<<"$c" | awk '{print $2}' | sed 's/.*://; s/;.*//' | grep -E '^[0-9]+$' | sort -un || true
}

# ---------- quitar (deshacer la instalación, sin tocar las otras aplicaciones) ----------
if [ -n "$QUITAR" ]; then
  P="$(puerto_actual)"
  TENIA_NGX=""; TENIA_APA=""
  if tiene_algo_nginx; then TENIA_NGX=1; fi
  if tiene_algo_apache; then TENIA_APA=1; fi
  rm -f "$CRON"
  quitar_sitio_nginx; quitar_sitio_apache "$P"
  if [ -n "$TENIA_APA" ]; then recargar_y_comprobar apache2; fi
  if [ "$(estado NGX_INSTALADO)" = 1 ] || [ "$(estado NGX_ENCENDIDO)" = 1 ]; then
    # nginx lo puso o lo encendió este instalador; solo se apaga si ya no sirve a nadie más
    OTROS="$(otros_sitios_nginx)"; LIS="$(nginx_listens | tr '\n' ' ')"
    if [ -n "$OTROS" ] || [ -n "${LIS// /}" ]; then
      recargar_si_activo nginx
      echo "nginx lo instaló o encendió este instalador, pero ahora sirve a otros sitios: queda encendido."
    elif [ "$(estado NGX_INSTALADO)" = 1 ]; then
      systemctl disable --now nginx >/dev/null 2>&1 || true
      echo "nginx lo había instalado este instalador y no sirve a nadie más: quedó apagado. Si no se usa:  sudo apt-get remove nginx"
    else
      systemctl stop nginx >/dev/null 2>&1 || true
      if [ "$(estado NGX_HABILITADO_ANTES)" != 1 ]; then
        systemctl disable nginx >/dev/null 2>&1 || true; devolver_default
        echo "nginx estaba apagado antes de instalar: quedó apagado otra vez."
      else
        echo "nginx estaba apagado antes de instalar: quedó apagado. Su sitio de ejemplo (puerto 80) quedó guardado en $RESP y no lo devuelvo:"
        echo "nginx arranca solo al reiniciar el equipo y chocaría con la aplicación que usa el puerto 80."
      fi
    fi
  elif [ -n "$TENIA_NGX" ]; then
    recargar_si_activo nginx
  fi
  if [ -n "$P" ]; then ufw_cerrar "$P"; fi
  rm -f "$ESTADO" "$PUERTO_ARCH"
  echo "Listo: el sitio${P:+ del puerto $P} se quitó."
  if [ -z "$OJO" ]; then echo "Las otras aplicaciones no se tocaron."; fi
  echo "Los archivos quedan en $DIR, $LIB y $BIN por si se necesitan (bórralos a mano si quieres)."
  exit 0
fi

# ---------- 1 · el puerto: uno que no use ninguna otra aplicación de este equipo ----------
command -v ss >/dev/null 2>&1 || { echo "Falta el comando «ss» (paquete iproute2):  sudo apt-get install -y iproute2"; exit 1; }

# lo que escucha ahora + lo que declaran las configuraciones (listen/Listen/VirtualHost, destinos de proxies, puertos de servicios
# de systemd y /etc/default) + lo que reservan los contenedores de Docker, aunque esa aplicación esté apagada en este momento.
puertos_ocupados(){
  {
    ss -ltn 2>/dev/null | awk 'NR>1{print $4}' | sed 's/.*://' || true
    nginx_listens
    if [ -d /etc/nginx ]; then
      grep -RhE '^\s*listen\s' /etc/nginx/nginx.conf /etc/nginx/conf.d /etc/nginx/sites-enabled --exclude='tempo-pcp*' 2>/dev/null \
        | awk '{print $2}' | sed 's/.*://; s/;.*//' || true
    fi
    if [ -d /etc/apache2 ]; then
      grep -RhE '^\s*Listen\s' "$APA_PUERTOS" /etc/apache2/conf-enabled /etc/apache2/sites-enabled --exclude='tempo-pcp*' 2>/dev/null \
        | awk '{print $2}' | sed 's/.*://' || true
      grep -RhoE '^\s*<VirtualHost[^>]*>' /etc/apache2/sites-enabled --exclude='tempo-pcp*' 2>/dev/null | grep -oE ':[0-9]+' | tr -d ':' || true
    fi
    # destinos de proxies (proxy_pass, ProxyPass, upstream…) y puertos de servicios propios: «algo:NNNN», «PORT=NNNN», «--port NNNN»
    for d in /etc/nginx /etc/apache2 /etc/caddy /etc/systemd/system /etc/default; do
      [ -d "$d" ] || continue
      grep -RhvE '^\s*#' "$d" --exclude='tempo-pcp*' 2>/dev/null | grep -oE '[]A-Za-z0-9._-]:[0-9]{2,5}\b' | sed 's/.*://' || true
      grep -RhoE '(PORT|[Pp]ort)[= ][0-9]{2,5}\b|--port[= ][0-9]{2,5}\b' "$d" --exclude='tempo-pcp*' 2>/dev/null | grep -oE '[0-9]+$' || true
    done
    # Docker: si está funcionando se le pregunta (con tope de tiempo); si está apagado NO se lo despierta: se leen sus archivos
    if command -v docker >/dev/null 2>&1 && { systemctl is-active --quiet docker 2>/dev/null || pgrep -x dockerd >/dev/null 2>&1; }; then
      timeout 15 docker ps -aq 2>/dev/null | xargs -r timeout 15 docker inspect --format '{{range $p, $b := .HostConfig.PortBindings}}{{range $b}}{{.HostPort}}{{"\n"}}{{end}}{{end}}' 2>/dev/null || true
    fi
    grep -hoE '"HostPort":"[0-9]+"' /var/lib/docker/containers/*/hostconfig.json /var/snap/docker/common/var-lib-docker/containers/*/hostconfig.json 2>/dev/null | grep -oE '[0-9]+' || true
  } | grep -E '^[0-9]+$' | sort -un || true
}
ACTUAL="$(puerto_actual)"
OCUPADOS="$(puertos_ocupados)"
libre(){
  if [ -n "$ACTUAL" ] && [ "$1" = "$ACTUAL" ]; then     # el puerto de este mismo sitio: sirve si nadie más lo tomó
    dueno_es "$(dueno_puerto "$1")" nginx apache2; return $?
  fi
  case $'\n'"$OCUPADOS"$'\n' in (*$'\n'"$1"$'\n'*) return 1;; esac
  return 0
}
primer_libre(){ local p; for p in $(seq "$PUERTO_DESDE" "$PUERTO_HASTA"); do if libre "$p"; then echo "$p"; return 0; fi; done; return 1; }

if [ -z "$PUERTO" ]; then
  if [ -n "$ACTUAL" ] && libre "$ACTUAL"; then
    PUERTO="$ACTUAL"; echo "Ya estaba instalado en el puerto $PUERTO: se vuelve a instalar en el mismo."
  else
    if [ -n "$ACTUAL" ]; then echo "Estaba en el puerto $ACTUAL, pero ahora lo usa otra aplicación: se elige otro."; fi
    PUERTO="$(primer_libre)" || { echo "No encontré un puerto libre entre $PUERTO_DESDE y $PUERTO_HASTA. Indica uno:  sudo bash $0 9790"; exit 1; }
    echo "Puerto elegido: $PUERTO (el primero libre desde el $PUERTO_DESDE)."
  fi
else
  case "$PUERTO" in (*[!0-9]*) echo "El puerto tiene que ser un número (p. ej. 8795), o nada para que el instalador elija uno."; exit 1;; esac
  PUERTO=$((10#$PUERTO))
  if [ "$PUERTO" -lt 1 ] || [ "$PUERTO" -gt 65535 ]; then echo "El puerto tiene que estar entre 1 y 65535."; exit 1; fi
  if ! libre "$PUERTO"; then
    echo "El puerto $PUERTO ya lo usa otra aplicación de este equipo (o está en su configuración):"
    dueno_puerto "$PUERTO"
    grep -RnE "(^\s*(listen|Listen)\s+(\S*:)?|:)$PUERTO\b" /etc/nginx /etc/apache2 /etc/caddy /etc/systemd/system /etc/default --exclude='tempo-pcp*' 2>/dev/null | head -5 || true
    SUG="$(primer_libre || true)"
    if [ -n "$SUG" ]; then echo "Usa otro, por ejemplo:  sudo bash $0 $SUG      (o sin número y el instalador elige solo)"; fi
    exit 1
  fi
fi
echo "Puertos que ya usan otras aplicaciones de este equipo: $(grep -vx "${ACTUAL:-x}" <<<"$OCUPADOS" | tr '\n' ',' | sed 's/,$//' || true)"

# ---------- 2 · servidor web: el que ya esté funcionando; si no hay, nginx (todavía no se cambia nada) ----------
if systemctl is-enabled --quiet nginx 2>/dev/null; then NGX_HAB_ANTES=1; fi
if systemctl is-active --quiet nginx 2>/dev/null; then WEB=nginx
elif systemctl is-active --quiet apache2 2>/dev/null; then WEB=apache
else
  # un nginx o Apache que funciona fuera de systemd (arrancado a mano, @reboot…) también es de otra aplicación: no se toca
  FUERA="$(ss -ltnp 2>/dev/null | grep -E '"(nginx|apache2|httpd)"' || true)"
  if [ -n "$FUERA" ]; then
    echo "Hay un servidor web funcionando fuera de systemd (lo arrancó alguien a mano):"; echo "$FUERA"
    echo "No sigo: encender otro nginx lo pisaría. Que sistemas decida; si lo pasan a systemd, volver a correr el instalador."
    exit 1
  fi
  # no hay servidor web funcionando: se usa nginx. Si ya tiene sitios (de antes), encenderlo los levantaría: no se hace.
  OTROS="$(otros_sitios_nginx)"
  if [ -n "$OTROS" ]; then
    echo "nginx no está funcionando, pero en /etc/nginx hay otros sitios configurados que se encenderían con él:"; echo "$OTROS"
    echo "No lo enciendo. Que sistemas decida; si se enciende nginx o Apache, volver a correr el instalador."
    exit 1
  fi
  WEB=nginx; NGX_ENCENDER=1
  command -v nginx >/dev/null 2>&1 || NGX_INSTALAR=1
fi
if [ "$WEB" = nginx ]; then SVC=nginx; else SVC=apache2; fi
echo "Servidor web: $WEB$([ -n "$NGX_INSTALAR" ] && echo ' (no hay: se instala)' || true)$([ -n "$NGX_ENCENDER" ] && [ -z "$NGX_INSTALAR" ] && echo ' (estaba apagado: se enciende solo con este sitio)' || true)"

# ---------- confirmar antes de tocar nada ----------
if [ -z "$SI" ]; then
  TTY="${TEMPO_TTY:-/dev/tty}"; RTA=""
  if [ -r "$TTY" ] && { exec 3<"$TTY"; } 2>/dev/null; then
    printf '¿Instalo TEMPO PCP en el puerto %s? Si ese puerto es de alguna de las otras aplicaciones (aunque ahora esté apagada), responde n.  [S/n] ' "$PUERTO"
    read -r RTA <&3 || RTA="(fin)"; exec 3<&-; echo
    case "$RTA" in ''|s|S|si|sí|Si|Sí|SI|SÍ) ;; *) echo "No se instaló nada. Para otro puerto:  sudo bash $0 NÚMERO"; exit 1;; esac
  else
    echo "No hay terminal para preguntar. Si el puerto $PUERTO está bien, correrlo así:  sudo bash $0 $PUERTO --si"
    exit 1
  fi
fi

# ---------- 3 · bajar el sistema ANTES de tocar el servidor web (sin internet, no se cambia nada) ----------
mkdir -p "$DIR" "$LIB/anteriores" "$BIN"; chmod 0755 "$DIR"
# se escribe aparte y se cambia de una vez: el cron puede estar corriendo el actualizador en este momento
cat > "$BIN/actualizar.sh.nuevo" <<'EOF'
#!/usr/bin/env bash
# TEMPO PCP · trae la última versión publicada. Si la descarga no está completa, NO toca la que está funcionando.
# Cada revisión buena deja revisado.txt (el «latido»): la app avisa si pasan horas sin él.
set -euo pipefail
umask 022
DIR=/var/www/tempo-pcp; LIB=/var/lib/tempo-pcp
URL_RAW="https://raw.githubusercontent.com/claudeplanificaciontempo-debug/tempo-pcp/main/index.html"
mkdir -p "$LIB/anteriores"
if command -v flock >/dev/null 2>&1; then exec 9>"$LIB/.candado"; flock -w 150 9 || exit 0; fi   # uno a la vez (cron e instalador)
TMP="$(mktemp)"; trap 'rm -f "$TMP"' EXIT
if ! curl -fsSL --max-time 120 "$URL_RAW" -o "$TMP"; then echo "$(date '+%F %T') no se pudo bajar (sin internet?): se deja la versión anterior"; exit 1; fi
# comprobación: tiene que ser el sistema entero (sello de versión y el cierre AL FINAL del archivo)
FIN="$(tail -c 64 "$TMP" | tr -d '\r\n\t ')"
if ! grep -q "APP_BUILD=" "$TMP" || [ "${FIN%</html>}" = "$FIN" ]; then echo "$(date '+%F %T') descarga incompleta: se deja la versión anterior"; exit 1; fi
date +%s > "$DIR/.revisado.tmp"
mv -f "$DIR/.revisado.tmp" "$DIR/revisado.txt"
if [ -f "$DIR/index.html" ] && cmp -s "$TMP" "$DIR/index.html"; then exit 0; fi   # ya está al día
install -m 0644 "$TMP" "$DIR/index.html.nuevo"
if [ -f "$DIR/index.html" ]; then cp "$DIR/index.html" "$LIB/anteriores/index-$(date +%Y%m%d-%H%M%S).html"; fi
mv -f "$DIR/index.html.nuevo" "$DIR/index.html"
# se guardan las últimas 30 versiones (la primera vez no hay ninguna: «ls» falla y eso no es un error)
{ ls -1t "$LIB/anteriores"/index-*.html 2>/dev/null || true; } | tail -n +31 | xargs -r rm -f
echo "$(date '+%F %T') actualizado: $(grep -o "APP_BUILD='[^']*'" "$DIR/index.html" | head -1)"
EOF
chmod 0755 "$BIN/actualizar.sh.nuevo"; mv -f "$BIN/actualizar.sh.nuevo" "$BIN/actualizar.sh"
echo "Bajando el sistema…"
if ! "$BIN/actualizar.sh" 2>&1 | tee -a "$LIB/actualizar.log"; then
  echo "No se pudo bajar el sistema de $URL_RAW"
  echo "¿El equipo tiene salida a internet? Prueba:  curl -I https://raw.githubusercontent.com   — No se tocó el servidor web."
  exit 1
fi
[ -s "$DIR/index.html" ] || { echo "No quedó el archivo del sistema en $DIR. No se tocó el servidor web."; exit 1; }

# ---------- 4 · instalar nginx si no hay servidor web ----------
if [ -n "$NGX_INSTALAR" ]; then
  echo "Instalo nginx (sin arrancarlo hasta apartar su sitio de ejemplo del puerto 80, sin reiniciar otros servicios y sin quitar paquetes)."
  if [ ! -e /usr/sbin/policy-rc.d ]; then PRC=1; printf '#!/bin/sh\nexit 101\n' > /usr/sbin/policy-rc.d; chmod +x /usr/sbin/policy-rc.d; fi
  NEEDRESTART_MODE=l apt-get "${APT_OPC[@]}" update -qq || echo "Aviso: «apt-get update» falló (¿un repositorio de otra aplicación?); sigo con las listas que ya hay."
  if ! NEEDRESTART_MODE=l DEBIAN_FRONTEND=noninteractive apt-get "${APT_OPC[@]}" install -y -qq --no-remove nginx || ! command -v nginx >/dev/null 2>&1; then
    echo "No se pudo instalar nginx (ver el error de apt arriba). No se tocó ningún servidor web."; exit 1
  fi
  if [ -n "$PRC" ]; then rm -f /usr/sbin/policy-rc.d; PRC=""; fi
  NGX_HAB_ANTES=0   # lo acaba de habilitar el paquete; antes no existía
fi
# cómo estaba el equipo antes de la PRIMERA instalación (una segunda corrida no lo pisa)
if [ ! -f "$ESTADO" ]; then
  { echo "WEB=$WEB"; echo "NGX_INSTALADO=$([ -n "$NGX_INSTALAR" ] && echo 1 || echo 0)"
    echo "NGX_ENCENDIDO=$([ -n "$NGX_ENCENDER" ] && [ -z "$NGX_INSTALAR" ] && echo 1 || echo 0)"; echo "NGX_HABILITADO_ANTES=$NGX_HAB_ANTES"; } > "$ESTADO"
  ESTADO_NUEVO=1
fi

# ---------- si algo falla (o se interrumpe) desde aquí: quitar lo de este intento y dejar todo como estaba ----------
huella(){ for f in "$NGX_SITIO" "$APA_SITIO" "$APA_ACTIVO" "$APA_PUERTOS"; do if [ -e "$f" ]; then echo "== $f"; cat "$f"; fi; done 2>/dev/null | md5sum | cut -c1-32 || true; }
restaurar_antes(){
  [ -n "$RESTAURAR" ] && [ -f "$ANTES/.lista" ] || return 0
  local f
  while IFS= read -r f; do mkdir -p "$(dirname "$f")"; rm -f "$f"; cp -a "$ANTES$f" "$f"; done < "$ANTES/.lista"
}
deshacer(){
  [ -n "$DESHACIENDO" ] && return 0
  DESHACIENDO=1; trap - INT TERM HUP
  echo; echo "$1"
  if [ "$WEB" = nginx ]; then
    quitar_sitio_nginx; restaurar_antes
    if [ -n "$NGX_ENCENDER" ]; then     # nginx no estaba funcionando: queda apagado, como estaba
      systemctl stop nginx >/dev/null 2>&1 || true
      if [ "$NGX_HAB_ANTES" != 1 ] || [ -n "$NGX_INSTALAR" ]; then systemctl disable nginx >/dev/null 2>&1 || true; fi
      if [ -n "$DEFAULT_APARTADO" ] && [ -z "$NGX_INSTALAR" ]; then devolver_default; fi
      if [ -n "$NGX_INSTALAR" ]; then echo "nginx quedó instalado pero apagado (lo instaló este intento). Si no se usa:  sudo apt-get remove nginx"; fi
    elif [ -n "$RECARGADO" ]; then
      if systemctl is-active --quiet nginx; then systemctl reload nginx || true; else systemctl start nginx || true; sleep 2; fi
      if systemctl is-active --quiet nginx; then echo "nginx sigue funcionando con las otras aplicaciones."
      else echo "¡OJO! nginx NO quedó funcionando. Revisar ya:  sudo systemctl status nginx   y   sudo journalctl -u nginx -n 30"; fi
    fi
    if [ -n "$MUDANZA" ] && [ -n "$RESTAURAR" ]; then recargar_y_comprobar apache2; fi   # el sitio anterior estaba en Apache
  else
    quitar_sitio_apache "$PUERTO"; restaurar_antes
    if [ -n "$RECARGADO" ]; then
      if systemctl is-active --quiet apache2; then systemctl reload apache2 || true; else systemctl start apache2 || true; fi
      sleep 2
      if systemctl is-active --quiet apache2; then echo "Apache sigue funcionando con las otras aplicaciones."
      else echo "¡OJO! Apache NO quedó funcionando. Revisar ya:  sudo systemctl status apache2   y   sudo journalctl -u apache2 -n 30"; fi
    fi
    if [ -n "$MUDANZA" ] && [ -n "$RESTAURAR" ]; then recargar_si_activo nginx; fi       # el sitio anterior estaba en nginx
  fi
  # primera instalación fallida: se olvida el «antes» que anotó ESTE intento (salvo si instaló nginx: eso sí lo hizo él)
  if [ -n "$ESTADO_NUEVO" ] && [ -z "$NGX_INSTALAR" ]; then rm -f "$ESTADO"; fi
  if [ -n "$RESTAURAR" ]; then echo "La instalación anterior (puerto $ACTUAL) quedó como estaba."; else echo "Se quitó el sitio de TEMPO PCP."; fi
  exit 1
}

# copia de lo propio antes de volver a instalar: si este intento falla, se devuelve tal cual
rm -rf "$ANTES"
if [ -n "$ACTUAL" ]; then
  mkdir -p "$ANTES"; : > "$ANTES/.lista"
  for f in "$NGX_SITIO" "$NGX_VIEJO" "$NGX_VIEJO_ACT" "$APA_SITIO" "$APA_ACTIVO" "$APA_PUERTOS"; do
    if [ -e "$f" ] || [ -L "$f" ]; then mkdir -p "$ANTES$(dirname "$f")"; cp -a "$f" "$ANTES$f"; echo "$f" >> "$ANTES/.lista"; fi
  done
  RESTAURAR=1
fi
HUELLA_ANTES="$(huella)"
trap 'deshacer "Se interrumpió la instalación: deshago lo de este intento."' INT TERM HUP

# ---------- 5 · el sitio, abierto solo a la red interna ----------
PERMITIR_NGINX=""; for r in "${REDES_INTERNAS[@]}"; do PERMITIR_NGINX+="        allow $r;"$'\n'; done
PERMITIR_APACHE="${REDES_INTERNAS[*]}"

if [ "$WEB" = nginx ]; then
  # si una instalación anterior quedó en Apache, se quita de ahí (un solo sitio) y se espera a que Apache suelte el puerto
  if tiene_algo_apache; then
    MUDANZA=1; quitar_sitio_apache "$ACTUAL"; recargar_y_comprobar apache2
    for _ in 1 2 3 4 5 6 7 8 9 10; do case "$(dueno_puerto "$PUERTO")" in *'"apache2"'*) sleep 1;; *) break;; esac; done
  fi
  rm -f "$NGX_VIEJO" "$NGX_VIEJO_ACT"          # la versión anterior del instalador lo ponía en sites-available/enabled
  mkdir -p /etc/nginx/conf.d
  cat > "$NGX_SITIO" <<EOF
# TEMPO PCP · sitio interno (lo escribió instalar.sh). Puerto propio para no chocar con las otras aplicaciones.
server {
    listen $PUERTO;
    server_name _;
    root $DIR;
    index index.html;
    location / {
$PERMITIR_NGINX        deny all;
        try_files \$uri \$uri/ /index.html;
    }
    # el archivo cambia con cada actualización: el navegador pregunta siempre si hay versión nueva
    location = /index.html {
$PERMITIR_NGINX        deny all;
        add_header Cache-Control "no-cache, must-revalidate";
    }
    location = /revisado.txt {
$PERMITIR_NGINX        deny all;
        add_header Cache-Control "no-store";
    }
    gzip on;
    gzip_types text/css application/javascript application/json;
    access_log /var/log/nginx/tempo-pcp.access.log;
    error_log  /var/log/nginx/tempo-pcp.error.log;
}
EOF
  # nginx que no estaba funcionando: su sitio de ejemplo (puerto 80, sin editar) no lo usa nadie y chocaría con las otras apps
  if [ -n "$NGX_ENCENDER" ] && default_es_de_ejemplo; then
    mkdir -p "$RESP"; rm -f "$RESP/nginx-sites-enabled-default"; mv "$NGX_DEFAULT" "$RESP/nginx-sites-enabled-default"; DEFAULT_APARTADO=1
    echo "Aparté el sitio de ejemplo de nginx (puerto 80) a $RESP: no lo usaba nadie."
  fi
  if ! PRUEBA="$(nginx -t 2>&1)"; then deshacer "La configuración de nginx no pasó la prueba (casi siempre es algo que ya estaba):"$'\n'"$PRUEBA"; fi
  CONF="$(nginx -T 2>/dev/null || true)"
  if ! grep -qF "root $DIR;" <<<"$CONF"; then
    deshacer "Este nginx no carga /etc/nginx/conf.d (tiene una configuración propia): no puedo agregar el sitio sin tocar la suya."
  fi
  if [ -n "$NGX_ENCENDER" ]; then
    OTROS_P="$(nginx_listens | grep -vx "$PUERTO" | tr '\n' ' ' || true)"
    if [ -n "${OTROS_P// /}" ]; then deshacer "nginx estaba apagado y al encenderlo abriría también los puertos: $OTROS_P— no lo enciendo."; fi
  fi
else
  # si una instalación anterior quedó en nginx, se quita de ahí (un solo sitio)
  if tiene_algo_nginx; then MUDANZA=1; quitar_sitio_nginx; recargar_si_activo nginx; fi
  quitar_apache_listen "$ACTUAL"
  # primero el sitio y después el Listen: un Listen sin su sitio serviría la página principal de Apache sin restricción
  cat > "$APA_SITIO" <<EOF
# TEMPO PCP · sitio interno (lo escribió instalar.sh). Puerto propio para no chocar con las otras aplicaciones.
<VirtualHost *:$PUERTO>
    DocumentRoot $DIR
    DirectoryIndex index.html
    <Directory $DIR>
        Require ip $PERMITIR_APACHE
        Options -Indexes
    </Directory>
    <IfModule mod_headers.c>
        <FilesMatch "^(index\.html|revisado\.txt)\$">
            Header set Cache-Control "no-cache, must-revalidate"
        </FilesMatch>
    </IfModule>
    ErrorLog \${APACHE_LOG_DIR}/tempo-pcp.error.log
    CustomLog \${APACHE_LOG_DIR}/tempo-pcp.access.log combined
</VirtualHost>
EOF
  # sin «a2enmod headers»: habilitarlo cambiaría a las otras aplicaciones (sus bloques <IfModule mod_headers.c>)
  if [ -s "$APA_PUERTOS" ] && [ -n "$(tail -c1 "$APA_PUERTOS")" ]; then echo >> "$APA_PUERTOS"; fi
  printf '%s\nListen %s\n' "$MARCA" "$PUERTO" >> "$APA_PUERTOS"
  a2ensite -q tempo-pcp >/dev/null || deshacer "No se pudo activar el sitio en Apache."
  if ! PRUEBA="$(apache2ctl configtest 2>&1)"; then deshacer "La configuración de Apache no pasó la prueba (casi siempre es algo que ya estaba):"$'\n'"$PRUEBA"; fi
  VH="$(apache2ctl -S 2>&1 || true)"
  if ! grep -q ":$PUERTO" <<<"$VH" || ! grep -q "tempo-pcp.conf" <<<"$VH"; then
    deshacer "Este Apache no carga sites-enabled (tiene una configuración propia): no puedo agregar el sitio sin tocar la suya."
  fi
  # recargar Apache abre TODOS sus Listen: si alguno (de otra aplicación, pendiente de recargar) ya lo tiene otro proceso, Apache se apagaría
  for p in $(grep -RhE '^\s*Listen\s' "$APA_PUERTOS" /etc/apache2/conf-enabled /etc/apache2/sites-enabled 2>/dev/null | awk '{print $2}' | sed 's/.*://' | grep -E '^[0-9]+$' | sort -un || true); do
    [ "$p" = "$PUERTO" ] && continue
    D="$(dueno_puerto "$p")"
    if ! dueno_es "$D" apache2; then deshacer "Apache tiene configurado el puerto $p y ahora lo usa otra aplicación:"$'\n'"$D"$'\n'"Recargarlo lo apagaría junto con las otras aplicaciones: no recargo. Que sistemas revise ese Listen."; fi
  done
fi

# ---------- 6 · arrancar o recargar, y comprobar que el servidor web tomó el puerto y sigue funcionando ----------
# justo antes: nadie más puede haber tomado el puerto (la descarga tarda; una aplicación pudo arrancar mientras tanto)
D="$(dueno_puerto "$PUERTO")"
if [ "$PUERTO" = "$ACTUAL" ]; then OK_D="nginx apache2"; else OK_D="$SVC"; fi
# shellcheck disable=SC2086
if ! dueno_es "$D" $OK_D; then deshacer "Otra aplicación tomó el puerto $PUERTO mientras se instalaba:"$'\n'"$D"; fi
# y el servidor web tiene que seguir como estaba al empezar: si alguien lo apagó en este rato, no se enciende
if [ -z "$NGX_ENCENDER" ] && ! systemctl is-active --quiet "$SVC"; then
  deshacer "$SVC estaba funcionando al empezar y ahora no (alguien lo apagó durante la instalación): no lo enciendo."
fi
if [ "$PUERTO" = "$ACTUAL" ] && [ -z "$MUDANZA" ] && [ "$(huella)" = "$HUELLA_ANTES" ] && dueno_es "$D" "$SVC" && [ -n "$D" ]; then
  echo "La configuración no cambió y $SVC ya sirve el puerto $PUERTO: no hace falta recargar."
else
  RECARGADO=1
  if [ -n "$NGX_ENCENDER" ] && ! systemctl is-active --quiet nginx; then
    systemctl enable nginx >/dev/null 2>&1 || true
    systemctl start nginx || deshacer "nginx no arrancó. Detalle:"$'\n'"$(journalctl -u nginx -n 20 --no-pager 2>/dev/null || true)"
  else
    systemctl reload "$SVC" || deshacer "$SVC no pudo recargar la configuración."
  fi
fi
TOMO=""
for _ in 1 2 3 4 5 6; do
  sleep 1
  if systemctl is-active --quiet "$SVC"; then case "$(dueno_puerto "$PUERTO")" in *"\"$SVC\""*) TOMO=1; break;; esac; fi
done
if [ -z "$TOMO" ]; then
  if systemctl is-active --quiet "$SVC"; then deshacer "$SVC sigue funcionando, pero no abrió el puerto $PUERTO."
  else deshacer "$SVC se apagó al recargar (no pudo abrir el puerto $PUERTO)."; fi
fi
trap - INT TERM HUP
rm -rf "$ANTES"
echo "$PUERTO" > "$PUERTO_ARCH"
CODIGO="$(curl --noproxy '*' -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PUERTO/" 2>/dev/null || true)"

# ---------- 7 · actualizador cada 15 minutos y firewall ----------
cat > "$CRON" <<EOF
# TEMPO PCP · revisa cada 15 minutos si hay versión nueva publicada (lo escribió instalar.sh)
*/15 * * * * root $BIN/actualizar.sh >> $LIB/actualizar.log 2>&1
EOF
chmod 0644 "$CRON"

if ufw_activo; then
  ufw_abrir "$PUERTO"
  echo "Firewall (ufw): puerto $PUERTO abierto solo para la red interna."
fi
if [ -n "$ACTUAL" ] && [ "$ACTUAL" != "$PUERTO" ]; then ufw_cerrar "$ACTUAL"; fi

IP="$(ip -4 route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<NF;i++) if($i=="src"){print $(i+1); exit}}' || true)"
[ -n "$IP" ] || IP="$(hostname -I 2>/dev/null | awk '{print $1}' || true)"
URL="http://${IP:-IP-DEL-SERVIDOR}:$PUERTO/"
echo
if [ "$CODIGO" = 200 ]; then echo "== Listo: el sitio responde en el puerto $PUERTO =="
else echo "== Instalado ($SVC tomó el puerto $PUERTO), pero la prueba desde este equipo dio código ${CODIGO:-sin respuesta}. Revisar:  sudo tail /var/log/nginx/tempo-pcp.error.log (o el de Apache) =="; fi
echo "Abrir desde cualquier computadora o tablet de la red:   $URL"
echo "Conviene que este equipo tenga IP fija (o reserva en el DHCP): la dirección que se reparte lleva la IP."
echo "Actualización automática cada 15 minutos (registro: $LIB/actualizar.log). Versiones anteriores: $LIB/anteriores"
echo "«Olvidé mi contraseña»: el enlace del correo lleva a la dirección pública (https); ahí se pone la clave nueva y se vuelve a entrar por $URL."
echo "No registrar esta dirección http en Supabase → Redirect URLs (llevaría el enlace de recuperación por una conexión sin cifrar)."
