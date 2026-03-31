import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { authRequest } from "../api/auth";
import { useEffect } from "react";
import useAuth from "../hooks/useAuth";
import fondo from "../assets/FondoDePantalla.jpg";
import logo from "../assets/logo.png";

const Register = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const session = useAuth();
    if (session) navigate("/home");
  }, []);
  const { register, handleSubmit } = useForm();
  const onSubmit = handleSubmit(async (values) => {
    const res = await authRequest(values);
    console.log(res);
    navigate("/auth");
    if (false) {
      setTimeout(() => navigate("/home"), 1000);
    }
  });
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Fondo */}
      <img
        src={fondo}
        alt="fondo"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Card */}
      <div className="relative z-10 w-[90%] max-w-md bg-white/40 sm:bg-white/30 backdrop-blur-md sm:backdrop-blur-lg rounded-3xl p-6 sm:p-8 shadow-lg text-center">
        <div className="flex flex-col items-center gap-4">
          {/* Logo */}
          <img src={logo} alt="logo" className="w-44" />

          {/* Títulos */}
          <h2 className="text-sm sm:text-base text-black">Sign up</h2>

          {/* FORMULARIO */}
          <form onSubmit={onSubmit} className="w-full flex flex-col gap-3">
            {/* Nombre */}
            <input
              placeholder="Name"
              type="text"
              {...register("name", { required: true })}
              className="w-full px-4 py-3 rounded-full text-gray-700 bg-white/70 outline-none"
            />
            <input
              placeholder="Last Name"
              type="text"
              {...register("lastName", { required: true })}
              className="w-full px-4 py-3 rounded-full text-gray-700 bg-white/70 outline-none"
            />

            {/* Correo */}
            <input
              placeholder="Email"
              type="email"
              {...register("email", { required: true })}
              className="w-full px-4 py-3 rounded-full text-gray-700 bg-white/70 outline-none"
            />

            {/* Contraseña */}
            <input
              placeholder="Password"
              type="password"
              {...register("password", { required: true })}
              className="w-full px-4 py-3 rounded-full text-gray-700 bg-white/70 outline-none"
            />

            {/* Confirmar contraseña */}
            <input
              placeholder="Confirm Password"
              type="password"
              {...register("password2", { required: true })}
              className="w-full px-4 py-3 rounded-full text-gray-700 bg-white/70 outline-none"
            />

            {/* Para volver al login */}
            <p className="text-sm text-gray-900">
              Do you already have an account?{" "}
              <span
                className="underline cursor-pointer"
                onClick={() => navigate("/auth")}
              >
                Sign in here
              </span>
            </p>

            {/* Botón */}
            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-full font-semibold transition"
            >
              Registrarse
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Register;
