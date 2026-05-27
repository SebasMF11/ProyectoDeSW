import { useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import axios from "axios";
import { courseCreateRequest, courseUpdateRequest } from "../../api/course";
import { semesterViewRequest } from "../../api/semester";
import { facultiesRequest, availableCoursesRequest } from "../../api/catalog";

type Semester = {
  semester_id: string;
  name: string;
};

type Faculty = {
  faculty_id: string;
  name: string;
};

type CatalogCourse = {
  courses_id: string;
  name: string;
  faculty: { faculty_id: string; name: string };
  prerequisito: string | null;
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
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [catalogCourses, setCatalogCourses] = useState<CatalogCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
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

  // Cargar semestres y facultades al montar
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [semestersRes, facultiesRes] = await Promise.all([
          semesterViewRequest(),
          facultiesRequest(),
        ]);
        setSemesters(Array.isArray(semestersRes.data) ? semestersRes.data : []);
        setFaculties(
          Array.isArray(facultiesRes.data?.faculties)
            ? facultiesRes.data.faculties
            : [],
        );
      } catch (error) {
        console.error(error);
      }
    };
    loadInitialData();
  }, []);

  // Cargar materias disponibles cuando cambia la facultad seleccionada
  // Si no hay facultades disponibles, carga todas las materias de la carrera sin filtro de facultad
  useEffect(() => {
    if (isEditMode) return;

    // Si hay facultades pero ninguna seleccionada aún, esperar selección
    if (faculties.length > 0 && !selectedFacultyId) {
      setCatalogCourses([]);
      setValue("courses_id", "");
      return;
    }

    // Si no hay facultades O ya hay una seleccionada, cargar materias
    const loadCourses = async () => {
      try {
        setLoadingCourses(true);
        setErrorMessage("");
        // Pasar facultyId solo si hay facultades y una está seleccionada
        const facultyParam =
          faculties.length > 0 && selectedFacultyId
            ? selectedFacultyId
            : undefined;
        const res = await availableCoursesRequest(facultyParam);
        setCatalogCourses(
          Array.isArray(res.data?.courses) ? res.data.courses : [],
        );
        setValue("courses_id", "");
      } catch (error) {
        console.error(error);
        setCatalogCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };

    loadCourses();
  }, [selectedFacultyId, faculties, isEditMode, setValue]);

  // Pre-llenar formulario en modo edición
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

      const payload: {
        color: string;
        courses_id: string;
        teacher: string;
        credits: number;
        semesterName: string;
      } = { ...values, credits: Number(values.credits) };
      if (isEditMode) {
        await courseUpdateRequest(editCourse!.course_id, payload);
      } else {
        await courseCreateRequest(payload);
      }

      navigate(isEditMode ? "/course-list" : "/day");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.error;
        setErrorMessage(
          apiMessage ||
            (isEditMode
              ? "The course could not be updated"
              : "The course could not be created"),
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
          <p className="title">{isEditMode ? "Edit course" : "Add course"}</p>

          {errorMessage ? (
            <p className="text-red-600 text-sm">{errorMessage}</p>
          ) : null}

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

          {/* Facultad — solo en modo creación */}
          {!isEditMode && (
            <>
              <label className="formText" htmlFor="faculty-select">
                Faculty
              </label>
              <select
                id="faculty-select"
                className="formControl"
                value={selectedFacultyId}
                onChange={(e) => setSelectedFacultyId(e.target.value)}
              >
                <option value="" disabled>
                  {faculties.length > 0
                    ? "Select a faculty"
                    : "No faculties available"}
                </option>
                {faculties.map((f) => (
                  <option key={f.faculty_id} value={f.faculty_id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* Materia del catálogo */}
          <label className="formText" htmlFor="courses-select">
            Course
          </label>
          <select
            id="courses-select"
            className="formControl"
            defaultValue=""
            disabled={
              isEditMode || (faculties.length > 0 && !selectedFacultyId)
            }
            {...register("courses_id", { required: !isEditMode })}
          >
            {isEditMode ? (
              <option value={editCourse?.courses_id || ""} disabled>
                {editCourse?.course_name || "Unknown course"}
              </option>
            ) : (
              <option value="" disabled>
                {faculties.length > 0 && !selectedFacultyId
                  ? "Select a faculty first"
                  : loadingCourses
                    ? "Loading courses..."
                    : catalogCourses.length > 0
                      ? "Select a course"
                      : "No courses available"}
              </option>
            )}
            {catalogCourses.map((c) => (
              <option key={c.courses_id} value={c.courses_id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Prerequisito — informativo */}
          {!isEditMode && selectedCatalogCourse && (
            <div className="formControl bg-gray-50 text-sm flex items-center gap-2">
              <span className="font-medium">Prerequisite:</span>
              {selectedCatalogCourse.prerequisite_course ? (
                <span className="text-gray-700">
                  {selectedCatalogCourse.prerequisite_course.name}
                </span>
              ) : (
                <span className="italic text-gray-400">None</span>
              )}
            </div>
          )}

          <input
            className="formControl"
            placeholder="Professor"
            type="text"
            {...register("teacher")}
          />
          <input
            className="formControl"
            placeholder="Credits"
            type="number"
            {...register("credits", { required: true, valueAsNumber: true })}
          />

          {/* Semestre */}
          <label className="formText" htmlFor="semester-select">
            Semester
          </label>
          <select
            id="semester-select"
            className="formControl"
            defaultValue=""
            disabled={isEditMode}
            {...register("semesterName", { required: !isEditMode })}
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
            {isEditMode ? "Guardar cambios" : "Crear"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default course;
