import { useEffect, useState, useMemo } from "react";
import { semesterViewRequest } from "../../api/semester";
import { availableCoursesRequest } from "../../api/catalog";
import { processEnrollmentRequest } from "../../api/enrollment";
import type {
  DaySlotPayload,
  EnrollmentCoursePayload,
} from "../../api/enrollment";
import axios from "axios";
import { useNavigate } from "react-router";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiPlus,
  FiTrash2,
  FiClock,
  FiCalendar,
  FiUser,
  FiLayers,
  FiSend,
} from "react-icons/fi";

interface Semester {
  semester_id: string;
  name: string;
}

interface AvailableCatalogCourse {
  courses_id: string;
  name: string;
  prerequisito: string | null;
  prerequisite_course: {
    courses_id: string;
    name: string;
  } | null;
}

interface DraftCourse extends EnrollmentCoursePayload {
  tempId: string;
}

const colorPalette = [
  { name: "Azul", value: "#3380FF" },
  { name: "Verde", value: "#33FF57" },
  { name: "Rojo", value: "#FF5733" },
  { name: "Naranja", value: "#FFA500" },
  { name: "Morado", value: "#800080" },
  { name: "Amarillo", value: "#FFD700" },
  { name: "Rosa", value: "#FF69B4" },
  { name: "Gris", value: "#808080" },
];

const daysOfWeek = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const MAX_CREDITS = 26;

