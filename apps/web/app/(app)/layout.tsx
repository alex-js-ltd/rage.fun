"use client";

import { usePathname, useSelectedLayoutSegment } from "next/navigation";
import { cn } from "@/app/utils/misc";
import { Footer } from "@/app/comps/footer";

export default function Layout(props: {
  children: React.ReactNode;
  nav: React.ReactNode;
  right: React.ReactNode;
  modal: React.ReactNode;
  token: React.ReactNode;
}) {
  const pathname = usePathname();

  const segment = useSelectedLayoutSegment();

  const isOnToken = pathname.startsWith("/token");

  const isOnCreate = pathname.startsWith("/create");

  const profile = segment && segment?.length > 20;

  const isTokenFeed = segment === "home" || segment === "earn" || profile;

  const hide = isOnToken && isTokenFeed;

  const isOnTokenSegment = segment === "token";

  const isOnCreateSegment = segment === "create";

  return (
    <>
      <div className="flex w-full justify-center">
        <div
          className={cn(
            "grid min-h-screen items-stretch",
            "w-full max-w-[600px] grid-cols-1",
            "xs:[grid-template-columns:minmax(0px,600px)]",
            "sm:w-fit sm:max-w-none sm:[grid-template-columns:minmax(70px,70px)_minmax(0px,600px)]",
            "md:[grid-template-columns:minmax(70px,70px)_600px]",
            "lg:[grid-template-columns:minmax(0,259px)_600px_minmax(290px,350px)]",
            "xl:[grid-template-columns:minmax(0,259px)_600px_minmax(350px,350px)]",
          )}
        >
          {/* LEFT */}
          <aside className="z-50">{props.nav}</aside>

          {/* CENTER (your Page renders here) */}
          <main className={cn("relative w-full max-w-[600px]")}>
            <div className={cn(hide && "sr-only")}>{props.children}</div>

            {isOnTokenSegment ? null : (
              <div
                className={cn("", isOnCreate && "fixed inset-0 sm:absolute")}
              >
                {props.token}
              </div>
            )}
          </main>

          {/* RIGHT — parent must stretch so sticky has room */}
          <aside className="hidden self-stretch lg:block">
            <div className="sticky top-0 px-4">
              <div className="relative h-[100vh] overflow-hidden">
                {props.right}

                <div className="absolute right-0 bottom-2 left-0">
                  <Footer />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {isOnCreateSegment ? null : props.modal}
    </>
  );
}
