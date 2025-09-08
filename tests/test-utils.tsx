import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export * from '@testing-library/react';
export { userEvent };

export function renderWithUser(jsx: React.ReactElement) {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
}
