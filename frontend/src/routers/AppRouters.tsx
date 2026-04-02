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
      <Route path="/auth" element={<Auth />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/home"
        element={
          <ProtectedRouters>
            <Home />
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
      <Route
        path="/assessment"
        element={
          <ProtectedRouters>
            <Assessment />
          </ProtectedRouters>
        }
      />
      <Route
        path="/assessment-list"
        element={
          <ProtectedRouters>
            <AssessmentList />
          </ProtectedRouters>
        }
      />
      <Route
        path="/semester"
        element={
          <ProtectedRouters>
            <Semester />
          </ProtectedRouters>
        }
      />
      <Route
        path="/day"
        element={
          <ProtectedRouters>
            <Day />
          </ProtectedRouters>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRouters>
            <Profile />
          </ProtectedRouters>
        }
      />

      <Route path="/" element={<Navigate to="/auth" />} />
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  );
};

export default AppRouters;
