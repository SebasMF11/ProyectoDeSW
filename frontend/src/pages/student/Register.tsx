import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { authRequest } from "../../api/students.api";
import { careersRequest } from "../../api/catalog";
import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import { useStorageImage } from "../../hooks/useStorageImage";

type Career = {
  career_id: string;
  name: string;
};

const Register = () => {
  const navigate = useNavigate();
  const session = useAuth();
  const getImageUrl = useStorageImage("images");
  const fondoUrl = getImageUrl("FondoDePantalla.jpg");
  const logoUrl = getImageUrl("logo.png");
  const [careers, setCareers] = useState<Career[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (session) navigate("/home");
  }, [navigate, session]);

  useEffect(() => {
    const loadCareers = async () => {
      try {
        const { data } = await careersRequest();
        setCareers(Array.isArray(data?.careers) ? data.careers : []);
      } catch (error) {
        console.error(error);
      }
    };
    loadCareers();
  }, []);

  const { register, handleSubmit, watch } = useForm();
  const password = watch("password");

  const onSubmit = handleSubmit(async (values) => {
    try {
      setErrorMessage("");
      if (values.password !== values.password2) {
        setErrorMessage("Las contraseñas no coinciden");
        return;
      }
      await authRequest(values);
      navigate("/auth");
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.error || "No se pudo registrar el usuario",
      );
    }
  });

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <img
        src={fondoUrl}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative z-10 w-[90%] max-w-md bg-white/40 sm:bg-white/30 backdrop-blur-md sm:backdrop-blur-lg rounded-3xl p-6 sm:p-8 shadow-lg text-center">
        <div className="flex flex-col items-center gap-4">
          <img src={logoUrl} alt="logo" className="w-44" />
          <h2 className="text-sm sm:text-base text-black">Registrarse</h2>

          {errorMessage ? (
            <p className="text-red-600 text-sm">{errorMessage}</p>
          ) : null}

          <form onSubmit={onSubmit} className="w-full flex flex-col gap-3">
            <input
              placeholder="Nombre"
              type="text"
              {...register("name", { required: true })}
              className="w-full px-4 py-3 rounded-full text-gray-700 bg-white/70 outline-none"
            />
            <input
              placeholder="Apellidos"
              type="text"
              {...register("lastName", { required: true })}
              className="w-full px-4 py-3 rounded-full text-gray-700 bg-white/70 outline-none"
            />
            <input
              placeholder="Correo electrónico"
              type="email"
              {...register("email", { required: true })}
              className="w-full px-4 py-3 rounded-full text-gray-700 bg-white/70 outline-none"
            />

            {/* Selector de carrera */}
            <select
              {...register("career_id", { required: true })}
              className="w-full px-4 py-3 rounded-full text-gray-700 bg-white/70 outline-none"
              defaultValue=""
            >
              <option value="" disabled>
                {careers.length > 0
                  ? "Selecciona tu carrera"
                  : "Cargando carreras..."}
              </option>
              {careers.map((career) => (
                <option key={career.career_id} value={career.career_id}>
                  {career.name}
                </option>
              ))}
            </select>

            <input
              placeholder="Contraseña"
              type="password"
              {...register("password", { required: true, minLength: 6 })}
              className="w-full px-4 py-3 rounded-full text-gray-700 bg-white/70 outline-none"
            />
            <input
              placeholder="Confirmar contraseña"
              type="password"
              {...register("password2", {
                required: true,
                validate: (value) =>
                  value === password || "Las contraseñas no coinciden",
              })}
              className="w-full px-4 py-3 rounded-full text-gray-700 bg-white/70 outline-none"
            />

            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white rounded-full px-6 py-4 font-semibold transition mx-auto block"
            >
              Registrarse
            </button>

            <p className="text-sm text-gray-900">
              ¿Ya tienes una cuenta?{" "}
              <span
                className="underline cursor-pointer"
                onClick={() => navigate("/auth")}
              >
                Inicia sesión aquí
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
