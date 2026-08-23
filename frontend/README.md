# Virtual Workspace - Frontend 🎨✨

Welcome to the visual heartbeat of the Virtual Workspace. This frontend isn't just built; it's **vibe-coded**. 

👉 **Looking for the backend?** Check out the [Backend Documentation](../backend/README.md)

We aimed to create an interface that feels alive, modern, and incredibly satisfying to use. It leverages cutting-edge web technologies to deliver a premium user experience while maintaining a robust, scalable architecture beneath the surface.

## 🚀 Tech Stack & Advantages

- **Framework**: Angular 22
- **Performance**: Server-Side Rendering (SSR) enabled out of the box.
- **Iconography**: Lucide Angular for crisp, consistent, and highly customizable vector icons.
- **Styling**: Modern, native CSS focusing on fluid layouts, rich animations, and premium aesthetics.

### Why This Stack?
- **Blazing Fast Loads**: With Angular's SSR, the initial page load is pre-rendered, drastically improving SEO, Largest Contentful Paint (LCP), and perceived performance.
- **Type Safety**: Built entirely in strict TypeScript, eliminating entire classes of runtime errors.
- **Future-Proof**: Utilizing the latest Angular 22 features (standalone components, optimized control flow, signals) for a highly reactive and performant UI.

## 🌌 The "Vibe-Coded" Philosophy

When we say this is *vibe-coded*, we mean the design aesthetics were a primary engineering constraint, not an afterthought.

- **Dynamic Interfaces**: The UI features smooth micro-interactions, hover states, and transitions that make the application feel responsive and alive.
- **Premium Aesthetics**: Moving away from generic bootstrap-style layouts, we utilize modern design tokens—think glassmorphism, tailored HSL color palettes, deep dark modes, and modern typography.
- **Uncompromising UX**: Every button click, every room card, and every modal is designed to wow the user at first glance, encouraging interaction and engagement.

## 🏗️ Architecture & Structure

The frontend is strictly organized using a feature-driven architecture, making it highly modular and easy to navigate:

```text
src/app/
├── core/             # The backbone. Singleton services, interceptors, models, guards, and shared components.
│   ├── components/   # Global UI elements (Navbars, Loaders, Toasts)
│   ├── guards/       # Route protection (AuthGuard)
│   ├── interceptors/ # HTTP interception (JWT injection, global error handling)
│   ├── models/       # TypeScript interfaces reflecting backend DTOs
│   └── services/     # Global state and API services
└── features/         # Domain-specific modules
    ├── auth/         # Login, Registration
    ├── profile/      # User profile management
    └── rooms/        # Room directory, detail views, and real-time presence UI
```

### Key Technical Achievements
- **Seamless Auth Flow**: Interceptors automatically attach JWT tokens to outbound requests and gracefully handle 401 Unauthorized responses to keep the user experience uninterrupted.
- **Smart Components**: Separation of container components (handling logic/services) and presentational components (handling the vibes/UI).

## 🛠️ Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Development Server**:
   Run the application locally with live-reload:
   ```bash
   npm start
   # or
   ng serve
   ```
   The app will be available at `http://localhost:4200/`.

3. **Production Build**:
   ```bash
   npm run build
   ```
