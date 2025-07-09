import React from 'react';
import { Wallet, LogOut, Loader2 } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

export const WalletConnection: React.FC = () => {
  const { isConnected, address, balance, connectWallet, disconnectWallet, isConnecting } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected) {
    return (
      <div className="flex items-center space-x-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
          <div className="flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-blue-300" />
            <span className="text-sm font-medium text-white">
              {formatAddress(address!)}
            </span>
            <span className="text-xs text-blue-300">
              {balance} ETH
            </span>
          </div>
        </div>
        <button
          onClick={disconnectWallet}
          className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
    >
      {isConnecting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4" />
          <span>Connect Wallet</span>
        </>
      )}
    </button>
  );
};