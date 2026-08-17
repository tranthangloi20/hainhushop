# hainhushop

Angular + Supabase + Tailwind CSS shop.

## Features

- Product search.
- Product categories.
- Hot/promotional products and regular products.
- Zalo/phone contact flow instead of online checkout.
- Doctor/pharmacist consultation call-to-action.
- Admin login with Supabase Auth.
- Admin product CRUD.
- Product category selection.
- Product image upload to Supabase Storage.
- Lazy-loaded Angular routes.
- Tailwind CSS v4.

## Before production

Update the phone numbers in:

`src/app/shop-config.ts`

The current values are placeholders.

## Local development

```bash
npm install
npm start
```

## Build

```bash
npm run build
```

The Supabase database migration has already been applied to the connected project. The SQL migration is also kept in `supabase/migrations/` for source control.





Vậy kiến trúc của hainhushop thực tế là

                    ┌─────────────────┐
                    │     GitHub      │
                    │ hainhushop repo │
                    └────────┬────────┘
                             │
                         git push
                             │
                             ▼
                    ┌─────────────────┐
                    │     Vercel      │
                    │  Build Angular  │
                    └────────┬────────┘
                             │
                             ▼
                    🌐 Hải Như Shop
                             │
                    Angular chạy ở đây
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
             👤 Khách hàng       👨‍💼 Admin
                    │                 │
                    └────────┬────────┘
                             │
                         API calls
                             │
                             ▼
                    ┌─────────────────┐
                    │    Supabase     │
                    │    hainhushop   │
                    ├─────────────────┤
                    │ products        │
                    │ contact_messages │
                    │ authentication  │
                    └─────────────────┘