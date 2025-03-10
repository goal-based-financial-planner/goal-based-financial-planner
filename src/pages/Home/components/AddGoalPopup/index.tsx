import { Dialog } from '@mui/material';
import FinancialGoalForm from '../FinancialGoalForm';
import { Dispatch } from 'react';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';

type AddGoalPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  dispatch: Dispatch<PlannerDataAction>;
};

const AddGoalPopup = ({ isOpen, onClose, dispatch }: AddGoalPopupProps) => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <FinancialGoalForm close={onClose} dispatch={dispatch} />
    </Dialog>
  );
};

export default AddGoalPopup;
