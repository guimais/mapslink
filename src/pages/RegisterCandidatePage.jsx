import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RegisterCandidatePage() {
  const navigate = useNavigate();
  const { registerCandidate } = useAuth();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    headline: "",
    specialty: "",
    location: "Campinas, SP",
    availability: "Hibrido",
    skills: "",
    bio: "",
  });

  function handleSubmit(event) {
    event.preventDefault();
    try {
      registerCandidate(form);
      navigate("/app/candidato");
    } catch (nextError) {
      setError(nextError.message);
    }
  }

  return (
    <main className="section auth-section">
      <div className="site-shell auth-grid auth-grid--wide">
        <div className="auth-copy">
          <span className="eyebrow">Cadastro de candidato</span>
          <h1>Monte um perfil rapido para entrar no radar das empresas.</h1>
        </div>

        <form className="panel auth-card auth-card--wide" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="field">
              <span>Nome</span>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
            </label>
            <label className="field">
              <span>E-mail</span>
              <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} required />
            </label>
            <label className="field">
              <span>Telefone</span>
              <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} required />
            </label>
            <label className="field">
              <span>Senha</span>
              <input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required />
            </label>
            <label className="field">
              <span>Especialidade</span>
              <input value={form.specialty} onChange={(event) => setForm((current) => ({ ...current, specialty: event.target.value }))} required />
            </label>
            <label className="field">
              <span>Disponibilidade</span>
              <select value={form.availability} onChange={(event) => setForm((current) => ({ ...current, availability: event.target.value }))}>
                <option>Hibrido</option>
                <option>Remoto</option>
                <option>Presencial</option>
              </select>
            </label>
          </div>
          <label className="field">
            <span>Headline</span>
            <input value={form.headline} onChange={(event) => setForm((current) => ({ ...current, headline: event.target.value }))} required />
          </label>
          <label className="field">
            <span>Skills</span>
            <input value={form.skills} onChange={(event) => setForm((current) => ({ ...current, skills: event.target.value }))} placeholder="React, Node.js, UX" required />
          </label>
          <label className="field">
            <span>Bio</span>
            <textarea rows="5" value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} required />
          </label>
          <button type="submit" className="button button--primary">
            Criar conta
          </button>
          {error ? <div className="notice notice--error">{error}</div> : null}
        </form>
      </div>
    </main>
  );
}
