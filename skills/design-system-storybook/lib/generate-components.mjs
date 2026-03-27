#!/usr/bin/env node

/**
 * generate-components.mjs
 *
 * Reads components.json, extracted-css.json, and tokens.yaml from a design-system
 * extraction, then generates React components + Storybook stories.
 *
 * Usage:
 *   node generate-components.mjs --input ./design-system --output ./src/components [--filter atoms]
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const { values: args } = parseArgs({
  options: {
    input: { type: 'string', short: 'i' },
    output: { type: 'string', short: 'o' },
    filter: { type: 'string', short: 'f' },
    'dry-run': { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h' },
  },
});

if (args.help || !args.input || !args.output) {
  console.log(`
Usage: generate-components.mjs --input <design-system-dir> --output <components-dir>

Options:
  -i, --input    Path to design-system/ directory (with components.json, extracted-css.json, tokens.yaml)
  -o, --output   Path to src/components/ directory
  -f, --filter   Generate only: atoms, molecules, organisms, or a specific component name
  --dry-run      Show what would be generated without writing files
  -h, --help     Show this help
`);
  process.exit(0);
}

const INPUT_DIR = resolve(args.input);
const OUTPUT_DIR = resolve(args.output);
const FILTER = args.filter || 'all';
const DRY_RUN = args['dry-run'];

// ---------------------------------------------------------------------------
// Atomic classification map
// ---------------------------------------------------------------------------

const ATOMIC_MAP = {
  button: 'atoms',
  'cta-link': 'atoms',
  'form-input': 'atoms',
  badge: 'atoms',
  avatar: 'atoms',
  icon: 'atoms',
  skeleton: 'atoms',
  progress: 'atoms',
  notification: 'atoms',
  image: 'atoms',
  video: 'atoms',

  card: 'molecules',
  tabs: 'molecules',
  accordion: 'molecules',
  dropdown: 'molecules',
  tooltip: 'molecules',
  breadcrumb: 'molecules',
  pagination: 'molecules',
  carousel: 'molecules',
  'grid-layout': 'molecules',
  table: 'molecules',

  hero: 'organisms',
  header: 'organisms',
  navigation: 'organisms',
  footer: 'organisms',
  'main-content': 'organisms',
  sidebar: 'organisms',
  form: 'organisms',
  modal: 'organisms',
  'feature-section': 'organisms',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readJson(filename) {
  const filepath = join(INPUT_DIR, filename);
  if (!existsSync(filepath)) {
    console.warn(`  Warning: ${filename} not found at ${filepath}`);
    return null;
  }
  return JSON.parse(readFileSync(filepath, 'utf-8'));
}

function readYaml(filename) {
  const filepath = join(INPUT_DIR, filename);
  if (!existsSync(filepath)) {
    console.warn(`  Warning: ${filename} not found at ${filepath}`);
    return null;
  }
  // Simple YAML parser for flat/nested key-value (no external deps)
  const content = readFileSync(filepath, 'utf-8');
  const result = {};
  let currentSection = null;
  let currentItem = null;

  for (const line of content.split('\n')) {
    const trimmed = line.trimEnd();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const sectionMatch = trimmed.match(/^(\w[\w_]*):\s*$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1];
      result[currentSection] = {};
      currentItem = null;
      continue;
    }

    const itemMatch = trimmed.match(/^  "?([^":\s]+)"?:\s*$/);
    if (itemMatch && currentSection) {
      currentItem = itemMatch[1];
      result[currentSection][currentItem] = {};
      continue;
    }

    const valueMatch = trimmed.match(/^    (\S+):\s*"?([^"]*)"?\s*$/);
    if (valueMatch && currentSection && currentItem) {
      result[currentSection][currentItem][valueMatch[1]] = valueMatch[2];
      continue;
    }

    const flatMatch = trimmed.match(/^  "?([^":\s]+)"?:\s*"?([^"]*)"?\s*$/);
    if (flatMatch && currentSection && !currentItem) {
      result[currentSection][flatMatch[1]] = flatMatch[2];
    }
  }

  return result;
}

function toPascalCase(str) {
  return str
    .replace(/[-_\s]+/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase().replace(/[\s_]+/g, '-');
}

function ensureDir(dir) {
  if (!DRY_RUN) {
    mkdirSync(dir, { recursive: true });
  }
}

function writeFile(filepath, content) {
  if (DRY_RUN) {
    console.log(`  [dry-run] Would write: ${filepath}`);
    return;
  }
  writeFileSync(filepath, content, 'utf-8');
  console.log(`  Created: ${filepath}`);
}

function resolveHtmlTag(type) {
  const tagMap = {
    button: 'button',
    'cta-link': 'a',
    'form-input': 'input',
    badge: 'span',
    avatar: 'div',
    icon: 'svg',
    image: 'img',
    video: 'video',
  };
  return tagMap[type] || 'div';
}

function extractBaseClasses(sample) {
  if (!sample || !sample.styles) return '';
  const s = sample.styles;
  const classes = [];

  if (s.display === 'flex') classes.push('flex');
  if (s.display === 'inline-flex') classes.push('inline-flex');
  if (s.display === 'grid') classes.push('grid');

  if (s.borderRadius) {
    const px = parseInt(s.borderRadius);
    if (px >= 9999) classes.push('rounded-full');
    else if (px >= 12) classes.push('rounded-xl');
    else if (px >= 8) classes.push('rounded-lg');
    else if (px >= 6) classes.push('rounded-md');
    else if (px >= 4) classes.push('rounded');
    else if (px > 0) classes.push('rounded-sm');
  }

  if (s.fontWeight) {
    const w = parseInt(s.fontWeight);
    if (w >= 700) classes.push('font-bold');
    else if (w >= 600) classes.push('font-semibold');
    else if (w >= 500) classes.push('font-medium');
  }

  if (s.fontSize) {
    const px = parseInt(s.fontSize);
    if (px >= 48) classes.push('text-5xl');
    else if (px >= 36) classes.push('text-4xl');
    else if (px >= 30) classes.push('text-3xl');
    else if (px >= 24) classes.push('text-2xl');
    else if (px >= 20) classes.push('text-xl');
    else if (px >= 18) classes.push('text-lg');
    else if (px >= 16) classes.push('text-base');
    else if (px >= 14) classes.push('text-sm');
    else classes.push('text-xs');
  }

  return classes.join(' ');
}

function extractColorClass(rgbValue, tokens) {
  if (!rgbValue || !tokens || !tokens.colors) return '';
  // Try to find matching token color
  for (const [name, data] of Object.entries(tokens.colors)) {
    const tokenValue = typeof data === 'string' ? data : data.value;
    if (tokenValue && rgbValue.includes(tokenValue)) {
      return name.replace(/_/g, '-');
    }
  }
  return '';
}

// ---------------------------------------------------------------------------
// Component generators
// ---------------------------------------------------------------------------

function resolveTokenColors(tokens) {
  if (!tokens?.colors) return { bg: '', text: '', accent: '' };
  const entries = Object.entries(tokens.colors);
  // Sort by occurrences descending to find dominant colors
  const sorted = entries
    .map(([name, data]) => ({
      name: name.replace(/_/g, '-'),
      value: typeof data === 'string' ? data : data.value,
      count: typeof data === 'string' ? 0 : parseInt(data.occurrences || '0'),
    }))
    .sort((a, b) => b.count - a.count);

  return {
    bg: sorted[0]?.name || '',
    text: sorted[1]?.name || '',
    accent: sorted[2]?.name || '',
  };
}

function resolveCustomProps(css) {
  if (!css?.cssRules?.customProperties) return {};
  return css.cssRules.customProperties;
}

function generateAtom(comp, tokens, css) {
  const name = toPascalCase(comp.type);
  const slug = toKebabCase(comp.type);
  const htmlTag = resolveHtmlTag(comp.type);
  const sample = comp.samples?.[0];
  const baseClasses = extractBaseClasses(sample);
  const tokenColors = resolveTokenColors(tokens);
  const customProps = resolveCustomProps(css);

  // Use CSS custom properties when available (anti-AI-slop: real tokens, not generic)
  const hasCssVars = Object.keys(customProps).length > 0;
  const bgStyle = hasCssVars ? '[background:var(--color-primary,theme(colors.primary.DEFAULT))]' : 'bg-primary';
  const textStyle = hasCssVars ? '[color:var(--color-text,theme(colors.foreground))]' : 'text-foreground';
  const accentStyle = hasCssVars ? '[background:var(--color-accent,theme(colors.secondary.DEFAULT))]' : 'bg-secondary';

  const component = `import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ${name}Props
  extends React.HTMLAttributes<HTML${toPascalCase(htmlTag)}Element> {
  /** Visual variant — maps to extracted design tokens */
  variant?: 'default' | 'primary' | 'accent';
  /** Size based on detected samples */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
  className?: string;
}

