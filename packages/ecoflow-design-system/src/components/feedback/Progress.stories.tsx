import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './Progress';

const meta: Meta<typeof Progress> = {
  title: 'Feedback/Progress',
  component: Progress,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['linear', 'circular'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Linear: Story = {
  args: {
    variant: 'linear',
    value: 65,
  },
};

export const Circular: Story = {
  args: {
    variant: 'circular',
    value: 75,
  },
};

export const WithLabel: Story = {
  args: {
    variant: 'linear',
    value: 45,
    label: 'Uploading',
    showLabel: true,
  },
};

export const SmallLinear: Story = {
  args: {
    variant: 'linear',
    value: 30,
    size: 'sm',
    showLabel: true,
  },
};

export const MediumLinear: Story = {
  args: {
    variant: 'linear',
    value: 60,
    size: 'md',
    showLabel: true,
  },
};

export const LargeLinear: Story = {
  args: {
    variant: 'linear',
    value: 90,
    size: 'lg',
    showLabel: true,
  },
};

export const SmallCircular: Story = {
  args: {
    variant: 'circular',
    value: 40,
    size: 'sm',
    showLabel: true,
  },
};

export const MediumCircular: Story = {
  args: {
    variant: 'circular',
    value: 70,
    size: 'md',
    showLabel: true,
  },
};

export const LargeCircular: Story = {
  args: {
    variant: 'circular',
    value: 85,
    size: 'lg',
    showLabel: true,
  },
};

export const CustomColor: Story = {
  args: {
    variant: 'linear',
    value: 55,
    color: '#ff6b6b',
    showLabel: true,
  },
};

export const Complete: Story = {
  args: {
    variant: 'linear',
    value: 100,
    label: 'Complete',
    showLabel: true,
  },
};

export const AllSizesLinear: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <Progress variant="linear" value={30} size="sm" showLabel label="Small" />
      <Progress variant="linear" value={60} size="md" showLabel label="Medium" />
      <Progress variant="linear" value={90} size="lg" showLabel label="Large" />
    </div>
  ),
};

export const AllSizesCircular: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
      <Progress variant="circular" value={30} size="sm" showLabel label="Small" />
      <Progress variant="circular" value={60} size="md" showLabel label="Medium" />
      <Progress variant="circular" value={90} size="lg" showLabel label="Large" />
    </div>
  ),
};

export const VariousStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Progress variant="linear" value={0} showLabel label="Starting" />
      <Progress variant="linear" value={25} showLabel label="Processing" />
      <Progress variant="linear" value={50} showLabel label="Half way" />
      <Progress variant="linear" value={75} showLabel label="Almost done" />
      <Progress variant="linear" value={100} showLabel label="Complete" />
    </div>
  ),
};
