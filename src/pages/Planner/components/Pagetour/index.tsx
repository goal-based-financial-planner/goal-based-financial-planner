import { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS } from 'react-joyride';
import {
  setTourTaken,
  isTourTaken as isTourAlreadyTaken,
} from '../../../../util/storage';

const steps = [
  {
    target: '.target-box',
    disableBeacon: true,
    content:
      'This is your total financial target. The amount is automatically adjusted for inflation to ensure accuracy.',
  },
  {
    target: '.add-goals-button',
    disableBeacon: true,

    content:
      'Click here to add new financial goals to your target and start planning.',
  },
  {
    target: '.financial-goals-box',
    disableBeacon: true,
    content:
      'Here, you can see all the financial goals you’ve already added, along with their progress.',
  },
  {
    target: '.financial-progress-box',
    disableBeacon: true,

    content:
      'This section provides a detailed breakdown of your financial goals by term.',
  },
  {
    target: '.investment-plan-box',
    disableBeacon: true,

    content:
      'These are tailored investment suggestions to help you achieve your financial goals efficiently.',
  },
  {
    target: '.customize-button',
    disableBeacon: true,
    content:
      'Click this button to personalize the investment suggestions according to your preferences.',
  },
  {
    target: '.calendar-button',
    disableBeacon: true,
    content:
      'This calendar is set to the current month by default. You can change the date to view your progress at any point in time.',
  },
];

const PageTour = () => {
  const [isTourTaken, setIsTourTaken] = useState(isTourAlreadyTaken());
  const [runTour, setRunTour] = useState<boolean>(!isTourTaken);

  useEffect(() => {
    if (!isTourTaken) {
      setRunTour(true);
    }
  }, [isTourTaken]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setTourTaken();
      setIsTourTaken(true);
      setRunTour(false);
    }
  };
  return (
    <Joyride
      steps={steps}
      callback={handleJoyrideCallback}
      run={runTour}
      continuous
      showSkipButton
      showProgress
      styles={{
        options: {
          arrowColor: '#f5f5f5',
          backgroundColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          primaryColor: '#4CAF50',
          textColor: '#333',
          zIndex: 1000,
        },
        buttonClose: {
          color: '#ff1744',
        },
        buttonBack: {
          color: '#9E9E9E',
        },
        buttonNext: {
          backgroundColor: '#1976D2',
          color: '#ffffff',
        },
        buttonSkip: {
          color: '#F44336',
        },
      }}
    />
  );
};

export default PageTour;
