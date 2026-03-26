import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="section">
      <div className="site-shell">
        <div className="panel not-found-card">
          <span className="eyebrow">404</span>
          <h1>Essa rota nao existe no novo MapsLink.</h1>
          <p>
            A base antiga foi substituida por uma SPA em React + Vite. Use a navegacao principal para continuar.
          </p>
          <Link className="button button--primary" to="/">
            Voltar para a home
          </Link>
        </div>
      </div>
    </main>
  );
}
