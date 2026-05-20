import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { FaRegTrashCan } from "react-icons/fa6";
import { RiEdit2Line } from "react-icons/ri";
import FloatingActionMenu from "../../components/FloatingActionMenu";
import { assessmentBySemesterRequest } from "../../api/assessment.api";
import { courseBySemesterRequest } from "../../api/course";
import { gradeByCourseRequest } from "../../api/grade";
import useSemesters from "../../hooks/useSemesters";
import SemesterSelect from "../../components/SemesterSelect";

type Course = {
  course_id: string;
  courses: { name: string };
  status?: string;
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

const isActiveStatus = (status?: string) =>
  typeof status === "string" && status.trim().toLowerCase() === "active";

const formatAssessmentDate = (dateValue?: string) => {
  if (!dateValue) return "No date";
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return dateValue;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
  }).format(parsed);
};

const formatGradeValue = (grade?: number) => {
  if (!Number.isFinite(grade)) return "Pending";
  return Number(grade).toFixed(1);
};

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
        const activeCourses = semesterCourses.filter((course) =>
          isActiveStatus(course.status),
        );
        setCourses(activeCourses);

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
        const activeCourseNames = new Set(
          activeCourses.map((course) => course.courses.name),
        );
        setAssessments(
          semesterAssessments.filter((assessment) =>
            activeCourseNames.has(assessment.course?.courses?.name || ""),
          ),
        );

        const gradeResponses = await Promise.all(
          activeCourses.map((course) =>
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
        setErrorMessage("The semester information could not be loaded");
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
        assessment.course?.courses?.name || "No course assigned";
      if (!grouped[courseName]) grouped[courseName] = [];
      grouped[courseName].push(assessment);
    });
    return grouped;
  }, [assessments]);

  // Use course-provided color when available; fallback to a neutral color
  const fallbackCourseColor = "#0f93ad";

  return (
    <main className="mx-auto max-w-6xl bg-white px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between gap-3 mb-4">
        <section aria-label="Semester selection" className="space-y-3 w-40">
          <SemesterSelect
            semesters={semesters}
            value={selectedSemester}
            onValueChange={setSelectedSemester}
          />
        </section>
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-center">
            Assessments by semester
          </h1>
        </div>
      </header>

      {errorMessage || semesterError ? (
        <p className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage || semesterError}
        </p>
      ) : null}

      <section className="mt-2" aria-live="polite">
        {loadingSemesters || loading ? (
          <p className="text-sm text-[#425047]">Loading information...</p>
        ) : null}

        {!loadingSemesters &&
        !loading &&
        selectedSemester &&
        courses.length === 0 ? (
          <p className="text-sm text-[#425047]">
            No courses are assigned to this semester.
          </p>
        ) : null}

        {!loadingSemesters && !loading && courses.length > 0 ? (
          <div className="space-y-7">
            <div className="mb-1 hidden sm:grid sm:grid-cols-[minmax(0,1fr)_96px_120px_92px] sm:items-center sm:gap-3">
              <p className="col-start-3 text-center text-base font-bold uppercase tracking-wide text-[#1a1a1a]">
                Grade
              </p>
            </div>

            {courses.map((course) => {
              const courseName = course.courses.name;
              const courseAssessments = [
                ...(assessmentsByCourse[courseName] || []),
              ].sort((a, b) => {
                const first = a.due_date ? new Date(a.due_date).getTime() : 0;
                const second = b.due_date ? new Date(b.due_date).getTime() : 0;
                return first - second;
              });

              return (
                <article key={course.course_id} className="relative pl-10">
                  <span
                    className="absolute left-2 top-1 h-5 w-5 rounded-full"
                    style={{
                      backgroundColor:
                        (course as any).color || fallbackCourseColor,
                    }}
                    aria-hidden="true"
                  />
                  <span
                    className="absolute left-[18px] top-6 bottom-0 w-px bg-[#8f8f8f]"
                    aria-hidden="true"
                  />

                  <header className="mb-2 flex items-baseline justify-between gap-3">
                    <h2 className="text-xl leading-7 font-bold text-[#0f1412] sm:text-2xl">
                      {courseName}
                    </h2>
                    <p className="text-xs text-[#55635a]">
                      {course.teacher || "Unassigned"} • {course.credits ?? "-"}{" "}
                      credits
                    </p>
                  </header>

                  {courseAssessments.length === 0 ? (
                    <p className="text-[#47554c]">
                      This course has no assessments.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {courseAssessments.map((assessment) => {
                        const key = assessmentKey(
                          assessment.name,
                          assessment.due_date,
                        );
                        const gradeValue = gradeMap[key];

                        return (
                          <li
                            key={assessment.assessment_id}
                            className="grid grid-cols-1 items-center gap-3 rounded-xl bg-transparent p-1 sm:grid-cols-[minmax(0,1fr)_96px_120px_92px]"
                          >
                            <div>
                              <p className="text-sm capitalize text-[#6b6b6b]">
                                {formatAssessmentDate(assessment.due_date)}
                              </p>
                              <p className="text-lg leading-6 font-semibold text-[#131313] sm:text-xl">
                                {assessment.type}: {assessment.name}
                              </p>
                            </div>

                            <span className="inline-flex h-11 items-center justify-center rounded-full bg-[#c9cdca] px-4 text-lg font-semibold text-[#1f2521]">
                              {assessment.percentage ?? "-"}%
                            </span>

                            <span className="inline-flex h-11 items-center justify-center rounded-full bg-[#c9cdca] px-4 text-lg font-semibold text-[#1f2521]">
                              {formatGradeValue(gradeValue)}
                            </span>

                            <div className="flex items-center justify-start gap-2 sm:justify-end">
                              <button
                                type="button"
                                onClick={() =>
                                  setErrorMessage(
                                    "Delete assessment is not available yet.",
                                  )
                                }
                                className="course-list-btn course-list-btn-icon"
                                title="Delete assessment"
                              >
                                <FaRegTrashCan size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  navigate("/assessment", {
                                    state: {
                                      assessment_id: assessment.assessment_id,
                                    },
                                  })
                                }
                                className="course-list-btn course-list-btn-icon"
                                title="Edit assessment"
                              >
                                <RiEdit2Line size={16} />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </article>
              );
            })}
          </div>
        ) : null}
      </section>

      <FloatingActionMenu ariaLabel="Assessment actions" />
    </main>
  );
}

export default AssessmentList;
