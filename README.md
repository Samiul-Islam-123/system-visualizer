# system-visualizer

> Visualize distributed systems, network traffic, and load balancing in real-time.

![GitHub stars](https://img.shields.io/github/stars/Samiul-Islam-123/system-visualizer?style=for-the-badge&logo=github) ![GitHub forks](https://img.shields.io/github/forks/Samiul-Islam-123/system-visualizer?style=for-the-badge&logo=github) ![GitHub issues](https://img.shields.io/github/issues/Samiul-Islam-123/system-visualizer?style=for-the-badge&logo=github) ![Last commit](https://img.shields.io/github/last-commit/Samiul-Islam-123/system-visualizer?style=for-the-badge&logo=github) ![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![License](https://img.shields.io/badge/license-ISC-green?style=for-the-badge)

## 📑 Table of Contents

- [Description](#description)
- [Key Features](#key-features)
- [Use Cases](#use-cases)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Key Dependencies](#key-dependencies)
- [Available Scripts](#available-scripts)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

##  Description

system-visualizer is a tool designed to simulate and visualize distributed systems and their network traffic. It provides an interactive dashboard to monitor simulated components, helping developers understand how traffic propagates through distributed topologies, load balancers, and backend servers. The system helps demystify network architecture by modeling traffic behavior in a localized environment.

##  Key Features

- **📊 React Frontend Dashboard** — An interactive user interface built with Vite and React to visualize live traffic metrics.
- **⚖️ Load Balancing Simulation** — Features a dedicated LoadBalancer module to distribute simulated traffic across multiple nodes.
- **🐳 Docker Compose Orchestration** — Utilizes a pre-configured Docker Compose file to orchestrate the backend server, database, and client services.
- **📥 Automated Data Importation** — Includes an automated script to parse and import dataset components for simulation scenarios.
- **💾 PostgreSQL Metric Storage** — Leverages PostgreSQL to store simulated traffic logs and node states for visualization.

##  Use Cases

- Simulating distributed system topologies and analyzing how traffic distributes across load balancers.
- Teaching and demonstrating core distributed systems concepts, such as network latency and node failures, using visual aids.
- Testing and debugging routing logic in a containerized environment before deploying to production cloud providers.

##  Tech Stack

- 🥟 **Bun**
- 🐳 **Docker**
- 🚀 **Express.js**
- 🟨 **JavaScript**
- 🐘 **PostgreSQL**
- ⚡ **Vite**

##  Quick Start

```bash

# 1. Clone the repository
git clone https://github.com/Samiul-Islam-123/system-visualizer.git

# 2. Install dependencies
bun install

# 3. Start the dev server
npm run start
```

##  Key Dependencies

```
axios: ^1.15.0
child_process: ^1.0.2
cors: ^2.8.6
csv-parser: ^3.2.0
dockerode: ^4.0.10
dotenv: ^17.4.2
express: ^5.2.1
http-proxy: ^1.18.1
node-fetch: ^3.3.2
og: ^0.0.2
os-utils: ^0.0.14
pg: ^8.20.0
```

##  Available Scripts

- **test** — `npm run test`
- **start** — `npm run start`

##  API Endpoints

Detected endpoints (best-effort scan):

```
GET /usage
GET /
```

##  Project Structure

```
.
├── LoadBalancer
│   ├── Algorithms.js
│   ├── index.js
│   └── worker.js
├── LoadBalancer.js
├── Simulator
│   └── simulate.js
├── dataset
│   ├── olist_customers_dataset.csv
│   ├── olist_geolocation_dataset.csv
│   ├── olist_order_items_dataset.csv
│   ├── olist_order_payments_dataset.csv
│   ├── olist_order_reviews_dataset.csv
│   ├── olist_orders_dataset.csv
│   ├── olist_products_dataset.csv
│   ├── olist_sellers_dataset.csv
│   └── product_category_name_translation.csv
├── docker-compose.yml
├── frontend
│   ├── bunfig.toml
│   ├── components.json
│   ├── eslint.config.js
│   ├── package.json
│   ├── src
│   │   ├── components
│   │   │   ├── sim
│   │   │   │   ├── ControlPanel.tsx
│   │   │   │   ├── ServerCard.tsx
│   │   │   │   ├── StatCard.tsx
│   │   │   │   ├── TrafficChart.tsx
│   │   │   │   └── TypeBreakdown.tsx
│   │   │   └── ui
│   │   │       ├── accordion.tsx
│   │   │       ├── alert-dialog.tsx
│   │   │       ├── alert.tsx
│   │   │       ├── aspect-ratio.tsx
│   │   │       ├── avatar.tsx
│   │   │       ├── badge.tsx
│   │   │       ├── breadcrumb.tsx
│   │   │       ├── button.tsx
│   │   │       ├── calendar.tsx
│   │   │       ├── card.tsx
│   │   │       ├── carousel.tsx
│   │   │       ├── checkbox.tsx
│   │   │       ├── collapsible.tsx
│   │   │       ├── command.tsx
│   │   │       ├── context-menu.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── drawer.tsx
│   │   │       ├── dropdown-menu.tsx
│   │   │       ├── form.tsx
│   │   │       ├── hover-card.tsx
│   │   │       ├── input-otp.tsx
│   │   │       ├── input.tsx
│   │   │       ├── label.tsx
│   │   │       ├── menubar.tsx
│   │   │       ├── navigation-menu.tsx
│   │   │       ├── pagination.tsx
│   │   │       ├── popover.tsx
│   │   │       ├── progress.tsx
│   │   │       ├── radio-group.tsx
│   │   │       ├── resizable.tsx
│   │   │       ├── scroll-area.tsx
│   │   │       ├── select.tsx
│   │   │       ├── separator.tsx
│   │   │       ├── sheet.tsx
│   │   │       ├── sidebar.tsx
│   │   │       ├── skeleton.tsx
│   │   │       ├── slider.tsx
│   │   │       ├── sonner.tsx
│   │   │       ├── switch.tsx
│   │   │       ├── table.tsx
│   │   │       ├── tabs.tsx
│   │   │       ├── textarea.tsx
│   │   │       ├── toggle-group.tsx
│   │   │       ├── toggle.tsx
│   │   │       └── tooltip.tsx
│   │   ├── hooks
│   │   │   ├── use-mobile.tsx
│   │   │   ├── use-server-stats.ts
│   │   │   └── use-simulator.ts
│   │   ├── lib
│   │   │   ├── simulator-types.ts
│   │   │   └── utils.ts
│   │   ├── routeTree.gen.ts
│   │   ├── router.tsx
│   │   ├── routes
│   │   │   ├── __root.tsx
│   │   │   └── index.tsx
│   │   └── styles.css
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── wrangler.jsonc
├── frontend-dashboard
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── public
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── assets
│   │   │   ├── hero.png
│   │   │   ├── react.svg
│   │   │   └── vite.svg
│   │   ├── components
│   │   │   ├── ConsoleLogs.jsx
│   │   │   ├── ControlPanel.jsx
│   │   │   ├── DetailedResults.jsx
│   │   │   ├── ServerCard.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── TrafficChart.jsx
│   │   │   └── TypeBreakdown.jsx
│   │   ├── hooks
│   │   │   ├── useServerStats.js
│   │   │   └── useSimulator.js
│   │   ├── index.css
│   │   └── main.jsx
│   └── vite.config.js
├── import-data-automation.js
├── package.json
├── server
│   ├── Dockerfile
│   ├── db.js
│   ├── index.js
│   └── routes
│       └── analytics.js
└── test.js
```

## 🛠️ Development Setup

### Node.js / JavaScript
1. Install Node.js (v18+ recommended)
2. Install dependencies: `npm install` (or `yarn` / `pnpm install` / `bun install`)
3. Start the dev server: see the **Quick Start** above

### Docker
1. `docker build -t my-app .`
2. `docker run -p 3000:3000 my-app`

##  Deployment

### Docker
```bash
docker build -t system-visualizer .
docker run -p 3000:3000 system-visualizer
```

### Docker Compose
```bash
docker compose up -d
```

##  Contributing

Contributions are welcome! Here's the standard flow:

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/Samiul-Islam-123/system-visualizer.git`
3. **Branch**: `git checkout -b feature/your-feature`
4. **Commit**: `git commit -m 'feat: add some feature'`
5. **Push**: `git push origin feature/your-feature`
6. **Open** a pull request

Please follow the existing code style and include tests for new behavior where applicable.

