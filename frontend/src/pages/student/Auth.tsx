import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import useAuth from "../../hooks/useAuth";
import { loginRequest } from "../../api/students.api";
import { supabase } from "../../integrations/supabase";
import fondo from "../../assets/FondoDePantalla.jpg";
import logo from "../../assets/logo.png";

const Auth = () => {
  const navigate = useNavigate();
  const session = useAuth();
  useEffect(() => {
    if (session) navigate("/home");
  }, [navigate, session]);
  const { register, handleSubmit } = useForm();
  const onSubmit = handleSubmit(async (values) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      console.error(error);
      return;
    }
    try {
      await loginRequest({
        email: values.email,
        password: values.password,
      });
    } catch (err) {
      console.error("Error al sincronizar con base de datos:", err);
    }
    navigate("/home");
  });
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <img
        src={fondo}
        alt="fondo"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative z-10 w-[90%] max-w-md bg-white/40 sm:bg-white/30 backdrop-blur-md sm:backdrop-blur-lg rounded-3xl p-6 sm:p-8 shadow-lg text-center">
        <div className="flex flex-col items-center gap-4">
          <img src={logo} alt="logo" className="w-44" />

          <h2 className="text-sm sm:text-base text-black">Login</h2>

          <form onSubmit={onSubmit} className="w-full flex flex-col gap-3">
            <input
              placeholder="Email"
              type="email"
              {...register("email", { required: true })}
              className="w-full px-4 text-gray-700 py-3 rounded-full bg-white/70 outline-none"
            />
            <input
              placeholder="Password"
              minLength={6}
              required
              type="password"
              {...register("password", {
                required: "La contraseña es obligatoria",
                minLength: { value: 6, message: "Mínimo 6 caracteres" },
              })}
              className="w-full px-4 text-gray-700 py-3 rounded-full bg-white/70 outline-none"
            />

            <p className="text-sm text-gray-900">
              Dont have an account?{" "}
              <span
                className="underline cursor-pointer"
                onClick={() => navigate("/register")}
              >
                Sign up here.
              </span>
            </p>
            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-full font-semibold transition"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
