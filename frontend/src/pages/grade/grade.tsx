import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { gradeCreateRequest } from "../../api/grade";
const grade = () => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const onSubmit = handleSubmit(async (values) => {
    const res = await gradeCreateRequest(values);
    console.log(res);
    navigate("/");
  });
  return (
    <div>
      <div>
        <p>Crear cuenta</p>
        <form onSubmit={onSubmit}>
          <input
            placeholder="Seleccionar actividad"
            type="text"
            {...register("assessment", { required: true })}
          />
          <input
            placeholder="Nota"
            type="number"
            {...register("grade", { required: true })}
          />
          <button type="submit">Registrarse</button>
        </form>
      </div>
    </div>
  );
};
export default grade;
