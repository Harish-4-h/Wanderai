import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AutocompleteComponent from './AutocompleteComponent';

describe('GooglePlacesAutocomplete Component', () => {

  test('renders autocomplete input', () => {
    render(<AutocompleteComponent />);
    
    expect(screen.getByText('Select Destination')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Where would you like to go?')).toBeInTheDocument();
  });

  test('user can type in autocomplete and location gets selected', () => {
    render(<AutocompleteComponent />);
    
    const autocompleteInput = screen.getByTestId('places-autocomplete');
    
    // المستخدم يكتب اسم مكان
    fireEvent.change(autocompleteInput, { target: { value: 'Paris' } });
    
    // نتحقق أن القيمة ظهرت في الـ input
    expect(autocompleteInput.value).toBe('Paris');
    
    // نتحقق أن المكان المختار ظهر
    expect(screen.getByTestId('selected-location')).toHaveTextContent('Selected: Paris');
  });

  test('user can change destination', () => {
    render(<AutocompleteComponent />);
    
    const autocompleteInput = screen.getByTestId('places-autocomplete');
    
    // اختيار مكان أول
    fireEvent.change(autocompleteInput, { target: { value: 'London' } });
    expect(screen.getByTestId('selected-location')).toHaveTextContent('Selected: London');
    
    // تغيير المكان
    fireEvent.change(autocompleteInput, { target: { value: 'Tokyo' } });
    expect(screen.getByTestId('selected-location')).toHaveTextContent('Selected: Tokyo');
  });

  test('selected location disappears when input is cleared', () => {
    render(<AutocompleteComponent />);
    
    const autocompleteInput = screen.getByTestId('places-autocomplete');
    
    // اختيار مكان
    fireEvent.change(autocompleteInput, { target: { value: 'Dubai' } });
    expect(screen.getByTestId('selected-location')).toBeInTheDocument();
    
    // مسح الـ input
    fireEvent.change(autocompleteInput, { target: { value: '' } });
    expect(screen.queryByTestId('selected-location')).not.toBeInTheDocument();
  });

});