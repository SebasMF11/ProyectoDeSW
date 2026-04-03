/**
 * ARCHIVO: AppRouters.tsx
 * PROPÓSITO: Configurar todas las rutas de la aplicación
 *
 */

import { Route, Routes, Navigate } from "react-router";
import Home from "../pages/Home";
import Register from "../pages/student/Register";
import Auth from "../pages/student/Auth";
import ProtectedRouters from "./ProtectedRouters";
import Settings from "../pages/student/settings";
import GradeList from "../pages/grade/gradeList";
import Grade from "../pages/grade/grade";
import CourseList from "../pages/course/courseList";
import Course from "../pages/course/course";
import Assessment from "../pages/assessment/assessment";
import AssessmentList from "../pages/assessment/assessmentList";
import Semester from "../pages/semester";
import Day from "../pages/course/day";
import Profile from "../pages/student/profile";
const AppRouters = () => {
  return (
    <Routes>
      {/* ============ RUTAS PÚBLICAS ============ */}
      {/* Autenticación de estudiantes */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/register" element={<Register />} />

      {/* ============ RUTAS PROTEGIDAS - HOME ============ */}
      {/* Panel principal del estudiante */}
      <Route
        path="/home"
        element={
          <ProtectedRouters>
            <Home />
          </ProtectedRouters>
        }
      />

      {/* ============ RUTAS PROTEGIDAS - PERFIL ============ */}
      {/* Información de perfil e historial del estudiante */}
      <Route
        path="/profile"
        element={
          <ProtectedRouters>
            <Profile />
          </ProtectedRouters>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRouters>
            <Settings />
          </ProtectedRouters>
        }
      />

      {/* ============ RUTAS PROTEGIDAS - SEMESTRES ============ */}
      {/* Gestión de semestres académicos (períodos de tiempo) */}
      <Route
        path="/semester"
        element={
          <ProtectedRouters>
            <Semester />
          </ProtectedRouters>
        }
      />

      {/* ============ RUTAS PROTEGIDAS - CURSOS ============ */}
      {/* Gestión de cursos: creación, edición, visualización */}
      <Route
        path="/course-list"
        element={
          <ProtectedRouters>
            <CourseList />
          </ProtectedRouters>
        }
      />
      <Route
        path="/course"
        element={
          <ProtectedRouters>
            <Course />
          </ProtectedRouters>
        }
      />
      {/* Gestión de días académicos dentro de cursos */}
      <Route
        path="/day"
        element={
          <ProtectedRouters>
            <Day />
          </ProtectedRouters>
        }
      />

      {/* ============ RUTAS PROTEGIDAS - EVALUACIONES ============ */}
      {/* Gestión de evaluaciones/rúbricas para calificar */}
      <Route
        path="/assessment-list"
        element={
          <ProtectedRouters>
            <AssessmentList />
          </ProtectedRouters>
        }
      />
      <Route
        path="/assessment"
        element={
          <ProtectedRouters>
            <Assessment />
          </ProtectedRouters>
        }
      />

      {/* ============ RUTAS PROTEGIDAS - CALIFICACIONES ============ */}
      {/* Gestión de calificaciones de estudiantes */}
      <Route
        path="/grade-list"
        element={
          <ProtectedRouters>
            <GradeList />
          </ProtectedRouters>
        }
      />
      <Route
        path="/grade"
        element={
          <ProtectedRouters>
            <Grade />
          </ProtectedRouters>
        }
      />

      {/* ============ RUTAS DEFAULT ============ */}
      {/* Redirige la raíz a autenticación */}
      <Route path="/" element={<Navigate to="/auth" />} />
      {/* Página 404 para rutas no definidas */}
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  );
};

export default AppRouters;
