import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { dayCreateRequest } from "../../api/day.api";
const day = () => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const onSubmit = handleSubmit(async (values) => {
    const res = await dayCreateRequest(values);
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
            {...register("dayOfWeek", { required: true })}
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
export default day;
