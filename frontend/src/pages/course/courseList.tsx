import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { courseBySemesterRequest, courseDeleteRequest } from "../../api/course";
import useSemesters from "../../hooks/useSemesters";
import SemesterSelect from "../../components/SemesterSelect";
import axios from "axios";

type Course = {
  course_id: number;
  course_name: string;
  teacher: string;
  credits: number;
  color?: string;
};

function courseList() {
  const navigate = useNavigate();
  const { semesters, loadingSemesters, semesterError, latestSemesterName } =
    useSemesters();
  const [selectedSemester, setSelectedSemester] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadCoursesBySemester = async (semesterName: string) => {
    if (!semesterName) {
      setCourses([]);
      return;
    }

    try {
      setLoadingCourses(true);
      setErrorMessage("");
      const { data } = await courseBySemesterRequest(semesterName);
      setCourses(Array.isArray(data?.courses) ? data.courses : []);
    } catch (error) {
      console.error(error);
      setCourses([]);
      setErrorMessage("No se pudieron cargar los cursos del semestre");
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    if (!latestSemesterName) return;
    setSelectedSemester((currentValue) => currentValue || latestSemesterName);
  }, [latestSemesterName]);

  useEffect(() => {
    loadCoursesBySemester(selectedSemester);
  }, [selectedSemester]);

  const onDeleteCourse = async (courseId: number) => {
    const confirmed = window.confirm(
      "Esta accion eliminara el curso y sus datos relacionados. Deseas continuar?",
    );

    if (!confirmed) return;

    try {
      setErrorMessage("");
      await courseDeleteRequest(courseId);
      await loadCoursesBySemester(selectedSemester);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.error || "No se pudo eliminar el curso",
        );
        return;
      }

      setErrorMessage("No se pudo eliminar el curso");
    }
  };

  const onEditCourse = (course: Course) => {
    navigate("/course", {
      state: {
        course_id: course.course_id,
        course_name: course.course_name,
        teacher: course.teacher,
        credits: course.credits,
        color: course.color,
        semester_name: selectedSemester,
      },
    });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-xl font-semibold">Cursos por semestre</h1>
        <button type="button" onClick={() => navigate("/course")}>
          Agregar curso
        </button>
        <button type="button" onClick={() => navigate("/day")}>
          Agregar dias
        </button>
      </div>

      {errorMessage || semesterError ? (
        <p>{errorMessage || semesterError}</p>
      ) : null}

      <SemesterSelect
        semesters={semesters}
        value={selectedSemester}
        onValueChange={setSelectedSemester}
      />

      <div className="mt-6">
        {loadingSemesters || loadingCourses ? <p>Cargando cursos...</p> : null}

        {!loadingSemesters &&
        !loadingCourses &&
        selectedSemester &&
        courses.length === 0 ? (
          <p>No hay cursos asignados a este semestre.</p>
        ) : null}

        {!loadingSemesters && !loadingCourses && courses.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {courses.map((course) => (
              <li
                key={`${course.course_name}-${course.teacher}`}
                className="border rounded-md p-3"
              >
                <p>
                  <strong>Curso:</strong> {course.course_name}
                </p>
                <p>
                  <strong>Profesor:</strong> {course.teacher || "Sin asignar"}
                </p>
                <p>
                  <strong>Creditos:</strong> {course.credits}
                </p>
                <div className="flex gap-2 mt-3">
                  <button type="button" onClick={() => onEditCourse(course)}>
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCourse(course.course_id)}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

export default courseList;
