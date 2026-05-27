import { useEffect, useMemo, useState } from "react";
import Calendar from "../components/calendar/Calendar";
import DayAssessmentsList from "../components/DayAssessmentsList";
import DailyClassesList from "../components/DailyClassesList.tsx";
import { format } from "date-fns";
import FloatingActionMenu from "../components/FloatingActionMenu";
import useSemesters from "../hooks/useSemesters";
import { assessmentBySemesterRequest } from "../api/assessment.api";
import type { DayAssessment } from "../components/DayAssessmentsList";

type SemesterAssessment = {
  assessment_id: string;
  name: string;
  type: string;
  due_date?: string;
  percentage?: number;
  has_grade?: boolean;
  grade_value?: number | null;
  course?: {
    courses?: {
      name?: string;
    };
    color?: string;
  };
};

function Home() {
  const { semesters, loadingSemesters, semesterError, latestSemesterName } =
    useSemesters();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [semesterAssessments, setSemesterAssessments] = useState<
    SemesterAssessment[]
  >([]);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [assessmentError, setAssessmentError] = useState("");

  const latestSemesterId = useMemo(
    () =>
      semesters.find((semester) => semester.name === latestSemesterName)
        ?.semester_id ?? "",
    [latestSemesterName, semesters],
  );

  const selectedSemesterName = useMemo(
    () =>
      semesters.find((semester) => semester.semester_id === selectedSemesterId)
        ?.name ?? "",
    [selectedSemesterId, semesters],
  );

  useEffect(() => {
    if (selectedSemesterId || !latestSemesterId) return;
    setSelectedSemesterId(latestSemesterId);
  }, [latestSemesterId, selectedSemesterId]);

  useEffect(() => {
    const loadSemesterAssessments = async () => {
      if (!selectedSemesterId) {
        setSemesterAssessments([]);
        setAssessmentError("");
        setLoadingAssessments(false);
        return;
      }

      try {
        setLoadingAssessments(true);
        setAssessmentError("");
        const { data } = await assessmentBySemesterRequest(selectedSemesterId);
        setSemesterAssessments(
          Array.isArray(data?.assessments) ? data.assessments : [],
        );
      } catch (error) {
        console.error(error);
        setSemesterAssessments([]);
        setAssessmentError("No se pudieron cargar los assessments");
      } finally {
        setLoadingAssessments(false);
      }
    };

    loadSemesterAssessments();
  }, [selectedSemesterId]);

  const calendarAssessments = useMemo(() => {
    return semesterAssessments.reduce<
      Record<string, Array<{ color: string; hasGrade: boolean }>>
    >((accumulator, assessment) => {
      const dateKey = assessment.due_date?.split("T")[0];
      const color = assessment.course?.color;

      if (!dateKey || !color) return accumulator;

      if (!accumulator[dateKey]) {
        accumulator[dateKey] = [];
      }

      accumulator[dateKey].push({
        color,
        hasGrade: Boolean(assessment.has_grade),
      });

      return accumulator;
    }, {});
  }, [semesterAssessments]);

  const selectedDayAssessments = useMemo<DayAssessment[]>(() => {
    const selectedDateKey = format(selectedDate, "yyyy-MM-dd");

    return semesterAssessments
      .filter(
        (assessment) => assessment.due_date?.split("T")[0] === selectedDateKey,
      )
      .map((assessment) => ({
        assessment_id: assessment.assessment_id,
        assessment_name: assessment.name,
        type: assessment.type,
        percentage: assessment.percentage ?? 0,
        has_grade: assessment.has_grade,
        grade_value: assessment.grade_value ?? null,
        course: {
          course_name: assessment.course?.courses?.name ?? "",
          color: assessment.course?.color,
        },
      }));
  }, [selectedDate, semesterAssessments]);

  return (
    <div className="bg-white grid grid-cols-2 gap-2 h-screen">
      <div className="flex flex-col items-center pt-5 gap-4">
        <div className="w-full max-w-[590px] px-6">
          <label htmlFor="home-semester-select" className="formText">
            Semester
          </label>
          <select
            id="home-semester-select"
            className="formControl"
            value={selectedSemesterId}
            onChange={(event) => setSelectedSemesterId(event.target.value)}
          >
            <option value="" disabled>
              Select a semester
            </option>
            {semesters.length === 0 ? (
              <option value="">No semesters available</option>
            ) : null}
            {semesters.map((semester) => (
              <option key={semester.semester_id} value={semester.semester_id}>
                {semester.name}
              </option>
            ))}
          </select>
          {semesterError || assessmentError ? (
            <p className="mt-2 text-sm text-red-600">
              {semesterError || assessmentError}
            </p>
          ) : null}
        </div>
        <Calendar
          onSelectDate={(date) => setSelectedDate(date)}
          assessments={calendarAssessments}
          isLoading={loadingSemesters || loadingAssessments}
        />
      </div>
      <div className="flex flex-col justify-items-start pt-10">
        <div>
          <p className="inline-block bg-gray-200 text-gray-600 px-5 py-2 rounded-full text-[20px] font-semibold">
            {format(selectedDate, "MMMM d', ' yyyy")}
          </p>
        </div>

        <div className="pl-8">
          <p className="text-[25px] font-bold text-black pt-10">
            Your classes today
          </p>
          <div className="max-w-md pl-6 pt-2 text-gray-600">
            <DailyClassesList
              selectedDate={selectedDate}
              selectedSemester={selectedSemesterName}
            />
          </div>
          <p className="text-[25px] font-bold text-black pt-8">Assessments</p>

          <div className="pl-10 pt-2">
            <DayAssessmentsList
              assessments={selectedDayAssessments}
              isLoading={loadingSemesters || loadingAssessments}
            />
          </div>
        </div>
        <FloatingActionMenu ariaLabel="Home actions" />
      </div>
    </div>
  );
}

export default Home;
