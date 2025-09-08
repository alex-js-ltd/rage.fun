import { Rage } from '../target/types/rage'
import { Connection } from '@solana/web3.js'
import { Program, EventParser, BorshCoder, IdlEvents } from '@coral-xyz/anchor'

export interface Event extends IdlEvents<Program<Rage>['idl']> {}

interface FetchAllEventParams {
	program: Program<Rage>
	connection: Connection
	signatureList: string[]
}

export type EventData<E extends keyof Event> = {
	name: E
	data: Event[E]
	signature: string
}

export async function fetchAllEvents({ program, connection, signatureList }: FetchAllEventParams) {
	const eventParser = new EventParser(program.programId, new BorshCoder(program.idl))

	async function processEvent(signature: string) {
		const tx = await connection.getParsedTransaction(signature, {
			maxSupportedTransactionVersion: 0,
			commitment: 'confirmed',
		})

		const logMessages = tx?.meta?.logMessages

		if (!logMessages) {
			return []
		}

		const events = eventParser.parseLogs(logMessages)
		const eventArray = Array.from(events)

		return eventArray?.reduce<Array<EventData<keyof Event>>>((acc, curr) => {
			if (curr.data) {
				const name = curr.name as keyof Event
				const data = curr.data as Event[keyof Event]

				const value = {
					name,
					data,
					signature,
				}

				acc.push(value)
			}
			return acc
		}, [])
	}

	const results = await Promise.all(
		signatureList.map(sig => processEvent(sig)), // set limit > 1
	)
	return results.flat()
}

type GroupedEvents = {
	[K in keyof Event]: Array<EventData<K>>
}

export function groupEvents<E extends keyof Event>(data: Array<EventData<E>>) {
	const start: GroupedEvents = { swapEvent: [], createEvent: [], airdropEvent: [], harvestEvent: [], raydiumEvent: [] }

	return data.reduce((acc, curr) => {
		const name = curr.name

		if (!acc[name]) {
			acc[name] = []
		}
		acc[name].push(curr)

		return acc
	}, start)
}
