(() => {
  const currentScript = document.currentScript;


  if (window.location.pathname.endsWith("/pages/esqueceusenha.html")) return;

  function ensureBody() {
    if (document.body) return document.body;
    document.addEventListener(
      "DOMContentLoaded",
      () => ensureBody(),
      { once: true }
    );
    return null;
  }

  const body = ensureBody();
  if (!body) return;
  if (document.querySelector('.site-footer[data-component="site-footer"]')) return;

  const pageId = (body.dataset.page || "").toLowerCase();
  if (pageId === "edicaoperfil" || pageId === "edicaoperfilempresa") return;
  const navActive = (body.dataset.navActive || "").toLowerCase();
  const path = (window.location.pathname || "").toLowerCase();
  const isRoot = pageId === "home" || navActive === "index.html" || (!path.includes("/pages/") && !path.includes("\\pages\\"));

  const assetBase = isRoot ? "." : "..";
  const pageBase = isRoot ? "pages/" : "";
  const homeHref = isRoot ? "index.html" : "../index.html";
  const currentYear = new Date().getFullYear();

  function ensureStyles() {
    if (document.querySelector('link[data-footer-styles="true"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `${assetBase}/assets/css/footer.css`;
    link.dataset.footerStyles = "true";
    document.head.appendChild(link);
  }

  ensureStyles();

  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.dataset.component = "site-footer";
  footer.setAttribute("aria-label", "Rodapé da MapsLink");

  footer.innerHTML = `
    <div class="footer-container">
      <div class="footer-top">
        <div class="footer-brand">
          <a class="footer-logo-link" href="${homeHref}" aria-label="MapsLink - voltar para a página inicial">
            <img src="${assetBase}/assets/images/logo-icon-192.png" alt="Logo MapsLink" class="footer-logo" loading="lazy" decoding="async">
            <span>MapsLink</span>
          </a>
          <p class="footer-description">
            Conectamos talentos e empresas com um mapa interativo, filtros inteligentes e dashboards acessíveis.
            Mapeando oportunidades para você e para o seu negócio.
          </p>
          <div class="footer-socials" role="list" aria-label="Nossas redes sociais">
            <a class="footer-social-link" role="listitem" aria-label="LinkedIn da MapsLink" href="https://www.linkedin.com/company/mapslink" target="_blank" rel="noopener noreferrer">
              <i class="ri-linkedin-fill" aria-hidden="true"></i>
            </a>
            <a class="footer-social-link" role="listitem" aria-label="Instagram da MapsLink" href="https://www.instagram.com/maps.link?igsh=ZmdpZWt2Nm9xNG1l&utm_source=qr" target="_blank" rel="noopener noreferrer">
              <i class="ri-instagram-line" aria-hidden="true"></i>
            </a>
            <a class="footer-social-link" role="listitem" aria-label="YouTube da MapsLink" href="https://www.youtube.com/@mapslink" target="_blank" rel="noopener noreferrer">
              <i class="ri-youtube-line" aria-hidden="true"></i>
            </a>
            <a class="footer-social-link" role="listitem" aria-label="GitHub da MapsLink" href="https://github.com/guimais/mapslink" target="_blank" rel="noopener noreferrer">
              <i class="ri-github-line" aria-hidden="true"></i>
            </a>
          </div>
        </div>
        <div class="footer-column">
          <h3>Plataforma</h3>
          <ul class="footer-links">
            <li><a href="${pageBase}paginamapav4.html">Mapa de Vagas</a></li>
            <li><a href="${pageBase}selecaoperfil.html">Criar Perfil</a></li>
            <li><a href="${pageBase}paginaplanos.html">Planos e preços</a></li>
            
          </ul>
        </div>
        <div class="footer-column">
          <h3>Empresa</h3>
          <ul class="footer-links">
            <li><a href="${pageBase}about.html">Sobre nós</a></li>
            <li><a href="${pageBase}contact.html">Contato</a></li>
          </ul>
        </div>
        <div class="footer-column">
          <h3>Suporte</h3>
          <div class="footer-contact">
            <span><i class="ri-mail-send-line" aria-hidden="true"></i> <a href="mailto:contato@mapslink.com">contato@mapslink.com</a></span>
            <span><i class="ri-phone-line" aria-hidden="true"></i> <a href="tel:+55(19)99740-5660">+55(19)99740-5660</a></span>
            <span><i class="ri-map-pin-line" aria-hidden="true"></i> H11 - Campus I, PUC-Campinas, Av. Reitor Benedito José Barreto Fonseca - Parque das Universidades, Campinas - SP</span>
            <span><i class="ri-customer-service-2-line" aria-hidden="true"></i> Atendimento: Seg a Sex, 09h - 17h (BRT)</span>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="footer-meta">
          <span class="footer-badge"><i class="ri-map-pin-add-line" aria-hidden="true"></i>Mapa interativo exclusivo MapsLink</span>
          <span><i class="ri-shield-check-line" aria-hidden="true"></i>Dados protegidos e criptografados</span>
          <span><i class="ri-live-line" aria-hidden="true"></i>Atualizações em tempo real</span>
        </div>
        <p class="footer-credits">
          © ${currentYear} MapsLink. Todos os direitos reservados. Interface do mapa desenvolvida pela equipe MapsLink — credite sempre a plataforma ao reutilizar nossos dados geoespaciais.
        </p>
      </div>
    </div>
  `;

  const anchorParent = currentScript?.parentNode;
  if (anchorParent) {
    anchorParent.insertBefore(footer, currentScript);
  } else {
    body.appendChild(footer);
  }
})();
