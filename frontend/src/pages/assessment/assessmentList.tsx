import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { assessmentBySemesterRequest } from "../../api/assessment.api";
import { courseBySemesterRequest } from "../../api/course";
import { gradeByCourseRequest } from "../../api/grade";
import useSemesters from "../../hooks/useSemesters";
import SemesterSelect from "../../components/SemesterSelect";

type Course = {
  course_id: number;
  course_name: string;
  teacher?: string;
  credits?: number;
};

type Assessment = {
  assessment_id: number;
  assessment_name: string;
  type: string;
  due_date?: string;
  percentage?: number;
  course?: {
    course_name?: string;
  };
};

type Grade = {
  value: number;
  assessment: {
    name?: string;
    dueDate?: string;
  };
};

const assessmentKey = (assessmentName?: string, dueDate?: string) =>
  `${assessmentName || ""}::${dueDate || ""}`;

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
    setSelectedSemester((currentValue) => currentValue || latestSemesterName);
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
        const semesterCourses = Array.isArray(coursesData?.courses)
          ? coursesData.courses
          : [];
        setCourses(semesterCourses);

        const currentSemester = semesters.find(
          (semester) => semester.semester_name === selectedSemester,
        );

        if (!currentSemester?.semester_id) {
          setAssessments([]);
          setGradeMap({});
          return;
        }

        const { data: assessmentsData } = await assessmentBySemesterRequest(
          currentSemester.semester_id,
        );
        const semesterAssessments = Array.isArray(assessmentsData?.assessments)
          ? assessmentsData.assessments
          : [];
        setAssessments(semesterAssessments);

        const gradeResponses = await Promise.all(
          semesterCourses.map((course: Course) =>
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

  const assessmentsByCourse = useMemo(() => {
    const grouped: Record<string, Assessment[]> = {};

    assessments.forEach((assessment) => {
      const courseName = assessment.course?.course_name || "Sin curso";
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
          Agregar assessment
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
              const courseAssessments =
                assessmentsByCourse[course.course_name] || [];

              return (
                <li key={course.course_id} className="border rounded-md p-4">
                  <p className="font-semibold">{course.course_name}</p>
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
                          assessment.assessment_name,
                          assessment.due_date,
                        );
                        const gradeValue = gradeMap[key];
                        const hasGrade = Number.isFinite(gradeValue);

                        return (
                          <li
                            key={assessment.assessment_id}
                            className="rounded border p-3"
                          >
                            <p>
                              <strong>{assessment.assessment_name}</strong>
                            </p>
                            <p>
                              Tipo: {assessment.type} | Fecha:{" "}
                              {assessment.due_date || "-"} | Porcentaje:{" "}
                              {assessment.percentage ?? "-"}%
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
    </div>
  );
}

export default AssessmentList;
