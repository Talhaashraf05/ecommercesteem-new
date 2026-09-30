# EcommerceSteem — agent rules

Spec: ../docs/superpowers/specs/2026-09-30-ecommercesteem-rebuild-design.md
Plan: ../docs/superpowers/plans/2026-09-30-ecommercesteem-rebuild.md

1. Motion: react-spring values driven by the shared ticker (src/lib/animation/ticker.ts) or the declarative <Hover>. No self-running from→to/loop springs, no framer-motion, no CSS keyframes. `transition-colors` allowed for plain color hovers.
2. Do not modify src/components/animation/springs/ or src/hooks/animation/.
3. Design tokens only (globals.css). No raw hex/px in class names.
4. app/**/page.tsx imports only from src/views/. Content only from src/content/.
5. Server Components by default. No `any`.
6. Secrets only in app/api/**/route.ts via src/env.ts.
7. One h1 per page; JSON-LD via components/common/json-ld.tsx.
8. Before finishing: yarn lint && yarn typecheck && yarn test && yarn build.