const variants = {
  default: '${textStyle}',
  primary: '${bgStyle} text-white',
  accent: '${accentStyle} text-white',
} as const;

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
} as const;

export const ${name} = forwardRef<HTML${toPascalCase(htmlTag)}Element, ${name}Props>(
  ({ variant = 'default', size = 'md', disabled, className, children, ...props }, ref) => {
    return (
      <${htmlTag}
        ref={ref}
        className={cn(
          '${baseClasses}',
          'transition-colors duration-200',
          variants[variant],
          sizes[size],
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className,
        )}
        ${htmlTag === 'button' ? 'disabled={disabled}' : ''}
        {...props}
      >
        {children}
      </${htmlTag}>
    );
  }
);

${name}.displayName = '${name}';
`;

  const story = `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: 'Atoms/${name}',
  component: ${name},
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'primary', 'accent'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ${name}>;

export const Default: Story = {
  args: {
    children: '${name}',
    variant: 'default',
    size: 'md',
  },
};

export const Primary: Story = {
  args: {
    children: '${name}',
    variant: 'primary',
    size: 'md',
  },
};

export const Accent: Story = {
  args: {
    children: '${name}',
    variant: 'accent',
    size: 'md',
  },
};

export const Small: Story = {
  args: { children: '${name}', size: 'sm' },
};

