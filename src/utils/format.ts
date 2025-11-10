export function truncateAddress(address: string, visible: number = 4): string {
  if (!address || address.length < visible * 2 + 2) {
    return address;
  }
  const start = address.slice(0, 2 + visible); // keep '0x' + visible
  const end = address.slice(-visible);
  return `${start}...${end}`;
}


