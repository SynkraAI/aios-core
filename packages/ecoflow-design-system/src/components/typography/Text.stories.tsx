import type { Meta, StoryObj } from '@storybook/react';
import { Text } from './Text';
import { colors } from '@/tokens/colors';

const meta = {
  title: 'Typography/Text',
  component: Text,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'base', 'lg'],
    },
    weight: {
      control: 'select',
      options: ['normal', 'medium', 'semibold'],
    },
    color: {
      control: 'color',
    },
    as: {
      control: 'select',
      options: ['p', 'span', 'div', 'label'],
    },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'This is the default body text with base size and normal weight.',
  },
};

export const ExtraSmall: Story = {
  args: {
    size: 'xs',
    children: 'Extra small text (12px) - Used for captions and meta text',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small text (14px) - Used for secondary text and table cells',
  },
};

export const Base: Story = {
  args: {
    size: 'base',
    children: 'Base text (16px) - Default body text and inputs',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large text (18px) - Used for large body text and section headers',
  },
};

export const NormalWeight: Story = {
  args: {
    weight: 'normal',
    children: 'Normal weight (400) - Standard body text',
  },
};

export const MediumWeight: Story = {
  args: {
    weight: 'medium',
    children: 'Medium weight (500) - Emphasized text',
  },
};

export const SemiboldWeight: Story = {
  args: {
    weight: 'semibold',
    children: 'Semibold weight (600) - Strong emphasis',
  },
};

export const Truncated: Story = {
  args: {
    truncate: true,
    children:
      'This is a very long text that should be truncated with an ellipsis when it overflows the container width.',
    style: { maxWidth: '300px' },
  },
};

export const PrimaryColor: Story = {
  args: {
    color: colors.primary[500],
    children: 'Text with primary teal color',
  },
};

export const AccentColor: Story = {
  args: {
    color: colors.accent.yellow[600],
    children: 'Text with accent yellow/amber color',
  },
};

export const AsSpan: Story = {
  args: {
    as: 'span',
    children: 'This text is rendered as a <span> element',
  },
};

export const AsLabel: Story = {
  args: {
    as: 'label',
    weight: 'medium',
    size: 'sm',
    children: 'Form Label',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Text size="xs">Extra Small (xs) - 12px</Text>
      <Text size="sm">Small (sm) - 14px</Text>
      <Text size="base">Base - 16px (default)</Text>
      <Text size="lg">Large (lg) - 18px</Text>
    </div>
  ),
};

export const AllWeights: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Text weight="normal">Normal weight (400)</Text>
      <Text weight="medium">Medium weight (500)</Text>
      <Text weight="semibold">Semibold weight (600)</Text>
    </div>
  ),
};
