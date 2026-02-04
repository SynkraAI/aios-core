import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';

const meta = {
  title: 'Forms/Select',
  component: Select,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'br', label: 'Brazil' },
];

export const Default: Story = {
  args: {
    options,
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Country',
    options,
  },
};

export const WithPlaceholder: Story = {
  args: {
    label: 'Select your country',
    placeholder: 'Choose a country...',
    options,
  },
};

export const WithError: Story = {
  args: {
    label: 'Country',
    options,
    error: 'Please select a country',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Country',
    options,
    helperText: 'Select the country where you reside',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Country',
    options,
    disabled: true,
    defaultValue: 'us',
  },
};

export const FullWidth: Story = {
  args: {
    label: 'Full Width Select',
    options,
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

export const SmallSize: Story = {
  args: {
    label: 'Small',
    size: 'sm',
    options,
  },
};

export const LargeSize: Story = {
  args: {
    label: 'Large',
    size: 'lg',
    options,
  },
};

export const WithDisabledOptions: Story = {
  args: {
    label: 'Country',
    options: [
      { value: 'us', label: 'United States' },
      { value: 'uk', label: 'United Kingdom (unavailable)', disabled: true },
      { value: 'ca', label: 'Canada' },
      { value: 'au', label: 'Australia (unavailable)', disabled: true },
    ],
  },
};
