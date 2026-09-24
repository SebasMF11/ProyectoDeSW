# 📋 Quick Reference - Estructura y Flujos

Resumen ejecutivo de cómo funciona el proyecto.

---

## 🏗️ Estructura de Carpetas

```
ProyectoDeSW/
├── backend/
│   ├── package.json
│   └── src/
│       ├── app.js                    ← Configuración Express
│       ├── index.js                  ← Servidor local:3000
│       ├── config/
│       │   └── supabase.js          ← Cliente Supabase
│       ├── routes/                   ← Endpoints API
│       │   ├── StudentRoutes.js
│       │   ├── CourseRoutes.js
│       │   ├── SemesterRoutes.js
│       │   ├── GradeRoutes.js
│       │   ├── AssessmentRoutes.js
│       │   ├── DayRoutes.js
│       │   └── CatalogRoutes.js
│       ├── controllers/              ← Maneja HTTP requests
│       │   ├── StudentController.js
│       │   ├── CourseController.js
│       │   └── ...
│       ├── services/                 ← Lógica de negocio
│       │   ├── StudentService.js
│       │   ├── CourseService.js
│       │   └── ...
│       ├── middlewares/              ← Validaciones
│       │   └── authMiddleware.js    ← Valida JWT
│       └── utils/
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts              ← Build config
│   ├── index.html
│   └── src/
│       ├── main.tsx                 ← Entry point
│       ├── App.tsx                  ← Root component
│       ├── index.css                ← Estilos globales
│       ├── routers/
│       │   ├── AppRouters.tsx       ← Definición de rutas
│       │   └── ProtectedRouters.tsx ← Wrapper de seguridad
│       ├── pages/                   ← Páginas principales
│       │   ├── Home.tsx
│       │   ├── student/
│       │   │   ├── Auth.tsx
│       │   │   ├── Register.tsx
│       │   │   ├── profile.tsx
│       │   │   └── settings.tsx
│       │   ├── course/
│       │   │   ├── course.tsx       ← Crear/editar
│       │   │   ├── courseList.tsx   ← Listar
│       │   │   └── day.tsx
│       │   ├── grade/
│       │   │   ├── grade.tsx
│       │   │   └── gradeList.tsx
│       │   ├── assessment/
│       │   │   ├── assessment.tsx
│       │   │   └── assessmentList.tsx
│       │   └── semester.tsx
│       ├── components/              ← Componentes reutilizables
│       │   ├── navbar.tsx
│       │   ├── menu.tsx
│       │   └── calendar/
│       │       └── Calendar.tsx
│       ├── hooks/                   ← Custom hooks
│       │   └── useAuth.ts          ← Gestiona sesión
│       ├── api/                     ← Clientes HTTP
│       │   ├── httpClient.ts       ← Axios core (+ JWT interceptor)
│       │   ├── course.ts
│       │   ├── students.api.ts
│       │   ├── grade.ts
│       │   ├── semester.ts
│       │   ├── assessment.api.ts
│       │   └── day.api.ts
│       ├── integrations/             ← Librerías externas
│       │   └── supabase.tsx         ← Cliente Supabase
│       └── styles/                  ← Estilos componentes
│
├── README.md                         ← Documentación principal
├── ARCHITECTURE.md                   ← Flujos técnicos detallados
├── GUIDE.md                          ← Guía de desarrollo
└── .env.example                      ← Variables de entorno (template)
```

---

## 🔐 Flow: Registro e Inicio de Sesión

```
┌─────────────────────────────────────────────────────────────┐
│ REGISTRO                                                    │
│                                                             │
│ 1. Usuario en /register                                    │
│    → Form: { name, lastName, email, password }            │
│                                                             │
│ 2. POST /student/auth                                     │
│    ↓ Backend                                               │
│    → authMiddleware: SKIP (público)                       │
│    → StudentController.authStudent()                      │
│    → StudentService.authStudent()                         │
│    → supabase.auth.signUp()                              │
│    ← Email de confirmación enviado                        │
│                                                             │
│ 3. Usuario confirma email                                 │
│    → Supabase marca email como verificado                │
│    → Ahora puede hacer LOGIN                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ LOGIN                                                       │
│                                                             │
│ 1. Usuario en /auth                                        │
│    → Form: { email, password }                            │
│                                                             │
│ 2. POST /student/login                                    │
│    ↓ Backend                                               │
│    → StudentController.loginStudent()                     │
│    → StudentService.loginStudent()                        │
│    → supabase.auth.signInWithPassword()                  │
│    ← Token JWT retornado                                  │
│    → Crear/actualizar registro en tabla 'student'        │
│    ← Response: { token, user, message }                   │
│                                                             │
│ 3. Frontend recibe token                                   │
│    → Se almacena en sesión de Supabase automáticamente   │
│    → useAuth hook lo captura                              │
│    → Redirige a /home                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PETICIÓN PROTEGIDA                                          │
│                                                             │
│ Usuario visita /course-list                                │
│                                                             │
│ 1. ProtectedRouters verifica sesión                        │
│    → useAuth() lee sesión de Supabase                     │
│    → Si sin sesión → Redirige a /auth                    │
│    → Si con sesión → Renderiza Navbar + Página           │
│                                                             │
│ 2. Page hace petición: GET /course-list                   │
│    ↓ httpClient (Frontend)                                │
│    → Interceptor: obtiene token de Supabase              │
│    → Agrega header: "Authorization: Bearer <token>"      │
│                                                             │
│ 3. Backend recibe petición                                │
│    ↓ authMiddleware                                        │
│    → Lee header Authorization                            │
│    → Extrae token                                         │
│    → Valida con Supabase: supabase.auth.getUser(token)  │
│    → Si falla Supabase, fallback: validar JWT localmente │
│    → Agrega req.student = { id, email, ... }            │
│    ↓ CourseController.getCourses()                        │
│    → Accede a req.student.id para filtrar                │
│    ← Response: List de cursos del estudiante             │
│                                                             │
│ 4. Frontend recibe datos                                   │
│    → Renderiza lista                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Estados de una Página

```typescript
// Estado inicial (cargando)
session = undefined
→ ProtectedRouters retorna null
→ Pantalla en blanco mientras se carga sesión

