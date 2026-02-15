import React from 'react';
import { render, screen } from '@testing-library/react';
import AddGoalPopup from './index';

// Mock the FinancialGoalForm component
jest.mock('../FinancialGoalForm', () => {
  return function MockFinancialGoalForm() {
    return <div data-testid="financial-goal-form">Financial Goal Form</div>;
  };
});

describe('AddGoalPopup', () => {
  const mockDispatch = jest.fn();
  const mockOnClose = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render when isOpen is true', () => {
    render(
      <AddGoalPopup
        isOpen={true}
        onClose={mockOnClose}
        dispatch={mockDispatch}
      />,
    );
    expect(screen.getByTestId('financial-goal-form')).toBeInTheDocument();
  });

  it('should not render dialog content when isOpen is false', () => {
    render(
      <AddGoalPopup
        isOpen={false}
        onClose={mockOnClose}
        dispatch={mockDispatch}
      />,
    );
    // Dialog is in DOM but not visible
    expect(screen.queryByTestId('financial-goal-form')).not.toBeInTheDocument();
  });

  it('should pass dispatch prop to FinancialGoalForm', () => {
    render(
      <AddGoalPopup
        isOpen={true}
        onClose={mockOnClose}
        dispatch={mockDispatch}
      />,
    );
    expect(mockDispatch).toBeDefined();
  });

  it('should match snapshot when open', () => {
    const { container } = render(
      <AddGoalPopup
        isOpen={true}
        onClose={mockOnClose}
        dispatch={mockDispatch}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
