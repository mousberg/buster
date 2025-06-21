import React from 'react';
import Image from 'next/image';
import { Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopNavigationProps {
  onSettingsClick: () => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ onSettingsClick }) => {
  return (
    <div className="w-full bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex items-center justify-between h-16 py-3">
          {/* Left - Profile Circle */}
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full h-9 w-9"
          >
            <User className="w-4 h-4" />
          </Button>

          {/* Center - Logo */}
          <div className="flex items-center">
            <Image 
              src="/logo.svg" 
              alt="Logo" 
              width={32} 
              height={32}
              className="opacity-70"
            />
          </div>

          {/* Right - Settings */}
          <Button
            onClick={onSettingsClick}
            variant="outline"
            size="icon"
            aria-label="Settings"
            className="rounded-xl h-9 w-9"
          >
            <Settings className="w-4 h-4" strokeWidth={1.5} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;