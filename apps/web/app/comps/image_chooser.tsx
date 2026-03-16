"use client";

import { Button } from "@/app/comps/ui/button";
import { Icon } from "@/app/comps/ui/_icon";
import { useImage } from "@/app/context/image_context";

export function ImageChooser() {
  const { fileRef, getInputProps } = useImage();
  return (
    <Button
      type="button"
      variant="image"
      onClick={() => {
        if (fileRef.current) {
          fileRef.current.click();
        }
      }}
    >
      <input {...getInputProps("file")} />

      <Icon name="upload" className="h-4 w-4" />
      <span className="hidden sm:block">Image</span>
    </Button>
  );
}
