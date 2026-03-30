import { Route, Routes } from "react-router";
import Home from "../pages/Home";
import Register from "../pages/Register";
import Auth from "../pages/Auth";
import ProtectedRouters from "./ProtectedRouters";
import Settings from "../pages/settings";
import NoteList from "../pages/noteList";
import Note from "../pages/note";
import CourseList from "../pages/courseList";
import Course from "../pages/course";
import Activities from "../pages/activities";
import ActivitiesList from "../pages/activitiesList";
import AcademicPeriod from "../pages/academicPeriod";
import CourseDays from "../pages/courseDays";

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
        path="/notes"
        element={
          <ProtectedRouters>
            <NoteList />
          </ProtectedRouters>
        }
      />
      <Route
        path="/note"
        element={
          <ProtectedRouters>
            <Note />
          </ProtectedRouters>
        }
      />
      <Route
        path="/courses"
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
        path="/activities"
        element={
          <ProtectedRouters>
            <Activities />
          </ProtectedRouters>
        }
      />
      <Route
        path="/activities-list"
        element={
          <ProtectedRouters>
            <ActivitiesList />
          </ProtectedRouters>
        }
      />
      <Route
        path="/academic-period"
        element={
          <ProtectedRouters>
            <AcademicPeriod />
          </ProtectedRouters>
        }
      />
      <Route
        path="/course-days"
        element={
          <ProtectedRouters>
            <CourseDays />
          </ProtectedRouters>
        }
      />

      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  );
};

export default AppRouters;
