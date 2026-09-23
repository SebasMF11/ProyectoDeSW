import { useEffect, useState } from "react";
import {
  academicTranscriptRequest,
  type AcademicTranscriptResponse,
} from "../../api/reports";
import {
  FiAward,
  FiBookOpen,
  FiCheckCircle,
  FiTrendingUp,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

const GradeReport = () => {
  const [data, setData] = useState<AcademicTranscriptResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [expandedSemesters, setExpandedSemesters] = useState<Record<string, boolean>>({});

  const loadReport = async (semesterId?: string) => {
    try {
      setLoading(true);
      const res = await academicTranscriptRequest(semesterId || undefined);
      setData(res.data);

      // Expandir todos los semestres por defecto
      if (res.data?.semesters) {
        const initialExpanded: Record<string, boolean> = {};
        res.data.semesters.forEach((s) => {
          initialExpanded[s.semester_id] = true;
        });
        setExpandedSemesters(initialExpanded);
      }
    } catch (err) {
      console.error("Error al cargar el boletín de calificaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(selectedSemester);
  }, [selectedSemester]);

  const toggleSemester = (semesterId: string) => {
    setExpandedSemesters((prev) => ({
      ...prev,
      [semesterId]: !prev[semesterId],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        {/* Cabecera del Reporte 1 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold">
              <FiAward />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Boletín de Calificaciones y Rendimiento Académico
              </h1>
              <p className="text-sm text-gray-500">
                Reporte Oficial 1 • Promedio Ponderado Semestral (PPS), GPA Histórico y Avance de Créditos
              </p>
            </div>
          </div>

          {/* Filtro por Semestre */}
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-400" />
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Histórico Completo</option>
              {data?.semesters.map((s) => (
                <option key={s.semester_id} value={s.semester_id}>
                  {s.semester_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm border border-gray-100">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-3"></div>
            <p>Calculando promedios y consolidando historial académico...</p>
          </div>
        ) : !data || data.semesters.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <FiBookOpen size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-700 mb-1">
              No hay calificaciones registradas
            </h3>
            <p className="text-sm text-gray-500">
              Registra semestres y notas en tus asignaturas para generar tu boletín.
            </p>
          </div>
        ) : (
          <>
            {/* Tarjetas de Métricas Principales (KPIs) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* GPA Acumulado */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    GPA Acumulado
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-gray-800">
                      {data.overallGPA.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-400">/ 5.0</span>
                  </div>
                  <span className="inline-block mt-2 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {data.academicStanding}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                  <FiTrendingUp />
                </div>
              </div>

              {/* Créditos Aprobados */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Créditos Aprobados
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-emerald-600">
                      {data.totalCreditsApproved}
                    </span>
                    <span className="text-xs text-gray-400">
                      / {data.totalCreditsEnrolled} cursados
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{
                        width: `${
                          data.totalCreditsEnrolled > 0
                            ? (data.totalCreditsApproved / data.totalCreditsEnrolled) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
                  <FiCheckCircle />
                </div>
              </div>

              {/* Tasa de Aprobación */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Tasa de Aprobación
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-gray-800">
                      {data.approvalRate}%
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 mt-2 block">
                    {data.totalCoursesApproved} de {data.totalCoursesEvaluated} materias
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
                  <FiAward />
                </div>
              </div>

              {/* Total Semestres */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Períodos Evaluados
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-gray-800">
                      {data.semesters.length}
                    </span>
                    <span className="text-xs text-gray-400">semestres</span>
                  </div>
                  <span className="text-xs text-gray-500 mt-2 block">
                    Historial consolidado
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
                  <FiBookOpen />
                </div>
              </div>
            </div>

            {/* Listado Desglosado por Semestre */}
            <div className="space-y-6">
              {data.semesters.map((sem) => (
                <div
                  key={sem.semester_id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* Encabezado del Semestre */}
                  <div
                    onClick={() => toggleSemester(sem.semester_id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-gray-50/70 border-b border-gray-100 cursor-pointer hover:bg-gray-100/60 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg text-gray-800">
                        {sem.semester_name}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({sem.start_date || "Inicio"} a {sem.end_date || "Fin"})
                      </span>
                    </div>

                    <div className="flex items-center gap-6 mt-3 sm:mt-0">
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block">
                          Promedio Semestral (PPS)
                        </span>
                        <span
                          className={`font-bold text-base ${
                            sem.semesterAverage >= 3.0
                              ? "text-emerald-600"
                              : "text-red-500"
                          }`}
                        >
                          {sem.semesterAverage.toFixed(2)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-gray-400 block">
                          Créditos Aprobados
                        </span>
                        <span className="font-bold text-base text-gray-700">
                          {sem.approvedCredits} / {sem.totalCredits}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {expandedSemesters[sem.semester_id] ? (
                          <FiChevronUp size={20} />
                        ) : (
                          <FiChevronDown size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Tabla de Asignaturas del Semestre */}
                  {expandedSemesters[sem.semester_id] && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/40 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            <th className="py-3 px-6">Asignatura</th>
                            <th className="py-3 px-4">Profesor</th>
                            <th className="py-3 px-4 text-center">Créditos</th>
                            <th className="py-3 px-4">Evaluaciones Registradas</th>
                            <th className="py-3 px-4 text-center">Avance</th>
                            <th className="py-3 px-4 text-center">Nota Final</th>
                            <th className="py-3 px-6 text-center">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                          {sem.courses.map((course) => (
                            <tr
                              key={course.course_id}
                              className="hover:bg-gray-50/50 transition"
                            >
                              <td className="py-4 px-6 font-bold text-gray-800">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{
                                      backgroundColor: course.color || "#3380FF",
                                    }}
                                  />
                                  <span>{course.course_name}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-xs text-gray-500">
                                {course.teacher || "Por asignar"}
                              </td>
                              <td className="py-4 px-4 text-center font-semibold text-gray-700">
                                {course.credits}
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex flex-wrap gap-1">
                                  {course.assessments.length === 0 ? (
                                    <span className="text-xs text-gray-400 italic">
                                      Sin notas
                                    </span>
                                  ) : (
                                    course.assessments.map((a) => (
                                      <span
                                        key={a.grade_id}
                                        className="inline-flex items-center gap-1 text-[11px] bg-gray-100 px-2 py-0.5 rounded-md font-medium text-gray-600"
                                        title={`${a.name}: ${a.value} (${a.percentage}%)`}
                                      >
                                        <span>{a.name}:</span>
                                        <strong className={a.value >= 3.0 ? "text-emerald-600" : "text-red-500"}>
                                          {a.value}
                                        </strong>
                                      </span>
                                    ))
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-center text-xs text-gray-500 font-medium">
                                {course.evaluatedPercentage}%
                              </td>
                              <td className="py-4 px-4 text-center font-extrabold text-base">
                                <span
                                  className={
                                    course.finalGrade >= 3.0
                                      ? "text-emerald-600"
                                      : "text-red-500"
                                  }
                                >
                                  {course.finalGrade.toFixed(2)}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span
                                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                                    course.finalGrade >= 3.0
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : course.evaluatedPercentage >= 100
                                        ? "bg-red-50 text-red-700 border border-red-200"
                                        : "bg-blue-50 text-blue-700 border border-blue-200"
                                  }`}
                                >
                                  {course.finalGrade >= 3.0
                                    ? "Aprobada"
                                    : course.evaluatedPercentage >= 100
                                      ? "Reprobada"
                                      : "En Curso"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default GradeReport;
