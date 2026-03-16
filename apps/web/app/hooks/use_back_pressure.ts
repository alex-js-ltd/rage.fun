import { useRef } from "react";
import { useRouter } from "next/navigation";

export function useBackpressure(delay: number = 300) {
  const router = useRouter();

  const isUpdatingRef = useRef(false);
  const updateCountRef = useRef(0);
  const latestUrlRef = useRef<string>("");
  const formRef = useRef<HTMLFormElement | null>(null);

  async function triggerUpdate(newUrl: string) {
    updateCountRef.current++;
    latestUrlRef.current = newUrl;

    if (!isUpdatingRef.current) {
      isUpdatingRef.current = true;

      const currentUpdateCount = updateCountRef.current;

      // prevent scroll to top
      router.replace(newUrl, { scroll: false });

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          isUpdatingRef.current = false;

          if (updateCountRef.current !== currentUpdateCount) {
            formRef.current?.requestSubmit();
          }

          resolve();
        }, delay);
      });
    }
  }
  // eslint-disable-next-line react-hooks/refs
  const shouldSuspend = updateCountRef.current > 0 && !isUpdatingRef.current;
  // eslint-disable-next-line react-hooks/refs
  return { triggerUpdate, shouldSuspend, formRef };
}
