import { SectionHeading } from "../components/SectionHeading";

const values = [
  "Visualizar o mercado com contexto geografico e operacional.",
  "Aproximar talento e empresa sem interfaces confusas.",
  "Criar uma camada de produto que una mapa, vagas e relacionamento.",
];

export function AboutPage() {
  return (
    <main className="section">
      <div className="site-shell about-grid">
        <div>
          <SectionHeading
            eyebrow="Sobre"
            title="MapsLink nasce da ideia de mapear oportunidades com mais criterio."
            description="Nao e apenas um mural de vagas. E uma leitura visual do mercado, com foco em localizacao, tipo de empresa e qualidade do contexto."
          />
        </div>

        <div className="panel manifesto-card">
          <h3>Manifesto do produto</h3>
          <p>
            Queremos reduzir a distancia entre a busca por emprego e o entendimento real do ecossistema ao redor.
            O mapa deixa de ser decorativo e vira um elemento central da experiencia.
          </p>
          <ul className="manifesto-list">
            {values.map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
