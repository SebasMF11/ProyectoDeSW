import { useEffect, useState, useMemo } from "react";
import {
  coursesCatalogRequest,
  facultiesRequest,
  careersRequest,
  coursesCatalogByCareerRequest,
  createCatalogCourseRequest,
  updateCatalogCourseRequest,
  deleteCatalogCourseRequest,
} from "../../api/catalog";
import { supabase } from "../../integrations/supabase";
import axios from "axios";
import {
  FiBookOpen,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiFilter,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
} from "react-icons/fi";

interface Faculty {
  faculty_id: string;
  name: string;
}

interface Career {
  career_id: string;
  name: string;
}

interface CatalogCourse {
  courses_id: string;
  name: string;
  faculty_id?: string;
  faculty?: {
    faculty_id: string;
    name: string;
  };
  prerequisito: string | null;
}

const UniversityCatalog = () => {
  const [courses, setCourses] = useState<CatalogCourse[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  const [selectedCareer, setSelectedCareer] = useState<string>("");

  // Estado de autenticación y rol
  const [currentUserRole, setCurrentUserRole] = useState<string>("student");
  const [adminMode, setAdminMode] = useState<boolean>(false);

  // Estados para modales y alertas
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCourse, setEditingCourse] = useState<CatalogCourse | null>(null);
  const [formName, setFormName] = useState<string>("");
  const [formFacultyId, setFormFacultyId] = useState<string>("");
  const [formPrereqId, setFormPrereqId] = useState<string>("");
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Cargar rol del usuario
  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const role =
        session?.user?.user_metadata?.role ||
        session?.user?.app_metadata?.role ||
        "student";
      setCurrentUserRole(role);
      if (role === "admin") {
        setAdminMode(true);
      }
    };
    fetchUserRole();
  }, []);

  // Cargar datos iniciales
  const loadCatalogData = async () => {
    try {
      setLoading(true);
      setFeedbackMessage(null);

      const [coursesRes, facultiesRes, careersRes] = await Promise.all([
        coursesCatalogRequest(),
        facultiesRequest(),
        careersRequest(),
      ]);

      setCourses(coursesRes.data?.courses || []);
      setFaculties(facultiesRes.data?.faculties || []);
      setCareers(careersRes.data?.careers || []);
    } catch (err) {
      console.error("Error al cargar el catálogo:", err);
      setFeedbackMessage({
        type: "error",
        text: "No se pudieron cargar los datos del catálogo universitario.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogData();
  }, []);

  // Filtrar por carrera cuando cambie
  useEffect(() => {
    if (!selectedCareer) {
      loadCatalogData();
      return;
    }

    const filterByCareer = async () => {
      try {
        setLoading(true);
        const res = await coursesCatalogByCareerRequest(selectedCareer);
        setCourses(res.data?.courses || []);
      } catch (err) {
        console.error("Error al filtrar por carrera:", err);
      } finally {
        setLoading(false);
      }
    };

    filterByCareer();
  }, [selectedCareer]);

  // Mapa de nombres de materias para resolver prerrequisitos en la vista
  const coursesMap = useMemo(() => {
    const map: Record<string, string> = {};
    courses.forEach((c) => {
      map[c.courses_id] = c.name;
    });
    return map;
  }, [courses]);

  // Filtrado en memoria por búsqueda y facultad
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      const courseFacultyId =
        course.faculty?.faculty_id || course.faculty_id;
      const matchesFaculty =
        !selectedFaculty || courseFacultyId === selectedFaculty;

      return matchesSearch && matchesFaculty;
    });
  }, [courses, searchTerm, selectedFaculty]);

  // Manejadores del modal
  const openCreateModal = () => {
    setEditingCourse(null);
    setFormName("");
    setFormFacultyId(faculties[0]?.faculty_id || "");
    setFormPrereqId("");
    setIsModalOpen(true);
  };

  const openEditModal = (course: CatalogCourse) => {
    setEditingCourse(course);
    setFormName(course.name);
    setFormFacultyId(course.faculty?.faculty_id || course.faculty_id || "");
    setFormPrereqId(course.prerequisito || "");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  // Guardar (Crear o Actualizar)
  const handleSubmitCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formFacultyId) {
      setFeedbackMessage({
        type: "error",
        text: "El nombre y la facultad son campos requeridos.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedbackMessage(null);

      if (editingCourse) {
        // Actualizar
        await updateCatalogCourseRequest(editingCourse.courses_id, {
          name: formName.trim(),
          faculty_id: formFacultyId,
          prerequisito: formPrereqId || null,
        });
        setFeedbackMessage({
          type: "success",
          text: `Materia "${formName}" actualizada exitosamente.`,
        });
      } else {
        // Crear
        await createCatalogCourseRequest({
          name: formName.trim(),
          faculty_id: formFacultyId,
          prerequisito: formPrereqId || null,
        });
        setFeedbackMessage({
          type: "success",
          text: `Materia "${formName}" agregada al catálogo de la universidad.`,
        });
      }

      closeModal();
      await loadCatalogData();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMsg =
          err.response?.data?.error ||
          "Error al guardar la materia en el catálogo.";
        setFeedbackMessage({ type: "error", text: errorMsg });
      } else {
        setFeedbackMessage({
          type: "error",
          text: "Ocurrió un error inesperado al procesar la solicitud.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar materia
  const handleDeleteCourse = async (course: CatalogCourse) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar "${course.name}" del catálogo universitario? Esta acción no se puede deshacer.`,
    );
    if (!confirmDelete) return;

    try {
      setFeedbackMessage(null);
      await deleteCatalogCourseRequest(course.courses_id);
      setFeedbackMessage({
        type: "success",
        text: `Materia "${course.name}" eliminada del catálogo.`,
      });
      await loadCatalogData();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMsg =
          err.response?.data?.error || "No se pudo eliminar la materia.";
        setFeedbackMessage({ type: "error", text: errorMsg });
      } else {
        setFeedbackMessage({
          type: "error",
          text: "Error inesperado al eliminar la materia.",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        {/* Cabecera de la vista */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#009853] flex items-center justify-center text-2xl font-bold">
              <FiBookOpen />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Catálogo Universitario de Asignaturas
              </h1>
              <p className="text-sm text-gray-500">
                Pantalla Maestra • Explora las asignaturas, facultades y malla de prerrequisitos institucionales
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle de Modo Administrador (Permite evaluar el RBAC y CRUD controlado) */}
            <button
              type="button"
              onClick={() => setAdminMode(!adminMode)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                adminMode
                  ? "bg-amber-50 text-amber-800 border-amber-300"
                  : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
              }`}
              title={`Rol de sesión: ${currentUserRole}. Cambia entre vista regular y modo de administración`}
            >
              <FiShield className={adminMode ? "text-amber-600" : "text-gray-400"} />
              {adminMode ? "Modo Admin Activo" : "Vista Estudiante"}
            </button>

            {adminMode && (
              <button
                type="button"
                onClick={openCreateModal}
                className="flex items-center gap-2 bg-[#009853] hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium shadow-sm transition"
              >
                <FiPlus size={18} />
                <span>Nueva Materia</span>
              </button>
            )}
          </div>
        </div>

        {/* Notificaciones / Alertas */}
        {feedbackMessage && (
          <div
            className={`flex items-center justify-between p-4 mb-6 rounded-xl border ${
              feedbackMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-3">
              {feedbackMessage.type === "success" ? (
                <FiCheckCircle className="text-emerald-600" size={20} />
              ) : (
                <FiAlertCircle className="text-red-600" size={20} />
              )}
              <span className="text-sm font-medium">{feedbackMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackMessage(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX size={18} />
            </button>
          </div>
        )}

        {/* Barra de Filtros y Búsqueda */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <FiSearch
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar materia por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <FiFilter />
              <span>Filtrar por:</span>
            </div>

            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Todas las Facultades</option>
              {faculties.map((f) => (
                <option key={f.faculty_id} value={f.faculty_id}>
                  {f.name}
                </option>
              ))}
            </select>

            <select
              value={selectedCareer}
              onChange={(e) => setSelectedCareer(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Todas las Carreras</option>
              {careers.map((c) => (
                <option key={c.career_id} value={c.career_id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contenido / Listado de Materias */}
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-500 shadow-sm border border-gray-100">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mb-3"></div>
            <p>Cargando materias del catálogo universitario...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <FiBookOpen size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-700 mb-1">
              No se encontraron asignaturas
            </h3>
            <p className="text-sm text-gray-500">
              Intenta cambiar los filtros de búsqueda o agrega una nueva materia.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Asignatura</th>
                    <th className="py-3.5 px-6">Facultad</th>
                    <th className="py-3.5 px-6">Prerrequisito Institucional</th>
                    {adminMode && (
                      <th className="py-3.5 px-6 text-right">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredCourses.map((course) => {
                    const prereqName =
                      course.prerequisito && coursesMap[course.prerequisito]
                        ? coursesMap[course.prerequisito]
                        : null;

                    return (
                      <tr
                        key={course.courses_id}
                        className="hover:bg-gray-50/60 transition"
                      >
                        <td className="py-4 px-6 font-semibold text-gray-800">
                          {course.name}
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-md font-medium">
                            {course.faculty?.name || "Facultad Institucional"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {prereqName ? (
                            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 text-xs px-2.5 py-1 rounded-md font-medium">
                              <span>Obligatorio:</span>
                              <strong>{prereqName}</strong>
                            </span>
                          ) : (
                            <span className="inline-block text-emerald-700 bg-emerald-50 border border-emerald-200 text-xs px-2.5 py-1 rounded-md font-medium">
                              Sin Prerrequisito
                            </span>
                          )}
                        </td>
                        {adminMode && (
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(course)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Editar Asignatura"
                              >
                                <FiEdit2 size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCourse(course)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Eliminar Asignatura"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>
                Mostrando <strong>{filteredCourses.length}</strong> de{" "}
                <strong>{courses.length}</strong> asignaturas registradas
              </span>
              <span>PoliPlan • Catálogo Académico Oficial</span>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Creación / Edición */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-800">
                {editingCourse ? "Editar Asignatura" : "Nueva Asignatura del Catálogo"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Nombre de la Materia *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sistemas Operativos, Cálculo I"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Facultad Responsable *
                </label>
                <select
                  required
                  value={formFacultyId}
                  onChange={(e) => setFormFacultyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Seleccione una facultad</option>
                  {faculties.map((f) => (
                    <option key={f.faculty_id} value={f.faculty_id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Prerrequisito Institucional (Opcional)
                </label>
                <select
                  value={formPrereqId}
                  onChange={(e) => setFormPrereqId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Sin prerrequisito (Nivel inicial)</option>
                  {courses
                    .filter(
                      (c) =>
                        !editingCourse || c.courses_id !== editingCourse.courses_id,
                    )
                    .map((c) => (
                      <option key={c.courses_id} value={c.courses_id}>
                        {c.name}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  El estudiante deberá haber aprobado esta materia antes de inscribirla.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#009853] hover:bg-emerald-700 text-white shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Guardando..."
                    : editingCourse
                      ? "Guardar Cambios"
                      : "Crear Materia"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversityCatalog;
