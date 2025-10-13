# 🌍 MapsLink

**MapsLink** is an interactive web platform that helps users discover **companies, job opportunities, and events directly on a map** — starting with **Campinas (SP, Brazil)** and expanding further.

It connects people and businesses through geolocation, smart filters, and a clean, responsive interface built with simplicity and performance in mind.

---

## 🏗️ Project Overview

MapsLink is a front-end project developed as part of an academic and professional initiative to explore **web mapping technologies**, **data visualization**, and **user experience design** — bringing together engineering, creativity, and functionality.

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

mapslink/
├─ index.html # Home page
├─ pages/ # Additional pages
│ ├─ vagas.html
│ ├─ mapacheio.html
│ ├─ perfilusuario.html
│ ├─ perfilempresa.html
│ └─ ...
├─ assets/
│ ├─ css/ # Stylesheets
│ ├─ js/ # JavaScript files
│ └─ images/ # Icons & graphics
├─ README.md
└─ LICENSE

yaml
Copiar código

> All pages share the same color tokens, typography, and responsive layout standards.

---

## 🛠️ How to Run Locally

Run a simple local server in the project root:

**Option 1 – Python**
```bash
python -m http.server
Option 2 – Node.js

bash
Copiar código
npx http-server
Then open your browser at:

arduino
Copiar código
http://localhost:8000
🗺️ Roadmap
 Core structure and layout

 Sticky navbar and navigation flow

 JSON-based data layer for companies

 Leaflet / Mapbox map integration

 Search & filter system (city, sector, keyword)

 User and company dashboards

 Responsive mobile version

 Authentication and login pages

 Multi-language (pt/en) support

🎨 Design Tokens
Token	Example	Description
--bg	#f8fafc	Background color
--surface	#edf2f7	Card surface
--text	#0f172a	Primary text color
--brand	#102569	Brand primary
--brand-2	#0b1b4a	Brand secondary

Typography:

Montserrat — titles & headings

Open Sans — paragraphs & UI text

🧭 Architecture Overview
Frontend: static HTML + CSS + JS (modular structure).

Map Module: renders companies dynamically on the map.

Filter Module: controls user search and updates map/list in real time.

Data Layer: mock companies.json (future DB integration).

UI Layer: manages components (navbar, cards, dashboard).

💡 Development Guidelines
Keep consistent code formatting (2-space indentation, no inline styles).

Use semantic HTML for accessibility (proper <header>, <main>, <footer>).

All scripts must include the defer attribute.

Maintain WCAG AA contrast ratios in color adjustments.

📸 Demo Preview
(coming soon — will be hosted via GitHub Pages)

Add screenshots or a short demo GIF once the first public version is deployed.

🤝 Contributing
Fork the repository

Create a new branch: git checkout -b feature/your-feature

Commit your changes: git commit -m "add: new feature"

Push to your branch: git push origin feature/your-feature

Open a Pull Request 🚀

👥 Team
Member	Role
Guilherme Carvalho Mais	Front-End Developer & Project Lead
Gabriel Senatore	Software Engineer
João Breganon	Front-End Developer
Luigi Lima	UX & UI Designer
Gabriel Frias	Full-Stack Support & Testing
Co-Ideation: Guadalupe Candela Peralta	

Please keep all team credits visible in derived versions or forks.

🏆 Badges




📄 License
This project is licensed under the MIT License — see the LICENSE file for details.

“MapsLink connects more than locations — it connects people, ideas, and opportunities.”
— The MapsLink Team