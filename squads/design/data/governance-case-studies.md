# Design System Governance Case Studies

Examples of governance models from established design systems. Each case study documents the governance model type, contribution process, versioning approach, team structure, key success factors, and lessons learned.

---

## 1. Salesforce Lightning Design System

**Governance Model:** Centralized with federated input
**Team Structure:** Dedicated design system team of 15-20 people (designers, engineers, program managers). Embedded liaisons in major product teams collect requirements and advocate for the system.
**Contribution Process:** External contributions go through a formal RFC process. Contributors submit a proposal with use case justification, visual specs, and accessibility requirements. The core team reviews within 2 weeks. Approved RFCs are prioritized on the team backlog. Most components are built by the core team, not contributors.
**Versioning Approach:** Semantic versioning with quarterly major releases. Deprecation warnings appear for at least two major versions before removal. Migration guides accompany every major release.
**Key Success Factors:** Strong executive sponsorship from VP-level leadership. Clear ownership and dedicated funding. Comprehensive documentation with live examples and usage guidelines.
**Lessons Learned:** Centralized ownership ensures consistency but can create bottlenecks. The liaison model helps but requires people with both product and system context. Investment in documentation pays disproportionate returns in adoption.

---

## 2. IBM Carbon Design System

**Governance Model:** Federated with central stewardship
**Team Structure:** A central Carbon team maintains the core library and governance processes. Product teams across IBM contribute components through a structured process. Pattern maintainers are distributed across the organization.
**Contribution Process:** Open contribution model with a tiered review process. Minor fixes go through standard PR review. New components require a design review, accessibility audit, and documentation package. Contributors use shared templates for proposals. Community meetings occur bi-weekly to discuss proposals and priorities.
**Versioning Approach:** Semantic versioning. Major versions are infrequent and accompanied by automated migration tooling (codemods). Point releases ship continuously. Feature flags allow incremental adoption of new patterns.
**Key Success Factors:** Open-source-first mentality creates transparency and community engagement. Extensive accessibility testing baked into the contribution requirements. Strong tooling ecosystem (Sketch, Figma, React, Angular, Vue support).
**Lessons Learned:** Federated contributions scale better than centralized development for a large organization. The investment in multi-framework support dramatically increased adoption. Accessibility must be a gate, not a suggestion.

---

## 3. Atlassian Design System

**Governance Model:** Hybrid (centralized core, federated extensions)
**Team Structure:** A dedicated design platform team owns the core system. Product teams own domain-specific patterns (e.g., Jira-specific components). A design quality guild meets monthly to review cross-cutting concerns.
**Contribution Process:** Core contributions follow a proposal-review-build-release cycle. Domain-specific patterns live in product repositories but must conform to core tokens and accessibility standards. An internal "Component Health" dashboard tracks consistency across products.
**Versioning Approach:** Continuous releases with feature flags. Breaking changes go through a deprecation-migration-removal lifecycle spanning at least 6 months. Automated tooling scans for deprecated usage and generates migration PRs.
**Key Success Factors:** The Component Health dashboard creates visibility and accountability. Clear boundary between core (shared) and domain (product-specific) components reduces governance overhead. Automated migration tooling lowers the cost of staying current.
**Lessons Learned:** Drawing a clear line between core and domain components is critical. Without it, governance either becomes too heavy (slowing product teams) or too light (allowing drift). The dashboard changed behavior more than any policy document.

---

## 4. Shopify Polaris

**Governance Model:** Centralized with strong community feedback loops
**Team Structure:** A dedicated Polaris team (design, engineering, content) owns the system end-to-end. Community input comes through GitHub issues, an internal Slack channel, and quarterly partner surveys.
**Contribution Process:** The core team builds most components. External contributors can submit bug fixes and minor enhancements via GitHub PRs. New component proposals require a UX review, API review, and content guidelines review. The team prioritizes based on merchant impact.
**Versioning Approach:** Semantic versioning with a strong commitment to stability. Breaking changes are rare and always accompanied by codemods and detailed migration guides. A "legacy" namespace preserves old APIs during transitions.
**Key Success Factors:** Content guidelines integrated directly into component documentation. Merchant-focused design principles guide every decision. Strong investment in developer experience (CLI tools, templates, linting).
**Lessons Learned:** Integrating content strategy into the design system (not just visual and code) creates much stronger consistency. The "legacy" namespace pattern smooths migrations significantly. DX investment drives adoption more than mandates.

---

## 5. Google Material Design

**Governance Model:** Centralized with platform-specific adaptations
**Team Structure:** A large central Material Design team at Google defines the specification. Platform-specific implementation teams (Android, Web, Flutter, iOS) build the component libraries. Each platform team has autonomy to adapt patterns for platform conventions.
**Contribution Process:** The specification is centrally authored. Platform implementations accept external contributions through standard open-source PR processes. Design changes go through a formal design review with the central team. Cross-platform consistency is reviewed quarterly.
**Versioning Approach:** Major specification versions (Material 2, Material 3) represent significant design direction changes. Component libraries version independently using semver. Theming and customization APIs allow adopters to adapt without forking.
**Key Success Factors:** Strong theming capabilities enable adoption across diverse products without forking. Platform-specific adaptations respect native conventions. Comprehensive specification documentation with interactive examples.
**Lessons Learned:** A specification-first approach works at massive scale but requires significant investment in documentation. Platform autonomy is necessary — a single implementation across platforms creates friction. Theming is not optional; it is a core requirement for broad adoption.

