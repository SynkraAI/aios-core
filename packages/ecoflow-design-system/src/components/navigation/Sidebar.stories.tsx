import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Sidebar } from './Sidebar';

const meta = {
  title: 'Navigation/Sidebar',
  component: Sidebar,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'projects', label: 'Projects', icon: '📁', badge: 5 },
  { id: 'tasks', label: 'Tasks', icon: '✓', badge: 12 },
  { id: 'team', label: 'Team', icon: '👥' },
  {
    id: 'settings',
    label: 'Settings',
    icon: '⚙️',
    children: [
      { id: 'profile', label: 'Profile', icon: '👤' },
      { id: 'security', label: 'Security', icon: '🔒' },
      { id: 'billing', label: 'Billing', icon: '💳' },
    ],
  },
  { id: 'help', label: 'Help', icon: '❓' },
];

export const Default: Story = {
  render: () => {
    const [activeItem, setActiveItem] = useState('dashboard');
    return (
      <Sidebar
        logo={<div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>EcoFlow</div>}
        items={navItems}
        activeItem={activeItem}
        onItemClick={setActiveItem}
      />
    );
  },
};

export const Collapsed: Story = {
  render: () => {
    const [activeItem, setActiveItem] = useState('dashboard');
    return (
      <Sidebar
        logo={<div style={{ fontSize: '24px' }}>E</div>}
        items={navItems}
        activeItem={activeItem}
        collapsed={true}
        onItemClick={setActiveItem}
      />
    );
  },
};

export const WithLogo: Story = {
  render: () => {
    const [activeItem, setActiveItem] = useState('projects');
    return (
      <Sidebar
        logo={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
            <div style={{ width: '32px', height: '32px', background: '#FFB800', borderRadius: '50%' }} />
            <span style={{ fontSize: '18px', fontWeight: '600' }}>EcoFlow</span>
          </div>
        }
        items={navItems}
        activeItem={activeItem}
        onItemClick={setActiveItem}
      />
    );
  },
};

export const WithExpandedSection: Story = {
  render: () => {
    const [activeItem, setActiveItem] = useState('profile');
    return (
      <Sidebar
        logo={<div style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>EcoFlow</div>}
        items={navItems}
        activeItem={activeItem}
        onItemClick={setActiveItem}
      />
    );
  },
};

export const SimpleSidebar: Story = {
  render: () => {
    const [activeItem, setActiveItem] = useState('home');
    const simpleItems = [
      { id: 'home', label: 'Home' },
      { id: 'about', label: 'About' },
      { id: 'contact', label: 'Contact' },
    ];
    return <Sidebar items={simpleItems} activeItem={activeItem} onItemClick={setActiveItem} />;
  },
};

export const CustomWidth: Story = {
  render: () => {
    const [activeItem, setActiveItem] = useState('dashboard');
    return (
      <Sidebar
        logo={<div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>EcoFlow</div>}
        items={navItems}
        activeItem={activeItem}
        width="280px"
        onItemClick={setActiveItem}
      />
    );
  },
};
