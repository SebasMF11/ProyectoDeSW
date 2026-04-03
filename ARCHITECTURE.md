# 🏛️ Arquitectura del Sistema

Documentación detallada de la arquitectura y flujos principales del proyecto.

---

## 📐 Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                      NAVEGADOR DEL USUARIO                   │
│                     (React + TypeScript)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ HTTP + JWT Token
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND EXPRESS.JS (Node.js)                    │
│  (Routes → Controllers → Services → Supabase)                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ SQL Queries
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE (PostgreSQL + Auth)                    │
│  - Tabla: student, semester, course, grade, etc.             │
│  - Auth: Gestiona credenciales y tokens JWT                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Autenticación y Seguridad

### Flujo Completo de Autenticación

```
REGISTRO
────────────────────────────────────────────────────────────────
1. Usuario fill: register form → POST /student/auth
   - Backend llama: supabase.auth.signUp()
   - Supabase crea usuario en auth.users
   - Email de confirmación enviado al usuario ✉️

2. Usuario confirma email → Email link a aplicación
   - Supabase marca email como confirmado

3. Ahora puede hacer LOGIN


LOGIN
────────────────────────────────────────────────────────────────
1. Usuario ingresa email/password → POST /student/login

2. Backend:
   - supabase.auth.signInWithPassword(email, password)
   - Si credenciales correctas → Supabase retorna JWT token
   - Backend busca/crea registro en tabla 'student'
   - Retorna token + datos del usuario

3. Frontend almacena token en sesión de Supabase
   - Automáticamente se agrega en Authorization header

4. httpClient interceptor:
   - Obtiene sesión actual de Supabase
   - Si token va a expirar (< 60 seg), lo refresca
   - Agrega "Authorization: Bearer <token>" en petición


PETICIÓN PROTEGIDA
────────────────────────────────────────────────────────────────
1. Frontend hace petición: GET /course-list
   - httpClient interceptor agrega JWT token

2. Backend recibe petición:
   - authMiddleware extrae token del header
   - Intenta validar con Supabase: supabase.auth.getUser(token)
   - Si falla Supabase (red), valida JWT manualmente
   - Si válido, agrega user a req.student
   - Si inválido, responde 401 Unauthorized

3. Controller accede a req.student.id para identificar usuario

4. Service consulta base de datos usando student_id
```

### Token JWT Structure

```
Token JWT = Header.Payload.Signature

Payload contiene:
{
  "sub": "user-id-uuid",        // subject (usuario_id)
  "email": "user@example.com",
  "aud": "authenticated",
  "exp": 1712345678,            // timestamp de expiración
  "iat": 1712341980             // issued at
}
```

---

## 📦 Arquitectura en Capas

### Backend: MVC Structure

```
REQUEST
  │
  ▼
ROUTES (studentRoutes.js)
  └─ Definir endpoints: POST /student/login, GET /student/view
  │
  ▼
MIDDLEWARES (authMiddleware.js)
  └─ Validar JWT token
  │
  ▼
CONTROLLERS (StudentController.js)
  └─ Recibir req.body
  └─ Validar datos (400 si inválido)
  └─ Llamar Service
  └─ Manejo errores
  └─ Response JSON
  │
  ▼
SERVICES (StudentService.js)
  └─ Lógica de negocio
  └─ Interactuar con Supabase
  └─ Retornar datos
  │
  ▼
SUPABASE
  └─ Base de datos
  └─ Auth service
  │
  ▼
RESPONSE JSON back to client
```

### Frontend: Component Structure

```
App.tsx (root)
  │
  ▼
AppRouters.tsx (route configuration)
  │
  ├─ PUBLIC: /auth, /register
  │   └─ Auth.tsx (login page)
  │   └─ Register.tsx (signup page)
  │
  └─ PROTECTED: /home, /course-list, /grade, etc.
      └─ ProtectedRouters wrapper
          ├─ Checks useAuth() hook
          ├─ Shows Navbar if authenticated
          └─ Page Component
              ├─ useForm hook (React Hook Form)
              ├─ useEffect (fetch data)
              ├─ httpClient calls (API requests)
              └─ JSX rendering
```

---

## 🔄 Flujo de Datos: Crear Curso

### Frontend Side

```
courseList.tsx
  │
  ├─ Botón "Nuevo curso" clicked
  │
  ▼
course.tsx loaded
  │
  ├─ useEffect: cargar semestres
  │   └─ semesterViewRequest() → GET /semester
  │       ✓ Lista semestres disponibles
  │
  ├─ User llena formulario (nombre, profesor, créditos, color, semestre)
  │
  └─ onClick="Submit"
      │
      ▼
  handleSubmit → courseCreateRequest()
      │
      ├─ httpClient.post("/course", { courseName, teacher, credits, color, semesterName })
      │
      └─ httpClient interceptor:
          ├─ Obtiene token JWT
          ├─ Agrega Authorization header
          ├─ Envía petición
          │
          ▼ HTTP POST http://localhost:3000/course
```

