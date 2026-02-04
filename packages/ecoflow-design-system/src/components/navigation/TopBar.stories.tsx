import type { Meta, StoryObj } from '@storybook/react';
import { TopBar } from './TopBar';

const meta = {
  title: 'Navigation/TopBar',
  component: TopBar,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof TopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    user: { name: 'John Doe', role: 'Admin' },
    notifications: 3,
  },
};

export const WithSearch: Story = {
  args: {
    searchPlaceholder: 'Search projects, tasks, or people...',
    onSearch: (query) => console.log('Searching:', query),
    user: { name: 'Jane Smith', role: 'Project Manager' },
  },
};

export const ManyNotifications: Story = {
  args: {
    notifications: 99,
    user: { name: 'Alice Johnson' },
  },
};

export const NoNotifications: Story = {
  args: {
    notifications: 0,
    onNotificationsClick: () => console.log('Notifications clicked'),
    user: { name: 'Bob Williams', role: 'Developer' },
  },
};

export const WithAvatar: Story = {
  args: {
    user: {
      name: 'Sarah Miller',
      role: 'Designer',
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    notifications: 2,
  },
};

export const WithCustomContent: Story = {
  args: {
    leftContent: (
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <button style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px' }}>
          New Project
        </button>
      </div>
    ),
    rightContent: (
      <button style={{ padding: '8px 16px', border: 'none', background: '#00BFA5', color: 'white', borderRadius: '4px' }}>
        Upgrade
      </button>
    ),
    user: { name: 'Mike Davis', role: 'Admin' },
  },
};

export const Minimal: Story = {
  args: {
    user: { name: 'Emma Wilson' },
  },
};
