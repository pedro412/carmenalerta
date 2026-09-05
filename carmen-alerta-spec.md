# Especificación Técnica: Carmen Alerta

**Versión:** 1.0
**Fecha:** 15 de agosto de 2026
**Tipo de documento:** Spec funcional y técnica (Spec-Driven Development)

---

## 1. Visión General

Carmen Alerta es una aplicación web responsive que muestra un mapa interactivo de Ciudad del Carmen, donde los usuarios reportan y consultan anomalías de tránsito e incidencias urbanas en tiempo real (inundaciones, cortes de luz, accidentes, obras, cierres viales, fallas en semáforos, entre otras). El sistema incorpora un mecanismo de reputación ("prestigio") con niveles e insignias que incentiva reportes veraces y verificados por la comunidad.

### 1.1 Objetivos del producto
- Brindar información vial y urbana confiable y actualizada a los habitantes de Ciudad del Carmen.
- Incentivar la participación ciudadana responsable mediante gamificación.
- Reducir reportes falsos mediante verificación comunitaria y moderación.
- Permitir a los usuarios planear rutas evitando anomalías activas.

### 1.2 Alcance del MVP
Incluye: mapa interactivo, autenticación de usuarios, creación/consulta de reportes, sistema de prestigio con niveles, votos comunitarios, moderación, notificaciones por cercanía y por ruta.
Fuera de alcance (fase futura): apps nativas iOS/Android, integración con autoridades de tránsito, analítica predictiva de tráfico.

---

## 2. Roles de Usuario

| Rol | Descripción |
|---|---|
| **Visitante** | Puede ver el mapa y los reportes públicos, no puede reportar ni votar. |
| **Usuario registrado** | Puede reportar, votar, comentar, acumular prestigio y recibir notificaciones. |
| **Moderador** | Usuario con permisos especiales para resolver disputas de reportes marcados como sospechosos, suspender cuentas y eliminar contenido inapropiado. |
| **Administrador** | Control total del sistema: gestión de moderadores, categorías, parámetros de prestigio. |

---

## 3. Requisitos Funcionales

### 3.1 Autenticación y Perfil de Usuario
- RF-01: El usuario se registra con nombre de usuario, correo electrónico y contraseña.
- RF-02: El usuario inicia sesión con correo/nombre de usuario y contraseña.
- RF-03: El perfil de usuario muestra: nombre de usuario, avatar, nivel de prestigio actual, insignia, puntos totales, número de reportes realizados y porcentaje de reportes verificados.
- RF-04: El usuario puede editar su perfil (avatar, nombre visible, contraseña).
- RF-05: Recuperación de contraseña vía correo electrónico.

### 3.2 Mapa Interactivo
- RF-06: El mapa centra la vista en Ciudad del Carmen, Campeche, con zoom y desplazamiento libre.
- RF-07: Cada anomalía se representa con un ícono distintivo según su categoría, ubicado en su punto geográfico exacto.
- RF-08: El mapa agrupa (clustering) anomalías cercanas cuando el zoom es bajo, mostrando el conteo.
- RF-09: Al presionar un ícono de anomalía se abre un panel/modal de detalle (ver sección 3.4).
- RF-10: Filtros visuales por categoría de anomalía y por antigüedad del reporte.
- RF-11: El mapa se actualiza en tiempo real (o vía polling corto) cuando se crean, confirman o resuelven reportes.

### 3.3 Categorías de Anomalías (configurables por Admin)
1. Calles inundadas
2. Zonas sin luz / alumbrado público
3. Accidentes de tráfico
4. Calles en construcción
5. Calles cerradas por velorios
6. Semáforos descompuestos
7. Otro (con descripción libre, sujeto a revisión de moderador)

Cada categoría define: ícono, color, tiempo de vida sugerido antes de solicitar reconfirmación (ej. accidente: 3h: inundación: 12h; obra: 30 días), y si requiere severidad (baja/media/alta).

### 3.4 Creación y Consulta de Reportes
- RF-12: Usuario autenticado crea un reporte seleccionando: categoría, ubicación (por GPS o tocando el mapa), descripción breve, severidad, y opcionalmente foto o video como evidencia (**no obligatorio**, pero otorga bono de prestigio, ver RF-19).
- RF-13: Al tocar una anomalía en el mapa, se muestra:
  - Categoría, descripción, hora del primer reporte y última confirmación.
  - Evidencia multimedia adjunta (si existe).
  - Lista de usuarios que reportaron/confirmaron la anomalía, cada uno con su nombre de usuario, insignia y nivel de prestigio visibles.
  - Botones de "Confirmar" (sigue ahí) / "Ya no aplica" (resuelto).
  - Contador de confirmaciones vs. desmentidos.
