import { InitializeForm } from '@/app/comps/initialize_form'
import { ImageProvider } from '@/app/context/image_context'

export default function Page() {
	return (
		<div className="max-w-[600px] w-full mx-auto pt-[52px]">
			<ImageProvider>
				<InitializeForm />
			</ImageProvider>
		</div>
	)
}
