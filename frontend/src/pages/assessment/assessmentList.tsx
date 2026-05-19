import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import FloatingActionMenu from "../../components/FloatingActionMenu";
import { assessmentBySemesterRequest } from "../../api/assessment.api";
import { courseBySemesterRequest } from "../../api/course";
import { gradeByCourseRequest } from "../../api/grade";
import useSemesters from "../../hooks/useSemesters";
import SemesterSelect from "../../components/SemesterSelect";

type Course = {
  course_id: string;
  courses: { name: string };
  teacher?: string;
  credits?: number;
};

type Assessment = {
  assessment_id: string;
  name: string;
  type: string;
  due_date?: string;
  percentage?: number;
  course?: {
    courses?: { name: string };
  };
};

type Grade = {
  value: number;
  assessment: {
    name?: string;
    dueDate?: string;
  };
};

const assessmentKey = (name?: string, dueDate?: string) =>
  `${name || ""}::${dueDate || ""}`;

function AssessmentList() {
  const navigate = useNavigate();
  const { semesters, loadingSemesters, semesterError, latestSemesterName } =
    useSemesters();
  const [selectedSemester, setSelectedSemester] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [gradeMap, setGradeMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!latestSemesterName) return;
    setSelectedSemester((current) => current || latestSemesterName);
  }, [latestSemesterName]);

  useEffect(() => {
    const loadSemesterContent = async () => {
      if (!selectedSemester) {
        setCourses([]);
        setAssessments([]);
        setGradeMap({});
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const { data: coursesData } =
          await courseBySemesterRequest(selectedSemester);
        const semesterCourses: Course[] = Array.isArray(coursesData?.courses)
          ? coursesData.courses
          : [];
        setCourses(semesterCourses);

        const currentSemester = semesters.find(
          (semester) => semester.name === selectedSemester,
        );

        if (!currentSemester?.semester_id) {
          setAssessments([]);
          setGradeMap({});
          return;
        }

        const { data: assessmentsData } = await assessmentBySemesterRequest(
          currentSemester.semester_id,
        );
        const semesterAssessments: Assessment[] = Array.isArray(
          assessmentsData?.assessments,
        )
          ? assessmentsData.assessments
          : [];
        setAssessments(semesterAssessments);

        const gradeResponses = await Promise.all(
          semesterCourses.map((course) =>
            gradeByCourseRequest(course.course_id)
              .then((response) => ({
                courseId: course.course_id,
                grades: Array.isArray(response.data?.grades)
                  ? response.data.grades
                  : [],
              }))
              .catch(() => ({ courseId: course.course_id, grades: [] })),
          ),
        );

        const nextGradeMap: Record<string, number> = {};
        gradeResponses.forEach((gradeResponse) => {
          gradeResponse.grades.forEach((grade: Grade) => {
            const key = assessmentKey(
              grade.assessment?.name,
              grade.assessment?.dueDate,
            );
            nextGradeMap[key] = grade.value;
          });
        });

        setGradeMap(nextGradeMap);
      } catch (error) {
        console.error(error);
        setCourses([]);
        setAssessments([]);
        setGradeMap({});
        setErrorMessage("No se pudo cargar la informacion del semestre");
      } finally {
        setLoading(false);
      }
    };

    loadSemesterContent();
  }, [selectedSemester, semesters]);

  // Agrupar assessments por nombre del curso
  const assessmentsByCourse = useMemo(() => {
    const grouped: Record<string, Assessment[]> = {};
    assessments.forEach((assessment) => {
      const courseName =
        assessment.course?.courses?.name || "Sin curso";
      if (!grouped[courseName]) grouped[courseName] = [];
      grouped[courseName].push(assessment);
    });
    return grouped;
  }, [assessments]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-xl font-semibold">Actividades por semestre</h1>
        <button type="button" onClick={() => navigate("/assessment")}>
          Add assessment
        </button>
        <button
          type="button"

        >
          Add grade
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
        {loadingSemesters || loading ? <p>Cargando informacion...</p> : null}

        {!loadingSemesters &&
        !loading &&
        selectedSemester &&
        courses.length === 0 ? (
          <p>No hay cursos asignados a este semestre.</p>
        ) : null}

        {!loadingSemesters && !loading && courses.length > 0 ? (
          <ul className="flex flex-col gap-4">
            {courses.map((course) => {
              const courseName = course.courses.name;
              const courseAssessments = assessmentsByCourse[courseName] || [];

              return (
                <li key={course.course_id} className="border rounded-md p-4">
                  <p className="font-semibold">{courseName}</p>
                  <p>
                    Profesor: {course.teacher || "Sin asignar"} | Creditos:{" "}
                    {course.credits ?? "-"}
                  </p>

                  {courseAssessments.length === 0 ? (
                    <p className="mt-2">Este curso no tiene assessments.</p>
                  ) : (
                    <ul className="mt-3 flex flex-col gap-2">
                      {courseAssessments.map((assessment) => {
                        const key = assessmentKey(
                          assessment.name,
                          assessment.due_date,
                        );
                        const gradeValue = gradeMap[key];
                        const hasGrade = Number.isFinite(gradeValue);
                        // Mostrar solo la fecha (YYYY-MM-DD) si viene con timestamp
                        const displayDate = assessment.due_date
                          ? assessment.due_date.split("T")[0]
                          : "-";

                        return (
                          <li
                            key={assessment.assessment_id}
                            className="rounded border p-3"
                          >
                            <p>
                              <strong>{assessment.name}</strong>
                            </p>
                            <p>
                              Tipo: {assessment.type} | Fecha: {displayDate} |
                              Porcentaje: {assessment.percentage ?? "-"}%
                            </p>
                            <p>Nota: {hasGrade ? gradeValue : "Pendiente"}</p>
                            
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
      <FloatingActionMenu ariaLabel="Assessment actions" />
    </div>
  );
}

export default AssessmentList;
