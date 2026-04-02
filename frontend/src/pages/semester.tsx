import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { semesterCreateRequest } from "../api/semester";
import axios from "axios";
import { useState } from "react";

const Semester = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const { register, handleSubmit } = useForm();

  const onSubmit = handleSubmit(async (values) => {
    try {
      setErrorMessage("");
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
      <div>
        <p>Crear semestre</p>
        {errorMessage ? <p>{errorMessage}</p> : null}
        <form onSubmit={onSubmit}>
          <input
            placeholder="Nombre del semestre"
            type="text"
            {...register("semesterName", { required: true })}
          />
          <input
            placeholder="Fecha de inicio"
            type="date"
            {...register("startDate", { required: true })}
          />
          <input
            placeholder="Fecha de fin"
            type="date"
            {...register("endDate", { required: true })}
          />
          <input
            placeholder="Inicio de semana de parciales"
            type="date"
            {...register("midtermWeek", { required: true })}
          />
          <button type="submit">Registrarse</button>
        </form>
      </div>
    </div>
  );
};

export default Semester;
