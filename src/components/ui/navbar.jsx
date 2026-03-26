import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "./liquid-glass-button";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";

const menuItems = [
  { name: "Início", href: "/" },
  { name: "Mapa", href: "/mapa" },
  { name: "Vagas", href: "/vagas" },
  { name: "Planos", href: "/planos" },
  { name: "Sobre", href: "/sobre" },
  { name: "Contato", href: "/contato" },
];

export function Navbar() {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { currentUser, logout } = useAuth();

  const workspaceLink = currentUser?.type === "company" ? "/app/empresa" : "/app/candidato";
  const initials = React.useMemo(() => {
    if (!currentUser?.name) return "ML";
    return currentUser.name
      .split(" ")
      .slice(0, 2)
      .map((chunk) => chunk[0]?.toUpperCase())
      .join("");
  }, [currentUser?.name]);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="ml-nav">
      <nav data-state={menuState ? "active" : "inactive"} className="ml-nav__bar">
        <div className={cn("ml-nav__frame", isScrolled && "is-scrolled")}>
          <div className="ml-nav__row">
            <div className="ml-nav__brand-wrap">
              <Link to="/" aria-label="home" className="ml-nav__brand" onClick={() => setMenuState(false)}>
                <img
                  src="/assets/images/mapslink-logo.png"
                  alt="MapsLink"
                  className="ml-nav__brand-image"
                  width="60"
                  height="60"
                  decoding="async"
                />
                <div>
                  <strong>MapsLink</strong>
                </div>
              </Link>

              <button
                onClick={() => setMenuState((value) => !value)}
                aria-label={menuState ? "Fechar menu" : "Abrir menu"}
                className="ml-nav__toggle"
                type="button"
              >
                <Menu className={cn("ml-nav__toggle-icon", menuState && "is-hidden")} />
                <X className={cn("ml-nav__toggle-icon ml-nav__toggle-icon--close", menuState && "is-visible")} />
              </button>
            </div>

            <div className="ml-nav__center">
              <ul className="ml-nav__links">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={({ isActive }) =>
                        cn("ml-nav__link", isActive && "is-active")
                      }
                      onClick={() => setMenuState(false)}
                    >
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className={cn("ml-nav__actions-wrap", menuState && "is-open")}>
              <div className="ml-nav__mobile">
                <ul className="ml-nav__mobile-links">
                  {menuItems.map((item) => (
                    <li key={item.name}>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          cn("ml-nav__mobile-link", isActive && "is-active")
                        }
                        onClick={() => setMenuState(false)}
                      >
                        {item.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="ml-nav__actions">
                {currentUser ? (
                  <>
                    <Button asChild variant="outline" size="sm">
                      <Link to={workspaceLink} onClick={() => setMenuState(false)}>
                        Meu espaco
                      </Link>
                    </Button>
                    <Button
                      variant="cool"
                      size="sm"
                      onClick={() => {
                        setMenuState(false);
                        logout();
                      }}
                    >
                      Sair
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className={cn(isScrolled && "ml-nav__hide-on-scroll")}
                    >
                      <Link to="/perfil" onClick={() => setMenuState(false)}>
                        Entrar
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="cool"
                      size="sm"
                      className={cn(isScrolled && "ml-nav__hide-on-scroll")}
                    >
                      <Link to="/mapa" onClick={() => setMenuState(false)}>
                        Explorar
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className={cn("ml-nav__compact-cta", !isScrolled && "ml-nav__compact-cta--hidden")}
                    >
                      <Link to="/mapa" onClick={() => setMenuState(false)}>
                        Comecar
                      </Link>
                    </Button>
                  </>
                )}

                <Link
                  className="ml-nav__avatar"
                  to={currentUser ? workspaceLink : "/perfil"}
                  onClick={() => setMenuState(false)}
                  aria-label="Perfil"
                >
                  {currentUser?.avatar ? (
                    <img src={currentUser.avatar} alt="Perfil" loading="lazy" decoding="async" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
