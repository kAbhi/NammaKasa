# NammaKasa 🗑️

**Bengaluru's Smart Household Waste Coordination App**

A complete, mobile-first civic-tech web application solving Bengaluru's irregular household garbage collection and waste disposal coordination problem.

## Tech Stack
- **React 18** + **Vite 6**
- **Tailwind CSS 3**
- **Lucide React** icons
- **localStorage** for persistence (no backend required)

## Features

### 👨‍👩‍👧 Resident
- Select locality (Whitefield / Indiranagar / Koramangala) and street
- View next garbage collection window and collection days
- See estimated truck arrival time per street
- **Mark garbage as ready** for collection
- **Confirm successful collection**
- **Report missed collection** with description and photo
- **Report garbage blackspot** (illegal dumping)
- **AI Waste Segregation Assistant** – ask how to dispose of any item per BBMP rules
- Full history of requests and complaints

### 🚛 Collection Worker
- View assigned route and locality
- See all household stops on the route
- Households that marked garbage **ready** are highlighted
- **Mark individual stops as collected**
- **Report delays** with duration and reason
- Start / Complete / Reopen route status
- Arrival time schedule per street

### 🛡️ BBMP Admin
- Summary stats: total requests, completed, pending, open complaints
- **Locality-wise collection performance** with rate bars
- Today's route status overview
- **Manage complaints** – view, expand, and resolve
- **Garbage blackspot registry** – severity, status, resolve
- Worker status and performance monitoring

## Demo Accounts

| Role | Account | PIN |
|------|---------|-----|
| Resident | Priya Sharma – #12 Sai Residency, ITPL Main Road, Whitefield | `1234` |
| Resident | Vikram Singh – #88 Landmark Building, 100 Feet Road, Indiranagar | `6789` |
| Resident | Kiran Kumar – #1A Forum Residency, 5th Block, Koramangala | `0123` |
| Worker | Raju K. – Whitefield Route A | `1111` |
| Worker | Suresh B. – Indiranagar Route B | `2222` |
| Worker | Krishnamurthy V. – Koramangala Route C | `3333` |
| Admin | BBMP Admin | `0000` |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Cross-Role Data Flow

```
Resident marks garbage ready
        ↓
Request appears in Worker's route stops (highlighted)
        ↓
Worker marks stop as collected
        ↓
Resident sees "Collected" status + history updated
        ↓
Admin sees completion rate updated in real-time
```

All data persists across page refreshes via `localStorage`.

## Project Structure

```
src/
├── App.jsx                  # Role-based router
├── context/
│   └── AppContext.jsx       # Global state + all actions
├── data/
│   ├── storage.js           # localStorage CRUD helpers
│   └── seed.js              # Bengaluru sample data
├── components/
│   └── shared.jsx           # Logo, Badge, Card, Modal, etc.
└── pages/
    ├── LoginPage.jsx        # Role selection + PIN auth
    ├── ResidentPage.jsx     # Full resident dashboard
    ├── WorkerPage.jsx       # Worker route management
    ├── AdminPage.jsx        # Admin monitoring dashboard
    └── WasteAssistant.jsx   # AI-style waste guide chatbot
```
