import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { assessmentCreateRequest } from "../../api/assessment.api";

const assessment = () => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const onSubmit = handleSubmit(async (values) => {
    const res = await assessmentCreateRequest(values);
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
            {...register("courseName", { required: true })}
          />
          <input
            placeholder="Nombre del semestre"
            type="text"
            {...register("semesterName", { required: true })}
          />
          <input
            placeholder="Nombre de la actividad"
            type="text"
            {...register("assessmentName", { required: true })}
          />
          <input
            placeholder="Mes"
            type="number"
            {...register("month", { required: true, valueAsNumber: true })}
          />
          <input
            placeholder="Dia"
            type="number"
            {...register("day", { required: true, valueAsNumber: true })}
          />
          <input
            placeholder="Tipo de actividad"
            type="text"
            {...register("type", { required: true })}
          />
          <input
            placeholder="--%"
            type="number"
            {...register("percentage", { required: true, valueAsNumber: true })}
          />
          <button type="submit">Registrarse</button>
        </form>
      </div>
    </div>
  );
};
export default assessment;
