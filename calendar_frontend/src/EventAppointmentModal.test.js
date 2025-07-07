import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EventAppointmentModal from './EventAppointmentModal';

// Mock categories for testing
const mockCategories = [
  { id: 1, name: 'Work', color: '#1976d2' },
  { id: 2, name: 'Personal', color: '#ffca28' },
  { id: 3, name: 'Health', color: '#43a047' }
];

describe('EventAppointmentModal', () => {
  const defaultProps = {
    open: true,
    event: null,
    onClose: jest.fn(),
    onSave: jest.fn(),
    categories: mockCategories,
    defaultStart: '2025-01-08T09:00',
    defaultEnd: '2025-01-08T10:00'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders create modal with proper title', () => {
    render(<EventAppointmentModal {...defaultProps} />);
    expect(screen.getByText('Create Event')).toBeInTheDocument();
  });

  test('renders edit modal with proper title when event is provided', () => {
    const event = {
      id: 1,
      title: 'Test Event',
      description: 'Test Description',
      start: '2025-01-08T09:00',
      end: '2025-01-08T10:00',
      calendar_id: 1,
      is_appointment: false
    };

    render(<EventAppointmentModal {...defaultProps} event={event} />);
    expect(screen.getByText('Edit Event')).toBeInTheDocument();
  });

  test('displays validation errors for required fields', async () => {
    // Start with a modal that has no default values to ensure validation kicks in
    const propsWithoutDefaults = {
      ...defaultProps,
      defaultStart: '',
      defaultEnd: ''
    };
    
    render(<EventAppointmentModal {...propsWithoutDefaults} />);
    
    // Clear the title field to trigger validation
    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: '' } });
    
    // Try to submit by clicking the form submit button directly
    // First we need to fill minimum required fields to enable the button
    const startInput = screen.getByLabelText(/start/i);
    const endInput = screen.getByLabelText(/end/i);
    
    // Set valid start/end times but leave title empty
    fireEvent.change(startInput, { target: { value: '2025-01-08T09:00' } });
    fireEvent.change(endInput, { target: { value: '2025-01-08T10:00' } });
    
    // Now clear the title again to test validation
    fireEvent.change(titleInput, { target: { value: '' } });
    
    // Try to submit the form
    const createButton = screen.getByRole('button', { name: /create/i });
    
    // The button should be disabled due to empty title
    expect(createButton).toBeDisabled();
  });

  test('validates email format in invitees field', async () => {
    render(<EventAppointmentModal {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/title/i);
    const inviteesInput = screen.getByLabelText(/invitees/i);
    const createButton = screen.getByRole('button', { name: /create/i });
    
    fireEvent.change(titleInput, { target: { value: 'Test Event' } });
    fireEvent.change(inviteesInput, { target: { value: 'invalid-email' } });
    
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid email format/)).toBeInTheDocument();
    });
  });

  test('validates end time is after start time', async () => {
    render(<EventAppointmentModal {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/title/i);
    const startInput = screen.getByLabelText(/start/i);
    const endInput = screen.getByLabelText(/end/i);
    
    // Fill in valid title first
    fireEvent.change(titleInput, { target: { value: 'Test Event' } });
    
    // Set invalid time range (end before start)
    fireEvent.change(startInput, { target: { value: '2025-01-08T10:00' } });
    fireEvent.change(endInput, { target: { value: '2025-01-08T09:00' } });
    
    // The create button should be disabled due to invalid time range
    const createButton = screen.getByRole('button', { name: /create/i });
    expect(createButton).toBeDisabled();
    
    // Now try to submit the form to trigger validation display
    const form = screen.getByRole('form');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText('End time must be after start time')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  test('disables create button when form is invalid', () => {
    render(<EventAppointmentModal {...defaultProps} defaultStart="" defaultEnd="" />);
    
    const createButton = screen.getByRole('button', { name: /create/i });
    expect(createButton).toBeDisabled();
  });

  test('enables create button when form is valid', () => {
    render(<EventAppointmentModal {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Test Event' } });
    
    const createButton = screen.getByRole('button', { name: /create/i });
    expect(createButton).not.toBeDisabled();
  });

  test('calls onSave with correct data structure', async () => {
    const mockOnSave = jest.fn().mockResolvedValue();
    render(<EventAppointmentModal {...defaultProps} onSave={mockOnSave} />);
    
    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const inviteesInput = screen.getByLabelText(/invitees/i);
    const appointmentCheckbox = screen.getByLabelText(/appointment/i);
    const createButton = screen.getByRole('button', { name: /create/i });
    
    fireEvent.change(titleInput, { target: { value: 'Test Event' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.change(inviteesInput, { target: { value: 'test@example.com, user2@example.com' } });
    fireEvent.click(appointmentCheckbox);
    
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'Test Event',
        description: 'Test Description',
        start: '2025-01-08T09:00',
        end: '2025-01-08T10:00',
        calendar_id: 1,
        categoryId: 1,
        invitees: ['test@example.com', 'user2@example.com'],
        is_appointment: true,
        isAppointment: true
      });
    });
  });

  test('shows loading state during submission', async () => {
    const mockOnSave = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<EventAppointmentModal {...defaultProps} onSave={mockOnSave} />);
    
    const titleInput = screen.getByLabelText(/title/i);
    const createButton = screen.getByRole('button', { name: /create/i });
    
    fireEvent.change(titleInput, { target: { value: 'Test Event' } });
    fireEvent.click(createButton);
    
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(createButton).toBeDisabled();
  });

  test('changes title from Event to Appointment when checkbox is checked', () => {
    render(<EventAppointmentModal {...defaultProps} />);
    
    expect(screen.getByText('Create Event')).toBeInTheDocument();
    
    const appointmentCheckbox = screen.getByLabelText(/appointment/i);
    fireEvent.click(appointmentCheckbox);
    
    expect(screen.getByText('Create Appointment')).toBeInTheDocument();
  });
});
