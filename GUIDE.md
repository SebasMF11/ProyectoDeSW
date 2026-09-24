# 📖 Guía de Desarrollo de PoliPlan

Esta guía está alineada con el estado actual del repositorio y resume los pasos para levantar, desarrollar y verificar el proyecto en su versión real.

---

## 🚀 Primeros pasos

### 1. Clonar el repositorio

```bash
cd ProyectoDeSW
```

### 2. Instalar dependencias

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

> El proyecto se trabaja como dos aplicaciones separadas: un backend Express y un frontend React. No hay un script raíz único que gestione ambas al mismo tiempo.

### 3. Configurar variables de entorno

Crea el archivo `backend/.env` con el siguiente formato:

```env
PORT=3000
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
CLIENT_URL=http://localhost:5173
```

### 4. Ejecutar el proyecto

#### Backend

```bash
cd backend
npm run dev
```

#### Frontend

```bash
cd frontend
npm run dev
```

URLs locales esperadas:

- Backend: http://localhost:3000
- Frontend: http://localhost:5173

---

## 💡 Estructura funcional actual

### Backend

El backend usa Express y separa responsabilidades por capas:

- `routes/`: endpoints de la API
- `controllers/`: recibe y responde HTTP
- `services/`: regla de negocio
- `middlewares/`: validación de autenticación y roles
- `config/`: configuración compartida

Rutas principales reales:

- `/student`
- `/semester`
- `/course`
- `/assessment`
- `/day`
- `/grade`
- `/catalog`
- `/enrollment`
- `/reports`

### Frontend

El frontend usa React + TypeScript y Vite.

- `src/pages/`: pantallas del sistema
- `src/api/`: clientes HTTP
- `src/routers/AppRouters.tsx`: rutas principales
- `src/hooks/`: lógica reutilizable
- `src/components/`: componentes visuales
- `src/utils/`: utilidades generales

---

## 🧩 Flujo de trabajo recomendando al desarrollar

### Agregar una ruta nueva

1. Crear la ruta en el archivo correspondiente dentro de `backend/src/routes/`.
2. Registrar el controller y el middleware si aplica.
3. Implementar la lógica de negocio en `backend/src/services/`.
4. Añadir la petición en `frontend/src/api/`.
5. Lanzar y consumir la funcionalidad desde una página de `frontend/src/pages/`.
6. Registrar la ruta en `frontend/src/routers/AppRouters.tsx`.

### Ejemplo de patrón actual

```javascript
router.get("/view", authMiddleware, controller.getData);
```

Y en el controller:

```javascript
exports.getData = async (req, res) => {
  try {
    const result = await service.getData(req.student.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

---

## 🔐 Autenticación y seguridad

El flujo activo del proyecto usa Supabase Auth para:

- registro de estudiantes,
- inicio de sesión,
- verificación de JWT,
- protección de rutas privadas,
- identificación del usuario autenticado por `req.student`.

Las rutas protegidas deben incluir `authMiddleware` en el backend.

---

## 🧪 Comandos útiles

### Backend

```bash
cd backend
npm test
npm run test:coverage
npm run dev
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm run lint
npm run dev
```

---

## 🧭 Rutas principales del sistema

### Públicas

- `/auth`
- `/register`

### Protegidas

- `/home`
- `/profile`
- `/settings`
- `/semester`
- `/course-list`
- `/course`
- `/day`
- `/university-catalog`
- `/enrollment`
- `/assessment-list`
- `/assessment`
- `/grade-list`
- `/grade-simulation`
- `/grade`
- `/reports/grades`
- `/reports/schedule`

---

## 🔍 Depuración de errores comunes

### Backend no responde

Verifica que el servicio de Supabase esté configurado y que las variables `SUPABASE_URL` y `SUPABASE_ANON_KEY` existan en `.env`.

### 401 Unauthorized

Revisa si la solicitud incluye:

```http
Authorization: Bearer <token>
```

### Error de CORS

Asegúrate de que `CLIENT_URL` y el origen del frontend estén permitidos en `backend/src/app.js`.

### Falla al cargar pantallas protegidas

Confirma que la sesión del usuario sigue activa y que el frontend está redirigiendo correctamente a `/auth` cuando no hay sesión.

---

## 📚 Documentación de referencia

- README principal: `README.md`
- Arquitectura: `ARCHITECTURE.md`
- Resumen rápido: `QUICK_REFERENCE.md`
- Especificaciones: `specs/`
- QA y documentación ejecutiva: `docs/`

---

Última actualización: 2026-09-24

### Supabase Logs

En https://app.supabase.com → Monitoring → Logs

```sql
-- Ver últimos errores
select * from logs where level = 'error' order by created_at desc limit 10;
```

---

## 🧪 Testing

### Probar Endpoint con cURL

```bash
# Registro
curl -X POST http://localhost:3000/student/auth \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan",
    "lastName": "Pérez",
    "email": "juan@example.com",
    "password": "Pass123!",
    "password2": "Pass123!"
  }'

# Login
curl -X POST http://localhost:3000/student/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "Pass123!"
  }'

