# 📚 Sistema de Gestión Académica

Sistema completo de gestión académica desarrollado con **Node.js/Express** (backend) y **React + TypeScript** (frontend).

## 🎯 Descripción General

Este proyecto es una plataforma de gestión académica que permite:

- **Autenticación**: Registro e inicio de sesión de estudiantes con Supabase Auth
- **Gestión de Semestres**: Crear períodos académicos
- **Gestión de Cursos**: Registrar cursos dentro de semestres
- **Calendario Académico**: Crear días y horarios para cursos
- **Evaluaciones**: Crear rúbricas y evaluaciones de desempeño
- **Calificaciones**: Registrar y consultar calificaciones
- **Perfil de Estudiante**: Gestionar información personal y ver historial

---

## 🏗️ Arquitectura del Proyecto

### Backend (Node.js + Express)

- **Framework**: Express.js
- **Autenticación**: Supabase Auth (JWT)
- **Base de Datos**: Supabase (PostgreSQL)
- **Patrón**: MVC en capas (Routes → Controllers → Services → DB)

**Estructura de carpetas:**

```
backend/src/
├── app.js                 # Configuración Express
├── index.js              # Servidor (entry point)
├── config/               # Configuración (Supabase)
├── routes/               # Definición de endpoints API
├── controllers/          # Manejo de peticiones HTTP
├── services/             # Lógica de negocio
└── middlewares/          # Autenticación JWT
```

**Endpoints principales:**

- `POST /student/auth` - Registro de estudiante
- `POST /student/login` - Autenticación
- `POST /semester` - Crear semestre
- `POST /course` - Crear curso
- `POST /assessment` - Crear evaluación
- `GET /grade` - Listar calificaciones

### Frontend (React + TypeScript)

- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **Autenticación**: Supabase Auth
- **HTTP Client**: Axios con interceptores JWT
- **Estilos**: Tailwind CSS

**Estructura de carpetas:**

```
frontend/src/
├── main.tsx              # Entry point
├── App.tsx               # Componente raíz
├── pages/                # Páginas de la aplicación
├── routers/              # Definición de rutas (AppRouters, ProtectedRouters)
├── hooks/                # Custom hooks (useAuth)
├── api/                  # Clientes HTTP para APIs
├── components/           # Componentes reutilizables
├── integrations/         # Integración con Supabase
└── styles/               # Estilos globales
```

---

## 🔐 Flujo de Autenticación

### Registro

1. Usuario completa formulario en `/register`
2. Frontend hace POST a `POST /student/auth`
3. Backend valida datos y crea usuario en Supabase
4. Supabase envía email de confirmación
5. Usuario confirma email y puede hacer login

### Login

1. Usuario ingresa email/password en `/auth`
2. Frontend hace POST a `POST /student/login`
3. Backend valida credenciales contra Supabase
4. Supabase retorna JWT token
5. Frontend almacena token en sesión de Supabase
6. Token se agrega automáticamente en header `Authorization: Bearer <token>` en todas las peticiones

### Protección de Rutas

1. `ProtectedRouters` envoltura comprueba sesión con `useAuth` hook
2. Si no hay sesión, redirige a `/auth`
3. Si hay sesión, renderiza navbar + componente de página
4. Backend valida token en header con `authMiddleware`

---

## 📋 Entidades Principales

### Student (Estudiante)

```javascript
{
  id: string (UUID),
  name: string,
  lastName: string,
  email: string (único),
  created_at: timestamp
}
```

### Semester (Semestre)

```javascript
{
  semester_id: number,
  semester_name: string,
  start_date: date,
  end_date: date
}
```

### Course (Curso)

```javascript
{
  course_id: number,
  course_name: string,
  teacher: string,
  credits: number,
  color: string (hex),
  semester_id: number (FK)
}
```

### Assessment (Evaluación/Rúbrica)

```javascript
{
  assessment_id: number,
  assessment_name: string,
  description: string,
  total_points: number
}
```

### Grade (Calificación)

```javascript
{
  grade_id: number,
  student_id: string (FK),
  course_id: number (FK),
  score: number,
  created_at: timestamp
}
```

### Day (Día Académico)

```javascript
{
  day_id: number,
  course_id: number (FK),
  day_date: date,
  start_time: time,
  end_time: time
}
```

---

## 🚀 Cómo Ejecutar

### Backend

```bash
cd backend
npm install
npm run dev  # o npm start
```

- Servidor en http://localhost:3000

### Frontend

```bash
cd frontend
npm install
npm run dev  # Vite dev server
```

- Aplicación en http://localhost:5173

### Variables de Entorno

Crear archivo `.env` en backend:

```
PORT=3000
SUPABASE_URL=<tu_url_supabase>
SUPABASE_ANON_KEY=<tu_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<tu_service_key>
```

---

## 📡 Ejemplo de Flujo Completo

### 1. Registro de Estudiante

```bash
POST http://localhost:3000/student/auth
{
  "name": "Juan",
  "lastName": "Pérez",
  "email": "juan@ejemplo.com",
  "password": "securePass123",
  "password2": "securePass123"
}
```

### 2. Login

```bash
POST http://localhost:3000/student/login
{
  "email": "juan@ejemplo.com",
  "password": "securePass123"
}
→ Response: { token: "eyJhbGc...", user: {...} }
```

### 3. Crear Semestre (con token autenticado)

```bash
POST http://localhost:3000/semester
Authorization: Bearer eyJhbGc...
{
  "semester_name": "2025-1",
  "start_date": "2025-01-01",
  "end_date": "2025-05-31"
}
```

### 4. Crear Curso (dentro de semestre)

```bash
POST http://localhost:3000/course
Authorization: Bearer eyJhbGc...
{
  "courseName": "Matemáticas",
  "teacher": "Prof. García",
  "credits": 3,
  "color": "red",
  "semesterName": "2025-1"
}
```

---

## 🛡️ Seguridad

- **JWT Tokens**: Emitidos por Supabase, validados en backend
- **CORS**: Configurado para permitir frontend en http://localhost:5173
- **Middleware de Autenticación**: Valida token en todas las rutas protegidas
- **Fallback Local**: Si Supabase no responde, valida JWT decodificando localmente
- **Token Refresh**: Frontend actualiza automáticamente tokens próximos a expirar

---

## 🔧 Middlewares y Hooks

### Backend

- `authMiddleware.js`: Valida JWT, permite acceso solo a rutas protegidas

### Frontend

- `useAuth.tsx`: Lee sesión de Supabase y suscribe a cambios de autenticación
- `httpClient.ts`: Interceptor que agrega token Bearer automáticamente

---

## 📊 Patrón de Datos

```
Frontend UI Request
    ↓
React Router (AppRouters)
    ↓
ProtectedRouters (valida sesión)
    ↓
Page Component (React)
    ↓
httpClient (axios) - agrega token JWT
    ↓
Backend Express Server
    ↓
authMiddleware (valida token)
    ↓
Controller (procesa petición)
    ↓
Service (lógica de negocio)
    ↓
Supabase (base de datos)
```

---

## 📝 Notas Importantes

- **Base de datos**: Supabase usa PostgreSQL, todas las tablas están en `public` schema
- **Fechas**: Se guardan en formato ISO 8601 (YYYY-MM-DD)
- **Idioma**: Backend retorna mensajes en inglés, frontend puede estar en español
- **CORS**: Solo acepta peticiones del frontend en desarrollo (configurar en producción)

---

**Última actualización**: 2 de abril de 2026