export const Large: Story = {
  args: { children: '${name}', size: 'lg' },
};

export const Disabled: Story = {
  args: { children: '${name}', disabled: true },
};
`;

  const index = `export { ${name} } from './${name}';
export type { ${name}Props } from './${name}';
`;

  return { name, slug, component, story, index, level: 'atoms' };
}

function generateMolecule(comp, tokens, css) {
  const name = toPascalCase(comp.type);
  const slug = toKebabCase(comp.type);
  const sample = comp.samples?.[0];
  const baseClasses = extractBaseClasses(sample);

  const component = `import { cn } from '@/lib/utils';

export interface ${name}Props {
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function ${name}({ title, description, className, children }: ${name}Props) {
  return (
    <div className={cn(
      '${baseClasses}',
      'overflow-hidden',
      className,
    )}>
      {title && (
        <h3 className="font-semibold text-lg">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}
      {children && (
        <div className="mt-4">{children}</div>
      )}
    </div>
  );
}
`;

  const story = `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: 'Molecules/${name}',
  component: ${name},
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ${name}>;

export const Default: Story = {
  args: {
    title: 'Sample ${name}',
    description: 'A ${slug} component extracted from the original design.',
  },
};

export const WithChildren: Story = {
  args: {
    title: '${name} with content',
    children: 'Custom child content goes here.',
  },
};
`;

  const index = `export { ${name} } from './${name}';
export type { ${name}Props } from './${name}';
`;

  return { name, slug, component, story, index, level: 'molecules' };
}

function generateOrganism(comp, tokens, css, sectionMap) {
  const name = toPascalCase(comp.type);
  const slug = toKebabCase(comp.type);
  const sample = comp.samples?.[0];

  // Try to find matching section in section-map for background/layout
  const section = sectionMap?.find(
    (s) =>
      s.tag === 'section' ||
      s.tag === 'header' ||
      s.tag === 'footer' ||
      s.tag === 'nav'
  );

  const bgClass = section?.background && section.background !== 'transparent'
    ? 'bg-background'
    : '';

  const component = `import { cn } from '@/lib/utils';

export interface ${name}Props {
  className?: string;
  children?: React.ReactNode;
}

export function ${name}({ className, children }: ${name}Props) {
  return (
    <section className={cn(
      'w-full py-16 px-4 md:px-8 lg:px-16',
      '${bgClass}',
      className,
    )}>
      <div className="max-w-7xl mx-auto">
        {children || (
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              ${name}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              This section was extracted from the original design. Replace this placeholder with actual content.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
`;

  const story = `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: 'Organisms/${name}',
  component: ${name},
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof ${name}>;

export const Default: Story = {};

export const WithContent: Story = {
  args: {
    children: (
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold">Custom Content</h2>
        <p className="text-muted-foreground">Replace with your actual content.</p>
      </div>
    ),
  },
};

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile' },
  },
};
`;

  const index = `export { ${name} } from './${name}';
export type { ${name}Props } from './${name}';
`;

  return { name, slug, component, story, index, level: 'organisms' };
}

// ---------------------------------------------------------------------------
// Docs MDX generator (AC5)
// ---------------------------------------------------------------------------

function generateDocsMdx(comp, level, name, slug, tokens, css) {
  const levelTitle = level === 'atoms' ? 'Atoms' : level === 'molecules' ? 'Molecules' : 'Organisms';

  // Collect token info used by this component
  const sample = comp.samples?.[0];
  const tokenRows = [];
  if (sample?.styles?.background && tokens?.colors) {
    const colorName = extractColorClass(sample.styles.background, tokens);
    if (colorName) tokenRows.push(`| \`--color-${colorName}\` | \`${sample.styles.background}\` | Background |`);
  }
  if (sample?.styles?.color && tokens?.colors) {
    const colorName = extractColorClass(sample.styles.color, tokens);
    if (colorName) tokenRows.push(`| \`--color-${colorName}\` | \`${sample.styles.color}\` | Text color |`);
  }
  if (sample?.styles?.fontSize) {
    tokenRows.push(`| \`font-size\` | \`${sample.styles.fontSize}\` | Font size |`);
  }
  if (sample?.styles?.borderRadius && sample.styles.borderRadius !== '0px') {
    tokenRows.push(`| \`border-radius\` | \`${sample.styles.borderRadius}\` | Border radius |`);
  }

  // Detect animations for this component
  const animations = detectComponentAnimations(comp, css);
  const animationSection = animations.length > 0 ? `
## Animations

| Animation | CSS |
|-----------|-----|
${animations.map(a => `| \`${a.name}\` | \`${a.cssText.slice(0, 80)}...\` |`).join('\n')}
` : '';

  return `import { Meta, Canvas, Controls } from '@storybook/blocks';
