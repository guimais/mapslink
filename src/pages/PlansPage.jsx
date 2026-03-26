import { SectionHeading } from "../components/SectionHeading";
import { plans } from "../data/plans";

export function PlansPage() {
  return (
    <main className="section">
      <div className="site-shell">
        <SectionHeading
          eyebrow="Planos"
          title="Estrutura comercial simples para um produto mais claro."
          description="Mantivemos a paleta atual e redesenhamos o plano de leitura da pagina para facilitar decisao."
          align="center"
        />

        <div className="pricing-grid">
          {plans.map((plan) => (
            <article className={`pricing-card ${plan.id === "growth" ? "is-featured" : ""}`} key={plan.id}>
              <span className="pricing-card__audience">{plan.audience}</span>
              <h3>{plan.name}</h3>
              <strong>{plan.price}</strong>
              <p>{plan.description}</p>
              <ul className="pricing-list">
                {plan.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
