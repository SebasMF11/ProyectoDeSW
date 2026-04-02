import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { courseCreateRequest } from "../../api/course";
const course = () => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const onSubmit = handleSubmit(async (values) => {
    const res = await courseCreateRequest(values);
    console.log(res);
    navigate("/");
  });
  return (
    <div>
      <div>
        <p>Crear cuenta</p>
        <form onSubmit={onSubmit}>
          <input
            placeholder="Color"
            type="text"
            {...register("color", { required: true })}
          />
          <input
            placeholder="Nombre"
            type="text"
            {...register("courseName", { required: true })}
          />
          <input
            placeholder="Profesor"
            type="text"
            {...register("teacher", { required: true })}
          />
          <input
            placeholder="Creditos"
            type="number"
            {...register("credits", { required: true })}
          />
          <input
            placeholder="Semestre"
            type="list"
            {...register("semesterName", { required: true })}
          />
          <button type="submit">Registrarse</button>
        </form>
      </div>
    </div>
  );
};
export default course;
