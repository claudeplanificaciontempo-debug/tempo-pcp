#!/usr/bin/env bash
# Servidor Ubuntu SIMULADO para probar despliegue-interno/instalar.sh de punta a punta:  bash test/instalador_simulado.sh
# Cada escenario arma una raíz falsa ($R) con /etc, /var, /opt y comandos de mentira (ss, systemctl, nginx, apache2ctl, a2*,
# apt-get, dpkg-query, curl, docker, ufw, ip, hostname, id, readlink, sleep), corre una copia del instalador con las rutas cambiadas
# a $R y revisa qué quedó en disco y qué dijo. Un enlace simbólico se representa con un archivo «SIMLINK:<destino>» (Windows no
# deja crearlos). El simulador es un modelo: nginx/Apache «escuchan» lo que cargaron en su última recarga.
set -u
SRC="${SRC:-$(cd "$(dirname "$0")/.." && pwd)/despliegue-interno/instalar.sh}"
PASA=0; FALLA=0; ESC=""
chk(){ local d="$1"; shift; if "$@" >/dev/null 2>&1; then PASA=$((PASA+1)); else FALLA=$((FALLA+1)); echo "  ✗ [$ESC] $d"; fi; }
nochk(){ local d="$1"; shift; if "$@" >/dev/null 2>&1; then FALLA=$((FALLA+1)); echo "  ✗ [$ESC] $d"; else PASA=$((PASA+1)); fi; }
tiene(){ grep -qE -- "$2" "$1"; }            # archivo contiene (regex)
salida(){ grep -qE -- "$1" "$R/out"; }
activo(){ test -f "$R/state/active_$1"; }
habilitado(){ test -f "$R/state/enabled_$1"; }
cuenta(){ grep -cE -- "$2" "$1" 2>/dev/null || true; }

