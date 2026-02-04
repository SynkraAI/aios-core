import type { Meta, StoryObj } from '@storybook/react';
import { StatusIndicator } from './StatusIndicator';

const meta: Meta<typeof StatusIndicator> = {
  title: 'Data Display/StatusIndicator',
  component: StatusIndicator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['online', 'offline', 'busy', 'away'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Online: Story = {
  args: {
    status: 'online',
  },
};

export const Offline: Story = {
  args: {
    status: 'offline',
  },
};

export const Busy: Story = {
  args: {
    status: 'busy',
  },
};

export const Away: Story = {
  args: {
    status: 'away',
  },
};

export const WithLabel: Story = {
  args: {
    status: 'online',
    showLabel: true,
  },
};

export const CustomLabel: Story = {
  args: {
    status: 'online',
    label: 'Active Now',
    showLabel: true,
  },
};

export const Small: Story = {
  args: {
    status: 'online',
    size: 'sm',
    showLabel: true,
  },
};

export const Medium: Story = {
  args: {
    status: 'online',
    size: 'md',
    showLabel: true,
  },
};

export const Large: Story = {
  args: {
    status: 'online',
    size: 'lg',
    showLabel: true,
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', flexDirection: 'column' }}>
      <StatusIndicator status="online" showLabel />
      <StatusIndicator status="offline" showLabel />
      <StatusIndicator status="busy" showLabel />
      <StatusIndicator status="away" showLabel />
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
      <StatusIndicator status="online" size="sm" showLabel />
      <StatusIndicator status="online" size="md" showLabel />
      <StatusIndicator status="online" size="lg" showLabel />
    </div>
  ),
};

export const WithoutLabels: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <StatusIndicator status="online" />
      <StatusIndicator status="offline" />
      <StatusIndicator status="busy" />
      <StatusIndicator status="away" />
    </div>
  ),
};
