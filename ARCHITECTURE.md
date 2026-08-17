# HainhuShop architecture

- `src/app/pages`: route-level pages, each page owns its TS/HTML/CSS.
- `src/app/core`: services, guards and application configuration.
- `src/app/shared`: reusable models and UI components.
- Routes use Angular lazy loading with `loadComponent`.
- Tailwind utility classes live in HTML; component CSS is for local custom styles.
