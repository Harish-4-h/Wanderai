// BudgetSelector.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BudgetSelector from './BudgetSelector';
import '@testing-library/jest-dom';

describe('BudgetSelector Component', () => {
  test('renders all budget options', () => {
    render(<BudgetSelector />);
    expect(screen.getByText(/Budget-Friendly/i)).toBeInTheDocument();
    expect(screen.getByText(/Mid-Range/i)).toBeInTheDocument();
    expect(screen.getByText(/Luxury/i)).toBeInTheDocument();
  });

  test('selecting an option highlights it', () => {
    render(<BudgetSelector />);
    const midOption = screen.getByText(/Mid-Range/i);
    fireEvent.click(midOption);
    expect(midOption.closest('.option-card')).toHaveClass('option-card-selected');
  });
});
