import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { courseCreateRequest } from "../../api/course";
import Navbar from "../../components/navbar";

const course = () => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const onSubmit = handleSubmit(async (values) => {
    const res = await courseCreateRequest(values);
    console.log(res);
    navigate("/day");
  });
  return (
    <div>
      <Navbar />
      <div className="z-10 max-w-xl p-6 mx-auto">
        <div className="flex flex-col items-center gap-4">
          <form
            onSubmit={onSubmit}
            className="w-full flex flex-col gap-3 pt-20"
          >
            <div className="w-full flex flex-row items-center justify-between gap-4">
              <select
                className="inputClase"
                {...register("color", { required: true })}
              >
                <option value="">Color</option>
                <option value="Red">Red</option>
                <option value="Blue">Blue</option>
                <option value="Green">Green</option>
                <option value="Yellow">Yellow</option>
                <option value="Purple">Purple</option>
                <option value="Pink">Pink</option>
                <option value="Black">Black</option>
                <option value="White">White</option>
                <option value="Gray">Gray</option>
              </select>
              <p className="title">Asignatura</p>
            </div>

            <input
              placeholder="Name of the course"
              type="text"
              className="inputClase"
              {...register("courseName", { required: true })}
            />
            <input
              placeholder="Teacher"
              type="text"
              className="inputClase"
              {...register("teacher", { required: true })}
            />
            <input
              placeholder="Credits"
              type="number"
              className="inputClase"
              {...register("credits", { required: true })}
            />
            <input
              placeholder="Semester"
              type="list"
              className="inputClase"
              {...register("semesterName", { required: true })}
            />
            <div className="w-full flex flex-row justify-center gap-4">
              <button type="submit">Cancel</button>
              <button type="submit">Continue</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default course;
