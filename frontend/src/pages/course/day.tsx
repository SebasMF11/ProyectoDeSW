import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { dayCreateRequest } from "../../api/day.api";
import { semesterViewRequest } from "../../api/semester";
import { courseBySemesterRequest } from "../../api/course";
import axios from "axios";
import { useEffect, useState } from "react";

type Semester = {
  semester_id: string;
  name: string;
};

type Course = {
  course_id: string;
  courses: { name: string };
};

const dayOptions = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

const Day = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const { register, handleSubmit, watch, setValue } = useForm();
  const selectedSemesterName = watch("semesterName");

  useEffect(() => {
    const loadSemesters = async () => {
      try {
        const { data } = await semesterViewRequest();
        setSemesters(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setSemesters([]);
      }
    };
    loadSemesters();
  }, []);

  useEffect(() => {
    const loadCourses = async () => {
      if (!selectedSemesterName) {
        setCourses([]);
        setValue("courseName", "");
        return;
      }
      try {
        const { data } = await courseBySemesterRequest(selectedSemesterName);
        setCourses(
          Array.isArray(data?.courses) ? data.courses : [],
        );
      } catch (error) {
        console.error(error);
        setCourses([]);
      }
      setValue("courseName", "");
    };
    loadCourses();
  }, [selectedSemesterName, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      setErrorMessage("");
      const res = await dayCreateRequest(values);
      console.log(res);
      navigate("/course-list");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.error;
        setErrorMessage(apiMessage || "Could not create the day");
        return;
      }
      setErrorMessage("An unexpected error occurred");
    }
  });

  return (
    <div>
      <div className="formContainer">
        <form onSubmit={onSubmit} className="formLayout">
          <p className="title">Day</p>
          {errorMessage ? <p>{errorMessage}</p> : null}

          {/* Semestre */}
          <label className="formText" htmlFor="day-semester">
            Semestre
          </label>
          <select
            id="day-semester"
            className="formControl"
            defaultValue=""
            {...register("semesterName", { required: true })}
          >
            <option value="" disabled>
              {semesters.length > 0
                ? "Select a semester"
                : "No semesters available"}
            </option>
            {semesters.map((semester) => (
              <option key={semester.semester_id} value={semester.name}>
                {semester.name}
              </option>
            ))}
          </select>

          {/* Curso */}
          <label className="formText" htmlFor="day-course">
            Curso
          </label>
          <select
            id="day-course"
            className="formControl"
            defaultValue=""
            {...register("courseName", { required: true })}
          >
            <option value="" disabled>
              {selectedSemesterName
                ? courses.length > 0
                  ? "Select a course"
                  : "No courses in this semester"
                : "Select a semester first"}
            </option>
            {courses.map((course) => (
              <option key={course.course_id} value={course.courses.name}>
                {course.courses.name}
              </option>
            ))}
          </select>

          {/* Día de la semana */}
          <label className="formText" htmlFor="day-of-week">
            Día de la semana
          </label>
          <select
            id="day-of-week"
            className="formControl"
            defaultValue=""
            {...register("dayOfWeek", { required: true })}
          >
            <option value="" disabled>
              Select a day of the week
            </option>
            {dayOptions.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>

          <input
            className="formControl"
            placeholder="Classroom"
            type="text"
            {...register("classroom")}
          />
          <input
            className="formControl"
            placeholder="Start Time"
            type="time"
            min="06:00"
            max="22:00"
            {...register("startTime", { required: true })}
          />
          <input
            className="formControl"
            placeholder="End Time"
            type="time"
            min="06:00"
            max="22:00"
            {...register("endTime", { required: true })}
          />
          <button type="submit">Create</button>
        </form>
      </div>
    </div>
  );
};

export default Day;