- RF-14: Un reporte nuevo entra en estado **"activo - sin verificar"**. Al alcanzar un umbral de confirmaciones de otros usuarios (configurable, ej. 3 confirmaciones netas) pasa a **"verificado"**.
- RF-15: Cualquier usuario autenticado puede marcar una anomalía existente como **"resuelto / ya no aplica"**. Cuando el número de marcas de resuelto supera un umbral (o supera a las confirmaciones activas), el reporte se archiva automáticamente.
- RF-16: Historial de reportes resueltos/archivados consultable (no se muestran en el mapa activo, pero quedan en el perfil del usuario y en estadísticas).

### 3.5 Sistema de Prestigio y Gamificación
- RF-17: Cada usuario tiene un puntaje numérico de prestigio, oculto en detalle pero reflejado en un **nivel/insignia** público.
- RF-18: Niveles sugeridos (ajustables por Admin):
  | Nivel | Insignia | Puntos requeridos |
  |---|---|---|
  | 1 | Vigía Novato | 0 |
  | 2 | Vigía Activo | 100 |
  | 3 | Reportero Confiable | 300 |
  | 4 | Guardián de la Ciudad | 700 |
  | 5 | Centinela del Carmen | 1500 |
- RF-19: Reglas de puntuación (valores iniciales configurables):
  - +10 pts: reporte creado.
  - +5 pts extra: reporte con evidencia foto/video.
  - +5 pts: reporte confirmado por otro usuario.
  - +15 pts: reporte alcanza estado "verificado".
  - +2 pts: votar/confirmar un reporte de otro usuario que resulte verídico.
  - −15 pts: reporte marcado como falso/spam por moderador.
  - −5 pts: votos de "desmentido" superan a los de confirmación.
  - Penalización adicional y posible suspensión temporal por reincidencia de reportes falsos.
- RF-20: El detalle de una anomalía muestra el nivel/insignia de cada usuario que reportó o confirmó, permitiendo a otros usuarios evaluar la credibilidad del reporte a simple vista.
- RF-21: Tabla de clasificación (leaderboard) opcional, semanal/mensual, de los usuarios con mayor prestigio.

### 3.6 Votos Comunitarios y Moderación de Contenido
- RF-22: Cualquier usuario autenticado puede votar "Confirmo" o "Ya no aplica / Falso" sobre un reporte existente (un voto por usuario por reporte).
- RF-23: Un reporte puede ser marcado por usuarios como "sospechoso/spam"; al superar un umbral de marcas, se envía a cola de revisión de moderadores.
- RF-24: Los moderadores pueden: eliminar reportes, suspender usuarios, ajustar manualmente el prestigio en casos de abuso comprobado.
- RF-25: Se registra un log de auditoría de acciones de moderación.

### 3.7 Notificaciones
- RF-26: **Notificaciones por cercanía**: el usuario recibe alertas de anomalías nuevas dentro de un radio configurable de su ubicación actual (requiere permiso de geolocalización).
- RF-27: **Notificaciones por ruta**: el usuario indica un origen y destino; el sistema le alerta si existen anomalías activas sobre o cerca de esa ruta antes o durante el trayecto.
- RF-28: El usuario configura en su perfil qué tipos de notificación y categorías desea recibir, y puede desactivarlas.
- RF-29: Canal de notificación vía push web (Web Push API) y/o notificación in-app; correo electrónico como respaldo opcional.

### 3.8 Panel de Administración
- RF-30: Gestión de categorías de anomalías (crear, editar, desactivar).
- RF-31: Configuración de reglas de puntuación y niveles de prestigio.
- RF-32: Gestión de moderadores y usuarios (suspender, banear, restaurar).
- RF-33: Dashboard con métricas: reportes por categoría, zonas con mayor incidencia, usuarios más activos.

---

## 4. Modelo de Datos (alto nivel)

### User
```
id, username, email, password_hash, avatar_url, prestige_points,
prestige_level, role [visitor|user|moderator|admin], created_at,
is_suspended, notification_preferences (json)
```

### Report (Anomalía)
```
id, category_id, reporter_id, latitude, longitude, description,
severity [low|medium|high], media_url (nullable), status
[unverified|verified|disputed|resolved|archived], created_at,
resolved_at, expires_at_suggested
```

### ReportVote
```
id, report_id, user_id, vote_type [confirm|resolved|spam], created_at
```

### Category
```
id, name, icon, color, default_severity_required (bool),
suggested_lifetime_hours
```

