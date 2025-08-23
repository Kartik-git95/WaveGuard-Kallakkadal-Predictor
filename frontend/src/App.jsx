import { useState } from "react";
import LoginPage from "./views/LoginPage"; // import your login component
import AuthoritiesPage from "./views/AuthoritiesPage"; // example authorities dashboard
import LocalsPage from "./views/LocalPage"; // example locals dashboard

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
        <LocalsPage />
      )}
    </>
  );
}
