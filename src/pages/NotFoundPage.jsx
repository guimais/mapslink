import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="section">
      <div className="site-shell">
        <div className="panel not-found-card">
          <span className="eyebrow">404</span>
          <h1>Página não encontrada.</h1>
          <p>
            A página que você buscou não existe ou foi movida. Use a navegação principal para continuar.
          </p>
          <Link className="button button--primary" to="/">
            Voltar para a home
          </Link>
        </div>
      </div>
    </main>
  );
}
