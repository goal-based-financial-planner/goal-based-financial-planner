import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useEffect, useRef } from 'react';

const allocationSteps = [
  {
    element: '.allocation-modal-header',
    content:
      'Configure how your investment budget is split for this term. Short, medium, and long-term goals each get their own allocation profile.',
  },
  {
    element: '.allocation-table-section',
    content:
      'Each row is an investment instrument. Set its expected annual return and the percentage of your monthly contribution that flows into it.',
  },
  {
    element: '.allocation-add-btn',
    content:
      'Add more instruments here — FDs, debt funds, equity ETFs, or anything else. Mix and match to match your risk appetite.',
  },
  {
    element: '.allocation-submit-btn',
    content:
      'Once all percentages add up to 100%, submit to apply. Your monthly investment plan recalculates instantly.',
  },
];

type AllocationTourProps = {
  run: boolean;
  onDone?: () => void;
};

const AllocationTour = ({ run, onDone }: AllocationTourProps) => {
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!run) return;

    let destroyed = false;

    const dObj = driver({
      showProgress: true,
      steps: allocationSteps.map((s) => ({
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
    }, 400);

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

export default AllocationTour;
