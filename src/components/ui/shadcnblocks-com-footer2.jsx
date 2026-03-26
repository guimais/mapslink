import { Link } from "react-router-dom";

const defaultFooterData = {
  logo: {
    src: "/assets/images/mapslink-logo.png",
    alt: "MapsLink",
    title: "MapsLink",
    url: "/",
  },
  tagline: "Mapa de oportunidades com contexto real para candidatos e empresas.",
  menuItems: [
    {
      title: "Produto",
      links: [
        { text: "Início", url: "/" },
        { text: "Mapa", url: "/mapa" },
        { text: "Vagas", url: "/vagas" },
        { text: "Planos", url: "/planos" },
      ],
    },
    {
      title: "Conta",
      links: [
        { text: "Entrar", url: "/perfil" },
        { text: "Login candidato", url: "/login/candidato" },
        { text: "Login empresa", url: "/login/empresa" },
      ],
    },
    {
      title: "Empresa",
      links: [
        { text: "Sobre", url: "/sobre" },
        { text: "Contato", url: "/contato" },
        { text: "Cadastrar empresa", url: "/cadastro/empresa" },
      ],
    },
    {
      title: "Legal",
      links: [
        { text: "Termos e condições", url: "/sobre" },
        { text: "Política de privacidade", url: "/sobre" },
      ],
    },
  ],
  copyright: `(c) ${new Date().getFullYear()} MapsLink. Todos os direitos reservados.`,
  bottomLinks: [
    { text: "Termos e condições", url: "/sobre" },
    { text: "Política de privacidade", url: "/sobre" },
  ],
};

function FooterLink({ text, url, className, children }) {
  if (url.startsWith("http")) {
    return (
      <a href={url} className={className} target="_blank" rel="noopener noreferrer">
        {children ?? text}
      </a>
    );
  }

  return (
    <Link to={url} className={className}>
      {children ?? text}
    </Link>
  );
}

export function Footer2({
  logo = defaultFooterData.logo,
  tagline = defaultFooterData.tagline,
  menuItems = defaultFooterData.menuItems,
  copyright = defaultFooterData.copyright,
  bottomLinks = defaultFooterData.bottomLinks,
}) {
  return (
    <section className="sf2">
      <div className="site-shell">
        <div className="sf2__card">
          <div className="sf2__grid">
            <div className="sf2__brand">
              <FooterLink url={logo.url} className="sf2__logo-link">
                <img src={logo.src} alt={logo.alt} title={logo.title} className="sf2__logo-image" />
              </FooterLink>
              <div>
                <p className="sf2__title">{logo.title}</p>
                <p className="sf2__tagline">{tagline}</p>
              </div>
            </div>

            {menuItems.map((section) => (
              <div key={section.title} className="sf2__column">
                <h3>{section.title}</h3>
                <ul>
                  {section.links.map((link) => (
                    <li key={`${section.title}-${link.text}`}>
                      <FooterLink text={link.text} url={link.url} className="sf2__link" />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="sf2__bottom">
            <p>{copyright}</p>
            <ul>
              {bottomLinks.map((link) => (
                <li key={`bottom-${link.text}`}>
                  <FooterLink text={link.text} url={link.url} className="sf2__bottom-link" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
