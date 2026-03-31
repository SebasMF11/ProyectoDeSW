import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { authRequest } from "../api/auth";
const note = () => {
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
            placeholder="Elegir asignatura"
            type="text"
            {...register("course", { required: true })}
          />
          <input
            placeholder="Seleccionar actividad"
            type="text"
            {...register("activity", { required: true })}
          />
          <input
            placeholder="Nota"
            type="number"
            {...register("grade", { required: true })}
          />
          <button type="submit">Registrarse</button>
        </form>
      </div>
    </div>
  );
};
export default note;
