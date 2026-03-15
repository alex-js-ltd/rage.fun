"use client";

import React, { useEffect, useRef, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { Blink } from "@/app/comps/blink";
import { SquareProgress } from "@/app/comps/square_progress";
import { Icon } from "@/app/comps/ui/_icon";
import { Loading } from "@/app/comps/ui/loading";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/comps/ui/tooltip";

import { HarvestYieldForm } from "@/app/comps/harvest_yield_form";

import { cn, formatNumberSmart, shortAddress } from "@/app/utils/misc";
import { createPngDataUri } from "unlazy/thumbhash";

import type { TokenCard } from "@/app/data/get_token_feed";

type TokenCardProps = {
  token: TokenCard;
  action?: React.ReactNode;
  link?: React.ReactNode;
};

function TokenCard({ token, action, link }: TokenCardProps) {
  const {
    id: mint,
    metadata: { name, symbol, image, thumbhash },
    bondingCurve: { updatedAt, progress },
    marketData: { price, marketCap, liquidity, volume, buyCount, sellCount },
    updateType,
  } = token;

  const prevUpdatedAtRef = useRef(updatedAt);

  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (updatedAt !== prevUpdatedAtRef.current) {
      prevUpdatedAtRef.current = updatedAt;
      // restart animation even if previous one is mid-flight
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnimate(false);
      requestAnimationFrame(() => setAnimate(true));
    }
  }, [updatedAt]);

  const buyWave = cn(
    "absolute inset-0 z-20 pointer-events-none overflow-hidden bg-transparent",
    "before:pointer-events-none before:absolute before:inset-0",
    "before:bg-gradient-to-r before:from-transparent before:via-teal-300/10 before:to-transparent",
    "before:animate-wave-once",
  );

  const sellWave = cn(
    "absolute inset-0 z-20 pointer-events-none overflow-hidden bg-transparent",
    "before:pointer-events-none before:absolute before:inset-0",
    "before:bg-gradient-to-r before:from-transparent before:via-red-300/10 before:to-transparent",
    "before:animate-wave-once",
  );

  const [src, setImgSrc] = useState(image);

  return (
    <article className="group bg-background-100 relative flex h-full min-h-44.5 w-full flex-col border-b border-white/5 hover:bg-white/10">
      <div
        onAnimationEnd={() => setAnimate(false)}
        className={cn(
          "absolute inset-0",
          updateType === "Buy" && animate && buyWave,
          updateType === "Sell" && animate && sellWave,
        )}
      />

      <div className="relative flex flex-col gap-4 p-4">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1">
            <SquareProgress progress={progress} size={74}>
              <Link
                className="relative h-18 w-18 shrink-0 cursor-pointer overflow-hidden rounded-md"
                aria-label={`View ${name}`}
                href={{
                  pathname: `/token/${mint}`,
                  query: { interval: "1m" },
                }}
                as={`/token/${mint}?interval=1m`}
                scroll={true}
                prefetch={false}
              >
                <Image
                  src={`${src}`}
                  alt={`${name}`}
                  className="z-0 h-full w-full object-cover object-center"
                  fill={true}
                  blurDataURL={createPngDataUri(thumbhash)}
                  placeholder="blur"
                  sizes="(min-width: 1280px) 14vw, (min-width: 1024px) 16vw, (min-width: 768px) 20vw, (min-width: 640px) 25vw, 33vw"
                  onError={() => {
                    setImgSrc("/fallback.webp");
                  }}
                />
              </Link>
            </SquareProgress>

            <span className="text-text-200 text-xs font-medium">
              {shortAddress(mint)}
            </span>
          </div>

          <div className="flex w-full flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-text-100 w-fit text-[16px] font-medium">
                {symbol}
              </span>
              <span className="text-white">|</span>
              <span className="text-text-200 w-fit text-[14px] font-medium">
                {name}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-text-200 text-xs font-medium">MC</span>
              <span className="text-rage-100 font-mono text-[15px] font-medium">{`$${formatNumberSmart(marketCap)}`}</span>
            </div>

            {link}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:h-8">
          <div className="flex flex-wrap items-center gap-0 rounded-full border border-white/5 px-1 py-1">
            <Pill
              label="P"
              value={`$${formatNumberSmart(price)}`}
              tooltip="Price"
            />
            <Pill
              label="L"
              value={`$${formatNumberSmart(liquidity)}`}
              tooltip="Liquidity"
            />
            <Pill
              label="V"
              value={`$${formatNumberSmart(volume)}`}
              tooltip="Volume"
            />

            <Pill
              label={""}
              value={
                <div className="flex gap-2">
                  <div className="text-buy-100 text-xs">{buyCount}</div> /{" "}
                  <div className="text-sell-100 text-xs">{sellCount}</div>
                </div>
              }
              tooltip="TXNS"
            />
          </div>

          <div className="xxs:justify-end flex flex-1 items-center">
            {action}
          </div>
        </div>
      </div>
    </article>
  );
}

