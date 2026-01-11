# Argos Report UI

Remote microfrontend for managing report jobs. Exposes a Module Federation
remote and provides report creation, listing, and downloads.

## Features

- Create report jobs (device lookup + optional date range)
- List report jobs with pagination
- Download completed report PDFs
- Export issued process jobs to Excel (with status filter)
- Error banners and loading states

## Requirements

- Node.js 22+
- npm or Yarn

## Install

### npm

```bash
npm install
```

### Yarn

```bash
yarn install --frozen-lockfile
```

## Development

### npm

```bash
npm run dev
```

### Yarn

```bash
yarn dev
```

Default dev server: http://127.0.0.1:5175

## Build

### npm

```bash
npm run build
```

### Yarn

```bash
yarn build
```

## Preview

### npm

```bash
npm run preview
```

### Yarn

```bash
yarn preview
```

## Module Federation

This project exposes `./App` as `remoteReport` in `rsbuild.config.ts` and is
expected to be consumed by the host shell.

## API

The UI calls:
- Report service REST endpoints under `/api/v1/report`
- Process service endpoints under `/api/v1/process` for job creation/export
- Resource GraphQL at `/api/v1/resource/graphql` for device lookup

The dev server proxies `/api/v1` to `http://localhost:80`.

Override with environment variables:
- `ASSET_PREFIX`
