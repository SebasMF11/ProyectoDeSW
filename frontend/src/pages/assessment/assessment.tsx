import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import axios from "axios";
import { assessmentCreateRequest } from "../../api/assessment.api";
import { semesterViewRequest } from "../../api/semester";
import { courseBySemesterRequest } from "../../api/course";

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
      } catch (error) {
        console.error(error);
        setSemesters([]);
      }
    };

    loadSemesters();
  }, []);

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
        setErrorMessage(apiMessage || "No se pudo crear la actividad");
        return;
      }

      setErrorMessage("Ocurrio un error inesperado");
    }
  });

  return (
    <div>
      <div>
        <p>Crear cuenta</p>
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
              {selectedSemester
                ? courses.length > 0
                  ? "Selecciona una asignatura"
                  : "No hay asignaturas en este semestre"
                : "Primero selecciona un semestre"}
            </option>
            {courses.map((course) => (
              <option key={course.course_name} value={course.course_name}>
                {course.course_name}
              </option>
            ))}
          </select>
          <input
            placeholder="Nombre de la actividad"
            type="text"
            {...register("assessmentName", { required: true })}
          />
          <input
            placeholder="Fecha de la actividad"
            type="date"
            min={selectedSemesterData?.start_date}
            max={selectedSemesterData?.end_date}
            {...register("dueDate", { required: true })}
          />
          <select defaultValue="" {...register("type", { required: true })}>
            <option value="" disabled>
              Selecciona el tipo de actividad
            </option>
            {assessmentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <input
            placeholder="--%"
            type="number"
            {...register("percentage", { required: true, valueAsNumber: true })}
          />
          <button type="submit">Registrarse</button>
        </form>
      </div>
    </div>
  );
};
export default assessment;
