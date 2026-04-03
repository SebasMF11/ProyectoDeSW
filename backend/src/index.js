/**
 * ARCHIVO: index.js
 * PROPÓSITO: Punto de entrada principal del servidor backend
 *
 * ARQUITECTURA:
 * El backend utiliza una arquitectura en capas:
 * - Routes: Definen los endpoints HTTP
 * - Controllers: Lógica de manejo de peticiones HTTP
 * - Services: Lógica de negocio
 * - Models/DB: Interacción con Supabase (PostgreSQL)
 */

require("dotenv").config();

const app = require("./app");

// PORT por defecto es 3000, puede ser configurado en variables de entorno
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
