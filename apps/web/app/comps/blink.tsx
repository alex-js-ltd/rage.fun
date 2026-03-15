import { useState } from "react";
import { Icon } from "@/app/comps/ui/_icon";
import { buyBlink } from "@/app/utils/dialect";
import { useCopyToClipboard } from "usehooks-ts";

export function Blink({ mint }: { mint: string }) {
  const [copied, setCopied] = useState(false);
  const [_, copy] = useCopyToClipboard();

  function handleClick() {
    copy(buyBlink(mint));

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  return (
    <button
      onClick={handleClick}
      className="flex h-7 w-fit min-w-[120px] items-center justify-center gap-1.5 rounded-full border border-white/5 px-4"
    >
      <Icon name="dialect" className="h-[14px] w-[15px] text-white" />
      <span className="text-text-200 text-xs font-medium whitespace-nowrap">
        {copied ? "Copied" : "Share Blink"}
      </span>
    </button>
  );
}
