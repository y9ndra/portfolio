# Portfolio

A responsive, high-performance, and visually stunning developer portfolio built using **Next.js 16 (App Router)** and **Tailwind CSS v4**. It features interactive theme switching, scroll reveal animations, a live GitHub activity calendar, and a dynamic page views tracker backed by Upstash Redis.

## Screenshot

![Portfolio Landing Page (Dark Theme)](public/assets/images/screenshot.png)

---

## Features

- **Dynamic Theme Switcher**: Instantly toggle between a sleek, futuristic dark theme (default) and a clean, high-contrast light theme.
- **Micro-interactions & SFX**: Auditory click feedback and subtle hover effects to elevate the user experience.
- **Scroll-Reveal Animations**: Fluid fade-in animations on scroll implemented via custom React Intersection Observer hooks.
- **Dynamic Views Analytics**: Real-time counter of portfolio views using Next.js Route Handlers powered by Redis (`ioredis` client) with an in-memory local fallback.
- **Live GitHub Calendar**: Integrates a clean contribution calendar directly into the page.
- **Responsive Layout**: Designed mobile-first for flawless presentation on all screens.
- **Clean Structure & Componentization**: Fully modular code separated into concise components.

---

## Tech Stack

- **Core Framework**: [Next.js 16 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS with custom theme tokens
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database/Cache**: Upstash Redis via `ioredis` (for the profile views counter)
- **Deployment**: Vercel

---

## Project Structure

```text
├── src/
│   ├── app/                 
│   │   ├── api/
│   │   │   └── views/         
│   │   ├── globals.css         
│   │   └── layout.tsx       
│   │
│   ├── components/           
│   │   ├── Hero.tsx           
│   │   ├── Skills.tsx          
│   │   ├── Projects.tsx       
│   │   ├── Experience.tsx      
│   │   ├── Contact.tsx        
│   │   ├── GithubCalendar.tsx  
│   │   └── ClickSound.tsx      
│   │
│   ├── data/
│   │   └── portfolio.ts       
│   │
│   └── hooks/
│       └── useScrollReveal.ts  
```

---

## Local Setup & Development

### 1. Clone the repository
```bash
git clone https://github.com/y9ndra/portfolio.git
cd portfolio
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
To enable the dynamic views counter, create a `.env.local` file in the root of the project:
```env
KV_REDIS_URL="rediss://default:your-token@your-redis-instance.upstash.io:6379"
```
*(If no environment variable is provided, the API automatically falls back to an in-memory counter for local development.)*

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## Build & Production

To build a production bundle and run the server locally:
```bash
npm run build
npm run start
```