# Petición protegida (con token)
curl -X GET http://localhost:3000/student/view \
  -H "Authorization: Bearer eyJhbGc..."
```

### Probar Componentes en Frontend

Ir a página en navegador:

```
http://localhost:5173/course
http://localhost:5173/grade
http://localhost:5173/semester
```

O hacer login primero:

```
http://localhost:5173/auth
```

---

## 🐛 Errores Comunes

### "Token no proporcionado"

**Causa:** Header Authorization falta o no tiene "Bearer "

**Solución:**

```javascript
// ❌ MALO
Authorization: eyJhbGc...

// ✅ CORRECTO
Authorization: Bearer eyJhbGc...
```

### "Module not found"

**Causa:** Imports con rutas incorrectas

**Solución:**

```typescript
// ❌ MALO
import Course from "pages/course";

// ✅ CORRECTO (relativos)
import Course from "../../pages/course";

// ✅ CORRECTO (alias, si configurado)
import Course from "@/pages/course";
```

### "CORS error"

**Causa:** Frontend y Backend no configurados para comunicarse

**Solución:** Verificar en `backend/src/app.js`:

```javascript
app.use(cors({ origin: "http://localhost:5173" }));
```

### "User already exists"

**Causa:** Email registrado anteriormente

**Solución:** Usar email diferente o borrar usuario en Supabase dashboard

### "Email not confirmed"

**Causa:** Usuario no confirmó email de registro

**Solución:** En desarrollo, Supabase puede auto-confirmar (revisar settings)

---

## 📊 Base de Datos - Queries Útiles

```sql
-- Ver todos los estudiantes
SELECT * FROM student;

-- Ver cursos de un semestre
SELECT * FROM course WHERE semester_id = 1;

-- Ver calificaciones de un estudiante
SELECT * FROM grade WHERE student_id = 'user-uuid' ORDER BY created_at DESC;

-- Ver evaluaciones
SELECT * FROM assessment;

-- Contar cursos total
SELECT COUNT(*) FROM course;

-- Últimos 10 cambios
SELECT * FROM course ORDER BY created_at DESC LIMIT 10;
```

**Ejecutar en Supabase:** SQL Editor → New Query

---

## 📚 Referencia Rápida

| Tarea              | Ubicación                               | Sintaxis                                       |
| ------------------ | --------------------------------------- | ---------------------------------------------- |
| Agregar ruta API   | `backend/routes/*.js`                   | `router.get/post/put/delete()`                 |
| Lógica de petición | `backend/controllers/*.js`              | `exports.function = async (req, res) => {}`    |
| Lógica de negocio  | `backend/services/*.js`                 | `exports.function = async (...) => {}`         |
| Validación auth    | `backend/middlewares/authMiddleware.js` | Middleware del token                           |
| Cliente HTTP       | `frontend/api/*.ts`                     | `httpClient.post/get/put/delete()`             |
| Página             | `frontend/pages/*/*.tsx`                | Componente React con hooks                     |
| Ruta               | `frontend/routers/AppRouters.tsx`       | `<Route path="/x" element={<X />} />`          |
| Formulario         | Componente                              | `const { register, handleSubmit } = useForm()` |
| Hook de auth       | `frontend/hooks/useAuth.tsx`            | `const session = useAuth()`                    |

---

## 🎯 Checklist para Nueva Feature

- [ ] Ruta API creada y testeada con cURL
- [ ] Controlador maneja la lógica HTTP
- [ ] Servicio contiene la lógica de negocio
- [ ] Cliente HTTP en frontend creado
- [ ] Componente React crea y usa el cliente
- [ ] Ruta agregada en AppRouters
- [ ] Página se renderiza sin errores
- [ ] Formulario valida datos
- [ ] Errores capturados y mostrados al usuario
- [ ] Tokens/auth manejados correctamente
- [ ] Código comentado
- [ ] Testeado end-to-end (manual)

---

## 📖 Documentación Externa

- **Express.js:** https://expressjs.com
- **React:** https://react.dev
- **Supabase:** https://supabase.com/docs
- **Axios:** https://axios-http.com
- **React Router:** https://reactrouter.com
- **React Hook Form:** https://react-hook-form.com

---

## 💬 Preguntas Frecuentes

**P: ¿Dónde debo poner lógica?**
R: Controllers para HTTP. Services para negocio. Middlewares para validaciones transversales.

**P: ¿Cómo agregar autenticación a una ruta?**
R: Agregar `authMiddleware` en la ruta: `router.get("/x", authMiddleware, controller.method)`

**P: ¿Por qué mi token expira?**
R: httpClient lo refresca automáticamente. Si ves 401, verifica que Authorization header sea "Bearer <token>"

**P: ¿Cómo actualizar datos en tiempo real?**
R: Usar `useEffect` con dependencias. Para reactivo, Supabase tiene realtime subscriptions (no implementado)

**P: ¿Dónde se guarda el password?**
R: Supabase Auth (encriptado). Backend nunca lo ve. Solo recibe token JWT.

---

**Última actualización**: 2 de abril de 2026
