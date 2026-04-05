# 📚 PoliPlan: Academic Management for the Politecnico JIC

Full academic management system developed using **Node.js/Express** (backend) y **React + TypeScript** (frontend).

# 🎯 Project description

## Research question
How can a web-based academic planning application improve the organization and follow-up of the academic performance of students at the Politecnico JIC?

## Introduction
Nowadays, many students at the Politecnico JIC plan their semesters using a variety of tools such as physical diaries, notes on their mobile phones or independent files. This situation makes it difficult to organize subjects, remember important dates (mid-term exams, workshops, assignments) and keep proper record of academic performance.

## Main objective
Using the SMART methodology, develop a web application called PoliPlan that enables students at the Politecnico JIC to plan, organize and follow up on their activities and academic performance during the semester.

## Specific objectives
- Implement solutions that align with students' real needs, taking into account how the schedule is currently managed.
- Identify the main problems students face in their current scheduling process, such as difficulties in updating schedules and potential mistakes when entering their information.
- Analyse how current schedules are managed, in order to understand the weaknesses in the process of adding, editing and removing courses from a student's schedule in each semester.

## Scope
The PoliPlan system will enable students to:
 - Register and manage their subjects.
 -  Set academic schedules.
 -  Record dates for mid-term exams, workshops, assignments and final exams.
 -  Track their grades throughout the semester.
 -  View their academic schedule on a web interface.
    
This phase of the project does **NOT** include:
  - Integration with official institutional systems.
  - Management of academic enrolment.
  - Native mobile app.
  - Administrative features for teaching staff.

## Solution

A full-featured app where students can register their courses, class schedules, exam dates, assignments and mid-term exams. The system allows students to track their grades, taking into account the two mandatory mid-term exams and the overall academic term.

---
# 🏗️ Project Architecture

## Conceptual Diagram

<img width="1195" height="1315" alt="Conceptual Diagram PoliPlan" src="https://github.com/user-attachments/assets/97233703-d1a9-4ff0-bc61-f4e143de9c1a" />

## Architectural Pattern
We chose the Layered Architecture because it allows a strict separation of responsibilities, which is crucial for a system that handles various flows of academic data (schedules, grades and dates).
The main reasons for this choice are:
- **Frontend and Backend Decoupling:** Using React for the view and Node.js for the logic, the layered architecture allows the backend to function as a independent API REST. 
-**Maintainability and scalability:** By separating the business logic (services) from data persistence (repositories), anything that changes in the way that Politecnico JIC assesses students (such as how mandatory midterms are calculated) can be implemented in one place without affecting the rest of the system.
- **Good code organization practices:**
    - Controllers: These are only responsible for receiving student requests and validating input data.
    - Services: This is where PoliPlan’s “logic” resides, processing planning and tracking academic performance.
    - Repositories: These manage communication exclusively with PostgreSQL, isolating SQL queries from the rest of the application.
- **Facility for Testing:** This structure allows you to perform unit tests on the logic of the services without needing the database or the interface to be connected, ensuring more robust software.

PoliPlan has evolved towards a cleaner layered architecture, where the ‘View’ is an independent project in React and the ‘Model’ is managed through specialised Repositories and Services.


## Layered Architecture

### Project structure
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
│       │   └── DayRoutes.js
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
│       │   └── useAuth.tsx         ← Gestiona sesión
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



**Backend (Node.js + Express)**

- **Framework**: Express.js
- **Authentication**: Supabase Auth (JWT)
- **Database**: Supabase (PostgreSQL)
- **Pattern**: MVC in layers (Routes → Controllers → Services → DB)


**Endpoints principales:**

- `POST /student/auth` - Student's register
- `POST /student/login` - Authentication
- `POST /semester` - Create a semester
- `POST /course` - Create a course
- `POST /assessment` - Create an assessment 
- `GET /grade` - List grades

**Frontend (React + TypeScript)**

- **Framework**: React 18 + Vite
- **Routing**: React Router v6
- **Authentication**: Supabase Auth
- **HTTP Client**: Axios with JWC interceptors
- **Styles**: Tailwind CSS

---

# 📊 Data model - Relations
```
STUDENT 
├─ student_id (UUID, PK)
├─ name
├─ last_name
├─ email (UNIQUE)
└─ created_at

SEMESTER 
├─ semester_id (PK)
├─ semester_name
├─ start_date
├─ end_date

COURSE  ──┬─ FK → SEMESTER
├─ course_id (PK)
├─ course_name
├─ teacher
├─ credits
├─ color (hex)
└─ semester_id

DAY  ──┬─ FK → COURSE
├─ day_id (PK)
├─ course_id
├─ day_date
├─ start_time
├─ end_time

ASSESSMENT 
├─ assessment_id (PK)
├─ assessment_name
├─ description
├─ total_points

GRADE  ──┬─ FK → STUDENT, COURSE
├─ grade_id (PK)
├─ student_id
├─ course_id
├─ score
└─ created_at
```

---

# 📋 Main Entities

### Student 

```javascript
{
  id: string (UUID),
  name: string,
  lastName: string,
  email: string (único),
  created_at: timestamp
}
```

### Semester 

```javascript
{
  semester_id: number,
  semester_name: string,
  start_date: date,
  end_date: date
}
```

### Course 

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

### Assessment 

```javascript
{
  assessment_id: number,
  assessment_name: string,
  description: string,
  total_points: number
}
```

### Grade 

