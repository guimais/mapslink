import { SectionHeading } from "../components/SectionHeading";
import { plans } from "../data/plans";

export function PlansPage() {
  const candidatePlans = plans.filter((plan) => plan.audience === "Candidatos");
  const companyPlans = plans.filter((plan) => plan.audience === "Empresas");

  const renderPlanCard = (plan) => (
    <article className={`pricing-card ${plan.featured ? "is-featured" : ""}`} key={plan.id}>
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
  );

  return (
    <main className="section plans-page">
      <div className="site-shell">
        <SectionHeading
          eyebrow="Planos"
          title="Escolha o plano ideal para o seu perfil e comece agora."
          description="Estrutura simples e direta, sem camadas desnecessárias entre você e o que precisa."
          align="center"
        />

        <section className="plans-page__group">
          <div className="plans-page__group-heading">
            <h3>Planos para candidatos</h3>
            <p>Do básico ao avançado para aumentar suas chances de contratação.</p>
          </div>
          <div className="pricing-grid">{candidatePlans.map(renderPlanCard)}</div>
        </section>

        <section className="plans-page__group">
          <div className="plans-page__group-heading">
            <h3>Planos para empresas</h3>
            <p>Pacotes para contratar melhor, com mais previsibilidade e escala.</p>
          </div>
          <div className="pricing-grid">{companyPlans.map(renderPlanCard)}</div>
        </section>
      </div>
    </main>
  );
}