// Sin autenticación
session = null
→ ProtectedRouters: <Navigate to="/auth" />
→ Redirige a login

// Autenticado
session = Session { user: {...}, access_token: "..." }
→ ProtectedRouters renderiza <Navbar /> + <Page />
→ Page puede hacer peticiones protegidas
```

---

## 🔄 Validaciones en Capas

```
CAPA 1: Frontend (React Hook Form)
├─ Validación local del formulario
├─ Email format, campos requeridos, longitudes
└─ Muestra errores antes de enviar

CAPA 2: Backend Controller
├─ Valida que datos no sean vacíos
├─ Valida tipos (número, string, etc.)
└─ Retorna 400 Bad Request si inválido

CAPA 3: Backend Service
├─ Valida lógica de negocio
├─ Email único, usuario existe, etc.
└─ Retorna error específico si falla

CAPA 4: Database (Supabase)
├─ Constraints SQL: UNIQUE, NOT NULL, etc.
├─ Tipos de datos
└─ Triggers / Validaciones SQL

Usuario ve error → Corrije → Reintenta
```

---

## 📡 Ejemplo Real: Crear Curso

```
PASO 1: Frontend
────────────────
course.tsx
  └─ Form: { courses_id: "uuid", teacher: "García", credits: 3, color: "blue", semesterName: "2025-1" }
  └─ onSubmit → courseCreateRequest(formData)

PASO 2: Frontend API
────────────────────
httpClient.post("course/create", formData)
  └─ Interceptor:
      ├─ getSession() de Supabase
      ├─ Si expira pronto, refreshSession()
      └─ Agrega Authorization: Bearer <token>

PASO 3: Request HTTP
────────────────────
POST http://localhost:3000/course/create
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "courses_id": "uuid",
  "teacher": "García",
  "credits": 3,
  "color": "blue",
  "semesterName": "2025-1"
}

PASO 4: Backend Routes
──────────────────────
CourseRoutes.js
  └─ router.post("/create", authMiddleware, courseController.createCourse)

