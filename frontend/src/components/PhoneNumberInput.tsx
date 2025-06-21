import React from 'react';
import { Input } from "@/components/ui/input";

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
}

const countryCodeToFlag: Record<string, string> = {
  '1': '🇺🇸', // USA
  '7': '🇷🇺', // Russia
  '44': '🇬🇧', // UK
  '33': '🇫🇷', // France
  '49': '🇩🇪', // Germany
  '81': '🇯🇵', // Japan
  '86': '🇨🇳', // China
  '91': '🇮🇳', // India
};

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({ value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const getCountryCode = (phoneNumber: string): string => {
    if (!phoneNumber.startsWith('+')) return '';
    
    for (let i = 3; i >= 1; i--) {
      const potentialCode = phoneNumber.substring(1, i + 1);
      if (countryCodeToFlag[potentialCode]) {
        return potentialCode;
      }
    }
    
    return '';
  };

  const getCountryFlag = () => {
    if (!value.startsWith('+')) return '🌍';
    
    const countryCode = getCountryCode(value);
    return countryCode ? countryCodeToFlag[countryCode] : '🌍';
  };

  return (
    <div className="flex-1 flex items-center relative bg-white rounded-[28px] border border-[rgba(13,13,13,0.05)]">
      <div className="absolute left-3 flex items-center">
        <span className="text-lg">{getCountryFlag()}</span>
      </div>
      
      <Input
        type="tel"
        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base pl-11 py-3 h-auto bg-transparent shadow-none outline-none"
        placeholder="Phone number"
        value={value}
        onChange={handleChange}
        autoComplete="tel"
        inputMode="tel"
      />
    </div>
  );
};

export default PhoneNumberInput;