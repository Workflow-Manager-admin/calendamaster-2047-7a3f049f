import { render, screen } from '@testing-library/react';
import AppWithAuth from './App';

test('renders login form when not authenticated', () => {
  render(<AppWithAuth />);
  const signInText = screen.getByText(/sign in/i);
  expect(signInText).toBeInTheDocument();
});

test('renders email input field', () => {
  render(<AppWithAuth />);
  const emailInput = screen.getByPlaceholderText(/enter your email/i);
  expect(emailInput).toBeInTheDocument();
});
