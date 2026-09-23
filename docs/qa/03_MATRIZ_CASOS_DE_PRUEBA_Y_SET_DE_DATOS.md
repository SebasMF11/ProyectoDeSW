# Matriz de Casos de Prueba Funcionales y Sets de Datos

* **Proyecto:** PoliPlan — Sistema Integral de Planificación y Gestión Académica
* **Documento:** Especificación Detallada de Casos de Prueba (Test Cases) y Datos de Prueba (Test Data)
* **Equipo Evaluador:** Equipo 7
* **Destino:** Auditoría a Equipo 3 / Auto-evaluación de PoliPlan
* **Fecha:** Septiembre 2026

---

## 1. Convención de Nomenclatura

Los casos de prueba se identifican mediante el formato:
$$\mathbf{TC\text{-}[MOD]\text{-}[NUM]}$$

* **MOD:** Módulo funcional (`AUTH`, `SEM`, `CRS`, `ASM`, `DAY`, `CAT`, `ENR`, `REP`).
* **Tipo:** Positiva (+), Negativa (-), Límite (BVA), Integración (INT).

---

## 2. Matriz Detallada de Casos de Prueba y Sets de Datos

### MÓDULO 1: Autenticación, Seguridad y Perfil (AUTH)

| ID | Caso de Prueba | Tipo | Precondiciones | Pasos de Ejecución | Set de Datos (Test Data) | Resultado Esperado | Estado |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-AUTH-01** | Inicio de sesión con credenciales válidas | **Positiva (+)** | Usuario registrado en el sistema | 1. Ingresar a `/login`; 2. Digitar email y contraseña válidos; 3. Hacer clic en "Iniciar Sesión" | **Email:** `estudiante.demo@epn.edu.ec`; **Password:** `PoliPlan2026!` | Acceso concedido, token JWT guardado en sesión, redirección al Dashboard. | **PASS** |
| **TC-AUTH-02** | Inicio de sesión con contraseña incorrecta | **Negativa (-)** | Usuario existente | 1. Ingresar a `/login`<br>2. Digitar email registrado y contraseña errónea<br>3. Hacer clic en "Iniciar Sesión" | **Email:** `estudiante.demo@epn.edu.ec`<br>**Password:** `ClaveErronea123` | Mensaje de error visible ("Credenciales inválidas"), sin redirección ni generación de sesión. | **PASS** |
| **TC-AUTH-03** | Registro con correo de formato inválido | **Negativa (-)** | Ninguna | 1. Ingresar a `/register`<br>2. Digitar datos con formato de correo inválido<br>3. Intentar enviar formulario | **Nombre:** `Juan`<br>**Email:** `correo_sin_arroba.com`<br>**Password:** `Pass1234!` | El formulario bloquea el envío y muestra mensaje de validación de formato de correo. | **PASS** |
| **TC-AUTH-04** | Protección de rutas privadas sin autenticación | **Seguridad** | Sin sesión activa | 1. Abrir ventana de incógnito<br>2. Ingresar directamente a la URL `/enrollment` o `/reports/grades` | **URL directa:** `https://poliplan.onrender.com/enrollment` | El middleware intercepta la navegación y redirige a `/login`. | **PASS** |

---

### MÓDULO 2: Pantalla Maestra 1 — Semestres Académicos (SEM)

