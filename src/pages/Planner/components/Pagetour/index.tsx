import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useEffect, useRef } from 'react';

const isMobile = () => window.innerWidth < 600;

const allSteps = [
  {
    element: '.target-box',
    desktopOnly: false,
    content:
      'Your total financial target — the inflation-adjusted sum of all your goals. It updates automatically as you add or edit goals.',
  },
  {
    element: '.add-goals-button',
    desktopOnly: false,
    content:
      'Add a goal here. Give it a name, target amount, and deadline — the app automatically classifies it as short (≤3 yr), medium (3–7 yr), or long term (7+ yr).',
  },
  {
    element: '.financial-goals-box',
    desktopOnly: true,
    content:
      'All your goals at a glance. Each card shows the goal name, target date, inflation-adjusted amount, and how much you have invested so far.',
  },
  {
    element: '.financial-progress-box',
    desktopOnly: false,
    content:
      "Goals grouped by time horizon. Each bar shows the percentage of that term's total target you've already covered with current investments.",
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