const Enrollment = () => {
  const navigate = useNavigate();

  // Estados de carga
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [availableCatalog, setAvailableCatalog] = useState<AvailableCatalogCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Lote de materias en preparación (Detalle)
  const [draftCourses, setDraftCourses] = useState<DraftCourse[]>([]);

  // Formulario temporal para añadir una materia al lote
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>("");

  // Estado de envío y mensajes
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Cargar semestres y catálogo disponible
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [semRes, catRes] = await Promise.all([
          semesterViewRequest(),
          availableCoursesRequest(),
        ]);

        const loadedSemesters = Array.isArray(semRes.data) ? semRes.data : [];
        setSemesters(loadedSemesters);
        if (loadedSemesters.length > 0) {
          setSelectedSemesterId(loadedSemesters[0].semester_id);
        }

        setAvailableCatalog(catRes.data?.courses || []);
      } catch (err) {
        console.error("Error al cargar datos de matrícula:", err);
        setMessage({
          type: "error",
          text: "No se pudieron cargar los datos de semestres o catálogo.",
        });
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // Calcular créditos totales del lote
  const totalBatchCredits = useMemo(() => {
    return draftCourses.reduce((acc, c) => acc + (Number(c.credits) || 0), 0);
  }, [draftCourses]);

  const isOverCreditLimit = totalBatchCredits > MAX_CREDITS;

  // Añadir una asignatura al lote
  const handleAddCourseToBatch = () => {
    if (!selectedCatalogId) return;

    const catalogItem = availableCatalog.find(
      (c) => c.courses_id === selectedCatalogId,
    );
    if (!catalogItem) return;

    // Verificar si ya está en el lote
    if (draftCourses.some((c) => c.courses_id === selectedCatalogId)) {
      setMessage({
        type: "error",
        text: `La materia "${catalogItem.name}" ya está incluida en tu lote de matrícula.`,
      });
      return;
    }

    const newDraftCourse: DraftCourse = {
      tempId: Math.random().toString(36).substring(2, 9),
      courses_id: catalogItem.courses_id,
      course_name: catalogItem.name,
      credits: 3,
      teacher: "",
      color: colorPalette[draftCourses.length % colorPalette.length].value,
      days: [
        {
          day_of_week: "Lunes",
          start_time: "08:00",
          end_time: "10:00",
          classroom: "Aula General",
        },
      ],
    };

    setDraftCourses([...draftCourses, newDraftCourse]);
    setSelectedCatalogId("");
    setMessage(null);
  };

  // Quitar asignatura del lote
  const handleRemoveCourseFromBatch = (tempId: string) => {
    setDraftCourses(draftCourses.filter((c) => c.tempId !== tempId));
    setMessage(null);
  };

  // Actualizar campos de una asignatura del lote
  const handleUpdateCourseField = (
    tempId: string,
    field: keyof DraftCourse,
    value: unknown,
  ) => {
    setDraftCourses(
      draftCourses.map((c) => {
        if (c.tempId === tempId) {
          return { ...c, [field]: value };
        }
        return c;
      }),
    );
  };

  // Añadir un nuevo horario a una asignatura
  const handleAddDaySlot = (tempId: string) => {
    setDraftCourses(
      draftCourses.map((c) => {
        if (c.tempId === tempId) {
          const newSlot: DaySlotPayload = {
            day_of_week: "Miércoles",
            start_time: "08:00",
            end_time: "10:00",
            classroom: "Aula General",
          };
          return { ...c, days: [...c.days, newSlot] };
        }
        return c;
      }),
    );
  };

  // Quitar un horario de una asignatura
  const handleRemoveDaySlot = (tempId: string, slotIndex: number) => {
    setDraftCourses(
      draftCourses.map((c) => {
        if (c.tempId === tempId) {
          const updatedDays = c.days.filter((_, idx) => idx !== slotIndex);
          return { ...c, days: updatedDays };
        }
        return c;
      }),
    );
  };

  // Actualizar un horario específico
  const handleUpdateDaySlot = (
    tempId: string,
    slotIndex: number,
    field: keyof DaySlotPayload,
    value: string,
  ) => {
    setDraftCourses(
      draftCourses.map((c) => {
        if (c.tempId === tempId) {
          const updatedDays = c.days.map((slot, idx) => {
            if (idx === slotIndex) {
              return { ...slot, [field]: value };
            }
            return slot;
          });
          return { ...c, days: updatedDays };
        }
        return c;
      }),
    );
  };

  // Procesar la transacción
  const handleProcessEnrollment = async () => {
    if (!selectedSemesterId) {
      setMessage({
        type: "error",
        text: "Debes seleccionar un semestre académico.",
      });
      return;
    }

    if (draftCourses.length === 0) {
      setMessage({
        type: "error",
        text: "Agrega al menos una asignatura para procesar la matrícula.",
      });
      return;
    }

    if (isOverCreditLimit) {
      setMessage({
        type: "error",
        text: `El total de créditos (${totalBatchCredits}) supera el límite institucional de ${MAX_CREDITS} créditos semestrales.`,
      });
      return;
    }

    try {
      setIsProcessing(true);
      setMessage(null);

      const payload = {
        semester_id: selectedSemesterId,
        courses: draftCourses.map(({ tempId: _, ...rest }) => rest),
      };

      const res = await processEnrollmentRequest(payload);

      setMessage({
        type: "success",
        text: `${res.data.message}! Se matricularon ${res.data.enrolledCoursesCount} materias con un total de ${res.data.totalCredits} créditos.`,
      });

      // Limpiar lote
      setDraftCourses([]);

      // Redirigir al inicio después de 2 segundos
      setTimeout(() => {
        navigate("/course-list");
      }, 2000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMsg =
          err.response?.data?.error ||
          "Error al procesar la matrícula transaccional.";
        setMessage({ type: "error", text: errorMsg });
      } else {
        setMessage({
          type: "error",
          text: "Ocurrió un error inesperado al enviar la matrícula.",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        {/* Cabecera Principal */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#009853] flex items-center justify-center text-2xl font-bold">
                <FiLayers />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Matrícula Académica en Bloque
                </h1>
                <p className="text-sm text-gray-500">
                  Pantalla Transaccional Principal • Planifica e inscribe tus materias semestrales en una sola operación
                </p>
              </div>
            </div>

            {/* Medidor Dinámico de Créditos */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 min-w-[280px]">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-gray-600">Carga de Créditos en Lote</span>
                <span
                  className={`font-bold ${
                    isOverCreditLimit
                      ? "text-red-600"
                      : totalBatchCredits > 20
                        ? "text-amber-600"
                        : "text-[#009853]"
                  }`}
                >
                  {totalBatchCredits} / {MAX_CREDITS} Créditos
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isOverCreditLimit
                      ? "bg-red-500"
                      : totalBatchCredits > 20
                        ? "bg-amber-500"
                        : "bg-[#009853]"
                  }`}
                  style={{
                    width: `${Math.min(
                      (totalBatchCredits / MAX_CREDITS) * 100,
                      100,
                    )}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5 text-right">
                Tope máximo permitido: <strong>26 créditos</strong>
              </p>
            </div>
          </div>

          {/* Selector de Semestre (Cabecera de la Transacción) */}
          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FiCalendar className="text-emerald-600" />
              <span>Semestre a Matricular:</span>
            </div>
            <select
              value={selectedSemesterId}
              onChange={(e) => setSelectedSemesterId(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[240px]"
            >
              {semesters.map((s) => (
                <option key={s.semester_id} value={s.semester_id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notificaciones / Alertas */}
        {message && (
          <div
            className={`flex items-center gap-3 p-4 mb-6 rounded-xl border ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {message.type === "success" ? (
              <FiCheckCircle size={20} className="text-emerald-600 shrink-0" />
            ) : (
              <FiAlertCircle size={20} className="text-red-600 shrink-0" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        {/* Sección: Selector de Asignaturas Disponibles */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <FiPlus className="text-[#009853]" />
            <span>Agregar Materias al Lote de Matrícula</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <select
              value={selectedCatalogId}
              onChange={(e) => setSelectedCatalogId(e.target.value)}
              className="flex-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Seleccione una materia disponible del catálogo...</option>
              {availableCatalog
                .filter(
                  (c) => !draftCourses.some((d) => d.courses_id === c.courses_id),
                )
                .map((course) => (
                  <option key={course.courses_id} value={course.courses_id}>
                    {course.name}{" "}
                    {course.prerequisite_course
                      ? `(Prerrequisito: ${course.prerequisite_course.name})`
                      : "(Sin prerrequisito)"}
                  </option>
                ))}
            </select>

            <button
              type="button"
              onClick={handleAddCourseToBatch}
              disabled={!selectedCatalogId}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#009853] hover:bg-emerald-700 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
            >
              <FiPlus size={16} />
              <span>Añadir al Lote</span>
            </button>
          </div>
        </div>

        {/* Sección Detalle: Lote de Materias Seleccionadas */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">
              Detalle del Lote de Asignaturas ({draftCourses.length})
            </h2>
            <span className="text-xs text-gray-500">
              Configura profesor, créditos y horarios de cada asignatura antes de enviar la transacción
            </span>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
              Cargando información...
            </div>
          ) : draftCourses.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
              <FiLayers size={40} className="mx-auto text-gray-300 mb-2" />
              <h3 className="text-sm font-bold text-gray-600">
                Tu lote de matrícula está vacío
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Selecciona asignaturas del catálogo arriba para añadirlas al bloque.
              </p>
            </div>
          ) : (
            draftCourses.map((course, courseIdx) => (
              <div
                key={course.tempId}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-gray-200 transition"
              >
                {/* Cabecera de la materia en el lote */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-[#009853] font-bold text-xs flex items-center justify-center">
                      {courseIdx + 1}
                    </span>
                    <h3 className="text-base font-bold text-gray-800">
                      {course.course_name}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveCourseFromBatch(course.tempId)}
                    className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                  >
                    <FiTrash2 size={14} />
                    <span>Quitar Materia</span>
                  </button>
                </div>

                {/* Parámetros de la Asignatura */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-b border-gray-100">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Créditos de la Materia
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={course.credits}
                      onChange={(e) =>
                        handleUpdateCourseField(
                          course.tempId,
                          "credits",
                          Number(e.target.value) || 1,
                        )
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Profesor Asignado
                    </label>
                    <div className="relative">
                      <FiUser
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={14}
                      />
                      <input
                        type="text"
                        placeholder="Ej: Ing. Carlos Pérez"
                        value={course.teacher || ""}
                        onChange={(e) =>
                          handleUpdateCourseField(
                            course.tempId,
                            "teacher",
                            e.target.value,
                          )
                        }
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Color Identificador
                    </label>
                    <div className="flex items-center gap-2 pt-1">
                      {colorPalette.map((col) => (
                        <button
                          key={col.value}
                          type="button"
                          onClick={() =>
                            handleUpdateCourseField(
                              course.tempId,
                              "color",
                              col.value,
                            )
                          }
                          className={`w-6 h-6 rounded-full border-2 transition ${
                            course.color === col.value
                              ? "border-gray-800 scale-110"
                              : "border-transparent"
                          }`}
                          style={{ backgroundColor: col.value }}
                          title={col.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sub-sección: Franjas Horarias */}
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                      <FiClock size={14} />
                      <span>Horarios y Aulas ({course.days.length})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddDaySlot(course.tempId)}
                      className="text-xs font-semibold text-[#009853] hover:underline flex items-center gap-1"
                    >
                      <FiPlus size={14} />
                      <span>Agregar Día / Hora</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {course.days.map((slot, slotIdx) => (
                      <div
                        key={slotIdx}
                        className="flex flex-wrap items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs"
                      >
                        <div className="w-32">
                          <select
                            value={slot.day_of_week}
                            onChange={(e) =>
                              handleUpdateDaySlot(
                                course.tempId,
                                slotIdx,
                                "day_of_week",
                                e.target.value,
                              )
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white"
                          >
                            {daysOfWeek.map((day) => (
                              <option key={day} value={day}>
                                {day}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span>De:</span>
                          <input
                            type="time"
                            value={slot.start_time}
                            onChange={(e) =>
                              handleUpdateDaySlot(
                                course.tempId,
                                slotIdx,
                                "start_time",
                                e.target.value,
                              )
                            }
                            className="px-2 py-1.5 rounded-lg border border-gray-200 bg-white"
                          />
                          <span>A:</span>
                          <input
                            type="time"
                            value={slot.end_time}
                            onChange={(e) =>
                              handleUpdateDaySlot(
                                course.tempId,
                                slotIdx,
                                "end_time",
                                e.target.value,
                              )
                            }
                            className="px-2 py-1.5 rounded-lg border border-gray-200 bg-white"
                          />
                        </div>

                        <div className="flex-1 min-w-[140px]">
                          <input
                            type="text"
                            placeholder="Aula / Modalidad"
                            value={slot.classroom || ""}
                            onChange={(e) =>
                              handleUpdateDaySlot(
                                course.tempId,
                                slotIdx,
                                "classroom",
                                e.target.value,
                              )
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white"
                          />
                        </div>

                        {course.days.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveDaySlot(course.tempId, slotIdx)
                            }
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-md transition"
                            title="Eliminar franja"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Panel Inferior de Confirmación Transaccional */}
        {draftCourses.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-gray-800">
                Resumen de la Transacción
              </p>
              <p className="text-xs text-gray-500">
                {draftCourses.length} asignaturas seleccionadas • {totalBatchCredits} créditos en total
                {isOverCreditLimit && (
                  <span className="text-red-600 font-bold ml-1">
                    (¡Supera el tope de 26 créditos!)
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setDraftCourses([])}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
              >
                Limpiar Lote
              </button>

              <button
                type="button"
                onClick={handleProcessEnrollment}
                disabled={isProcessing || isOverCreditLimit}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#009853] hover:bg-emerald-700 disabled:opacity-40 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm transition"
              >
                <FiSend size={16} />
                <span>
                  {isProcessing
                    ? "Procesando Matrícula..."
                    : "Confirmar y Procesar Matrícula"}
                </span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Enrollment;
