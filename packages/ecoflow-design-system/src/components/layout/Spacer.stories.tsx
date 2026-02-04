import type { Meta, StoryObj } from '@storybook/react';
import { Spacer } from './Spacer';

const meta = {
  title: 'Layout/Spacer',
  component: Spacer,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'number',
    },
    horizontal: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Spacer>;

export default meta;
type Story = StoryObj<typeof meta>;

const Box = ({ label }: { label: string }) => (
  <div
    style={{
      background: '#00BFA5',
      color: 'white',
      padding: '16px 24px',
      borderRadius: '6px',
      fontWeight: 600,
    }}
  >
    {label}
  </div>
);

export const VerticalSpacing: Story = {
  args: {
    size: 4,
  },
  render: (args) => (
    <div>
      <Box label="Element 1" />
      <Spacer {...args} />
      <Box label="Element 2" />
    </div>
  ),
};

export const SmallVertical: Story = {
  args: {
    size: 2,
  },
  render: (args) => (
    <div>
      <Box label="Small gap (8px)" />
      <Spacer {...args} />
      <Box label="Between elements" />
    </div>
  ),
};

export const LargeVertical: Story = {
  args: {
    size: 12,
  },
  render: (args) => (
    <div>
      <Box label="Large gap (48px)" />
      <Spacer {...args} />
      <Box label="Between elements" />
    </div>
  ),
};

export const HorizontalSpacing: Story = {
  args: {
    size: 4,
    horizontal: true,
  },
  render: (args) => (
    <div style={{ display: 'flex' }}>
      <Box label="Left" />
      <Spacer {...args} />
      <Box label="Right" />
    </div>
  ),
};

export const SmallHorizontal: Story = {
  args: {
    size: 2,
    horizontal: true,
  },
  render: (args) => (
    <div style={{ display: 'flex' }}>
      <Box label="Small gap" />
      <Spacer {...args} />
      <Box label="8px apart" />
    </div>
  ),
};

export const LargeHorizontal: Story = {
  args: {
    size: 12,
    horizontal: true,
  },
  render: (args) => (
    <div style={{ display: 'flex' }}>
      <Box label="Large gap" />
      <Spacer {...args} />
      <Box label="48px apart" />
    </div>
  ),
};

export const MultipleSpacers: Story = {
  render: () => (
    <div>
      <h3 style={{ margin: 0 }}>Section 1</h3>
      <Spacer size={4} />
      <p style={{ margin: 0 }}>Content for section 1</p>
      <Spacer size={8} />
      <h3 style={{ margin: 0 }}>Section 2</h3>
      <Spacer size={4} />
      <p style={{ margin: 0 }}>Content for section 2</p>
      <Spacer size={8} />
      <h3 style={{ margin: 0 }}>Section 3</h3>
      <Spacer size={4} />
      <p style={{ margin: 0 }}>Content for section 3</p>
    </div>
  ),
};

export const InFlex: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '24px',
        background: '#F9FAFB',
        borderRadius: '8px',
      }}
    >
      <Box label="Left" />
      <Spacer size={4} horizontal />
      <Box label="Middle" />
      <Spacer size={8} horizontal />
      <Box label="Right" />
    </div>
  ),
};

export const SizesComparison: Story = {
  render: () => (
    <div>
      <div>
        <Box label="Size 2 (8px)" />
        <Spacer size={2} />
        <Box label="Next element" />
      </div>
      <Spacer size={8} />
      <div>
        <Box label="Size 4 (16px)" />
        <Spacer size={4} />
        <Box label="Next element" />
      </div>
      <Spacer size={8} />
      <div>
        <Box label="Size 6 (24px)" />
        <Spacer size={6} />
        <Box label="Next element" />
      </div>
      <Spacer size={8} />
      <div>
        <Box label="Size 8 (32px)" />
        <Spacer size={8} />
        <Box label="Next element" />
      </div>
    </div>
  ),
};
