import { Modal } from "./modal";
import { ImageProvider } from "@/app/context/image_context";
import { CreateTokenForm } from "@/app/comps/create_token_form";

export default function Page() {
  return (
    <>
      <Modal>
        <ImageProvider>
          <CreateTokenForm />
        </ImageProvider>
      </Modal>
    </>
  );
}
