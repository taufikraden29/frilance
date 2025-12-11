'use client';

import { useState, useEffect } from 'react';
import { INPUT_STYLES } from '@/lib/styles';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export function CurrencyInput({ value, onChange, placeholder = '0', className = '', required = false }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  // Update display value when prop value changes
  useEffect(() => {
    if (value === 0 && displayValue === '') return; // Don't force 0 if user cleared it
    if (!isNaN(value)) {
      setDisplayValue(value === 0 ? '' : `Rp ${value.toLocaleString('id-ID')}`);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Remove non-digits
    const numericString = inputValue.replace(/[^0-9]/g, '');

    if (numericString === '') {
      setDisplayValue('');
      onChange(0);
      return;
    }

    const numberValue = parseInt(numericString, 10);

    // Update parent immediately
    onChange(numberValue);

    // Update local display with formatting
    setDisplayValue(`Rp ${numberValue.toLocaleString('id-ID')}`);
  };

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={`${INPUT_STYLES} ${className}`}
      required={required}
    />
  );
}
