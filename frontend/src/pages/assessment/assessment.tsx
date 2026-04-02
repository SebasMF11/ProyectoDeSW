import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { assessmentCreateRequest } from "../../api/assessment.api";
import Navbar from "../../components/navbar";

const assessment = () => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const onSubmit = handleSubmit(async (values) => {
    const res = await assessmentCreateRequest(values);
    console.log(res);
    navigate("/home");
  });
  return (
    <div>
      <Navbar />
      <div className="z-10 max-w-xl p-10 mx-auto">
        <form onSubmit={onSubmit} className="flex flex-col items-center gap-4">
          <p className="title">Assessment</p>
          <select
            className="inputClase"
            {...register("dayOfWeek", { required: true })}
          >
            <option value="">Choose a course</option>
            {/* ACA FALTA PONER EL COSO PA QUE SALGAN LAS ASIGNATURAS */}
            <option value="1">Math</option>
          </select>
          <input
            placeholder="Name of the assessment"
            type="text"
            className="inputClase"
            {...register("assessmentName", { required: true })}
          />
          <div className="flex flex-row gap-2 w-full">
            <input
              placeholder="Month"
              type="text"
              className="inputClase"
              {...register("month", { required: true })}
            />
            <input
              placeholder="Day"
              type="text"
              className="inputClase"
              {...register("day", { required: true })}
            />
          </div>
          <input
            placeholder="Type of assessment"
            type="text"
            className="inputClase"
            {...register("courseName", { required: true })}
          />
          <div className="flex flex-row items-center gap-2">
            <input
              placeholder="--"
              type="text"
              className="inputClase w-[50%]"
              {...register("percentage", { required: true })}
            />
            <p className="text-[25px] text-[#3d483f]">%</p>
          </div>
          <div className="flex flex-row gap-4">
            <button type="submit">Cancel</button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default assessment;
