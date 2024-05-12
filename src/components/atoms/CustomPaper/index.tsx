import { ReactNode, forwardRef, ForwardedRef } from "react";
import { Container, Paper, Stack, SxProps } from "@mui/material";

interface CustomPaperProps {
  children: ReactNode;
  sx?: SxProps;
  className?: string;
}

const CustomPaper = forwardRef<HTMLDivElement, CustomPaperProps>(
  ({ children, sx, className }, ref: ForwardedRef<HTMLDivElement>) => {
    return (
      <Container
        maxWidth={false}
        sx={{ ...sx }}
        ref={ref}
        className={className}
      >
        <Stack gap={3} sx={{ minHeight: 1 }} mb={1} flexDirection="column">
          <Paper
            sx={{
              padding: "24px",
              flex: 1,
            }}
            elevation={1}
          >
            {children}
          </Paper>
        </Stack>
      </Container>
    );
  },
);

export default CustomPaper;
