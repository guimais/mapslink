import { Link } from "react-router-dom";
import { CompassIcon } from "../components/Icons";
import { SectionHeading } from "../components/SectionHeading";
import { usePlatform } from "../context/PlatformContext";

const highlights = [
  {
    title: "Mapa vivo de contratacao",
    text: "Visualize empresas por regiao, area e modelo de trabalho em um unico painel.",
  },
  {
    title: "Fluxo para candidatos e empresas",
    text: "Uma experiencia pensada para quem busca vaga e para quem precisa contratar com contexto.",
  },
  {
    title: "Painel orientado a acao",
    text: "Acompanhe vagas, candidaturas, agenda e sinais de mercado de forma mais clara.",
  },
];

export function HomePage() {
  const { companies, jobs } = usePlatform();
  const featuredCompanies = companies.slice(0, 3);

  return (
    <main>
      <section className="hero-panel">
        <div className="site-shell hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">MapsLink</span>
            <h1>Encontre oportunidades perto de voce com contexto de verdade.</h1>
            <p>
              Uma plataforma para descobrir empresas, vagas e movimentos do mercado
              a partir do territorio, mantendo a experiencia clara para candidatos e empresas.
            </p>
            <div className="hero-actions">
              <Link className="button button--primary" to="/mapa">
                Explorar mapa
              </Link>
              <Link className="button button--ghost" to="/perfil">
                Escolher perfil
              </Link>
            </div>
            <div className="hero-metrics">
              <div>
                <strong>{companies.length}</strong>
                <span>empresas mapeadas</span>
              </div>
              <div>
                <strong>{jobs.length}</strong>
                <span>vagas visiveis</span>
              </div>
              <div>
                <strong>3 fluxos</strong>
                <span>candidato, empresa e mapa</span>
              </div>
            </div>
          </div>

          <div className="hero-stage">
            <div className="hero-stage__card hero-stage__card--map">
              <div className="hero-stage__topline">
                <span>Campinas, SP</span>
                <span>tempo real</span>
              </div>
              <div className="hero-stage__radar">
                <div className="hero-stage__pulse" />
                <div className="hero-stage__pulse hero-stage__pulse--mid" />
                <div className="hero-stage__pulse hero-stage__pulse--outer" />
                {featuredCompanies.map((company, index) => (
                  <button
                    key={company.id}
                    type="button"
                    className={`hero-stage__pin hero-stage__pin--${index + 1}`}
                  >
                    {company.name.slice(0, 2).toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="hero-stage__legend">
                {featuredCompanies.map((company) => (
                  <div key={company.id}>
                    <strong>{company.name}</strong>
                    <span>{company.headline}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Produto"
            title="Mantivemos a ideia central, mas com uma estrutura nova."
            description="O projeto agora nasce em React + Vite de verdade, com uma linguagem visual mais forte e uma navegacao mais coesa."
          />
          <div className="feature-grid">
            {highlights.map((item) => (
              <article className="feature-card" key={item.title}>
                <span className="feature-card__icon" aria-hidden="true">
                  <CompassIcon />
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="site-shell spotlight-grid">
          <div>
            <SectionHeading
              eyebrow="Empresas em destaque"
              title="Times que estao contratando com sinais claros de onde e como trabalham."
            />
          </div>
          <div className="spotlight-list">
            {featuredCompanies.map((company) => (
              <article className="spotlight-card" key={company.id}>
                <div className="brand-chip">{company.name.slice(0, 2).toUpperCase()}</div>
                <div>
                  <h3>{company.name}</h3>
                  <p>{company.headline}</p>
                </div>
                <div className="meta-pills">
                  <span>{company.city}</span>
                  <span>{company.jobs.length} vagas</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
