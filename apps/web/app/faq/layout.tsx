import React, { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<main className="flex-1">
			<div className="bg-zinc-50">
				<div className="bg-white py-16">
					<div className="mx-auto max-w-screen-md px-4 sm:px-6 lg:px-8">
						<h1 className="font-display text-center text-3xl font-extrabold leading-[1.15] text-black sm:text-5xl sm:leading-[1.15]">
							Frequently Asked Questions
						</h1>
						<p className="mt-5 text-center text-lg text-zinc-600">
							Get answers to common questions about letsrage.fun.
						</p>
					</div>
				</div>
				<div className="mx-auto flex max-w-screen-md flex-col items-center px-4 py-10 sm:px-6 sm:pt-20 lg:px-8">
					<article className="prose-headings:font-display prose prose-gray max-w-none transition-all prose-headings:relative prose-headings:scroll-mt-20 prose-headings:font-semibold pb-64">
						<p className="text-left text-lg text-zinc-600">How do fees compare?</p>

						<table>
							<thead>
								<tr>
									<th>Platform</th>
									<th>Creator fee</th>
									<th>Protocol fee</th>
									<th>LP fee</th>
									<th>Total fee</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td>pump.fun</td>
									<td>0.30%</td>
									<td>0.95%</td>
									<td>0%</td>
									<td>1.25%</td>
								</tr>
								<tr>
									<td>letsrage.fun</td>
									<td>1.00%</td>
									<td>0%</td>
									<td>0%</td>
									<td>1.00%</td>
								</tr>
							</tbody>
						</table>
						{children}
					</article>
					<div className="mt-10 w-full border-t border-zinc-200 pt-10 text-center">
						<p className="text-zinc-500">Last updated: September 3rd, 2025</p>
					</div>
				</div>
			</div>
		</main>
	)
}
