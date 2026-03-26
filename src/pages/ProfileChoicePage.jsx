import { Link } from "react-router-dom";
import { BuildingIcon, UserIcon } from "../components/Icons";
import { SectionHeading } from "../components/SectionHeading";

export function ProfileChoicePage() {
  return (
    <main className="section">
      <div className="site-shell">
        <SectionHeading
          eyebrow="Escolha seu fluxo"
          title="Entradas diferentes para necessidades diferentes."
          description="A proposta continua a mesma: um caminho para quem busca vagas e outro para quem esta contratando."
          align="center"
        />

        <div className="choice-grid">
          <article className="choice-card">
            <span className="choice-card__icon" aria-hidden="true">
              <UserIcon />
            </span>
            <h3>Sou candidato</h3>
            <p>Quero explorar empresas, me candidatar e acompanhar meu radar de oportunidades.</p>
            <div className="choice-actions">
              <Link className="button button--primary" to="/login/candidato">
                Entrar
              </Link>
              <Link className="button button--ghost" to="/cadastro/candidato">
                Criar conta
              </Link>
            </div>
          </article>

          <article className="choice-card">
            <span className="choice-card__icon" aria-hidden="true">
              <BuildingIcon />
            </span>
            <h3>Sou empresa</h3>
            <p>Quero publicar vagas, enxergar candidatos e organizar meu fluxo de contratacao.</p>
            <div className="choice-actions">
              <Link className="button button--primary" to="/login/empresa">
                Entrar
              </Link>
              <Link className="button button--ghost" to="/cadastro/empresa">
                Criar conta
              </Link>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
