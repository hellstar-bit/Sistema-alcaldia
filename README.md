
```
Sistema-alcaldia
├─ backend
│  ├─ .env
│  ├─ .prettierrc
│  ├─ dist
│  │  ├─ app.controller.d.ts
│  │  ├─ app.controller.js
│  │  ├─ app.controller.js.map
│  │  ├─ app.module.d.ts
│  │  ├─ app.module.js
│  │  ├─ app.module.js.map
│  │  ├─ app.service.d.ts
│  │  ├─ app.service.js
│  │  ├─ app.service.js.map
│  │  ├─ config
│  │  │  ├─ database.config.d.ts
│  │  │  ├─ database.config.js
│  │  │  └─ database.config.js.map
│  │  ├─ health
│  │  │  ├─ health.controller.d.ts
│  │  │  ├─ health.controller.js
│  │  │  ├─ health.controller.js.map
│  │  │  ├─ health.module.d.ts
│  │  │  ├─ health.module.js
│  │  │  └─ health.module.js.map
│  │  ├─ main.d.ts
│  │  ├─ main.js
│  │  ├─ main.js.map
│  │  ├─ modules
│  │  │  ├─ adres
│  │  │  │  ├─ adres.controller.d.ts
│  │  │  │  ├─ adres.controller.js
│  │  │  │  ├─ adres.controller.js.map
│  │  │  │  ├─ adres.module.d.ts
│  │  │  │  ├─ adres.module.js
│  │  │  │  ├─ adres.module.js.map
│  │  │  │  ├─ adres.service.d.ts
│  │  │  │  ├─ adres.service.js
│  │  │  │  ├─ adres.service.js.map
│  │  │  │  ├─ dto
│  │  │  │  │  ├─ adres-filter.dto.d.ts
│  │  │  │  │  ├─ adres-filter.dto.js
│  │  │  │  │  ├─ adres-filter.dto.js.map
│  │  │  │  │  ├─ create-adres-data.dto.d.ts
│  │  │  │  │  ├─ create-adres-data.dto.js
│  │  │  │  │  ├─ create-adres-data.dto.js.map
│  │  │  │  │  ├─ upload-excel.dto.d.ts
│  │  │  │  │  ├─ upload-excel.dto.js
│  │  │  │  │  └─ upload-excel.dto.js.map
│  │  │  │  └─ entities
│  │  │  │     ├─ adres-data.entity.d.ts
│  │  │  │     ├─ adres-data.entity.js
│  │  │  │     └─ adres-data.entity.js.map
│  │  │  ├─ auth
│  │  │  │  ├─ auth.controller.d.ts
│  │  │  │  ├─ auth.controller.js
│  │  │  │  ├─ auth.controller.js.map
│  │  │  │  ├─ auth.module.d.ts
│  │  │  │  ├─ auth.module.js
│  │  │  │  ├─ auth.module.js.map
│  │  │  │  ├─ auth.service.d.ts
│  │  │  │  ├─ auth.service.js
│  │  │  │  ├─ auth.service.js.map
│  │  │  │  ├─ dto
│  │  │  │  │  ├─ login.dto.d.ts
│  │  │  │  │  ├─ login.dto.js
│  │  │  │  │  ├─ login.dto.js.map
│  │  │  │  │  ├─ register.dto.d.ts
│  │  │  │  │  ├─ register.dto.js
│  │  │  │  │  └─ register.dto.js.map
│  │  │  │  ├─ entities
│  │  │  │  │  ├─ user.entity.d.ts
│  │  │  │  │  ├─ user.entity.js
│  │  │  │  │  └─ user.entity.js.map
│  │  │  │  ├─ guards
│  │  │  │  │  ├─ jwt-auth.guard.d.ts
│  │  │  │  │  ├─ jwt-auth.guard.js
│  │  │  │  │  └─ jwt-auth.guard.js.map
│  │  │  │  └─ strategies
│  │  │  │     ├─ jwt.strategy.d.ts
│  │  │  │     ├─ jwt.strategy.js
│  │  │  │     └─ jwt.strategy.js.map
│  │  │  ├─ cartera
│  │  │  │  ├─ cartera.controller.d.ts
│  │  │  │  ├─ cartera.controller.js
│  │  │  │  ├─ cartera.controller.js.map
│  │  │  │  ├─ cartera.module.d.ts
│  │  │  │  ├─ cartera.module.js
│  │  │  │  ├─ cartera.module.js.map
│  │  │  │  ├─ cartera.service.d.ts
│  │  │  │  ├─ cartera.service.js
│  │  │  │  ├─ cartera.service.js.map
│  │  │  │  ├─ controllers
│  │  │  │  │  ├─ eps.controller.d.ts
│  │  │  │  │  ├─ eps.controller.js
│  │  │  │  │  ├─ eps.controller.js.map
│  │  │  │  │  ├─ ips.controller.d.ts
│  │  │  │  │  ├─ ips.controller.js
│  │  │  │  │  └─ ips.controller.js.map
│  │  │  │  ├─ dto
│  │  │  │  │  ├─ cartera-filter.dto.d.ts
│  │  │  │  │  ├─ cartera-filter.dto.js
│  │  │  │  │  ├─ cartera-filter.dto.js.map
│  │  │  │  │  ├─ create-cartera-data.dto.d.ts
│  │  │  │  │  ├─ create-cartera-data.dto.js
│  │  │  │  │  ├─ create-cartera-data.dto.js.map
│  │  │  │  │  ├─ eps.dto.d.ts
│  │  │  │  │  ├─ eps.dto.js
│  │  │  │  │  ├─ eps.dto.js.map
│  │  │  │  │  ├─ ips.dto.d.ts
│  │  │  │  │  ├─ ips.dto.js
│  │  │  │  │  ├─ ips.dto.js.map
│  │  │  │  │  ├─ upload-excel.dto.d.ts
│  │  │  │  │  ├─ upload-excel.dto.js
│  │  │  │  │  └─ upload-excel.dto.js.map
│  │  │  │  ├─ entities
│  │  │  │  │  ├─ cartera-data.entity.d.ts
│  │  │  │  │  ├─ cartera-data.entity.js
│  │  │  │  │  ├─ cartera-data.entity.js.map
│  │  │  │  │  ├─ eps.entity.d.ts
│  │  │  │  │  ├─ eps.entity.js
│  │  │  │  │  ├─ eps.entity.js.map
│  │  │  │  │  ├─ ips.entity.d.ts
│  │  │  │  │  ├─ ips.entity.js
│  │  │  │  │  ├─ ips.entity.js.map
│  │  │  │  │  ├─ periodo.entity.d.ts
│  │  │  │  │  ├─ periodo.entity.js
│  │  │  │  │  └─ periodo.entity.js.map
│  │  │  │  └─ services
│  │  │  │     ├─ eps.service.d.ts
│  │  │  │     ├─ eps.service.js
│  │  │  │     ├─ eps.service.js.map
│  │  │  │     ├─ ips.service.d.ts
│  │  │  │     ├─ ips.service.js
│  │  │  │     └─ ips.service.js.map
│  │  │  ├─ dashboards-eps-ips
│  │  │  │  ├─ dashboards-eps-ips.controller.d.ts
│  │  │  │  ├─ dashboards-eps-ips.controller.js
│  │  │  │  ├─ dashboards-eps-ips.controller.js.map
│  │  │  │  ├─ dashboards-eps-ips.module.d.ts
│  │  │  │  ├─ dashboards-eps-ips.module.js
│  │  │  │  ├─ dashboards-eps-ips.module.js.map
│  │  │  │  ├─ dashboards-eps-ips.service.d.ts
│  │  │  │  ├─ dashboards-eps-ips.service.js
│  │  │  │  ├─ dashboards-eps-ips.service.js.map
│  │  │  │  └─ dto
│  │  │  │     ├─ analisis-flujo-response.dto.d.ts
│  │  │  │     ├─ analisis-flujo-response.dto.js
│  │  │  │     ├─ analisis-flujo-response.dto.js.map
│  │  │  │     ├─ cartera-trazabilidad-response.dto.d.ts
│  │  │  │     ├─ cartera-trazabilidad-response.dto.js
│  │  │  │     ├─ cartera-trazabilidad-response.dto.js.map
│  │  │  │     ├─ dashboard-filters.dto.d.ts
│  │  │  │     ├─ dashboard-filters.dto.js
│  │  │  │     ├─ dashboard-filters.dto.js.map
│  │  │  │     ├─ metricas-comparativas-response.dto.d.ts
│  │  │  │     ├─ metricas-comparativas-response.dto.js
│  │  │  │     ├─ metricas-comparativas-response.dto.js.map
│  │  │  │     ├─ tendencias-response.dto.d.ts
│  │  │  │     ├─ tendencias-response.dto.js
│  │  │  │     ├─ tendencias-response.dto.js.map
│  │  │  │     ├─ top-entidades-response.dto.d.ts
│  │  │  │     ├─ top-entidades-response.dto.js
│  │  │  │     └─ top-entidades-response.dto.js.map
│  │  │  └─ flujo
│  │  │     ├─ dto
│  │  │     │  ├─ create-flujo-eps-data.dto.d.ts
│  │  │     │  ├─ create-flujo-eps-data.dto.js
│  │  │     │  ├─ create-flujo-eps-data.dto.js.map
│  │  │     │  ├─ create-flujo-ips-data.dto.d.ts
│  │  │     │  ├─ create-flujo-ips-data.dto.js
│  │  │     │  ├─ create-flujo-ips-data.dto.js.map
│  │  │     │  ├─ flujo-filter.dto.d.ts
│  │  │     │  ├─ flujo-filter.dto.js
│  │  │     │  ├─ flujo-filter.dto.js.map
│  │  │     │  ├─ upload-flujo-excel.dto.d.ts
│  │  │     │  ├─ upload-flujo-excel.dto.js
│  │  │     │  └─ upload-flujo-excel.dto.js.map
│  │  │     ├─ entities
│  │  │     │  ├─ flujo-control-carga.entity.d.ts
│  │  │     │  ├─ flujo-control-carga.entity.js
│  │  │     │  ├─ flujo-control-carga.entity.js.map
│  │  │     │  ├─ flujo-eps-data.entity.d.ts
│  │  │     │  ├─ flujo-eps-data.entity.js
│  │  │     │  ├─ flujo-eps-data.entity.js.map
│  │  │     │  ├─ flujo-ips-data.entity.d.ts
│  │  │     │  ├─ flujo-ips-data.entity.js
│  │  │     │  └─ flujo-ips-data.entity.js.map
│  │  │     ├─ flujo.controller.d.ts
│  │  │     ├─ flujo.controller.js
│  │  │     ├─ flujo.controller.js.map
│  │  │     ├─ flujo.module.d.ts
│  │  │     ├─ flujo.module.js
│  │  │     ├─ flujo.module.js.map
│  │  │     ├─ flujo.service.d.ts
│  │  │     ├─ flujo.service.js
│  │  │     └─ flujo.service.js.map
│  │  └─ tsconfig.build.tsbuildinfo
│  ├─ eslint.config.mjs
│  ├─ nest-cli.json
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ README.md
│  ├─ src
│  │  ├─ app.controller.spec.ts
│  │  ├─ app.controller.ts
│  │  ├─ app.module.ts
│  │  ├─ app.service.ts
│  │  ├─ config
│  │  │  └─ database.config.ts
│  │  ├─ health
│  │  │  ├─ health.controller.ts
│  │  │  └─ health.module.ts
│  │  ├─ main.ts
│  │  └─ modules
│  │     ├─ adres
│  │     │  ├─ adres.controller.ts
│  │     │  ├─ adres.module.ts
│  │     │  ├─ adres.service.ts
│  │     │  ├─ dto
│  │     │  │  ├─ adres-filter.dto.ts
│  │     │  │  ├─ create-adres-data.dto.ts
│  │     │  │  └─ upload-excel.dto.ts
│  │     │  └─ entities
│  │     │     └─ adres-data.entity.ts
│  │     ├─ auth
│  │     │  ├─ auth.controller.ts
│  │     │  ├─ auth.module.ts
│  │     │  ├─ auth.service.ts
│  │     │  ├─ dto
│  │     │  │  ├─ login.dto.ts
│  │     │  │  └─ register.dto.ts
│  │     │  ├─ entities
│  │     │  │  └─ user.entity.ts
│  │     │  ├─ guards
│  │     │  │  └─ jwt-auth.guard.ts
│  │     │  └─ strategies
│  │     │     └─ jwt.strategy.ts
│  │     ├─ cartera
│  │     │  ├─ cartera.controller.ts
│  │     │  ├─ cartera.module.ts
│  │     │  ├─ cartera.service.ts
│  │     │  ├─ controllers
│  │     │  │  ├─ eps.controller.ts
│  │     │  │  └─ ips.controller.ts
│  │     │  ├─ dto
│  │     │  │  ├─ cartera-filter.dto.ts
│  │     │  │  ├─ create-cartera-data.dto.ts
│  │     │  │  ├─ eps.dto.ts
│  │     │  │  ├─ ips.dto.ts
│  │     │  │  └─ upload-excel.dto.ts
│  │     │  ├─ entities
│  │     │  │  ├─ cartera-data.entity.ts
│  │     │  │  ├─ eps.entity.ts
│  │     │  │  ├─ ips.entity.ts
│  │     │  │  └─ periodo.entity.ts
│  │     │  └─ services
│  │     │     ├─ eps.service.ts
│  │     │     └─ ips.service.ts
│  │     ├─ dashboards-eps-ips
│  │     │  ├─ dashboards-eps-ips.controller.ts
│  │     │  ├─ dashboards-eps-ips.module.ts
│  │     │  ├─ dashboards-eps-ips.service.ts
│  │     │  └─ dto
│  │     │     ├─ analisis-flujo-response.dto.ts
│  │     │     ├─ cartera-trazabilidad-response.dto.ts
│  │     │     ├─ dashboard-filters.dto.ts
│  │     │     ├─ metricas-comparativas-response.dto.ts
│  │     │     ├─ tendencias-response.dto.ts
│  │     │     └─ top-entidades-response.dto.ts
│  │     └─ flujo
│  │        ├─ dto
│  │        │  ├─ create-flujo-eps-data.dto.ts
│  │        │  ├─ create-flujo-ips-data.dto.ts
│  │        │  ├─ flujo-filter.dto.ts
│  │        │  └─ upload-flujo-excel.dto.ts
│  │        ├─ entities
│  │        │  ├─ flujo-control-carga.entity.ts
│  │        │  ├─ flujo-eps-data.entity.ts
│  │        │  └─ flujo-ips-data.entity.ts
│  │        ├─ flujo.controller.ts
│  │        ├─ flujo.module.ts
│  │        └─ flujo.service.ts
│  ├─ test
│  │  ├─ app.e2e-spec.ts
│  │  └─ jest-e2e.json
│  ├─ tsconfig.build.json
│  └─ tsconfig.json
├─ frontend
│  ├─ .env
│  ├─ .env.production
│  ├─ dist
│  │  ├─ assets
│  │  │  ├─ index-BFNaeOhI.css
│  │  │  └─ index-fiM7hhFu.js
│  │  ├─ index.html
│  │  └─ vite.svg
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ public
│  │  └─ vite.svg
│  ├─ README.md
│  ├─ src
│  │  ├─ App.css
│  │  ├─ App.tsx
│  │  ├─ assets
│  │  │  └─ react.svg
│  │  ├─ components
│  │  │  ├─ adres
│  │  │  │  ├─ ExcelUploadModal.tsx
│  │  │  │  └─ InformacionAdres.tsx
│  │  │  ├─ auth
│  │  │  │  ├─ Login.tsx
│  │  │  │  └─ ProtectedRoute.tsx
│  │  │  ├─ cartera
│  │  │  │  ├─ ExcelUploadModal.tsx
│  │  │  │  └─ InformacionCartera.tsx
│  │  │  ├─ dashboard
│  │  │  │  └─ Dashboard.tsx
│  │  │  ├─ dashboards-eps-ips
│  │  │  │  ├─ components
│  │  │  │  │  └─ FilterPanel.tsx
│  │  │  │  ├─ graficas
│  │  │  │  │  ├─ GraficasCartera.tsx
│  │  │  │  │  ├─ GraficasFlujo.tsx
│  │  │  │  │  ├─ GraficasModule.tsx
│  │  │  │  │  ├─ GraficasTendencias.tsx
│  │  │  │  │  └─ MetricasComparativas.tsx
│  │  │  │  ├─ index.tsx
│  │  │  │  ├─ reportes
│  │  │  │  │  ├─ ReporteCartera.tsx
│  │  │  │  │  ├─ ReporteComparativo.tsx
│  │  │  │  │  ├─ ReporteEjecutivo.tsx
│  │  │  │  │  ├─ ReporteFlujo.tsx
│  │  │  │  │  └─ ReportesModule.tsx
│  │  │  │  └─ services
│  │  │  │     └─ dashboardsEpsIpsAPI.ts
│  │  │  ├─ flujo
│  │  │  │  ├─ ExcelUploadModal.tsx
│  │  │  │  └─ InformacionFlujo.tsx
│  │  │  ├─ gestion
│  │  │  │  ├─ AssignIPSModal.tsx
│  │  │  │  ├─ EPSDetailModal.tsx
│  │  │  │  ├─ EPSFormModal.tsx
│  │  │  │  ├─ GestionEPS.tsx
│  │  │  │  ├─ GestionIPS.tsx
│  │  │  │  ├─ IPSDetailModal.tsx
│  │  │  │  └─ IPSFormModal.tsx
│  │  │  ├─ layout
│  │  │  │  ├─ Header.tsx
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ Layout.tsx
│  │  │  │  └─ Sidebar.tsx
│  │  │  └─ ui
│  │  │     └─ Button.tsx
│  │  ├─ contexts
│  │  │  └─ AuthContext.tsx
│  │  ├─ hooks
│  │  │  ├─ useDashboardData.ts
│  │  │  └─ useSweetAlert.ts
│  │  ├─ index.css
│  │  ├─ main.tsx
│  │  ├─ services
│  │  │  ├─ adresApi.ts
│  │  │  ├─ api.ts
│  │  │  ├─ carteraApi.ts
│  │  │  ├─ dashboardAPI.ts
│  │  │  ├─ flujoApi.ts
│  │  │  └─ gestionApi.ts
│  │  ├─ styles
│  │  │  ├─ dashboard.css
│  │  │  └─ responsive.css
│  │  ├─ utils
│  │  │  ├─ exportUtils.ts
│  │  │  └─ formatters.ts
│  │  └─ vite-env.d.ts
│  ├─ tailwind.config.js
│  ├─ tsconfig.app.json
│  ├─ tsconfig.json
│  ├─ tsconfig.node.json
│  ├─ vite-env.d.ts
│  └─ vite.config.ts
├─ netlify.toml
├─ README.md
└─ render.yaml

```