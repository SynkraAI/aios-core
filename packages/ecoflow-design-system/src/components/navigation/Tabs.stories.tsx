import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Tabs } from './Tabs';

const meta = {
  title: 'Navigation/Tabs',
  component: Tabs,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity', label: 'Activity' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'events', label: 'Events' },
  { id: 'documents', label: 'Documents' },
  { id: 'reports', label: 'Reports' },
];

export const Default: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('overview');
    return <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />;
  },
};

export const WithDisabledTab: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('overview');
    const tabsWithDisabled = [...tabs, { id: 'admin', label: 'Admin', disabled: true }];
    return <Tabs tabs={tabsWithDisabled} activeTab={activeTab} onChange={setActiveTab} />;
  },
};

export const FewTabs: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('tab1');
    return (
      <Tabs
        tabs={[
          { id: 'tab1', label: 'Tab 1' },
          { id: 'tab2', label: 'Tab 2' },
          { id: 'tab3', label: 'Tab 3' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
    );
  },
};

export const ManyTabs: Story = {
  render: () => {
    const [activeTab, setActiveTab] = useState('tab1');
    const manyTabs = Array.from({ length: 12 }, (_, i) => ({
      id: `tab${i + 1}`,
      label: `Tab ${i + 1}`,
    }));
    return <Tabs tabs={manyTabs} activeTab={activeTab} onChange={setActiveTab} />;
  },
};
