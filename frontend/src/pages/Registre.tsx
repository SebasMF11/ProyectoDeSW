import React from "react";
import { useNavigate } from "react-router";
import { supabase } from "../integrations/supabase";

const Registre = () => {
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    /*e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const lastname = formData.get("lastname") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          lastname,
        },
      },
    });
    if (error) throw error;
    setTimeout(() => navigate("/home"), 1000);
    console.log(data);*/
  };
  return (
    <div>
      <div>
        <button type="button" onClick={() => navigate("/auth")}>
          Volver
        </button>
        <h1>Registre</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="name">name</label>
        <input type="text" placeholder="name" name="name" />
        <label htmlFor="lastname">lastname</label>
        <input type="text" placeholder="lastname" name="lastname" />
        <label htmlFor="name">Email</label>
        <input type="email" placeholder="Email" name="email" />
        <label htmlFor="password">Password</label>
        <input type="password" placeholder="Password" name="password" />
        <label htmlFor="password">Password</label>
        <input type="password" placeholder="Password" name="password" />
        <button type="submit">Registre</button>
      </form>
    </div>
  );
};
export default Registre;
