import { useState } from "react";
import { SectionHeading } from "../components/SectionHeading";
import { usePlatform } from "../context/PlatformContext";

export function ContactPage() {
  const { sendContactMessage } = usePlatform();
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendContactMessage(form);
    setStatus("Mensagem enviada. Vamos responder em breve.");
    setForm({ name: "", email: "", company: "", message: "" });
  }

  return (
    <main className="section">
      <div className="site-shell contact-grid">
        <div>
          <SectionHeading
            eyebrow="Contato"
            title="Fale com a equipe sobre produto, parcerias ou novos pilotos."
            description="Mantivemos a identidade do projeto, mas com uma pagina de contato mais objetiva e mais facil de ler."
          />
          <div className="contact-cards">
            <article className="panel">
              <strong>E-mail</strong>
              <p>contato@mapslink.com</p>
            </article>
            <article className="panel">
              <strong>Telefone</strong>
              <p>+55 19 99740-5660</p>
            </article>
            <article className="panel">
              <strong>Base</strong>
              <p>Campinas, SP</p>
            </article>
          </div>
        </div>

        <form className="panel form-card" onSubmit={handleSubmit}>
          <label className="field">
            <span>Nome</span>
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label className="field">
            <span>E-mail</span>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </label>
          <label className="field">
            <span>Empresa</span>
            <input name="company" value={form.company} onChange={handleChange} />
          </label>
          <label className="field">
            <span>Mensagem</span>
            <textarea name="message" rows="5" value={form.message} onChange={handleChange} required />
          </label>
          <button type="submit" className="button button--primary">
            Enviar mensagem
          </button>
          {status ? <div className="notice">{status}</div> : null}
        </form>
      </div>
    </main>
  );
}
