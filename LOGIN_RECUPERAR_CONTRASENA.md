# Recuperar la contraseña (y restablecerla desde administración)

**Fecha:** 16-sep-2026 · **Harness:** 1203 pruebas verdes · **Nada ejecutado en Supabase**: el paso 2 lo haces tú.

> Tu mensaje se cortó en «Authentication → URL Configuration:». Dejé el paso a paso completo con lo que hace falta
> para que los correos lleguen y el enlace funcione. Si tenías algo más en mente para ese punto, dímelo.

---

## 1 · En la app (ya está publicado)

### La pantalla de ingreso
Debajo del botón **Entrar** hay un enlace **«¿Olvidaste tu contraseña?»**. Abre una segunda cara de la misma
ventana: pide el correo y llama a `supabase.auth.resetPasswordForEmail(correo, { redirectTo: <URL de la app> })`.
La URL de vuelta se calcula sola (`location.origin + location.pathname`), así que funciona igual desde GitHub Pages,
desde Netlify o desde la copia local, sin tocar el código.

El mensaje de respuesta es **siempre el mismo, exista o no el correo**:

> Si el correo está registrado, te llegará un enlace. Revisa también spam.

Así nadie puede usar esa pantalla para averiguar qué correos están dados de alta. Lo único que sí se avisa distinto
es cuando el texto no parece un correo («Escribe un correo válido»), que no revela nada.

### Al volver desde el enlace
Cuando la persona abre el enlace del correo vuelve a la app y Supabase avisa con el evento **PASSWORD_RECOVERY**
(la app también reconoce el `type=recovery` de la dirección, por si el evento llega antes de que la página esté
lista). En ese caso **no entra directo**: aparece la pantalla **«Nueva contraseña»**, con la contraseña dos veces y
mínimo 8 caracteres. Si son distintas o es corta, lo dice y no manda nada. Si están bien,
`supabase.auth.updateUser({ password })` y **entra** con la sesión ya iniciada; los campos se limpian y la dirección
queda sin los códigos del enlace, para que recargar no repita el proceso. Si el enlace ya venció, lo dice y se
queda en esa pantalla.

### Restablecer desde administración
En **Configuración → Usuarios**, la tabla de cuentas tiene la columna **Contraseña** con el botón
**«enviar enlace»**. Pregunta antes, manda **el mismo enlace** que el «¿Olvidaste tu contraseña?» al correo de esa
persona y lo deja en la bitácora (quién lo mandó y a quién).

**Por qué un enlace y no una contraseña puesta a mano:** cambiarle la contraseña a otra cuenta requiere la clave de
servicio (`service_role`) de Supabase, y esta app es una página pública en un repositorio público: esa clave no
puede vivir aquí, porque cualquiera que abra el código tendría acceso total a la base. Con el enlace, **nadie —ni
administración— ve ni elige la contraseña de otra persona**, que además es lo correcto. La contraseña vieja sigue
sirviendo hasta que la persona use el enlace.

---

## 2 · Lo que tienes que hacer en Supabase (paso a paso, no está hecho)

Entra a https://supabase.com/dashboard → proyecto **bypdfogmksbxjaiydhlg**.

### 2.1 Authentication → URL Configuration
- **Site URL**: `https://claudeplanificaciontempo-debug.github.io/tempo-pcp/`
  (es la dirección a la que Supabase manda por defecto; pon la de GitHub Pages, que es la que está siempre al día).
- **Redirect URLs** → *Add URL*, una por línea. Tienen que estar **todas** las direcciones desde las que alguien
  pueda pedir el enlace, si no Supabase rechaza la vuelta:
  - `https://claudeplanificaciontempo-debug.github.io/tempo-pcp/`
  - `https://tempo-pcp.netlify.app/` (por si vuelve a tener crédito)
  - `http://127.0.0.1:8765/` (solo si alguna vez pruebas en local)
  Guarda con **Save**.

### 2.2 Authentication → Emails (plantilla «Reset Password»)
- Comprueba que el cuerpo del correo tenga el enlace `{{ .ConfirmationURL }}`: ese es el que trae los códigos.
- Si quieres, tradúcelo. Con esto basta:
  - **Asunto**: `TEMPO · cambia tu contraseña`
  - **Cuerpo**: `Hola: para poner una contraseña nueva en Planificación y control, entra aquí:`
    `<a href="{{ .ConfirmationURL }}">Poner una contraseña nueva</a>`
    `Si no lo pediste, no hagas nada: tu contraseña sigue igual.`

### 2.3 Authentication → Providers → Email
- **Enable Email provider**: encendido (ya lo está: es como entran hoy).
- No hace falta tocar «Confirm email» ni nada más para esto.

### 2.4 ⚠ El correo de salida (esto es lo que más se olvida)
El servidor de correo que Supabase da gratis está pensado **solo para pruebas**: manda **muy pocos correos por
hora** y a veces cae en spam. Con once operarias pidiendo el enlace el mismo día, se corta.
- Ve a **Project Settings → Authentication → SMTP Settings** y pon el correo de la empresa (por ejemplo el de
  Google Workspace de TEMPO, o cualquier servicio de envío). Necesitas: servidor, puerto, usuario, contraseña y el
  remitente (`Sender email` y `Sender name`, p. ej. «TEMPO · Planificación»).
- Después, en **Authentication → Rate Limits**, sube el límite de correos por hora a lo que necesites.
- Mientras no hagas esto, el enlace **funciona**, pero llegan pocos correos por hora y algunos a spam.

### 2.5 Cuánto dura el enlace
En **Authentication → Providers → Email** está el tiempo de vida del enlace (por defecto **1 hora**). Si quieres
darles más margen, súbelo ahí. Pasado ese tiempo la app dice que venció y hay que pedir otro.

### 2.6 Para comprobar que quedó bien
1. Abre la app publicada y toca **¿Olvidaste tu contraseña?**.
2. Escribe tu correo → debe salir el mensaje gris de siempre.
3. Revisa el correo (y spam). Abre el enlace: **tiene que abrir la app con la pantalla «Nueva contraseña»**.
   - Si en vez de eso ves un error de tipo *redirect not allowed*, falta esa dirección exacta en **Redirect URLs**.
4. Pon una contraseña de 8 o más caracteres dos veces → debe entrar directo.
5. Cierra sesión y entra con la nueva.

---

## 3 · Qué se probó en el simulador
El enlace está debajo de Entrar y abre la pantalla del correo · un correo mal escrito no manda nada · con un correo
válido se llama a `resetPasswordForEmail` con la URL de la app como vuelta · **el mensaje es exactamente el mismo
con un correo registrado y con uno inventado** · al llegar el evento PASSWORD_RECOVERY se abre «Nueva contraseña» ·
menos de 8 caracteres no se guarda · dos contraseñas distintas tampoco · con las dos iguales se llama a `updateUser`
y entra, y los campos quedan vacíos · si el enlace venció lo dice y no entra · administración manda el enlace, queda
en la bitácora y la columna sale en Usuarios.
