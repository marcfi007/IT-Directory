import React, { createContext, useContext, ReactNode } from "react";
import { useMarkets } from "@/hooks/useMarkets";

type MarketContextType = ReturnType<typeof useMarkets>;

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export function MarketProvider({ children }: { children: ReactNode }) {
  const marketData = useMarkets();

  return (
    <MarketContext.Provider value={marketData}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarketContext() {
  const context = useContext(MarketContext);
  if (context === undefined) {
    throw new Error("useMarketContext must be used within a MarketProvider");
  }
  return context;
}
