import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { HighlightText } from './HighlightText';

describe('HighlightText', () => {
  it('renders text without highlight when query is empty', () => {
    render(<HighlightText text="Hello World" query="" />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('highlights matching text', () => {
    const { container } = render(<HighlightText text="Hello World" query="World" />);
    const highlighted = container.querySelector('.text-main');
    expect(highlighted).toBeInTheDocument();
    expect(highlighted?.textContent).toBe('World');
  });

  it('is case insensitive', () => {
    const { container } = render(<HighlightText text="Hello World" query="hello" />);
    const highlighted = container.querySelector('.text-main');
    expect(highlighted).toBeInTheDocument();
    expect(highlighted?.textContent).toBe('Hello');
  });

  it('highlights Korean text', () => {
    const { container } = render(<HighlightText text="안녕하세요 세계" query="세계" />);
    const highlighted = container.querySelector('.text-main');
    expect(highlighted).toBeInTheDocument();
    expect(highlighted?.textContent).toBe('세계');
  });

  it('renders original text when no match found', () => {
    render(<HighlightText text="Hello World" query="xyz" />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('applies custom highlight class', () => {
    const { container } = render(
      <HighlightText text="Hello World" query="World" highlightClassName="custom-highlight" />,
    );
    const highlighted = container.querySelector('.custom-highlight');
    expect(highlighted).toBeInTheDocument();
  });

  it('handles multiple tokens in query', () => {
    const { container } = render(
      <HighlightText text="Hello Beautiful World" query="Hello World" />,
    );
    const highlighted = container.querySelectorAll('.text-main');
    expect(highlighted).toHaveLength(2);
    expect(highlighted[0].textContent).toBe('Hello');
    expect(highlighted[1].textContent).toBe('World');
  });
});
