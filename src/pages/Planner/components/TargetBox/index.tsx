import { Typography, Button } from '@mui/material';
import LiveCounter from '../../../../components/LiveNumberCounter';
import FinancialGoalForm from '../../../Home/components/FinancialGoalForm';
import { useState } from 'react';
import { StyledBox } from '../../../../components/StyledBox';

type TargetBoxProps = {
  targetAmount: number;
  dispatch: any;
};

const TargetBox = ({ targetAmount, dispatch }: TargetBoxProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const handleAdd = () => {
    setIsFormOpen(true);
  };

  return (
    <>
      <StyledBox
        sx={{
          display: 'flex',
          flexDirection: 'column',
          ml: 2,
          my: 2,
        }}
        height={'250px'}
        className="target-box"
      >
        <Typography variant="h6" fontWeight="bold">
          Your Target
        </Typography>
        <LiveCounter value={targetAmount} duration={500} />
        <Button
          className="add-goals-button"
          variant="outlined"
          sx={{
            width: '120px',
            mt: 4,
            color: 'green',
            border: '1px solid green',
          }}
          onClick={handleAdd}
        >
          Add Goals
        </Button>
      </StyledBox>
      {isFormOpen ? (
        <FinancialGoalForm
          dispatch={dispatch}
          close={() => setIsFormOpen(false)}
        />
      ) : null}
    </>
  );
};

export default TargetBox;
