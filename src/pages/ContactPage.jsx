import { useState } from "react";
import { SectionHeading } from "../components/SectionHeading";
import { usePlatform } from "../context/PlatformContext";

const contactMethods = [
  {
    icon: "mail",
    label: "E-mail",
    value: "contato@mapslink.com",
    detail: "Resposta em até 24h úteis",
    href: "mailto:contato@mapslink.com",
  },
  {
    icon: "phone",
    label: "Telefone",
    value: "+55 19 99740-5660",
    detail: "Seg–Sex, 9h–18h",
    href: "tel:+5519997405660",
  },
  {
    icon: "location_on",
    label: "Localização",
    value: "Campinas, SP",
    detail: "Brasil",
    href: null,
  },
];

const reasons = [
  { icon: "handshake", label: "Parcerias e integrações" },
  { icon: "work", label: "Cadastro de empresa" },
  { icon: "bug_report", label: "Reportar um problema" },
  { icon: "lightbulb", label: "Sugestão de produto" },
];

export function ContactPage() {
  const { sendContactMessage } = usePlatform();
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });

  function handleChange(e) {
    setForm((c) => ({ ...c, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    sendContactMessage(form);
    setStatus("Mensagem enviada com sucesso. Vamos responder em breve.");
    setForm({ name: "", email: "", company: "", subject: "", message: "" });
  }

  return (
    <main>
      {/* Header */}
      <section className="section">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Contato"
            title="Fale com a equipe MapsLink."
            description="Estamos aqui para ajudar com produto, parcerias ou novos pilotos. Escolha o canal mais adequado ao seu contexto."
            align="center"
          />

          <div className="contact-methods-row">
            {contactMethods.map((m) => (
              <article className="panel contact-method-card" key={m.label}>
                <span
                  className="contact-method-card__icon material-symbols-outlined"
                  aria-hidden="true"
                >
                  {m.icon}
                </span>
                <div className="contact-method-card__body">
                  <strong>{m.label}</strong>
                  {m.href ? (
                    <a href={m.href} className="contact-method-card__value">
                      {m.value}
                    </a>
                  ) : (
                    <span className="contact-method-card__value">{m.value}</span>
                  )}
                  <small>{m.detail}</small>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Reasons */}
      <section className="section section--muted">
        <div className="site-shell contact-form-layout">
          {/* Left: reasons */}
          <aside className="contact-reasons">
            <h3>Como podemos ajudar?</h3>
            <p>
              Seja para dúvidas técnicas, comerciais ou de produto, temos a pessoa certa para responder.
            </p>
            <ul className="contact-reasons__list">
              {reasons.map((r) => (
                <li key={r.label}>
                  <span className="material-symbols-outlined" aria-hidden="true">
                    {r.icon}
                  </span>
                  {r.label}
                </li>
              ))}
            </ul>

            <div className="contact-reasons__note">
              <span className="material-symbols-outlined" aria-hidden="true">schedule</span>
              <p>Normalmente respondemos em menos de 1 dia útil.</p>
            </div>
          </aside>

          {/* Right: form */}
          <form className="panel form-card contact-form" onSubmit={handleSubmit}>
            <h3>Envie uma mensagem</h3>

            <div className="contact-form__row">
              <label className="field">
                <span>Nome *</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Seu nome completo"
                />
              </label>
              <label className="field">
                <span>E-mail *</span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="seu@email.com"
                />
              </label>
            </div>

            <div className="contact-form__row">
              <label className="field">
                <span>Empresa</span>
                <input
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Nome da empresa (opcional)"
                />
              </label>
              <label className="field">
                <span>Assunto</span>
                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Ex: Parceria comercial"
                />
              </label>
            </div>

            <label className="field">
              <span>Mensagem *</span>
              <textarea
                name="message"
                rows="5"
                value={form.message}
                onChange={handleChange}
                required
                placeholder="Descreva como podemos ajudar..."
              />
            </label>

            <div className="contact-form__footer">
              <button type="submit" className="button button--primary contact-form__submit">
                <span className="material-symbols-outlined" aria-hidden="true">send</span>
                Enviar mensagem
              </button>
              {status ? <div className="notice">{status}</div> : null}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