import * as Stories from './${name}.stories';

<Meta of={Stories} />

# ${name}

**Level:** ${levelTitle}
**Instances detected:** ${comp.count}

---

## Preview

<Canvas of={Stories.Default} />

<Controls of={Stories.Default} />

## Import

\`\`\`tsx
import { ${name} } from '@/components/${level}/${slug}';
\`\`\`

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
${tokenRows.length > 0 ? tokenRows.join('\n') : '| — | — | No tokens mapped |'}
${animationSection}
## Variants

### Primary
<Canvas of={Stories.Primary} />

### Mobile
<Canvas of={Stories.Mobile} />
`;
}

// ---------------------------------------------------------------------------
// Animation detection (AC7)
// ---------------------------------------------------------------------------

function detectComponentAnimations(comp, css) {
  if (!css?.cssRules?.animations) return [];
  // Heuristic: match animation names to component type keywords
  const type = comp.type.toLowerCase();
  const keywords = [type, ...type.split('-')];

  return css.cssRules.animations.filter(anim => {
    const animName = anim.name.toLowerCase();
    // Check if animation name relates to component type or is a generic animation
    return keywords.some(k => animName.includes(k)) ||
      // Also include if component is hero/header and animation is a common hero animation
      (type === 'hero' && /gradient|float|pulse|glow|aurora|fade/i.test(animName)) ||
      (type === 'button' && /shine|shimmer|pulse|glow/i.test(animName)) ||
      (type === 'navigation' && /slide|fade/i.test(animName));
  });
}

