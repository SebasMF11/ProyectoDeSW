import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { authRequest } from "../api/auth";
const academicPeriod = () => {
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
            placeholder="Nombre Completo"
            type="text"
            {...register("name", { required: true })}
          />
          <input
            placeholder="Correo"
            type="email"
            {...register("email", { required: true })}
          />
          <input
            placeholder="Contraseña"
            type="password"
            {...register("password", { required: true })}
          />
          <input
            placeholder="Confirmar Contraseña"
            type="password"
            {...register("password2", { required: true })}
          />
          <button type="submit">Registrarse</button>
        </form>
      </div>
    </div>
  );
};
export default academicPeriod;
