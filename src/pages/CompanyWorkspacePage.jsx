import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { usePlatform } from "../context/PlatformContext";

export function CompanyWorkspacePage() {
  const { currentUser } = useAuth();
  const { companies, jobs, applications, agenda, updateCompanyProfile, createJob, toggleJobStatus } =
    usePlatform();

  const company = companies.find((c) => c.slug === currentUser.companySlug) ?? companies[0];
  const companyJobs = jobs.filter((j) => j.companySlug === company.slug);
  const companyApplications = applications.filter((a) =>
    companyJobs.some((j) => j.id === a.jobId),
  );
  const agendaItems = agenda.filter((i) => i.companySlug === company.slug);

  const [profileForm, setProfileForm] = useState({
    headline: company.headline,
    description: company.description,
    website: company.website,
  });
  const [jobForm, setJobForm] = useState({
    title: "",
    type: "CLT",
    mode: "Híbrido",
    level: "Pleno",
    salary: "",
    summary: "",
    skills: "",
  });
  const [status, setStatus] = useState("");
  const [activeTab, setActiveTab] = useState("jobs");

  function handleProfileSubmit(e) {
    e.preventDefault();
    updateCompanyProfile(company.slug, profileForm);
    setStatus("Perfil da empresa atualizado.");
  }

  function handleJobSubmit(e) {
    e.preventDefault();
    createJob(company.slug, jobForm);
    setStatus("Nova vaga criada com sucesso.");
    setJobForm({ title: "", type: "CLT", mode: "Híbrido", level: "Pleno", salary: "", summary: "", skills: "" });
    setActiveTab("jobs");
  }

  return (
    <main>
      {/* Company header */}
      <section className="co-workspace-hero">
        <div className="site-shell co-workspace-hero__inner">
          <div className="co-workspace-hero__identity">
            <div className="brand-chip brand-chip--lg" aria-hidden="true">
              {company.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="co-workspace-hero__title-row">
                <h1 className="co-workspace-hero__name">{company.name}</h1>
                {company.hiring && (
                  <span className="co-workspace-hero__hiring">
                    <span className="material-symbols-outlined" aria-hidden="true">radio_button_checked</span>
                    Contratando
                  </span>
                )}
              </div>
              <p className="co-workspace-hero__role">
                {currentUser.name}
                {currentUser.profile?.role && (
                  <> · <span>{currentUser.profile.role}</span></>
                )}
              </p>
              <div className="co-workspace-hero__chips">
                <span>
                  <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
                  {company.city}, {company.state}
                </span>
                <span>
                  <span className="material-symbols-outlined" aria-hidden="true">work</span>
                  {company.workModes.join(" / ")}
                </span>
                <span>
                  <span className="material-symbols-outlined" aria-hidden="true">category</span>
                  {company.sector}
                </span>
              </div>
            </div>
          </div>

          <div className="co-workspace-hero__kpis">
            <div className="co-workspace-kpi">
              <strong>{companyJobs.length}</strong>
              <span>vagas no ar</span>
            </div>
            <div className="co-workspace-kpi">
              <strong>{companyApplications.length}</strong>
              <span>candidaturas</span>
            </div>
            <div className="co-workspace-kpi">
              <strong>{agendaItems.length}</strong>
              <span>eventos</span>
            </div>
          </div>
        </div>
      </section>

      {/* Status notice */}
      {status && (
        <div className="site-shell" style={{ padding: "1rem 0" }}>
          <div className="notice">{status}</div>
        </div>
      )}

      {/* Main */}
      <section className="section">
        <div className="site-shell co-workspace-layout">
          {/* Left: tabs */}
          <div className="co-workspace-main">
            <nav className="co-workspace-tabs" aria-label="Seções do painel">
              {[
                { id: "jobs", icon: "work", label: "Vagas ativas" },
                { id: "new-job", icon: "add_circle", label: "Nova vaga" },
                { id: "profile", icon: "business", label: "Perfil" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`co-workspace-tab ${activeTab === tab.id ? "is-active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Vagas ativas */}
            {activeTab === "jobs" && (
              <div className="panel co-workspace-panel">
                <div className="co-workspace-panel__header">
                  <h2>Vagas ativas</h2>
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={() => setActiveTab("new-job")}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">add</span>
                    Nova vaga
                  </button>
                </div>
                {companyJobs.length ? (
                  <div className="co-workspace-jobs-list">
                    {companyJobs.map((job) => (
                      <article className="co-workspace-job-item" key={job.id}>
                        <div className="co-workspace-job-item__header">
                          <div>
                            <h3>{job.title}</h3>
                            <div className="meta-pills">
                              <span>{job.mode}</span>
                              <span>{job.type}</span>
                              <span>{job.level}</span>
                            </div>
                          </div>
                          <div className="co-workspace-job-item__right">
                            <strong className="co-workspace-job-item__salary">{job.salary}</strong>
                            <span className={`job-badge ${job.status === "Pausada" ? "job-badge--soft" : ""}`}>
                              {job.status ?? "Ativa"}
                            </span>
                          </div>
                        </div>
                        {job.summary && (
                          <p className="co-workspace-job-item__summary">{job.summary}</p>
                        )}
                        <div className="co-workspace-job-item__footer">
                          <div className="meta-pills">
                            {(Array.isArray(job.skills)
                              ? job.skills
                              : (job.skills ?? "").split(",")
                            ).map((s) => (
                              <span key={s}>{s.trim()}</span>
                            ))}
                          </div>
                          <button
                            type="button"
                            className="button button--ghost"
                            onClick={() => toggleJobStatus(company.slug, job.id)}
                          >
                            {job.status === "Pausada" ? "Reabrir" : "Pausar"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="co-workspace-empty">Nenhuma vaga publicada ainda.</p>
                )}
              </div>
            )}

            {/* Nova vaga */}
            {activeTab === "new-job" && (
              <div className="panel co-workspace-panel">
                <h2>Criar nova vaga</h2>
                <form className="co-workspace-form" onSubmit={handleJobSubmit}>
                  <label className="field">
                    <span>Título da vaga *</span>
                    <input
                      value={jobForm.title}
                      onChange={(e) => setJobForm((c) => ({ ...c, title: e.target.value }))}
                      placeholder="Ex: Desenvolvedor Full Stack"
                      required
                    />
                  </label>
                  <div className="co-workspace-form__row">
                    <label className="field">
                      <span>Tipo</span>
                      <select
                        value={jobForm.type}
                        onChange={(e) => setJobForm((c) => ({ ...c, type: e.target.value }))}
                      >
                        <option>CLT</option>
                        <option>PJ</option>
                        <option>Estágio</option>
                      </select>
                    </label>
                    <label className="field">
                      <span>Modelo</span>
                      <select
                        value={jobForm.mode}
                        onChange={(e) => setJobForm((c) => ({ ...c, mode: e.target.value }))}
                      >
                        <option>Híbrido</option>
                        <option>Remoto</option>
                        <option>Presencial</option>
                      </select>
                    </label>
                    <label className="field">
                      <span>Nível</span>
                      <select
                        value={jobForm.level}
                        onChange={(e) => setJobForm((c) => ({ ...c, level: e.target.value }))}
                      >
                        <option>Júnior</option>
                        <option>Pleno</option>
                        <option>Sênior</option>
                      </select>
                    </label>
                  </div>
                  <label className="field">
                    <span>Faixa salarial *</span>
                    <input
                      value={jobForm.salary}
                      onChange={(e) => setJobForm((c) => ({ ...c, salary: e.target.value }))}
                      placeholder="Ex: R$ 6k – R$ 9k"
                      required
                    />
                  </label>
                  <label className="field">
                    <span>Resumo *</span>
                    <textarea
                      rows="4"
                      value={jobForm.summary}
                      onChange={(e) => setJobForm((c) => ({ ...c, summary: e.target.value }))}
                      placeholder="Descreva a vaga em poucas frases..."
                      required
                    />
                  </label>
                  <label className="field">
                    <span>Skills (separadas por vírgula) *</span>
                    <input
                      value={jobForm.skills}
                      onChange={(e) => setJobForm((c) => ({ ...c, skills: e.target.value }))}
                      placeholder="React, Python, SQL"
                      required
                    />
                  </label>
                  <div className="co-workspace-form__footer">
                    <button type="submit" className="button button--primary">
                      <span className="material-symbols-outlined" aria-hidden="true">publish</span>
                      Publicar vaga
                    </button>
                    <button
                      type="button"
                      className="button button--ghost"
                      onClick={() => setActiveTab("jobs")}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Perfil */}
            {activeTab === "profile" && (
              <div className="panel co-workspace-panel">
                <h2>Posicionamento da empresa</h2>
                <form className="co-workspace-form" onSubmit={handleProfileSubmit}>
                  <label className="field">
                    <span>Headline</span>
                    <input
                      value={profileForm.headline}
                      onChange={(e) => setProfileForm((c) => ({ ...c, headline: e.target.value }))}
                    />
                  </label>
                  <label className="field">
                    <span>Descrição</span>
                    <textarea
                      rows="5"
                      value={profileForm.description}
                      onChange={(e) => setProfileForm((c) => ({ ...c, description: e.target.value }))}
                    />
                  </label>
                  <label className="field">
                    <span>Site</span>
                    <input
                      value={profileForm.website}
                      onChange={(e) => setProfileForm((c) => ({ ...c, website: e.target.value }))}
                    />
                  </label>
                  <button type="submit" className="button button--primary">
                    <span className="material-symbols-outlined" aria-hidden="true">save</span>
                    Atualizar perfil
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="co-workspace-sidebar">
            <section className="panel co-workspace-sidebar-card">
              <h2 className="co-workspace-sidebar-title">
                <span className="material-symbols-outlined" aria-hidden="true">calendar_month</span>
                Agenda
              </h2>
              {agendaItems.length ? (
                <div className="co-agenda-list">
                  {agendaItems.map((item) => (
                    <article className="co-agenda-item" key={item.id}>
                      <div className="co-agenda-item__dot" aria-hidden="true" />
                      <div className="co-agenda-item__body">
                        <strong>{item.title}</strong>
                        <span>{item.date} · {item.time}</span>
                        <span className="co-agenda-item__owner">{item.owner}</span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="co-workspace-empty">Nenhum evento na agenda.</p>
              )}
            </section>

            <section className="panel co-workspace-sidebar-card">
              <h2 className="co-workspace-sidebar-title">
                <span className="material-symbols-outlined" aria-hidden="true">group</span>
                Candidaturas recentes
              </h2>
              {companyApplications.length ? (
                <div className="co-applications-list">
                  {companyApplications.slice(0, 5).map((a) => {
                    const job = companyJobs.find((j) => j.id === a.jobId);
                    return (
                      <article className="co-application-item" key={a.id}>
                        <div className="brand-chip brand-chip--sm">
                          {a.candidateId.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="co-application-item__info">
                          <strong>{job?.title ?? "Vaga"}</strong>
                          <span>{a.status}</span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="co-workspace-empty">Sem candidaturas ainda.</p>
              )}
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
