import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { dayCreateRequest } from "../../api/day.api";
import { courseGetAllRequest } from "../../api/course";
import Navbar from "../../components/navbar";

type Course = {
  course_id: number;
  course_name: string;
};

const day = () => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const onSubmit = handleSubmit(async (values) => {
    const res = await dayCreateRequest(values);
    console.log(res);
    navigate("/home");
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCourses = async () => {
      try {
        setCoursesLoading(true);
        setCoursesError("");
        const res = await courseGetAllRequest();
        const fetchedCourses = res.data?.courses ?? [];

        if (isMounted) {
          setCourses(fetchedCourses);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setCoursesError("No se pudieron cargar los cursos");
        }
      } finally {
        if (isMounted) {
          setCoursesLoading(false);
        }
      }
    };

    loadCourses();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <Navbar />
      <div className="z-10 max-w-xl p-6 mx-auto ">
        <form onSubmit={onSubmit} className="flex flex-col items-center gap-4">
          <p className="title">Day</p>

          <select
            className="inputClase"
            {...register("courseId", { required: true })}
            disabled={coursesLoading}
          >
            <option value="">
              {coursesLoading ? "Cargando cursos..." : "Choose a course"}
            </option>
            {courses.map((course) => (
              <option key={course.course_id} value={course.course_id}>
                {course.course_name}
              </option>
            ))}
          </select>

          {coursesError && (
            <p className="text-red-600 text-sm">{coursesError}</p>
          )}
          <select
            className="inputClase"
            {...register("dayOfWeek", { required: true })}
          >
            <option value="">Choose a day of the week</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Sunday">Sunday</option>
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
