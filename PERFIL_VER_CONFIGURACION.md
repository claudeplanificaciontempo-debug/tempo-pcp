# Ver la configuración sin poder cambiarla — perfil «Jefatura» (22-sep-2026)

**Pedido de la usuaria** (para Fernando): «Dale permisos que pueda hacer todo, pero no configuraciones. Puede ver
configuraciones, pero no puede editarlas: para ver cómo están los recursos, cómo están las personas, las capacidades,
puede ver, pero no editar.»

## 1 · Por qué no se podía

Hasta hoy la Configuración era todo o nada: la entrada del menú y la pantalla estaban detrás del permiso **`config`**,
que es el mismo que deja **editar**. Quien no lo tenía no veía la pantalla; quien lo tenía, podía cambiar cualquier
cosa. El `modo: 'ver'` del catálogo de perfiles tampoco servía, porque apaga **todos** los permisos: Fernando dejaría
de poder liberar, programar o mover rutas.

## 2 · Qué se hizo

- **Permiso nuevo `configVer`** — «Ver la configuración sin poder cambiarla (recursos, personas, capacidades,
  tablas)», visible en Configuración → Usuarios como cualquier otro permiso.
- **Los dos porteros aceptan varios permisos** (`data-perm="config|configVer"`): con cualquiera de los dos se ve la
  entrada del menú y se entra a la página. `config` sigue siendo **el único que edita**.
- **Blindaje de la pantalla** (`blindarConfigSoloVer`): si el perfil tiene `configVer` y no `config`, al dibujar la
  Configuración se apagan **todos** los campos, listas y botones, y arriba sale un aviso que lo explica en una línea.
  Con permiso de editar, la pantalla no cambia en nada.
- **Perfil sembrado «Jefatura (todo menos configurar)»**: órdenes, programa, categorías, avance, liberar, reprogramar,
  rutas, baños, calidad de tintorería y `configVer`; **todas** las páginas y **todos** los centros; sin `config` y sin
  `usuarios`. Se siembra una sola vez, queda en la bitácora y es editable en Configuración → Usuarios (se le puede
  quitar o agregar permisos, o cambiarle el nombre).

**Hasta dónde llega la garantía:** es un blindaje de **pantalla**, más los permisos que las funciones ya piden. No es
una regla de la base de datos: la RLS de Supabase solo acota hoy a los perfiles de piso. Para un cargo de confianza
alcanza; si en algún momento hace falta que sea imposible y no solo inaccesible, hay que ampliar la RLS a `params`.

## 3 · Los dos usuarios que pediste

| Correo | Nombre | Perfil | Qué ve |
|---|---|---|---|
| `modulo1tempo@gmail.com` | Módulo 1 | **Tablet de centro** · centro Confección/módulos · recurso **Módulo 1** | Solo «Mi centro»: su cola, INICIO/PARO/FIN, unidades por talla. Es el que pone los tiempos, como en las pruebas. |
| `fernandotempo23@gmail.com` | Fernando | **Jefatura (todo menos configurar)** | Todo lo operativo; ve la Configuración entera en modo lectura; no crea usuarios. |

Se crean en **Configuración → Usuarios → «Nuevo usuario»** (correo, nombre, perfil, contraseña inicial de 8+
caracteres; para el de tablet, centro y recurso son obligatorios). **Claude no crea cuentas ni entra a producción.**

Dos cosas que pueden frenar al de tablet: si Supabase pide confirmar el correo, la persona debe abrir primero ese
enlace; y el botón «Hecho» no aparece hasta que la **tabla 15** tenga motivos en los usos *paro*, *piso*, *cierre* y
*cierre sin tiempo* (pendiente P03).

## 4 · Pruebas

Bloque **PV** (7): el catálogo trae el perfil con `configVer` y sin `config` ni `usuarios` · el permiso aparece en la
lista con su explicación · con ese perfil puede lo operativo y no configurar · ve la pantalla entera con los 31
controles apagados y el aviso · la entrada le aparece en el menú · Usuarios sigue cerrado · con permiso de editar la
pantalla no cambia.
