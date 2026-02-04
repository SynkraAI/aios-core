import type { Meta, StoryObj } from '@storybook/react';
import { Heading } from './Heading';
import { colors } from '@/tokens/colors';

const meta = {
  title: 'Typography/Heading',
  component: Heading,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    level: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6],
    },
    weight: {
      control: 'select',
      options: ['semibold', 'bold'],
    },
    color: {
      control: 'color',
    },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const H1: Story = {
  args: {
    level: 1,
    children: 'Heading Level 1',
  },
};

export const H2: Story = {
  args: {
    level: 2,
    children: 'Heading Level 2',
  },
};

export const H3: Story = {
  args: {
    level: 3,
    children: 'Heading Level 3',
  },
};

export const H4: Story = {
  args: {
    level: 4,
    children: 'Heading Level 4',
  },
};

export const H5: Story = {
  args: {
    level: 5,
    children: 'Heading Level 5',
  },
};

export const H6: Story = {
  args: {
    level: 6,
    children: 'Heading Level 6',
  },
};

export const BoldWeight: Story = {
  args: {
    level: 2,
    weight: 'bold',
    children: 'Bold Heading (weight: bold)',
  },
};

export const SemiboldWeight: Story = {
  args: {
    level: 2,
    weight: 'semibold',
    children: 'Semibold Heading (weight: semibold)',
  },
};

export const PrimaryColor: Story = {
  args: {
    level: 2,
    color: colors.primary[500],
    children: 'Primary Color Heading',
  },
};

export const AccentColor: Story = {
  args: {
    level: 2,
    color: colors.accent.yellow[500],
    children: 'Accent Color Heading',
  },
};

export const AllLevels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Heading level={1}>Heading 1 - 36px (4xl)</Heading>
      <Heading level={2}>Heading 2 - 30px (3xl)</Heading>
      <Heading level={3}>Heading 3 - 24px (2xl)</Heading>
      <Heading level={4}>Heading 4 - 20px (xl)</Heading>
      <Heading level={5}>Heading 5 - 18px (lg)</Heading>
      <Heading level={6}>Heading 6 - 16px (base)</Heading>
    </div>
  ),
};