PASO 5: authMiddleware
──────────────────────
├─ Lee header Authorization
├─ Extrae token
├─ Valida: supabase.auth.getUser(token)
├─ Agrega req.student = { id: "user-1234", email: "... }
└─ Continúa al controller

PASO 6: Backend Controller
──────────────────────────
CourseController.createCourse()
├─ Obtiene: req.body = { courses_id, teacher, credits, color, semesterName }
├─ Valida: todos los campos presentes, credits es número
├─ Llama: courseService.createCourse(...)
├─ Maneja errores
└─ Responde: 201 { course_id, message }

PASO 7: Backend Service
───────────────────────
CourseService.createCourse()
├─ Valida lógica: semestre existe, prerequisito y conversión de color
├─ Query Supabase:
│   INSERT INTO course (courses_id, teacher, credits, color, semester_id, status)
│   VALUES ('uuid', 'García', 3, '#3380FF', 'semester-uuid', 'active')
├─ Retorna: { course_id: 5, ... }
└─ Si error: lanza exception

PASO 8: Response HTTP
─────────────────────
201 Created
Content-Type: application/json

{
  "course_id": "uuid",
  "courses_id": "catalog-uuid",
  "teacher": "García",
  "credits": 3,
  "color": "#3380FF",
  "semester_id": "semester-uuid",
  "status": "active",
  "message": "Course created successfully"
}

PASO 9: Frontend
────────────────
course.tsx
├─ Recibe response 201
├─ console.log(res)
├─ navigate("/course-list")

PASO 10: Page Reload
────────────────────
courseList.tsx
├─ useEffect: carga lista de cursos
├─ GET /course/view/:semesterName
├─ Renderiza nuevo curso en tabla
└─ Usuario ve cambio
```

---

## 💻 Comandos Útiles

```bash
# Backend
cd backend && npm run dev          # Inicia servidor local:3000
npm test                            # Ejecutar tests (si existen)
npm install <package>               # Agregar dependencia

# Frontend
cd frontend && npm run dev          # Inicia Vite local:5173
npm run build                       # Build para producción
npm run preview                     # Preview del build
npm install <package>               # Agregar dependencia

# Git
git status                          # Ver cambios
git add .                           # Preparar cambios
git commit -m "mensaje"             # Guardar cambios
git push                            # Subir a GitHub
```

---

## 🐛 Errores Típicos y Soluciones

| Error                                       | Causa                       | Solución                                      |
| ------------------------------------------- | --------------------------- | --------------------------------------------- |
| `Cannot GET /course/view`                   | Ruta no definida            | Verificar path en AppRouters + backend routes |
| `Token no proporcionado`                    | Falta Authorization header  | Verificar que httpClient agregue Bearer token |
| `User not found`                            | Email no registrado         | Revisar Supabase → Authentication → Users     |
| `CORS error`                                | Backend no permite frontend | Verificar CORS config en app.js               |
| `Cannot read property 'email' of undefined` | req.student es undefined    | Verificar authMiddleware se ejecutó           |
| `Module not found`                          | Import path incorrecto      | Usar rutas relativas: `../../`                |
| `Duplicate key value`                       | Email/ID ya existe en BD    | Usar email diferente                          |

---

## 🔗 URLs Quick Links

- **Backend API Base:** `http://localhost:3000`
- **Frontend App:** `http://localhost:5173`
- **Supabase Dashboard:** `https://app.supabase.com`
- **Backend Docs:** `http://localhost:3000/` (solo dice "Backend 🚀")
- **API Testing:** `Postman`, `Insomnia`, o `curl`

---

## 📊 Tabla de Endpoints

| Método | Endpoint                                | Protegido | Función                     |
| ------ | --------------------------------------- | --------- | --------------------------- |
| POST   | `/student/auth`                         | ❌        | Registro                    |
| POST   | `/student/login`                        | ❌        | Login                       |
| GET    | `/student/view`                         | ✅        | Obtener perfil              |
| GET    | `/student/me`                           | ✅        | Obtener usuario actual      |
| PUT    | `/student/update`                       | ✅        | Actualizar estudiante       |
| PUT    | `/student/password`                     | ✅        | Cambiar contraseña          |
| GET    | `/semester/view`                        | ✅        | Listar semestres            |
| POST   | `/semester/create`                      | ✅        | Crear semestre              |
| PUT    | `/semester/update/:semesterId`          | ✅        | Actualizar semestre         |
| GET    | `/course/view`                          | ✅        | Listar cursos activos       |
| GET    | `/course/view/:semesterName`            | ✅        | Listar cursos por semestre  |
| POST   | `/course/create`                        | ✅        | Crear curso                 |
| PUT    | `/course/update/:courseId`              | ✅        | Editar curso                |
| PUT    | `/course/status/:courseId`              | ✅        | Cambiar estado del curso    |
| DELETE | `/course/delete/:courseId`              | ✅        | Eliminar curso              |
| GET    | `/catalog/careers`                      | ❌        | Listar carreras             |
| GET    | `/catalog/faculties`                    | ✅        | Listar facultades           |
| GET    | `/catalog/courses`                      | ✅        | Listar catálogo de materias |
| GET    | `/catalog/courses/available`            | ✅        | Materias disponibles        |
| POST   | `/assessment/create`                    | ✅        | Crear evaluación            |
| GET    | `/assessment/view`                      | ✅        | Listar evaluaciones         |
| GET    | `/assessment/view/course/:courseId`     | ✅        | Evaluaciones por curso      |
| GET    | `/assessment/view/semester/:semesterId` | ✅        | Evaluaciones por semestre   |
| GET    | `/assessment/view/day`                  | ✅        | Evaluaciones por día        |
| GET    | `/assessment/view/month`                | ✅        | Evaluaciones por mes        |
| POST   | `/grade/create`                         | ✅        | Crear calificación          |
| GET    | `/grade/view/course/:courseId`          | ✅        | Calificaciones por curso    |
| GET    | `/grade/current/:courseId`              | ✅        | Nota actual del curso       |
| GET    | `/grade/average/:semesterId`            | ✅        | Promedio del semestre       |
| POST   | `/day/create`                           | ✅        | Crear horario               |
| GET    | `/day/view/:courseId`                   | ✅        | Listar horarios del curso   |
| PUT    | `/day/update/:dayId`                    | ✅        | Actualizar horario          |
| DELETE | `/day/delete/:dayId`                    | ✅        | Eliminar horario            |

---

## 🎓 Próximos Pasos para Aprender

1. **Leer README.md** - Descripción general del proyecto
2. **Revisar ARCHITECTURE.md** - Flujos técnicos detallados
3. **Estudiar GUIDE.md** - Cómo agregar nuevas features
4. **Explorar archivos con comentarios:**
   - backend/src/index.js
   - backend/src/app.js
   - backend/src/middlewares/authMiddleware.js
   - backend/src/controllers/StudentController.js
   - frontend/src/main.tsx
   - frontend/src/routers/AppRouters.tsx

---

**Versión**: 2.1  
**Última actualización**: 24 mayo de 2026
