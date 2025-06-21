import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Loader2, Search } from 'lucide-react';

interface PhoneNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearchDetected?: (query: string) => Promise<string | null>;
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

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({ value, onChange, onSearchDetected }) => {
  const [isSearching, setIsSearching] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const isSearchQuery = (input: string): boolean => {
    // Check if input looks like a search query rather than a phone number
    const phonePattern = /^[+]?[0-9\s\-()]+$/;
    const hasLetters = /[a-zA-Z]/.test(input);
    const hasPostcode = /[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}/i.test(input);
    
    return (hasLetters || hasPostcode) && input.trim().length > 3;
  };

  const performSearch = async (query: string) => {
    if (!onSearchDetected) return;
    
    setIsSearching(true);
    try {
      const phoneNumber = await onSearchDetected(query);
      if (phoneNumber) {
        setDisplayValue(phoneNumber);
        onChange(phoneNumber);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Check if this looks like a search query
    if (isSearchQuery(newValue)) {
      // Wait a bit before searching (debounce)
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(newValue);
      }, 1500);
    } else {
      // It's a phone number, update immediately
      onChange(newValue);
    }
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
    if (isSearching) return null;
    if (!displayValue.startsWith('+')) return '🌍';
    
    const countryCode = getCountryCode(displayValue);
    return countryCode ? countryCodeToFlag[countryCode] : '🌍';
  };

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex-1 flex items-center relative bg-white rounded-[28px] border border-[rgba(13,13,13,0.05)]">
      <div className="absolute left-3 flex items-center">
        {isSearching ? (
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        ) : isSearchQuery(displayValue) && !isSearching ? (
          <Search className="h-5 w-5 text-gray-400" />
        ) : (
          <span className="text-lg">{getCountryFlag()}</span>
        )}
      </div>
      
      <Input
        type="tel"
        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base pl-11 py-3 h-auto bg-transparent shadow-none outline-none"
        placeholder={isSearching ? "Searching..." : "Phone number or search"}
        value={displayValue}
        onChange={handleChange}
        autoComplete="tel"
        inputMode="tel"
        disabled={isSearching}
      />
      
      {isSearching && (
        <div className="absolute right-3 text-xs text-gray-500">
          Finding phone number...
        </div>
      )}
    </div>
  );
};

export default PhoneNumberInput;