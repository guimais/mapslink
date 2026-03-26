import { Link } from "react-router-dom";
import { SectionHeading } from "../components/SectionHeading";
import { GlobeInteractive } from "../components/ui/cobe-globe-interactive";

const stats = [
  { value: "12+", label: "Cidades mapeadas" },
  { value: "500+", label: "Vagas ativas" },
  { value: "200+", label: "Empresas cadastradas" },
  { value: "98%", label: "Taxa de satisfacao" },
];

const values = [
  {
    icon: "map",
    title: "Contexto geografico",
    text: "O mapa e o elemento central da experiencia, nao uma funcionalidade secundaria. Localizacao importa na decisao de carreira.",
  },
  {
    icon: "handshake",
    title: "Conexao direta",
    text: "Reduzimos a distancia entre candidato e empresa. Sem intermediarios desnecessarios, sem interfaces confusas.",
  },
  {
    icon: "visibility",
    title: "Transparencia",
    text: "Cada vaga mostra modelo de trabalho, stack e contexto real da operacao. Informacao clara para decisoes melhores.",
  },
  {
    icon: "trending_up",
    title: "Orientacao a acao",
    text: "Painel pensado para quem precisa agir: candidatos buscando vagas e empresas construindo times com criterio.",
  },
];

const globeMarkers = [
  { id: "campinas", location: [-22.9056, -47.0608], name: "Campinas", users: 1280 },
  { id: "saopaulo", location: [-23.5614, -46.6558], name: "Sao Paulo", users: 2430 },
  { id: "rio", location: [-22.9068, -43.1729], name: "Rio", users: 980 },
  { id: "eu", location: [52.52, 13.41], name: "Europa", users: 620 },
];

export function AboutPage() {
  return (
    <main>
      <section className="section about-hero">
        <div className="site-shell about-hero__inner">
          <div className="about-hero__text">
            <span className="eyebrow">Sobre o MapsLink</span>
            <h1 className="about-hero__title">Mapear oportunidades com mais criterio.</h1>
            <p className="about-hero__lead">
              Nao somos mais um quadro de vagas. Somos uma leitura visual do mercado de trabalho, onde localizacao, contexto e qualidade da informacao definem a experiencia.
            </p>
            <div className="about-hero__actions">
              <Link className="button button--primary" to="/vagas">
                Explorar vagas
              </Link>
              <Link className="button button--ghost" to="/contato">
                Fale conosco
              </Link>
            </div>
          </div>

          <div className="about-hero__visual" aria-hidden="true">
            <GlobeInteractive className="about-hero__globe-solo" markers={globeMarkers} speed={0.0024} />
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="site-shell">
          <div className="metric-grid metric-grid--four">
            {stats.map((item) => (
              <article className="panel metric-card about-stat-card" key={item.label}>
                <strong className="about-stat-card__value">{item.value}</strong>
                <span className="about-stat-card__label">{item.label}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-shell about-mission">
          <div className="about-mission__head">
            <SectionHeading
              eyebrow="Nossa missao"
              title="Aproximar talento e empresa com contexto real."
              description="Queremos reduzir a distancia entre a busca por emprego e o entendimento real do ecossistema ao redor."
            />
          </div>
          <div className="about-mission__body">
            <p>
              O MapsLink nasce da percepcao de que o mercado de trabalho tem dados, mas falta contexto. Uma vaga sem localizacao, sem informacao sobre modelo de trabalho ou sem clareza sobre o time nao ajuda quem precisa decidir.
            </p>
            <p>
              Construimos uma plataforma onde candidatos enxergam o mercado como ele e: geograficamente distribuido, com culturas distintas e ritmos diferentes. E onde empresas encontram quem realmente faz sentido para o seu territorio.
            </p>
            <div className="about-mission__quote">
              <blockquote>"O mapa deixa de ser decorativo e vira o elemento central da experiencia."</blockquote>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--muted">
        <div className="site-shell">
          <SectionHeading eyebrow="Nossos valores" title="O que guia cada decisao de produto." align="center" />
          <div className="feature-grid about-values-grid">
            {values.map((value) => (
              <article className="feature-card" key={value.title}>
                <span
                  className="feature-card__icon material-symbols-outlined"
                  aria-hidden="true"
                  style={{ fontSize: "1.4rem" }}
                >
                  {value.icon}
                </span>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-shell">
          <div className="panel about-cta-card">
            <div className="about-cta-card__text">
              <span className="eyebrow">Junte-se a nos</span>
              <h2>Esta construindo algo no mercado de trabalho?</h2>
              <p>
                Queremos conversar com empresas inovadoras, parceiros de produto e candidatos que buscam mais transparencia no processo seletivo.
              </p>
            </div>
            <div className="about-cta-card__actions">
              <Link className="button button--primary" to="/contato">
                Entrar em contato
              </Link>
              <Link className="button button--ghost" to="/mapa">
                Ver o mapa
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
