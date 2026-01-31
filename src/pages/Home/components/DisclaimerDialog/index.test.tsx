import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DisclaimerDialog from './index';

describe('DisclaimerDialog', () => {
  const mockHandleClose = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render when showDialog is true', () => {
    render(
      <DisclaimerDialog showDialog={true} handleClose={mockHandleClose} />,
    );
    expect(screen.getByText('Disclaimer')).toBeInTheDocument();
  });

  it('should display disclaimer content', () => {
    render(
      <DisclaimerDialog showDialog={true} handleClose={mockHandleClose} />,
    );
    expect(
      screen.getByText(/This tool is provided for informational purposes only/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText('No Financial or Investment Advice'),
    ).toBeInTheDocument();
    expect(screen.getByText('No Liability')).toBeInTheDocument();
    expect(screen.getByText('No Data Storage')).toBeInTheDocument();
  });

  it('should call handleClose when AGREE button is clicked', () => {
    render(
      <DisclaimerDialog showDialog={true} handleClose={mockHandleClose} />,
    );
    const agreeButton = screen.getByText('AGREE');
    fireEvent.click(agreeButton);
    expect(mockHandleClose).toHaveBeenCalledTimes(1);
  });

  it('should call handleClose when close icon is clicked', () => {
    render(
      <DisclaimerDialog showDialog={true} handleClose={mockHandleClose} />,
    );
    const closeButton = screen.getByLabelText('close');
    fireEvent.click(closeButton);
    expect(mockHandleClose).toHaveBeenCalledTimes(1);
  });

  it('should not render dialog content when showDialog is false', () => {
    render(
      <DisclaimerDialog showDialog={false} handleClose={mockHandleClose} />,
    );
    // Dialog exists in DOM but not visible
    expect(screen.queryByText('Disclaimer')).not.toBeInTheDocument();
  });

  it('should match snapshot', () => {
    const { container } = render(
      <DisclaimerDialog showDialog={true} handleClose={mockHandleClose} />,
    );
    expect(container).toMatchSnapshot();
  });
});
