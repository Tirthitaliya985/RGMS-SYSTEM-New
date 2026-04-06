# Free Deployment Guide (RGMS)

## 1) Push code to GitHub
1. Create a GitHub repo.
2. Push this project.

## 2) Deploy backend on Render (free)
1. Go to Render -> New -> Blueprint.
2. Select your GitHub repo.
3. Render will detect `render.yaml` and create `rgms-backend`.
4. In Render service settings, add env vars from `server/.env.production.example`.
5. Deploy.
6. Copy backend URL (example: `https://rgms-backend.onrender.com`).

## 3) Deploy frontend on Vercel (free)
1. Go to Vercel -> Add New Project.
2. Import same GitHub repo.
3. Set Root Directory: `my-react-app`.
4. Add env var from `my-react-app/.env.production.example`:
   - `VITE_API_URL=https://<your-render-url>/api`
5. Deploy.
6. Copy frontend URL (example: `https://rgms-frontend.vercel.app`).

## 4) Final backend env update
In Render set:
- `CORS_ORIGINS=https://<your-vercel-url>,http://localhost:5173`
- `LIVE_DEMO_URL=https://<your-vercel-url>`
- `DEMO_GUIDE_URL=<public PDF URL>`

Redeploy backend.

## 5) Smoke test
1. Open frontend URL.
2. Login.
3. Submit demo visitor request.
4. Approve request from admin.
5. Confirm demo visitor receives:
   - WhatsApp message with project link
   - Email (and PDF attachment if available)

## Notes
- Render free web services can sleep after inactivity.
- First request after sleep may take ~30-60 seconds.
