import React, { useEffect, useReducer } from 'react';
import {
  getInitialData,
  persistPlannerData,
  plannerDataReducer,
} from '../../store/plannerDataReducer';
import LandingPage from '../LandingPage';
import Planner from '../Planner';
import { Alert, Button, Link, Snackbar } from '@mui/material';
import {
  isDisclaimerAccepted,
  setDisclaimerAccepted,
} from '../../util/storage';
import DisclaimerDialog from './components/DisclaimerDialog';

const Home: React.FC = () => {
  const [plannerData, dispatch] = useReducer(
    plannerDataReducer,
    getInitialData(),
  );

  const [showDisclaimer, setShowDisclaimer] = React.useState(
    !isDisclaimerAccepted(),
  );

  const [showDisclaimerDialog, setShowDisclaimerDialog] = React.useState(false);

  useEffect(() => {
    persistPlannerData(plannerData);
  }, [plannerData]);

  return (
    <>
      {plannerData.financialGoals?.length > 0 ? (
        <Planner plannerData={plannerData} dispatch={dispatch} />
      ) : (
        <LandingPage dispatch={dispatch} />
      )}

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={showDisclaimer}
        sx={{ width: '100%' }}
      >
        <Alert
          severity="success"
          sx={{
            display: 'flex',

            alignItems: 'center',
          }}
          action={
            <Button
              variant="contained"
              onClick={() => {
                setShowDisclaimer(false);
                setDisclaimerAccepted();
              }}
            >
              Accept
            </Button>
          }
        >
          This tool provides investment suggestions for informational purposes
          only and does not constitute financial advice. Please read our{' '}
          <Link href="#" onClick={() => setShowDisclaimerDialog(true)}>
            disclaimer
          </Link>{' '}
          for details.
        </Alert>
      </Snackbar>
      <DisclaimerDialog
        showDialog={showDisclaimerDialog}
        handleClose={() => setShowDisclaimerDialog(false)}
      ></DisclaimerDialog>
    </>
  );
};

export default Home;