type PillProps = {
  label: React.ReactNode;
  value: React.ReactNode;
  tooltip?: React.ReactNode;
  className?: string;
};
export function Pill({ label, value, tooltip, className }: PillProps) {
  const body = (
    <div
      className={`hover:bg-background-100 flex w-fit rounded-full px-2 py-1 ${className ?? ""}`}
    >
      <div className="flex gap-1">
        <span className="text-text-200 text-xs">{label}</span>
        <span className="text-text-200 text-xs">{value}</span>
      </div>
    </div>
  );

  if (!tooltip) return body;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{body}</TooltipTrigger>
      <TooltipContent
        side="bottom"
        sideOffset={4}
        className="bg-background-100 text-text-200 rounded-sm p-1 text-xs"
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

export function TokenCardFallback({
  i,
  children,
}: {
  i: number;
  children?: React.ReactNode;
}) {
  return (
    <article className="group bg-background-100 relative flex h-full min-h-44.5 w-full flex-col border-b border-white/5 hover:bg-white/10">
      <div className="relative flex flex-col gap-4 p-4">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1">
            <SquareProgress progress={0} size={74}>
              <Loading
                className="relative h-18 w-18 shrink-0 cursor-pointer overflow-hidden rounded-md"
                i={0}
              ></Loading>
            </SquareProgress>

            <span className="text-text-200 text-xs font-medium">
              <Loading
                className="relative h-2.5 w-18 shrink-0 cursor-pointer overflow-hidden rounded-full"
                i={1}
              ></Loading>
            </span>
          </div>

          <div className="flex w-full flex-col gap-2">
            <div className="text-text-100 w-full text-[16px] font-medium">
              <Loading
                className="relative h-6 w-18 shrink-0 cursor-pointer overflow-hidden rounded-full"
                i={2}
              ></Loading>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-rage-100 font-mono text-[15px] font-medium">
                <Loading
                  className="relative h-5.5 w-18 shrink-0 cursor-pointer overflow-hidden rounded-full"
                  i={3}
                ></Loading>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:h-8">
          <div className="flex flex-wrap items-center gap-1 rounded-full border border-white/5 px-1 py-1">
            <Loading
              className="relative h-4 w-15 shrink-0 cursor-pointer overflow-hidden rounded-md"
              i={4}
            ></Loading>

            <Loading
              className="relative h-4 w-15 shrink-0 cursor-pointer overflow-hidden rounded-md"
              i={5}
            ></Loading>

            <Loading
              className="relative h-4 w-15 shrink-0 cursor-pointer overflow-hidden rounded-md"
              i={6}
            ></Loading>

            <Loading
              className="relative h-4 w-15 shrink-0 cursor-pointer overflow-hidden rounded-md"
              i={7}
            ></Loading>
          </div>

          <div className="xxs:justify-end flex flex-1 items-center">
            {children ? children : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function Fallback({
  count = 12,
  isEarnPage,
}: {
  count?: number;
  isEarnPage?: boolean;
}) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <li key={`loading-card-${i}`} className="w-full space-y-4">
          <TokenCardFallback i={i}>
            {isEarnPage ? (
              <Loading className="h-8.5 w-18.5 rounded-full" i={i} />
            ) : (
              <Loading className="h-6 w-30 rounded-full" i={i} />
            )}
          </TokenCardFallback>
        </li>
      ))}
    </>
  );
}

function Home({ token }: { token: TokenCard }) {
  return (
    <TokenCard
      token={token}
      action={<Blink mint={token.id} />}
      link={
        <Link
          href={{
            pathname: `/${token.creatorId}`,
          }}
          as={`/${token.creatorId}`}
          className="size-4"
          prefetch={false}
        >
          <Icon className="size-4 text-cyan-400" name="creator" />
        </Link>
      }
    />
  );
}

function Earn({ token }: { token: TokenCard }) {
  return (
    <TokenCard token={token} action={<HarvestYieldForm token={token} />} />
  );
}

const Profile = TokenCard;

export { Earn, Fallback, Home, Profile };
