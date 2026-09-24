# 🏛️ Arquitectura del Sistema PoliPlan

Este documento refleja la arquitectura actual del proyecto tal como está implementado en el repositorio. Se revisó conforme a los módulos reales presentes en backend/frontend y se ajustó a la estructura vigente del código.

---

## 📐 Visión general

La aplicación está diseñada en capas y usa una separación clara entre la capa de presentación, la capa de negocio y la capa de acceso a datos.

```text
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + TS)                   │
│  Páginas, formularios, rutas protegidas y consultas API   │
└───────────────────────────────┬─────────────────────────────┘
                                │ HTTP + JWT
                                ▼
┌─────────────────────────────────────────────────────────────┐
│            BACKEND (Node.js + Express)                       │
│  Routes → Controllers → Services → Supabase                │
└───────────────────────────────┬─────────────────────────────┘
                                │ SQL / Auth / Storage
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                 SUPABASE (PostgreSQL + Auth)               │
│  student, career, faculty, semester, course, day,          │
│  assessment, grade, enrollment, report data                │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Seguridad y autenticación

La autenticación del sistema se realiza con Supabase Auth y JWT.

### Flujo actual

1. El usuario se registra en `/student/auth`.
2. Se crea un usuario en Supabase Auth.
3. El usuario accede mediante `/student/login`.
4. El backend valida las credenciales con `supabase.auth.signInWithPassword()`.
5. El frontend guarda la sesión y el token.
6. Las rutas protegidas usan `authMiddleware` para validar el token en el header `Authorization`.
7. El `req.student` queda disponible para que el controller y el service trabajen con el estudiante autenticado.

### Middleware relevante

- `backend/src/middlewares/authMiddleware.js`: valida sesión y token JWT
- `backend/src/middlewares/adminMiddleware.js`: limita acceso administrativo cuando aplica

## 🧱 Arquitectura en capas

### Backend

```text
REQUEST
  │
  ▼
ROUTES
  └─ Definen endpoints HTTP
  │
  ▼
MIDDLEWARES
  └─ authMiddleware / adminMiddleware
  │
  ▼
CONTROLLERS
  └─ Validan input y coordinan la respuesta
  │
  ▼
SERVICES
  └─ Lógica de negocio y reglas académicas
  │
  ▼
SUPABASE
  └─ Persistencia y autenticación
```

### Frontend

```text
App.tsx
  │
  ▼
AppRouters.tsx
  │
  ├─ públicas: /auth, /register
  │
  └─ protegidas: /home, /semester, /course-list, /enrollment, /reports/grades, etc.
      │
      ▼
  ProtectedRouters
      │
      └─ valida sesión activa y renderiza la vista correspondiente
```

## 📦 Módulos implementados en el proyecto actual

### 1. Estudiantes y autenticación

- `StudentRoutes.js`
- `StudentController.js`
- `StudentService.js`
- Rutas: `/student/auth`, `/student/login`, `/student/view`, `/student/me`, `/student/update`, `/student/password`

### 2. Semestres

- `SemesterRoutes.js`
- `SemesterController.js`
- `SemesterService.js`
- Rutas: `/semester/create`, `/semester/view`, `/semester/update/:semesterId`

### 3. Cursos y días

- `CourseRoutes.js`
- `CourseController.js`
- `CourseService.js`
- `DayRoutes.js`, `DayController.js`, `DayService.js`
- Rutas: `/course/create`, `/course/view`, `/course/view/:semesterName`, `/course/update/:courseId`, `/course/status/:courseId`, `/day/...`

### 4. Catálogo académico

- `CatalogRoutes.js`
- `CatalogController.js`
- `CatalogService.js`
- Rutas: `/catalog/careers`, `/catalog/faculties`, `/catalog/courses`, `/catalog/courses/available`, `/catalog/courses/faculty/:facultyId`, `/catalog/courses/career/:careerId`

### 5. Matrícula transaccional

- `EnrollmentRoutes.js`
- `EnrollmentController.js`
- `EnrollmentService.js`
- Rutas: `/enrollment/validate` y `/enrollment/process`
- Reglas activas: máximo 26 créditos, validación de prerrequisitos y solape horario.

### 6. Evaluaciones y calificaciones

- `AssessmentRoutes.js`
- `AssessmentController.js`
- `AssessmentService.js`
- `GradeRoutes.js`
- `GradeController.js`
- `GradeService.js`

### 7. Reportes académicos

- `ReportRoutes.js`
- `ReportController.js`
- `ReportService.js`
- Rutas: `/reports/transcript` y `/reports/schedule`

## 🧭 Mapa real de rutas del frontend

El archivo `frontend/src/routers/AppRouters.tsx` define estas rutas:

- `/auth`
- `/register`
- `/home`
- `/profile`
- `/settings`
- `/semester`
- `/course-list`
- `/course`
- `/day`
- `/university-catalog`
- `/enrollment`
- `/assessment-list`
- `/assessment`
- `/grade-list`
- `/grade-simulation`
- `/grade`
- `/reports/grades`
- `/reports/schedule`

## 🗂️ Estructura actual de carpetas

```text
backend/
├── src/
│   ├── app.js
│   ├── index.js
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   └── services/
└── tests/

