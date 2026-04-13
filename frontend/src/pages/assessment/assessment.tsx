import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import axios from "axios";
import { assessmentCreateRequest } from "../../api/assessment.api";
import { semesterViewRequest } from "../../api/semester";
import { courseBySemesterRequest } from "../../api/course";
import SemesterSelect from "../../components/SemesterSelect";
import CourseSelect from "../../components/CourseSelect";

type Semester = {
  semester_id: number;
  semester_name: string;
  start_date: string;
  end_date: string;
};

type Course = {
  course_name: string;
};

const assessmentTypes = [
  "midterm",
  "quiz",
  "workshop",
  "project",
  "presentation",
  "lab",
];

const assessment = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const { register, handleSubmit, watch, setValue } = useForm();
  const selectedSemester = watch("semesterName");
  const selectedSemesterData = semesters.find(
    (semester) => semester.semester_name === selectedSemester,
  );

  useEffect(() => {
    const loadSemesters = async () => {
      try {
        const { data } = await semesterViewRequest();
        setSemesters(Array.isArray(data) ? data : []);
        // Seleccionar automáticamente el primer semestre si existe
        if (Array.isArray(data) && data.length > 0) {
          setValue("semesterName", data[0].semester_name);
        }
      } catch (error) {
        console.error(error);
        setSemesters([]);
      }
    };

    loadSemesters();
  }, [setValue]);

  useEffect(() => {
    const loadCoursesBySemester = async () => {
      if (!selectedSemester) {
        setCourses([]);
        setValue("courseName", "");
        return;
      }

      try {
        const { data } = await courseBySemesterRequest(selectedSemester);
        const semesterCourses = Array.isArray(data?.courses)
          ? data.courses
          : [];
        setCourses(semesterCourses);
        setValue("courseName", "");
      } catch (error) {
        console.error(error);
        setCourses([]);
        setValue("courseName", "");
      }
    };

    loadCoursesBySemester();
  }, [selectedSemester, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      setErrorMessage("");
      const res = await assessmentCreateRequest(values);
      console.log(res);
      navigate("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.error;
        setErrorMessage(apiMessage || "Could not create the assessment");
        return;
      }

      setErrorMessage("An unexpected error occurred");
    }
  });

  return (
    <div>
      <div className="formContainer">
        <form onSubmit={onSubmit} className="formLayout">
          <p className="title">Assessment</p>
          {errorMessage ? <p>{errorMessage}</p> : null}
          <SemesterSelect
            semesters={semesters}
            placeholderOptionText="Select a semester"
            emptyOptionText="No semesters available"
            selectProps={{
              defaultValue: "",
              ...register("semesterName", { required: true }),
            }}
          />
          <CourseSelect
            courses={courses}
            placeholderOptionText={
              selectedSemester ? "Select a course" : "Select a semester first"
            }
            emptyOptionText={
              selectedSemester
                ? "No courses in this semester"
                : "Select a semester first"
            }
            selectProps={{
              defaultValue: "",
              ...register("courseName", { required: true }),
            }}
          />
          <input
            className="formControl"
            placeholder="Assessment name"
            type="text"
            {...register("assessmentName", { required: true })}
          />
          <input
            className="formControl"
            placeholder="Assessment date"
            type="date"
            min={selectedSemesterData?.start_date}
            max={selectedSemesterData?.end_date}
            {...register("dueDate", { required: true })}
          />
          <select
            className="formControl"
            defaultValue=""
            {...register("type", { required: true })}
          >
            <option value="" disabled>
              Select the assessment type
            </option>
            {assessmentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <div className="flex flex-row items-center gap-2">
            <input
              className="formControl w-[50%]"
              placeholder="--"
              {...register("percentage", {
                required: true,
                valueAsNumber: true,
              })}
            />
            <p className="text-[25px] text-[#3d483f]">%</p>
          </div>
          <button type="submit">Create</button>
        </form>
      </div>
    </div>
  );
};
export default assessment;
