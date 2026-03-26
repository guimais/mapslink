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
    <main className="section">
      <div className="site-shell">
        <SectionHeading
          eyebrow="Mapa de oportunidades"
          title="Descubra empresas por localizacao, area e modelo de trabalho."
          description="Tudo o que aparece aqui ja esta em componentes React: filtros, mapa, cards e interacoes."
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
