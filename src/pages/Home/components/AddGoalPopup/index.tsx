import { Dialog } from '@mui/material';
import FinancialGoalForm from '../FinancialGoalForm';
import { Dispatch } from 'react';
import { PlannerDataAction } from '../../../../store/plannerDataReducer';

type AddGoalPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  dispatch: Dispatch<PlannerDataAction>;
  title?: string;
};

const AddGoalPopup = ({ isOpen, onClose, dispatch, title }: AddGoalPopupProps) => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <FinancialGoalForm close={onClose} dispatch={dispatch} title={title} />
    </Dialog>
  );
};

export default AddGoalPopup;
