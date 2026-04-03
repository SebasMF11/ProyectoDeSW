import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { semesterCreateRequest, semesterViewRequest } from "../api/semester";
import axios from "axios";
import { useEffect, useState } from "react";

// Modelo de cada semestre que llega desde la API y se guarda en estado local.
type SemesterItem = {
  semester_id: number;
  semester_name: string;
  start_date: string;
  end_date: string;
};

// Valida si el rango [startDate, endDate] se cruza con un semestre existente.
const overlaps = (
  startDate: string,
  endDate: string,
  existing: SemesterItem,
) => {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  const existingStart = new Date(`${existing.start_date}T00:00:00Z`);
  const existingEnd = new Date(`${existing.end_date}T00:00:00Z`);

  // Si el nuevo inicio ocurre antes del fin existente y el nuevo fin despues
  // del inicio existente, entonces hay superposicion.
  return start < existingEnd && end > existingStart;
};

const Semester = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [semesters, setSemesters] = useState<SemesterItem[]>([]);
  const { register, handleSubmit, watch } = useForm();
  const startDate = watch("startDate");
  const endDate = watch("endDate");

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

      const { startDate, endDate, midtermWeek } = values;

      if (startDate > endDate) {
        setErrorMessage(
          "La fecha de inicio no puede ser mayor que la fecha de fin",
        );
        return;
      }

      if (midtermWeek < startDate || midtermWeek > endDate) {
        setErrorMessage(
          "La fecha de inicio de parciales debe estar entre inicio y fin del semestre",
        );
        return;
      }

      const overlappingSemester = semesters.find((semester) =>
        overlaps(startDate, endDate, semester),
      );

      if (overlappingSemester) {
        setErrorMessage(
          `Las fechas del semestre se sobreponen con "${overlappingSemester.semester_name}"`,
        );
        return;
      }

      const res = await semesterCreateRequest(values);
      console.log(res);
      navigate("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.error;
        setErrorMessage(apiMessage || "No se pudo crear el semestre");
        return;
      }

      setErrorMessage("Ocurrio un error inesperado");
    }
  });

  return (
    <div>
      <div className="z-10 max-w-xl p-6 mx-auto">
        {errorMessage ? <p>{errorMessage}</p> : null}
        <form className="flex flex-col items-center gap-4" onSubmit={onSubmit}>
          <p className="title">Semestre</p>
          <input
            placeholder="Semester Name. Example: 2023-1"
            type="text"
            className="inputClase"
            {...register("semesterName", { required: true })}
          />
          <p className="text-sm text-gray-600">Fecha de inicio</p>
          <input
            placeholder="Fecha de inicio"
            type="date"
            className="inputClase"
            {...register("startDate", { required: true })}
          />

          <p className="text-sm text-gray-600">Fecha de fin</p>
          <input
            placeholder="Fecha de fin"
            type="date"
            className="inputClase"
            min={startDate || undefined}
            {...register("endDate", { required: true })}
          />

          <p className="text-sm text-gray-600">Fecha de inicio de parciales</p>
          <input
            placeholder="Inicio de semana de parciales"
            type="date"
            className="inputClase"
            min={startDate || undefined}
            max={endDate || undefined}
            {...register("midtermWeek", { required: true })}
          />
          <button type="submit">Registrarse</button>
        </form>
      </div>
    </div>
  );
};

export default Semester;
