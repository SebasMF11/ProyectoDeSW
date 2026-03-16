import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import useAuth from "../hooks/useAuth";
import { loginRequest } from "../api/auth";
import { supabase } from "../integrations/supabase";
const Auth = () => {
  const navigate = useNavigate();
  const session = useAuth();
  useEffect(() => {
    if (session) navigate("/home");
  }, []);
  const { register, handleSubmit } = useForm();
  const onSubmit = handleSubmit(async (values) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      console.error(error);
      // Aquí puedes mostrar un mensaje de error al usuario
      return;
    }
    // Enviar el usuario al backend para almacenar
    const res = await loginRequest(data.user);
    console.log(res);
    navigate("/home");
  });
  return (
    <div>
      <div>
        <div>
          <p>Si no tienes cuenta </p>
          <button type="button" onClick={() => navigate("/register")}>
            REGISTRESE
          </button>
        </div>
        <h1>Login</h1>
        <form onSubmit={onSubmit}>
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
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
