import { useEffect, useState } from "react";
import SemesterSelect from "../../components/SemesterSelect";
import useSemesters from "../../hooks/useSemesters";
import {
  currentGradeByCourseRequest,
  getSemesterAverageRequest,
} from "../../api/grade";
import { courseBySemesterRequest } from "../../api/course";

type CurrentCourseGrade = {
  currentGrade: number;
  evaluatedPercentage: number;
  remainingPercentage: number;
};

type Course = {
  course_id: number;
  course_name: string;
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
    Record<number, CurrentCourseGrade>
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
        (semester) => semester.semester_name === semesterName,
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

      const nextCourseGradeMap: Record<number, CurrentCourseGrade> = {};
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
    <div>
      {errorMessage || semesterError ? (
        <p>{errorMessage || semesterError}</p>
      ) : null}
      <SemesterSelect
        semesters={semesters}
        value={selectedSemester}
        onValueChange={setSelectedSemester}
      />
      <p>Qualifications</p>

      {semesterAverage ? (
        <div>
          <p>Semester average: {semesterAverage.semesterAverage}</p>
        </div>
      ) : null}

      {loadingSemesters || loadingGrades ? <p>Cargando cursos...</p> : null}

      {!loadingSemesters &&
      !loadingGrades &&
      selectedSemester &&
      courses.length === 0 ? (
        <p>There are no courses available for the selected semester.</p>
      ) : null}

      {!loadingSemesters && !loadingGrades && courses.length > 0 ? (
        <ul>
          {courses.map((course) => {
            const progress = courseGradeMap[course.course_id];

            return (
              <li key={course.course_id}>
                <p>{course.course_name}</p>
                <p>Teacher: {course.teacher || "Not assigned"}</p>
                <p>Credits: {course.credits}</p>
                <p>Current grade: {progress?.currentGrade ?? "-"}</p>
                <p>Evaluated: {progress?.evaluatedPercentage ?? 0}%</p>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export default noteList;
