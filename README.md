# ablhome

A fast, responsive landing page that lists internal services as a grid of cards
(image + name) and redirects to them on click/tap. Desktop and mobile, mouse or
touch. No state, no dependencies at runtime.

## How it works

- The service list lives in a **YAML config file** that is bind-mounted into the
  container at `/config/services.yaml`.
- On container start, `entrypoint.py` validates the config and generates
  `config/services.js` in the web root. **The container fails to start** if the
  config is missing, invalid YAML, or malformed — a misconfiguration should not
  silently serve a broken page.
- The page itself is fully static (Vite + TypeScript, no framework) and renders
  the grid immediately from `window.__SERVICES__`.
- The container runs as the unprivileged `nginx` user (uid 101) and listens on
  port **8080** internally (unprivileged users can't bind port 80). Map the host
  port to 8080, e.g. `-p 8080:8080`.

Config changes take effect on container restart.

## Config format

```yaml
services:
  - name: GitLab
    group: Development
    url: https://git.example.com
    image: https://git.example.com/assets/logo.png
    description: Source code and CI
```

- Top-level key `services`: a list of entries.
- Each entry requires `name`, `url`, `image` — non-empty strings.
- `group` is optional. Services are rendered as vertically stacked sections,
  one per group, in the order each group first appears. Services without a
  `group` are rendered under **Other**.
- `description` is optional. A short line rendered under the name on the card.
- Unknown fields are rejected (catches typos).
- Images are hosted by the services themselves (absolute URLs).

## Build & run

```sh
docker build -t ablhome .
docker run --rm -p 8080:8080 \
  -v /host/path/services.yaml:/config/services.yaml:ro \
  ablhome
```

Or with the sample compose file (uses `config/services.yaml` from this repo):

```sh
docker compose up --build
```

Then open http://localhost:8080.

## Local development

```sh
npm install
npm run dev
```

Serves the page with a checked-in stub (`public/config/services.js`) that
mirrors `config/services.yaml`. Keep both in sync when testing config changes.

## Files

| File                     | Purpose                                            |
| ------------------------ | -------------------------------------------------- |
| `config/services.yaml`   | Sample config / format reference                   |
| `public/config/services.js` | Dev stub of the generated file                  |
| `entrypoint.py`          | Config validation + `services.js` generation       |
| `Dockerfile`             | Multi-stage build (node → nginx:alpine)            |
| `docker-compose.yml`     | Sample dev environment                             |
| `.github/workflows/`     | CI: build+push `dev` tag on push/PR, release flow, GHCR cleanup |
| `nginx.conf`             | Static serving, caching, gzip                      |
| `src/`                   | Frontend (Vite + TypeScript, no framework)         |
