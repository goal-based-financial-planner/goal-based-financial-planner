import React from 'react';
import { Box, Card, CardActionArea, CardContent, Stack, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { WizardPath } from '../useOnboardingWizard';

type PathChoiceStepProps = {
  onChoose: (path: Exclude<WizardPath, null>) => void;
};

const options = [
  {
    path: 'new' as const,
    icon: <AddCircleOutlineIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
    title: 'Create a new plan',
    description: 'Start fresh — add your first goal and choose where to save your plan.',
  },
  {
    path: 'open' as const,
    icon: <FolderOpenIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
    title: 'Open existing plan',
    description: 'Load a plan you already created from your computer or Google Drive.',
  },
];

const PathChoiceStep: React.FC<PathChoiceStepProps> = ({ onChoose }) => (
  <Box sx={{ py: 1 }}>
    <Typography variant="h6" fontWeight="bold" gutterBottom>
      How would you like to get started?
    </Typography>
    <Stack spacing={2} sx={{ mt: 2 }}>
      {options.map((opt) => (
        <Card key={opt.path} variant="outlined">
          <CardActionArea onClick={() => onChoose(opt.path)}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5 }}>
              {opt.icon}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {opt.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {opt.description}
                </Typography>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Stack>
  </Box>
);

export default PathChoiceStep;
