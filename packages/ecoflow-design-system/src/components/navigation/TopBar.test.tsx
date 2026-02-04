import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopBar } from './TopBar';

describe('TopBar', () => {
  it('renders with default props', () => {
    render(<TopBar />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('renders custom search placeholder', () => {
    render(<TopBar searchPlaceholder="Search projects..." />);
    expect(screen.getByPlaceholderText('Search projects...')).toBeInTheDocument();
  });

  it('calls onSearch when typing in search input', () => {
    const onSearch = vi.fn();
    render(<TopBar onSearch={onSearch} />);
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    expect(onSearch).toHaveBeenCalledWith('test query');
  });

  it('renders notification button with badge', () => {
    render(<TopBar notifications={5} onNotificationsClick={vi.fn()} />);
    expect(screen.getByLabelText('Notifications (5)')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('calls onNotificationsClick when clicking notifications', () => {
    const onNotificationsClick = vi.fn();
    render(<TopBar notifications={3} onNotificationsClick={onNotificationsClick} />);
    fireEvent.click(screen.getByLabelText('Notifications (3)'));
    expect(onNotificationsClick).toHaveBeenCalled();
  });

  it('renders user information', () => {
    const user = { name: 'John Doe', role: 'Admin' };
    render(<TopBar user={user} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('displays user initials when no avatar', () => {
    const user = { name: 'John Doe' };
    render(<TopBar user={user} />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('calls onUserClick when clicking user button', () => {
    const onUserClick = vi.fn();
    const user = { name: 'John Doe' };
    render(<TopBar user={user} onUserClick={onUserClick} />);
    fireEvent.click(screen.getByLabelText('User menu'));
    expect(onUserClick).toHaveBeenCalled();
  });

  it('renders left and right content', () => {
    render(
      <TopBar leftContent={<div>Left Content</div>} rightContent={<div>Right Content</div>} />
    );
    expect(screen.getByText('Left Content')).toBeInTheDocument();
    expect(screen.getByText('Right Content')).toBeInTheDocument();
  });
});
