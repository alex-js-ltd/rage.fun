"use client";

import { Icon } from "./_icon";
import Image from "next/image";
import { useField } from "@conform-to/react";
import { useImage } from "@/app/context/image_context";
import { Spinner } from "@/app/comps/spinner";

export function PreviewImage() {
  const [{ errors }] = useField("file");
  const { data: image, isLoading, clearImage } = useImage();

  return (
    <div className="h-[69px] w-full">
      <div
        className={
          "flex w-full gap-2 border-b border-white border-opacity-[0.125] p-3"
        }
      >
        <div className="group relative h-[44px] w-[48px] shrink-0 rounded-lg border border-white/10 transition-all duration-500 ease-in-out flex items-center justify-center">
          {image ? (
            <>
              <button
                className="focus-visible:ring-ring absolute -right-1.5 -top-1.5 z-10 inline-flex h-4 w-4 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-gray-900 bg-gray-100 text-sm font-medium text-gray-900 opacity-0 shadow-sm transition-opacity hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 group-hover:opacity-100"
                onClick={clearImage}
              >
                <span className="sr-only">Remove image</span>
                <Icon className="h-2.5 w-2.5" name="close" />
              </button>
              <div className="overflow-hidden rounded-lg group-hover:opacity-80">
                <Image
                  className="relative aspect-[48/44] object-cover object-center rounded-lg"
                  fill={true}
                  src={image}
                  alt="preview"
                />
              </div>
            </>
          ) : null}

          {isLoading && <Spinner />}
        </div>
        {errors?.map((el) => (
          <span
            key={el}
            className="inline-block whitespace-nowrap text-xs text-teal-300"
          >
            {el}
          </span>
        ))}
      </div>
    </div>
  );
}
