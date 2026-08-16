# hainhushop

Angular 21 + Supabase. Routes: `/`, `/contact`, `/admin`.

## Push to GitHub
```bash
git clone https://github.com/tranthangloi20/hainhushop.git
cd hainhushop
# copy this project here
git add .
git commit -m "feat: build hainhushop"
git push origin main
```

## Run
```bash
npm install
npm start
```

The Supabase publishable key is safe for frontend use; database access is protected by RLS.


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