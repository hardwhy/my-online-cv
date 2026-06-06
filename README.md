# ✨ Senior Engineer Portfolio

Welcome to my professional corner of the internet! 🌐 This repository contains the frontend applications for my personal CV and portfolio. It's built with modern tools to be fast, beautiful, and easy to maintain. 🚀

## 🌟 Features

- **Responsive & Mobile-First**: Looks great on your phone, tablet, or desktop! 📱💻
- **Light & Dark Mode**: Respects your eyes and your preferences. 🌙☀️
- **Silky Smooth Animations**: Powered by **Framer Motion** for that premium feel. ✨
- **Dynamic Content**: Fetches the latest data from Supabase or falls back to static files. 🔗
- **Command Palette**: Press `Cmd K` or `Ctrl K` to navigate like a pro! ⌨️
- **SEO Optimized**: Meta tags, Open Graph, and JSON-LD for maximum visibility. 🔍
- **Lazy Loading**: Fast initial loads and snappy transitions. ⚡️

## 🛠️ Tech Stack

- **React 19** ⚛️
- **TypeScript** 🟦
- **Vite** ⚡️
- **Tailwind CSS** 🎨
- **Framer Motion** 🎬
- **Nx** 🏗️
- **Supabase** ☁️

## 🚀 Getting Started

1.  **Install the goodies**:
    ```bash
    npm install
    ```

2.  **Start the magic**:
    ```bash
    # Run the public portfolio
    npm run dev

    # Run the admin dashboard
    npm run dev:admin
    ```

3.  **Build for production**:
    ```bash
    npm run build
    ```

## 🏗️ Project Structure

This is a monorepo powered by **Nx**!

- **[apps/web](file:///Users/nb-dk-0614/Documents/Personal Space/web-cv/apps/web)**: The public-facing portfolio website. 🌐
- **[apps/admin](file:///Users/nb-dk-0614/Documents/Personal Space/web-cv/apps/admin)**: The internal dashboard for managing content. 🛠️
- **[packages/](file:///Users/nb-dk-0614/Documents/Personal Space/web-cv/packages)**: Shared logic and UI components used by both apps. 📦

> **Note:** The backend PDF generation service has moved! Check out the [web-cv-services](https://github.com/your-username/web-cv-services) repository for the backend logic. 🚀

## 📊 Analytics

We keep it simple and private! 🕵️‍♂️ Analytics are stored locally in your browser, tracking:
- Page visits 📈
- PDF downloads 📄
- Form submissions ✉️

## 🌈 Customization

Want to make it your own? Just update the files in `apps/web/src/data/` or connect your own Supabase project! Check out `docs/supabase.md` for the setup guide. 📖

Happy building! 💻✨
