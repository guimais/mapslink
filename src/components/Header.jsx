import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CloseIcon, MenuIcon } from "./Icons";

const navItems = [
  { to: "/", label: "Inicio" },
  { to: "/mapa", label: "Mapa" },
  { to: "/vagas", label: "Vagas" },
  { to: "/planos", label: "Planos" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "Contato" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();

  const workspaceLink =
    currentUser?.type === "company" ? "/app/empresa" : "/app/candidato";

  return (
    <header className="site-header">
      <div className="site-shell nav-shell">
        <Link to="/" className="brand-mark" onClick={() => setIsOpen(false)}>
          <img
            src="/assets/images/mapslink-logo.png"
            alt="MapsLink"
            className="brand-mark__image"
            width="48"
            height="48"
            decoding="async"
          />
          <div>
            <strong>MapsLink</strong>
            <span>mapa de oportunidades</span>
          </div>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={isOpen}
          aria-label="Abrir menu"
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? (
            <CloseIcon className="icon-button__glyph" />
          ) : (
            <MenuIcon className="icon-button__glyph" />
          )}
        </button>

        <div className={`nav-drawer ${isOpen ? "is-open" : ""}`}>
          <nav className="main-nav" aria-label="Principal">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-actions">
            {currentUser ? (
              <>
                <Link className="button button--ghost" to={workspaceLink} onClick={() => setIsOpen(false)}>
                  Meu espaco
                </Link>
                <button type="button" className="button button--primary" onClick={logout}>
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link className="button button--ghost" to="/perfil" onClick={() => setIsOpen(false)}>
                  Entrar
                </Link>
                <Link className="button button--primary" to="/mapa" onClick={() => setIsOpen(false)}>
                  Explorar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
