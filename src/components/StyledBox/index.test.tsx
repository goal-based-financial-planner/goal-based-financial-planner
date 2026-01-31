import React from 'react';
import { render } from '@testing-library/react';
import { StyledBox } from './index';

describe('StyledBox', () => {
  it('should render children correctly', () => {
    const { getByText } = render(
      <StyledBox>
        <div>Test Content</div>
      </StyledBox>
    );

    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('should match snapshot', () => {
    const { container } = render(
      <StyledBox>
        <span>Snapshot Test</span>
      </StyledBox>
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it('should apply MUI Box properties', () => {
    const { container } = render(
      <StyledBox data-testid="styled-box">
        Content
      </StyledBox>
    );

    const box = container.firstChild as HTMLElement;
    expect(box).toBeInTheDocument();
  });
});
