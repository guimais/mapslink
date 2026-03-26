import { useDeferredValue, useState } from "react";
import { Link } from "react-router-dom";
import { CompanyMap } from "../components/CompanyMap";
import { SectionHeading } from "../components/SectionHeading";
import { usePlatform } from "../context/PlatformContext";

export function MapPage() {
  const { companies } = usePlatform();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("Todas");
  const [hiringOnly, setHiringOnly] = useState(false);
  const [mode, setMode] = useState("Todos");
  const deferredQuery = useDeferredValue(query);

  const filteredCompanies = companies.filter((company) => {
    const searchable = `${company.name} ${company.city} ${company.sector} ${company.tags.join(" ")}`.toLowerCase();
    const matchesQuery = searchable.includes(deferredQuery.toLowerCase());
    const matchesCity = city === "Todas" || company.city === city;
    const matchesHiring = !hiringOnly || company.hiring;
    const matchesMode = mode === "Todos" || company.workModes.includes(mode);
    return matchesQuery && matchesCity && matchesHiring && matchesMode;
  });

  const [selectedCompany, setSelectedCompany] = useState(filteredCompanies[0] ?? null);

  const cities = ["Todas", ...new Set(companies.map((company) => company.city))];
  const workModes = ["Todos", ...new Set(companies.flatMap((company) => company.workModes))];

  const activeCompany =
    filteredCompanies.find((company) => company.id === selectedCompany?.id) ?? filteredCompanies[0] ?? null;

  return (
    <main className="section map-page">
      <div className="site-shell">
        <SectionHeading
          className="map-page__heading"
          eyebrow="Mapa de oportunidades"
          title="Descubra empresas por localização, área e modelo de trabalho."
          description="Tudo o que aparece aqui já está em componentes React: filtros, mapa, cards e interações."
        />

        <div className="map-layout">
          <aside className="map-sidebar panel">
            <label className="field">
              <span>Busca livre</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Empresa, cidade ou stack"
              />
            </label>

            <label className="field">
              <span>Cidade</span>
              <select value={city} onChange={(event) => setCity(event.target.value)}>
                {cities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
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

            <label className="toggle-row">
              <span>Apenas empresas contratando</span>
              <input
                type="checkbox"
                checked={hiringOnly}
                onChange={(event) => setHiringOnly(event.target.checked)}
              />
            </label>

            <div className="company-results">
              {filteredCompanies.map((company) => (
                <button
                  key={company.id}
                  type="button"
                  className={`company-result ${activeCompany?.id === company.id ? "is-active" : ""}`}
                  onClick={() => setSelectedCompany(company)}
                >
                  <div className="brand-chip">{company.name.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <strong>{company.name}</strong>
                    <span>
                      {company.city}, {company.state}
                    </span>
                  </div>
                  <small>{company.hiring ? "Contratando" : "Observando mercado"}</small>
                </button>
              ))}
            </div>
          </aside>

          <section className="map-stage">
            <CompanyMap
              companies={filteredCompanies}
              selectedCompany={activeCompany}
              onSelectCompany={setSelectedCompany}
            />

            {activeCompany ? (
              <article className="panel company-panel">
                <div className="company-panel__header">
                  <div className="brand-chip">{activeCompany.name.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <h3>{activeCompany.name}</h3>
                    <p>{activeCompany.headline}</p>
                  </div>
                </div>

                <div className="meta-pills">
                  <span>{activeCompany.sector}</span>
                  <span>{activeCompany.size}</span>
                  <span>{activeCompany.workModes.join(" / ")}</span>
                </div>

                <p>{activeCompany.description}</p>

                <div className="company-panel__details">
                  <div className="company-panel__stats">
                    <div className="company-panel__stat">
                      <span>Localização</span>
                      <strong>
                        {activeCompany.city}, {activeCompany.state}
                      </strong>
                    </div>
                    <div className="company-panel__stat">
                      <span>Fundação</span>
                      <strong>{activeCompany.founded}</strong>
                    </div>
                    <div className="company-panel__stat">
                      <span>Status</span>
                      <strong>{activeCompany.hiring ? "Contratando agora" : "Banco de talentos"}</strong>
                    </div>
                    <div className="company-panel__stat">
                      <span>Vagas abertas</span>
                      <strong>{activeCompany.jobs.length}</strong>
                    </div>
                  </div>

                  <div className="company-panel__jobs">
                    <h4>Vagas em destaque</h4>
                    {activeCompany.jobs.length ? (
                      <ul className="company-panel__jobs-list">
                        {activeCompany.jobs.slice(0, 3).map((job) => (
                          <li key={job.id} className="company-panel__job-item">
                            <strong>{job.title}</strong>
                            <span>
                              {job.mode} | {job.level} | {job.salary}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="company-panel__empty">
                        Sem vagas abertas no momento. Esta empresa segue no radar para futuras oportunidades.
                      </p>
                    )}
                  </div>

                  <div className="company-panel__topics">
                    <h4>Competências e temas</h4>
                    <div className="company-panel__topics-list">
                      {activeCompany.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="company-panel__contact">
                    <span>{activeCompany.address}</span>
                    <a href={activeCompany.website} target="_blank" rel="noreferrer">
                      Visitar site
                    </a>
                  </div>
                </div>

                <div className="company-panel__footer">
                  <Link className="button button--primary" to={`/empresa/${activeCompany.slug}`}>
                    Ver perfil
                  </Link>
                  <Link className="button button--ghost" to="/vagas">
                    Ver vagas
                  </Link>
                </div>
              </article>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
