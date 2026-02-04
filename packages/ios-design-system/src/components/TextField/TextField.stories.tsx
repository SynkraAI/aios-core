import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { TextField } from './TextField'

const meta = {
  title: 'Components/TextField',
  component: TextField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TextField>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Default text field with label
 */
export const Default: Story = {
  args: { value: '', onChange: () => {}, placeholder: 'Placeholder' },
  render: () => {
    const [value, setValue] = useState('')
    return (
      <div style={{ width: '300px' }}>
        <TextField
          label="Email"
          placeholder="Enter your email"
          value={value}
          onChange={setValue}
          type="email"
        />
      </div>
    )
  },
}

/**
 * Text field with floating label animation
 */
export const FloatingLabel: Story = {
  args: { value: "", onChange: () => {}, placeholder: "Placeholder" },
  render: () => {
    const [value, setValue] = useState('')
    return (
      <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <TextField
          label="Name"
          placeholder="Your full name"
          value={value}
          onChange={setValue}
        />
        <p style={{ fontSize: '13px', color: '#666' }}>
          Label floats up when focused or has value
        </p>
      </div>
    )
  },
}

/**
 * Text field with leading icon (search)
 */
export const WithLeadingIcon: Story = {
  args: { value: "", onChange: () => {}, placeholder: "Placeholder" },
  render: () => {
    const [value, setValue] = useState('')
    return (
      <div style={{ width: '300px' }}>
        <TextField
          placeholder="Search"
          value={value}
          onChange={setValue}
          type="search"
          leadingIcon={<span>🔍</span>}
        />
      </div>
    )
  },
}

/**
 * Text field with clear button
 */
export const WithClearButton: Story = {
  args: { value: "", onChange: () => {}, placeholder: "Placeholder" },
  render: () => {
    const [value, setValue] = useState('Some text here')
    return (
      <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <TextField
          label="Message"
          placeholder="Type something"
          value={value}
          onChange={setValue}
          clearButton
        />
        <p style={{ fontSize: '13px', color: '#666' }}>
          Clear button (⊗) appears when text is entered
        </p>
      </div>
    )
  },
}

/**
 * Text field with error state
 */
export const WithError: Story = {
  args: { value: "", onChange: () => {}, placeholder: "Placeholder" },
  render: () => {
    const [value, setValue] = useState('invalid@')
    return (
      <div style={{ width: '300px' }}>
        <TextField
          label="Email"
          placeholder="Enter your email"
          value={value}
          onChange={setValue}
          type="email"
          error="Please enter a valid email address"
        />
      </div>
    )
  },
}

/**
 * Disabled text field
 */
export const Disabled: Story = {
  args: { value: "", onChange: () => {}, placeholder: "Placeholder" },
  render: () => {
    const [value, setValue] = useState('Cannot edit')
    return (
      <div style={{ width: '300px' }}>
        <TextField
          label="Username"
          placeholder="Username"
          value={value}
          onChange={setValue}
          disabled
        />
      </div>
    )
  },
}

/**
 * All input types
 */
export const InputTypes: Story = {
  args: { value: "", onChange: () => {}, placeholder: "Placeholder" },
  render: () => {
    const [text, setText] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [tel, setTel] = useState('')
    const [number, setNumber] = useState('')

    return (
      <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <TextField
          label="Text"
          placeholder="Text input"
          value={text}
          onChange={setText}
          type="text"
        />
        <TextField
          label="Email"
          placeholder="email@example.com"
          value={email}
          onChange={setEmail}
          type="email"
        />
        <TextField
          label="Password"
          placeholder="Password"
          value={password}
          onChange={setPassword}
          type="password"
        />
        <TextField
          label="Phone"
          placeholder="(123) 456-7890"
          value={tel}
          onChange={setTel}
          type="tel"
        />
        <TextField
          label="Number"
          placeholder="123"
          value={number}
          onChange={setNumber}
          type="number"
        />
      </div>
    )
  },
}

/**
 * iOS Login Form
 */
export const LoginForm: Story = {
  args: { value: "", onChange: () => {}, placeholder: "Placeholder" },
  render: () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    return (
      <div
        style={{
          width: '300px',
          padding: '20px',
          backgroundColor: '#F2F2F7',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 400 }}>Sign In</h3>
        <TextField
          label="Email"
          placeholder="email@example.com"
          value={email}
          onChange={setEmail}
          type="email"
          autoFocus
        />
        <TextField
          label="Password"
          placeholder="Password"
          value={password}
          onChange={setPassword}
          type="password"
        />
      </div>
    )
  },
}
