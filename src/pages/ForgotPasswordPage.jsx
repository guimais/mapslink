import { useState } from "react";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setStatus(`Se existir uma conta para ${email}, enviaremos o link de recuperacao.`);
    setEmail("");
  }

  return (
    <main className="section auth-section">
      <div className="site-shell auth-grid">
        <div className="auth-copy">
          <span className="eyebrow">Recuperacao</span>
          <h1>Recupere o acesso sem sair do novo fluxo.</h1>
        </div>

        <form className="panel auth-card" onSubmit={handleSubmit}>
          <label className="field">
            <span>E-mail</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <button type="submit" className="button button--primary">
            Enviar link
          </button>
          {status ? <div className="notice">{status}</div> : null}
        </form>
      </div>
    </main>
  );
}
