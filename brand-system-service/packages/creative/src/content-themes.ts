/**
 * Static content theme map for calendar generation (BSS-4.7).
 *
 * 8 industries x 5 pillars = 40 combinations, each with >= 5 themes.
 * No AI calls — themes are pre-defined professional copy strings.
 */

import type { IndustryVertical, ContentPillar } from './types';

/**
 * Predefined content themes indexed by industry vertical and content pillar.
 * Each combination contains at least 5 theme strings for rotation.
 */
export const CONTENT_THEMES: Record<IndustryVertical, Record<ContentPillar, readonly string[]>> = {
  'health-wellness': {
    educational: [
      'How to build a morning routine that supports your wellness goals',
      '5 signs you need to reassess your self-care strategy',
      'Understanding the mind-body connection for lasting health',
      'The science behind mindful eating and nutrition planning',
      'How to read nutrition labels like a professional',
      'Debunking common wellness myths with evidence-based facts',
    ],
    authority: [
      'What leading research says about holistic health approaches',
      'Our methodology: evidence-based wellness programming',
      'Industry trends shaping the future of health and wellness',
      'How we achieved measurable outcomes for 500+ clients',
      'Expert panel insights on preventive health strategies',
    ],
    engagement: [
      'What does your ideal wellness day look like? Share below',
      'Poll: Which wellness habit has changed your life the most?',
      'Tag someone who inspires your health journey',
      'Your top wellness wins this month — celebrate with us',
      'Quick quiz: How well do you know your body signals?',
    ],
    conversion: [
      'Limited spots: Join our 30-day wellness transformation program',
      'Book your free health assessment — only 10 slots this week',
      'New client special: 20% off your first wellness consultation',
      'Start your journey today — personalized plans from day one',
      'Ready to transform? Our proven program delivers results in 8 weeks',
    ],
    promotional: [
      'Spring wellness packages now available — early bird pricing ends Friday',
      'New service launch: integrative nutrition counseling',
      'Member spotlight: exclusive wellness retreat announcement',
      'Holiday gift guide: wellness packages for every budget',
      'Flash sale: 48 hours only — premium wellness bundles',
    ],
  },
  'professional-services': {
    educational: [
      'How to define your brand identity in 5 steps',
      'The difference between brand voice and tone',
      'Why consistency builds trust with clients',
      '3 signs your brand positioning needs work',
      'What is a design system and why does it matter?',
      'How to audit your current brand touchpoints',
    ],
    authority: [
      'Case study: how we repositioned a legacy firm in 90 days',
      'Industry report: top professional services trends for 2026',
      'Behind the strategy: our proven client onboarding framework',
      'Why 85% of professional firms underinvest in brand strategy',
      'Expert take: the ROI of consistent brand presentation',
    ],
    engagement: [
      'What is your biggest branding challenge right now?',
      'Rate your brand consistency from 1-10 — be honest',
      'Which brand refresh would you prioritize first?',
      'Share your best client communication tip below',
      'Quick poll: do you have documented brand guidelines?',
    ],
    conversion: [
      'Book a free 30-minute brand strategy session',
      'Download our brand audit checklist — no email required',
      'Limited availability: Q2 brand strategy engagements open',
      'Request your custom brand health report today',
      'Schedule your complimentary consultation before slots fill up',
    ],
    promotional: [
      'Introducing our new brand strategy accelerator package',
      'Early access: professional services branding toolkit launch',
      'Partner spotlight: collaborative brand transformation results',
      'New offering: monthly brand performance monitoring',
      'Announcement: expanded team capacity for enterprise clients',
    ],
  },
  'e-commerce': {
    educational: [
      'How to write product descriptions that convert browsers to buyers',
      '5 photography tips that make your products look premium',
      'Understanding your customer journey from discovery to purchase',
      'The psychology behind effective product page layouts',
      'How to leverage user-generated content for social proof',
      'Shipping and returns: best practices that build customer trust',
    ],
    authority: [
      'How our clients achieved 40% higher conversion with brand consistency',
      'E-commerce trend report: what top brands are doing differently',
      'Behind the scenes: our product launch strategy framework',
      'Data insight: why branded packaging increases repeat purchases',
      'Expert analysis: the future of social commerce in 2026',
    ],
    engagement: [
      'Which product feature matters most to you? Vote now',
      'Show us how you style our products — tag us for a feature',
      'New vs. classic: which collection speaks to you?',
      'Guess the next product drop — hint in the comments',
      'What would you like to see in our next collection?',
    ],
    conversion: [
      'Shop now: free shipping on orders over $50 this weekend',
      'New arrivals just dropped — be the first to shop',
      'Use code BRAND20 for 20% off your first order',
      'Only 24 hours left: exclusive member pricing ends tonight',
      'Complete your set — bundle and save 30% today',
    ],
    promotional: [
      'Black Friday preview: early access for newsletter subscribers',
      'Just launched: our most requested product is finally here',
      'Collaboration alert: limited edition collection dropping soon',
      'Seasonal sale: up to 50% off selected favorites',
      'Gift guide: curated picks for every personality and budget',
    ],
  },
  technology: {
    educational: [
      'How to evaluate technology solutions for your business needs',
      '5 security best practices every team should implement today',
      'Understanding API integrations: a non-technical guide',
      'The real cost of technical debt and how to manage it',
      'How to build a technology roadmap that scales with your growth',
      'Cloud vs. on-premise: making the right choice for your stack',
    ],
    authority: [
      'Our engineering team shares lessons from scaling to 1M users',
      'Tech industry forecast: 5 trends reshaping enterprise software',
      'Case study: reducing deployment time by 70% with automation',
      'Why we chose this architecture — and what we learned',
      'Expert perspective: the future of AI in business operations',
    ],
    engagement: [
      'What is the biggest tech challenge your team faces?',
      'Hot take: what technology trend do you think is overhyped?',
      'Poll: which development methodology does your team prefer?',
      'Share your favorite productivity tool — we will compile a list',
      'Debug challenge: can you spot the issue in this code snippet?',
    ],
    conversion: [
      'Start your free 14-day trial — no credit card required',
      'Book a personalized demo with our solutions team',
      'See how our platform compares — request a custom benchmark',
      'Limited offer: enterprise plan at startup pricing for 3 months',
      'Join our beta program and shape the product roadmap',
    ],
    promotional: [
      'Major release: version 3.0 with 15 new features is live',
      'We are hiring: join our engineering team and build the future',
      'Product update: performance improvements you have been requesting',
      'Webinar announcement: live deep-dive into our latest features',
      'Partnership news: integrating with your favorite tools',
    ],
  },
  education: {
    educational: [
      'How to create engaging learning experiences that stick',
      '5 study techniques backed by cognitive science research',
      'The role of visual learning in knowledge retention',
      'How to design curricula that meet diverse learning styles',
      'Understanding competency-based education and its benefits',
      'Tips for creating accessible educational content for all learners',
    ],
    authority: [
      'Research spotlight: our methodology improves outcomes by 35%',
      'Education trends: what leading institutions are adopting now',
      'Faculty perspective: innovations in assessment and evaluation',
      'Case study: transforming student engagement with blended learning',
      'Expert panel: the future of credentialing and micro-certifications',
    ],
    engagement: [
      'What subject would you most want to learn right now?',
      'Share your best study tip — we will feature the top responses',
      'Poll: online vs. in-person learning — which do you prefer?',
      'Tag a teacher who made a difference in your life',
      'What skill do you wish school had taught you?',
    ],
    conversion: [
      'Enroll now: early bird pricing for our spring cohort',
      'Download the free course preview — see what you will learn',
      'Limited scholarships available — apply before the deadline',
      'Schedule a campus visit or virtual tour today',
      'Register for our free masterclass this Thursday evening',
    ],
    promotional: [
      'New program launch: professional certificate in data analytics',
      'Alumni success story: from graduate to industry leader',
      'Open house event: explore our programs and meet faculty',
      'Scholarship fund update: we have expanded eligibility criteria',
      'Summer program registration is now open — spots are limited',
    ],
  },
  hospitality: {
    educational: [
      'How to plan the perfect itinerary for a stress-free trip',
      '5 insider tips for getting the most out of your hotel stay',
      'Understanding seasonal travel patterns and how to save',
      'The art of hospitality: what makes a great guest experience',
      'How to choose the right accommodation for your travel style',
      'Sustainable travel practices every traveler should know',
    ],
    authority: [
      'Behind the scenes: how we maintain 5-star service standards',
      'Hospitality trends: what luxury travelers expect in 2026',
      'Our chef shares the philosophy behind our award-winning menu',
      'Case study: achieving a 95% guest satisfaction rating',
      'Industry insight: the rise of experiential hospitality',
    ],
    engagement: [
      'What is your dream vacation destination? Tell us below',
      'Caption this view — best caption gets a special mention',
      'Poll: beach getaway or mountain retreat this summer?',
      'Share your favorite travel memory with us',
      'If you could add one amenity to our property, what would it be?',
    ],
    conversion: [
      'Book direct and save 15% — exclusive website-only rate',
      'Last-minute availability: luxury suites at special pricing',
      'Reserve your holiday season stay before we sell out',
      'Spa package special: book 2 nights, get a complimentary treatment',
      'Early booking discount: save 25% on summer reservations',
    ],
    promotional: [
      'Grand opening: our newest location is now accepting reservations',
      'Seasonal menu launch: farm-to-table dining experience',
      'Loyalty program update: earn double points this month',
      'Event announcement: exclusive wine and dine evening',
      'New partnership: curated local experiences for our guests',
    ],
  },
  'real-estate': {
    educational: [
      'How to determine the right time to buy or sell property',
      '5 factors that affect property value in your neighborhood',
      'Understanding mortgage options: fixed vs. adjustable rates',
      'The home inspection checklist every buyer needs',
      'How to stage your home for a faster sale at the best price',
      'First-time buyer guide: navigating the real estate process',
    ],
    authority: [
      'Market update: real estate trends and forecasts for Q2 2026',
      'Case study: how we sold above asking price in a slow market',
      'Our team sold 150 homes last year — here is what we learned',
      'Expert analysis: neighborhood development and property values',
      'Industry report: the impact of interest rates on buyer behavior',
    ],
    engagement: [
      'Modern farmhouse or mid-century modern — which style wins?',
      'What is on your must-have list for your dream home?',
      'Poll: city living or suburban space — where do you prefer?',
      'Share a photo of your favorite room in your home',
      'Guess the listing price of this stunning property',
    ],
    conversion: [
      'Get your free home valuation report — no obligation',
      'Schedule a private showing for our newest listings',
      'Buyer consultation: understand your purchasing power today',
      'List with us this month and receive a complimentary staging package',
      'Download our neighborhood guide before your next open house visit',
    ],
    promotional: [
      'Just listed: 4-bedroom family home in a sought-after school district',
      'Open house this Saturday: tour 3 new listings in one afternoon',
      'Sold above asking: another successful closing for our clients',
      'New development preview: luxury condos coming to downtown',
      'Agent spotlight: meet the newest member of our team',
    ],
  },
  other: {
    educational: [
      'How to build a brand that resonates with your target audience',
      '5 principles of effective visual communication',
      'Understanding your customer personas for better marketing',
      'The basics of content strategy for small businesses',
      'How to measure brand awareness and track growth',
      'Creating a consistent brand experience across all touchpoints',
    ],
    authority: [
      'Case study: brand transformation that doubled engagement',
      'Industry insights: marketing trends shaping the next quarter',
      'Behind the strategy: our approach to brand development',
      'Why brand consistency matters more than ever in a digital world',
      'Expert perspective: building trust through authentic storytelling',
    ],
    engagement: [
      'What does your brand stand for? Share your mission below',
      'Poll: which social platform drives the most engagement for you?',
      'Tag a business whose branding you admire',
      'Quick question: what is your biggest marketing challenge?',
      'Share your best business tip for fellow entrepreneurs',
    ],
    conversion: [
      'Book a free strategy call to discuss your brand goals',
      'Download our branding starter kit — completely free',
      'Limited spots: join our next brand workshop cohort',
      'Get a custom proposal for your brand project today',
      'Start your brand transformation — schedule a discovery session',
    ],
    promotional: [
      'Introducing our new all-in-one brand management solution',
      'Client success story: from startup to recognized brand',
      'Announcement: expanded services for growing businesses',
      'Early access: be the first to try our new platform features',
      'Holiday special: bundled brand packages at exclusive pricing',
    ],
  },
};
