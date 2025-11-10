import React from 'react';
import { Wallet } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { truncateAddress } from '../../utils/format';

type WalletModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }: WalletModalProps) => {
  const { account, isConnecting, error, connect } = useWallet();

  if (!isOpen) return null;

  const hasEthereum = typeof window !== 'undefined' && !!window.ethereum;
  const hasMetaMask = hasEthereum && !!window.ethereum?.isMetaMask;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Connect Wallet</h3>
          <button className="text-gray-500 hover:text-gray-800" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Success state */}
        {account ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-emerald-50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-emerald-700 font-medium">Connected</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-sm break-all">
              {account}
            </div>
            <div className="text-sm text-gray-600">
              You are connected with <span className="font-medium">{truncateAddress(account)}</span>.
            </div>
            <div className="flex justify-end">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {!hasMetaMask && (
              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
                MetaMask is not detected. Please install MetaMask from{' '}
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noreferrer"
                  className="underline font-medium"
                >
                  metamask.io
                </a>
                .
              </div>
            )}

            {/* Wallet list - just MetaMask for this assignment */}
            <button
              className={`w-full flex items-center justify-between border rounded-xl p-4 hover:border-blue-400 transition-colors ${
                isConnecting ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              onClick={() => connect().then(() => {}).catch(() => {})}
              disabled={isConnecting}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium">MetaMask</div>
                  <div className="text-xs text-gray-500">Browser wallet</div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {isConnecting ? 'Connecting...' : 'Connect'}
              </div>
            </button>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


