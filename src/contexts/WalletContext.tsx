import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type WalletContextValue = {
  account: string | null;
  chainId: string | null;
  targetChainId: string;
  isOnTargetNetwork: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
};

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'pc_account';
const TARGET_CHAIN_ID = '0xaa36a7'; // Sepolia

const CHAIN_PARAMS: Record<string, { chainId: string; chainName: string; nativeCurrency: { name: string; symbol: string; decimals: number }; rpcUrls: string[]; blockExplorerUrls?: string[] }> = {
  // Ethereum Mainnet
  '0x1': {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://rpc.ankr.com/eth'],
    blockExplorerUrls: ['https://etherscan.io'],
  },
  // Sepolia Testnet
  '0xaa36a7': {
    chainId: '0xaa36a7',
    chainName: 'Sepolia',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'SEP', decimals: 18 },
    rpcUrls: ['https://rpc.ankr.com/eth_sepolia'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
};

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (!accounts || accounts.length === 0) {
      setAccount(null);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return;
    }
    setAccount(accounts[0]);
    localStorage.setItem(LOCAL_STORAGE_KEY, accounts[0]);
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      if (!window.ethereum) {
        throw Object.assign(new Error('MetaMask not detected'), { code: 'NO_METAMASK' });
      }
      // Read chain first for UI
      try {
        const currentChainId = await window.ethereum.request<string>({ method: 'eth_chainId' });
        setChainId(currentChainId || null);
      } catch {
        // ignore
      }
      const accounts = await window.ethereum.request<string[]>({
        method: 'eth_requestAccounts',
      });
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned');
      }
      handleAccountsChanged(accounts);
    } catch (err: unknown) {
      const anyErr = err as { code?: number | string; message?: string };
      if (anyErr?.code === 4001) {
        setError('Connection request rejected');
      } else if (anyErr?.code === 'NO_METAMASK') {
        setError('MetaMask not detected');
      } else {
        setError(anyErr?.message || 'Failed to connect wallet');
      }
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [handleAccountsChanged]);

  const disconnect = useCallback(() => {
    setAccount(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) {
      setError('MetaMask not detected');
      return;
    }
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: TARGET_CHAIN_ID }],
      });
      setChainId(TARGET_CHAIN_ID);
    } catch (err: unknown) {
      const anyErr = err as { code?: number | string };
      // 4902 = Unrecognized chain, try adding
      if (anyErr?.code === 4902) {
        const params = CHAIN_PARAMS[TARGET_CHAIN_ID];
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [params],
          });
          setChainId(TARGET_CHAIN_ID);
        } catch (addErr) {
          setError('Failed to add network');
        }
      } else if ((anyErr?.code as number) === 4001) {
        setError('Network switch rejected');
      } else {
        setError('Failed to switch network');
      }
    }
  }, []);

  // Restore session and attach listeners
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!window.ethereum) return;
        try {
          const currentChainId = await window.ethereum.request<string>({ method: 'eth_chainId' });
          if (mounted) setChainId(currentChainId || null);
        } catch {
          // ignore
        }
        const accounts = await window.ethereum.request<string[]>({ method: 'eth_accounts' });
        if (!mounted) return;
        if (accounts && accounts.length > 0) {
          handleAccountsChanged(accounts);
        } else {
          // Fallback to localStorage if present
          const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (stored) {
            setAccount(stored);
          }
        }
      } catch {
        // ignore
      }
    })();

    const accHandler = (accs: string[]) => handleAccountsChanged(accs);
    const chainHandler = (cid: string) => setChainId(cid);
    window.ethereum?.on?.('accountsChanged', accHandler);
    window.ethereum?.on?.('chainChanged', chainHandler);
    return () => {
      mounted = false;
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', accHandler);
        window.ethereum.removeListener('chainChanged', chainHandler);
      }
    };
  }, [handleAccountsChanged]);

  const value = useMemo<WalletContextValue>(
    () => ({
      account,
      chainId,
      targetChainId: TARGET_CHAIN_ID,
      isOnTargetNetwork: !!chainId && chainId.toLowerCase() === TARGET_CHAIN_ID.toLowerCase(),
      isConnecting,
      error,
      connect,
      disconnect,
      switchNetwork,
    }),
    [account, chainId, isConnecting, error, connect, disconnect, switchNetwork]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return ctx;
}


