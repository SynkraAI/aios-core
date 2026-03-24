/**
 * ContentCalendar — 4-week content calendar generator (BSS-4.7).
 *
 * Generates weekly plans following FR-2.6 pillar distribution:
 *   Week 1: Educational (40%)
 *   Week 2: Authority (25%)
 *   Week 3: Engagement (15%)
 *   Week 4: Conversion (10%) + Promotional (10%)
 *
 * Includes platform diversity assignment and theme rotation
 * from the static CONTENT_THEMES map.
 */

import type {
  CalendarBrief,
  WeeklyPlan,
  ScheduledPost,
  ContentPillar,
  SocialPlatform,
  SocialVariant,
  PostSpec,
  TokenSet,
  BatchBrief,
} from './types';
import { CONTENT_THEMES } from './content-themes';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** FR-2.6 pillar distribution per week. */
const PILLAR_DISTRIBUTION: readonly {
  readonly weekNumber: 1 | 2 | 3 | 4;
  readonly pillarFocus: ContentPillar;
  readonly pillars: readonly { readonly pillar: ContentPillar; readonly percentage: number }[];
}[] = [
  {
    weekNumber: 1,
    pillarFocus: 'educational',
    pillars: [{ pillar: 'educational', percentage: 0.4 }],
  },
  {
    weekNumber: 2,
    pillarFocus: 'authority',
    pillars: [{ pillar: 'authority', percentage: 0.25 }],
  },
  {
    weekNumber: 3,
    pillarFocus: 'engagement',
    pillars: [{ pillar: 'engagement', percentage: 0.15 }],
  },
  {
    weekNumber: 4,
    pillarFocus: 'conversion',
    pillars: [
      { pillar: 'conversion', percentage: 0.1 },
      { pillar: 'promotional', percentage: 0.1 },
    ],
  },
];

/** MVP social variant cycle order. */
const VARIANT_CYCLE: readonly SocialVariant[] = [
  'quote',
  'tip',
  'statistic',
  'question',
  'announcement',
];

/** Minimum platform distribution for a 7-post week. */
const BASE_PLATFORM_DISTRIBUTION: readonly { readonly platform: SocialPlatform; readonly minCount: number }[] = [
  { platform: 'instagram', minCount: 2 },
  { platform: 'linkedin', minCount: 1 },
  { platform: 'x-twitter', minCount: 1 },
  { platform: 'facebook', minCount: 1 },
];

const BASE_POST_COUNT = 7; // reference post count for platform distribution

// ---------------------------------------------------------------------------
// Pillar distribution calculation
// ---------------------------------------------------------------------------

/**
 * Calculate how many posts each week gets, following FR-2.6 percentages.
 * When rounding causes overshoot, reduce the largest pillar count by 1
 * until the total equals postsPerWeek.
 */
function calculatePillarCounts(postsPerWeek: number): number[][] {
  const weekCounts: number[][] = PILLAR_DISTRIBUTION.map((week) => {
    return week.pillars.map((p) => Math.max(1, Math.round(postsPerWeek * p.percentage)));
  });

  // Adjust total to match postsPerWeek
  let total = weekCounts.reduce((sum, week) => sum + week.reduce((s, c) => s + c, 0), 0);

  while (total > postsPerWeek) {
    // Find the week with the largest pillar count and reduce by 1
    let maxVal = 0;
    let maxWeek = 0;
    let maxPillar = 0;
    for (let w = 0; w < weekCounts.length; w++) {
      for (let p = 0; p < weekCounts[w].length; p++) {
        if (weekCounts[w][p] > maxVal) {
          maxVal = weekCounts[w][p];
          maxWeek = w;
          maxPillar = p;
        }
      }
    }
    if (maxVal <= 1) break; // Cannot reduce below 1
    weekCounts[maxWeek][maxPillar]--;
    total--;
  }

  while (total < postsPerWeek) {
    // Find the week with the largest percentage that could use more posts
    let minRatio = Infinity;
    let targetWeek = 0;
    let targetPillar = 0;
    for (let w = 0; w < PILLAR_DISTRIBUTION.length; w++) {
      for (let p = 0; p < PILLAR_DISTRIBUTION[w].pillars.length; p++) {
        const ratio = weekCounts[w][p] / PILLAR_DISTRIBUTION[w].pillars[p].percentage;
        if (ratio < minRatio) {
          minRatio = ratio;
          targetWeek = w;
          targetPillar = p;
        }
      }
    }
    weekCounts[targetWeek][targetPillar]++;
    total++;
  }

  return weekCounts;
}

// ---------------------------------------------------------------------------
// Platform assignment
// ---------------------------------------------------------------------------