function getAnimationSummary(css) {
  if (!css?.cssRules?.animations) return [];
  return css.cssRules.animations.map(a => ({
    name: a.name,
    cssText: a.cssText.slice(0, 120),
  }));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('\n  Design System Storybook Generator\n');
  console.log(`  Input:  ${INPUT_DIR}`);
  console.log(`  Output: ${OUTPUT_DIR}`);
  console.log(`  Filter: ${FILTER}`);
  if (DRY_RUN) console.log('  Mode:   DRY RUN\n');
  else console.log('');

  // Read input files
  const components = readJson('components.json');
  const css = readJson('extracted-css.json');
  const tokens = readYaml('tokens.yaml');
  const sectionMap = readJson('section-map.json');

  if (!components) {
    console.error('  Error: components.json is required');
    process.exit(1);
  }

  console.log(`  Found ${components.length} component types\n`);

  // Classify and filter
  const classified = { atoms: [], molecules: [], organisms: [] };
  const unknown = [];

  for (const comp of components) {
    const level = ATOMIC_MAP[comp.type];
    if (level) {
      classified[level].push(comp);
    } else {
      unknown.push(comp.type);
    }
  }

  if (unknown.length > 0) {
    console.log(`  Unclassified (skipping): ${unknown.join(', ')}\n`);
  }

  // Stats
  const stats = { generated: 0, skipped: 0, errors: 0 };

  // Generate per level
  const levels = FILTER === 'all'
    ? ['atoms', 'molecules', 'organisms']
    : [FILTER];

  for (const level of levels) {
    const comps = classified[level];
    if (!comps || comps.length === 0) {
      console.log(`  ${level}: no components to generate\n`);
      continue;
    }

    console.log(`  ${level.toUpperCase()} (${comps.length} components):`);

    for (const comp of comps) {
      try {
        let result;
        if (level === 'atoms') result = generateAtom(comp, tokens, css);
        else if (level === 'molecules') result = generateMolecule(comp, tokens, css);
        else result = generateOrganism(comp, tokens, css, sectionMap);

        const dir = join(OUTPUT_DIR, result.level, result.slug);
        ensureDir(dir);

        writeFile(join(dir, `${result.name}.tsx`), result.component);
        writeFile(join(dir, `${result.name}.stories.tsx`), result.story);
        writeFile(join(dir, 'index.ts'), result.index);

        // Generate docs MDX (AC5)
        const docs = generateDocsMdx(comp, result.level, result.name, result.slug, tokens, css);
        writeFile(join(dir, `${result.name}.mdx`), docs);

        stats.generated++;
      } catch (err) {
        console.error(`  Error generating ${comp.type}: ${err.message}`);
        stats.errors++;
      }
    }
    console.log('');
  }

  // Generate barrel export
  const allGenerated = [
    ...classified.atoms,
    ...classified.molecules,
    ...classified.organisms,
  ].filter((c) => ATOMIC_MAP[c.type]);

  if (allGenerated.length > 0) {
    const barrelLines = [];
    for (const level of ['atoms', 'molecules', 'organisms']) {
      for (const comp of classified[level] || []) {
        const name = toPascalCase(comp.type);
        const slug = toKebabCase(comp.type);
        barrelLines.push(`export { ${name} } from './${level}/${slug}';`);
      }
    }
    writeFile(join(OUTPUT_DIR, 'index.ts'), barrelLines.join('\n') + '\n');
  }

  // Animation report (AC7)
  const allAnimations = getAnimationSummary(css);
  if (allAnimations.length > 0) {
    console.log(`  Animations detected: ${allAnimations.length}`);
    for (const anim of allAnimations) {
      console.log(`    - ${anim.name}`);
    }
    console.log('');
  }

  // Summary
  console.log('  Summary:');
  console.log(`    Generated:  ${stats.generated} components`);
  console.log(`    Docs (MDX): ${stats.generated} pages`);
  console.log(`    Skipped:    ${stats.skipped}`);
  console.log(`    Errors:     ${stats.errors}`);
  console.log(`    Atoms:      ${classified.atoms.length}`);
  console.log(`    Molecules:  ${classified.molecules.length}`);
  console.log(`    Organisms:  ${classified.organisms.length}`);
  console.log(`    Animations: ${allAnimations.length}`);
  console.log('');
}

main();
