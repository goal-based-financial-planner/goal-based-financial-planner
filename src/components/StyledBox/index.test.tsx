import React from 'react';
import { render, screen } from '@testing-library/react';
import { StyledBox } from './index';

describe('StyledBox', () => {
  it('should render children correctly', () => {
    render(
      <StyledBox>
        <div>Test Content</div>
      </StyledBox>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should match snapshot', () => {
    const { container } = render(
      <StyledBox data-testid="styled-box">
        <span>Snapshot Test</span>
      </StyledBox>
    );

    expect(container).toMatchSnapshot();
  });

  it('should apply MUI Box properties', () => {
    render(
      <StyledBox data-testid="styled-box">
        Content
      </StyledBox>
    );

    expect(screen.getByTestId('styled-box')).toBeInTheDocument();
  });
});
