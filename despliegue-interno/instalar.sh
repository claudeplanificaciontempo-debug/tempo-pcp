#!/usr/bin/env bash
# =====================================================================================================
#  TEMPO PCP · instalación en un servidor Ubuntu de la red interna (se corre UNA vez)
#
#  Uso:      sudo bash instalar.sh [PUERTO]          (por defecto 8080)
#  Qué hace: 1) revisa que el puerto esté libre (el equipo ya tiene otras aplicaciones: no las toca)
#            2) usa el servidor web que ya haya (nginx o Apache); si no hay ninguno, instala nginx
#            3) crea el sitio /var/www/tempo-pcp en ese puerto, abierto SOLO a la red interna
#            4) baja la última versión publicada del sistema y deja un actualizador cada 15 minutos
#  Qué NO hace: no mueve datos. Los datos siguen en Supabase (internet), igual que hoy.
#  Deshacer: sudo bash instalar.sh --quitar
# =====================================================================================================
set -euo pipefail

PUERTO="${1:-8080}"
DIR=/var/www/tempo-pcp                       # lo que el navegador ve
LIB=/var/lib/tempo-pcp                       # copias anteriores y registro
BIN=/opt/tempo-pcp                           # el actualizador
URL_RAW="https://raw.githubusercontent.com/claudeplanificaciontempo-debug/tempo-pcp/main/index.html"
REDES_INTERNAS=("10.0.0.0/8" "172.16.0.0/12" "192.168.0.0/16" "127.0.0.1")

if [ "$(id -u)" -ne 0 ]; then echo "Hay que correrlo con sudo:  sudo bash $0 ${1:-}"; exit 1; fi

# ---------- quitar (deshacer la instalación, sin tocar las otras aplicaciones) ----------
if [ "${1:-}" = "--quitar" ]; then
  rm -f /etc/cron.d/tempo-pcp
  rm -f /etc/nginx/sites-enabled/tempo-pcp /etc/nginx/sites-available/tempo-pcp
  if [ -f /etc/apache2/sites-available/tempo-pcp.conf ]; then a2dissite -q tempo-pcp || true; rm -f /etc/apache2/sites-available/tempo-pcp.conf; fi
  if [ -f /etc/apache2/ports.conf ]; then sed -i '/# tempo-pcp$/d' /etc/apache2/ports.conf; fi
  systemctl reload nginx 2>/dev/null || true; systemctl reload apache2 2>/dev/null || true
  echo "Listo: el sitio se quitó. Los archivos quedan en $DIR y $LIB por si se necesitan (bórralos a mano si quieres)."
  exit 0
fi

case "$PUERTO" in (*[!0-9]*|'') echo "El puerto tiene que ser un número (p. ej. 8080)."; exit 1;; esac

echo "== TEMPO PCP · instalación en el puerto $PUERTO =="

# ---------- 1 · el puerto tiene que estar libre ----------
if ss -ltnH 2>/dev/null | awk '{print $4}' | grep -Eq "[:.]$PUERTO\$"; then
  echo "El puerto $PUERTO ya lo usa otra aplicación de este equipo. Elige otro, por ejemplo:  sudo bash $0 8090"
  ss -ltnp 2>/dev/null | grep -E "[:.]$PUERTO\b" || true
  exit 1
fi

# ---------- 2 · servidor web: el que ya haya; si no hay, nginx ----------
WEB=""
if systemctl is-active --quiet nginx 2>/dev/null; then WEB=nginx          # el que está funcionando manda
elif systemctl is-active --quiet apache2 2>/dev/null; then WEB=apache
elif command -v nginx >/dev/null 2>&1; then WEB=nginx
else
  echo "No hay servidor web instalado: instalo nginx (sin arrancarlo hasta quitar su sitio de ejemplo del puerto 80)."
  PRC=""; if [ ! -e /usr/sbin/policy-rc.d ]; then printf '#!/bin/sh\nexit 101\n' > /usr/sbin/policy-rc.d; chmod +x /usr/sbin/policy-rc.d; PRC=1; fi
  apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq nginx curl || { [ -n "$PRC" ] && rm -f /usr/sbin/policy-rc.d; exit 1; }
  [ -n "$PRC" ] && rm -f /usr/sbin/policy-rc.d
  # el sitio de ejemplo de nginx usa el puerto 80: se quita para no chocar con las otras aplicaciones del equipo
  rm -f /etc/nginx/sites-enabled/default
  WEB=nginx
fi
command -v curl >/dev/null 2>&1 || { apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq curl; }
echo "Servidor web: $WEB"

mkdir -p "$DIR" "$LIB/anteriores" "$BIN"

# ---------- 3 · el sitio, abierto solo a la red interna ----------
PERMITIR_NGINX=""; for r in "${REDES_INTERNAS[@]}"; do PERMITIR_NGINX+="        allow $r;"$'\n'; done
PERMITIR_APACHE="${REDES_INTERNAS[*]}"

