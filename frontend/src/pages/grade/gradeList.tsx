import { useEffect, useState } from "react";
import SemesterSelect from "../../components/SemesterSelect";
import useSemesters from "../../hooks/useSemesters";
import {
  currentGradeByCourseRequest,
  getSemesterAverageRequest,
} from "../../api/grade";
import { courseBySemesterRequest } from "../../api/course";
import FloatingActionMenu from "../../components/FloatingActionMenu";

type CurrentCourseGrade = {
  currentGrade: number;
  evaluatedPercentage: number;
  remainingPercentage: number;
};

type Course = {
  course_id: string;
  courses?: { name?: string };
  teacher: string;
  credits: number;
  color?: string;
};

function noteList() {
  const { semesters, loadingSemesters, semesterError, latestSemesterName } =
    useSemesters();
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseGradeMap, setCourseGradeMap] = useState<
    Record<string, CurrentCourseGrade>
  >({});
  const [semesterAverage, setSemesterAverage] = useState<{
    semesterAverage: number;
    evaluatedPercentage: number;
    remainingPercentage: number;
  } | null>(null);

  const loadGradesBySemester = async (semesterName: string) => {
    if (!semesterName) {
      setCourses([]);
      setCourseGradeMap({});
      setSemesterAverage(null);
      return;
    }

    try {
      setLoadingGrades(true);
      setErrorMessage("");
      const { data: coursesData } = await courseBySemesterRequest(semesterName);
      const semesterCourses = Array.isArray(coursesData?.courses)
        ? coursesData.courses
        : [];
      setCourses(semesterCourses);

      const currentSemester = semesters.find(
        (semester) => semester.name === semesterName,
      );

      if (currentSemester?.semester_id) {
        const { data: averageData } = await getSemesterAverageRequest(
          currentSemester.semester_id,
        );
        setSemesterAverage(averageData?.result ?? null);
      } else {
        setSemesterAverage(null);
      }

      const courseGradeResponses = await Promise.all(
        semesterCourses.map((course: Course) =>
          currentGradeByCourseRequest(course.course_id)
            .then((response) => ({
              courseId: course.course_id,
              result: response.data?.result as CurrentCourseGrade,
            }))
            .catch(() => ({
              courseId: course.course_id,
              result: {
                currentGrade: 0,
                evaluatedPercentage: 0,
                remainingPercentage: 100,
              } as CurrentCourseGrade,
            })),
        ),
      );

      const nextCourseGradeMap: Record<string, CurrentCourseGrade> = {};
      courseGradeResponses.forEach((response) => {
        nextCourseGradeMap[response.courseId] = response.result;
      });

      setCourseGradeMap(nextCourseGradeMap);
    } catch (error) {
      console.error(error);
      setCourses([]);
      setCourseGradeMap({});
      setSemesterAverage(null);
      setErrorMessage("The semester courses could not be loaded");
    } finally {
      setLoadingGrades(false);
    }
  };

  useEffect(() => {
    if (!latestSemesterName) return;
    setSelectedSemester((currentValue) => currentValue || latestSemesterName);
  }, [latestSemesterName]);

  useEffect(() => {
    loadGradesBySemester(selectedSemester);
  }, [selectedSemester]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-4">
        <section className="space-y-3 w-40">
          {errorMessage || semesterError ? (
            <p>{errorMessage || semesterError}</p>
          ) : null}
          <SemesterSelect
            semesters={semesters}
            value={selectedSemester}
            onValueChange={setSelectedSemester}
          />
        </section>
        <p className="title">Grades</p>
        {loadingSemesters || loadingGrades ? <p> </p> : null}
        {semesterAverage !== null ? (
          <div>
            <p className="inline-block bg-gray-200 text-gray-600 px-5 py-2 rounded-full text-[15px] font-semibold">
              Semester average: {semesterAverage.semesterAverage}
            </p>
          </div>
        ) : null}
      </div>

      {loadingSemesters || loadingGrades ? <p>Loading grades...</p> : null}

      {!loadingSemesters &&
      !loadingGrades &&
      selectedSemester &&
      courses.length === 0 ? (
        <p>There are no courses available for the selected semester.</p>
      ) : null}

      {!loadingSemesters && !loadingGrades && courses.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2  justify-items-center">
          {courses.map((course) => {
            const progress = courseGradeMap[course.course_id];
            const courseName = course.courses?.name || "Unnamed";

            return (
              <li
                key={course.course_id}
                className="bg-gray-100 rounded-md p-4 mb-4 w-80 flex flex-col items-center gap-2"
              >
                <p className="font-semibold">{courseName}</p>
                  <p>
                    Current grade ({progress?.evaluatedPercentage ?? 0}%/100%)
                  </p>
                  <p className="font-semibold">
                    {" "}
                    {progress?.currentGrade ?? "-"}
                  </p>
              </li>
            );
          })}
        </ul>
      ) : null}
    <FloatingActionMenu ariaLabel="Grades actions" />
    </div>
  );
}

export default noteList;
