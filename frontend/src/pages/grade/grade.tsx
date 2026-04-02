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
            placeholder="Seleccionar actividad"
            type="text"
            className="inputClase"
            {...register("assessment", { required: true })}
          />
          <input
            placeholder="Nota"
            type="number"
            className="inputClase"
            {...register("grade", { required: true })}
          />
          <button type="submit">Registrarse</button>
        </form>
      </div>
    </div>
  );
};
export default grade;
