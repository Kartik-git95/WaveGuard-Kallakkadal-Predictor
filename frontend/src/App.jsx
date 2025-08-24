import { useState } from "react";
import LoginPage from "./views/LoginPage";
import AuthoritiesPage from "./views/AuthoritiesPage";
// FIX: Corrected the component import name to match the file.
import LocalPage from "./views/LocalPage";

export default function App() {
  const [role, setRole] = useState(null);

  const handleLogin = (username, password) => {
    if (username === "Ajmal" && password === "Admin") {
      setRole("authorities");
    } else {
      setRole("locals"); // fallback to locals
    }
  };

  if (!role) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <>
      {role === "authorities" ? (
        <AuthoritiesPage />
      ) : (
        <LocalPage />
      )}
    </>
  );
}