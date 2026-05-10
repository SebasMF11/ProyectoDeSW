import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  courseBySemesterRequest,
  courseDeleteRequest,
  courseStatusRequest,
} from "../../api/course";
import useSemesters from "../../hooks/useSemesters";
import SemesterSelect from "../../components/SemesterSelect";
import axios from "axios";

type Course = {
  course_id: string;
  courses_id: string;
  courses: {
    name: string;
    prerequisite_course: { name: string } | null;
  };
  teacher?: string;
  credits: number;
  color?: string;
  status?: string;
};

// Qué acción de confirmación está pendiente para cada curso
type PendingAction = "complete" | "fail" | "delete" | null;

function courseList() {
  const navigate = useNavigate();
  const { semesters, loadingSemesters, semesterError, latestSemesterName } =
    useSemesters();
  const [selectedSemester, setSelectedSemester] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Mapa courseId → acción pendiente de confirmación
  const [pendingActions, setPendingActions] = useState<
    Record<string, PendingAction>
  >({});

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
    setSelectedSemester((current) => current || latestSemesterName);
  }, [latestSemesterName]);

  useEffect(() => {
    loadCoursesBySemester(selectedSemester);
  }, [selectedSemester]);

  // Abre el panel de confirmación para un curso
  const requestAction = (courseId: string, action: PendingAction) => {
    setPendingActions((prev) => ({ ...prev, [courseId]: action }));
  };

  // Cancela la confirmación
  const cancelAction = (courseId: string) => {
    setPendingActions((prev) => ({ ...prev, [courseId]: null }));
  };

  const onCompleteCourse = async (courseId: string) => {
    try {
      setErrorMessage("");
      await courseStatusRequest(courseId, "completed");
      cancelAction(courseId);
      await loadCoursesBySemester(selectedSemester);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.error || "No se pudo completar el curso",
        );
        return;
      }
      setErrorMessage("No se pudo completar el curso");
    }
  };

  const onFailCourse = async (courseId: string) => {
    try {
      setErrorMessage("");
      await courseStatusRequest(courseId, "failed");
      cancelAction(courseId);
      await loadCoursesBySemester(selectedSemester);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.error || "No se pudo cancelar el curso",
        );
        return;
      }
      setErrorMessage("No se pudo cancelar el curso");
    }
  };

  const onDeleteCourse = async (courseId: string) => {
    try {
      setErrorMessage("");
      await courseDeleteRequest(courseId);
      cancelAction(courseId);
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
        courses_id: course.courses_id,
        course_name: course.courses.name,
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
        <p className="text-red-600 text-sm mb-2">
          {errorMessage || semesterError}
        </p>
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
            {courses.map((course) => {
              const pending = pendingActions[course.course_id] ?? null;

              return (
                <li
                  key={course.course_id}
                  className="border rounded-md p-3"
                  style={{ borderLeftColor: course.color, borderLeftWidth: 4 }}
                >
                  <p>
                    <strong>Curso:</strong> {course.courses.name}
                  </p>
                  {course.courses.prerequisite_course && (
                    <p className="text-sm text-gray-500">
                      <strong>Prerequisito:</strong>{" "}
                      {course.courses.prerequisite_course.name}
                    </p>
                  )}
                  <p>
                    <strong>Profesor:</strong> {course.teacher || "Sin asignar"}
                  </p>
                  <p>
                    <strong>Creditos:</strong> {course.credits}
                  </p>

                  {/* Botones principales */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => onEditCourse(course)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => requestAction(course.course_id, "complete")}
                    >
                      Completar curso
                    </button>
                    <button
                      type="button"
                      onClick={() => requestAction(course.course_id, "fail")}
                    >
                      Cancelar materia
                    </button>
                    <button
                      type="button"
                      onClick={() => requestAction(course.course_id, "delete")}
                    >
                      Eliminar curso
                    </button>
                  </div>

                  {/* Panel de confirmación inline */}
                  {pending === "complete" && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md text-sm">
                      <p className="font-medium text-green-800 mb-2">
                        ¿Marcar "{course.courses.name}" como completado?
                      </p>
                      <p className="text-green-700 mb-3">
                        El curso pasará a estado completado y ya no aparecerá en
                        tu lista activa.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onCompleteCourse(course.course_id)}
                        >
                          Sí, completar
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelAction(course.course_id)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {pending === "fail" && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm">
                      <p className="font-medium text-yellow-800 mb-2">
                        ¿Cancelar "{course.courses.name}"?
                      </p>
                      <p className="text-yellow-700 mb-3">
                        El curso pasará a estado cancelado. Podrás volver a
                        registrarlo en un semestre futuro.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onFailCourse(course.course_id)}
                        >
                          Sí, cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelAction(course.course_id)}
                        >
                          Volver
                        </button>
                      </div>
                    </div>
                  )}

                  {pending === "delete" && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md text-sm">
                      <p className="font-medium text-red-800 mb-2">
                        ¿Eliminar "{course.courses.name}"?
                      </p>
                      <p className="text-red-700 mb-3">
                        Esta acción eliminará el curso y todos sus datos
                        relacionados (evaluaciones, notas, horarios). No se
                        puede deshacer.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onDeleteCourse(course.course_id)}
                        >
                          Sí, eliminar
                        </button>
                        <button
                          type="button"
                          onClick={() => cancelAction(course.course_id)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

export default courseList;