/**
 * Assign platforms to posts for a given count, ensuring diversity.
 * For 7 posts: min 2 Instagram, 1 LinkedIn, 1 X/Twitter, 1 Facebook, 2 flexible (default Instagram).
 * Scales proportionally for other counts.
 */
function assignPlatforms(postCount: number): SocialPlatform[] {
  if (postCount <= 0) return [];

  const platforms: SocialPlatform[] = [];

  if (postCount <= 4) {
    // For very small counts, assign one each from the most common platforms
    const order: SocialPlatform[] = ['instagram', 'linkedin', 'x-twitter', 'facebook'];
    for (let i = 0; i < postCount; i++) {
      platforms.push(order[i % order.length]);
    }
    return platforms;
  }

  // Scale base distribution proportionally
  const scale = postCount / BASE_POST_COUNT;
  for (const { platform, minCount } of BASE_PLATFORM_DISTRIBUTION) {
    const count = Math.max(1, Math.round(minCount * scale));
    for (let i = 0; i < count; i++) {
      platforms.push(platform);
    }
  }

  // Fill remaining with Instagram (default flexible choice)
  while (platforms.length < postCount) {
    platforms.push('instagram');
  }

  // Trim if we overshot
  while (platforms.length > postCount) {
    platforms.pop();
  }

  return platforms;
}

// ---------------------------------------------------------------------------
// ContentCalendar
// ---------------------------------------------------------------------------

/**
 * Generates a 4-week content calendar plan from a CalendarBrief.
 */
export class ContentCalendar {
  /**
   * Generate 4 weekly plans from the given brief.
   */
  generate(brief: CalendarBrief): WeeklyPlan[] {
    const postsPerWeek = brief.postsPerWeek ?? 7;
    const weekCounts = calculatePillarCounts(postsPerWeek);

    // Build flat pillar list per week (for structure) and total post count
    const weekPillarLists: ContentPillar[][] = PILLAR_DISTRIBUTION.map((weekDef, weekIdx) => {
      const pillarCounts = weekCounts[weekIdx];
      const pillarList: ContentPillar[] = [];
      weekDef.pillars.forEach((p, pIdx) => {
        for (let i = 0; i < pillarCounts[pIdx]; i++) {
          pillarList.push(p.pillar);
        }
      });
      return pillarList;
    });

    const totalPosts = weekPillarLists.reduce((sum, list) => sum + list.length, 0);

    // Assign platforms globally across all posts for diversity
    const globalPlatforms = assignPlatforms(totalPosts);

    let globalPostIndex = 0;
    let currentDate = new Date(brief.startDate);

    const plans: WeeklyPlan[] = PILLAR_DISTRIBUTION.map((weekDef, weekIdx) => {
      const pillarList = weekPillarLists[weekIdx];
      const weekPosts: ScheduledPost[] = [];

      for (let i = 0; i < pillarList.length; i++) {
        const pillar = pillarList[i];
        const platform = globalPlatforms[globalPostIndex];
        const variant = VARIANT_CYCLE[globalPostIndex % VARIANT_CYCLE.length];

        // Select theme by rotating through industry-specific themes
        const themes = CONTENT_THEMES[brief.industry]?.[pillar] ?? CONTENT_THEMES['other'][pillar];
        const contentTheme = themes[globalPostIndex % themes.length];

        const dateStr = currentDate.toISOString().split('T')[0];

        const postSpec: PostSpec = {
          platform,
          format: 'feed-square',
          variant,
          content: {
            headline: contentTheme,
            body: '',
            logoUrl: '',
            variant,
          },
        };

        weekPosts.push({
          date: dateStr,
          pillar,
          platform,
          variant,
          contentTheme,
          postSpec,
        });

        // Advance date by 1 day
        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
        globalPostIndex++;
      }

      return {
        weekNumber: weekDef.weekNumber,
        pillarFocus: weekDef.pillarFocus,
        posts: weekPosts,
      };
    });

    return plans;
  }
}

// ---------------------------------------------------------------------------
// Bridge function: calendar -> BatchBrief (BSS-4.6 integration)
// ---------------------------------------------------------------------------

/**
 * Convert WeeklyPlan[] into a BatchBrief ready for BatchPipeline.run().
 * Flattens all posts across all weeks into a single posts array.
 */
export function calendarToBatchBrief(
  plans: readonly WeeklyPlan[],
  tokens: TokenSet,
  clientId: string,
): BatchBrief {
  const allPosts: PostSpec[] = [];

  for (const week of plans) {
    for (const post of week.posts) {
      allPosts.push(post.postSpec);
    }
  }

  return {
    clientId,
    tokens,
    posts: allPosts,
  };
}