### PrestigeLog
```
id, user_id, report_id (nullable), points_delta, reason, created_at
```

### Notification
```
id, user_id, report_id, type [proximity|route], read (bool), created_at
```

### Route (para notificaciones por ruta)
```
id, user_id, origin_lat, origin_lng, destination_lat, destination_lng,
active (bool), created_at
```

---

## 5. Flujos de Usuario Clave

### 5.1 Flujo: Crear un reporte
1. Usuario autenticado toca "Reportar" en el mapa o mantiene presionado un punto.
2. Selecciona categoría → ingresa descripción y severidad.
3. (Opcional) Adjunta foto/video.
4. Confirma ubicación (GPS o ajuste manual).
5. Envía → el reporte aparece inmediatamente en el mapa como "sin verificar".
6. Usuario recibe notificación de puntos ganados.

### 5.2 Flujo: Consultar y votar un reporte
1. Usuario toca el ícono de la anomalía en el mapa.
2. Se abre panel con detalle, evidencia y lista de reportantes/confirmadores con su prestigio.
3. Usuario elige "Confirmar" o "Ya no aplica".
4. Sistema recalcula estado del reporte y prestigio de los involucrados según corresponda.

### 5.3 Flujo: Notificación por ruta
1. Usuario ingresa origen y destino (o usa "mi ubicación" como origen).
2. Sistema calcula corredor de ruta y consulta anomalías activas dentro de un buffer geográfico.
3. Si existen coincidencias, se genera notificación con detalle y sugerencia de precaución.
4. El usuario puede mantener la ruta activa para recibir alertas de nuevas anomalías mientras viaja.

---

## 6. Requisitos No Funcionales

- RNF-01: **Responsive**: la interfaz debe funcionar correctamente en navegadores móviles y de escritorio (prioridad web responsive; apps nativas quedan fuera del MVP pero la API se diseña pensando en reutilización futura).
- RNF-02: **Rendimiento**: el mapa debe soportar cientos de marcadores simultáneos sin degradar la experiencia (uso de clustering).
- RNF-03: **Disponibilidad**: objetivo de uptime 99% para el MVP.
- RNF-04: **Privacidad**: la ubicación en tiempo real del usuario solo se usa para notificaciones y nunca se comparte públicamente con otros usuarios.
- RNF-05: **Seguridad**: contraseñas con hash seguro (bcrypt/argon2), protección contra spam/bots en creación de reportes (rate limiting, captcha si es necesario).
- RNF-06: **Moderación de contenido multimedia**: validación de que las imágenes/videos subidos no contengan contenido inapropiado (revisión automática básica + reporte de usuarios).
- RNF-07: **Escalabilidad geográfica**: aunque el MVP se enfoca en Ciudad del Carmen, el modelo de datos debe permitir expansión a otras ciudades sin rediseño mayor.
- RNF-08: **Accesibilidad**: cumplimiento básico de contraste y tamaños táctiles (WCAG AA) para los controles del mapa.

---

## 7. Consideraciones Técnicas Sugeridas (no vinculantes)

- **Mapa**: Mapbox GL JS o Leaflet + OpenStreetMap (evaluar costo/beneficio; Leaflet + OSM es gratuito y suficiente para el MVP).
- **Backend**: API REST o GraphQL con autenticación JWT.
- **Base de datos**: PostgreSQL con extensión PostGIS para consultas geoespaciales (radio de cercanía, corredor de ruta).
- **Notificaciones push**: Web Push API + service worker.
- **Almacenamiento multimedia**: bucket de almacenamiento de objetos (ej. S3-compatible) con generación de miniaturas.
- **Tiempo real**: WebSockets o polling corto (5-15s) para actualización del mapa.

---

## 8. Métricas de Éxito (KPIs sugeridos)

- Número de reportes activos verificados por semana.
- Tiempo promedio entre creación de un reporte y su primera confirmación/desmentido.
- Porcentaje de reportes marcados como falsos sobre el total.
- Usuarios activos mensuales y tasa de retención.
- Promedio de prestigio por usuario activo (indicador de calidad de la comunidad).

---

## 9. Preguntas Abiertas / Decisiones Pendientes

- Umbral exacto de confirmaciones para pasar de "sin verificar" a "verificado" (sugerido: 3, ajustable).
- Radio de notificación por cercanía por defecto (sugerido: 1.5 km, configurable por usuario).
- Política de retención de datos de reportes archivados (¿cuánto tiempo se conservan para estadísticas?).
- ¿Se permite reportar de forma anónima en algún caso excepcional (ej. emergencias) o siempre requiere sesión iniciada?
