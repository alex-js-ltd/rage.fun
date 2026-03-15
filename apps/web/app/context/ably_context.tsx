"use client";

import React, { type ReactNode } from "react";
import * as Ably from "ably";
import { AblyProvider as Provider, ChannelProvider } from "ably/react";

const client = new Ably.Realtime({ authUrl: `/api/ably`, authMethod: "POST" });

export function AblyProvider({ children }: { children: ReactNode }) {
  return <Provider client={client}>{children}</Provider>;
}

export function SignatureProvider({ children }: { children: ReactNode }) {
  return (
    <ChannelProvider channelName="signatureEvent">{children}</ChannelProvider>
  );
}

export function SwapProvider({ children }: { children: ReactNode }) {
  return <ChannelProvider channelName="swapEvent">{children}</ChannelProvider>;
}

export function UpdateProvider({ children }: { children: ReactNode }) {
  return (
    <ChannelProvider channelName="updateEvent">{children}</ChannelProvider>
  );
}

export function SwapConfigProvider({ children }: { children: ReactNode }) {
  return (
    <ChannelProvider channelName="swapConfigEvent">{children}</ChannelProvider>
  );
}

export function HoldersProvider({ children }: { children: ReactNode }) {
  return (
    <ChannelProvider channelName="holdersEvent">{children}</ChannelProvider>
  );
}

export function CommentProvider({ children }: { children: ReactNode }) {
  return (
    <ChannelProvider channelName="commentEvent">{children}</ChannelProvider>
  );
}

export function TransactionProvider({ children }: { children: ReactNode }) {
  return (
    <ChannelProvider channelName="transactionEvent">{children}</ChannelProvider>
  );
}

export function TrendingProvider({ children }: { children: ReactNode }) {
  return (
    <ChannelProvider channelName="trendingEvent">{children}</ChannelProvider>
  );
}

export function PnLProvider({ children }: { children: ReactNode }) {
  return <ChannelProvider channelName="pnlEvent">{children}</ChannelProvider>;
}

export function RealTime({ children }: { children: ReactNode }) {
  return (
    <AblyProvider>
      <SignatureProvider>
        <SwapProvider>
          <UpdateProvider>
            <SwapConfigProvider>
              <HoldersProvider>
                <CommentProvider>
                  <TransactionProvider>
                    <TrendingProvider>
                      <PnLProvider>{children}</PnLProvider>
                    </TrendingProvider>
                  </TransactionProvider>
                </CommentProvider>
              </HoldersProvider>
            </SwapConfigProvider>
          </UpdateProvider>
        </SwapProvider>
      </SignatureProvider>
    </AblyProvider>
  );
}
