import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePlatform } from "../context/PlatformContext";

function getStatusClass(status = "") {
  const s = status.toLowerCase();
  if (s.includes("agendada") || s.includes("aprovad")) return "job-badge--success";
  if (s.includes("recusad") || s.includes("encerrad")) return "job-badge--danger";
  return "job-badge--soft";
}

export function CandidateWorkspacePage() {
  const { currentUser, updateCurrentUser } = useAuth();
  const { companies, applications, jobs } = usePlatform();
  const [saveStatus, setSaveStatus] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({
    headline: currentUser.profile.headline,
    location: currentUser.profile.location,
    availability: currentUser.profile.availability,
    bio: currentUser.profile.bio,
  });

  const myApplications = applications
    .filter((a) => a.candidateId === currentUser.id)
    .map((a) => ({ ...a, job: jobs.find((j) => j.id === a.jobId) }));

  const recommendedCompanies = companies.filter((c) =>
    c.tags.some((tag) => currentUser.profile.skills.includes(tag)),
  );

  function handleSubmit(e) {
    e.preventDefault();
    updateCurrentUser({ profile: { ...currentUser.profile, ...form } });
    setSaveStatus("Perfil atualizado com sucesso.");
    setEditOpen(false);
  }

  const completion = currentUser.profile.completion;

  return (
    <main>
      {/* Hero */}
      <section className="cand-hero">
        <div className="site-shell cand-hero__inner">
          <div className="cand-hero__left">
            <div className="cand-hero__avatar-wrap">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="cand-hero__avatar"
                width="96"
                height="96"
                loading="lazy"
              />
              <span className="cand-hero__online" aria-hidden="true" />
            </div>
            <div className="cand-hero__info">
              <div className="cand-hero__name-row">
                <h1 className="cand-hero__name">{currentUser.name}</h1>
                {currentUser.profile.availability && (
                  <span className="cand-hero__avail">
                    <span className="material-symbols-outlined" aria-hidden="true">schedule</span>
                    {currentUser.profile.availability}
                  </span>
                )}
              </div>
              <p className="cand-hero__headline">{currentUser.profile.headline}</p>
              <div className="cand-hero__meta">
                <span>
                  <span className="material-symbols-outlined" aria-hidden="true">work</span>
                  {currentUser.profile.specialty}
                </span>
                <span>
                  <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
                  {currentUser.profile.location}
                </span>
                <span>
                  <span className="material-symbols-outlined" aria-hidden="true">history</span>
                  {currentUser.profile.experience}
                </span>
              </div>
            </div>
          </div>

          <div className="cand-hero__right">
            <div className="cand-hero__stats">
              <div className="cand-hero__stat">
                <strong>{myApplications.length}</strong>
                <span>candidaturas</span>
              </div>
              <div className="cand-hero__stat">
                <strong>{currentUser.profile.interviewsToday}</strong>
                <span>entrevistas hoje</span>
              </div>
              <div className="cand-hero__stat">
                <strong>{completion}%</strong>
                <span>perfil completo</span>
              </div>
            </div>
            <div className="cand-hero__progress" title={`${completion}% completo`}>
              <div className="cand-hero__progress-bar" style={{ width: `${completion}%` }} />
            </div>
            <button
              type="button"
              className="button button--ghost cand-hero__edit-btn"
              onClick={() => setEditOpen((v) => !v)}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                {editOpen ? "close" : "edit"}
              </span>
              {editOpen ? "Fechar edição" : "Editar perfil"}
            </button>
          </div>
        </div>
      </section>

      {/* Edit panel */}
      {editOpen && (
        <section className="section section--muted">
          <div className="site-shell">
            <div className="panel cand-edit-panel">
              <h2 className="cand-edit-panel__title">Editar perfil</h2>
              <form className="cand-edit-form" onSubmit={handleSubmit}>
                <div className="cand-edit-form__row">
                  <label className="field">
                    <span>Headline</span>
                    <input
                      value={form.headline}
                      onChange={(e) => setForm((c) => ({ ...c, headline: e.target.value }))}
                    />
                  </label>
                  <label className="field">
                    <span>Localização</span>
                    <input
                      value={form.location}
                      onChange={(e) => setForm((c) => ({ ...c, location: e.target.value }))}
                    />
                  </label>
                </div>
                <label className="field">
                  <span>Disponibilidade</span>
                  <input
                    value={form.availability}
                    onChange={(e) => setForm((c) => ({ ...c, availability: e.target.value }))}
                  />
                </label>
                <label className="field">
                  <span>Bio</span>
                  <textarea
                    rows="4"
                    value={form.bio}
                    onChange={(e) => setForm((c) => ({ ...c, bio: e.target.value }))}
                  />
                </label>
                <div className="cand-edit-form__footer">
                  <button type="submit" className="button button--primary">
                    <span className="material-symbols-outlined" aria-hidden="true">save</span>
                    Salvar alterações
                  </button>
                  {saveStatus && <div className="notice">{saveStatus}</div>}
                </div>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* Body */}
      <section className="section">
        <div className="site-shell cand-body-grid">
          {/* About card */}
          <div className="panel cand-about-card">
            <h2 className="cand-section-title">
              <span className="material-symbols-outlined" aria-hidden="true">person</span>
              Sobre
            </h2>
            <p className="cand-about-card__bio">{currentUser.profile.bio}</p>

            <div className="cand-about-card__block">
              <h3>Skills</h3>
              <div className="cand-skills-pills">
                {currentUser.profile.skills.map((skill) => (
                  <span key={skill} className="cand-skill-pill">{skill}</span>
                ))}
              </div>
            </div>

            <div className="cand-about-card__block cand-about-card__modes">
              <h3>Modelos desejados</h3>
              <div className="meta-pills">
                {(currentUser.profile.desiredModes ?? []).map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="cand-side">
            <section className="panel cand-applications-card">
              <h2 className="cand-section-title">
                <span className="material-symbols-outlined" aria-hidden="true">send</span>
                Minhas candidaturas
                {myApplications.length > 0 && (
                  <span className="cand-section-count">{myApplications.length}</span>
                )}
              </h2>
              {myApplications.length ? (
                <div className="cand-applications-list">
                  {myApplications.map((a) => (
                    <article className="cand-application-item" key={a.id}>
                      <div className="cand-application-item__info">
                        <strong>{a.job?.title ?? "Vaga"}</strong>
                        <span>{a.job?.companyName ?? "Empresa"}</span>
                      </div>
                      <span className={`job-badge ${getStatusClass(a.status)}`}>{a.status}</span>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="cand-empty">
                  Nenhuma candidatura ainda.{" "}
                  <Link to="/vagas">Explorar vagas →</Link>
                </p>
              )}
            </section>

            <section className="panel cand-radar-card">
              <h2 className="cand-section-title">
                <span className="material-symbols-outlined" aria-hidden="true">radar</span>
                Radar de empresas
              </h2>
              <div className="cand-radar-list">
                {recommendedCompanies.slice(0, 4).map((company) => (
                  <article className="cand-radar-item" key={company.id}>
                    <div className="brand-chip brand-chip--sm">
                      {company.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="cand-radar-item__info">
                      <strong>{company.name}</strong>
                      <span>{company.city} · {company.sector}</span>
                    </div>
                    <Link className="button button--ghost" to={`/empresa/${company.slug}`}>
                      Ver
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
