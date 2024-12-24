import React, { useState } from 'react';
import './App.css';
import { ThemeProvider } from '@emotion/react';
import { theme } from './theme';
import Planner from './pages/Planner';
import Joyride from 'react-joyride';

const App = () => {
  const [steps] = useState([
    {
      target: '.navbar-home',
      content: 'This is the home link in the navbar.',
    },
    {
      target: '.home-hero',
      content: 'Welcome to the home page!',
    },
    {
      target: '.dashboard-widget',
      content: 'Check out this dashboard widget.',
    },
  ]);

  return (
    <ThemeProvider theme={theme}>
      {/* <Joyride
        steps={steps}
        run={true}
        continuous
        showSkipButton
        showProgress
        styles={{
          options: {
            arrowColor: '#f5f5f5', // Arrow color
            backgroundColor: '#ffffff', // Background of tooltip
            overlayColor: 'rgba(0, 0, 0, 0.5)', // Background overlay
            primaryColor: '#4CAF50', // Main button color
            textColor: '#333', // Tooltip text color
            zIndex: 1000,
          },
          buttonClose: {
            color: '#ff1744', // Color of the close button
          },
          buttonBack: {
            color: '#9E9E9E', // Color of the 'Back' button
          },
          buttonNext: {
            backgroundColor: '#1976D2', // Background color of the 'Next' button
            color: '#ffffff', // Text color of the 'Next' button
          },
          buttonSkip: {
            color: '#F44336', // Color of the 'Skip' button
          },
        }}
      /> */}
      <Planner />
    </ThemeProvider>
  );
};

export default App;
