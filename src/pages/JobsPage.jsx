import { useDeferredValue, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SectionHeading } from "../components/SectionHeading";
import { useAuth } from "../context/AuthContext";
import { usePlatform } from "../context/PlatformContext";

export function JobsPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { jobs, applyToJob } = usePlatform();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("Todos");
  const [feedback, setFeedback] = useState("");
  const deferredQuery = useDeferredValue(query);

  const workModes = ["Todos", ...new Set(jobs.map((job) => job.mode))];

  const filteredJobs = jobs.filter((job) => {
    const searchable = `${job.title} ${job.companyName} ${job.city} ${job.skills.join(" ")}`.toLowerCase();
    const matchesQuery = searchable.includes(deferredQuery.toLowerCase());
    const matchesMode = mode === "Todos" || job.mode === mode;
    return matchesQuery && matchesMode;
  });

  function handleApply(jobId) {
    if (!currentUser || currentUser.type !== "candidate") {
      navigate("/login/candidato");
      return;
    }

    try {
      applyToJob({
        jobId,
        candidateId: currentUser.id,
        message: "Candidatura enviada pelo painel de vagas.",
      });
      setFeedback("Candidatura enviada com sucesso.");
    } catch (error) {
      setFeedback(error.message);
    }
  }

  return (
    <main className="section">
      <div className="site-shell">
        <SectionHeading
          eyebrow="Vagas"
          title="Um painel para comparar oportunidades com mais contexto."
          description="Filtre por modelo de trabalho, veja skills pedidas e envie sua candidatura sem sair do fluxo."
        />

        <div className="jobs-toolbar panel">
          <label className="field">
            <span>Busca</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cargo, empresa ou skill"
            />
          </label>

          <label className="field">
            <span>Modelo</span>
            <select value={mode} onChange={(event) => setMode(event.target.value)}>
              {workModes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <div className="jobs-toolbar__summary">
            <strong>{filteredJobs.length}</strong>
            <span>vagas encontradas</span>
          </div>
        </div>

        {feedback ? <div className="notice">{feedback}</div> : null}

        <div className="job-grid">
          {filteredJobs.map((job) => (
            <article className="job-card" key={job.id}>
              <div className="job-card__top">
                <span className="job-badge">{job.mode}</span>
                <span className="job-badge job-badge--soft">{job.type}</span>
              </div>

              <h3>{job.title}</h3>
              <p className="job-card__company">
                {job.companyName} | {job.city}, {job.state}
              </p>
              <p>{job.summary}</p>

              <div className="meta-pills">
                <span>{job.level}</span>
                <span>{job.salary}</span>
              </div>

              <div className="meta-pills">
                {job.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>

              <div className="job-card__actions">
                <Link className="button button--ghost" to={`/empresa/${job.companySlug}`}>
                  Empresa
                </Link>
                <button type="button" className="button button--primary" onClick={() => handleApply(job.id)}>
                  Candidatar-se
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
