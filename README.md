# 🌍 **MapsLink — Connecting People, Places, and Opportunities**

MapsLink is a modern academic and professional web project that connects **companies**, **students**, and **opportunities** through an interactive, data-driven map.  
Created with clarity, teamwork, and vision, it transforms real geographic and professional data starting in **Campinas, São Paulo** — into an accessible and inspiring experience.

## ✨ **Project Overview**
The idea behind MapsLink is simple yet powerful:  
> _Show where the opportunities really are._

By combining modern web technologies with thoughtful design, the platform allows users to **navigate an interactive map**, **filter companies and job listings**, and **explore individual profiles** all in a clean, intuitive interface.  
MapsLink stands for **accessibility, modernity, and human connection**, turning location data into meaningful insight.

## ⚙️ **Core Features**
- 🗺️ **Interactive Map (Leaflet.js)** — Displays companies and opportunities directly on a live map.  
- 🔍 **Smart Filters** — Filter by sector, city, or keyword dynamically, without page reload.  
- 📄 **Dedicated Pages** — Modular structure: login, registration, dashboard, and jobs.  
- 🎨 **Modern Responsive UI** — Fixed 68 px navbar, mobile-friendly, unified color tokens.  
- ⚡ **Optimized Performance** — Lightweight JS with `defer`, centralized CSS tokens.  
- 🌐 **PWA Ready** — Manifest prepared for installation and offline use.  
- 👥 **Team Collaboration** — Built collaboratively with version control and clear structure.

## 🧠 **Technology Stack**
| Layer | Tools & Libraries |
|-------|--------------------|
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **Mapping** | Leaflet.js |
| **Data** | JSON (`companies.json`) |
| **UI Design** | Montserrat & Open Sans |
| **Hosting** | GitHub Pages |
| **Versioning** | Git / GitHub |

## 🗂️ **Folder Structure**
mapslink/
│
├── index.html
├── manifest.json
├── README.md
│
├── assets/
│ ├── css/
│ │ ├── main.css
│ │ ├── responsive.css
│ │ ├── tokens.css
│ │ ├── mapacheio.css
│ │ ├── vagas.css
│ │ ├── about.css
│ │ ├── contact.css
│ │ ├── agenda.css
│ │ ├── perfilusuario.css
│ │ ├── perfilempresa.css
│ │ ├── paginainicial.css
│ │ ├── paginadashboard.css
│ │ └── (other page styles)
│ │
│ ├── js/
│ │ ├── _shared-nav.js
│ │ ├── main.js
│ │ ├── map.js
│ │ ├── filters.js
│ │ ├── maps-data.js
│ │ ├── utils.js
│ │ └── (page-specific scripts)
│ │
│ ├── data/
│ │ └── companies.json
│ │
│ └── images/
│ ├── logo-icon-192.png
│ ├── logo-icon-512.png
│ └── (other UI assets)
│
└── pages/
├── vagas.html
├── mapa.html
├── perfilusuario.html
├── perfilempresa.html
├── paginadashboard.html
├── paginainicial.html
├── loginpessoal.html
├── loginempresa.html
├── registroempresa.html
├── registropessoal.html
├── tabelavagas.html
├── esqueceusenha.html
├── selecaoperfil.html
├── enviocurriculo.html
├── paginaplanos.html
├── about.html
├── agenda.html
└── contact.html

## 🧩 **Development Guidelines**
1. All CSS rules use **open braces** — no inline or compressed syntax.  
2. **No comments** in final CSS files.  
3. Design tokens (colors, spacing, typography, shadows, radius) live in `tokens.css`.  
4. Navbar height fixed at **68 px** globally.  
5. **Media queries** ensure proper responsiveness.  
6. Every script uses **`defer`** for optimized load.  
7. Use **relative paths** (`./assets/...`) for GitHub Pages deployment.  
8. Unified **font system** — Montserrat for titles, Open Sans for text.  
9. Accessibility features: `aria-label`s, focus styles, descriptive alt texts.

## 🚀 **How to Run Locally**
```bash
git clone https://github.com/guimais/mapslink.git
cd mapslink
python -m http.server 8000
# or
npx http-server -p 8000

Then open http://localhost:8000
 in your browser.


---

🧭 **Planned Updates (Roadmap)**
- ✅ Publish v1.0 on GitHub Pages  
- 🗺️ Expand and refine `companies.json` dataset  
- 🧮 Enhanced filter logic and map clustering  
- 📱 Offline PWA support  
- 🌍 Add multilingual interface (EN / PT-BR)  
- 🧠 Simple analytics dashboard for company density

## 👨‍💻 **Team**
| **Member** | **Role** |
|-------------|-----------|
| **Guilherme Carvalho Mais** | Front-End Developer & Project Lead |
| **Gabriel Senatore** | Software Engineer |
| **João Breganon** | Front-End Developer |
| **Luigi Lima** | UX & UI Designer |
| **Gabriel Frias** | Full-Stack Support & Testing |

> Please keep all team credits visible in derived versions or forks.

## 🏆 **Badges**
![status](https://img.shields.io/badge/status-in%20development-yellow)
![license](https://img.shields.io/badge/license-MIT-blue)
![deploy](https://img.shields.io/badge/deploy-GitHub%20Pages-brightgreen)
![made](https://img.shields.io/badge/made%20with-%E2%9D%A4-red)

## 📜 **License**
Licensed under the **MIT License** — open for educational and creative use.

---

## 🌐 **Demo**
🚧 *Coming soon on GitHub Pages!*  
👉 [https://github.com/guimais/mapslink](https://github.com/guimais/mapslink)

---

## 💬 **Final Words**
> “MapsLink is more than just code, it’s a bridge between people, technology, and opportunity.  
> Built with curiosity, discipline, and teamwork — showing that innovation starts when we map the world around us.”





