import { ReactNode } from 'react'

function Table({ ref, ...props }: React.ComponentProps<'table'>) {
	return <table ref={ref} {...props} />
}

Table.displayName = 'Table'

function TableHead({ ref, children, ...props }: React.ComponentProps<'thead'>) {
	return (
		<thead ref={ref} {...props}>
			{children}
		</thead>
	)
}

TableHead.displayName = 'TableHead'

function TableHeaderCellElement({ ref, ...props }: React.ComponentProps<'th'>) {
	return <th ref={ref} {...props} />
}

TableHeaderCellElement.displayName = 'TableHeaderCellElement'

function TableBody({ ref, ...props }: React.ComponentProps<'tbody'>) {
	return <tbody ref={ref} {...props} />
}

TableBody.displayName = 'TableBody'

function TableRow({ ref, ...props }: React.ComponentProps<'tr'>) {
	return <tr ref={ref} {...props} />
}

TableRow.displayName = 'TableRow'

function TableFoot({ ref, ...props }: React.ComponentProps<'tfoot'>) {
	return <tfoot ref={ref} {...props} />
}

TableFoot.displayName = 'TableFoot'

export { Table, TableHead, TableHeaderCellElement, TableBody, TableRow, TableFoot }
