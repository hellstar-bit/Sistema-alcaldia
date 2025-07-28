
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
│  │  ├─ main.d.ts
│  │  ├─ main.js
│  │  ├─ main.js.map
│  │  ├─ modules
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
│  │  │  └─ cartera
│  │  │     ├─ cartera.controller.d.ts
│  │  │     ├─ cartera.controller.js
│  │  │     ├─ cartera.controller.js.map
│  │  │     ├─ cartera.module.d.ts
│  │  │     ├─ cartera.module.js
│  │  │     ├─ cartera.module.js.map
│  │  │     ├─ cartera.service.d.ts
│  │  │     ├─ cartera.service.js
│  │  │     ├─ cartera.service.js.map
│  │  │     ├─ controllers
│  │  │     │  ├─ eps.controller.d.ts
│  │  │     │  ├─ eps.controller.js
│  │  │     │  ├─ eps.controller.js.map
│  │  │     │  ├─ ips.controller.d.ts
│  │  │     │  ├─ ips.controller.js
│  │  │     │  └─ ips.controller.js.map
│  │  │     ├─ dto
│  │  │     │  ├─ cartera-filter.dto.d.ts
│  │  │     │  ├─ cartera-filter.dto.js
│  │  │     │  ├─ cartera-filter.dto.js.map
│  │  │     │  ├─ create-cartera-data.dto.d.ts
│  │  │     │  ├─ create-cartera-data.dto.js
│  │  │     │  ├─ create-cartera-data.dto.js.map
│  │  │     │  ├─ eps.dto.d.ts
│  │  │     │  ├─ eps.dto.js
│  │  │     │  ├─ eps.dto.js.map
│  │  │     │  ├─ ips.dto.d.ts
│  │  │     │  ├─ ips.dto.js
│  │  │     │  ├─ ips.dto.js.map
│  │  │     │  ├─ upload-excel.dto.d.ts
│  │  │     │  ├─ upload-excel.dto.js
│  │  │     │  └─ upload-excel.dto.js.map
│  │  │     ├─ entities
│  │  │     │  ├─ cartera-data.entity.d.ts
│  │  │     │  ├─ cartera-data.entity.js
│  │  │     │  ├─ cartera-data.entity.js.map
│  │  │     │  ├─ eps.entity.d.ts
│  │  │     │  ├─ eps.entity.js
│  │  │     │  ├─ eps.entity.js.map
│  │  │     │  ├─ ips.entity.d.ts
│  │  │     │  ├─ ips.entity.js
│  │  │     │  ├─ ips.entity.js.map
│  │  │     │  ├─ periodo.entity.d.ts
│  │  │     │  ├─ periodo.entity.js
│  │  │     │  └─ periodo.entity.js.map
│  │  │     └─ services
│  │  │        ├─ eps.service.d.ts
│  │  │        ├─ eps.service.js
│  │  │        ├─ eps.service.js.map
│  │  │        ├─ ips.service.d.ts
│  │  │        ├─ ips.service.js
│  │  │        └─ ips.service.js.map
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
│  │  ├─ main.ts
│  │  └─ modules
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
│  │     └─ cartera
│  │        ├─ cartera.controller.ts
│  │        ├─ cartera.module.ts
│  │        ├─ cartera.service.ts
│  │        ├─ controllers
│  │        │  ├─ eps.controller.ts
│  │        │  └─ ips.controller.ts
│  │        ├─ dto
│  │        │  ├─ cartera-filter.dto.ts
│  │        │  ├─ create-cartera-data.dto.ts
│  │        │  ├─ eps.dto.ts
│  │        │  ├─ ips.dto.ts
│  │        │  └─ upload-excel.dto.ts
│  │        ├─ entities
│  │        │  ├─ cartera-data.entity.ts
│  │        │  ├─ eps.entity.ts
│  │        │  ├─ ips.entity.ts
│  │        │  └─ periodo.entity.ts
│  │        └─ services
│  │           ├─ eps.service.ts
│  │           └─ ips.service.ts
│  ├─ test
│  │  ├─ app.e2e-spec.ts
│  │  └─ jest-e2e.json
│  ├─ tsconfig.build.json
│  └─ tsconfig.json
├─ frontend
│  ├─ .env
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
│  │  │  ├─ auth
│  │  │  │  ├─ Login.tsx
│  │  │  │  └─ ProtectedRoute.tsx
│  │  │  ├─ cartera
│  │  │  │  ├─ ExcelUploadModal.tsx
│  │  │  │  └─ InformacionCartera.tsx
│  │  │  ├─ dashboard
│  │  │  │  └─ Dashboard.tsx
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
│  │  │  └─ useSweetAlert.ts
│  │  ├─ index.css
│  │  ├─ main.tsx
│  │  ├─ services
│  │  │  ├─ api.ts
│  │  │  ├─ carteraApi.ts
│  │  │  └─ gestionApi.ts
│  │  └─ vite-env.d.ts
│  ├─ tailwind.config.js
│  ├─ tsconfig.app.json
│  ├─ tsconfig.json
│  ├─ tsconfig.node.json
│  ├─ vite-env.d.ts
│  └─ vite.config.ts
└─ README.md

```