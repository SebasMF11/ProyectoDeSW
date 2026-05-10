import { useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { gradeCreateRequest } from "../../api/grade";
import { courseBySemesterRequest } from "../../api/course";
import { assessmentBySemesterRequest } from "../../api/assessment.api";
import useSemesters from "../../hooks/useSemesters";
import SemesterSelect from "../../components/SemesterSelect";
import CourseSelect, { type Course } from "../../components/CourseSelect";
import AssessmentSelect, {
  type Assessment,
} from "../../components/AssessmentSelect";

const grade = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const { semesters, semesterError, latestSemesterName } = useSemesters();
  const [courses, setCourses] = useState<Course[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const { register, handleSubmit, watch, setValue, control } = useForm();
  const semesterRegister = register("semesterName", { required: true });
  const selectedSemesterName = watch("semesterName");
  const selectedCourseName = watch("courseName");

  const selectedSemester = useMemo(
    () => semesters.find((semester) => semester.name === selectedSemesterName),
    [semesters, selectedSemesterName],
  );

  // Filtrar assessments por el curso seleccionado
  const filteredAssessments = useMemo(
    () =>
      assessments.filter(
        (assessment) =>
          assessment.course?.courses?.name === selectedCourseName,
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
        setCourses(Array.isArray(data?.courses) ? data.courses : []);
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
        setAssessments(
          Array.isArray(data?.assessments) ? data.assessments : [],
        );
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
      navigate("/grade-list");
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
      <div className="formContainer">
        <p className="title">Registrar nota</p>
        {errorMessage || semesterError ? (
          <p>{errorMessage || semesterError}</p>
        ) : null}
        <form onSubmit={onSubmit} className="formLayout">
          <SemesterSelect
            semesters={semesters}
            placeholderOptionText="Selecciona un semestre"
            emptyOptionText="No hay semestres registrados"
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

          <Controller
            name="value"
            control={control}
            rules={{ required: true, min: 0, max: 5 }}
            render={({ field: { onChange, onBlur, ref, value } }) => (
              <input
                className="formControl"
                placeholder="Nota (0.0 - 5.0)"
                type="number"
                step="0.1"
                min={0}
                max={5}
                value={value ?? ""}
                onChange={(e) => {
                  const parsed = parseFloat(e.target.value);
                  onChange(isNaN(parsed) ? "" : parsed);
                }}
                onBlur={onBlur}
                ref={ref}
              />
            )}
          />

          <button type="submit">Registrar</button>
        </form>
      </div>
    </div>
  );
};

export default grade;
