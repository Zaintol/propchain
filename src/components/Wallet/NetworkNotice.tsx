import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';

export const NetworkNotice: React.FC = () => {
  const { account, chainId, targetChainId, isOnTargetNetwork, switchNetwork } = useWallet();
  if (!account) return null;
  if (!chainId) return null;
  if (isOnTargetNetwork) return null;

  const label = (cid: string) => {
    switch (cid.toLowerCase()) {
      case '0xaa36a7':
        return 'Sepolia';
      case '0x1':
        return 'Ethereum Mainnet';
      default:
        return cid;
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm">
            You are connected to <span className="font-medium">{label(chainId)}</span>. Switch to{' '}
            <span className="font-medium">{label(targetChainId)}</span> to ensure compatibility.
          </span>
        </div>
        <button
          onClick={switchNetwork}
          className="text-sm px-3 py-1 rounded-md bg-amber-600 text-white hover:bg-amber-700 transition-colors"
        >
          Switch Network
        </button>
      </div>
    </div>
  );
};


