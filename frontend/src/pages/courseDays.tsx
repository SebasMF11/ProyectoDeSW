import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { authRequest } from "../api/auth";
const courseDays = () => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const onSubmit = handleSubmit(async (values) => {
    const res = await authRequest(values);
    console.log(res);
    navigate("/");
  });
  return (
    <div>
      <div>
        <p>Crear cuenta</p>
        <form onSubmit={onSubmit}>
          <input
            placeholder="Dia de la semana"
            type="number"
            {...register("day", { required: true })}
          />
          <input
            placeholder="Aula"
            type="text"
            {...register("classroom", { required: true })}
          />
          <input
            placeholder="Hora de inicio"
            type="text"
            {...register("startTime", { required: true })}
          />
          <input
            placeholder="Hora de fin"
            type="text"
            {...register("endTime", { required: true })}
          />
          <button type="submit">Registrarse</button>
        </form>
      </div>
    </div>
  );
};
export default courseDays;
