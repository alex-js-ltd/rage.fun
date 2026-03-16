"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/app/utils/misc";
import { useFormStatus } from "react-dom";

const buttonVariants = cva(undefined, {
  variants: {
    variant: {
      connect: [
        "shrink-0 items-center justify-center whitespace-nowrap transition-colors",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        "border border-input bg-background-200 hover:bg-background-300",
        "font-medium hover:bg-accent hover:text-accent-foreground",
        "h-8 px-3 text-xs gap-[6px] rounded-full shadow-none sm:flex",
        "overflow-hidden text-text-100 border border-white border-opacity-[0.125]",
      ].join(" "),

      submit_1: [
        "shrink-0 whitespace-nowrap text-sm text-white border border-white/5 flex items-center justify-center",
        "font-medium transition-colors focus-visible:outline-none focus-visible:ring-ring",
        "disabled:cursor-not-allowed",
        "flex items-center justify-center bg-transparent hover:bg-background-300 text-gray-400",
        "focus-visible:ring-0 h-8 w-8 rounded-lg",
      ].join(" "),

      submit_2: [
        "shrink-0 whitespace-nowrap text-sm text-gray-400 border border-white/5 flex items-center justify-center",
        "font-medium transition-colors focus-visible:outline-none focus-visible:ring-ring",
        "disabled:cursor-not-allowed ",
        "flex items-center justify-center bg-transparent",
        "focus-visible:ring-0 h-8 w-8 rounded-lg",
      ].join(" "),

      image: [
        "w-28 shrink-0 whitespace-nowrap rounded-md text-sm font-medium",
        "transition-colors focus-visible:outline-none focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50 items-center justify-center",
        "focus-visible:ring-0 h-8 py-2 flex select-none gap-2 text-white/70",
        "sm:px-3 cursor-pointer relative",
        "bg-transparent hover:bg-background-300 hover:text-gray-100 text-gray-400",
        "px-2 focus:outline-none border border-white/5",
      ].join(" "),

      tab: [
        "inline-flex h-8 items-center justify-center whitespace-nowrap rounded-full",
        "px-3 text-sm font-medium text-text-200 ring-offset-white transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400",
        "focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        "data-[state=active]:bg-background-600 bg-background-200 data-[state=active]:text-[#171717]",
        "px-6",
      ].join(" "),

      interval: [
        "inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap text-nowrap",
        "border font-medium outline-none ring-blue-600 transition-all",
        "focus-visible:ring-2 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:cursor-not-allowed",
        "disabled:text-gray-400 disabled:ring-0 has-[:focus-visible]:ring-2",
        "aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed",
        "aria-disabled:text-gray-400 aria-disabled:ring-0 [&>svg]:pointer-events-none [&>svg]:size-4",
        "[&_svg]:shrink-0 text-text-200 h-6 px-2 text-xs has-[>kbd]:gap-2 has-[>svg]:px-1",
        "has-[>kbd]:pr-1 rounded-full gap-0.5 has-[>svg]:pl-1.5 border",
        "border-white border-opacity-[0.125]",
      ].join(" "),

      more: [
        "m-auto w-[48px] h-[48px] bg-background-200 hover:bg-background-300",
        "rounded-full flex items-center justify-center",
      ].join(" "),

      buy: [
        "flex-1 data-[state=active]:bg-emerald-400 data-[state=active]:border-emerald-400",
        "data-[state=active]:border-opacity-100 data-[state=active]:text-text-400 text-text-100",
        "w-full h-[32px] border border-white border-opacity-[0.125] rounded-md",
        "flex items-center justify-center font-medium",
      ].join(" "),

      sell: [
        "flex-1 data-[state=active]:bg-red-400 data-[state=active]:border-red-400",
        "data-[state=active]:border-opacity-100 data-[state=active]:text-text-400 text-text-100",
        "w-full h-[32px] border border-white border-opacity-[0.125] rounded-md",
        "flex items-center justify-center font-medium",
      ].join(" "),

      chart: [
        "z-50 w-fit flex shrink-0 whitespace-nowrap text-[13px] leading-[26px]",
        "font-medium transition-colors focus-visible:outline-none focus-visible:ring-ring",
        "items-center justify-center focus-visible:ring-0 h-[40px] select-none text-white/70",
        "sm:px-3 cursor-pointer bg-transparent hover:text-gray-100 text-gray-400 px-2",
        "focus:outline-none border sm:flex border-0 border-white",
      ].join(" "),

      airdrop: ["text-text-200 text-sm"].join(" "),

      trade: [
        "w-full",
        "h-[40px]",
        "flex",
        "items-center",
        "justify-center",
        "text-text-400",
        "font-semibold",
        "rounded-full",
        "bg-background-500 hover:bg-background-600",
        "cursor-pointer z-50",
      ].join(" "),
    },
  },
});

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  asChild = false,
  ref,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  const { pending } = useFormStatus();

  return (
    <Comp
      disabled={pending}
      className={cn(buttonVariants({ variant, className }))}
      ref={ref}
      {...props}
    />
  );
}
Button.displayName = "Button";

export { Button, buttonVariants };
