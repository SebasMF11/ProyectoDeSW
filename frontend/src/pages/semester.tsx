import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { semesterCreateRequest } from "../api/semester";
import Navbar from "../components/navbar";

const Semester = () => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();

  const onSubmit = handleSubmit(async (values) => {
    const res = await semesterCreateRequest(values);
    console.log(res);
    navigate("/home");
  });

  return (
    <div>
      <Navbar />
      <div className="z-10 max-w-xl p-6 mx-auto">
        <form className="flex flex-col items-center gap-4" onSubmit={onSubmit}>
          <p className="title">Semestre</p>
          <input
            placeholder="Semester Name. Example: 2023-1"
            type="text"
            className="inputClase"
            {...register("semesterName", { required: true })}
          />
          <p className="text-sm text-gray-600">Fecha de inicio</p>
          <input
            placeholder="Fecha de inicio"
            type="date"
            className="inputClase"
            {...register("startDate", { required: true })}
          />

          <p className="text-sm text-gray-600">Fecha de fin</p>
          <input
            placeholder="Fecha de fin"
            type="date"
            className="inputClase"
            {...register("endDate", { required: true })}
          />

          <p className="text-sm text-gray-600">Fecha de inicio de parciales</p>
          <input
            placeholder="Inicio de semana de parciales"
            type="date"
            className="inputClase"
            {...register("midtermWeek", { required: true })}
          />
          <button type="submit">Registrarse</button>
        </form>
      </div>
    </div>
  );
};

export default Semester;
