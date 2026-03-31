import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { academicPeriodRequest } from "../api/academicPeriods.api";
const academicPeriod = () => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const onSubmit = handleSubmit(async (values) => {
    const res = await academicPeriodRequest(values);
    console.log(res);
    navigate("/");
  });
  return (
    <div>
      <div>
        <p>Crear cuenta</p>
        <form onSubmit={onSubmit}>
          <input
            placeholder="Año-Semestre"
            type="number"
            {...register("semesterName", { required: true })}
          />
          <input
            placeholder="Fecha de inicio"
            type="date"
            {...register("startDate", { required: true })}
          />
          <input
            placeholder="Fecha de fin"
            type="date"
            {...register("endDate", { required: true })}
          />
          <input
            placeholder="Semana de parciales"
            type="number"
            {...register("midtermWeek", { required: true })}
          />
          <button type="submit">Registrarse</button>
        </form>
      </div>
    </div>
  );
};
export default academicPeriod;
