import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Checkbox, CheckboxGroup } from './Checkbox';

const meta = {
  title: 'Forms/Checkbox',
  component: Checkbox,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Accept terms and conditions',
  },
};

export const Checked: Story = {
  args: {
    label: 'Checked checkbox',
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled checkbox',
    disabled: true,
  },
};

export const WithError: Story = {
  args: {
    label: 'Accept terms',
    error: 'You must accept the terms',
  },
};

export const SmallSize: Story = {
  args: {
    label: 'Small checkbox',
    size: 'sm',
  },
};

export const LargeSize: Story = {
  args: {
    label: 'Large checkbox',
    size: 'lg',
  },
};

// CheckboxGroup stories
export const GroupVertical: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(['option1']);
    return (
      <CheckboxGroup
        label="Select your interests"
        options={[
          { value: 'option1', label: 'Design' },
          { value: 'option2', label: 'Development' },
          { value: 'option3', label: 'Marketing' },
        ]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const GroupHorizontal: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <CheckboxGroup
        label="Features"
        options={[
          { value: 'f1', label: 'Dark Mode' },
          { value: 'f2', label: 'Notifications' },
          { value: 'f3', label: 'Auto-save' },
        ]}
        value={value}
        onChange={setValue}
        orientation="horizontal"
      />
    );
  },
};

export const GroupWithError: Story = {
  render: () => (
    <CheckboxGroup
      label="Select at least one"
      options={[
        { value: 'opt1', label: 'Option 1' },
        { value: 'opt2', label: 'Option 2' },
      ]}
      error="Please select at least one option"
    />
  ),
};
