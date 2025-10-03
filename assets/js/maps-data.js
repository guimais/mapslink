(function(){
  const companies = [
    {
      id: 'sidi',
      name: 'SIDI',
      address: 'Rua Angacu, 171 - Loteamento Alphaville Campinas, Campinas - SP, 13098-321',
      city: 'Campinas',
      coords: [-22.8339, -47.0739],
      status: 'open',
      areas: ['ti'],
      porte: 'medium',
      modalities: ['hibrido', 'presencial']
    },
    {
      id: 'samsung',
      name: 'Samsung',
      address: 'Rua Thomas Nilsen Junior, 150 - Parque Imperador, Campinas - SP, 13097-105',
      city: 'Campinas',
      coords: [-22.942, -47.06],
      status: 'closed',
      areas: ['ti'],
      porte: 'large',
      modalities: ['presencial']
    },
    {
      id: 'cnpem',
      name: 'CNPEM',
      address: 'Polo II de Alta Tecnologia - Rua Giuseppe Maximo Scolfaro, 10000 - Bosque das Palmeiras, Campinas - SP, 13083-100',
      city: 'Campinas',
      coords: [-22.8197, -47.0647],
      status: 'open',
      areas: ['ti', 'health'],
      porte: 'large',
      modalities: ['presencial']
    }
  ];

  window.mapsLinkCompanies = companies;
})();
