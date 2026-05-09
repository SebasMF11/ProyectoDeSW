import { useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import axios from "axios";
import { courseCreateRequest, courseUpdateRequest } from "../../api/course";
import { semesterViewRequest } from "../../api/semester";
import { coursesCatalogRequest } from "../../api/catalog";

type Semester = {
  semester_id: string;
  name: string;
};

type CatalogCourse = {
  courses_id: string;
  name: string;
  faculty: { name: string };
  prerequisite: string | null;
  prerequisite_course: { courses_id: string; name: string } | null;
};

type EditCourseState = {
  course_id: string;
  courses_id: string;
  course_name: string;
  teacher: string;
  credits: number;
  color?: string;
  semester_name: string;
};

type FormValues = {
  color: string;
  courses_id: string;
  teacher: string;
  credits: number;
  semesterName: string;
};

const colorOptions = [
  "red",
  "blue",
  "green",
  "yellow",
  "orange",
  "purple",
  "pink",
  "black",
  "white",
  "gray",
];

const colorHexToName: Record<string, string> = {
  "#FF5733": "red",
  "#3380FF": "blue",
  "#33FF57": "green",
  "#FFD700": "yellow",
  "#FFA500": "orange",
  "#800080": "purple",
  "#FF69B4": "pink",
  "#000000": "black",
  "#FFFFFF": "white",
  "#808080": "gray",
};

const course = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState("");
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [catalogCourses, setCatalogCourses] = useState<CatalogCourse[]>([]);
  const [selectedCatalogCourse, setSelectedCatalogCourse] =
    useState<CatalogCourse | null>(null);
  const { register, handleSubmit, setValue, watch } = useForm<FormValues>();

  const editCourse = location.state as EditCourseState | undefined;
  const isEditMode = Boolean(editCourse?.course_id);

  const watchedCoursesId = watch("courses_id");

  // Actualizar el curso seleccionado del catálogo cuando cambia el select
  useEffect(() => {
    if (!watchedCoursesId) {
      setSelectedCatalogCourse(null);
      return;
    }
    const found = catalogCourses.find((c) => c.courses_id === watchedCoursesId);
    setSelectedCatalogCourse(found ?? null);
  }, [watchedCoursesId, catalogCourses]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [semestersRes, catalogRes] = await Promise.all([
          semesterViewRequest(),
          coursesCatalogRequest(),
        ]);
        setSemesters(Array.isArray(semestersRes.data) ? semestersRes.data : []);
        setCatalogCourses(
          Array.isArray(catalogRes.data?.courses)
            ? catalogRes.data.courses
            : [],
        );
      } catch (error) {
        console.error(error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isEditMode || !editCourse) return;
    setValue("courses_id", editCourse.courses_id || "");
    setValue("teacher", editCourse.teacher || "");
    setValue("credits", editCourse.credits);
    setValue("semesterName", editCourse.semester_name || "");
    setValue("color", colorHexToName[editCourse.color || ""] || "");
  }, [editCourse, isEditMode, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      setErrorMessage("");
      const payload = { ...values, credits: Number(values.credits) };
      const res = isEditMode
        ? await courseUpdateRequest(editCourse!.course_id, payload)
        : await courseCreateRequest(payload);
      console.log(res);
      navigate("/course-list");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.error;
        setErrorMessage(
          apiMessage ||
            (isEditMode
              ? "Could not update the course"
              : "Could not create the course"),
        );
        return;
      }
      setErrorMessage("An unexpected error occurred");
    }
  });

  return (
    <div>
      <div className="formContainer">
        <form onSubmit={onSubmit} className="formLayout">
          <p className="title">
            {isEditMode ? "Edit course" : "Create course"}
          </p>
          {errorMessage ? <p>{errorMessage}</p> : null}

          {/* Color */}
          <label className="formText" htmlFor="color-select">
            Color
          </label>
          <select
            id="color-select"
            className="formControl"
            defaultValue=""
            {...register("color", { required: true })}
          >
            <option value="" disabled>
              Select a color
            </option>
            {colorOptions.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>

          {/* Materia del catálogo */}
          <label className="formText" htmlFor="courses-select">
            Materia
          </label>
          <select
            id="courses-select"
            className="formControl"
            defaultValue=""
            disabled={isEditMode}
            {...register("courses_id", { required: true })}
          >
            <option value="" disabled>
              {catalogCourses.length > 0
                ? "Select a course"
                : "No courses available"}
            </option>
            {catalogCourses.map((c) => (
              <option key={c.courses_id} value={c.courses_id}>
                {c.name}{c.faculty ? ` — ${c.faculty.name}` : ''}
              </option>
            ))}
          </select>

          {/* Prerequisito (informativo, solo lectura) */}
          {selectedCatalogCourse && (
            <div className="formControl bg-gray-50 text-sm text-gray-600 flex items-center gap-2">
              <span className="font-medium">Prerequisito:</span>
              {selectedCatalogCourse.prerequisite_course ? (
                <span>{selectedCatalogCourse.prerequisite_course.name}</span>
              ) : (
                <span className="italic text-gray-400">Ninguno</span>
              )}
            </div>
          )}

          <input
            className="formControl"
            placeholder="Teacher"
            type="text"
            {...register("teacher")}
          />
          <input
            className="formControl"
            placeholder="Credits"
            type="number"
            {...register("credits", { required: true })}
          />

          {/* Semestre */}
          <label className="formText" htmlFor="semester-select">
            Semestre
          </label>
          <select
            id="semester-select"
            className="formControl"
            defaultValue=""
            disabled={isEditMode}
            {...register("semesterName", { required: true })}
          >
            <option value="" disabled>
              {semesters.length > 0
                ? "Select a semester"
                : "No semesters available"}
            </option>
            {semesters.map((semester) => (
              <option key={semester.semester_id} value={semester.name}>
                {semester.name}
              </option>
            ))}
          </select>

          <button type="submit">
            {isEditMode ? "Save changes" : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default course;
