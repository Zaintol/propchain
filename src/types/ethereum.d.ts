// Minimal EIP-1193 provider typings for MetaMask
interface EthereumProvider {
  isMetaMask?: boolean;
  request<T = unknown>(args: { method: string; params?: unknown[] | Record<string, unknown> }): Promise<T>;
  on?(event: 'accountsChanged', handler: (accounts: string[]) => void): void;
  on?(event: 'chainChanged', handler: (chainId: string) => void): void;
  removeListener?(event: 'accountsChanged', handler: (accounts: string[]) => void): void;
  removeListener?(event: 'chainChanged', handler: (chainId: string) => void): void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export {};


