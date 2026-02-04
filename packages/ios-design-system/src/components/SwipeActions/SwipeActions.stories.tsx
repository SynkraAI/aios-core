import type { Meta, StoryObj } from '@storybook/react'
import { SwipeActions, SwipeAction } from './SwipeActions'
import { List } from '../List/List'
import { ListItem } from '../ListItem/ListItem'

const meta = {
  title: 'Components/SwipeActions',
  component: SwipeActions,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SwipeActions>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Basic swipe actions (delete on right swipe)
 */
export const Default: Story = {
  args: {
    children: <ListItem label="Message" detail="Swipe left to delete" />,
    trailingActions: [
      { id: 'delete', label: 'Delete', backgroundColor: '#FF3B30', onPress: () => console.log('Delete') },
    ],
  },
  render: (args) => (
    <div style={{ background: '#F2F2F7', minHeight: '100vh', paddingTop: '20px' }}>
      <List>
        <SwipeActions {...args} />
      </List>
      <p style={{ padding: '20px', fontSize: '13px', color: '#8E8E93' }}>
        👆 Swipe left on the item to reveal actions
      </p>
    </div>
  ),
}

/**
 * Multiple trailing actions
 */
export const MultipleActions: Story = {
  args: {
    children: null,
    trailingActions: [],
  },
  render: () => {
    const trailingActions: SwipeAction[] = [
      { id: 'flag', label: 'Flag', backgroundColor: '#FF9500', onPress: () => console.log('Flag') },
      { id: 'delete', label: 'Delete', backgroundColor: '#FF3B30', onPress: () => console.log('Delete') },
    ]

    return (
      <div style={{ background: '#F2F2F7', minHeight: '100vh', paddingTop: '20px' }}>
        <List>
          <SwipeActions trailingActions={trailingActions}>
            <ListItem label="Email" detail="Swipe left for actions" />
          </SwipeActions>
        </List>
      </div>
    )
  },
}

/**
 * Leading actions (left swipe)
 */
export const LeadingActions: Story = {
  args: {
    children: null,
    leadingActions: [],
  },
  render: () => {
    const leadingActions: SwipeAction[] = [
      { id: 'read', label: 'Read', icon: '✓', backgroundColor: '#007AFF', onPress: () => console.log('Read') },
    ]

    return (
      <div style={{ background: '#F2F2F7', minHeight: '100vh', paddingTop: '20px' }}>
        <List>
          <SwipeActions leadingActions={leadingActions}>
            <ListItem label="Unread Message" badge={1} />
          </SwipeActions>
        </List>
        <p style={{ padding: '20px', fontSize: '13px', color: '#8E8E93' }}>
          👆 Swipe right to mark as read
        </p>
      </div>
    )
  },
}

/**
 * Both leading and trailing actions
 */
export const BothSides: Story = {
  args: {
    children: null,
  },
  render: () => {
    const leadingActions: SwipeAction[] = [
      { id: 'archive', label: 'Archive', icon: '📦', backgroundColor: '#34C759', onPress: () => console.log('Archive') },
    ]

    const trailingActions: SwipeAction[] = [
      { id: 'delete', label: 'Delete', icon: '🗑️', backgroundColor: '#FF3B30', onPress: () => console.log('Delete') },
    ]

    return (
      <div style={{ background: '#F2F2F7', minHeight: '100vh', paddingTop: '20px' }}>
        <List>
          <SwipeActions leadingActions={leadingActions} trailingActions={trailingActions}>
            <ListItem label="Important Email" icon="📧" iconBackground="#007AFF" />
          </SwipeActions>
        </List>
        <p style={{ padding: '20px', fontSize: '13px', color: '#8E8E93' }}>
          👆 Swipe right to archive, left to delete
        </p>
      </div>
    )
  },
}

/**
 * Mail app example
 */
export const MailApp: Story = {
  args: { children: null },
  render: () => {
    const emailActions: SwipeAction[] = [
      { id: 'flag', label: 'Flag', backgroundColor: '#FF9500', onPress: () => {} },
      { id: 'delete', label: 'Delete', backgroundColor: '#FF3B30', onPress: () => {} },
    ]

    return (
      <div style={{ background: '#F2F2F7', minHeight: '100vh', paddingTop: '20px' }}>
        <List>
          <SwipeActions trailingActions={emailActions}>
            <ListItem
              label="John Doe"
              detail="Meeting tomorrow at 10am"
              icon="👤"
              iconBackground="#007AFF"
            />
          </SwipeActions>
          <SwipeActions trailingActions={emailActions}>
            <ListItem
              label="Jane Smith"
              detail="Project update"
              icon="👤"
              iconBackground="#34C759"
            />
          </SwipeActions>
          <SwipeActions trailingActions={emailActions}>
            <ListItem
              label="Team"
              detail="Weekly sync notes"
              badge={3}
              icon="👥"
              iconBackground="#5856D6"
            />
          </SwipeActions>
        </List>
      </div>
    )
  },
}