---

## 6. GitHub Primer

**Governance Model:** Federated with strong conventions
**Team Structure:** A small core Primer team (4-6 people) maintains the system. Engineers across GitHub contribute components as part of their regular product work. Primer team members review all contributions and maintain quality standards.
**Contribution Process:** Open internal contribution with PR-based review. Contributors follow a documented component creation guide that includes accessibility requirements, responsive behavior specs, and documentation templates. The Primer team pair-programs with contributors on complex components.
**Versioning Approach:** Continuous deployment with semantic versioning. Breaking changes are batched into planned migrations. A "Primer Migrations" tool automates most upgrade paths. Canary releases allow early testing.
**Key Success Factors:** The pair-programming model with contributors scales knowledge and maintains quality. Small core team with high leverage. Strong automated testing (visual regression, accessibility, performance).
**Lessons Learned:** A small, high-leverage team can govern a large system if contribution quality is enforced through tooling and pairing rather than gatekeeping. Visual regression testing is essential — it catches drift that code review misses. Investing in contributor experience (guides, templates, pairing) is more effective than building everything in-house.

---

## 7. Adobe Spectrum

**Governance Model:** Centralized with cross-product alignment councils
**Team Structure:** A dedicated Spectrum team of approximately 20 people owns design, engineering, and documentation. Cross-product alignment councils (quarterly meetings of design leads from each Adobe product) review direction and priorities.
**Contribution Process:** Core components are built by the Spectrum team. Product teams submit requests through a formal intake process with priority scoring. High-demand requests are fast-tracked. Accessibility and internationalization reviews are required before release.
**Versioning Approach:** Semantic versioning with long-term support for major versions. Multiple framework implementations (React, Web Components) version independently. Token updates ship as minor versions to avoid breaking visual consistency.
**Key Success Factors:** The alignment council ensures the system serves product needs rather than operating in a vacuum. Multi-framework support through Web Components as a shared foundation. Comprehensive internationalization and accessibility built into every component.
**Lessons Learned:** Alignment councils prevent the "ivory tower" problem. Building on Web Components as a platform-agnostic foundation reduces duplication across framework-specific implementations. Internationalization must be a first-class concern, not a retrofit.

---

## 8. Microsoft Fluent Design

**Governance Model:** Centralized specification with decentralized implementation
**Team Structure:** A central Fluent team defines the design language and specification. Implementation teams for each platform (Windows, Web, iOS, Android, cross-platform via React Native) operate semi-independently. A coordination council meets monthly.
**Contribution Process:** Specification changes require central team approval. Implementation contributions follow each platform repository's open-source contribution process. Cross-platform consistency reviews happen quarterly. Design tokens are managed centrally and distributed to all platforms.
**Versioning Approach:** The specification evolves incrementally. Platform implementations follow semver. Token packages version independently with compatibility matrices published for each release.
**Key Success Factors:** Central token management ensures visual consistency across platforms even when implementations diverge. The specification serves as a north star while allowing platform-appropriate deviations. Strong investment in tooling (Figma plugins, VS Code extensions).
**Lessons Learned:** Cross-platform systems require a clear distinction between "must be consistent" (tokens, semantics) and "may adapt" (interaction patterns, animations). Tooling adoption often exceeds component adoption — invest in developer and designer tools early.

---

## Comparison Table

| System | Model | Team Size | Contribution | Versioning | Key Differentiator |
|---|---|---|---|---|---|
| Salesforce Lightning | Centralized | 15-20 | RFC process | Quarterly majors | Executive sponsorship |
| IBM Carbon | Federated | 8-12 core | Open, tiered review | Continuous + codemods | Open-source-first |
| Atlassian | Hybrid | 10-15 | Core vs domain split | Continuous + flags | Component Health dashboard |
| Shopify Polaris | Centralized | 8-10 | Core team builds | Rare breaking changes | Content strategy integration |
| Google Material | Centralized spec | 30+ | Platform-specific PRs | Spec + library versions | Theming and customization |
| GitHub Primer | Federated | 4-6 core | PR + pair-programming | Continuous + migration tool | Contributor experience focus |
| Adobe Spectrum | Centralized | ~20 | Formal intake | LTS majors | Alignment councils |
| Microsoft Fluent | Centralized spec | 20+ | Platform-specific | Spec + platform versions | Central token management |

---

## Key Governance Patterns

1. **No model works without executive sponsorship.** Every successful system has visible leadership support.
2. **Federated scales better but requires stronger tooling.** Automated quality gates replace manual review as contributor count grows.
3. **Contribution friction must be proportional to impact.** Bug fixes need light process; new components need thorough review.
4. **Breaking changes need migration tooling, not just documentation.** Codemods and automated PRs dramatically increase upgrade rates.
5. **Measure adoption, not just output.** Component count is vanity; adoption coverage is the metric that matters.
