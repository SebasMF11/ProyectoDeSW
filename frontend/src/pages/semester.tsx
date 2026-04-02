import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { semesterCreateRequest } from "../api/semester";

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
      <div>
        <p>Crear semestre</p>
        <form onSubmit={onSubmit}>
          <input
            placeholder="Nombre del semestre"
            type="text"
            className="inputClase"
            {...register("semesterName", { required: true })}
          />
          <input
            placeholder="Fecha de inicio"
            type="date"
            className="inputClase"
            {...register("startDate", { required: true })}
          />
          <input
            placeholder="Fecha de fin"
            type="date"
            className="inputClase"
            {...register("endDate", { required: true })}
          />
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
