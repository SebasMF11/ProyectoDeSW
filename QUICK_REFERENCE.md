# 📋 Quick Reference - PoliPlan

Resumen ejecutivo de la estructura real del proyecto y sus módulos principales.

---

## 🏗️ Estructura de carpetas actual

```text
ProyectoDeSW/
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── app.js
│   │   ├── index.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   └── tests/
│   └── tests/
│
├── frontend/
│   ├── package.json
│   └── src/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── integrations/
│       ├── pages/
│       ├── routers/
│       ├── styles/
│       ├── utils/
│       ├── App.tsx
│       └── main.tsx
│
├── docs/
├── specs/
├── README.md
├── GUIDE.md
├── ARCHITECTURE.md
├── QUICK_REFERENCE.md
├── render.yaml
└── .gitignore
```

---

## 🧩 Módulos principales del backend

```text
backend/src/routes/
├── StudentRoutes.js
├── SemesterRoutes.js
├── CourseRoutes.js
├── DayRoutes.js
├── AssessmentRoutes.js
├── GradeRoutes.js
├── CatalogRoutes.js
├── EnrollmentRoutes.js
├── ReportRoutes.js
└── ...
```

### Rutas reales registradas

```text
/student     -> auth, login, perfil, actualización
/semester    -> gestión de semestres
/course       -> cursos y estados académicos
/day         -> horarios y días por curso
/assessment  -> evaluaciones
/grade       -> calificaciones
/catalog     -> carreras, facultades y catálogo general
/enrollment  -> validación y proceso de matrícula
/reports     -> transcript y horario semanal
```

---

## 🌐 Módulos principales del frontend

```text
frontend/src/pages/
├── Home.tsx
├── student/
├── semester.tsx
├── course/
├── catalog/
├── enrollment/
├── assessment/
├── grade/
├── reports/
└── ...
```

Rutas definidas en `AppRouters.tsx`:

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

---

## 🔐 Flujo de autenticación actual

```text
1. Usuario entra a /auth
2. Envía email + password a /student/login
3. Backend valida con Supabase Auth
4. Recibe token JWT
5. Frontend guarda sesión y protege rutas
6. authMiddleware valida el token en cada petición privada
```

---

## 📊 Flujo de negocio principal: matrícula transaccional

```text
Frontend (/enrollment)
  │
  ├─ usuario selecciona materias del catálogo
  ├─ backend valida créditos máximos
  ├─ valida prerrequisitos
  ├─ valida cruces de horario
  ▼
POST /enrollment/validate
  │
  ▼
POST /enrollment/process
  │
  └─ matrícula aprobada y guardada
```

Reglas actuales:

- Límite de 26 créditos por período.
- Verificación de prerrequisitos.
- Prevención de materias duplicadas.
- Revisión de solapamiento horario.

---

## 📈 Flujo de reportes académicos

```text
Frontend (/reports/grades y /reports/schedule)
  │
  ▼
GET /reports/transcript
  │
  └─ devuelve notas, GPA, créditos y resumen académico

Frontend (/reports/schedule)
  │
  ▼
GET /reports/schedule
  │
  └─ devuelve horario semanal y agenda de evaluaciones
```

---

## 🧪 Comandos rápidos

### Backend

```bash
cd backend
npm install
npm run dev
npm test
```

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run build
```

---

## 📌 Diferencia clave con la documentación inicial

La versión inicial del proyecto describía una base conceptual. El repositorio actual incluye módulos más completos y concretos:

- catálogo universitario,
- matrícula transaccional,
- reportes académicos,
- gestión de evaluaciones y horarios,
- rutas y pantallas reales en el frontend.

Esta referencia refleja el estado actual del código, no solo la propuesta inicial.

---

Última actualización: 2026-09-24


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
