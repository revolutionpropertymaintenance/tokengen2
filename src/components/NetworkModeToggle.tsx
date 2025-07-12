import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useNetworkMode } from '../hooks/useNetworkMode';

interface NetworkModeToggleProps {
  className?: string;
}

export const NetworkModeToggle: React.FC<NetworkModeToggleProps> = ({ className = '' }) => {
  const { isTestnetMode, toggleMode } = useNetworkMode();

  return (
    <button
      onClick={toggleMode}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        isTestnetMode ? 'bg-green-500' : 'bg-blue-600'
      } ${className}`}
      title={isTestnetMode ? 'Switch to Mainnet Mode' : 'Switch to Testnet Mode'}
    >
      <span className="sr-only">{isTestnetMode ? 'Switch to Mainnet Mode' : 'Switch to Testnet Mode'}</span>
      <span
        className={`${
          isTestnetMode ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      />
      <span className="absolute left-0 right-0 text-xs text-white flex justify-between px-1">
        <Moon className={`w-3 h-3 ${!isTestnetMode ? 'opacity-100' : 'opacity-0'}`} />
        <Sun className={`w-3 h-3 ${isTestnetMode ? 'opacity-100' : 'opacity-0'}`} />
      </span>
    </button>
  );
};