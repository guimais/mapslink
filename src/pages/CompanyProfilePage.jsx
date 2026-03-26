import { useParams } from "react-router-dom";
import { SectionHeading } from "../components/SectionHeading";
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
            <h1>Empresa nao encontrada.</h1>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="site-shell company-profile">
        <SectionHeading
          eyebrow="Perfil da empresa"
          title={company.name}
          description={company.headline}
        />

        <div className="company-profile__grid">
          <section className="panel">
            <div className="meta-pills">
              <span>{company.sector}</span>
              <span>{company.city}, {company.state}</span>
              <span>{company.size}</span>
            </div>
            <p>{company.description}</p>
            <div className="meta-pills">
              {company.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <a className="button button--primary" href={company.website} target="_blank" rel="noreferrer">
              Visitar site
            </a>
          </section>

          <section className="panel">
            <h3>Vagas atuais</h3>
            <div className="stack-list">
              {company.jobs.length ? (
                company.jobs.map((job) => (
                  <article className="mini-card" key={job.id}>
                    <div>
                      <strong>{job.title}</strong>
                      <p>{job.summary}</p>
                    </div>
                    <span className="job-badge">{job.mode}</span>
                  </article>
                ))
              ) : (
                <p>Sem vagas abertas no momento.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