if [ "$WEB" = nginx ]; then
  cat > /etc/nginx/sites-available/tempo-pcp <<EOF
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
    gzip on;
    gzip_types text/css application/javascript application/json;
    access_log /var/log/nginx/tempo-pcp.access.log;
    error_log  /var/log/nginx/tempo-pcp.error.log;
}
EOF
  ln -sf /etc/nginx/sites-available/tempo-pcp /etc/nginx/sites-enabled/tempo-pcp
  nginx -t
else
  grep -q "^Listen $PUERTO\b" /etc/apache2/ports.conf || echo "Listen $PUERTO # tempo-pcp" >> /etc/apache2/ports.conf
  a2enmod -q headers >/dev/null
  cat > /etc/apache2/sites-available/tempo-pcp.conf <<EOF
# TEMPO PCP · sitio interno (lo escribió instalar.sh). Puerto propio para no chocar con las otras aplicaciones.
<VirtualHost *:$PUERTO>
    DocumentRoot $DIR
    DirectoryIndex index.html
    <Directory $DIR>
        Require ip $PERMITIR_APACHE
        Options -Indexes
    </Directory>
    <Files "index.html">
        Header set Cache-Control "no-cache, must-revalidate"
    </Files>
    ErrorLog \${APACHE_LOG_DIR}/tempo-pcp.error.log
    CustomLog \${APACHE_LOG_DIR}/tempo-pcp.access.log combined
</VirtualHost>
EOF
  a2ensite -q tempo-pcp
  apache2ctl configtest
fi

# ---------- 4 · actualizador: baja la versión publicada; si algo falla, deja la anterior ----------
cat > "$BIN/actualizar.sh" <<'EOF'
#!/usr/bin/env bash
# TEMPO PCP · trae la última versión publicada. Si la descarga no está completa, NO toca la que está funcionando.
set -euo pipefail
DIR=/var/www/tempo-pcp; LIB=/var/lib/tempo-pcp
URL_RAW="https://raw.githubusercontent.com/claudeplanificaciontempo-debug/tempo-pcp/main/index.html"
TMP="$(mktemp)"; trap 'rm -f "$TMP"' EXIT
curl -fsSL --max-time 120 "$URL_RAW" -o "$TMP"
# comprobación: tiene que ser el sistema entero (sello de versión y cierre del archivo)
if ! grep -q "APP_BUILD=" "$TMP" || ! grep -q "</html>" "$TMP"; then echo "$(date '+%F %T') descarga incompleta: se deja la versión anterior"; exit 1; fi
if [ -f "$DIR/index.html" ] && cmp -s "$TMP" "$DIR/index.html"; then exit 0; fi   # ya está al día
mkdir -p "$LIB/anteriores"
if [ -f "$DIR/index.html" ]; then cp "$DIR/index.html" "$LIB/anteriores/index-$(date +%Y%m%d-%H%M%S).html"; fi
install -m 0644 "$TMP" "$DIR/index.html.nuevo" && mv -f "$DIR/index.html.nuevo" "$DIR/index.html"
ls -1t "$LIB/anteriores"/index-*.html 2>/dev/null | tail -n +31 | xargs -r rm -f   # se guardan las últimas 30 versiones
echo "$(date '+%F %T') actualizado: $(grep -o "APP_BUILD='[^']*'" "$DIR/index.html" | head -1)"
EOF
chmod 0755 "$BIN/actualizar.sh"
"$BIN/actualizar.sh" | tee -a "$LIB/actualizar.log"

cat > /etc/cron.d/tempo-pcp <<EOF
# TEMPO PCP · revisa cada 15 minutos si hay versión nueva publicada (lo escribió instalar.sh)
*/15 * * * * root $BIN/actualizar.sh >> $LIB/actualizar.log 2>&1
EOF
chmod 0644 /etc/cron.d/tempo-pcp

# ---------- firewall (si está activo): el puerto solo para la red interna ----------
if command -v ufw >/dev/null 2>&1 && ufw status 2>/dev/null | grep -q "Status: active"; then
  for r in "${REDES_INTERNAS[@]}"; do [ "$r" = 127.0.0.1 ] || ufw allow from "$r" to any port "$PUERTO" proto tcp >/dev/null; done
  echo "Firewall (ufw): puerto $PUERTO abierto solo para la red interna."
fi

# ---------- arrancar ----------
if [ "$WEB" = nginx ]; then systemctl enable --now nginx >/dev/null 2>&1 || true; systemctl reload nginx; else systemctl reload apache2; fi

IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
echo
echo "== Listo =="
echo "Abrir desde cualquier computadora o tablet de la red:   http://${IP:-IP-DEL-SERVIDOR}:$PUERTO/"
echo "Actualización automática cada 15 minutos (registro: $LIB/actualizar.log). Versiones anteriores: $LIB/anteriores"
echo "Falta un paso en Supabase para «olvidé mi contraseña»: agregar http://${IP:-IP-DEL-SERVIDOR}:$PUERTO/ en Authentication → URL Configuration → Redirect URLs."
