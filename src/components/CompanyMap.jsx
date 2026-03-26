import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import { Link } from "react-router-dom";

function FitBounds({ companies }) {
  const map = useMap();

  useEffect(() => {
    if (!companies.length) return;
    const bounds = companies.map((company) => [
      company.coordinates.lat,
      company.coordinates.lng,
    ]);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [companies, map]);

  return null;
}

export function CompanyMap({ companies, selectedCompany, onSelectCompany }) {
  const defaultCenter =
    companies[0]?.coordinates ? [companies[0].coordinates.lat, companies[0].coordinates.lng] : [-22.9056, -47.0608];

  return (
    <div className="map-frame">
      <MapContainer center={defaultCenter} zoom={7} scrollWheelZoom className="map-canvas">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds companies={companies} />
        {companies.map((company) => (
          <CircleMarker
            key={company.id}
            center={[company.coordinates.lat, company.coordinates.lng]}
            radius={selectedCompany?.id === company.id ? 12 : 9}
            pathOptions={{
              color: "#102569",
              fillColor: company.hiring ? "#102569" : "#94a3b8",
              fillOpacity: 0.92,
              weight: 2,
            }}
            eventHandlers={{
              click: () => onSelectCompany(company),
            }}
          >
            <Popup>
              <div className="map-popup">
                <strong>{company.name}</strong>
                <span>{company.sector}</span>
                <p>
                  {company.city}, {company.state}
                </p>
                <Link to={`/empresa/${company.slug}`}>Ver perfil</Link>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
