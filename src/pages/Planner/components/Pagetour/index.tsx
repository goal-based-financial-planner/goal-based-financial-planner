import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useEffect, useRef } from 'react';

const isMobile = () => window.innerWidth < 600;

const allSteps = [
  {
    element: '.stat-total-target',
    desktopOnly: false,
    content:
      'Your total financial target — the inflation-adjusted sum of all your goals. The monthly required and investing tiles show how your SIPs compare to the plan.',
  },
  {
    element: '.goals-drawer-button',
    desktopOnly: false,
    content:
      'Open your goals here. Each card shows the goal name, target date, inflation-adjusted amount, and monthly SIP breakdown. Add new goals from inside this panel.',
  },
  {
    element: '.investment-plan-box',
    desktopOnly: false,
    content:
      'Monthly investment suggestions by instrument (FD, debt funds, equity, etc.). These numbers tell you exactly how much to invest each month to hit every goal on time.',
  },
  {
    element: '.customize-button',
    desktopOnly: false,
    content:
      'Adjust the asset allocation to match your risk appetite. Change the percentage split between equity, debt, and other instruments — suggestions recalculate instantly.',
  },
  {
    element: '.calendar-button',
    desktopOnly: false,
    content:
      'Move the date forward to preview your portfolio at any future point, or backward to review past progress. Great for stress-testing your plan.',
  },
];

type PageTourProps = {
  run: boolean;
  onDone?: () => void;
};

const PageTour = ({ run, onDone }: PageTourProps) => {
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!run) return;

    let destroyed = false;
    const steps = allSteps.filter((s) => !s.desktopOnly || !isMobile());

    const dObj = driver({
      showProgress: true,
      steps: steps.map((s) => ({
        element: s.element,
        popover: { description: s.content },
      })),
      onDestroyStarted: () => {
        if (!destroyed) {
          destroyed = true;
          dObj.destroy();
          onDoneRef.current?.();
        }
      },
    });

    const id = setTimeout(() => {
      if (!destroyed) dObj.drive();
    }, 300);

    return () => {
      clearTimeout(id);
      if (!destroyed) {
        destroyed = true;
        dObj.destroy();
      }
    };
  }, [run]);

  return null;
};

export default PageTour;
