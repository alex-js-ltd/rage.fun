import { prisma } from '@/app/utils/db'
import { cache } from 'react'

export const isSymbolUnique = cache(async (symbol: string): Promise<boolean> => {
	const token = await prisma.metadata.findUnique({
		where: {
			symbol: symbol,
		},
	})

	return token ? false : true
})
