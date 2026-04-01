import { Route, Routes } from "react-router";
import Home from "../pages/Home";
import Register from "../pages/student/Register";
import Auth from "../pages/student/Auth";
import ProtectedRouters from "./ProtectedRouters";
import Settings from "../pages/student/settings";
import NoteList from "../pages/note/noteList";
import Note from "../pages/note/note";
import CourseList from "../pages/course/courseList";
import Course from "../pages/course/course";
import Activitie from "../pages/activitie/activitie";
import ActivitiesList from "../pages/activitie/activitiesList";
import AcademicPeriod from "../pages/academicPeriod";
import CourseDays from "../pages/course/courseDays";
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
            <Activitie />
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
      <Route
        path="/profile"
        element={
          <ProtectedRouters>
            <Profile />
          </ProtectedRouters>
        }
      />

      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  );
};

export default AppRouters;
