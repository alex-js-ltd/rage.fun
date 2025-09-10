export function generateSolanaBlink(mint: string): string {
	const apiUrl = `https://www.letsrage.fun/api/buy?mint=${encodeURIComponent(mint)}`
	return `https://dial.to/?action=${encodeURIComponent(`solana-action:${apiUrl}`)}`
}
