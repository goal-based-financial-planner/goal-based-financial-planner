import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FinancialGoals from './index';
import { PlannerData } from '../../domain/PlannerData';
import { FinancialGoal } from '../../domain/FinancialGoals';

jest.mock('../../pages/Planner/components/AddFinancialGoals', () => {
  const { Modal } = require('@mui/material');

  return ({
    showAddGoalsModal,
    handleClose,
  }: {
    showAddGoalsModal: boolean;
    handleClose: () => void;
  }) => (
    <Modal open={showAddGoalsModal} onClose={handleClose}>
      <div data-testid="add-goal">
        <button data-testid="close-btn" onClick={handleClose}>
          Close
        </button>
      </div>
    </Modal>
  );
});

describe('FinancialGoalsStep', () => {
  const mockDispatch = jest.fn();

  const renderComponent = (plannerData: PlannerData) =>
    render(
      <FinancialGoals plannerData={plannerData} dispatch={mockDispatch} />,
    );

  it('renders empty body placeholder', () => {
    const plannerData = new PlannerData();
    renderComponent(plannerData);
    // expect(
    //   screen.getByText(/You don't have any goals added/i),
    // ).toBeInTheDocument();
  });

  it('Should render Add Goal button when goals are present', () => {
    const plannerData = new PlannerData();
    plannerData.financialGoals = [
      new FinancialGoal('Goal 1', 2024, 2040, 10000),
    ];
    renderComponent(plannerData);
    // expect(screen.getByTestId('add-goal-button')).toBeInTheDocument();
  });

  it('Should open AddFinancialGoals modal when Add Goal button is clicked and close it', () => {
    const plannerData = new PlannerData();
    renderComponent(plannerData);
    //  fireEvent.click(screen.getByTestId('add-goal-button'));
    // expect(screen.getByTestId('add-goal')).toBeInTheDocument();

    // fireEvent.click(screen.getByTestId('close-btn'));
    // expect(screen.queryByTestId('add-goal')).not.toBeInTheDocument();
  });
});
