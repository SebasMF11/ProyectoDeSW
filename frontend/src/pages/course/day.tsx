import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { dayCreateRequest } from "../../api/day.api";
import Navbar from "../../components/navbar";

const day = () => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const onSubmit = handleSubmit(async (values) => {
    const res = await dayCreateRequest(values);
    console.log(res);
    navigate("/home");
  });
  return (
    <div>
      <Navbar />
      <div className="z-10 max-w-xl p-6 mx-auto ">
        <form onSubmit={onSubmit} className="flex flex-col items-center gap-4">
          <p className="title">Day</p>
          <select
            className="inputClase"
            {...register("dayOfWeek", { required: true })}
          >
            <option value="">Choose a course</option>
            {/* ACA FALTA PONER EL COSO PA QUE SALGAN LAS ASIGNATURAS */}
            <option value="1">Math</option>
          </select>
          <select
            className="inputClase"
            {...register("dayOfWeek", { required: true })}
          >
            <option value="">Choose a day of the week</option>
            <option value="1">Monday</option>
            <option value="2">Tuesday</option>
            <option value="3">Wednesday</option>
            <option value="4">Thursday</option>
            <option value="5">Friday</option>
            <option value="6">Saturday</option>
            <option value="6">Sunday</option>
          </select>
          <input
            placeholder="Classroom"
            type="text"
            className="inputClase"
            {...register("classroom", { required: true })}
          />
          <input
            placeholder="Start Time"
            type="text"
            className="inputClase"
            {...register("startTime", { required: true })}
          />
          <input
            placeholder="End Time"
            type="text"
            className="inputClase"
            {...register("endTime", { required: true })}
          />
          <div className="w-[50%] flex flex-col gap-4">
            <button type="button" className="w-full">
              Add Another Day
            </button>
            <button type="submit" className="w-full">
              Course Schedule Setup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default day;