stubs(){
  mkdir -p "$R/bin" "$R/nbin" "$R/tpl" "$R/state"
  cat > "$R/bin/id" <<'E'
#!/usr/bin/env bash
if [ "${1:-}" = -u ]; then echo 0; else echo "uid=0(root)"; fi
E
  cat > "$R/bin/readlink" <<'E'
#!/usr/bin/env bash
[ "$1" = -f ] && shift
p="$1"
if [ -f "$p" ] && head -c 8 "$p" | grep -q '^SIMLINK:'; then sed 's/^SIMLINK://' "$p"; exit 0; fi
if [ -e "$p" ]; then echo "$(cd "$(dirname "$p")" && pwd)/$(basename "$p")"; exit 0; fi
exit 1
E
  # lo que carga nginx: nginx.conf + conf.d/*.conf + sites-enabled/* (solo si nginx.conf los incluye), resolviendo los «enlaces»
  cat > "$R/bin/ngx_archivos" <<'E'
#!/usr/bin/env bash
c="$R/etc/nginx/nginx.conf"; [ -f "$c" ] || exit 0
if grep -q 'conf.d' "$c"; then for f in "$R"/etc/nginx/conf.d/*.conf; do [ -f "$f" ] && echo "$f"; done; fi
if grep -q 'sites-enabled' "$c"; then for f in "$R"/etc/nginx/sites-enabled/*; do [ -f "$f" ] && echo "$f"; done; fi
exit 0
E
  cat > "$R/bin/leer" <<'E'
#!/usr/bin/env bash
if head -c 8 "$1" 2>/dev/null | grep -q '^SIMLINK:'; then t="$(sed 's/^SIMLINK://' "$1")"; [ -f "$t" ] && cat "$t"; else cat "$1"; fi
E
  cat > "$R/bin/ss" <<'E'
#!/usr/bin/env bash
echo "State  Recv-Q Send-Q Local Address:Port  Peer Address:Port Process"
[ -f "$R/state/ss" ] && cat "$R/state/ss"
# otra aplicación que toma el puerto a mitad de la instalación (después de bajar el sistema)
if [ -f "$R/state/robar" ] && [ -s "$R/var/www/tempo-pcp/index.html" ]; then echo "LISTEN 0 511 0.0.0.0:$(cat "$R/state/robar") 0.0.0.0:* users:((\"node\",pid=99,fd=3))"; fi
# nginx: lo que carga (nuestro sitio, solo después de recargar o arrancar y si «pudo» abrir el puerto)
if [ -f "$R/state/active_nginx" ]; then
  for f in $(ngx_archivos); do
    case "$f" in *tempo-pcp*) { [ -f "$R/state/nginx_no_toma" ] || [ ! -f "$R/state/ngx_recargado" ]; } && continue;; esac
    leer "$f" | awk '/^[[:space:]]*listen[[:space:]]/{gsub(";","",$2); n=split($2,a,":"); print "LISTEN 0 511 0.0.0.0:"a[n]" 0.0.0.0:* users:((\"nginx\",pid=10,fd=6))"}'
  done
fi
# Apache: lo que tomó en su última recarga o arranque (lo pendiente en disco todavía no)
if [ -f "$R/state/active_apache2" ] && [ -f "$R/state/apache_listens" ]; then
  while read -r p; do [ -n "$p" ] && echo "LISTEN 0 511 *:$p *:* users:((\"apache2\",pid=20,fd=4))"; done < "$R/state/apache_listens"
fi
exit 0
E
  cat > "$R/bin/systemctl" <<'E'
#!/usr/bin/env bash
echo "systemctl $*" >> "$R/state/log"
tomar_apache(){ grep -E '^\s*Listen\s' "$R/etc/apache2/ports.conf" 2>/dev/null | awk '{n=split($2,a,":"); print a[n]}' > "$R/state/apache_listens"; }
if [ "$1" = is-active ]; then shift; [ "${1:-}" = --quiet ] && shift
  # alguien apaga nginx mientras se instala (después de bajar el sistema)
  if [ "$1" = nginx ] && [ -f "$R/state/parar_tras_bajar" ] && [ -s "$R/var/www/tempo-pcp/index.html" ]; then rm -f "$R/state/active_nginx" "$R/state/parar_tras_bajar"; fi
  [ -f "$R/state/active_$1" ]; exit $?; fi
if [ "$1" = is-enabled ]; then shift; [ "${1:-}" = --quiet ] && shift; [ -f "$R/state/enabled_$1" ]; exit $?; fi
case "$1" in
  reload) [ -f "$R/state/active_$2" ] || exit 1; [ -f "$R/state/fail_reload_$2" ] && exit 1
          # Apache real: el «graceful» devuelve 0 y, si no puede abrir un puerto, el proceso se apaga después
          if [ "$2" = apache2 ] && [ -f "$R/state/apache_muere" ]; then rm -f "$R/state/active_apache2" "$R/state/apache_muere"; exit 0; fi
          [ "$2" = apache2 ] && tomar_apache
          [ "$2" = nginx ] && touch "$R/state/ngx_recargado"
          exit 0;;
  start)  [ -f "$R/state/fail_start_$2" ] && exit 1; touch "$R/state/active_$2"
          [ "$2" = nginx ] && touch "$R/state/ngx_recargado"; [ "$2" = apache2 ] && tomar_apache; exit 0;;
  stop)   rm -f "$R/state/active_$2"; exit 0;;
  enable) touch "$R/state/enabled_$2"; exit 0;;
  disable) if [ "$2" = --now ]; then rm -f "$R/state/active_$3" "$R/state/enabled_$3"; else rm -f "$R/state/enabled_$2"; fi; exit 0;;
  *) exit 0;;
esac
E
  cat > "$R/bin/journalctl" <<'E'
#!/usr/bin/env bash
echo "(registro de nginx simulado)"
E
  cat > "$R/bin/sleep" <<'E'
#!/usr/bin/env bash
# puede simular un Ctrl-C / SIGTERM al instalador justo cuando espera
if [ -f "$R/state/interrumpir" ]; then rm -f "$R/state/interrumpir"; kill -TERM "$PPID"; fi
exit 0
E
  cat > "$R/bin/dpkg-query" <<'E'
#!/usr/bin/env bash
[ -f "$R/state/md5_default" ] || exit 1
echo " $R/etc/nginx/sites-available/default $(cat "$R/state/md5_default")"
E
  cat > "$R/bin/ip" <<'E'
#!/usr/bin/env bash
echo "1.1.1.1 via 192.168.1.1 dev eth0 src 192.168.1.50 uid 0"
E
  cat > "$R/bin/hostname" <<'E'
#!/usr/bin/env bash
echo "172.17.0.1 192.168.1.50"
E
  cat > "$R/bin/curl" <<'E'
#!/usr/bin/env bash
echo "curl $*" >> "$R/state/log"
out=""; w=""; url=""
while [ $# -gt 0 ]; do case "$1" in -o) out="$2"; shift 2;; -w) w="$2"; shift 2;; --noproxy) shift 2;; -*) shift;; *) url="$1"; shift;; esac; done
if [ -n "$w" ]; then if [ -f "$R/state/http_code" ]; then cat "$R/state/http_code"; else printf 200; fi; exit 0; fi
[ -f "$R/state/nointernet" ] && exit 6
case "$url" in *raw.githubusercontent.com*index.html)
  b="2026-09-24 10:00"; [ -f "$R/state/build" ] && b="$(cat "$R/state/build")"
  if [ -f "$R/state/incompleto" ]; then printf "<html><script>const APP_BUILD='x';</script></html>\n<script>let a=1;" > "$out"
  else printf "<html><script>const APP_BUILD='%s';</script></html>\n" "$b" > "$out"; fi; exit 0;; esac
exit 22
E
  cat > "$R/bin/apt-get" <<'E'
#!/usr/bin/env bash
echo "apt-get $* NEEDRESTART_MODE=${NEEDRESTART_MODE:-}" >> "$R/state/log"
case " $* " in *" update "*) [ -f "$R/state/fail_update" ] && exit 100; [ -f "$R/state/nointernet" ] && exit 100; exit 0;; esac
[ -f "$R/state/nointernet" ] && exit 100
[ -f "$R/state/fail_install" ] && exit 100
for p in "$@"; do case "$p" in
 nginx)
   if [ -e "$R/usr/sbin/policy-rc.d" ]; then echo "INSTALA-NGINX con policy-rc.d" >> "$R/state/log"; else echo "INSTALA-NGINX SIN policy-rc.d" >> "$R/state/log"; touch "$R/state/active_nginx"; fi
   mkdir -p "$R/etc/nginx/sites-available" "$R/etc/nginx/sites-enabled" "$R/etc/nginx/conf.d"
   printf 'http {\n    include /etc/nginx/conf.d/*.conf;\n    include /etc/nginx/sites-enabled/*;\n}\n' > "$R/etc/nginx/nginx.conf"
   printf 'server {\n    listen 80 default_server;\n    listen [::]:80 default_server;\n    root /var/www/html;\n}\n' > "$R/etc/nginx/sites-available/default"
   md5sum "$R/etc/nginx/sites-available/default" | cut -c1-32 > "$R/state/md5_default"
   echo "SIMLINK:$R/etc/nginx/sites-available/default" > "$R/etc/nginx/sites-enabled/default"
   touch "$R/state/enabled_nginx"    # el paquete habilita el servicio (deb-systemd-helper) aunque no lo arranque
   cp "$R/tpl/nginx" "$R/nbin/nginx";;
esac; done
exit 0
E
  cat > "$R/tpl/nginx" <<'E'
#!/usr/bin/env bash
echo "nginx $*" >> "$R/state/log"
case "${1:-}" in
  -t) [ -f "$R/state/fail_nginx_t" ] && { echo "nginx: [emerg] algo roto en otra configuración"; exit 1; }
      echo "nginx: configuration file test is successful"; exit 0;;
  -T) [ -f "$R/state/fail_nginx_t" ] && exit 1
      echo "# configuration file $R/etc/nginx/nginx.conf:"; cat "$R/etc/nginx/nginx.conf"
      for f in $(ngx_archivos); do echo "# configuration file $f:"; leer "$f"; done; exit 0;;
esac
exit 0
E
  cat > "$R/tpl/apache2ctl" <<'E'
#!/usr/bin/env bash
echo "apache2ctl $*" >> "$R/state/log"
if [ "${1:-}" = -S ]; then
  [ -f "$R/state/apache_sin_sites" ] && exit 0
  for f in "$R"/etc/apache2/sites-enabled/*; do [ -f "$f" ] || continue; grep -oE '<VirtualHost[^>]*>' "$f" | grep -oE ':[0-9]+' | while read -r p; do echo "*$p   localhost ($f:2)"; done; done; exit 0
fi
[ -f "$R/state/fail_apache_t" ] && { echo "AH00526: Syntax error (simulado)"; exit 1; }
p="$R/etc/apache2/ports.conf"
# Apache real: Listen admite 1 o 2 argumentos (sin comentario al final) y no admite el mismo puerto dos veces
if grep -E '^\s*Listen\s' "$p" | awk 'NF>3{bad=1} END{exit bad?0:1}'; then echo "AH00526: Listen takes one or two arguments"; exit 1; fi
if [ -n "$(grep -E '^\s*Listen\s' "$p" | awk '{print $2}' | sort | uniq -d)" ]; then echo "AH00072: make_sock: could not bind to address"; exit 1; fi
for f in "$R"/etc/apache2/sites-enabled/*; do [ -f "$f" ] || continue
  # «Header» fuera de <IfModule mod_headers.c> sin el módulo = error
  if awk '/<IfModule mod_headers.c>/{d++} /<\/IfModule>/{if(d)d--} /Header set/{if(!d)bad=1} END{exit bad?0:1}' "$f" && [ ! -e "$R/etc/apache2/mods-enabled/headers.load" ]; then echo "Invalid command 'Header'"; exit 1; fi; done
echo "Syntax OK"; exit 0
E
  cat > "$R/tpl/a2ensite" <<'E'
#!/usr/bin/env bash
echo "a2ensite $*" >> "$R/state/log"; s="${@: -1}"
[ -f "$R/etc/apache2/sites-available/$s.conf" ] || exit 1
cp "$R/etc/apache2/sites-available/$s.conf" "$R/etc/apache2/sites-enabled/$s.conf"
E
  cat > "$R/tpl/a2dissite" <<'E'
#!/usr/bin/env bash
echo "a2dissite $*" >> "$R/state/log"; s="${@: -1}"
[ -e "$R/etc/apache2/sites-enabled/$s.conf" ] || exit 1
rm -f "$R/etc/apache2/sites-enabled/$s.conf"
E
  for c in a2enmod a2dismod; do printf '#!/usr/bin/env bash\necho "%s $*" >> "$R/state/log"\n' "$c" > "$R/tpl/$c"; done
  cat > "$R/tpl/docker" <<'E'
#!/usr/bin/env bash
echo "docker $*" >> "$R/state/log"
case "$1" in ps) [ -f "$R/state/docker_ports" ] && echo abc123;; inspect) cat "$R/state/docker_ports";; esac
exit 0
E
  cat > "$R/tpl/ufw" <<'E'
#!/usr/bin/env bash
if [ "$1" = status ]; then if [ -f "$R/state/ufw_active" ]; then echo "Status: active"; else echo "Status: inactive"; fi; exit 0; fi
echo "ufw $*" >> "$R/state/ufw"
case "$1" in allow) if [ -f "$R/state/ufw_skip" ]; then echo "Skipping adding existing rule"; else echo "Rule added"; fi;; esac
E
  chmod +x "$R"/bin/* "$R"/tpl/*
}

nuevo(){ # $1 = nombre del escenario
  ESC="$1"; R="$(mktemp -d)"; export R
  mkdir -p "$R/etc/cron.d" "$R/var" "$R/opt" "$R/usr/sbin"
  stubs
  sed -e "s#/etc/#$R/etc/#g" -e "s#/var/#$R/var/#g" -e "s#/opt/#$R/opt/#g" -e "s#/usr/sbin/#$R/usr/sbin/#g" \
      -e 's/\[ -L "\$NGX_DEFAULT" \]/es_enlace "$NGX_DEFAULT"/g' -e 's/\[ ! -L "\$NGX_DEFAULT" \]/! es_enlace "$NGX_DEFAULT"/g' \
      -e '0,/^set -euo pipefail$/s//set -euo pipefail\nes_enlace(){ [ -f "$1" ] || return 1; head -c 8 "$1" | grep -q "^SIMLINK:"; }/' "$SRC" > "$R/instalar.sh"
}
con_nginx(){ # $1 = activo | apagado    $2 = conf.d | sites (qué incluye nginx.conf; por defecto los dos, como Ubuntu)
  mkdir -p "$R/etc/nginx/sites-available" "$R/etc/nginx/sites-enabled" "$R/etc/nginx/conf.d"
  case "${2:-}" in
    sites) printf 'http {\n    include /etc/nginx/sites-enabled/*;\n}\n' > "$R/etc/nginx/nginx.conf";;
    *)     printf 'http {\n    include /etc/nginx/conf.d/*.conf;\n    include /etc/nginx/sites-enabled/*;\n}\n' > "$R/etc/nginx/nginx.conf";;
  esac
  printf 'server {\n    listen 80 default_server;\n    root /var/www/html;\n}\n' > "$R/etc/nginx/sites-available/default"
  md5sum "$R/etc/nginx/sites-available/default" | cut -c1-32 > "$R/state/md5_default"
  cp "$R/tpl/nginx" "$R/nbin/nginx"
  if [ "$1" = activo ]; then touch "$R/state/active_nginx" "$R/state/enabled_nginx"; fi
  return 0
}
enlace_default(){ echo "SIMLINK:$R/etc/nginx/sites-available/default" > "$R/etc/nginx/sites-enabled/default"; }
con_apache(){ # $1 = contenido de ports.conf (lo que Apache ya escucha)
  mkdir -p "$R/etc/apache2/sites-available" "$R/etc/apache2/sites-enabled" "$R/etc/apache2/conf-enabled" "$R/etc/apache2/mods-enabled"
  printf '%s' "$1" > "$R/etc/apache2/ports.conf"
  for c in apache2ctl a2ensite a2dissite a2enmod a2dismod; do cp "$R/tpl/$c" "$R/nbin/$c"; done
  touch "$R/state/active_apache2" "$R/state/enabled_apache2"
  grep -E '^\s*Listen\s' "$R/etc/apache2/ports.conf" | awk '{n=split($2,a,":"); print a[n]}' > "$R/state/apache_listens"
}
con(){ cp "$R/tpl/$1" "$R/nbin/$1"; }
# se corre con --si, salvo al probar la pregunta (TTY_SIM=archivo con la respuesta) o la falta de terminal (TTY_SIM=ninguna)
correr(){ local si=--si; [ -n "${TTY_SIM:-}" ] && si=""
  TEMPO_TTY="${TTY_SIM:-$R/sin-terminal}" PATH="$R/bin:$R/nbin:$PATH" bash "$R/instalar.sh" "$@" $si > "$R/out" 2>&1; RC=$?; }
ver(){ echo "----- salida [$ESC] rc=$RC"; cat "$R/out"; }
SITIO() { echo "$R/etc/nginx/conf.d/tempo-pcp.conf"; }

# ============ escenarios ============

nuevo "S1 sin servidor web; 80 y 8080 ocupados por las otras apps"
printf 'LISTEN 0 511 0.0.0.0:80 0.0.0.0:* users:(("node",pid=5,fd=3))\nLISTEN 0 511 [::]:8080 [::]:*\nLISTEN 0 4096 127.0.0.53%%lo:53 0.0.0.0:*\n' > "$R/state/ss"
correr
chk "termina bien" test $RC -eq 0
chk "elige 8790" salida "Puerto elegido: 8790"
chk "dice qué puertos vio ocupados" salida "otras aplicaciones de este equipo: 53,80,8080"
chk "nginx se instala con policy-rc.d puesto" tiene "$R/state/log" "INSTALA-NGINX con policy-rc.d"
chk "apt sin reiniciar otros servicios ni quitar paquetes" tiene "$R/state/log" "install -y -qq --no-remove nginx NEEDRESTART_MODE=l"
chk "policy-rc.d se quita después" test ! -e "$R/usr/sbin/policy-rc.d"
chk "aparta el sitio de ejemplo del 80" test ! -e "$R/etc/nginx/sites-enabled/default"
chk "y lo guarda" test -f "$R/var/lib/tempo-pcp/respaldo/nginx-sites-enabled-default"
chk "sitio en conf.d, puerto 8790" tiene "$(SITIO)" "^    listen 8790;$"
chk "solo red interna" tiene "$(SITIO)" "allow 192.168.0.0/16;"
chk "IPv6 interna también" tiene "$(SITIO)" "allow fc00::/7;"
chk "deny all" tiene "$(SITIO)" "deny all;"
chk "try_files con \$uri literal" tiene "$(SITIO)" 'try_files \$uri \$uri/ /index.html;'
chk "latido sin caché" tiene "$(SITIO)" "location = /revisado.txt"
chk "arranca nginx" tiene "$R/state/log" "systemctl start nginx"
chk "nginx quedó escuchando el 8790" bash -c "PATH='$R/bin:$R/nbin:$PATH' ss -ltnp | grep -q ':8790 .*nginx'"
chk "baja el sistema" tiene "$R/var/www/tempo-pcp/index.html" "APP_BUILD="
chk "deja el latido" tiene "$R/var/www/tempo-pcp/revisado.txt" "^[0-9]{9,11}$"
chk "cron cada 15 min" tiene "$R/etc/cron.d/tempo-pcp" '^\*/15 \* \* \* \* root .*/opt/tempo-pcp/actualizar.sh'
chk "anota que nginx lo instaló él" tiene "$R/var/lib/tempo-pcp/estado" "^NGX_INSTALADO=1$"
chk "guarda el puerto" tiene "$R/var/lib/tempo-pcp/puerto" "^8790$"
chk "no deja copia de «antes» (primera instalación)" test ! -e "$R/var/lib/tempo-pcp/antes"
chk "dirección con la IP de la red (no la de Docker)" salida "http://192.168.1.50:8790/"
chk "dice que responde" salida "Listo: el sitio responde en el puerto 8790"
chk "prueba local sin pasar por el proxy" tiene "$R/state/log" "curl --noproxy"
chk "pide NO registrar la dirección http en Supabase" salida "No registrar esta dirección http"
chk "no toca ufw (inactivo)" test ! -f "$R/state/ufw"
[ $RC -ne 0 ] && ver
S1R="$R"

nuevo "S2 nginx activo (80 y 8080); otros sitios declaran 8790 y un proxy apunta al 8791; un servicio usa el 8792; ufw activo"
con_nginx activo; con ufw; touch "$R/state/ufw_active"; enlace_default
printf 'server {\n    listen 8080;\n    location / { proxy_pass http://127.0.0.1:8791; }\n}\n' > "$R/etc/nginx/sites-enabled/app2"
printf 'server {\n    listen 127.0.0.1:8790 ssl;\n}\n' > "$R/etc/nginx/sites-enabled/app3"
mkdir -p "$R/etc/systemd/system"; printf '[Service]\nExecStart=/usr/bin/node server.js --port 8792\n' > "$R/etc/systemd/system/app.service"
correr
chk "termina bien" test $RC -eq 0
chk "salta 8790 (listen), 8791 (proxy) y 8792 (servicio): elige 8793" salida "Puerto elegido: 8793"
chk "NO aparta el sitio default de un nginx que ya funcionaba" test -e "$R/etc/nginx/sites-enabled/default"
chk "recarga (no reinicia) nginx" tiene "$R/state/log" "systemctl reload nginx"
nochk "no hace start" tiene "$R/state/log" "systemctl start nginx"
nochk "no instala nada" tiene "$R/state/log" "apt-get"
chk "ufw abre 8793 solo a redes privadas" tiene "$R/state/ufw" "allow from 192.168.0.0/16 to any port 8793 proto tcp"
chk "anota las reglas que agregó" tiene "$R/var/lib/tempo-pcp/ufw" "^192.168.0.0/16 8793$"
nochk "ufw no recibe loopback" tiene "$R/state/ufw" "127.0.0.1"
nochk "ufw no recibe IPv6" tiene "$R/state/ufw" "fc00"
[ $RC -ne 0 ] && ver

nuevo "S3 Apache activo con Listen 80 y 8080 (ports.conf sin salto final)"
con_apache $'Listen 80\n<IfModule ssl_module>\n\tListen 443\n</IfModule>\nListen 8080'
ORIG="$(cat "$R/etc/apache2/ports.conf")"
correr
chk "termina bien" test $RC -eq 0
chk "elige 8790" salida "Puerto elegido: 8790"
chk "ports.conf conserva la última línea intacta" tiene "$R/etc/apache2/ports.conf" "^Listen 8080$"
chk "marca en su propia línea" tiene "$R/etc/apache2/ports.conf" "^# tempo-pcp$"
chk "Listen 8790 sin comentario al final" tiene "$R/etc/apache2/ports.conf" "^Listen 8790$"
nochk "NO habilita mod_headers (cambiaría a las otras apps)" tiene "$R/state/log" "a2enmod"
chk "Cache-Control dentro de <IfModule>" tiene "$R/etc/apache2/sites-available/tempo-pcp.conf" "<IfModule mod_headers.c>"
chk "vhost en 8790" tiene "$R/etc/apache2/sites-available/tempo-pcp.conf" "<VirtualHost \*:8790>"
chk "Require ip redes privadas" tiene "$R/etc/apache2/sites-available/tempo-pcp.conf" "Require ip 10.0.0.0/8 172.16.0.0/12 192.168.0.0/16 127.0.0.1 ::1 fc00::/7 fe80::/10"
chk "APACHE_LOG_DIR literal" tiene "$R/etc/apache2/sites-available/tempo-pcp.conf" '\$\{APACHE_LOG_DIR\}/tempo-pcp.error.log'
chk "FilesMatch con el punto escapado" tiene "$R/etc/apache2/sites-available/tempo-pcp.conf" 'index\\.html\|revisado\\.txt\)\$'
chk "comprueba que Apache cargó el sitio" tiene "$R/state/log" "apache2ctl -S"
chk "recarga Apache" tiene "$R/state/log" "systemctl reload apache2"
chk "Apache sigue funcionando" activo apache2
nochk "no instala nginx" tiene "$R/state/log" "apt-get"
[ $RC -ne 0 ] && ver
S3R="$R"

ESC="S3b --quitar sobre Apache"; R="$S3R"; export R
correr --quitar
chk "termina bien" test $RC -eq 0
chk "ports.conf vuelve a lo de antes" test "$(cat "$R/etc/apache2/ports.conf")" = "$ORIG"
chk "sitio fuera" test ! -e "$R/etc/apache2/sites-available/tempo-pcp.conf"
chk "sitio desactivado" test ! -e "$R/etc/apache2/sites-enabled/tempo-pcp.conf"
chk "cron fuera" test ! -e "$R/etc/cron.d/tempo-pcp"
chk "dice el puerto" salida "sitio del puerto 8790 se quitó"
chk "Apache sigue funcionando" activo apache2
chk "y lo puede decir" salida "Las otras aplicaciones no se tocaron"

nuevo "S4 puerto indicado a mano y ocupado (8080)"
printf 'LISTEN 0 511 0.0.0.0:80 0.0.0.0:*\nLISTEN 0 511 0.0.0.0:8080 0.0.0.0:* users:(("java",pid=7,fd=9))\n' > "$R/state/ss"
correr 8080
chk "no sigue" test $RC -eq 1
chk "muestra quién lo usa" salida "java"
chk "sugiere 8790" salida "sudo bash .* 8790"
chk "no baja nada" test ! -e "$R/var/www/tempo-pcp"
chk "no crea cron" test ! -e "$R/etc/cron.d/tempo-pcp"
nochk "no instala nada" tiene "$R/state/log" "apt-get"

ESC="S5 volver a correrlo sin número (sobre S1)"; R="$S1R"; export R
correr
chk "termina bien" test $RC -eq 0
chk "reusa el 8790" salida "Ya estaba instalado en el puerto 8790"
chk "sigue en 8790" tiene "$(SITIO)" "listen 8790;"
chk "no pisa el «antes» de la primera instalación" tiene "$R/var/lib/tempo-pcp/estado" "^NGX_INSTALADO=1$"
chk "sin cambios no recarga" salida "no hace falta recargar"
chk "y borra la copia de «antes» al terminar bien" test ! -e "$R/var/lib/tempo-pcp/antes"
[ $RC -ne 0 ] && ver

ESC="S6 volver a correrlo con otro puerto (8795) y ufw activo"; con ufw; touch "$R/state/ufw_active"
correr
chk "abre el 8790 en ufw" tiene "$R/var/lib/tempo-pcp/ufw" "^10.0.0.0/8 8790$"
correr 8795
chk "termina bien" test $RC -eq 0
chk "pasa a 8795" tiene "$(SITIO)" "listen 8795;"
nochk "ya no hay 8790" tiene "$(SITIO)" "listen 8790;"
chk "ufw abre 8795" tiene "$R/state/ufw" "allow from 10.0.0.0/8 to any port 8795"
chk "ufw cierra el 8790 viejo (lo había abierto él)" tiene "$R/state/ufw" "delete allow from 10.0.0.0/8 to any port 8790"
nochk "y lo olvida" tiene "$R/var/lib/tempo-pcp/ufw" " 8790$"
[ $RC -ne 0 ] && ver

ESC="S6b --quitar sobre el nginx que instaló él (sin otros sitios)"
correr --quitar
chk "termina bien" test $RC -eq 0
chk "sitio fuera" test ! -e "$(SITIO)"
chk "ufw cierra 8795" tiene "$R/state/ufw" "delete allow from 172.16.0.0/12 to any port 8795"
chk "nginx queda apagado" test ! -f "$R/state/active_nginx"
chk "y deshabilitado" test ! -f "$R/state/enabled_nginx"
chk "lo dice" salida "lo había instalado este instalador"
chk "no borra el sistema bajado" test -e "$R/var/www/tempo-pcp/index.html"

nuevo "S7 nginx -t falla por algo de otra app"
con_nginx activo; touch "$R/state/fail_nginx_t"
correr
chk "no sigue" test $RC -eq 1
chk "quita su sitio" test ! -e "$(SITIO)"
nochk "no recarga nginx (el reload fallaría igual)" tiene "$R/state/log" "systemctl reload nginx"
chk "no deja cron" test ! -e "$R/etc/cron.d/tempo-pcp"
chk "muestra el error" salida "algo roto en otra configuración"
chk "nginx sigue funcionando" activo nginx

nuevo "S8 sin internet"
touch "$R/state/nointernet"
correr
chk "no sigue" test $RC -eq 1
chk "lo dice" salida "No se pudo bajar el sistema"
nochk "no instala nginx" tiene "$R/state/log" "install -y -qq"
chk "no crea el sitio" test ! -e "$(SITIO)"
chk "no crea cron" test ! -e "$R/etc/cron.d/tempo-pcp"

nuevo "S8b descarga cortada (el cierre no está al final)"
touch "$R/state/incompleto"
correr
chk "no sigue" test $RC -eq 1
chk "no deja index.html a medias" test ! -e "$R/var/www/tempo-pcp/index.html"
chk "no crea el sitio" test ! -e "$(SITIO)"

nuevo "S9 nginx instalado APAGADO con otro sitio"
con_nginx apagado
printf 'server {\n    listen 3000;\n}\n' > "$R/etc/nginx/sites-enabled/otra-app"
correr
chk "no sigue" test $RC -eq 1
chk "lo explica" salida "otros sitios configurados"
nochk "no enciende nginx" tiene "$R/state/log" "systemctl start nginx"
chk "no crea el sitio" test ! -e "$(SITIO)"
chk "no baja nada (se detiene antes)" test ! -e "$R/var/www/tempo-pcp/index.html"

nuevo "S10 nginx instalado apagado, solo el sitio de ejemplo (enlace del paquete, sin editar)"
con_nginx apagado; enlace_default
printf 'LISTEN 0 511 0.0.0.0:80 0.0.0.0:* users:(("node",pid=5,fd=3))\n' > "$R/state/ss"
correr
chk "termina bien" test $RC -eq 0
chk "aparta el ejemplo del 80" test ! -e "$R/etc/nginx/sites-enabled/default"
chk "enciende nginx" tiene "$R/state/log" "systemctl start nginx"
nochk "no reinstala" tiene "$R/state/log" "apt-get"
chk "anota que lo encendió él" tiene "$R/var/lib/tempo-pcp/estado" "^NGX_ENCENDIDO=1$"
[ $RC -ne 0 ] && ver
ESC="S10b --quitar devuelve nginx como estaba (apagado, deshabilitado, con su ejemplo)"
correr --quitar
chk "termina bien" test $RC -eq 0
chk "devuelve el sitio de ejemplo" tiene "$R/etc/nginx/sites-enabled/default" "^SIMLINK:"
chk "nginx apagado" test ! -f "$R/state/active_nginx"
chk "nginx deshabilitado (no lo estaba)" test ! -f "$R/state/enabled_nginx"

nuevo "S11 Docker funcionando reserva el 8790 (contenedor apagado)"
con docker; touch "$R/state/active_docker"; printf '8790\n\n5432\n' > "$R/state/docker_ports"
correr
chk "termina bien" test $RC -eq 0
chk "elige 8791" salida "Puerto elegido: 8791"
chk "le preguntó a Docker" tiene "$R/state/log" "docker ps -aq"
[ $RC -ne 0 ] && ver

nuevo "S11b Docker APAGADO: no se lo despierta; se leen sus archivos"
con docker
mkdir -p "$R/var/lib/docker/containers/abc123"; printf '{"PortBindings":{"80/tcp":[{"HostIp":"","HostPort":"8790"}]}}' > "$R/var/lib/docker/containers/abc123/hostconfig.json"
correr
chk "termina bien" test $RC -eq 0
chk "ve el 8790 reservado: elige 8791" salida "Puerto elegido: 8791"
nochk "NO llama a docker (lo despertaría)" tiene "$R/state/log" "^docker "

nuevo "S12 Apache: configtest falla por otra cosa"
con_apache $'Listen 80\nListen 8080\n'; touch "$R/state/fail_apache_t"
ORIG="$(cat "$R/etc/apache2/ports.conf")"
correr
chk "no sigue" test $RC -eq 1
chk "ports.conf queda como estaba" test "$(cat "$R/etc/apache2/ports.conf")" = "$ORIG"
chk "sitio fuera" test ! -e "$R/etc/apache2/sites-available/tempo-pcp.conf"
chk "sitio desactivado" test ! -e "$R/etc/apache2/sites-enabled/tempo-pcp.conf"
nochk "no recarga Apache" tiene "$R/state/log" "systemctl reload apache2"
chk "Apache sigue funcionando" activo apache2

nuevo "S13 ss con IPv6 y comodín ocupando 8790, 8791 y 8792"
printf 'LISTEN 0 4096 [::]:8790 [::]:*\nLISTEN 0 128 *:8791 *:*\nLISTEN 0 128 [fe80::1%%eth0]:8792 [::]:*\n' > "$R/state/ss"
correr
chk "elige 8793" salida "Puerto elegido: 8793"

nuevo "S14 número con cero adelante"
correr 08795
chk "termina bien" test $RC -eq 0
chk "usa 8795" tiene "$(SITIO)" "listen 8795;"

nuevo "S15 puerto que no es número / opción rara"
correr 80a
chk "no sigue" test $RC -eq 1
chk "lo dice" salida "tiene que ser un número"
correr --lo-que-sea
chk "opción desconocida: no sigue" test $RC -eq 1

nuevo "S16 Apache: reinstalar en el mismo puerto no duplica el Listen"
con_apache $'Listen 80\nListen 8080\n'
correr; correr
chk "termina bien la segunda vez" test $RC -eq 0
chk "reusa el puerto" salida "Ya estaba instalado en el puerto 8790"
chk "un solo Listen 8790" test "$(grep -c '^Listen 8790$' "$R/etc/apache2/ports.conf")" -eq 1
chk "una sola marca" test "$(grep -c '^# tempo-pcp$' "$R/etc/apache2/ports.conf")" -eq 1
chk "sin cambios no recarga otra vez" test "$(cuenta "$R/state/log" "systemctl reload apache2")" -eq 1
[ $RC -ne 0 ] && ver

nuevo "S17 el sitio no responde 200 (p. ej. permisos): queda instalado con aviso"
echo 403 > "$R/state/http_code"
correr
chk "termina (con aviso)" test $RC -eq 0
chk "avisa el código" salida "código 403"

nuevo "S18 nginx no arranca"
touch "$R/state/fail_start_nginx"
correr
chk "no sigue" test $RC -eq 1
chk "quita su sitio" test ! -e "$(SITIO)"
chk "no deja cron" test ! -e "$R/etc/cron.d/tempo-pcp"
chk "deja nginx deshabilitado (lo instaló este intento)" test ! -f "$R/state/enabled_nginx"
chk "conserva el «antes» (instaló nginx)" tiene "$R/var/lib/tempo-pcp/estado" "^NGX_INSTALADO=1$"

nuevo "S19 Apache se apaga al recargar (no pudo abrir el puerto): se deshace y vuelve a levantar"
con_apache $'Listen 80\nListen 8080\n'; touch "$R/state/apache_muere"
ORIG="$(cat "$R/etc/apache2/ports.conf")"
correr
chk "no sigue" test $RC -eq 1
chk "lo dice" salida "se apagó al recargar"
chk "ports.conf queda como estaba" test "$(cat "$R/etc/apache2/ports.conf")" = "$ORIG"
chk "sitio fuera" test ! -e "$R/etc/apache2/sites-enabled/tempo-pcp.conf"
chk "vuelve a levantar Apache" tiene "$R/state/log" "systemctl start apache2"
chk "Apache funcionando otra vez" activo apache2
chk "y lo confirma" salida "Apache sigue funcionando con las otras aplicaciones"
chk "no deja cron" test ! -e "$R/etc/cron.d/tempo-pcp"
chk "no toca ufw" test ! -f "$R/state/ufw"

nuevo "S20 otra aplicación toma el puerto mientras se instala"
con_nginx activo; echo 8790 > "$R/state/robar"
correr
chk "no sigue" test $RC -eq 1
chk "lo dice" salida "Otra aplicación tomó el puerto 8790"
nochk "no recarga nginx" tiene "$R/state/log" "systemctl reload nginx"
chk "quita su sitio" test ! -e "$(SITIO)"
chk "no deja cron" test ! -e "$R/etc/cron.d/tempo-pcp"

nuevo "S21 nginx que no carga conf.d (configuración propia)"
con_nginx activo sites
correr
chk "no sigue" test $RC -eq 1
chk "lo explica" salida "no carga .*etc/nginx/conf.d"
chk "quita su sitio" test ! -e "$(SITIO)"
nochk "no recarga" tiene "$R/state/log" "systemctl reload nginx"

nuevo "S22 nginx apagado con un «default» que es un archivo (no el enlace del paquete)"
con_nginx apagado
printf 'server {\n    listen 80;\n    root /srv/app-de-otro;\n}\n' > "$R/etc/nginx/sites-enabled/default"
correr
chk "no sigue" test $RC -eq 1
chk "lo nombra" salida "no es el de ejemplo del paquete"
chk "no toca el default" tiene "$R/etc/nginx/sites-enabled/default" "app-de-otro"

nuevo "S22b nginx apagado con el enlace del paquete pero el ejemplo EDITADO (sirve a otra app)"
con_nginx apagado; enlace_default
printf '    location / { proxy_pass http://127.0.0.1:3000; }\n' >> "$R/etc/nginx/sites-available/default"
correr
chk "no sigue" test $RC -eq 1
chk "lo nombra" salida "está editado"
chk "no aparta el default" tiene "$R/etc/nginx/sites-enabled/default" "^SIMLINK:"
nochk "no enciende nginx" tiene "$R/state/log" "systemctl start nginx"

nuevo "S22c un nginx funcionando fuera de systemd (arrancado a mano)"
printf 'LISTEN 0 511 0.0.0.0:80 0.0.0.0:* users:(("nginx",pid=33,fd=6))\n' > "$R/state/ss"
correr
chk "no sigue" test $RC -eq 1
chk "lo explica" salida "fuera de systemd"
nochk "no instala ni enciende nada" tiene "$R/state/log" "apt-get|systemctl start"

nuevo "S23 pregunta antes de tocar nada"
printf 'n\n' > "$R/tty"; TTY_SIM="$R/tty" correr
chk "con «n» no sigue" test $RC -eq 1
chk "no baja nada" test ! -e "$R/var/www/tempo-pcp/index.html"
chk "muestra el puerto en la pregunta" salida "Instalo TEMPO PCP en el puerto 8790"
printf 'q\n' > "$R/tty"; TTY_SIM="$R/tty" correr
chk "con «q» (no es un sí) no sigue" test $RC -eq 1
: > "$R/tty"; TTY_SIM="$R/tty" correr
chk "con Ctrl-D (sin respuesta) no sigue" test $RC -eq 1
TTY_SIM=ninguna correr
chk "sin terminal y sin --si no sigue" test $RC -eq 1
chk "dice cómo correrlo" salida "8790 --si"
printf '\n' > "$R/tty"; TTY_SIM="$R/tty" correr
chk "con Enter sigue" test $RC -eq 0
[ $RC -ne 0 ] && ver

nuevo "S24 instalación de la versión anterior (sites-available): se muda a conf.d en el mismo puerto"
con_nginx activo; enlace_default
printf 'server {\n    listen 8090;\n    root /var/www/tempo-pcp;\n}\n' > "$R/etc/nginx/sites-available/tempo-pcp"
cp "$R/etc/nginx/sites-available/tempo-pcp" "$R/etc/nginx/sites-enabled/tempo-pcp"
correr
chk "termina bien" test $RC -eq 0
chk "reusa el 8090 que ya tenía" salida "Ya estaba instalado en el puerto 8090"
chk "sitio nuevo en conf.d" tiene "$(SITIO)" "listen 8090;"
chk "quita los archivos viejos" test ! -e "$R/etc/nginx/sites-available/tempo-pcp" -a ! -e "$R/etc/nginx/sites-enabled/tempo-pcp"
[ $RC -ne 0 ] && ver

nuevo "S25 nginx recarga pero no abre el puerto"
con_nginx activo; touch "$R/state/nginx_no_toma"
correr
chk "no sigue" test $RC -eq 1
chk "lo dice" salida "no abrió el puerto 8790"
chk "quita su sitio" test ! -e "$(SITIO)"
chk "nginx sigue funcionando" activo nginx

nuevo "S26 «apt-get update» falla (repositorio de otra app) pero nginx se instala"
touch "$R/state/fail_update"
correr
chk "termina bien" test $RC -eq 0
chk "avisa del update" salida "apt-get update» falló"
[ $RC -ne 0 ] && ver
nuevo "S26b no se puede instalar nginx"
touch "$R/state/fail_install"
correr
chk "no sigue" test $RC -eq 1
chk "lo dice" salida "No se pudo instalar nginx"
chk "no crea el sitio" test ! -e "$(SITIO)"
chk "quita policy-rc.d" test ! -e "$R/usr/sbin/policy-rc.d"

nuevo "S27 el puerto de la instalación anterior ahora es de otra app: elige otro"
con_nginx activo
printf 'server {\n    listen 8790;\n    root /var/www/tempo-pcp;\n}\n' > "$R/etc/nginx/conf.d/tempo-pcp.conf"
touch "$R/state/nginx_no_toma"   # nginx no lo escucha…
printf 'LISTEN 0 511 0.0.0.0:8790 0.0.0.0:* users:(("node",pid=9,fd=3))\n' > "$R/state/ss"   # …lo tiene otra
correr
chk "avisa que cambia" salida "Estaba en el puerto 8790, pero ahora lo usa otra aplicación"
chk "elige 8791" salida "Puerto elegido: 8791"

nuevo "Q1 --quitar NO apaga el nginx que instaló él si ahora sirve a otra app"
correr
chk "instala" test $RC -eq 0
printf 'server {\n    listen 3000;\n}\n' > "$R/etc/nginx/sites-enabled/app-nueva"
correr --quitar
chk "termina bien" test $RC -eq 0
chk "nginx sigue encendido" activo nginx
chk "y habilitado" habilitado nginx
chk "lo dice" salida "ahora sirve a otros sitios: queda encendido"
chk "quita nuestro sitio" test ! -e "$(SITIO)"

nuevo "Q2 --quitar con nginx que estaba apagado pero habilitado: no devuelve el ejemplo del 80"
con_nginx apagado; enlace_default; touch "$R/state/enabled_nginx"
correr
chk "instala" test $RC -eq 0
correr --quitar
chk "termina bien" test $RC -eq 0
chk "nginx apagado" test ! -f "$R/state/active_nginx"
chk "el ejemplo queda guardado, no en sites-enabled" test ! -e "$R/etc/nginx/sites-enabled/default"
chk "lo explica" salida "chocaría con la aplicación que usa el puerto 80"

nuevo "R1 reinstalar falla: la instalación anterior queda como estaba"
con_nginx activo
correr
chk "primera instalación bien" test $RC -eq 0
touch "$R/state/fail_nginx_t"
correr
chk "la segunda no sigue" test $RC -eq 1
chk "devuelve el sitio anterior" tiene "$(SITIO)" "listen 8790;"
chk "lo dice" salida "La instalación anterior \(puerto 8790\) quedó como estaba"
chk "el cron sigue" test -e "$R/etc/cron.d/tempo-pcp"
chk "nginx sigue funcionando" activo nginx

nuevo "R2 Apache: reinstalar falla (configtest) y ports.conf vuelve con nuestro Listen de antes"
con_apache $'Listen 80\nListen 8080\n'
correr
ANTES_P="$(cat "$R/etc/apache2/ports.conf")"
touch "$R/state/fail_apache_t"; correr
chk "no sigue" test $RC -eq 1
chk "ports.conf como estaba (con nuestro Listen)" test "$(cat "$R/etc/apache2/ports.conf")" = "$ANTES_P"
chk "sitio anterior activo" test -e "$R/etc/apache2/sites-enabled/tempo-pcp.conf"

nuevo "A1 Apache con un Listen pendiente de otra app cuyo puerto ya está ocupado: no recarga"
con_apache $'Listen 80\nListen 8080\n'
printf 'Listen 9000\n' >> "$R/etc/apache2/ports.conf"
printf 'LISTEN 0 511 0.0.0.0:9000 0.0.0.0:* users:(("node",pid=44,fd=3))\n' > "$R/state/ss"
correr
chk "no sigue" test $RC -eq 1
chk "nombra el puerto 9000" salida "puerto 9000 y ahora lo usa otra aplicación"
nochk "no recarga Apache" tiene "$R/state/log" "systemctl reload apache2"
chk "ports.conf sin lo nuestro" test "$(grep -c 'tempo-pcp\|8790' "$R/etc/apache2/ports.conf")" -eq 0
chk "Apache sigue funcionando" activo apache2

nuevo "A2 Apache que no carga sites-enabled: no sigue"
con_apache $'Listen 80\n'; touch "$R/state/apache_sin_sites"
correr
chk "no sigue" test $RC -eq 1
chk "lo explica" salida "no carga sites-enabled"
nochk "no recarga" tiene "$R/state/log" "systemctl reload apache2"

nuevo "M1 Apache: marca huérfana seguida del Listen de otra app: el suyo se queda"
con_apache $'Listen 80\n# tempo-pcp\nListen 9000\n'
mkdir -p "$R/etc/apache2/sites-available"; printf '<VirtualHost *:8790>\n</VirtualHost>\n' > "$R/etc/apache2/sites-available/tempo-pcp.conf"
correr
chk "termina bien" test $RC -eq 0
chk "el Listen 9000 de la otra app sigue" tiene "$R/etc/apache2/ports.conf" "^Listen 9000$"
chk "una sola marca" test "$(grep -c '^# tempo-pcp$' "$R/etc/apache2/ports.conf")" -eq 1
chk "nuestro Listen" tiene "$R/etc/apache2/ports.conf" "^Listen 8790$"
[ $RC -ne 0 ] && ver

nuevo "I1 Ctrl-C mientras espera que nginx tome el puerto: se deshace"
con_nginx activo; touch "$R/state/interrumpir"
correr
chk "no termina bien" test $RC -ne 0
chk "lo dice" salida "Se interrumpió la instalación"
chk "quita su sitio" test ! -e "$(SITIO)"
chk "no deja cron" test ! -e "$R/etc/cron.d/tempo-pcp"
chk "nginx sigue funcionando" activo nginx

nuevo "E1 alguien apaga nginx durante la instalación: no se enciende"
con_nginx activo; touch "$R/state/parar_tras_bajar"
correr
chk "no sigue" test $RC -eq 1
chk "lo dice" salida "no lo enciendo"
nochk "no lo arranca" tiene "$R/state/log" "systemctl start nginx"
nochk "no lo habilita" tiene "$R/state/log" "systemctl enable nginx"

nuevo "U3 ufw: una regla que ya existía (de otra app) no se borra al quitar"
con_nginx activo; con ufw; touch "$R/state/ufw_active" "$R/state/ufw_skip"
correr
chk "instala" test $RC -eq 0
nochk "no la anota como suya" tiene "$R/var/lib/tempo-pcp/ufw" "8790"
correr --quitar
nochk "no la borra" tiene "$R/state/ufw" "delete"

nuevo "Z1 --quitar encuentra el puerto aunque alguien haya borrado el archivo del sitio"
con_nginx activo; con ufw; touch "$R/state/ufw_active"
correr
rm -f "$(SITIO)"
correr --quitar
chk "cierra las reglas del 8790" tiene "$R/state/ufw" "delete allow from 192.168.0.0/16 to any port 8790"
chk "dice el puerto" salida "sitio del puerto 8790 se quitó"

nuevo "X1 estaba en Apache, ahora solo funciona nginx: se muda y Apache queda limpio"
con_apache $'Listen 80\nListen 8080\n'
correr
rm -f "$R/state/active_apache2"; con_nginx activo
correr
chk "termina bien" test $RC -eq 0
chk "sitio en nginx, mismo puerto" tiene "$(SITIO)" "listen 8790;"
chk "Apache sin nuestro sitio" test ! -e "$R/etc/apache2/sites-available/tempo-pcp.conf"
chk "ports.conf sin lo nuestro" test "$(grep -c 'tempo-pcp\|8790' "$R/etc/apache2/ports.conf")" -eq 0
[ $RC -ne 0 ] && ver

ESC="U1 actualizador: guarda solo las últimas 30 versiones"; R="$S1R"; export R; rm -f "$R/state/incompleto" "$R/state/nointernet"
for i in $(seq 1 35); do
  echo "v$i" > "$R/state/build"
  PATH="$R/bin:$R/nbin:$PATH" bash "$R/opt/tempo-pcp/actualizar.sh" >> "$R/upd" 2>&1 || echo "falló $i" >> "$R/upd"
  # que cada copia tenga otro nombre (el nombre lleva la hora al segundo)
  for f in "$R"/var/lib/tempo-pcp/anteriores/index-*.html; do [ -e "$f" ] || continue; case "$f" in *-v*) ;; *) mv "$f" "${f%.html}-v$i.html";; esac; done
