# Virtual Workspace - Frontend 🎨✨

Welcome to the visual heartbeat of the Virtual Workspace. This frontend isn't just built; it's **vibe-coded**. 

👉 **Looking for the backend?** Check out the [Backend Documentation](../backend/README.md)

We aimed to create an interface that feels alive, modern, and incredibly satisfying to use. It leverages cutting-edge web technologies to deliver a premium user experience while maintaining a robust, scalable architecture beneath the surface.

## 🚀 Tech Stack & Technical Deep Dive

- **Framework**: Angular 22
- **Performance**: Server-Side Rendering (SSR) & Hydration
- **Iconography**: Lucide Angular for crisp, consistent, and highly customizable vector icons.
- **Styling**: Modern, native CSS utilizing variables, grid/flexbox layouts, and fluid typography.
- **Build Tool**: Angular CLI with esbuild for blazing-fast builds.

### Why This Stack?
- **Blazing Fast Loads**: With Angular's SSR, the initial page load is pre-rendered on the node server (`server.mjs`), drastically improving SEO, Largest Contentful Paint (LCP), and perceived performance. Client-side hydration seamlessly takes over for a SPA experience.
- **Type Safety**: Built entirely in strict TypeScript, eliminating entire classes of runtime errors and ensuring models align perfectly with the backend DTOs.
- **Modern Angular Features**: Utilizing the latest Angular 22 features, including **Standalone Components** (removing the need for `NgModules`), optimized **Control Flow** (`@if`, `@for`), and **Signals** for highly reactive, glitch-free UI state management.

## 🌌 The "Vibe-Coded" Philosophy

When we say this is *vibe-coded*, we mean the design aesthetics were a primary engineering constraint, not an afterthought.

- **Dynamic Interfaces**: The UI features smooth micro-interactions, hover states, and transitions that make the application feel responsive and alive.
- **Premium Aesthetics**: Moving away from generic bootstrap-style layouts, we utilize modern design tokens—think glassmorphism, tailored HSL color palettes, deep dark modes, and modern typography.
- **Uncompromising UX**: Every button click, every room card, and every modal is designed to wow the user at first glance, encouraging interaction and engagement. Forms utilize Angular's Reactive Forms for instant, custom validation feedback.

## 🏗️ Architecture & Structure

The frontend is strictly organized using a feature-driven architecture, making it highly modular and easy to navigate:

```text
src/app/
├── core/             # The backbone. Singleton services, interceptors, models, guards, and shared components.
│   ├── components/   # Global UI elements (Navbars, Loaders, Toasts)
│   ├── guards/       # Route protection (AuthGuard using inject(Router))
│   ├── interceptors/ # HTTP interception (JWT injection, global error handling)
│   ├── models/       # TypeScript interfaces reflecting backend DTOs
│   └── services/     # Global state and API services
└── features/         # Domain-specific modules
    ├── auth/         # Login, Registration (Reactive Forms)
    ├── profile/      # User profile management
    └── rooms/        # Room directory, detail views, and real-time presence UI
```

### Key Technical Achievements
- **Seamless Auth Flow**: Functional HTTP Interceptors (`HttpInterceptorFn`) automatically attach JWT tokens from local storage to outbound requests. If a `401 Unauthorized` response is caught, the interceptor gracefully handles token expiration by redirecting to the login flow without breaking the app state.
- **Smart & Dumb Components**: Strict separation of container components (handling logic/services/state) and presentational components (handling the vibes/UI/DOM events), adhering to unidirectional data flow.
- **Proxy Configuration**: Integrated `dev-proxy.conf.json` to seamlessly route local API calls (`/api/v1/*`) to the Spring Boot backend during development, avoiding CORS issues.

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
   The app will be available at `http://localhost:4200/`. API requests will be proxied automatically.

3. **Production Build**:
   ```bash
   npm run build
   ```
   This generates both browser and server bundles in the `dist/` directory.

4. **Serve SSR locally**:
   ```bash
   npm run serve:ssr:frontend
   ```
