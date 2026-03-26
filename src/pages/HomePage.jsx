import { Link, useNavigate } from "react-router-dom";
import { CompassIcon } from "../components/Icons";
import { SectionHeading } from "../components/SectionHeading";
import Hero from "../components/ui/animated-shader-hero";
import { CircularTestimonials } from "../components/ui/circular-testimonials";
import { usePlatform } from "../context/PlatformContext";

const highlights = [
  {
    title: "Mapa vivo de contratação",
    text: "Visualize empresas por região, área e modelo de trabalho em um único painel.",
  },
  {
    title: "Fluxo para candidatos e empresas",
    text: "Uma experiência pensada para quem busca vaga e para quem precisa contratar com contexto.",
  },
  {
    title: "Painel orientado à ação",
    text: "Acompanhe vagas, candidaturas, agenda e sinais de mercado de forma mais clara.",
  },
];

const timelineItems = [
  { icon: "map", label: "Mapa" },
  { icon: "history", label: "Timeline", active: true },
  { icon: "star", label: "Favoritos" },
  { icon: "timeline", label: "Métricas" },
  { icon: "download", label: "Offline" },
];

const companyGallery = [
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1400&auto=format&fit=crop",
];

export function HomePage() {
  const navigate = useNavigate();
  const { companies, jobs } = usePlatform();
  const featuredCompanies = companies.slice(0, 3);
  const featuredJobs = jobs.slice(0, 3);

  const featuredTestimonials = featuredCompanies.map((company, index) => ({
    quote:
      company.description ||
      "Time com operação clara, stack definida e contexto suficiente para uma decisão melhor.",
    name: company.name,
    designation: `${company.city} - ${company.jobs.length} vaga${company.jobs.length === 1 ? "" : "s"}`,
    src: companyGallery[index % companyGallery.length],
  }));

  return (
    <main className="home-v2">
      <Hero
        className="home-v2__shader-hero"
        headline={{
          line1: "Conecte talentos",
          line2: "com empresas certas.",
        }}
        subtitle="No MapsLink, você encontra vagas por localização, modelo de trabalho e stack em um fluxo único para candidatos e empresas."
        buttons={{
          primary: {
            text: "Explorar mapa",
            onClick: () => navigate("/mapa"),
          },
          secondary: {
            text: "Ver vagas",
            onClick: () => navigate("/vagas"),
          },
        }}
      />

      <section className="section home-v2__product home-v2__showcase-band">
        <div className="site-shell">
          <SectionHeading
            eyebrow="Produto"
            title="Mantivemos a ideia central, mas com uma estrutura nova."
            description="O projeto agora nasce em React + Vite de verdade, com uma linguagem visual mais forte e uma navegação mais coesa."
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

      <section className="section home-v2__insights home-v2__showcase-band">
        <div className="site-shell home-v2__insights-grid">
          <article className="home-v2__insight-card home-v2__insight-card--wide">
            <div className="home-v2__insight-head">
              <div>
                <small>Taxa de sucesso</small>
                <h3>99.4%</h3>
              </div>
              <span className="material-symbols-outlined" aria-hidden="true">
                trending_up
              </span>
            </div>
            <p>
              Correspondência entre perfis e oportunidades com base em localização,
              senioridade e aderência de stack.
            </p>
            <div className="home-v2__meter">
              <div />
            </div>
          </article>

          <article className="home-v2__insight-card home-v2__insight-card--dark">
            <span className="material-symbols-outlined" aria-hidden="true">
              rocket_launch
            </span>
            <h3>Engine de matching orientado a território</h3>
            <p>
              Construa shortlist com dados de mobilidade, modelo de trabalho
              e sinais do mercado em tempo real.
            </p>
          </article>
        </div>
      </section>

      <section className="section home-v2__spotlight-band">
        <div className="site-shell spotlight-grid spotlight-grid--testimonials">
          <div>
            <SectionHeading
              eyebrow="Empresas em destaque"
              title="Times que estão contratando com sinais claros de onde e como trabalham."
              description="No radar MapsLink, você enxerga contexto real de atuação, localização e volume de vagas para decidir com mais segurança onde investir sua próxima candidatura."
            />
          </div>
          <div className="spotlight-carousel-wrap">
            <CircularTestimonials
              testimonials={featuredTestimonials}
              autoplay={true}
              colors={{
                name: "#f2f6ff",
                designation: "#c9d6f7",
                testimony: "#dde7ff",
                arrowBackground: "#102569",
                arrowForeground: "#f7fafe",
                arrowHoverBackground: "#2b4da6",
              }}
              fontSizes={{
                name: "2rem",
                designation: "1rem",
                quote: "1.04rem",
              }}
            />
          </div>
        </div>
      </section>

      <section className="section home-v2__timeline">
        <div className="site-shell">
          <div className="home-v2__timeline-head">
            <div>
              <span className="eyebrow">Timeline</span>
              <h2>Seu histórico e próximos movimentos em um painel único.</h2>
            </div>
            <Link className="button button--primary" to="/vagas">
              Ver vagas recentes
            </Link>
          </div>

          <div className="home-v2__timeline-actions">
            {timelineItems.map((item) => (
              <article
                key={item.label}
                className={`home-v2__timeline-item ${item.active ? "is-active" : ""}`}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  {item.icon}
                </span>
                <strong>{item.label}</strong>
              </article>
            ))}
          </div>

          <div className="home-v2__job-list">
            {featuredJobs.map((job) => (
              <article className="home-v2__job-card" key={job.id}>
                <div>
                  <h3>{job.title}</h3>
                  <p>{job.companyName}</p>
                </div>
                <div className="meta-pills">
                  <span>{job.city}</span>
                  <span>{job.mode}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

