import { useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import axios from "axios";
import { courseCreateRequest, courseUpdateRequest } from "../../api/course";
import { semesterViewRequest } from "../../api/semester";

// Estructura de cada semestre recibido desde la API.
type Semester = {
  semester_id: number;
  semester_name: string;
};

// Datos que llegan por navegacion cuando se abre el formulario en modo edicion.
type EditCourseState = {
  course_id: number;
  course_name: string;
  teacher: string;
  credits: number;
  color?: string;
  semester_name: string;
};

// Valores que maneja react-hook-form dentro del formulario.
type FormValues = {
  color: string;
  courseName: string;
  teacher: string;
  credits: number;
  semesterName: string;
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
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState("");
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const { register, handleSubmit, setValue } = useForm<FormValues>();

  const editCourse = location.state as EditCourseState | undefined;
  const isEditMode = Boolean(editCourse?.course_id);

  // En BD el color del curso se guarda como HEX, pero el select usa nombres.
  // Este mapa traduce HEX -> nombre para precargar el valor correcto al editar.
  const colorHexToName: Record<string, string> = {
    "#FF5733": "red",
    "#3380FF": "blue",
    "#33FF57": "green",
    "#FFD700": "yellow",
    "#FFA500": "orange",
    "#800080": "purple",
    "#FF69B4": "pink",
    "#000000": "black",
    "#FFFFFF": "white",
    "#808080": "gray",
  };

  // useEffect con []: corre una sola vez al montar el componente.
  // Aqui se usa para cargar semestres iniciales desde la API.
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

  // useEffect con dependencias: corre al montar y cuando cambian esas dependencias.
  // Aqui rellena el formulario cuando hay curso a editar y cuando cambian sus datos.
  /*Qué es useEffect:
useEffect es un hook de React para ejecutar efectos secundarios después de renderizar, como pedir datos, sincronizar estado externo o precargar valores.
Depende del arreglo de dependencias:

[]: se ejecuta una vez al montar.
[a, b]: se ejecuta al montar y cada vez que cambie a o b.
Sin arreglo: se ejecuta en cada render.*/
  useEffect(() => {
    if (!isEditMode || !editCourse) return;

    setValue("courseName", editCourse.course_name || "");
    setValue("teacher", editCourse.teacher || "");
    setValue("credits", editCourse.credits);
    setValue("semesterName", editCourse.semester_name || "");
    setValue("color", colorHexToName[editCourse.color || ""] || "");
  }, [editCourse, isEditMode, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      setErrorMessage("");

      const payload = {
        ...values,
        credits: Number(values.credits),
      };

      const res = isEditMode
        ? await courseUpdateRequest(editCourse!.course_id, payload)
        : await courseCreateRequest(payload);

      console.log(res);
      navigate("/course-list");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.error;
        setErrorMessage(
          apiMessage ||
            (isEditMode
              ? "No se pudo actualizar el curso"
              : "No se pudo crear el curso"),
        );
        return;
      }

      setErrorMessage("Ocurrio un error inesperado");
    }
  });

  return (
    <div>
      <div>
        <p>{isEditMode ? "Editar curso" : "Crear curso"}</p>
        {errorMessage ? <p>{errorMessage}</p> : null}
        <form onSubmit={onSubmit}>
          <select
            defaultValue=""
            {...register("color", {
              required: true,
            })}
          >
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
            disabled={isEditMode}
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
          <button type="submit">
            {isEditMode ? "Guardar cambios" : "Registrar curso"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default course;
