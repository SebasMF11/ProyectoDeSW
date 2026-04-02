import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { gradeCreateRequest } from "../../api/grade";
const grade = () => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const onSubmit = handleSubmit(async (values) => {
    const res = await gradeCreateRequest(values);
    console.log(res);
    navigate("/home");
  });
  return (
    <div>
      <div>
        <p>Crear cuenta</p>
        <form onSubmit={onSubmit}>
          <input
            placeholder="Seleccionar curso"
            type="text"
            {...register("courseName", { required: true })}
          />
          <input
            placeholder="Seleccionar actividad"
            type="text"
            {...register("assessmentName", { required: true })}
          />
          <input
            placeholder="Nota"
            type="number"
            {...register("value", { required: true, valueAsNumber: true })}
          />
          <input
            placeholder="Seleccionar curso"
            type="text"
            {...register("courseName", { required: true })}
          />
          <input
            placeholder="Nombre del semestre"
            type="text"
            {...register("semesterName", { required: true })}
          />
          <button type="submit">Registrarse</button>
        </form>
      </div>
    </div>
  );
};
export default grade;