```javascript
{
  grade_id: number,
  student_id: string (FK),
  course_id: number (FK),
  score: number,
  created_at: timestamp
}
```

### Day 

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
# 🔧Technologies Used / Tools

- **Frontend:** React with Vite.
- **Backend:** Node.js.
- **Database:** PostgreSQL, using Supabase as the hosting platform.
- **Design:** Figma for prototyping.
- **Technical Documentation:** Lucidchart for UML diagrams.
---

# 📄Requirements
To run this project locally, make sure you have installed:

- Node.js (LTS version recommended).
- NPM or Yarn for package management.
- A Supabase account for the PostgreSQL database.

---
# 📖 Guide
## Installation

### 1. Clone and Install

```bash
# Clonar repositorio
cd ProyectoDeSW

# Backend
cd backend
npm install

# Frontend (en otra terminal)
cd ../frontend
npm install
```

### 2. Set environment variables

Create `backend/.env`:

```env
PORT=3000
SUPABASE_URL=https://tuproyecto.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

Obtain keys de: https://app.supabase.com → Settings → API

### 3. Start Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

- Backend: http://localhost:3000
- Frontend: http://localhost:5173


---
## 🚀 Execution

### Backend

```bash
cd backend
npm install
npm run dev  # o npm start
```

- Server at http://localhost:3000

### Frontend

```bash
cd frontend
npm install
npm run dev  # Vite dev server
```

- Application in http://localhost:5173

### Environment Variables

Create file `.env` in backend:

```
PORT=3000
SUPABASE_URL=<tu_url_supabase>
SUPABASE_ANON_KEY=<tu_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<tu_service_key>
```

---

# 📡 Example of the whole process

### 1. Student's register

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

### 3. Create Semester (with authenticated token)

```bash
POST http://localhost:3000/semester
Authorization: Bearer eyJhbGc...
{
  "semester_name": "2025-1",
  "start_date": "2025-01-01",
  "end_date": "2025-05-31"
}
```

### 4.  Create Course (within a semester)

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

# 🛡️ Security

- **JWT Tokens**: Generated by Supabase, validated on the backend
- **CORS**: Configured to allow frontend in http://localhost:5173
- **Authentication middleware**: Validate token on all protected routes
- **Fallback Local**: If Supabase isn't responding, validate the JWT by decoding it locally
- **Token Refresh**: The frontend automatically updates tokens that are about to expire

---

# 🔧 Middlewares y Hooks

### Backend

- `authMiddleware.js`: Validates JWT, allows access only to protected routes

### Frontend

- `useAuth.tsx`: Read Supabase session and subscribe to authentication changes
- `httpClient.ts`:  Interceptor that automatically adds a Bearer token

---

## 💻 Useful commands

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

# 🔗 URLs Quick Links

- **Backend API Base:** `http://localhost:3000`
- **Frontend App:** `http://localhost:5173`
- **Supabase Dashboard:** `https://app.supabase.com`
- **Backend Docs:** `http://localhost:3000/` 
- **API Testing:** `Postman`, `Insomnia`, o `curl`
  
---

# 📖 Documentation

## Personal

- **RF and RNF:** https://docs.google.com/spreadsheets/d/1KHZ0umoQhq_7Eg1aUUMwLu2CGzGqLAEzf1TPSSUjEs8/edit?usp=sharing
- **CS:** https://lucid.app/lucidchart/4c5bad2c-3f14-4c1b-8e61-10aee3b1cb0a/edit?viewport_loc=-2116%2C-726%2C1615%2C652%2C0_0&invitationId=inv_73043b7a-f216-4ef9-90e6-4ba0f176ee3d
- **Mockups:** https://www.figma.com/design/3z4l2A3P5BJJ6YblUR6EyF/PoliPlan?node-id=0-1&p=f&m=draw
- **Class Diagram:** https://lucid.app/lucidchart/14b5b23f-0696-47bd-a06e-84b67b64979d/edit?viewport_loc=-4188%2C-745%2C2481%2C982%2C0_0&invitationId=inv_75676d47-673c-451d-bb26-f1d7c7c5be34
- **Package Diagram:** https://lucid.app/lucidchart/edfb2ad8-89cc-45fd-bddf-a7ae0ffdc757/edit?viewport_loc=-458%2C-255%2C2240%2C922%2C0_0&invitationId=inv_41e8dad8-6c0f-4eda-b0dd-aa7efecaa722
- **Activity Diagram:** https://lucid.app/lucidchart/a5eb8fff-b0e3-46c0-895d-8ddfe6fd2a3e/edit?viewport_loc=2917%2C-220%2C1827%2C839%2C0_0&invitationId=inv_3db0106e-32d0-422c-8e9f-7bc66f6e9556

## External

- **Express.js:** https://expressjs.com
- **React:** https://react.dev
- **Supabase:** https://supabase.com/docs
- **Axios:** https://axios-http.com
- **React Router:** https://reactrouter.com
- **React Hook Form:** https://react-hook-form.com

---

# 👤 Autores

- **Sara Camila Echeverri** - Estudiante de Ingeniería Informática
- **Sara Jimenez Restrepo** - Estudiante de Ingeniería Informática.
- **Sara Monsalve Lopera** - Estudiante de Ingeniería Informática.
- **Sebastián Montoya Foronda** - Estudiante de Ingeniería Informática.
- **Sebastián Tunjuelo Lujan** - Estudiante de Ingeniería Informática.


---

**Última actualización**: 4 de abril de 2026
