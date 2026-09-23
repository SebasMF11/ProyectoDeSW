import { useEffect, useState, useMemo } from "react";
import {
  scheduleAgendaRequest,
  type ScheduleAgendaResponse,
} from "../../api/reports";
import { semesterViewRequest } from "../../api/semester";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiUser,
  FiAlertCircle,
  FiCheckCircle,
  FiFilter,
  FiBookOpen,
} from "react-icons/fi";

const daysOrder = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const ScheduleReport = () => {
  const [data, setData] = useState<ScheduleAgendaResponse | null>(null);
  const [semesters, setSemesters] = useState<Array<{ semester_id: string; name: string }>>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"schedule" | "agenda">("schedule");

  useEffect(() => {
    const loadSemestersList = async () => {
      try {
        const res = await semesterViewRequest();
        setSemesters(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error al cargar semestres:", err);
      }
    };
    loadSemestersList();
  }, []);

  const loadScheduleData = async (semesterId?: string) => {
    try {
      setLoading(true);
      const res = await scheduleAgendaRequest(semesterId || undefined);
      setData(res.data);
    } catch (err) {
      console.error("Error al cargar el horario y cronograma:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScheduleData(selectedSemester);
  }, [selectedSemester]);

  // Agrupar clases por día de la semana
  const slotsByDay = useMemo(() => {
    const map: Record<string, ScheduleAgendaResponse["scheduleSlots"]> = {
      Lunes: [],
      Martes: [],
      Miércoles: [],
      Jueves: [],
      Viernes: [],
      Sábado: [],
    };

    (data?.scheduleSlots || []).forEach((slot) => {
      // Normalizar nombres de días
      const normalizedDay = daysOrder.find(
        (d) => d.toLowerCase() === slot.day_of_week?.toLowerCase(),
      );
      if (normalizedDay && map[normalizedDay]) {
        map[normalizedDay].push(slot);
      }
    });

    // Ordenar por hora de inicio
    Object.keys(map).forEach((day) => {
      map[day].sort((a, b) => a.start_time.localeCompare(b.start_time));
    });

    return map;
  }, [data?.scheduleSlots]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        {/* Cabecera del Reporte 2 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-2xl font-bold">
              <FiCalendar />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Horario Semanal y Cronograma de Evaluaciones
              </h1>
              <p className="text-sm text-gray-500">
                Reporte Oficial 2 • Matriz horaria semanal por asignatura y agenda de próximas entregas
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filtro de Semestre */}
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-400" />
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Semestre Actual</option>
                {semesters.map((s) => (
                  <option key={s.semester_id} value={s.semester_id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Pestañas */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab("schedule")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === "schedule"
                    ? "bg-white text-purple-700 shadow-xs"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Horario Semanal
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("agenda")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  activeTab === "agenda"
                    ? "bg-white text-purple-700 shadow-xs"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <span>Agenda de Entregas</span>
                {data?.upcomingAssessments && data.upcomingAssessments.length > 0 && (
                  <span className="bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded-full text-[10px]">
                    {data.upcomingAssessments.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm border border-gray-100">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mb-3"></div>
            <p>Generando cuadrícula horaria y agenda cronológica...</p>
          </div>
        ) : !data || (data.scheduleSlots.length === 0 && data.upcomingAssessments.length === 0) ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <FiCalendar size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-700 mb-1">
              No hay horarios ni evaluaciones asignadas
            </h3>
            <p className="text-sm text-gray-500">
              Inscribe materias en la pantalla de matrícula para visualizar tu cuadrícula semanal.
            </p>
          </div>
        ) : activeTab === "schedule" ? (
          /* ================= PESTAÑA: HORARIO SEMANAL ================= */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {daysOrder.map((day) => {
                const slots = slotsByDay[day] || [];
                return (
                  <div
                    key={day}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
                  >
                    {/* Encabezado del Día */}
                    <div className="p-4 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between">
                      <span className="font-bold text-gray-800 text-sm">
                        {day}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-200/60 text-gray-600">
                        {slots.length} {slots.length === 1 ? "clase" : "clases"}
                      </span>
                    </div>

                    {/* Clases del día */}
                    <div className="p-4 space-y-3 flex-1">
                      {slots.length === 0 ? (
                        <div className="py-8 text-center text-gray-300 text-xs italic">
                          Sin clases programadas
                        </div>
                      ) : (
                        slots.map((slot) => (
                          <div
                            key={slot.day_id}
                            className="p-3.5 rounded-xl border border-gray-100 hover:shadow-xs transition relative overflow-hidden"
                            style={{
                              borderLeftWidth: "4px",
                              borderLeftColor: slot.color || "#3380FF",
                            }}
                          >
                            <h4 className="font-bold text-gray-800 text-sm mb-1.5">
                              {slot.course_name}
                            </h4>

                            <div className="space-y-1 text-xs text-gray-500">
                              <div className="flex items-center gap-1.5">
                                <FiClock size={13} className="text-gray-400" />
                                <span className="font-semibold text-gray-700">
                                  {slot.start_time} - {slot.end_time}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <FiMapPin size={13} className="text-gray-400" />
                                <span>{slot.classroom || "Aula General"}</span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <FiUser size={13} className="text-gray-400" />
                                <span>{slot.teacher || "Por asignar"}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ================= PESTAÑA: AGENDA DE EVALUACIONES ================= */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-800 text-base">
                  Línea de Tiempo de Próximas Evaluaciones
                </h3>
                <p className="text-xs text-gray-400">
                  Ordenadas cronológicamente para priorizar tu tiempo de estudio
                </p>
              </div>
            </div>

            {data.upcomingAssessments.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <FiBookOpen size={40} className="mx-auto text-gray-300 mb-2" />
                <p>No tienes evaluaciones pendientes registradas.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {data.upcomingAssessments.map((item) => {
                  let urgencyBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                      <FiClock size={12} />
                      <span>{item.daysRemaining} días restantes</span>
                    </span>
                  );

                  if (item.urgency === "urgente") {
                    urgencyBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                        <FiAlertCircle size={12} />
                        <span>¡Urgente! {item.daysRemaining} {item.daysRemaining === 1 ? "día" : "días"}</span>
                      </span>
                    );
                  } else if (item.urgency === "proximo") {
                    urgencyBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <FiClock size={12} />
                        <span>Próximo ({item.daysRemaining} días)</span>
                      </span>
                    );
                  } else if (item.urgency === "finalizado") {
                    urgencyBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-400">
                        <FiCheckCircle size={12} />
                        <span>Concluida</span>
                      </span>
                    );
                  }

                  return (
                    <div
                      key={item.assessment_id}
                      className="p-5 hover:bg-gray-50/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className="w-3 h-12 rounded-full shrink-0 mt-0.5"
                          style={{ backgroundColor: item.color || "#800080" }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-800 text-base">
                              {item.name}
                            </h4>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                              {item.percentage}% del curso
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">
                            Asignatura: <strong className="text-gray-700">{item.course_name}</strong> • Tipo: {item.type}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:text-right">
                        <div>
                          <span className="text-xs text-gray-400 block">
                            Fecha Límite
                          </span>
                          <span className="text-sm font-bold text-gray-700">
                            {item.due_date || "Sin fecha"}
                          </span>
                        </div>
                        <div>{urgencyBadge}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ScheduleReport;
