import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePlatform } from "../context/PlatformContext";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function RegisterCompanyPage() {
  const navigate = useNavigate();
  const { registerCompany } = useAuth();
  const { createCompanyProfile } = usePlatform();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    password: "",
    role: "People Lead",
    city: "Campinas",
    state: "SP",
    address: "",
    sector: "",
    website: "",
    size: "Startup",
    model: "Hibrido",
    tags: "",
    tagline: "",
    description: "",
  });

  function handleSubmit(event) {
    event.preventDefault();
    try {
      const companySlug = slugify(form.companyName);
      createCompanyProfile({
        slug: companySlug,
        name: form.companyName,
        city: form.city,
        state: form.state,
        address: form.address,
        sector: form.sector,
        website: form.website,
        size: form.size,
        model: form.model,
        tags: form.tags,
        tagline: form.tagline,
        description: form.description,
      });

      registerCompany({
        email: form.email,
        password: form.password,
        contactName: form.contactName,
        phone: form.phone,
        role: form.role,
        tagline: form.tagline,
        companySlug,
      });

      navigate("/app/empresa");
    } catch (nextError) {
      setError(nextError.message);
    }
  }

  return (
    <main className="section auth-section">
      <div className="site-shell auth-grid auth-grid--wide">
        <div className="auth-copy">
          <span className="eyebrow">Cadastro de empresa</span>
          <h1>Crie uma base para publicar vagas, mostrar contexto e organizar candidatos.</h1>
        </div>

        <form className="panel auth-card auth-card--wide" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label className="field">
              <span>Empresa</span>
              <input value={form.companyName} onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))} required />
            </label>
            <label className="field">
              <span>Contato responsavel</span>
              <input value={form.contactName} onChange={(event) => setForm((current) => ({ ...current, contactName: event.target.value }))} required />
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
              <span>Funcao</span>
              <input value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} />
            </label>
          </div>

          <div className="form-grid">
            <label className="field">
              <span>Setor</span>
              <input value={form.sector} onChange={(event) => setForm((current) => ({ ...current, sector: event.target.value }))} required />
            </label>
            <label className="field">
              <span>Endereco</span>
              <input value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} required />
            </label>
            <label className="field">
              <span>Site</span>
              <input value={form.website} onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))} />
            </label>
            <label className="field">
              <span>Porte</span>
              <select value={form.size} onChange={(event) => setForm((current) => ({ ...current, size: event.target.value }))}>
                <option>Startup</option>
                <option>Media</option>
                <option>Grande</option>
              </select>
            </label>
            <label className="field">
              <span>Modelo</span>
              <select value={form.model} onChange={(event) => setForm((current) => ({ ...current, model: event.target.value }))}>
                <option>Hibrido</option>
                <option>Remoto</option>
                <option>Presencial</option>
              </select>
            </label>
            <label className="field">
              <span>Tags</span>
              <input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} placeholder="IA, Produto, Dados" required />
            </label>
          </div>

          <label className="field">
            <span>Tagline</span>
            <input value={form.tagline} onChange={(event) => setForm((current) => ({ ...current, tagline: event.target.value }))} required />
          </label>
          <label className="field">
            <span>Descricao</span>
            <textarea rows="5" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} required />
          </label>
          <button type="submit" className="button button--primary">
            Criar empresa
          </button>
          {error ? <div className="notice notice--error">{error}</div> : null}
        </form>
      </div>
    </main>
  );
}
