// Stub seguro: disponivel sem alterar comportamento atual
(function () {
  if (!window.initMap) {
    window.initMap = async function initMap() {
      try {
        const data = await loadJSON('/assets/data/companies.json');
        window.__companies = data; // disponibiliza dados para futuras etapas
      } catch (e) {
        console.warn(e);
      }
    };
  }
})();
