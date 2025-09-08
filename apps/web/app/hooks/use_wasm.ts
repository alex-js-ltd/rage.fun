import { useEffect } from 'react'
import { useAsync } from './use_async'
import type * as calculateWasmModule from '../../calculate.wasm' //

const loadWasm = async () => {
	const response = await fetch('/calculate.wasm') // must be in /public
	const buffer = await response.arrayBuffer()
	const { instance } = await WebAssembly.instantiate(buffer)

	const exports = instance.exports as unknown as typeof calculateWasmModule
	return exports
}

export function useWasm() {
	const { run, data } = useAsync<typeof calculateWasmModule>()

	useEffect(() => {
		const promise = loadWasm()
		run(promise)
	}, [run])

	return data
}
