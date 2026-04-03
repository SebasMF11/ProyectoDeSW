import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { dayCreateRequest } from "../../api/day.api";
import { semesterViewRequest } from "../../api/semester";
import { courseBySemesterRequest } from "../../api/course";
import axios from "axios";
import { useEffect, useState } from "react";

type Semester = {
  semester_id: number;
  semester_name: string;
};

type Course = {
  course_name: string;
};

const dayOptions = [
  { value: "monday", label: "Lunes" },
  { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miercoles" },
  { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sabado" },
  { value: "sunday", label: "Domingo" },
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
        const semesterCourses = Array.isArray(data?.courses)
          ? data.courses
          : [];
        setCourses(semesterCourses);
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
      navigate("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.error;
        setErrorMessage(apiMessage || "No se pudo crear el dia");
        return;
      }

      setErrorMessage("Ocurrio un error inesperado");
    }
  });
  return (
    <div>
      <div>
        <p>Crear dia</p>
        {errorMessage ? <p>{errorMessage}</p> : null}
        <form onSubmit={onSubmit}>
          <select
            defaultValue=""
            {...register("semesterName", { required: true })}
          >
            <option value="" disabled>
              {semesters.length > 0
                ? "Selecciona un semestre"
                : "No hay semestres registrados"}
            </option>
            {semesters.map((semester) => (
              <option key={semester.semester_id} value={semester.semester_name}>
                {semester.semester_name}
              </option>
            ))}
          </select>
          <select
            defaultValue=""
            {...register("courseName", { required: true })}
          >
            <option value="" disabled>
              {selectedSemesterName
                ? courses.length > 0
                  ? "Selecciona un curso"
                  : "No hay cursos en este semestre"
                : "Primero selecciona un semestre"}
            </option>
            {courses.map((course) => (
              <option key={course.course_name} value={course.course_name}>
                {course.course_name}
              </option>
            ))}
          </select>
          <select
            defaultValue=""
            {...register("dayOfWeek", { required: true })}
          >
            <option value="" disabled>
              Selecciona un dia de la semana
            </option>
            {dayOptions.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
          <input
            placeholder="Aula"
            type="text"
            {...register("classroom", { required: true })}
          />
          <input
            placeholder="Hora de inicio"
            type="time"
            min="06:00"
            max="22:00"
            {...register("startTime", { required: true })}
          />
          <input
            placeholder="Hora de fin"
            type="time"
            min="06:00"
            max="22:00"
            {...register("endTime", { required: true })}
          />
          <button type="submit">Registrarse</button>
        </form>
      </div>
    </div>
  );
};
export default Day;
