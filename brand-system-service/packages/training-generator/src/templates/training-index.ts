import { wrapLayout, escapeHtml } from './shared';
import type { TrainingConfig, TrainingGuideType } from '../types';

/**
 * Guide metadata for the training index page.
 */
interface GuideEntry {
  readonly type: TrainingGuideType;
  readonly title: string;
  readonly fileName: string;
  readonly description: string;
  readonly roles: readonly string[];
}

const GUIDE_ENTRIES: readonly GuideEntry[] = [
  {
    type: 'brand_usage',
    title: 'Brand Usage Training',
    fileName: 'brand-usage.html',
    description: 'How to use the brand book, color/typography rules, logo guidelines, and tone of voice.',
    roles: ['Business Owner', 'Content Team'],
  },
  {
    type: 'static_site_update',
    title: 'Static Site Update Guide',
    fileName: 'static-site-update.html',
    description: 'How to update text and images on the static website without developer help.',
    roles: ['Content Team'],
  },
  {
    type: 'social_media',
    title: 'Social Media Training',
    fileName: 'social-media.html',
    description: 'Content calendar usage, template editing, hashtag strategy, and posting cadence.',
    roles: ['Content Team'],
  },
  {
    type: 'developer_onboarding',
    title: 'Design System Onboarding',
    fileName: 'developer-onboarding.html',
    description: 'Token package installation, CSS custom properties, Tailwind integration, and update requests.',
    roles: ['Developer'],
  },
];

/**
 * Generates the training index page HTML.
 * Organized by role: Business Owner, Content Team, Developer.
 */
export function renderTrainingIndex(config: TrainingConfig): string {
  const activeGuides = GUIDE_ENTRIES.filter((entry) => config.guides[entry.type]);
  const roles = ['Business Owner', 'Content Team', 'Developer'] as const;

  let roleSections = '';
  for (const role of roles) {
    const guidesForRole = activeGuides.filter((g) => g.roles.includes(role));
    if (guidesForRole.length === 0) {
      continue;
    }

    const guideItems = guidesForRole
      .map((g) => {
        const loomUrl = config.loomPlaceholders[g.type];
        const loomLink = loomUrl
          ? `<br><a href="${escapeHtml(loomUrl)}" target="_blank" rel="noopener noreferrer">Watch video walkthrough</a>`
          : '';
        return `
      <li>
        <a href="${escapeHtml(g.fileName)}"><strong>${escapeHtml(g.title)}</strong></a>
        <p>${escapeHtml(g.description)}</p>${loomLink}
      </li>`;
      })
      .join('\n');

    roleSections += `
  <h2>${escapeHtml(role)}</h2>
  <ul>
    ${guideItems}
  </ul>`;
  }

  const body = `
  <div class="header">
    <h1>${escapeHtml(config.clientName)} Training &amp; Enablement</h1>
    <p>Training materials organized by role. Select your role below to find the relevant guides.</p>
  </div>

  ${roleSections}`;

  return wrapLayout('Training & Enablement', config.clientName, config.primaryColor, body);
}
