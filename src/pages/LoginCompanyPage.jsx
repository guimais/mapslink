import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LoginCompanyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    try {
      login({ ...form, type: "company" });
      navigate(location.state?.from || "/app/empresa");
    } catch (nextError) {
      setError(nextError.message);
    }
  }

  return (
    <main className="section auth-section">
      <div className="site-shell auth-grid">
        <div className="auth-copy">
          <span className="eyebrow">Empresa</span>
          <h1>Gerencie vagas, pipeline e agenda com uma base React real.</h1>
          <p>
            Conta de teste pronta: <strong>talentos@neuralworks.ai</strong> / <strong>Empresa@123</strong>
          </p>
        </div>

        <form className="panel auth-card" onSubmit={handleSubmit}>
          <label className="field">
            <span>E-mail</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </label>
          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              required
            />
          </label>
          <button type="submit" className="button button--primary">
            Entrar
          </button>
          {error ? <div className="notice notice--error">{error}</div> : null}
          <div className="auth-links">
            <Link to="/esqueci-senha">Esqueci minha senha</Link>
            <Link to="/cadastro/empresa">Criar conta</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
