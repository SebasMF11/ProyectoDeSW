# Especificación 03: Los Dos Reportes — Rendimiento Académico y Horario Semanal

## 1. Identificación del Requisito
* **Tipo:** Vistas de Reportes del Sistema.
* **Objetivo:** Cumplir con el requisito de los **dos reportes formales** con análisis consolidado de información, métricas de rendimiento y visualización de agenda.
* **Modalidad de Entrega:** **Reportes Web Interactivos**. Vistas directas, dinámicas y responsivas en la interfaz web (no requieren exportación a PDF ni dependencias externas de generación de documentos).

---

## 2. Reporte 1: Boletín de Calificaciones y Rendimiento Académico (GPA)

### 2.1 Propósito y Métricas Clave
Permite al estudiante y a la coordinación académica consultar el histórico de calificaciones, avance curricular y promedio acumulado.

* **Fórmulas de Cálculo:**
  1. **Nota Final de Asignatura:**
     $$\text{Nota Final} = \sum_{k=1}^{n} \left( \text{Calificación}_k \times \frac{\text{Porcentaje}_k}{100} \right)$$
  2. **Promedio Ponderado Semestral (PPS):**
     $$\text{PPS} = \frac{\sum (\text{Nota Final}_i \times \text{Créditos}_i)}{\sum \text{Créditos}_i}$$
  3. **Promedio Ponderado Acumulado (GPA Histórico):**
     $$\text{GPA} = \frac{\sum_{\text{todos los semestres}} (\text{Nota Final}_j \times \text{Créditos}_j)}{\sum_{\text{todos los semestres}} \text{Créditos}_j}$$

### 2.2 Estructura Visual del Frontend (`GradeReport.tsx`)
* **Ubicación:** `frontend/src/pages/reports/GradeReport.tsx` (Ruta: `/reports/grades`)
* **Componentes de la Vista:**
  * **Tarjetas de KPI / Resumen Global:**
    * 🎓 **GPA Acumulado:** Número en tipografía grande con badge de estado (ejemplo: `4.25 / 5.0 - Rendimiento Sobresaliente`).
    * 📚 **Créditos Totales Aprobados:** vs Créditos Matriculados.
    * 📊 **Porcentaje de Materias Aprobadas:** Tasa de éxito académico.
  * **Filtro de Semestre:** Dropdown para ver "Histórico Completo" o filtrar por un semestre particular.
  * **Tabla Desglosada por Semestre:**
    * Columnas: Asignatura, Créditos, Detalle de Evaluaciones (Parciales, Talleres, Quices), Nota Definitiva, Estado (Aprobada verde, Reprobada rojo, En curso azul).

---

## 3. Reporte 2: Horario Semanal y Cronograma de Actividades

### 3.1 Propósito
Consolidar en una única pantalla la carga horaria semanal del estudiante y la agenda cronológica de próximas actividades y exámenes para evitar olvidos o desorganización.

### 3.2 Estructura Visual del Frontend (`ScheduleReport.tsx`)
* **Ubicación:** `frontend/src/pages/reports/ScheduleReport.tsx` (Ruta: `/reports/schedule`)
* **Componentes de la Vista:**
  1. **Cuadrícula / Matriz Horaria Semanal:**
     - Eje horizontal: Días de la semana (Lunes, Martes, Miércoles, Jueves, Viernes, Sábado).
     - Eje vertical: Franjas horarias de 60 minutos (06:00 a 22:00).
     - Bloques de clase posicionados automáticamente según hora de inicio y fin, coloreados según el color distintivo de la asignatura, mostrando: Nombre de Materia, Profesor y Horario.
  2. **Panel de Agenda de Próximas Evaluaciones (Timeline):**
     - Lista cronológica vertical de evaluaciones pendientes registradas en las materias activas.
     - Indicador de urgencia:
       - 🔴 *Menos de 3 días restantes*
       - 🟡 *Entre 3 y 7 días restantes*
       - 🟢 *Más de 7 días*
     - Detalle: Nombre de la evaluación, ponderación porcentual y fecha límite.

---

## 4. Endpoints del Backend (`/reports`)

| Método | Ruta | Parámetros | Descripción |
| :--- | :--- | :---: | :--- |
| `GET` | `/reports/transcript` | `?semesterId=<uuid>` (opcional) | Devuelve el boletín de notas, materias, PPS por semestre y GPA acumulado global. |
| `GET` | `/reports/schedule` | `?semesterId=<uuid>` (opcional) | Devuelve las asignaturas activas con sus franjas horarias (`day`) y la lista de evaluaciones ordenadas por fecha. |

---

## 5. Criterios de Aceptación (BDD / Gherkin)

```gherkin
Escenario: Consulta del Boletín de Notas y cálculo de GPA
  Dado que un estudiante tiene materias cursadas en dos semestres
  Cuando ingresa al reporte "/reports/grades"
  Entonces el sistema calcula automáticamente el promedio ponderado de cada semestre
  Y muestra el GPA acumulado histórico general ponderado por los créditos de cada materia
  Y cataloga cada materia como Aprobada (nota >= 3.0) o Reprobada (nota < 3.0).

Escenario: Visualización del Horario Semanal
  Dado que el estudiante tiene inscritas 3 asignaturas con horarios asignados
  Cuando ingresa a "/reports/schedule"
  Entonces la cuadrícula semanal ubica los bloques en sus días y horas correspondientes
  Y la sección de agenda lista las próximas evaluaciones ordenadas desde la más cercana en el tiempo.
```
