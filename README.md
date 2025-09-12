# MapsLink

**MapsLink** is an interactive mapping platform designed to help users **discover companies and job opportunities**, especially in the **Campinas and São Paulo** regions of Brazil. It allows users to explore a dynamic map, browse a company list, and use a side filter panel to refine their search.

This is an academic project developed by students of **Computer Engineering at PUC‑Campinas**, focused on building real‑world applications using web technologies and good UI/UX practices.

---

## 🌐 Demo

> _Live version coming soon_  
> Screenshots and video demos will be added in future updates.

---

## ✅ Features

- Sticky top navigation bar with responsive layout  
- Interactive map centered on São Paulo / Campinas  
- Left panel with list of companies (scrollable and filterable)  
- Toggleable right panel with filter options  
- Map pins representing each company  
- Modern, clean UI with strong visual hierarchy  
- Responsive behavior for different screen sizes  

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)  
- **Icons:** Remix Icon  
- **Fonts:** Montserrat (headings), Open Sans (body)  
- **Map API:** (planned) Mapbox or Leaflet  
- **Design Tools:** Figma for wireframes and visual mockups  

---

## 📁 Project Structure

```
mapslink/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── assets/
│   └── images/
├── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

- Any modern browser (Chrome, Firefox, Edge)  
- Optional: local static server (for testing CORS/maps)  

### Run Locally

1. Clone the repository:
```bash
git clone https://github.com/guimais/mapslink.git
cd mapslink
```

2. Open the project:
- Open `index.html` directly in your browser  
**or**  
- Use a local server (recommended for some map APIs):
```bash
# using Python
python -m http.server 5173

# using Node
npx serve .

# or install a simple server globally
npm i -g http-server
http-server
```

Then visit `http://localhost:5173` or the printed URL in your terminal.

---

## 🧪 Status

The project is in early development phase.  
Current progress:
- [x] Initial layout and design system  
- [x] Responsive sticky navbar  
- [x] Company list UI  
- [x] Layout for map area and filter panel  
- [ ] Map integration with markers  
- [ ] Interactive filters  
- [ ] Company details and click behavior  

---

## 🔭 Roadmap

- [ ] Mobile version with bottom sheet  
- [ ] Integration with real data (via JSON or database)  
- [ ] Search bar and keyword filtering  
- [ ] Mapbox or Leaflet integration  
- [ ] Favorite companies (localStorage or backend)  
- [ ] Admin dashboard for managing companies/jobs  
- [ ] Job listing integration  
- [ ] Authentication system (optional)  
- [ ] English/Portuguese language toggle  

---

## 👨‍💻 Authors

This project is developed as part of our academic journey at **PUC‑Campinas (2nd semester)**.

| Name                               |
|------------------------------------|
| **Guilherme Carvalho Mais**        |
| **Gabriel Duarte Frias**           |
| **João Gabriel Breganon Ferreira** |
| **Gabriel Senatore Costa**         |
| **Luigi Lima**                     |

---

## 📜 License

This project is under the [MIT License](https://opensource.org/licenses/MIT).  
Feel free to fork, use, or contribute!

---

## 🙌 Acknowledgements

- Remix Icon: [https://remixicon.com](https://remixicon.com)  
- Google Fonts: [Montserrat](https://fonts.google.com/specimen/Montserrat), [Open Sans](https://fonts.google.com/specimen/Open+Sans)  
- Map tools (coming soon): Mapbox / Leaflet / Google Maps API  
- Special thanks to **Prof. Douglas de Assis Ferreira** for guidance during this project.
