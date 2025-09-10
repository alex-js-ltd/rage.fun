async function client<DataType>(endpoint: string, config: RequestInit): Promise<DataType> {
	return fetch(`${endpoint}`, config).then(async response => {
		const rateLimitSuccess = response.headers.get('x-ratelimit-success')?.toLowerCase()

		if (rateLimitSuccess === 'false') {
			window.location.href = 'https://www.letsrage.fun/blocked'
			return new Promise(() => {}) // keeps the function hanging (optional)
		}

		const data = await response.json()
		if (response.ok) {
			return data
		} else {
			return Promise.reject(data)
		}
	})
}

export { client }
