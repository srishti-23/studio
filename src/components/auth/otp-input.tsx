
"use client";

import React, { useRef, useState, KeyboardEvent, ChangeEvent } from 'react';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
}

const OtpInput: React.FC<OtpInputProps> = ({ value, onChange, length = 6 }) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const newOtp = [...value];
    const val = e.target.value;
    
    // Only allow numeric input
    if (!/^[0-9]$/.test(val) && val !== '') return;

    newOtp[index] = val;
    onChange(newOtp.join(''));

    if (val && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, length).replace(/[^0-9]/g, '');
    if(pasteData){
      onChange(pasteData);
      inputsRef.current[pasteData.length - 1]?.focus();
    }
  }

  return (
    <div className="flex justify-center gap-2" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <Input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          type="tel"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className={cn(
            "w-12 h-14 text-center text-2xl font-semibold",
            "spin-button-none" // Utility class to hide number input spinners
          )}
        />
      ))}
    </div>
  );
};

export default OtpInput;
