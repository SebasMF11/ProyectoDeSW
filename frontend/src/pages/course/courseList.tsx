import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FaRegTrashCan } from "react-icons/fa6";
import { RiEdit2Line } from "react-icons/ri";
import SemesterSelect from "../../components/SemesterSelect";
import { courseBySemesterRequest, courseDeleteRequest } from "../../api/course";
import useSemesters from "../../hooks/useSemesters";

type Course = {
  course_id: number;
  course_name: string;
  teacher: string;
  credits: number;
  color?: string;
};

function CourseList() {
  const navigate = useNavigate();
  const { semesters, loadingSemesters, semesterError, latestSemesterName } =
    useSemesters();
  const [selectedSemester, setSelectedSemester] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadCoursesBySemester = async (semesterName: string) => {
    if (!semesterName) {
      setCourses([]);
      return;
    }

    try {
      setLoadingCourses(true);
      setErrorMessage("");
      const { data } = await courseBySemesterRequest(semesterName);
      setCourses(Array.isArray(data?.courses) ? data.courses : []);
    } catch (error) {
      console.error(error);
      setCourses([]);
      setErrorMessage("No se pudieron cargar los cursos del semestre");
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    if (!latestSemesterName) return;
    setSelectedSemester((currentValue) => currentValue || latestSemesterName);
  }, [latestSemesterName]);

  useEffect(() => {
    loadCoursesBySemester(selectedSemester);
  }, [selectedSemester]);

  const onDeleteCourse = async (courseId: number) => {
    const confirmed = window.confirm(
      "Esta accion eliminara el curso y sus datos relacionados. Deseas continuar?",
    );

    if (!confirmed) return;

    try {
      setErrorMessage("");
      await courseDeleteRequest(courseId);
      await loadCoursesBySemester(selectedSemester);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.error || "No se pudo eliminar el curso",
        );
        return;
      }

      setErrorMessage("No se pudo eliminar el curso");
    }
  };

  const onEditCourse = (course: Course) => {
    navigate("/course", {
      state: {
        course_id: course.course_id,
        course_name: course.course_name,
        teacher: course.teacher,
        credits: course.credits,
        color: course.color,
        semester_name: selectedSemester,
      },
    });
  };

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <header className="flex items-center justify-between gap-3 mb-4">
        <section aria-label="Semester selection" className="space-y-3 w-40">
          {errorMessage || semesterError ? (
            <p>{errorMessage || semesterError}</p>
          ) : null}

          <SemesterSelect
            semesters={semesters}
            value={selectedSemester}
            onValueChange={setSelectedSemester}
          />
        </section>

        <h1 className="title">Courses By Semester</h1>

        <div className="flex gap-2">
          <button
            className="p-2"
            type="button"
            onClick={() => navigate("/course")}
          >
            Add course
          </button>
          <button
            className="p-2"
            type="button"
            onClick={() => navigate("/day")}
          >
            Add days to course
          </button>
        </div>
      </header>

      <section className="mt-6" aria-live="polite">
        {loadingSemesters || loadingCourses ? <p>Cargando cursos...</p> : null}

        {!loadingSemesters &&
        !loadingCourses &&
        selectedSemester &&
        courses.length === 0 ? (
          <p>There are no courses available for the selected semester.</p>
        ) : null}

        {!loadingSemesters && !loadingCourses && courses.length > 0 ? (
          <ul className="flex flex-col gap-4">
            <li>
              <article className=" grid grid-cols-1 gap-3 border-none p-4 font-bold text-gray-700 md:grid-cols-[2fr_1fr_1fr_140px] md:items-center">
                <p>Course</p>
                <p>Teacher</p>
                <p>Credits</p>
                <p>Actions</p>
              </article>
            </li>

            {courses.map((course) => (
              <li key={course.course_id}>
                <article className="grid grid-cols-1 gap-3 rounded-md border p-4 md:grid-cols-[2fr_1fr_1fr_140px] md:items-center">
                  <div>
                    <h2 className="font-semibold">{course.course_name}</h2>
                  </div>

                  <p>{course.teacher || "Not assigned"}</p>

                  <p>{course.credits}</p>

                  <div className="flex gap-2 md:justify-self-end">
                    <button type="button" onClick={() => onEditCourse(course)}>
                      <RiEdit2Line size={20} color="white" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteCourse(course.course_id)}
                    >
                      <FaRegTrashCan size={20} color="white" />
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  );
}

export default CourseList;
