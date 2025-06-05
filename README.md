# 🚀 Crypto Sentiment Dashboard

> A lightning-fast cryptocurrency sentiment analysis dashboard built with modern web technologies and deployed to the edge.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-crypto--sentiment--dashboard.mcp--server.workers.dev-blue?style=for-the-badge)](https://crypto-sentiment-dashboard.mcp-server.workers.dev/)
[![Deploy to Cloudflare Workers](https://img.shields.io/badge/Deploy%20to-Cloudflare%20Workers-orange?style=for-the-badge)](https://workers.cloudflare.com/)
[![GitHub Stars](https://img.shields.io/github/stars/danilobatson/crypto-sentiment-vite-cloudflare?style=for-the-badge)](https://github.com/danilobatson/crypto-sentiment-vite-cloudflare)

## 📱 Live Demo

![Crypto Sentiment Dashboard](crypto-sentiment-dashboard/screenshots/hero-desktop.png)

**[🚀 Try it live](https://crypto-sentiment-dashboard.mcp-server.workers.dev/)** - Search for any cryptocurrency to see real-time sentiment analysis!

## 🎬 See It In Action

![Demo GIF](crypto-sentiment-dashboard/demo.gif)

*Search any cryptocurrency symbol to get instant sentiment analysis with Galaxy Score, Alt Rank, social volume, and price data.*

## ✨ Features

- **⚡ Edge-Deployed** - Runs on 300+ global Cloudflare locations for sub-50ms responses
- **🔥 Modern Stack** - Built with Vite, React, and Cloudflare Workers
- **📊 Real-time Data** - Live cryptocurrency sentiment analysis powered by LunarCrush API
- **🛡️ Robust Validation** - Input validation, error handling, and graceful fallbacks
- **🎭 Demo Mode** - Works with mock data when API key isn't available
- **📱 Fully Responsive** - Optimized for mobile, tablet, and desktop
- **🚀 Auto-Deploy** - Continuous deployment via GitHub Actions
- **🎨 Professional UI** - LunarCrush-inspired dark theme design

## 📱 Responsive Design

![Mobile responsive design](crypto-sentiment-dashboard/screenshots/mobile-responsive.png)

*Fully responsive design that works perfectly on mobile, tablet, and desktop devices.*

## 🎭 Demo Mode & Error Handling

| Demo Mode | Error Handling |
|:---:|:---:|
| ![Demo mode with mock data](crypto-sentiment-dashboard/screenshots/demo-mode.png) | ![Input validation](crypto-sentiment-dashboard/screenshots/validation-error.png) |
| *Demo mode with realistic mock data* | *Smart input validation and error handling* |

## 🎯 Why This Project?

This dashboard demonstrates modern full-stack development patterns while showcasing the power of edge computing. It's designed to be both educational and production-ready, teaching developers how to:

- Build full-stack applications with serverless architecture
- Integrate third-party APIs securely and efficiently
- Implement professional error handling and user experience patterns
- Deploy to global edge infrastructure with zero configuration
- Set up modern CI/CD workflows with GitHub Actions

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend │────│ Cloudflare Worker │────│ LunarCrush API  │
│   (Vite + SPA)   │    │   (Edge API)     │    │   (Sentiment)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        │
        │                        │                        │
    ┌───▼────┐              ┌────▼────┐              ┌───▼───┐
    │Browser │              │ Edge    │              │ Real  │
    │ Cache  │              │ Cache   │              │ Data  │
    └────────┘              └─────────┘              └───────┘
```

*Modern serverless architecture leveraging edge computing for optimal performance and global scalability.*
