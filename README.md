# hainhushop

Angular + Tailwind CSS + Supabase ecommerce/nhà thuốc.

## Structure

Each page keeps TypeScript, HTML and component CSS separate:

- `src/app/home.component.ts`
- `src/app/home.component.html`
- `src/app/home.component.css`

Tailwind utility classes are written in HTML. Shared/global styles are in `src/styles.css`.

## Development

```bash
npm install
npm start
```

## Production build

```bash
npm run build
```

## Vercel

The project is configured as an Angular SPA. `vercel.json` rewrites application routes to `index.html`.

## Supabase

Keep environment credentials in `src/environments/environment.ts` for the current project setup. Never commit service-role secrets.
