import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { assessmentBySemesterRequest } from "../../api/assessment.api";
import { courseBySemesterRequest } from "../../api/course";
import { gradeByCourseRequest } from "../../api/grade";
import useSemesters from "../../hooks/useSemesters";
import SemesterSelect from "../../components/SemesterSelect";
import { format } from "date-fns";

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
    <div className="p-6 max-w-5xl mx-auto">
      <header className="flex items-center justify-between gap-3 mb-4">
        <section aria-label="Semester selection" className="space-y-3 w-30">
          {errorMessage || semesterError ? (
            <p>{errorMessage || semesterError}</p>
          ) : null}

          <SemesterSelect
            semesters={semesters}
            value={selectedSemester}
            onValueChange={setSelectedSemester}
          />
        </section>
        <p className="title">Assessments By Semester</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => navigate("/assessment")}>
            Add assessment
          </button>

          <button type="button" onClick={() => navigate("/grade")}>
            Add grade
          </button>
        </div>
      </header>

      <section className="mt-6" aria-live="polite">
        {loadingSemesters || loading ? <p>Cargando informacion...</p> : null}

        {!loadingSemesters &&
        !loading &&
        selectedSemester &&
        courses.length === 0 ? (
          <p>There are no courses assigned this semester.</p>
        ) : null}

        {!loadingSemesters && !loading && courses.length > 0 ? (
          <ul className="flex flex-col gap-6">
            {courses.map((course) => {
              const courseAssessments =
                assessmentsByCourse[course.course_name] || [];

              return (
                <li key={course.course_id}>
                  <article className="border-none p-4 space-y-3">
                    <header>
                      <h2 className="text-lg font-semibold">
                        {course.course_name}
                      </h2>
                      <dl className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-700 mt-1">
                        <div>
                          <dt className="inline font-medium">Teacher: </dt>
                          <dd className="inline">
                            {course.teacher || "Sin asignar"}
                          </dd>
                        </div>
                        <div>
                          <dt className="inline font-medium">Credits: </dt>
                          <dd className="inline">{course.credits ?? "-"}</dd>
                        </div>
                      </dl>
                    </header>

                    {courseAssessments.length === 0 ? (
                      <p className="pl-6">This course has no assessments.</p>
                    ) : (
                      <section
                        aria-label={`Assessments for ${course.course_name}`}
                      >
                        <ul className="flex flex-col gap-2">
                          {courseAssessments.map((assessment) => {
                            const key = assessmentKey(
                              assessment.assessment_name,
                              assessment.due_date,
                            );
                            const gradeValue = gradeMap[key];
                            const hasGrade = Number.isFinite(gradeValue);

                            return (
                              <li key={assessment.assessment_id}>
                                <article className="rounded border p-3">
                                  <div className="grid grid-cols-1 gap-2 md:grid-cols-[2fr_1fr_1fr_1fr] md:items-center">
                                    <div>
                                      <p className="text-sm text-gray-700">
                                        {assessment.due_date
                                          ? format(
                                              assessment.due_date,
                                              "MMMM d",
                                            )
                                          : "-"}
                                      </p>
                                      <h3 className="font-semibold">
                                        {assessment.type} :{" "}
                                        {assessment.assessment_name}
                                      </h3>
                                    </div>

                                    <p className="text-sm md:text-base">
                                      Percentage: {assessment.percentage ?? "-"}
                                      %
                                    </p>

                                    <p className="text-sm md:text-base">
                                      Grade: {hasGrade ? gradeValue : "Pending"}
                                    </p>

                                    {/* <button
                                      type="button"
                                      className="justify-self-start md:justify-self-end"
                                    >
                                      //
                                    </button> */}
                                  </div>
                                </article>
                              </li>
                            );
                          })}
                        </ul>
                      </section>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>
    </div>
  );
}

export default AssessmentList;