| ID | Caso de Prueba | Tipo | Precondiciones | Pasos de Ejecución | Set de Datos (Test Data) | Resultado Esperado | Estado |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-SEM-01** | Creación exitosa de período académico | **Positiva (+)** | Estudiante autenticado | 1. Ir a sección Semestres<br>2. Clic en "Nuevo Semestre"<br>3. Llenar nombre y rango de fechas coherente<br>4. Guardar | **Nombre:** `2026-A`<br>**Inicio:** `2026-03-01`<br>**Fin:** `2026-07-31`<br>**Sem. Parcial:** 8<br>**Sem. Final:** 16 | Semestre creado exitosamente, visible en la tabla y disponible en selectores. | **PASS** |
| **TC-SEM-02** | Validación de fecha fin menor a fecha inicio | **Negativa (-)** | Estudiante autenticado | 1. Clic en "Nuevo Semestre"<br>2. Ingresar fecha de fin anterior a la de inicio<br>3. Guardar | **Nombre:** `Semestre Erróneo`<br>**Inicio:** `2026-08-01`<br>**Fin:** `2026-05-01` | Validación bloquea el envío o backend rechaza con mensaje de inconsistencia temporal. | **PASS** |
| **TC-SEM-03** | Detección de solapamiento con semestre existente | **Negativa (-)** | Semestre `2026-A` ya creado | 1. Intentar registrar un nuevo semestre cuyas fechas choquen con `2026-A`<br>2. Guardar | **Nombre:** `2026-Interciclo`<br>**Inicio:** `2026-04-01`<br>**Fin:** `2026-06-01` | Alerta indicando colisión o solapamiento con un período lectivo en curso. | **PASS** |

---

### MÓDULO 3: Pantalla Maestra 2 — Asignaturas y Cursos (CRS)

| ID | Caso de Prueba | Tipo | Precondiciones | Pasos de Ejecución | Set de Datos (Test Data) | Resultado Esperado | Estado |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-CRS-01** | Creación de asignatura con datos válidos | **Positiva (+)** | Semestre activo creado | 1. Ir a Gestión de Cursos<br>2. Seleccionar materia del catálogo<br>3. Ingresar docente, créditos y color visual<br>4. Guardar | **Materia:** `Estructuras de Datos`<br>**Profesor:** `Ing. Carlos Torres`<br>**Créditos:** 4<br>**Color:** `#3B82F6` (Azul) | Asignatura creada en estado `active`, vinculada al semestre y mostrada en pantalla. | **PASS** |
| **TC-CRS-02** | Validación de créditos no numéricos o negativos | **Negativa (-)** | Formulario de curso abierto | 1. Digitar valor de créditos negativo o cero<br>2. Intentar guardar | **Materia:** `Cálculo I`<br>**Créditos:** `-2` o `0` | El campo rechaza valores fuera del rango permitido ($1 \le \text{créditos} \le 10$). | **PASS** |
| **TC-CRS-03** | Eliminación de curso y borrado en cascada | **Integración** | Curso con evaluaciones y horarios | 1. Localizar curso con notas registradas<br>2. Clic en "Eliminar"<br>3. Confirmar en el diálogo | **Curso ID:** `c-target-123` | Se elimina el curso y en cascada sus horarios, rúbricas y notas sin causar error 500. | **PASS** |

---

### MÓDULO 4: Pantalla Maestra 3 — Evaluaciones y Rúbricas (ASM)

| ID | Caso de Prueba | Tipo | Precondiciones | Pasos de Ejecución | Set de Datos (Test Data) | Resultado Esperado | Estado |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-ASM-01** | Creación de evaluación con ponderación normal | **Positiva (+)** | Curso activo existente | 1. Entrar a detalle de la materia<br>2. Agregar evaluación: Nombre, Tipo, Ponderación, Fecha<br>3. Guardar | **Nombre:** `Examen Parcial 1`<br>**Tipo:** `Examen`<br>**Ponderación:** `30%`<br>**Fecha:** `2026-05-10` | Evaluación registrada correctamente; porcentaje acumulado incrementa a 30%. | **PASS** |
| **TC-ASM-02** | Validación de límite de suma ponderada (>100%) | **BVA / Negativa (-)** | Materia con 85% ya configurado | 1. Intentar agregar una evaluación con ponderación que supere el 100% total<br>2. Guardar | **Ponderación actual:** `85%`<br>**Nueva evaluación:** `25%`<br>**Suma proyectada:** `110%` | Advertencia o bloqueo impidiendo que la suma supere el 100% de la calificación. | **PASS** |
| **TC-ASM-03** | Detección de conflicto de evaluaciones el mismo día | **Negativa (-)** | Evaluación programada el 15/05 | 1. Intentar programar otra evaluación para la misma materia el 15/05<br>2. Guardar | **Fecha:** `2026-05-15T10:00:00`<br>**Fecha choque:** `2026-05-15T15:00:00` | Alerta de conflicto indicando que ya existe una evaluación programada en esa fecha. | **PASS** |

