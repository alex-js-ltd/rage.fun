import { Modal } from "@/app/(app)/@modal/(.)create/modal";
import { ImageProvider } from "@/app/context/image_context";
import { InitializeForm } from "@/app/comps/initialize_form";

export default function Page() {
  return (
    <>
      <Modal>
        <ImageProvider>
          <InitializeForm />
        </ImageProvider>
      </Modal>
    </>
  );
}
