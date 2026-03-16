"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/app/comps/ui/_icon";
import { ReactNode } from "react";

export function PageHeader({ children }: { children?: ReactNode }) {
  return (
    <div className="sticky top-0 h-13 flex items-center z-50 w-full bg-background-100/75 backdrop-blur-md  px-4">
      <BackButton />
      {children}
    </div>
  );
}

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push("/home"); // fallback page
        }
      }}
      className="group flex items-center justify-center  hover:cursor-pointer size-8 -ml-2 rounded-full hover:bg-white/10 overflow-hidden"
    >
      <Icon name="back" className="size-5 text-text-200" />
    </button>
  );
}
