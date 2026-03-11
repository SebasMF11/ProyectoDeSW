import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { registerRequest } from "../api/auth";

const Registre = () => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const onSubmit = handleSubmit(async (values) => {
    console.log(values);
    const res = await registerRequest(values);
    console.log(res);
    if (false) {
      setTimeout(() => navigate("/home"), 1000);
    }
  });
  return (
    <div>
      <div>
        <button type="button" onClick={() => navigate("/auth")}>
          Volver
        </button>
        <h1>Registre</h1>
      </div>
      <form onSubmit={onSubmit}>
        <input
          placeholder="name"
          type="text"
          {...register("name", { required: true })}
        />
        <input
          placeholder="lastname"
          type="text"
          {...register("lastname", { required: true })}
        />
        <input
          placeholder="email"
          type="email"
          {...register("email", { required: true })}
        />
        <input
          placeholder="password"
          type="password"
          {...register("password", { required: true })}
        />
        <input
          placeholder="password2"
          type="password"
          {...register("password2", { required: true })}
        />
        <button type="submit">Registre</button>
      </form>
    </div>
  );
};
export default Registre;