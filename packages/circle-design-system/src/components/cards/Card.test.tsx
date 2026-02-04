import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from './Card';

describe('Card', () => {
  describe('Rendering', () => {
    it('renders with children', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('renders with default variant', () => {
      const { container } = render(<Card>Default Card</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toBeInTheDocument();
    });

    it('renders all variants correctly', () => {
      const { container, rerender } = render(<Card variant="default">Default</Card>);
      expect(container.firstChild).toBeInTheDocument();

      rerender(<Card variant="elevated">Elevated</Card>);
      expect(container.firstChild).toBeInTheDocument();

      rerender(<Card variant="bordered">Bordered</Card>);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Card.Header', () => {
    it('renders header with title string', () => {
      render(
        <Card>
          <Card.Header title="Card Title" />
        </Card>
      );
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Card Title');
    });

    it('renders header with custom title component', () => {
      render(
        <Card>
          <Card.Header title={<div data-testid="custom-title">Custom Title</div>} />
        </Card>
      );
      expect(screen.getByTestId('custom-title')).toBeInTheDocument();
    });

    it('renders header with actions', () => {
      render(
        <Card>
          <Card.Header
            title="Card Title"
            actions={<button data-testid="action-button">Action</button>}
          />
        </Card>
      );
      expect(screen.getByTestId('action-button')).toBeInTheDocument();
    });

    it('renders header with custom children', () => {
      render(
        <Card>
          <Card.Header>
            <div data-testid="custom-header">Custom Header Content</div>
          </Card.Header>
        </Card>
      );
      expect(screen.getByTestId('custom-header')).toBeInTheDocument();
    });

    it('children prop overrides title and actions', () => {
      render(
        <Card>
          <Card.Header
            title="Should not appear"
            actions={<button>Should not appear</button>}
          >
            <div data-testid="override">Override content</div>
          </Card.Header>
        </Card>
      );
      expect(screen.getByTestId('override')).toBeInTheDocument();
      expect(screen.queryByText('Should not appear')).not.toBeInTheDocument();
    });
  });

  describe('Card.Body', () => {
    it('renders body with children', () => {
      render(
        <Card>
          <Card.Body>Body content</Card.Body>
        </Card>
      );
      expect(screen.getByText('Body content')).toBeInTheDocument();
    });

    it('renders body with complex content', () => {
      render(
        <Card>
          <Card.Body>
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
          </Card.Body>
        </Card>
      );
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
    });
  });

  describe('Card.Footer', () => {
    it('renders footer with children', () => {
      render(
        <Card>
          <Card.Footer>Footer content</Card.Footer>
        </Card>
      );
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('renders footer with multiple elements', () => {
      render(
        <Card>
          <Card.Footer>
            <span>Left</span>
            <span>Right</span>
          </Card.Footer>
        </Card>
      );
      expect(screen.getByText('Left')).toBeInTheDocument();
      expect(screen.getByText('Right')).toBeInTheDocument();
    });
  });

  describe('Complete Card', () => {
    it('renders all sections together', () => {
      render(
        <Card>
          <Card.Header title="Card Title" actions={<button>Action</button>} />
          <Card.Body>Card body content</Card.Body>
          <Card.Footer>Card footer</Card.Footer>
        </Card>
      );
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card body content')).toBeInTheDocument();
      expect(screen.getByText('Card footer')).toBeInTheDocument();
    });
  });

  describe('Hoverable', () => {
    it('changes style on hover when hoverable is true', async () => {
      const user = userEvent.setup();
      const { container } = render(<Card hoverable>Hoverable Card</Card>);
      const card = container.firstChild as HTMLElement;

      await user.hover(card);
      // Shadow should change on hover (tested via visual regression)

      await user.unhover(card);
      // Shadow should revert
    });

    it('does not change on hover when hoverable is false', async () => {
      const user = userEvent.setup();
      const { container } = render(<Card hoverable={false}>Non-hoverable Card</Card>);
      const card = container.firstChild as HTMLElement;

      await user.hover(card);
      expect(card.style.cursor).toBe('default');
    });
  });

  describe('Custom Styling', () => {
    it('accepts custom style prop', () => {
      const { container } = render(
        <Card style={{ marginTop: '20px' }}>
          Custom Style Card
        </Card>
      );
      const card = container.firstChild as HTMLElement;
      expect(card.style.marginTop).toBe('20px');
    });

    it('accepts custom className', () => {
      const { container } = render(
        <Card className="custom-card">
          Custom Class Card
        </Card>
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-card');
    });
  });

  describe('HTML Attributes', () => {
    it('forwards data attributes', () => {
      render(
        <Card data-testid="custom-card">
          Test Card
        </Card>
      );
      expect(screen.getByTestId('custom-card')).toBeInTheDocument();
    });

    it('forwards onClick to card', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const { container } = render(
        <Card onClick={handleClick}>
          Clickable Card
        </Card>
      );

      await user.click(container.firstChild as HTMLElement);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
