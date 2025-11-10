import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type WalletContextValue = {
  account: string | null;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'pc_account';

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
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

  // Restore session and attach listeners
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!window.ethereum) return;
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
    window.ethereum?.on?.('accountsChanged', accHandler);
    return () => {
      mounted = false;
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', accHandler);
      }
    };
  }, [handleAccountsChanged]);

  const value = useMemo<WalletContextValue>(
    () => ({
      account,
      isConnecting,
      error,
      connect,
      disconnect,
    }),
    [account, isConnecting, error, connect, disconnect]
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


