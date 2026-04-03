import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import axios from "axios";
import { courseCreateRequest } from "../../api/course";
import { semesterViewRequest } from "../../api/semester";

type Semester = {
  semester_id: number;
  semester_name: string;
};

const colorOptions = [
  "red",
  "blue",
  "green",
  "yellow",
  "orange",
  "purple",
  "pink",
  "black",
  "white",
  "gray",
];

const course = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const { register, handleSubmit } = useForm();

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

  const onSubmit = handleSubmit(async (values) => {
    try {
      setErrorMessage("");
      const res = await courseCreateRequest(values);
      console.log(res);
      navigate("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.error;
        setErrorMessage(apiMessage || "No se pudo crear el curso");
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
          <select defaultValue="" {...register("color", { required: true })}>
            <option value="" disabled>
              Selecciona un color
            </option>
            {colorOptions.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
          <input
            placeholder="Nombre"
            type="text"
            {...register("courseName", { required: true })}
          />
          <input
            placeholder="Profesor"
            type="text"
            {...register("teacher", { required: true })}
          />
          <input
            placeholder="Creditos"
            type="number"
            {...register("credits", { required: true })}
          />
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
          <button type="submit">Registrarse</button>
        </form>
      </div>
    </div>
  );
};
export default course;
