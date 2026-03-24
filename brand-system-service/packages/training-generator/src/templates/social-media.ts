import { wrapLayout, loomSection } from './shared';
import type { LoomPlaceholder } from '../types';

/**
 * Generates the Social Media Training Guide HTML document.
 * Covers: content calendar, template usage, hashtag strategy,
 * posting cadence, and brand voice reminders.
 */
export function renderSocialMediaGuide(
  clientName: string,
  primaryColor: string,
  loom: LoomPlaceholder
): string {
  const body = `
  <div class="header">
    <h1>Social Media Training Guide</h1>
    <p>How to publish on-brand social media content for ${clientName} using the delivered templates and content calendar.</p>
  </div>

  <h2>1. Content Calendar Structure</h2>
  <div class="section">
    <p>Your content calendar (exported from BSS) follows this structure:</p>
    <ul>
      <li><strong>Date:</strong> Scheduled publish date</li>
      <li><strong>Platform:</strong> Instagram, LinkedIn, X/Twitter, Pinterest</li>
      <li><strong>Content Type:</strong> Image post, carousel, video, story</li>
      <li><strong>Theme:</strong> Educational, promotional, behind-the-scenes, engagement</li>
      <li><strong>Copy:</strong> Ready-to-publish caption text</li>
      <li><strong>Hashtags:</strong> Pre-researched hashtag set</li>
      <li><strong>Visual:</strong> Link to the template/asset to use</li>
    </ul>
    <p>The calendar is exported as CSV/ICS for import into your scheduling tool (Buffer, Hootsuite, Later, etc.).</p>
  </div>

  <h2>2. Using Templates in Design Tools</h2>
  <div class="section">
    <p>Social media templates are delivered as editable files:</p>
    <ol>
      <li>Open the template in Canva, Figma, or your preferred design tool.</li>
      <li>Replace placeholder text with your actual copy from the content calendar.</li>
      <li>Swap placeholder images with your own photos or approved brand assets.</li>
      <li><strong>Do not</strong> change the colors, fonts, or layout — these are set by brand tokens.</li>
      <li>Export at the correct dimensions for the target platform.</li>
    </ol>
    <h3>Platform Dimensions</h3>
    <ul>
      <li><strong>Instagram Feed:</strong> 1080x1080 (square) or 1080x1350 (portrait)</li>
      <li><strong>Instagram Stories/Reels:</strong> 1080x1920</li>
      <li><strong>LinkedIn Post:</strong> 1200x627</li>
      <li><strong>X/Twitter Post:</strong> 1600x900</li>
      <li><strong>Pinterest Pin:</strong> 1000x1500</li>
    </ul>
  </div>

  <h2>3. Hashtag Strategy</h2>
  <div class="section">
    <p>Each post should use a mix of three hashtag tiers:</p>
    <ul>
      <li><strong>Niche (&lt;50K posts):</strong> Highly targeted to your specific industry or audience. These have lower competition and higher engagement rates.</li>
      <li><strong>Medium (50K-500K posts):</strong> Industry-relevant hashtags with moderate reach.</li>
      <li><strong>Broad (&gt;500K posts):</strong> Popular hashtags for maximum visibility. Use sparingly (2-3 per post).</li>
    </ul>
    <p><strong>Recommended count per platform:</strong></p>
    <ul>
      <li>Instagram: 20-30 hashtags per post</li>
      <li>LinkedIn: 3-5 hashtags</li>
      <li>X/Twitter: 1-3 hashtags</li>
      <li>Pinterest: 2-5 hashtags</li>
    </ul>
  </div>

  <h2>4. Posting Cadence</h2>
  <div class="section">
    <ul>
      <li><strong>Instagram:</strong> 3-5 feed posts/week, 5-7 stories/week</li>
      <li><strong>LinkedIn:</strong> 2-3 posts/week</li>
      <li><strong>X/Twitter:</strong> 1-3 posts/day</li>
      <li><strong>Pinterest:</strong> 5-10 pins/week</li>
    </ul>
    <p>Consistency is more important than volume. It's better to post 3 high-quality pieces per week than 7 mediocre ones.</p>
  </div>

  <h2>5. Brand Voice Reminders</h2>
  <div class="section">
    <ul>
      <li>Maintain the brand's tone of voice across all platforms.</li>
      <li>Adapt formality to the platform (LinkedIn = more professional, Instagram = more casual).</li>
      <li>Always proofread before posting — typos undermine brand credibility.</li>
      <li>Use the brand's approved emoji style (if any) from the brand book.</li>
      <li>When responding to comments, stay on-brand and professional.</li>
    </ul>
  </div>

  ${loomSection(loom.title, loom.duration, loom.outline, loom.url)}`;

  return wrapLayout('Social Media Training Guide', clientName, primaryColor, body);
}
