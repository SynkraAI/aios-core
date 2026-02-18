# Checklist: Frontend Architecture Review

**ID:** architecture-review
**Version:** 1.0
**Purpose:** Reviews frontend architecture including folder structure, imports, dependencies, build pipeline, bundle size, and tree-shaking
**Agent:** @micah-godbolt
**Quality Gate:** BLOCKING

---

## Prerequisites

- [ ] Repository has been set up with the agreed-upon build tool (Vite, Webpack, Rollup, etc.)
- [ ] Package.json is configured with correct entry points (main, module, exports)
- [ ] CI/CD pipeline exists and can be triggered
- [ ] Target framework(s) and platform(s) have been defined

---

## Section 1: Folder Structure

- [ ] Top-level structure follows the agreed convention (src/, dist/, docs/, tests/)
- [ ] Components are organized by atomic level or feature grouping
- [ ] Each component folder contains its source, tests, stories, and styles
- [ ] Shared utilities live in a dedicated utils/ or helpers/ directory
- [ ] Constants and configuration are separated from component logic
- [ ] Index files (barrel exports) exist at appropriate directory levels
- [ ] No deeply nested structures beyond 4 levels

## Section 2: Import Organization

- [ ] Imports follow a consistent order (external, internal, relative, styles)
- [ ] Path aliases are configured and used consistently (e.g., @components/, @tokens/)
- [ ] No relative imports that traverse more than 2 levels (../../..)
- [ ] Dynamic imports are used for code-splitting where appropriate
- [ ] Side-effect imports are explicitly marked or avoided
- [ ] CSS/style imports follow a predictable pattern

## Section 3: Dependency Management

- [ ] No circular dependencies exist between modules
- [ ] Peer dependencies are correctly specified for library packages
- [ ] External dependencies are minimal and justified
- [ ] No duplicate packages in the dependency tree
- [ ] License compliance is verified for all dependencies
- [ ] Security audit shows no high or critical vulnerabilities
- [ ] Lock file is committed and up to date

## Section 4: Build Pipeline

- [ ] Build completes without errors or warnings
- [ ] Output formats include ESM and CJS (or as required)
- [ ] TypeScript declarations (.d.ts) are generated and included
- [ ] Source maps are generated for development builds
- [ ] CSS is extracted or bundled according to consumption strategy
- [ ] Assets (icons, fonts) are processed and optimized
- [ ] Build is reproducible (same input produces same output)

## Section 5: Bundle Size

- [ ] Total bundle size is within the agreed budget
- [ ] Individual component bundles are reasonably sized (< 10KB gzipped typical)
- [ ] No single dependency contributes more than 30% of total bundle
- [ ] Bundle analysis report has been generated and reviewed
- [ ] Unused code is identified and removed
- [ ] Images and assets are optimized for web delivery

## Section 6: Tree-Shaking

- [ ] Package uses ESM exports for tree-shaking support
- [ ] sideEffects field is correctly set in package.json
- [ ] Named exports are used instead of default exports for better tree-shaking
- [ ] Consumer applications can import individual components without pulling the full library
- [ ] Tree-shaking has been verified by inspecting a consumer's bundle
- [ ] No module-level side effects that prevent dead code elimination

## Section 7: Code Quality

- [ ] ESLint configuration covers the codebase with no unresolved errors
- [ ] Prettier or equivalent formatter enforces consistent code style
- [ ] TypeScript strict mode is enabled
- [ ] No any types used without justification
- [ ] Console.log statements are removed from production code
- [ ] Error boundaries are implemented for component error isolation

---

## Scoring

| Category | Items | Pass | Status |
|----------|-------|------|--------|
| Folder Structure | 7 | _ | PENDING |
| Import Organization | 6 | _ | PENDING |
| Dependency Management | 7 | _ | PENDING |
| Build Pipeline | 7 | _ | PENDING |
| Bundle Size | 6 | _ | PENDING |
| Tree-Shaking | 6 | _ | PENDING |
| Code Quality | 6 | _ | PENDING |

**Minimum passing score:** 85%
**Blocking items:** All Dependency Management and Build Pipeline items must pass
