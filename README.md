# puppies
Dog viewer web app

## Run via Docker

```bash
docker build -t puppies-web-app .
docker run --rm -p 8080:80 puppies-web-app
```

Open http://localhost:8080

## Local dev (no Docker)

```bash
npm install
npm run build          # compiles public/index.ts -> public/index.js
npx serve public       # or just open public/index.html directly in a browser
```