### Backend Side

```
Request: POST /course

▼

authMiddleware
  ├─ Lee Authorization header
  ├─ Extrae token JWT
  ├─ Valida con Supabase (o fallback manual)
  ├─ Agrega req.student.id ← user_id desde JWT
  │
  ▼

CourseController.createCourse()
  ├─ Valida entrada: courseName, teacher, credits, color, semesterName
  ├─ Convierte credits a number
  ├─ Error 400 si datos inválidos
  │
  ▼

CourseService.createCourse()
  ├─ Busca semester por nombre
  ├─ Traduce color nombre → hex (#FF5733)
  ├─ Inserta en tabla 'course'
  │   INSERT INTO course (course_name, teacher, credits, color, semester_id)
  ├─ Error si semestre no existe
  │
  ▼

Response 201 Created: { course_id: 5, message: "Course created" }

▼ HTTP 201

Frontend recibe respuesta
  ├─ console.log(res)
  ├─ navigate("/course-list")  ← Redirige
  │
  ▼

courseList.tsx remont
  ├─ useEffect: recarga list de cursos
  │   └─ courseViewRequest() ← GET /course
  │
  ▼

Se muestra nuevo curso en la lista
```

---

## 📊 Modelo de Datos - Relaciones

```
STUDENT (Estudiante)
├─ student_id (UUID, PK)
├─ name
├─ last_name
├─ email (UNIQUE)
└─ created_at

SEMESTER (Semestre Académico)
├─ semester_id (PK)
├─ semester_name
├─ start_date
├─ end_date

COURSE (Curso) ──┬─ FK → SEMESTER
├─ course_id (PK)
├─ course_name
├─ teacher
├─ credits
├─ color (hex)
└─ semester_id

DAY (Día Académico) ──┬─ FK → COURSE
├─ day_id (PK)
├─ course_id
├─ day_date
├─ start_time
├─ end_time

ASSESSMENT (Evaluación/Rúbrica)
├─ assessment_id (PK)
├─ assessment_name
├─ description
├─ total_points

GRADE (Calificación) ──┬─ FK → STUDENT, COURSE
├─ grade_id (PK)
├─ student_id
├─ course_id
├─ score
└─ created_at
```

---

## 🌐 Endpoints API

### Estudiantes

```
POST /student/auth
  Body: { name, lastName, email, password, password2 }
  Response: 201 { message: "Confirmation email sent" }

POST /student/login
  Body: { email, password }
  Response: 200 { token, user, message }

GET /student/view
  Header: Authorization: Bearer <token>
  Response: 200 { student }

GET /student/me
  Header: Authorization: Bearer <token>
  Response: 200 { student }
```

### Semestres

```
POST /semester
  Body: { semester_name, start_date, end_date }
  Response: 201 { semester_id, ... }

GET /semester
  Response: 200 [ { semester_id, semester_name, ... }, ... ]

PUT /semester/:id
  Body: { semester_name, start_date, end_date }
  Response: 200 { message: "Updated" }
```

### Cursos

```
POST /course
  Header: Authorization: Bearer <token>
  Body: { courseName, teacher, credits, color, semesterName }
  Response: 201 { course_id, ... }

GET /course
  Header: Authorization: Bearer <token>
  Response: 200 [ { course_id, course_name, ... }, ... ]

PUT /course/:id
  Header: Authorization: Bearer <token>
  Body: { ... }
  Response: 200 { message: "Updated" }

DELETE /course/:id
  Header: Authorization: Bearer <token>
  Response: 200 { message: "Deleted" }
```

---

## 🔄 State Management

### Frontend State

**Global (Supabase Session)**

- Usuario actual
- JWT Token
- Expiración de token
- ✓ Manejado automáticamente por useAuth hook

**Component Local**

- Form data (React Hook Form)
- Loading states
- Error messages
- Lists (semesters, courses, grades)

### No se usa Redux/Context

- Supabase auth session es "global"
- useAuth hook lo expone a cualquier componente
- Cada página maneja su propio estado local

---

## 🛡️ Manejo de Errores

### Backend Errors

**Validación (400)**

```javascript
if (!email || !password) {
  res.status(400).json({ error: "Email and password required" });
}
```

**Autenticación (401)**

```javascript
if (!token || token is invalid) {
  res.status(401).json({ error: "Token no proporcionado" });
}
```

**Rate Limiting (429)**

```javascript
if (error?.code === "over_email_send_rate_limit") {
  res.status(429).json({ error: "Too many attempts" });
}
```

**Servidor (500)**

```javascript
catch (error) {
  res.status(500).json({ error: "Internal server error" });
}
```

### Frontend Errors

**Validación (form validation)**

- React Hook Form valida registrado onSubmit

**Axios Errors**

```javascript
catch (error) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error;
    setErrorMessage(message || "Error occurred");
  }
}
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

**Última actualización**: 2 de abril de 2026
