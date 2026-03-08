import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MessageInput from '@/components/MessageInput';
import '@testing-library/jest-dom';

describe('MessageInput', () => {
  const placeholder = 'Pergunte para Warren Buffet Consultoria...';

  it('renders input and button', () => {
    render(<MessageInput onSendMessage={() => {}} />);
    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onSendMessage with input value when submitted', () => {
    const handleSendMessage = jest.fn();
    render(<MessageInput onSendMessage={handleSendMessage} />);
    
    const input = screen.getByPlaceholderText(placeholder);
    const button = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(button);

    expect(handleSendMessage).toHaveBeenCalledWith('Hello');
  });

  it('clears input after submission', () => {
    const handleSendMessage = jest.fn();
    render(<MessageInput onSendMessage={handleSendMessage} />);
    
    const input = screen.getByPlaceholderText(placeholder) as HTMLInputElement;
    const button = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(button);

    expect(input.value).toBe('');
  });

  it('disables input and button when loading', () => {
    render(<MessageInput onSendMessage={() => {}} isLoading={true} />);
    
    const input = screen.getByPlaceholderText(placeholder);
    const button = screen.getByRole('button');

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('does not submit empty message', () => {
    const handleSendMessage = jest.fn();
    render(<MessageInput onSendMessage={handleSendMessage} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleSendMessage).not.toHaveBeenCalled();
  });
});
