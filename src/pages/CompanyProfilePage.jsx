import { Link, useParams } from "react-router-dom";
import { usePlatform } from "../context/PlatformContext";

export function CompanyProfilePage() {
  const { slug } = useParams();
  const { companies } = usePlatform();
  const company = companies.find((item) => item.slug === slug);

  if (!company) {
    return (
      <main className="section">
        <div className="site-shell">
          <div className="panel">
            <h1>Empresa não encontrada.</h1>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* Hero */}
      <section className="co-profile-hero">
        <div className="site-shell co-profile-hero__inner">
          <div className="co-profile-hero__left">
            <div className="brand-chip brand-chip--lg" aria-hidden="true">
              {company.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="co-profile-hero__name-row">
                <h1 className="co-profile-hero__name">{company.name}</h1>
                {company.hiring && (
                  <span className="co-profile-hero__hiring">
                    <span className="material-symbols-outlined" aria-hidden="true">check_circle</span>
                    Contratando
                  </span>
                )}
              </div>
              <p className="co-profile-hero__headline">{company.headline}</p>
              <div className="co-profile-hero__chips">
                <span>
                  <span className="material-symbols-outlined" aria-hidden="true">category</span>
                  {company.sector}
                </span>
                <span>
                  <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
                  {company.city}, {company.state}
                </span>
                <span>
                  <span className="material-symbols-outlined" aria-hidden="true">group</span>
                  {company.size}
                </span>
                <span>
                  <span className="material-symbols-outlined" aria-hidden="true">calendar_today</span>
                  Desde {company.founded}
                </span>
              </div>
            </div>
          </div>

          <div className="co-profile-hero__actions">
            <a
              className="button button--primary"
              href={company.website}
              target="_blank"
              rel="noreferrer"
            >
              <span className="material-symbols-outlined" aria-hidden="true">open_in_new</span>
              Visitar site
            </a>
            <Link className="button button--ghost" to="/mapa">
              Ver no mapa
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="section section--muted">
        <div className="site-shell">
          <div className="metric-grid metric-grid--four">
            <article className="panel co-profile-stat">
              <strong>{company.jobs.length}</strong>
              <span>vagas abertas</span>
            </article>
            <article className="panel co-profile-stat">
              <strong>{company.workModes.join(" / ")}</strong>
              <span>modelo de trabalho</span>
            </article>
            <article className="panel co-profile-stat">
              <strong>{company.founded}</strong>
              <span>fundação</span>
            </article>
            <article className="panel co-profile-stat">
              <strong>{company.size}</strong>
              <span>porte</span>
            </article>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="section">
        <div className="site-shell co-profile-body">
          {/* About */}
          <div className="panel co-profile-about">
            <h2 className="co-profile-section-title">
              <span className="material-symbols-outlined" aria-hidden="true">info</span>
              Sobre a empresa
            </h2>
            <p className="co-profile-about__desc">{company.description}</p>

            <div className="co-profile-about__address">
              <span className="material-symbols-outlined" aria-hidden="true">place</span>
              {company.address}
            </div>

            <div className="co-profile-about__tags">
              <h3>Tecnologias e temas</h3>
              <div className="co-profile-tags">
                {company.tags.map((tag) => (
                  <span key={tag} className="co-profile-tag">{tag}</span>
                ))}
              </div>
            </div>

            <div className="co-profile-about__modes">
              <h3>Modelos de trabalho</h3>
              <div className="meta-pills">
                {company.workModes.map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Jobs */}
          <div className="co-profile-jobs">
            <h2 className="co-profile-section-title co-profile-jobs__title">
              <span className="material-symbols-outlined" aria-hidden="true">work</span>
              Vagas abertas
              <span className="co-profile-jobs__count">{company.jobs.length}</span>
            </h2>

            {company.jobs.length ? (
              <div className="co-profile-jobs__list">
                {company.jobs.map((job) => (
                  <article className="panel co-profile-job-card" key={job.id}>
                    <div className="co-profile-job-card__top">
                      <span className="job-badge">{job.mode}</span>
                      <span className="job-badge job-badge--soft">{job.type}</span>
                    </div>
                    <h3>{job.title}</h3>
                    <p>{job.summary}</p>
                    <div className="co-profile-job-card__meta">
                      <span className="material-symbols-outlined" aria-hidden="true">bar_chart</span>
                      {job.level}
                      <span className="co-profile-job-card__sep" aria-hidden="true">·</span>
                      <span className="material-symbols-outlined" aria-hidden="true">payments</span>
                      {job.salary}
                    </div>
                    <div className="meta-pills co-profile-job-card__skills">
                      {job.skills.map((s) => (
                        <span key={s}>{s}</span>
                      ))}
                    </div>
                    <div className="co-profile-job-card__footer">
                      <Link className="button button--primary" to="/vagas">
                        Candidatar-se
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="panel co-profile-empty">
                <span className="material-symbols-outlined co-profile-empty__icon" aria-hidden="true">
                  search_off
                </span>
                <p>Sem vagas abertas no momento. Esta empresa está no radar para futuras oportunidades.</p>
                <Link className="button button--ghost" to="/vagas">
                  Ver outras vagas
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
