export function generateSolanaBlink(mint: string): string {
  const apiUrl = `https://www.letsrage.fun/api/dialect/buy?mint=${encodeURIComponent(mint)}`;
  return `https://dial.to/?action=${encodeURIComponent(`solana-action:${apiUrl}`)}`;
}

export function buyBlink(mint: string): string {
  const apiUrl = `https://www.letsrage.fun/api/dialect/buy?mint=${encodeURIComponent(mint)}`;
  return `https://dial.to/?action=${encodeURIComponent(`solana-action:${apiUrl}`)}`;
}

export function sellBlink(mint: string): string {
  const apiUrl = `https://www.letsrage.fun/api/dialect/sell?mint=${encodeURIComponent(mint)}`;
  return `https://dial.to/?action=${encodeURIComponent(`solana-action:${apiUrl}`)}`;
}
