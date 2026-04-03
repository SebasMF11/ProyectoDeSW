import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { gradeCreateRequest } from "../../api/grade";
import { courseBySemesterRequest } from "../../api/course";
import { assessmentBySemesterRequest } from "../../api/assessment.api";
import useSemesters from "../../hooks/useSemesters";
import SemesterSelect from "../../components/SemesterSelect";
import CourseSelect from "../../components/CourseSelect";
import AssessmentSelect from "../../components/AssessmentSelect";

type Course = {
  course_name: string;
};

type Assessment = {
  assessment_name: string;
  course: {
    course_name: string;
  };
};

const grade = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const { semesters, semesterError, latestSemesterName } = useSemesters();
  const [courses, setCourses] = useState<Course[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const { register, handleSubmit, watch, setValue } = useForm();
  const semesterRegister = register("semesterName", { required: true });
  const selectedSemesterName = watch("semesterName");
  const selectedCourseName = watch("courseName");

  const selectedSemester = useMemo(
    () =>
      semesters.find(
        (semester) => semester.semester_name === selectedSemesterName,
      ),
    [semesters, selectedSemesterName],
  );

  const filteredAssessments = useMemo(
    () =>
      assessments.filter(
        (assessment) => assessment.course?.course_name === selectedCourseName,
      ),
    [assessments, selectedCourseName],
  );

  useEffect(() => {
    if (!latestSemesterName || selectedSemesterName) return;
    setValue("semesterName", latestSemesterName);
  }, [latestSemesterName, selectedSemesterName, setValue]);

  useEffect(() => {
    const loadCourses = async () => {
      if (!selectedSemesterName) {
        setCourses([]);
        setValue("courseName", "");
        setValue("assessmentName", "");
        return;
      }

      try {
        const { data } = await courseBySemesterRequest(selectedSemesterName);
        const semesterCourses = Array.isArray(data?.courses)
          ? data.courses
          : [];
        setCourses(semesterCourses);
      } catch (error) {
        console.error(error);
        setCourses([]);
      }

      setValue("courseName", "");
      setValue("assessmentName", "");
    };

    loadCourses();
  }, [selectedSemesterName, setValue]);

  useEffect(() => {
    const loadAssessments = async () => {
      if (!selectedSemester?.semester_id) {
        setAssessments([]);
        setValue("assessmentName", "");
        return;
      }

      try {
        const { data } = await assessmentBySemesterRequest(
          selectedSemester.semester_id,
        );
        const semesterAssessments = Array.isArray(data?.assessments)
          ? data.assessments
          : [];
        setAssessments(semesterAssessments);
      } catch (error) {
        console.error(error);
        setAssessments([]);
      }

      setValue("assessmentName", "");
    };

    loadAssessments();
  }, [selectedSemester, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      setErrorMessage("");
      const res = await gradeCreateRequest(values);
      console.log(res);
      navigate("/home");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiMessage = error.response?.data?.error;
        setErrorMessage(apiMessage || "No se pudo crear la nota");
        return;
      }

      setErrorMessage("Ocurrio un error inesperado");
    }
  });

  return (
    <div>
      <div>
        <p>Crear cuenta</p>
        {errorMessage || semesterError ? (
          <p>{errorMessage || semesterError}</p>
        ) : null}
        <form onSubmit={onSubmit}>
          <SemesterSelect
            semesters={semesters}
            placeholderOptionText="Selecciona un semestre"
            emptyOptionText={"No hay semestres registrados"}
            selectProps={{
              defaultValue: "",
              ...semesterRegister,
            }}
          />
          <CourseSelect
            courses={courses}
            placeholderOptionText={
              selectedSemesterName
                ? "Selecciona un curso"
                : "Primero selecciona un semestre"
            }
            emptyOptionText={
              selectedSemesterName
                ? "No hay cursos en este semestre"
                : "Primero selecciona un semestre"
            }
            selectProps={{
              defaultValue: "",
              ...register("courseName", { required: true }),
            }}
          />
          <AssessmentSelect
            assessments={filteredAssessments}
            placeholderOptionText={
              selectedCourseName
                ? "Selecciona una actividad"
                : "Primero selecciona un curso"
            }
            emptyOptionText={
              selectedCourseName
                ? "No hay actividades para este curso"
                : "Primero selecciona un curso"
            }
            selectProps={{
              defaultValue: "",
              ...register("assessmentName", { required: true }),
            }}
          />
          <input
            placeholder="Nota"
            type="number"
            {...register("value", { required: true, valueAsNumber: true })}
          />
          <button type="submit">Registrarse</button>
        </form>
      </div>
    </div>
  );
};
export default grade;
