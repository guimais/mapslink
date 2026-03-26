import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-shell footer-shell">
        <section className="footer-cta">
          <div className="footer-cta__copy">
            <span className="footer-kicker">MapsLink</span>
            <h2>Um fluxo mais claro para mapear oportunidades e recrutamento.</h2>
            <p>
              Explore empresas, compare vagas e concentre a operacao em uma experiencia
              mais leve, direta e moderna.
            </p>
          </div>
          <div className="footer-cta__actions">
            <Link className="button button--primary" to="/mapa">
              Explorar mapa
            </Link>
            <Link className="button button--ghost" to="/perfil">
              Entrar na plataforma
            </Link>
          </div>
        </section>

        <div className="footer-main">
          <div className="footer-brand">
            <strong>MapsLink</strong>
            <p>
              Plataforma para conectar candidatos e empresas por meio de contexto
              geografico, leitura clara de vagas e uma navegacao mais objetiva.
            </p>
            <div className="footer-meta">
              <span>Campinas, SP</span>
              <a href="mailto:contato@mapslink.com">contato@mapslink.com</a>
            </div>
          </div>

          <div className="footer-column">
            <h3>Plataforma</h3>
            <div className="footer-links">
              <Link to="/mapa">Mapa de oportunidades</Link>
              <Link to="/vagas">Painel de vagas</Link>
              <Link to="/planos">Planos</Link>
            </div>
          </div>

          <div className="footer-column">
            <h3>Fluxos</h3>
            <div className="footer-links">
              <Link to="/login/candidato">Area do candidato</Link>
              <Link to="/login/empresa">Area da empresa</Link>
              <Link to="/sobre">Sobre o projeto</Link>
            </div>
          </div>

          <div className="footer-column">
            <h3>Contato</h3>
            <div className="footer-links">
              <Link to="/contato">Falar com a equipe</Link>
              <a href="tel:+5519997405660">+55 19 99740-5660</a>
              <span>Produto, pilotos e parcerias</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>MapsLink</span>
          <span>React + Vite</span>
          <span>Mapa, vagas e dashboards em uma unica base</span>
        </div>
      </div>
    </footer>
  );
}
