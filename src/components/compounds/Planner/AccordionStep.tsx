import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import { theme } from '../../../theme';

interface AccordionStepProps {
  isExpanded: boolean;
  isVisible: boolean;
  title: string;
  onAccordionClick: (
    event: React.MouseEvent<HTMLSpanElement, MouseEvent>,
  ) => void;
  onDialogOpen: () => void;
  isIconDisabled: boolean;
  children: React.ReactNode;
}

const AccordionStep: React.FC<AccordionStepProps> = ({
  isExpanded,
  isVisible,
  title,
  onAccordionClick,
  onDialogOpen,
  isIconDisabled,
  children,
}) => {
  return (
    <Accordion
      expanded={isExpanded}
      disabled={!isVisible}
      sx={{ marginBottom: 3 }}
    >
      <AccordionSummary
        expandIcon={
          <span className="material-symbols-rounded" onClick={onAccordionClick}>
            keyboard_arrow_down
          </span>
        }
      >
        <Stack flexDirection="row" justifyContent="space-between" width="100%">
          <Typography variant="h6" flexGrow={7}>
            {title}
          </Typography>
          <Button
            sx={{
              flex: '0.2',
              color: theme.palette.text.secondary,
              lineHeight: '28px',
              fontSize: 2,
            }}
            onClick={onDialogOpen}
            disabled={isIconDisabled}
          >
            <span className="material-symbols-rounded">school</span>
          </Button>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ overflowX: 'scroll', scrollBehavior: 'auto' }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
};

export default AccordionStep;