---

### MÓDULO 5: Pantalla Maestra 4 — Horarios y Días de Clase (DAY)

| ID | Caso de Prueba | Tipo | Precondiciones | Pasos de Ejecución | Set de Datos (Test Data) | Resultado Esperado | Estado |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-DAY-01** | Programación de franja horaria sin conflicto | **Positiva (+)** | Asignatura creada | 1. En la materia, añadir día de clase<br>2. Seleccionar día de semana, hora inicio, hora fin y aula<br>3. Guardar | **Día:** `Lunes`<br>**Inicio:** `07:00`<br>**Fin:** `09:00`<br>**Aula:** `Edificio 3 - Aula 204` | Horario guardado y visible en el cronograma semanal. | **PASS** |
| **TC-DAY-02** | Validación de hora fin menor o igual a inicio | **Negativa (-)** | Formulario de horario | 1. Ingresar hora fin anterior a la de inicio<br>2. Guardar | **Día:** `Miércoles`<br>**Inicio:** `14:00`<br>**Fin:** `12:00` | Bloqueo con mensaje ("La hora de finalización debe ser mayor a la de inicio"). | **PASS** |
| **TC-DAY-03** | Detección de colisión de horario en el mismo día | **Negativa (-)** | Clase existente: Martes 08:00 a 10:00 | 1. Intentar agendar otra clase el mismo día que solape el rango<br>2. Guardar | **Existente:** Martes 08:00 - 10:00<br>**Nueva propuesta:** Martes 09:00 - 11:00 | Detección de colisión horaria e impedimento de registro. | **PASS** |

---

### MÓDULO 6: Pantalla Maestra 5 — Catálogo Universitario & RBAC (CAT)

| ID | Caso de Prueba | Tipo | Precondiciones | Pasos de Ejecución | Set de Datos (Test Data) | Resultado Esperado | Estado |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-CAT-01** | Consulta libre de catálogo por estudiante | **Positiva (+)** | Sesión como estudiante regular | 1. Ingresar a `/university-catalog`<br>2. Filtrar por facultad o carrera<br>3. Buscar por texto | **Búsqueda:** `Sistemas Operativos`<br>**Filtro:** `Ingeniería de Software` | El catálogo muestra asignaturas, códigos, créditos y prerrequisitos asociados. | **PASS** |
| **TC-CAT-02** | Restricción RBAC: Estudiante no puede mutar | **Seguridad (-)** | Sesión como estudiante regular | 1. En `/university-catalog`, verificar que no existan botones de creación/edición, o ejecutar llamada manual `POST /catalog/courses` | **Payload:** `{ "name": "Materia Hack", "credits": 4 }` | Interfaz bloquea controles o API responde `403 Forbidden` ("Acceso restringido a administradores"). | **PASS** |
| **TC-CAT-03** | Permiso RBAC: Administrador puede gestionar | **Positiva (+)** | Sesión con rol `admin` | 1. Iniciar sesión como usuario administrador<br>2. Clic en "Nueva Asignatura de Catálogo"<br>3. Guardar | **Materia:** `Computación Cuántica`<br>**Código:** `CC-501`<br>**Créditos:** 3 | Operación autorizada exitosamente (`201 Created`), nuevo registro en el catálogo general. | **PASS** |

---

### MÓDULO 7: Pantalla Transaccional — Matrícula Semestral en Bloque (ENR)

