import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { dayCreateRequest } from "../../api/day.api";
import axios from "axios";
import { useState } from "react";

const Day = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const { register, handleSubmit } = useForm();
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
          <input
            placeholder="Dia de la semana"
            type="text"
            {...register("dayOfWeek", { required: true })}
          />
          <input
            placeholder="Aula"
            type="text"
            {...register("classroom", { required: true })}
          />
          <input
            placeholder="Hora de inicio"
            type="time"
            {...register("startTime", { required: true })}
          />
          <input
            placeholder="Hora de fin"
            type="time"
            {...register("endTime", { required: true })}
          />
          <input
            placeholder="Nombre del curso"
            type="text"
            {...register("courseName", { required: true })}
          />
          <input
            placeholder="Nombre del semestre"
            type="text"
            {...register("semesterName", { required: true })}
          />
          <button type="submit">Registrarse</button>
        </form>
      </div>
    </div>
  );
};
export default Day;
