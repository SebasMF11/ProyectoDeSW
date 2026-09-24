import { useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { dayCreateRequest } from "../../api/day.api";
import { semesterViewRequest } from "../../api/semester";
import { courseBySemesterRequest } from "../../api/course";
import CourseSelect, { type Course } from "../../components/CourseSelect";
import axios from "axios";
import { useEffect, useState } from "react";

type Semester = {
  semester_id: string;
  name: string;
};

const dayOptions = [
  { value: "monday", label: "Lunes" },
  { value: "tuesday", label: "Martes" },
  { value: "wednesday", label: "Miércoles" },
  { value: "thursday", label: "Jueves" },
  { value: "friday", label: "Viernes" },
  { value: "saturday", label: "Sábado" },
  { value: "sunday", label: "Domingo" },
];

const Day = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const { register, handleSubmit, watch, setValue, control } = useForm();
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
        setCourses(Array.isArray(data?.courses) ? data.courses : []);
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
      await dayCreateRequest(values);
      navigate("/course-list");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.error;
        setErrorMessage(apiMessage || "No se pudo crear el día del horario");
        return;
      }
      setErrorMessage("Ocurrió un error inesperado");
    }
  });

  return (
    <div>
      <div className="formContainer">
        <form onSubmit={onSubmit} className="formLayout">
          <p className="title">Día</p>
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
                ? "Selecciona un semestre"
                : "No hay semestres disponibles"}
            </option>
            {semesters.map((semester) => (
              <option key={semester.semester_id} value={semester.name}>
                {semester.name}
              </option>
            ))}
          </select>

          {/* Curso */}
          <CourseSelect
            id="day-course"
            courses={courses}
            placeholderOptionText={
              selectedSemesterName
                ? "Selecciona un curso"
                : "Primero selecciona un semestre"
            }
            emptyOptionText={
              selectedSemesterName
                ? "No hay cursos en este semestre"
                : "Primero selecciona un semestre"
            }
            selectProps={{
              defaultValue: "",
              ...register("courseName", { required: true }),
            }}
          />

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
              Selecciona un día de la semana
            </option>
            {dayOptions.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>

          <input
            className="formControl"
            placeholder="Aula"
            type="text"
            {...register("classroom")}
          />

          {/* Start Time — usando Controller para que RHF detecte el valor correctamente */}
          <label className="formText" htmlFor="day-start-time">
            Hora de inicio
          </label>
          <Controller
            name="startTime"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <input
                id="day-start-time"
                className="formControl"
                type="time"
                min="06:00"
                max="22:00"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}
          />

          {/* End Time */}
          <label className="formText" htmlFor="day-end-time">
            Hora de fin
          </label>
          <Controller
            name="endTime"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <input
                id="day-end-time"
                className="formControl"
                type="time"
                min="06:00"
                max="22:00"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}
          />
          <button type="submit">Crear</button>
        </form>
      </div>
    </div>
  );
};

export default Day;
