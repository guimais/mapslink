import { useState } from "react";
import { Link } from "react-router-dom";
import { SectionHeading } from "../components/SectionHeading";
import { useAuth } from "../context/AuthContext";
import { usePlatform } from "../context/PlatformContext";

export function CandidateWorkspacePage() {
  const { currentUser, updateCurrentUser } = useAuth();
  const { companies, applications, jobs } = usePlatform();
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    headline: currentUser.profile.headline,
    location: currentUser.profile.location,
    availability: currentUser.profile.availability,
    bio: currentUser.profile.bio,
  });

  const myApplications = applications
    .filter((application) => application.candidateId === currentUser.id)
    .map((application) => ({
      ...application,
      job: jobs.find((job) => job.id === application.jobId),
    }));

  const recommendedCompanies = companies.filter((company) =>
    company.tags.some((tag) => currentUser.profile.skills.includes(tag)),
  );

  function handleSubmit(event) {
    event.preventDefault();
    updateCurrentUser({
      profile: {
        ...currentUser.profile,
        headline: form.headline,
        location: form.location,
        availability: form.availability,
        bio: form.bio,
      },
    });
    setStatus("Perfil atualizado com sucesso.");
  }

  return (
    <main className="section">
      <div className="site-shell workspace-stack">
        <SectionHeading
          eyebrow="Espaco do candidato"
          title={`Ola, ${currentUser.name.split(" ")[0]}.`}
          description="Seu perfil, radar de empresas e candidaturas agora vivem em uma unica aplicacao React."
        />

        <div className="workspace-grid">
          <section className="panel profile-summary">
            <div className="profile-summary__top">
              <img src={currentUser.avatar} alt={currentUser.name} width="76" height="76" loading="lazy" />
              <div>
                <h3>{currentUser.name}</h3>
                <p>{currentUser.profile.specialty}</p>
              </div>
            </div>
            <div className="metric-grid">
              <div>
                <strong>{currentUser.profile.completion}%</strong>
                <span>perfil completo</span>
              </div>
              <div>
                <strong>{myApplications.length}</strong>
                <span>candidaturas</span>
              </div>
              <div>
                <strong>{currentUser.profile.interviewsToday}</strong>
                <span>entrevistas hoje</span>
              </div>
            </div>
            <p>{currentUser.profile.headline}</p>
            <div className="meta-pills">
              {currentUser.profile.skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </section>

          <section className="panel">
            <h3>Editar perfil</h3>
            <form className="stack-form" onSubmit={handleSubmit}>
              <label className="field">
                <span>Headline</span>
                <input value={form.headline} onChange={(event) => setForm((current) => ({ ...current, headline: event.target.value }))} />
              </label>
              <label className="field">
                <span>Localizacao</span>
                <input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} />
              </label>
              <label className="field">
                <span>Disponibilidade</span>
                <input value={form.availability} onChange={(event) => setForm((current) => ({ ...current, availability: event.target.value }))} />
              </label>
              <label className="field">
                <span>Bio</span>
                <textarea rows="4" value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} />
              </label>
              <button type="submit" className="button button--primary">
                Salvar
              </button>
              {status ? <div className="notice">{status}</div> : null}
            </form>
          </section>
        </div>

        <div className="workspace-grid">
          <section className="panel">
            <h3>Radar de empresas</h3>
            <div className="stack-list">
              {recommendedCompanies.slice(0, 4).map((company) => (
                <article className="mini-card" key={company.id}>
                  <div className="brand-chip">{company.name.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <strong>{company.name}</strong>
                    <p>{company.headline}</p>
                  </div>
                  <Link className="button button--ghost" to={`/empresa/${company.slug}`}>
                    Ver empresa
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <h3>Minhas candidaturas</h3>
            <div className="stack-list">
              {myApplications.map((application) => (
                <article className="mini-card" key={application.id}>
                  <div>
                    <strong>{application.job?.title ?? "Vaga"}</strong>
                    <p>{application.job?.companyName ?? "Empresa"}</p>
                  </div>
                  <span className="job-badge">{application.status}</span>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
