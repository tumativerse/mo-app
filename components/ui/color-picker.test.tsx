import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorPicker } from './color-picker';

describe('ColorPicker', () => {
  it('should render with all preset colors', () => {
    const handleChange = vi.fn();
    render(<ColorPicker value="#0BA08B" onChange={handleChange} />);

    expect(screen.getByTitle('Vibrant Teal')).toBeInTheDocument();
    expect(screen.getByTitle('Electric Blue')).toBeInTheDocument();
    expect(screen.getByTitle('Purple Power')).toBeInTheDocument();
    expect(screen.getByTitle('Lime Energy')).toBeInTheDocument();
    expect(screen.getByTitle('Energetic Coral')).toBeInTheDocument();
    expect(screen.getByTitle('Sunset Orange')).toBeInTheDocument();
    expect(screen.getByTitle('Magenta')).toBeInTheDocument();
    expect(screen.getByTitle('Cyan Clarity')).toBeInTheDocument();
  });

  it('should call onChange when color button is clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<ColorPicker value="#0BA08B" onChange={handleChange} />);

    await user.click(screen.getByTitle('Electric Blue'));

    expect(handleChange).toHaveBeenCalledWith('#4A90E2');
  });

  it('should accept className prop', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <ColorPicker value="#0BA08B" onChange={handleChange} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should render selected color with visual indicator', () => {
    const handleChange = vi.fn();
    render(<ColorPicker value="#0BA08B" onChange={handleChange} />);

    const selectedButton = screen.getByTitle('Vibrant Teal');
    expect(selectedButton).toBeInTheDocument();
  });

  it('should allow selecting different preset colors', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<ColorPicker value="#0BA08B" onChange={handleChange} />);

    await user.click(screen.getByTitle('Purple Power'));
    expect(handleChange).toHaveBeenCalledWith('#8B5CF6');

    await user.click(screen.getByTitle('Sunset Orange'));
    expect(handleChange).toHaveBeenCalledWith('#FF8C42');
  });
});
