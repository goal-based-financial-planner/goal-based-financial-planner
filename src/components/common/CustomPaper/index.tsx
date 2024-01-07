import { ReactNode } from 'react';
import { Container, Paper, Stack } from '@mui/material';

interface CustomPaperProps {
  children: ReactNode;
}
const CustomPaper = ({ children }: CustomPaperProps) => {
  return (
    <Container maxWidth={false} sx={{ height: 1, mt: 3 }}>
      <Stack gap={3} sx={{ minHeight: 1 }} mb={8} flexDirection="column">
        <Paper
          sx={{
            padding: '24px 34px 0px 24px',
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
