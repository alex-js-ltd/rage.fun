"use client";

import { useEffect, useState, useRef } from "react";
import { useAsync } from "@/app/hooks/use_async";
import { type ToastProps } from "@/app/comps/ui/toast";
import { type SignatureStatus } from "@solana/web3.js";
import { getErrorMessage } from "@/app/utils/misc";

type AsyncState = ReturnType<
  typeof useAsync<string | undefined | SignatureStatus>
>;

export interface ToastDescription {
  loading: string;
  success: string;
}

export function useToast(async: AsyncState) {
  const { isIdle, isLoading, isSuccess, isError, error, reset } = async;

  const [open, setOpen] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading || isError) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
    }

    if (isSuccess || isError) {
      timerRef.current = setTimeout(() => {
        setOpen(false);
        reset();
      }, 5000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isLoading, isSuccess, isError, error, reset]);

  function onOpenChange(open: boolean) {
    setOpen(open);
  }

  function getDescription(params: ToastDescription) {
    if (isLoading) {
      return params.loading;
    }

    if (isSuccess) {
      return params.success;
    }

    if (isError) {
      return getErrorMessage(error);
    }
  }

  function getToastProps(params: ToastDescription): ToastProps {
    const description = getDescription(params);

    const className = isLoading
      ? "animate-pulse"
      : isIdle
        ? "hidden"
        : undefined;

    return {
      open,
      onOpenChange,
      description,
      className,
      duration: Infinity,
    };
  }

  return { getToastProps };
}
