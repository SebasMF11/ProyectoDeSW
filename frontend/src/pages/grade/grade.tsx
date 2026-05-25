import { useNavigate } from "react-router";
import { useLocation } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { gradeCreateRequest } from "../../api/grade";
import { courseBySemesterRequest } from "../../api/course";
import { assessmentBySemesterRequest } from "../../api/assessment.api";
import useSemesters from "../../hooks/useSemesters";
import SemesterSelect from "../../components/SemesterSelect";
import CourseSelect, { type Course } from "../../components/CourseSelect";
import AssessmentSelect, {
  type Assessment,
} from "../../components/AssessmentSelect";

const grade = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState("");
  const { semesters, semesterError, latestSemesterName } = useSemesters();
  const [courses, setCourses] = useState<Course[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const { register, handleSubmit, watch, setValue, control } = useForm();
  const semesterRegister = register("semesterName", { required: true });
  const selectedSemesterName = watch("semesterName");
  const selectedCourseName = watch("courseName");
  const prefillState = location.state as
    | {
        semesterName?: string;
        courseName?: string;
        assessmentName?: string;
        redirectTo?: string;
      }
    | undefined;

  const selectedSemester = useMemo(
    () => semesters.find((semester) => semester.name === selectedSemesterName),
    [semesters, selectedSemesterName],
  );

  // Filtrar assessments por el curso seleccionado
  const filteredAssessments = useMemo(
    () =>
      assessments.filter(
        (assessment) => assessment.course?.courses?.name === selectedCourseName,
      ),
    [assessments, selectedCourseName],
  );

  useEffect(() => {
    if (selectedSemesterName) return;

    if (prefillState?.semesterName) {
      setValue("semesterName", prefillState.semesterName);
      return;
    }

    if (!latestSemesterName) return;
    setValue("semesterName", latestSemesterName);
  }, [latestSemesterName, prefillState, selectedSemesterName, setValue]);

  useEffect(() => {
    const loadCourses = async () => {
      if (!selectedSemesterName) {
        setCourses([]);
        setValue("courseName", "");
        setValue("assessmentName", "");
        return;
      }
      try {
        const { data } = await courseBySemesterRequest(selectedSemesterName);
        setCourses(Array.isArray(data?.courses) ? data.courses : []);
        if (prefillState?.courseName) {
          setValue("courseName", prefillState.courseName);
        }
      } catch (error) {
        console.error(error);
        setCourses([]);
      }
      if (!prefillState?.courseName) {
        setValue("courseName", "");
      }
      setValue("assessmentName", "");
    };
    loadCourses();
  }, [prefillState?.courseName, selectedSemesterName, setValue]);

  useEffect(() => {
    const loadAssessments = async () => {
      if (!selectedSemester?.semester_id) {
        setAssessments([]);
        setValue("assessmentName", "");
        return;
      }
      try {
        const { data } = await assessmentBySemesterRequest(
          selectedSemester.semester_id,
        );
        setAssessments(
          Array.isArray(data?.assessments) ? data.assessments : [],
        );
        if (prefillState?.assessmentName) {
          setValue("assessmentName", prefillState.assessmentName);
        }
      } catch (error) {
        console.error(error);
        setAssessments([]);
      }
      if (!prefillState?.assessmentName) {
        setValue("assessmentName", "");
      }
    };
    loadAssessments();
  }, [prefillState?.assessmentName, selectedSemester, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      setErrorMessage("");
      const res = await gradeCreateRequest(values);
      console.log(res);
      navigate(prefillState?.redirectTo || "/grade-list", {
        state:
          prefillState?.redirectTo === "/assessment-list"
            ? {
                refreshAssessmentData: true,
                semesterName: prefillState?.semesterName,
              }
            : undefined,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.error;
        setErrorMessage(apiMessage || "The grade could not be created");
        return;
      }
      setErrorMessage("An unexpected error occurred");
    }
  });

  return (
    <div>
      <div className="formContainer">
        <p className="title">Register grade</p>
        {errorMessage || semesterError ? (
          <p>{errorMessage || semesterError}</p>
        ) : null}
        <form onSubmit={onSubmit} className="formLayout">
          <SemesterSelect
            semesters={semesters}
            placeholderOptionText="Select a semester"
            emptyOptionText="No semesters registered"
            selectProps={{
              defaultValue: "",
              ...semesterRegister,
            }}
          />

          <CourseSelect
            courses={courses}
            placeholderOptionText={
              selectedSemesterName
                ? "Select a course"
                : "Select a semester first"
            }
            emptyOptionText={
              selectedSemesterName
                ? "No courses in this semester"
                : "Select a semester first"
            }
            selectProps={{
              defaultValue: "",
              ...register("courseName", { required: true }),
            }}
          />

          <AssessmentSelect
            assessments={filteredAssessments}
            placeholderOptionText={
              selectedCourseName
                ? "Select an assessment"
                : "Select a course first"
            }
            emptyOptionText={
              selectedCourseName
                ? "No assessments for this course"
                : "Select a course first"
            }
            selectProps={{
              defaultValue: "",
              ...register("assessmentName", { required: true }),
            }}
          />

          <Controller
            name="value"
            control={control}
            rules={{ required: true, min: 0, max: 5 }}
            render={({ field: { onChange, onBlur, ref, value } }) => (
              <input
                className="formControl"
                placeholder="Grade (0.0 - 5.0)"
                type="number"
                step="0.1"
                min={0}
                max={5}
                value={value ?? ""}
                onChange={(e) => {
                  const parsed = parseFloat(e.target.value);
                  onChange(isNaN(parsed) ? "" : parsed);
                }}
                onBlur={onBlur}
                ref={ref}
              />
            )}
          />

          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
};

export default grade;
