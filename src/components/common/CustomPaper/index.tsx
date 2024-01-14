import { ReactNode } from 'react';
import { Container, Paper, Stack } from '@mui/material';

interface CustomPaperProps {
  children: ReactNode;
}
const CustomPaper = ({ children }: CustomPaperProps) => {
  return (
    <Container maxWidth={false} sx={{ height: 1 }}>
      <Stack gap={3} sx={{ minHeight: 1 }} mb={1} flexDirection="column">
        <Paper
          sx={{
            padding: '24px',
            flex: 1,
          }}
          elevation={1}
        >
          {children}
        </Paper>
      </Stack>
    </Container>
  );
};

export default CustomPaper;
