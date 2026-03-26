import { useState } from "react";
import { SectionHeading } from "../components/SectionHeading";
import { useAuth } from "../context/AuthContext";
import { usePlatform } from "../context/PlatformContext";

export function CompanyWorkspacePage() {
  const { currentUser } = useAuth();
  const { companies, jobs, applications, agenda, updateCompanyProfile, createJob, toggleJobStatus } =
    usePlatform();
  const company = companies.find((item) => item.slug === currentUser.companySlug) ?? companies[0];
  const companyJobs = jobs.filter((job) => job.companySlug === company.slug);
  const companyApplications = applications.filter((application) =>
    companyJobs.some((job) => job.id === application.jobId),
  );

  const [profileForm, setProfileForm] = useState({
    headline: company.headline,
    description: company.description,
    website: company.website,
  });
  const [jobForm, setJobForm] = useState({
    title: "",
    type: "CLT",
    mode: "Hibrido",
    level: "Pleno",
    salary: "",
    summary: "",
    skills: "",
  });
  const [status, setStatus] = useState("");

  function handleProfileSubmit(event) {
    event.preventDefault();
    updateCompanyProfile(company.slug, profileForm);
    setStatus("Perfil da empresa atualizado.");
  }

  function handleJobSubmit(event) {
    event.preventDefault();
    createJob(company.slug, jobForm);
    setStatus("Nova vaga criada.");
    setJobForm({
      title: "",
      type: "CLT",
      mode: "Hibrido",
      level: "Pleno",
      salary: "",
      summary: "",
      skills: "",
    });
  }

  return (
    <main className="section">
      <div className="site-shell workspace-stack">
        <SectionHeading
          eyebrow="Painel da empresa"
          title={`${company.name} em modo de operacao.`}
          description="Vagas, pipeline, agenda e posicionamento da empresa concentrados em uma SPA React."
        />

        <div className="metric-grid metric-grid--four">
          <article className="panel metric-card">
            <strong>{companyJobs.length}</strong>
            <span>vagas no ar</span>
          </article>
          <article className="panel metric-card">
            <strong>{companyApplications.length}</strong>
            <span>candidaturas recebidas</span>
          </article>
          <article className="panel metric-card">
            <strong>{agenda.filter((item) => item.companySlug === company.slug).length}</strong>
            <span>eventos na agenda</span>
          </article>
          <article className="panel metric-card">
            <strong>{company.workModes.join(" / ")}</strong>
            <span>modelo principal</span>
          </article>
        </div>

        {status ? <div className="notice">{status}</div> : null}

        <div className="workspace-grid">
          <section className="panel">
            <h3>Posicionamento da empresa</h3>
            <form className="stack-form" onSubmit={handleProfileSubmit}>
              <label className="field">
                <span>Headline</span>
                <input
                  value={profileForm.headline}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, headline: event.target.value }))
                  }
                />
              </label>
              <label className="field">
                <span>Descricao</span>
                <textarea
                  rows="5"
                  value={profileForm.description}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, description: event.target.value }))
                  }
                />
              </label>
              <label className="field">
                <span>Site</span>
                <input
                  value={profileForm.website}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, website: event.target.value }))
                  }
                />
              </label>
              <button type="submit" className="button button--primary">
                Atualizar perfil
              </button>
            </form>
          </section>

          <section className="panel">
            <h3>Criar vaga</h3>
            <form className="stack-form" onSubmit={handleJobSubmit}>
              <label className="field">
                <span>Titulo</span>
                <input
                  value={jobForm.title}
                  onChange={(event) => setJobForm((current) => ({ ...current, title: event.target.value }))}
                  required
                />
              </label>
              <div className="form-grid">
                <label className="field">
                  <span>Tipo</span>
                  <select
                    value={jobForm.type}
                    onChange={(event) => setJobForm((current) => ({ ...current, type: event.target.value }))}
                  >
                    <option>CLT</option>
                    <option>PJ</option>
                    <option>Estagio</option>
                  </select>
                </label>
                <label className="field">
                  <span>Modelo</span>
                  <select
                    value={jobForm.mode}
                    onChange={(event) => setJobForm((current) => ({ ...current, mode: event.target.value }))}
                  >
                    <option>Hibrido</option>
                    <option>Remoto</option>
                    <option>Presencial</option>
                  </select>
                </label>
                <label className="field">
                  <span>Nivel</span>
                  <select
                    value={jobForm.level}
                    onChange={(event) => setJobForm((current) => ({ ...current, level: event.target.value }))}
                  >
                    <option>Junior</option>
                    <option>Pleno</option>
                    <option>Senior</option>
                  </select>
                </label>
              </div>
              <label className="field">
                <span>Faixa salarial</span>
                <input
                  value={jobForm.salary}
                  onChange={(event) => setJobForm((current) => ({ ...current, salary: event.target.value }))}
                  required
                />
              </label>
              <label className="field">
                <span>Resumo</span>
                <textarea
                  rows="4"
                  value={jobForm.summary}
                  onChange={(event) => setJobForm((current) => ({ ...current, summary: event.target.value }))}
                  required
                />
              </label>
              <label className="field">
                <span>Skills</span>
                <input
                  value={jobForm.skills}
                  onChange={(event) => setJobForm((current) => ({ ...current, skills: event.target.value }))}
                  placeholder="React, Python, SQL"
                  required
                />
              </label>
              <button type="submit" className="button button--primary">
                Publicar vaga
              </button>
            </form>
          </section>
        </div>

        <div className="workspace-grid">
          <section className="panel">
            <h3>Vagas ativas</h3>
            <div className="stack-list">
              {companyJobs.map((job) => (
                <article className="mini-card" key={job.id}>
                  <div>
                    <strong>{job.title}</strong>
                    <p>
                      {job.mode} | {job.type} | {job.salary}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => toggleJobStatus(company.slug, job.id)}
                  >
                    {job.status === "Pausada" ? "Reabrir" : "Pausar"}
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <h3>Agenda e pipeline</h3>
            <div className="stack-list">
              {agenda
                .filter((item) => item.companySlug === company.slug)
                .map((item) => (
                  <article className="mini-card" key={item.id}>
                    <div>
                      <strong>{item.title}</strong>
                      <p>
                        {item.date} | {item.time}
                      </p>
                    </div>
                    <span className="job-badge">{item.owner}</span>
                  </article>
                ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