frontend/
├── src/
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── integrations/
│   ├── pages/
│   ├── routers/
│   ├── styles/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
```

## 🔄 Flujo de datos principal

### Caso: matrícula transaccional

```text
Frontend (/enrollment)
  │
  ├─ formulario con materias del catálogo
  ├─ validación cliente
  ▼
POST /enrollment/validate
  │
  ├─ backend valida límite de créditos
  ├─ valida prerrequisitos
  ├─ valida horarios
  ▼
POST /enrollment/process
  │
  ├─ creación transaccional de la matrícula
  ├─ actualiza el estado del estudiante/semestre
  ▼
Frontend recibe respuesta y actualiza la vista
```

### Caso: reportes académicos

```text
Frontend (/reports/grades o /reports/schedule)
  │
  ▼
GET /reports/transcript o /reports/schedule
  │
  ▼
ReportService
  ├─ consolida notas, GPA y créditos
  ├─ calcula horarios y agenda de evaluaciones
  ▼
Frontend renderiza KPIs, tabla y cronograma
```

## 🧪 Tecnologías y patrones

- Express para API REST
- React y Vite para interfaz web
- Supabase como backend de autenticación y persistencia
- JWT para rutas protegidas
- Separación por responsabilidades: rutas, controllers, services, middlewares
- Tests unitarios en la capa de lógica de negocio

## ✅ Ajustes realizados en la documentación

Se actualizó la documentación para reflejar:

- la presencia real de catálogo, matrícula y reportes,
- la estructura de rutas del frontend y backend,
- la infraestructura actual de Supabase/Auth,
- el estado real del proyecto y la separación de capas vigente en el repositorio.

---

Última actualización: 2026-09-24

```

**Usuario visto**

- Error banners bajo títulos
- Usuario puede corregir y reintentar

---

## ⚡ Performance Considerations

### Token Refresh Strategy

- httpClient interceptor refresca 60 segundos antes de expirar
- Evita peticiones rechazadas por token expirado
- Fallback: si Supabase no responde, valida JWT localmente

### Data Loading

- Cada página carga solo lo necesario
- useEffect con dependencias vacías para cargar en mount
- TODO: Considerar caché para semestres (raramente cambian)

### Rendering Optimization

- React Hook Form evita re-renders innecesarios
- Components son funcionales (hooks)
- No hay state global costoso

---

## 🚀 Deployment Considerations

### Development

- Backend: `http://localhost:3000` (local)
- Frontend: `http://localhost:5173` (Vite dev server)
- CORS: Permite localhost:5173

### Production

- Backend: Hosted on server (e.g., Railway, Render, EC2)
- Frontend: Deployed on Vercel/Netlify/S3
- CORS: Update to production domain
- Env vars: Move to .env production file
- HTTPS: Obligatorio para Supabase Auth

---

## 📝 Convenciones de Código

### Naming

- Files: `camelCase.tsx` (React) o `camelCase.js` (Backend)
- Components: `PascalCase`
- Variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

### Comments

- Docstrings JSDoc para funciones
- Inline comments para lógica compleja
- Explicar el "por qué", no el "qué"

### Structure

- Backend: Routes → Controllers → Services → Supabase
- Frontend: Pages → Components → Hooks → API
- Responsabilidades claras por layer

---

**Última actualización**: 24 de mayo de 2026
