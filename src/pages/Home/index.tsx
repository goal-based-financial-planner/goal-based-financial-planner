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

const Home: React.FC = () => {
  const [plannerData, dispatch] = useReducer(
    plannerDataReducer,
    getInitialData(),
  );

  const [showDisclaimer, setShowDisclaimer] = React.useState(
    !isDisclaimerAccepted(),
  );

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
      >
        <Alert
          severity="success"
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
          <Link href="#">disclaimer</Link> for details.
        </Alert>
      </Snackbar>
    </>
  );
};

export default Home;
