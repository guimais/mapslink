# 🌍 Maps Link

**Maps Link** is an interactive web platform that helps users discover **companies, job opportunities, and events directly on a map** starting with **Campinas (SP, Brazil)** and expanding further.

It connects people and businesses through geolocation, smart filters, and a clean, responsive interface built with simplicity and performance in mind.

---

## 🏗️ Project Overview

MapsLink is a front-end project developed as part of an academic and professional initiative to explore **web mapping technologies**, **data visualization**, and **user experience design** bringing together engineering, creativity, and functionality.

---

## 🚀 Features

- 📍 **Interactive Map** — view companies and open positions by region  
- 🔎 **Dynamic Filters** — search by city, sector, or keywords in real time  
- 🧭 **Sticky Navigation Bar** — fixed header for intuitive navigation  
- 🗂️ **Company & Profile Pages** — dedicated areas for users and businesses  
- 📊 **Dashboard Interface** — metrics, KPIs, and insights (in development)  
- 🌐 **Mobile-Ready Layout** — responsive design for all devices  
- 🧭 **Mapbox / Leaflet Integration (upcoming)**  

---

## 🧩 Tech Stack

| Category | Technologies |
|-----------|---------------|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **UI/UX** | Montserrat & Open Sans (Google Fonts), Remix Icons |
| **Mapping** | Leaflet / Mapbox API *(planned)* |
| **Deployment** | GitHub Pages |
| **Version Control** | Git & GitHub |

---

## 🗂️ Folder Structure

```
mapslink/
├─ index.html              # Home page
├─ pages/                  # Additional pages
│  ├─ vagas.html
│  ├─ mapacheio.html
│  ├─ perfilusuario.html
│  ├─ perfilempresa.html
│  └─ ...
├─ assets/
│  ├─ css/                 # Stylesheets
│  ├─ js/                  # JavaScript files
│  └─ images/              # Icons & graphics
├─ README.md
└─ LICENSE
```

> All pages share the same color tokens, typography, and responsive layout standards.

---

## 🛠️ How to Run Locally

Run a simple local server in the project root:

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

- [x] Core structure and layout  
- [x] Sticky navbar and navigation flow  
- [ ] JSON-based data layer for companies  
- [ ] Leaflet / Mapbox map integration  
- [ ] Search & filter system (city, sector, keyword)  
- [ ] User and company dashboards  
- [ ] Responsive mobile version  
- [ ] Authentication and login pages  
- [ ] Multi-language (pt/en) support  

---

## 🎨 Design Tokens

| Token | Example | Description |
|--------|----------|-------------|
| `--bg` | `#f8fafc` | Background color |
| `--surface` | `#edf2f7` | Card surface |
| `--text` | `#0f172a` | Primary text color |
| `--brand` | `#102569` | Brand primary |
| `--brand-2` | `#0b1b4a` | Brand secondary |

Typography:  
- **Montserrat** — titles & headings  
- **Open Sans** — paragraphs & UI text

---

## 🧭 Architecture Overview

1. **Frontend:** static HTML + CSS + JS (modular structure).  
2. **Map Module:** renders companies dynamically on the map.  
3. **Filter Module:** controls user search and updates map/list in real time.  
4. **Data Layer:** mock `companies.json` (future DB integration).  
5. **UI Layer:** manages components (navbar, cards, dashboard).  

---

## 💡 Development Guidelines

- Keep consistent code formatting (2-space indentation, no inline styles).  
- Use semantic HTML for accessibility (proper `<header>`, `<main>`, `<footer>`).  
- All scripts must include the `defer` attribute.  
- Maintain WCAG AA contrast ratios in color adjustments.  

---

## 📸 Demo Preview

*(coming soon — will be hosted via GitHub Pages)*  

Add screenshots or a short demo GIF once the first public version is deployed.

---

## 🤝 Contributing

1. **Fork** the repository  
2. **Create** a new branch:  
   ```bash
   git checkout -b feature/your-feature
   ```  
3. **Commit** your changes:  
   ```bash
   git commit -m "add: new feature"
   ```  
4. **Push** to your branch:  
   ```bash
   git push origin feature/your-feature
   ```  
5. **Open a Pull Request** 🚀  

---

## 👥 Team

| Member | Role |
|---------|------|
| **Guilherme Carvalho Mais** | Front-End Developer & Project Lead |
| **Gabriel Senatore** | Software Engineer |
| **João Breganon** | Front-End Developer |
| **Luigi Lima** | UX & UI Designer |
| **Gabriel Frias** | Full-Stack Support & Testing |

> Please keep all team credits visible in derived versions or forks.

---

## 🏆 Badges

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-lightgrey)
![Made with Love](https://img.shields.io/badge/made%20with-%E2%9D%A4-red)

---

## 📄 License

This project is licensed under the **MIT License** see the [LICENSE](./LICENSE) file for details.

---

> *“NEXUS CAREER connects more than locations, it connects people, ideas, and opportunities.”*  
> — The MapsLink Team
