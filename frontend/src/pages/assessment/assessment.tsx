import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { assessmentCreateRequest } from "../../api/assessment.api";
import { courseGetAllRequest } from "../../api/course";
import Navbar from "../../components/navbar";

type Course = {
  course_id: number;
  course_name: string;
};

const assessment = () => {
  const navigate = useNavigate();
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
            {...register("courseName", { required: true })}
            disabled={coursesLoading}
          >
            <option value="">
              {coursesLoading ? "Cargando cursos..." : "Choose a course"}
            </option>
            {courses.map((course) => (
              <option key={course.course_id} value={course.course_name}>
                {course.course_name}
              </option>
            ))}
          </select>
          {coursesError && (
            <p className="text-red-600 text-sm">{coursesError}</p>
          )}
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
          <select
            className="inputClase"
            {...register("type", { required: true })}
          >
            <option value="">Choose a type of assessment</option>
            <option value="midterm">Midterm</option>
            <option value="quiz">Quiz</option>
            <option value="workshop">Workshop</option>
            <option value="project">Project</option>
            <option value="presentation">Presentation</option>
            <option value="lab">Lab</option>
          </select>
          <div className="flex flex-row items-center gap-2">
            <input
              placeholder="--"
              type="number"
              className="inputClase w-[50%]"
              {...register("percentage", { required: true })}
            />
            <p className="text-[25px] text-[#3d483f]">%</p>
          </div>
          <div className="flex flex-row gap-4">
            <button>Cancel</button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default assessment;
