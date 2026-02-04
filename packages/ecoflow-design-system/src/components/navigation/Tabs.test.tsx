import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs } from './Tabs';

describe('Tabs', () => {
  const mockTabs = [
    { id: 'tab1', label: 'Tab 1' },
    { id: 'tab2', label: 'Tab 2' },
    { id: 'tab3', label: 'Tab 3' },
  ];

  it('renders all tabs', () => {
    render(<Tabs tabs={mockTabs} activeTab="tab1" onChange={vi.fn()} />);
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();
  });

  it('marks active tab correctly', () => {
    render(<Tabs tabs={mockTabs} activeTab="tab2" onChange={vi.fn()} />);
    const activeTab = screen.getByRole('tab', { name: 'Tab 2' });
    expect(activeTab).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onChange when clicking inactive tab', () => {
    const onChange = vi.fn();
    render(<Tabs tabs={mockTabs} activeTab="tab1" onChange={onChange} />);
    fireEvent.click(screen.getByText('Tab 2'));
    expect(onChange).toHaveBeenCalledWith('tab2');
  });

  it('does not call onChange when clicking active tab', () => {
    const onChange = vi.fn();
    render(<Tabs tabs={mockTabs} activeTab="tab1" onChange={onChange} />);
    fireEvent.click(screen.getByText('Tab 1'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disables tabs correctly', () => {
    const tabsWithDisabled = [
      ...mockTabs,
      { id: 'tab4', label: 'Disabled Tab', disabled: true },
    ];
    render(<Tabs tabs={tabsWithDisabled} activeTab="tab1" onChange={vi.fn()} />);
    const disabledTab = screen.getByRole('tab', { name: 'Disabled Tab' });
    expect(disabledTab).toHaveAttribute('aria-disabled', 'true');
  });

  it('does not call onChange for disabled tabs', () => {
    const onChange = vi.fn();
    const tabsWithDisabled = [{ id: 'tab1', label: 'Tab 1', disabled: true }];
    render(<Tabs tabs={tabsWithDisabled} activeTab="tab2" onChange={onChange} />);
    fireEvent.click(screen.getByText('Tab 1'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('supports keyboard navigation with Enter key', () => {
    const onChange = vi.fn();
    render(<Tabs tabs={mockTabs} activeTab="tab1" onChange={onChange} />);
    const tab2 = screen.getByText('Tab 2');
    fireEvent.keyDown(tab2, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('tab2');
  });

  it('supports keyboard navigation with Space key', () => {
    const onChange = vi.fn();
    render(<Tabs tabs={mockTabs} activeTab="tab1" onChange={onChange} />);
    const tab2 = screen.getByText('Tab 2');
    fireEvent.keyDown(tab2, { key: ' ' });
    expect(onChange).toHaveBeenCalledWith('tab2');
  });
});
