import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import { Link } from "react-router-dom";

function normalizeCoord(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function getSafeCoordinates(company) {
  const lat = normalizeCoord(company?.coordinates?.lat);
  const lng = normalizeCoord(company?.coordinates?.lng);

  if (lat === null || lng === null) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  return { lat, lng };
}

function FitBounds({ companies }) {
  const map = useMap();

  useEffect(() => {
    if (!companies.length) return;

    if (companies.length === 1) {
      map.setView([companies[0].coordinates.lat, companies[0].coordinates.lng], 11, {
        animate: true,
      });
      return;
    }

    const bounds = companies.map((company) => [company.coordinates.lat, company.coordinates.lng]);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
  }, [companies, map]);

  return null;
}

export function CompanyMap({ companies, selectedCompany, onSelectCompany }) {
  const mappableCompanies = companies
    .map((company) => {
      const safeCoordinates = getSafeCoordinates(company);
      return safeCoordinates
        ? {
            ...company,
            coordinates: safeCoordinates,
          }
        : null;
    })
    .filter(Boolean);

  const fallbackCenter = [-22.9056, -47.0608];
  const defaultCenter = mappableCompanies[0]
    ? [mappableCompanies[0].coordinates.lat, mappableCompanies[0].coordinates.lng]
    : fallbackCenter;

  return (
    <div className="map-frame">
      <MapContainer center={defaultCenter} zoom={7} scrollWheelZoom className="map-canvas">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds companies={mappableCompanies} />
        {mappableCompanies.map((company) => (
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
