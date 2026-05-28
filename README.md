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
- Set academic schedules.
- Record dates for mid-term exams, workshops, assignments and final exams.
- Track their grades throughout the semester.
- View their academic schedule on a web interface.

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

- **Frontend and Backend Decoupling:** Using React for the view and Node.js for the logic, the layered architecture allows the backend to function as a independent API REST. -**Maintainability and scalability:** By separating the business logic (services) from data persistence (repositories), anything that changes in the way that Politecnico JIC assesses students (such as how mandatory midterms are calculated) can be implemented in one place without affecting the rest of the system.
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
- `POST /semester/create` - Create a semester
- `POST /course/create` - Create a course
- `POST /assessment` - Create an assessment
- `GET /grade/view/course/:courseId` - List grades for a course

**Frontend (React + TypeScript)**

- **Framework**: React 19 + Vite
- **Routing**: React Router 7
- **Authentication**: Supabase Auth
- **HTTP Client**: Axios with JWT interceptor
- **Styles**: Tailwind CSS + local component styles

---

# 📊 Data model - Relations

```
STUDENT
├─ student_id UUID PK, default auth.uid()
├─ name
├─ last_name
├─ email UNIQUE
├─ created_at
└─ career_id FK → career.career_id

CAREER
├─ career_id UUID PK
└─ name UNIQUE

FACULTY
├─ faculty_id UUID PK
└─ name UNIQUE

COURSES (catalog)
├─ courses_id UUID PK
├─ name UNIQUE
├─ faculty_id FK → faculty.faculty_id
└─ prerequisito FK → courses.courses_id

COURSES_PER_CAREER
├─ id UUID PK
├─ career_id FK → career.career_id
└─ courses_id FK → courses.courses_id

SEMESTER
├─ semester_id UUID PK
├─ name
├─ start_date
├─ end_date
├─ student_id FK → student.student_id
├─ midterm_week daterange
└─ final_exam_week daterange

COURSE
├─ course_id UUID PK
├─ credits integer
├─ teacher nullable
├─ color
├─ status
├─ semester_id FK → semester.semester_id
└─ courses_id FK → courses.courses_id

DAY
├─ day_id UUID PK
├─ day_of_week
├─ start_time
├─ end_time
├─ classroom nullable
└─ course_id FK → course.course_id

ASSESSMENT
├─ assessment_id UUID PK
├─ type
├─ due_date timestamptz
├─ name
├─ course_id FK → course.course_id
└─ percentage real

GRADE
├─ grade_id UUID PK
├─ value real nullable
└─ assessment_id FK + UNIQUE → assessment.assessment_id
```

---

# 📋 Main Entities

### Student

```javascript
{
  student_id: string (UUID),
  name: string,
  lastName: string,
  email: string (único),
  created_at: timestamp,
  career_id: string (FK)
}
```

### Semester

```javascript
{
  semester_id: string (UUID),
  name: string,
  start_date: date,
  end_date: date,
  midterm_week: daterange,
  final_exam_week: daterange
}
```

### Course

```javascript
{
  course_id: string (UUID),
  courses_id: string (FK),
  teacher: string,
  credits: number,
  color: string (hex),
  status: string,
  semester_id: string (FK)
}
```

### Assessment

```javascript
{
  assessment_id: string (UUID),
  name: string,
  type: string,
  due_date: timestamptz,
  percentage: number,
  course_id: string (FK)
}
```

### Grade

```javascript
{
  grade_id: string (UUID),
  value: number,
  assessment_id: string (FK, unique)
}
```

### Day

```javascript
{
  day_id: string (UUID),
  course_id: string (FK),
  day_of_week: string,
  start_time: time,
  end_time: time,
  classroom: string
}
```

---

# 🔧Technologies Used / Tools

- **Frontend:** React + TypeScript with Vite.
- **Backend:** Node.js + Express.
- **Database:** PostgreSQL, using Supabase as the hosting platform.
- **Design:** Figma for prototyping.
- **Technical Documentation:** Lucidchart for UML diagrams.

## Date handling (frontend)

- The frontend uses a small centralized date utility located at `frontend/src/utils/date.ts`.
- Purpose: normalize parsing and formatting of date-only strings (e.g. `YYYY-MM-DD`) and ISO datetimes at midnight to avoid timezone-related off-by-one issues when constructing `Date` objects in JavaScript.
- Exposed helpers:
  - `parseDateToLocal(dateString?: string): Date | null` — safely parse date-only and ISO midnight strings as local dates.
  - `formatDateLocal(dateString?: string, options?): string` — format a date for display. The current default locale is `en-US` (English). You can pass `Intl.DateTimeFormat` options to customize the output.
  - `formatDateForInput(dateString?: string): string` — returns an `YYYY-MM-DD` value suitable for `<input type="date">`.
  - `getLocalDateKey(date: Date): string` — returns a `YYYY-MM-DD` key for comparisons and grouping.
- Recommended usage:
  - Use `parseDateToLocal` whenever converting date strings that come from the backend into `Date` objects for comparisons or sorting.
  - Use `formatDateLocal` for UI display so all components present dates consistently.
  - Avoid `new Date('YYYY-MM-DD')` directly — it is parsed as UTC and can shift to the previous day in some time zones.
- Next steps (suggested): make the default locale configurable and add unit tests for `parseDateToLocal` to ensure consistent behavior across environments.

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
POST http://localhost:3000/semester/create
Authorization: Bearer eyJhbGc...
{
  "semesterName": "2025-1",
  "startDate": "2025-01-01",
  "endDate": "2025-05-31",
  "midtermWeek": "2025-03-17"
}
```

### 4. Create Course (within a semester)

```bash
POST http://localhost:3000/course/create
Authorization: Bearer eyJhbGc...
{
  "courses_id": "catalog-uuid",
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
- `httpClient.ts`: Interceptor that automatically adds a Bearer token

---

# 💻 Useful commands

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
- **CU:** https://lucid.app/lucidchart/4c5bad2c-3f14-4c1b-8e61-10aee3b1cb0a/edit?viewport_loc=-2116%2C-726%2C1615%2C652%2C0_0&invitationId=inv_73043b7a-f216-4ef9-90e6-4ba0f176ee3d
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

# 👤 Authors

- **Sara Camila Echeverri** - Software Engineering student.
- **Sara Jimenez Restrepo** - Software Engineering student.
- **Sara Monsalve Lopera** - Software Engineering student.
- **Sebastián Montoya Foronda** - Software Engineering student.
- **Sebastián Tunjuelo Lujan** - Software Engineering student.

---

**Latest update**: 4 April 2026
