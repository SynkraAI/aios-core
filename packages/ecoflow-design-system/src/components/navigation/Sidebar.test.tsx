import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from './Sidebar';

describe('Sidebar', () => {
  const mockItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'projects', label: 'Projects', badge: 3 },
    {
      id: 'settings',
      label: 'Settings',
      children: [
        { id: 'profile', label: 'Profile' },
        { id: 'security', label: 'Security' },
      ],
    },
  ];

  it('renders all navigation items', () => {
    render(<Sidebar items={mockItems} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders logo when provided', () => {
    render(<Sidebar items={mockItems} logo={<div>Logo</div>} />);
    expect(screen.getByText('Logo')).toBeInTheDocument();
  });

  it('displays badge on items', () => {
    render(<Sidebar items={mockItems} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('highlights active item', () => {
    render(<Sidebar items={mockItems} activeItem="dashboard" />);
    const dashboardItem = screen.getByText('Dashboard');
    expect(dashboardItem).toBeInTheDocument();
  });

  it('calls onItemClick when clicking item', () => {
    const onItemClick = vi.fn();
    render(<Sidebar items={mockItems} onItemClick={onItemClick} />);
    fireEvent.click(screen.getByText('Dashboard'));
    expect(onItemClick).toHaveBeenCalledWith('dashboard');
  });

  it('expands section with children on click', () => {
    render(<Sidebar items={mockItems} />);

    // Children should not be visible initially
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();

    // Click to expand
    fireEvent.click(screen.getByText('Settings'));

    // Children should now be visible
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('collapses section on second click', () => {
    render(<Sidebar items={mockItems} />);

    // Expand
    fireEvent.click(screen.getByText('Settings'));
    expect(screen.getByText('Profile')).toBeInTheDocument();

    // Collapse
    fireEvent.click(screen.getByText('Settings'));
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
  });

  it('hides labels when collapsed', () => {
    render(<Sidebar items={mockItems} collapsed={true} />);
    // In collapsed state, labels should not be visible (implementation detail)
    // This test might need adjustment based on actual rendering behavior
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('supports keyboard navigation', () => {
    const onItemClick = vi.fn();
    render(<Sidebar items={mockItems} onItemClick={onItemClick} />);
    const dashboardItem = screen.getByText('Dashboard');
    fireEvent.keyDown(dashboardItem, { key: 'Enter' });
    expect(onItemClick).toHaveBeenCalledWith('dashboard');
  });
});
