import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../integrations/supabase";
import useAuth from "../hooks/useAuth";

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    const session = useAuth();
    if (session) navigate("/home");
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (email === "" || password === "") {
        alert("Por favor, completa todos los campos");
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }
      setTimeout(() => navigate("/home"), 1000);
    } catch (error) {
      alert((error as Error).message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      {loading && <p>Cargando...</p>}
      <div>
        <div>
          <p>Si no tienes cuenta </p>
          <button type="button" onClick={() => navigate("/register")}>
            REGISTRESE
          </button>
        </div>
        <h1>Login</h1>
      </div>
      <form>
        <label htmlFor="name">Email</label>
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="button" onClick={handleSubmit}>
          Login
        </button>
      </form>
    </div>
  );
};

export default Auth;