| ID | Caso de Prueba | Tipo | Precondiciones | Pasos de Ejecución | Set de Datos (Test Data) | Resultado Esperado | Estado |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-ENR-01** | **BVA Límite Exacto: Matrícula de 26 créditos** | **Límite (BVA +)** | Semestre activo, catálogo disponible | 1. Ir a `/enrollment`<br>2. Seleccionar semestre<br>3. Agregar lote de 7 materias que sumen exactamente 26 créditos<br>4. Configurar horarios no colisionantes<br>5. Clic en "Confirmar y Procesar" | **Lote de 26 créditos:**<br>1. Mat A: 4 cr<br>2. Mat B: 4 cr<br>3. Mat C: 4 cr<br>4. Mat D: 4 cr<br>5. Mat E: 4 cr<br>6. Mat F: 3 cr<br>7. Mat G: 3 cr<br>**(Total = 26)** | Barra de créditos al 100% (26/26). Matrícula procesada atómicamente, todas las materias inscritas con sus horarios. | **PASS** |
| **TC-ENR-02** | **BVA Exceso Estricto: Intento de 27 créditos** | **Límite (BVA -)** | Semestre con 24 créditos ya seleccionados | 1. En `/enrollment`, tener lote de 24 créditos<br>2. Intentar agregar una materia de 3 créditos ($24 + 3 = 27 > 26$)<br>3. Intentar procesar | **Créditos previos:** 24<br>**Materia a sumar:** 3 créditos<br>**Total proyectado:** **27 créditos** | La barra de créditos se pone en **rojo de alerta**, botón de procesar se **deshabilita** y la API rechaza con error de tope superado. | **PASS** |
| **TC-ENR-03** | Detección de colisión horaria interna en el lote | **Negativa (-)** | Lote en preparación | 1. Seleccionar Materia 1 con clase los Viernes 08:00 - 10:00<br>2. Seleccionar Materia 2 con clase los Viernes 09:00 - 11:00<br>3. Verificar validación en tiempo real | **Materia 1:** Viernes 08:00 - 10:00<br>**Materia 2:** Viernes 09:00 - 11:00<br>**(Cruce de 1 hora)** | Mensaje de advertencia identificando conflicto entre Materia 1 y Materia 2 el día Viernes. Botón bloqueado. | **PASS** |
| **TC-ENR-04** | Bloqueo por prerrequisito no aprobado | **Negativa (-)** | Estudiante sin aprobación de Álgebra Lineal | 1. En `/enrollment`, intentar matricular `Ecuaciones Diferenciales` (exige Álgebra Lineal aprobada) | **Materia:** `Ecuaciones Diferenciales`<br>**Prerrequisito requerido:** `Álgebra Lineal` | El sistema marca la materia con aviso de prerrequisito no cumplido e impide la inscripción. | **PASS** |
| **TC-ENR-05** | Prevención de materia ya inscrita | **Negativa (-)** | Materia ya activa en el semestre | 1. Intentar agregar al lote una materia que ya fue matriculada previamente en ese semestre | **Materia duplicada:** `Física I` | Notificación ("La asignatura ya se encuentra matriculada en este período académico"). | **PASS** |

---

### MÓDULO 8: Reportes Académicos Oficiales (REP)

| ID | Caso de Prueba | Tipo | Precondiciones | Pasos de Ejecución | Set de Datos (Test Data) | Resultado Esperado | Estado |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-REP-01** | Reporte 1: Exactitud de cálculo de GPA ponderado | **Cálculo Positivo** | Semestres cursados con calificaciones | 1. Ir a `/reports/grades`<br>2. Revisar tarjetas de KPI y desglose por semestre | **Semestre 1:**<br>• Mat A (4 cr): Nota 18.0<br>• Mat B (3 cr): Nota 14.0<br>$$\text{GPA} = \frac{(18\times4) + (14\times3)}{7} = 16.28$$ | El KPI muestra GPA exacto de **16.28 / 20** (o su equivalente en escala de 5.0), número de créditos aprobados y tasa de éxito %. | **PASS** |
| **TC-REP-02** | Reporte 2: Matriz horaria semanal y agenda | **Visual Positivo** | Materias con horarios y evaluaciones | 1. Ir a `/reports/schedule`<br>2. Alternar entre vista "Horario Semanal" y "Agenda de Evaluaciones" | **Clases:** Lunes a Viernes<br>**Evaluación 1:** En 2 días<br>**Evaluación 2:** En 12 días | 1. Matriz presenta bloques de clase con profesor y aula.<br>2. Agenda muestra Evaluación 1 con badge rojo ("Urgente - Faltan 2 días") y Evaluación 2 normal. | **PASS** |
