# 🌍 MapsLink

**MapsLink** is an interactive web platform designed to help users discover **companies, job opportunities, and events directly on a map**, starting with **Campinas (SP, Brazil)** and expanding to broader regions.

It connects people and businesses using geolocation, dynamic filtering, and a clean, responsive interface — built with performance, simplicity, and modular structure in mind.

---

## 🏗️ Project Overview

MapsLink is a fully front-end project built for academic and professional development. It explores **web mapping**, **data visualization**, and **user-centered design**, combining technical skills with practical use cases and intuitive interaction.

---

## 🚀 Features

- 📍 **Interactive Map** – view companies by location using map markers  
- 🔎 **Real-Time Filters** – filter by city, sector, or keyword dynamically  
- 🧭 **Sticky Navigation** – consistent top navigation across all pages  
- 👥 **Company & User Dashboards** – separate profiles for both user types  
- 📊 **Resume & Vacancy Management** – filterable, exportable data  
- 📆 **Agenda Scheduling** – company-facing calendar for interviews and events  
- 📱 **Responsive Layout** – mobile-first design, installable as a PWA  
- 🌐 **Multi-page SPA Behavior** – each page with its own JS/CSS for isolation  
- 🗺️ **Leaflet Map Integration** – powered by `companies.json` and filters  

---

## 🧩 Tech Stack

| Category        | Technologies                         |
|----------------|--------------------------------------|
| **Frontend**    | HTML5, CSS3, JavaScript (Vanilla)    |
| **UI/UX**       | Google Fonts (Montserrat, Open Sans), Remix Icon |
| **Mapping**     | Leaflet.js (via CDN), `companies.json` |
| **Data Layer**  | JSON files (`users.json`, `companies.json`) |
| **State**       | `localStorage` (mock session/auth)   |
| **Deployment**  | GitHub Pages                         |
| **Versioning**  | Git & GitHub                         |

---

## 🗂️ Folder Structure

```
mapslink/
├─ index.html
├─ pages/
│  ├─ paginamapav4.html
│  ├─ mapacheio.html
│  ├─ vagas.html
│  ├─ paginacurriculo.html
│  ├─ perfilusuario.html
│  ├─ perfilempresa.html
│  ├─ agenda.html
│  ├─ ...
├─ assets/
│  ├─ css/           # One CSS per page
│  ├─ js/            # One JS per page + shared
│  ├─ data/          # JSON files
│  └─ images/        # Icons, logos, and illustrations
├─ manifest.json     # PWA configuration
├─ README.md
└─ LICENSE
```

> Design tokens, color palettes, layout system, and typography are shared across all pages.

---

## 🛠️ How to Run Locally

Use a basic HTTP server at the root of the project.

**Option 1 – Python**
```bash
python -m http.server
```

**Option 2 – Node.js**
```bash
npx http-server
```

Then open your browser at:
```
http://localhost:8000
```

---

## 🗺️ Roadmap

- [x] Modular HTML/CSS/JS structure  
- [x] Sticky navbar + navigation flow  
- [x] Authentication and login pages  
- [x] companies.json + map integration  
- [x] Leaflet rendering with filters  
- [x] Filtered company listing and sidebar  
- [x] Dashboards: user and company views  
- [x] Responsive PWA experience  
- [ ] Resume upload and viewer  
- [ ] Search by keyword and sector  
- [ ] Mapbox support (optional)  
- [ ] Multi-language (pt/en) toggle  

---

## 🎨 Design Tokens

| Token         | Value     | Description            |
|---------------|-----------|------------------------|
| `--bg`        | `#f8fafc` | General background     |
| `--surface`   | `#edf2f7` | Card & panel surface   |
| `--text`      | `#0f172a` | Main text              |
| `--brand`     | `#102569` | Primary brand color    |
| `--brand-2`   | `#0b1b4a` | Secondary brand        |

Fonts:
- **Montserrat** – titles & sections  
- **Open Sans** – paragraphs and UI components

---

## 🧭 Architecture Overview

1. **Frontend:** static multi-page app with modular HTML/CSS/JS.  
2. **Map Module:** loads and displays `companies.json` markers with filters.  
3. **Filter Module:** updates the map and list sidebar in real-time.  
4. **Data Layer:** simulates backend using local JSON and fetch API.  
5. **UI Layer:** navbar, panels, forms, list rendering, role-based redirection.

---

## 💡 Development Guidelines

- Always use semantic HTML (`<header>`, `<nav>`, `<main>`, etc.)  
- Enforce consistent spacing and indentation (2 spaces)  
- Avoid inline styles; use external `.css` only  
- All `<script>` tags use the `defer` attribute  
- Respect WCAG contrast and accessibility best practices  
- No external frameworks or build tools — pure client-side

---

## 📸 Demo Preview

GitHub Pages deployment coming soon...

> Screenshots and GIF demos will be added once version 1.0 is live.

---

## 🤝 Contributing

1. **Fork** this repository  
2. **Create** a new branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. **Commit** your changes:
   ```bash
   git commit -m "add: your message"
   ```
4. **Push** the branch:
   ```bash
   git push origin feature/your-feature
   ```
5. **Submit a Pull Request**

---

## 👥 Team

| Name                     | Role                         |
|--------------------------|------------------------------|
| **Guilherme Carvalho Mais** | Front-End Developer & Lead |
| **Gabriel Senatore**     | Software Engineer            |
| **João Breganon**        | Front-End Developer          |
| **Luigi Lima**           | UI/UX Designer               |
| **Gabriel Frias**        | Full-Stack Support & QA      |

> Attribution and credits must remain in all forks and derivations.

---

## 🏆 Badges

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![Deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-lightgrey)
![Made with Love](https://img.shields.io/badge/made%20with-%E2%9D%A4-red)

---

## 📄 License

Licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.

---

> *“MapsLink connects more than places — it connects people, ideas, and opportunities.”*
