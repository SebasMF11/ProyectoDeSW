# 📖 Guía de Desarrollo

Referencia rápida para desarrolladores que trabajan en este proyecto.

---

## 🚀 Primeros Pasos

### 1. Clonar y Instalar

```bash
# Clonar repositorio
cd ProyectoDeSW

# Backend
cd backend
npm install

# Frontend (en otra terminal)
cd ../frontend
npm install
```

### 2. Configurar Variables de Entorno

Crear `backend/.env`:

```env
PORT=3000
SUPABASE_URL=https://tuproyecto.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

Obtener keys de: https://app.supabase.com → Settings → API

### 3. Iniciar Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

- Backend: http://localhost:3000
- Frontend: http://localhost:5173

---

## 💡 Flujos Comunes de Desarrollo

### Agregar Nueva Ruta de API

**1. Backend Route** (+ 5 min)

Crear en `backend/src/routes/CourseRoutes.js`:

```javascript
/**
 * POST /course/special
 * Descripción: Crear curso especial
 * Requiere: Authorization Bearer token
 */
router.post("/special", authMiddleware, courseController.createSpecial);
```

**2. Backend Controller** (+ 5 min)

Agregar en `backend/src/controllers/CourseController.js`:

```javascript
/**
 * FUNCIÓN: createSpecial
 * Crear curso con validaciones especiales
 */
exports.createSpecial = async (req, res) => {
  try {
    const student_id = req.student.id; // ← Del JWT
    const payload = req.body;

    const result = await courseService.createSpecial(student_id, payload);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

**3. Backend Service** (+ 5 min)

Agregar en `backend/src/services/CourseService.js`:

```javascript
/**
 * FUNCIÓN: createSpecial
 * Lógica de negocio para crear curso especial
 */
exports.createSpecial = async (student_id, payload) => {
  // Validar datos
  if (!payload.courseName) throw new Error("courseName required");

  // Consultar BD
  const { data, error } = await supabase
    .from("course")
    .insert({ ...payload })
    .select();

  if (error) throw error;
  return data;
};
```

**4. Frontend API Client** (+ 5 min)

Crear `frontend/src/api/courseSpecial.ts`:

```typescript
import { httpClient } from "./httpClient";

export const createSpecialRequest = async (payload: any) => {
  return httpClient.post("/course/special", payload);
};
```

**5. Frontend Component** (+ 10 min)

Usar en componente:

```typescript
import { createSpecialRequest } from "../../api/courseSpecial";

const handleCreate = async () => {
  try {
    const res = await createSpecialRequest(formData);
    console.log("Created:", res.data);
  } catch (error) {
    console.error("Error:", error);
  }
};
```

**Total: ~30 minutos para nueva feature end-to-end**

---

### Crear Nueva Página

**1. Crear componente** en `frontend/src/pages/myFeature/MyFeature.tsx`:

```typescript
const MyFeature = () => {
  return (
    <div>
      <h1>Mi Nueva Página</h1>
      {/* Contenido */}
    </div>
  );
};

export default MyFeature;
```

**2. Agregar ruta** en `frontend/src/routers/AppRouters.tsx`:

```typescript
import MyFeature from "../pages/myFeature/MyFeature";

// Dentro de <Routes>
<Route
  path="/my-feature"
  element={
    <ProtectedRouters>
      <MyFeature />
    </ProtectedRouters>
  }
/>
```

**3. Agregar link a navbar** en `frontend/src/components/navbar.tsx`:

```typescript
<Link to="/my-feature">Mi Feature</Link>
```

---

### Agregar Validación de Formulario

Usar React Hook Form:

```typescript
import { useForm } from "react-hook-form";

const MyForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = handleSubmit(async (values) => {
    // values ya está validado
    console.log(values);
  });

  return (
    <form onSubmit={onSubmit}>
      <input
        {...register("email", {
          required: "Email requerido",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Email inválido"
          }
        })}
      />
      {errors.email && <p>{errors.email.message}</p>}

      <button type="submit">Enviar</button>
    </form>
  );
};
```

---

## 🔍 Debugging

### Backend Logs

```bash
# Ver todo en consola
npm run dev

# Ver solo errores
npm run dev 2>&1 | grep "Error"
```

### Frontend Debugging

**en VS Code:**

- F5 para abrir DevTools
- Console tab para logs (console.log)
- Network tab para ver peticiones HTTP

**en Código:**

```typescript
export const httpClient = axios.create({...});

// Agregar logging de peticiones
httpClient.interceptors.request.use((config) => {
  console.log("📤 Request:", config.method.toUpperCase(), config.url);
  return config;
});

httpClient.interceptors.response.use((res) => {
  console.log("📥 Response:", res.status, res.data);
  return res;
});
```

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