done
nochk "ninguna corrida falla" tiene "$R/upd" "falló"
chk "quedan 30 copias" test "$(ls "$R/var/lib/tempo-pcp/anteriores" | wc -l)" -eq 30
chk "la vigente es la última" tiene "$R/var/www/tempo-pcp/index.html" "APP_BUILD=.v35."
chk "sin archivo a medio escribir" test ! -e "$R/var/www/tempo-pcp/index.html.nuevo"
chk "el actualizador se escribió de una vez (sin .nuevo)" test ! -e "$R/opt/tempo-pcp/actualizar.sh.nuevo"

ESC="U2 actualizador: descarga cortada o sin internet no toca la vigente ni el latido"
echo 100000000 > "$R/var/www/tempo-pcp/revisado.txt"
touch "$R/state/incompleto"
PATH="$R/bin:$R/nbin:$PATH" bash "$R/opt/tempo-pcp/actualizar.sh" > "$R/out" 2>&1; RC=$?
chk "cortada: sale con error" test $RC -ne 0
chk "cortada: lo registra" salida "descarga incompleta"
chk "cortada: la vigente sigue entera" tiene "$R/var/www/tempo-pcp/index.html" "APP_BUILD=.v35."
chk "cortada: el latido NO se renueva" tiene "$R/var/www/tempo-pcp/revisado.txt" "^100000000$"
rm -f "$R/state/incompleto"; touch "$R/state/nointernet"
PATH="$R/bin:$R/nbin:$PATH" bash "$R/opt/tempo-pcp/actualizar.sh" > "$R/out" 2>&1; RC=$?
chk "sin internet: sale con error" test $RC -ne 0
chk "sin internet: lo registra" salida "no se pudo bajar"
chk "sin internet: la vigente sigue" tiene "$R/var/www/tempo-pcp/index.html" "APP_BUILD=.v35."
chk "sin internet: el latido NO se renueva" tiene "$R/var/www/tempo-pcp/revisado.txt" "^100000000$"
rm -f "$R/state/nointernet"
PATH="$R/bin:$R/nbin:$PATH" bash "$R/opt/tempo-pcp/actualizar.sh" > "$R/out" 2>&1; RC=$?
chk "al día: sale bien" test $RC -eq 0
chk "al día: no hace copia" test "$(ls "$R/var/lib/tempo-pcp/anteriores" | wc -l)" -eq 30
chk "al día: SÍ renueva el latido" test "$(cat "$R/var/www/tempo-pcp/revisado.txt")" != 100000000

echo
echo "RESULTADO: $PASA pasan, $FALLA fallan"
[ "$FALLA" -eq 0 ]
