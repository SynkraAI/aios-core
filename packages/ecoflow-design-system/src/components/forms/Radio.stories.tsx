import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Radio, RadioGroup } from './Radio';

const meta = {
  title: 'Forms/Radio',
  component: Radio,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Option A',
    name: 'radio-demo',
  },
};

export const Checked: Story = {
  args: {
    label: 'Selected option',
    name: 'radio-demo',
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled option',
    name: 'radio-demo',
    disabled: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'Option with error',
    name: 'radio-demo',
    error: 'This option is invalid',
  },
};

export const SmallSize: Story = {
  args: {
    label: 'Small radio',
    name: 'radio-demo',
    size: 'sm',
  },
};

export const LargeSize: Story = {
  args: {
    label: 'Large radio',
    name: 'radio-demo',
    size: 'lg',
  },
};

// RadioGroup stories
export const GroupVertical: Story = {
  render: () => {
    const [value, setValue] = useState('option1');
    return (
      <RadioGroup
        label="Select a plan"
        name="plan"
        options={[
          { value: 'option1', label: 'Free' },
          { value: 'option2', label: 'Pro' },
          { value: 'option3', label: 'Enterprise' },
        ]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const GroupHorizontal: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <RadioGroup
        label="Gender"
        name="gender"
        options={[
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'other', label: 'Other' },
        ]}
        value={value}
        onChange={setValue}
        orientation="horizontal"
      />
    );
  },
};

export const GroupWithDisabled: Story = {
  render: () => {
    const [value, setValue] = useState('opt1');
    return (
      <RadioGroup
        label="Select an option"
        name="options"
        options={[
          { value: 'opt1', label: 'Available Option 1' },
          { value: 'opt2', label: 'Sold Out', disabled: true },
          { value: 'opt3', label: 'Available Option 2' },
        ]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const GroupWithError: Story = {
  render: () => (
    <RadioGroup
      label="Select one option"
      name="required"
      options={[
        { value: 'opt1', label: 'Option 1' },
        { value: 'opt2', label: 'Option 2' },
      ]}
      error="This field is required"
    />
  ),
};
