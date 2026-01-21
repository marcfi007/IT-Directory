import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Market,
  MarketInfo,
  ActivityLog,
  CodeHistoryEntry,
  FieldHistory,
} from "@/types";

const MARKETS_KEY = "@markets";
const MARKET_INFOS_KEY = "@market_infos";
const ACTIVITY_LOGS_KEY = "@activity_logs";

const DEMO_MARKETS: Market[] = [
  {
    id: "1",
    wawiNumber: "2001",
    name: "REWE Center Berlin Mitte",
    address: "Alexanderplatz 5",
    city: "Berlin",
    contactPerson: "Herr Mueller",
    parkingInfo: "Tiefgarage Einfahrt links, P2",
    doorCodes: "encrypted:4521",
    egateAccess: "Mitarbeiter-Badge + PIN",
    kassenBarcode: "KASSE2001ALEX",
    exitGateBarcode: "EXIT2001ALEX",
    barcodeInfo: "Scanner Typ A, Wareneingang hinten",
    serverLocation: "Serverraum UG, Rack 3",
    switchRouterLocation: "Hauptverteiler EG, Schrank B",
    specialNotes: "VLAN 10 fuer Kassen, VLAN 20 fuer Office",
    freeTextNotes: "24/7 Zugang moeglich mit Voranmeldung beim Marktleiter",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T14:45:00Z",
    createdBy: "1",
  },
  {
    id: "2",
    wawiNumber: "2002",
    name: "REWE Hamburg Eimsbuettel",
    address: "Osterstrasse 120",
    city: "Hamburg",
    contactPerson: "Frau Schmidt",
    parkingInfo: "Hinterhof Zufahrt, Code: siehe Tuercodes",
    doorCodes: "encrypted:7832",
    egateAccess: "Mitarbeitereingang Seite",
    kassenBarcode: "KASSE2002EIMS",
    exitGateBarcode: "EXIT2002EIMS",
    barcodeInfo: "SCO Scanner Typ B",
    serverLocation: "IT-Raum 2. OG",
    switchRouterLocation: "Netzwerkschrank jede Etage",
    specialNotes: "RedHat Server, Windows Clients",
    freeTextNotes: "Kontakt IT-Leiter vor Ort empfohlen",
    createdAt: "2024-01-10T09:00:00Z",
    updatedAt: "2024-01-18T11:20:00Z",
    createdBy: "1",
  },
  {
    id: "3",
    wawiNumber: "2003",
    name: "PENNY Muenchen Schwabing",
    address: "Leopoldstrasse 80",
    city: "Muenchen",
    contactPerson: "Herr Weber",
    parkingInfo: "Kundenparkplaetze vor dem Markt",
    doorCodes: "encrypted:1234",
    egateAccess: "Personaleingang hinten",
    kassenBarcode: "KASSE2003SCHW",
    exitGateBarcode: "EXIT2003SCHW",
    barcodeInfo: "Alle Scanner Typ C",
    serverLocation: "Keller Raum 005",
    switchRouterLocation: "Zentral im Keller",
    specialNotes: "Fiber Anbindung, 10Gbit Backbone",
    freeTextNotes: "",
    createdAt: "2024-01-12T15:00:00Z",
    updatedAt: "2024-01-12T15:00:00Z",
    createdBy: "2",
  },
  {
    id: "4",
    wawiNumber: "2004",
    name: "REWE Koeln Ehrenfeld",
    address: "Venloer Strasse 200",
    city: "Koeln",
    parkingInfo: "Parkplaetze im Hinterhof",
    serverLocation: "Dachgeschoss Technikraum",
    kvFlag: true,
    kvReason: "Haeufige Fehlbedienung durch Marktpersonal",
    createdAt: "2024-01-08T08:00:00Z",
    updatedAt: "2024-01-08T08:00:00Z",
    createdBy: "3",
  },
  {
    id: "5",
    wawiNumber: "2005",
    name: "toom Baumarkt Frankfurt",
    address: "Hanauer Landstrasse 150",
    city: "Frankfurt",
    contactPerson: "Herr Becker",
    parkingInfo: "Grosser Kundenparkplatz",
    doorCodes: "encrypted:9999",
    egateAccess: "Haupteingang mit Badge",
    kassenBarcode: "KASSE2005FFMHANA",
    serverLocation: "Buero 1. OG",
    switchRouterLocation: "Pro Etage ein Verteiler",
    specialNotes: "Citrix Umgebung",
    createdAt: "2024-01-05T12:00:00Z",
    updatedAt: "2024-01-19T16:30:00Z",
    createdBy: "1",
  },
  {
    id: "6",
    wawiNumber: "2006",
    name: "REWE City Duesseldorf",
    address: "Koenigsallee 45",
    city: "Duesseldorf",
    contactPerson: "Frau Klein",
    parkingInfo: "Keine eigenen Parkplaetze, Tiefgarage nebenan",
    doorCodes: "encrypted:5566",
    egateAccess: "Keycard System",
    kassenBarcode: "KASSE2006KOE",
    exitGateBarcode: "EXIT2006KOE",
    serverLocation: "Lagerraum hinten",
    specialNotes: "Kleiner Markt, kompakte IT",
    createdAt: "2024-01-03T08:00:00Z",
    updatedAt: "2024-01-03T08:00:00Z",
    createdBy: "1",
  },
];

export function useMarkets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [marketInfos, setMarketInfos] = useState<MarketInfo[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedMarkets, storedInfos, storedLogs] = await Promise.all([
        AsyncStorage.getItem(MARKETS_KEY),
        AsyncStorage.getItem(MARKET_INFOS_KEY),
        AsyncStorage.getItem(ACTIVITY_LOGS_KEY),
      ]);

      if (storedMarkets) {
        setMarkets(JSON.parse(storedMarkets));
      } else {
        setMarkets(DEMO_MARKETS);
        await AsyncStorage.setItem(MARKETS_KEY, JSON.stringify(DEMO_MARKETS));
      }

      if (storedInfos) {
        setMarketInfos(JSON.parse(storedInfos));
      }

      if (storedLogs) {
        setActivityLogs(JSON.parse(storedLogs));
      }
    } catch (error) {
      setMarkets(DEMO_MARKETS);
    } finally {
      setIsLoading(false);
    }
  };

  const addActivityLog = useCallback(
    async (log: Omit<ActivityLog, "id" | "timestamp">) => {
      const newLog: ActivityLog = {
        ...log,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };
      const updatedLogs = [newLog, ...activityLogs];
      setActivityLogs(updatedLogs);
      await AsyncStorage.setItem(
        ACTIVITY_LOGS_KEY,
        JSON.stringify(updatedLogs),
      );
    },
    [activityLogs],
  );

  const addMarketInfo = useCallback(
    async (info: Omit<MarketInfo, "id" | "createdAt" | "status">) => {
      const newInfo: MarketInfo = {
        ...info,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: "pending",
        barcodeValue: info.barcodeValue,
      };
      const updatedInfos = [newInfo, ...marketInfos];
      setMarketInfos(updatedInfos);
      await AsyncStorage.setItem(
        MARKET_INFOS_KEY,
        JSON.stringify(updatedInfos),
      );

      await addActivityLog({
        action: "add",
        description:
          info.category === "barcode"
            ? `Barcode hinzugefuegt: ${info.barcodeValue}`
            : `Info hinzugefuegt: ${info.category}`,
        marketId: info.marketId,
        marketName: markets.find((m) => m.id === info.marketId)?.name,
        userId: info.createdBy,
        userName: info.createdByName,
      });

      return newInfo;
    },
    [marketInfos, markets, addActivityLog],
  );

  const approveMarketInfo = useCallback(
    async (infoId: string, userId: string, userName: string) => {
      const updatedInfos = marketInfos.map((info) =>
        info.id === infoId ? { ...info, status: "approved" as const } : info,
      );
      setMarketInfos(updatedInfos);
      await AsyncStorage.setItem(
        MARKET_INFOS_KEY,
        JSON.stringify(updatedInfos),
      );

      const info = marketInfos.find((i) => i.id === infoId);
      if (info) {
        await addActivityLog({
          action: "approve",
          description: `Info freigegeben: ${info.category}`,
          marketId: info.marketId,
          marketName: markets.find((m) => m.id === info.marketId)?.name,
          userId,
          userName,
        });
      }
    },
    [marketInfos, markets, addActivityLog],
  );

  const rejectMarketInfo = useCallback(
    async (infoId: string, userId: string, userName: string) => {
      const updatedInfos = marketInfos.map((info) =>
        info.id === infoId ? { ...info, status: "rejected" as const } : info,
      );
      setMarketInfos(updatedInfos);
      await AsyncStorage.setItem(
        MARKET_INFOS_KEY,
        JSON.stringify(updatedInfos),
      );

      const info = marketInfos.find((i) => i.id === infoId);
      if (info) {
        await addActivityLog({
          action: "reject",
          description: `Info abgelehnt: ${info.category}`,
          marketId: info.marketId,
          marketName: markets.find((m) => m.id === info.marketId)?.name,
          userId,
          userName,
        });
      }
    },
    [marketInfos, markets, addActivityLog],
  );

  const filteredMarkets = markets.filter((market) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      market.wawiNumber.toLowerCase().includes(query) ||
      market.name.toLowerCase().includes(query) ||
      market.address.toLowerCase().includes(query) ||
      market.city.toLowerCase().includes(query)
    );
  });

  const getMarketById = useCallback(
    (id: string) => markets.find((m) => m.id === id),
    [markets],
  );

  const getMarketInfos = useCallback(
    (marketId: string) => marketInfos.filter((i) => i.marketId === marketId),
    [marketInfos],
  );

  const getPendingInfos = useCallback(
    () => marketInfos.filter((i) => i.status === "pending"),
    [marketInfos],
  );

  const addMarket = useCallback(
    async (
      marketData: Omit<Market, "id" | "createdAt" | "updatedAt">,
      userId: string,
      userName: string,
    ) => {
      const newMarket: Market = {
        ...marketData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedMarkets = [newMarket, ...markets];
      setMarkets(updatedMarkets);
      await AsyncStorage.setItem(MARKETS_KEY, JSON.stringify(updatedMarkets));

      await addActivityLog({
        action: "add",
        description: `Neuer Markt angelegt: ${marketData.name}`,
        marketId: newMarket.id,
        marketName: marketData.name,
        userId,
        userName,
      });

      return newMarket;
    },
    [markets, addActivityLog],
  );

  const updateMarketField = useCallback(
    async (
      marketId: string,
      fieldName: keyof Market,
      newValue: string,
      userId: string,
      userName: string,
      fieldLabel: string,
    ) => {
      const market = markets.find((m) => m.id === marketId);
      if (!market) return;

      const oldValue = market[fieldName] as string | undefined;
      const historyKey = `${fieldName}History` as keyof Market;

      const historyEntry: FieldHistory = {
        value: oldValue || "",
        date: new Date().toLocaleDateString("de-DE"),
        user: userName,
      };

      const updatedMarkets = markets.map((m) => {
        if (m.id === marketId) {
          const existingHistory =
            (m[historyKey] as FieldHistory[] | undefined) || [];
          return {
            ...m,
            [fieldName]: newValue,
            [historyKey]: oldValue
              ? [historyEntry, ...existingHistory]
              : existingHistory,
            updatedAt: new Date().toISOString(),
          };
        }
        return m;
      });

      setMarkets(updatedMarkets);
      await AsyncStorage.setItem(MARKETS_KEY, JSON.stringify(updatedMarkets));

      const isSecure = fieldName === "doorCodes";
      await addActivityLog({
        action: "edit",
        description: `${fieldLabel} aktualisiert`,
        marketId,
        marketName: market.name,
        userId,
        userName,
        previousValue: isSecure ? "****" : oldValue,
        newValue: isSecure ? "****" : newValue,
      });
    },
    [markets, addActivityLog],
  );

  const updateDoorCode = useCallback(
    async (
      marketId: string,
      newCode: string,
      userId: string,
      userName: string,
    ) => {
      await updateMarketField(
        marketId,
        "doorCodes",
        newCode,
        userId,
        userName,
        "Tuercode",
      );
    },
    [updateMarketField],
  );

  const deleteMarket = useCallback(
    async (marketId: string, userId: string, userName: string) => {
      const market = markets.find((m) => m.id === marketId);
      if (!market) return;

      const updatedMarkets = markets.filter((m) => m.id !== marketId);
      setMarkets(updatedMarkets);
      await AsyncStorage.setItem(MARKETS_KEY, JSON.stringify(updatedMarkets));

      // Remove associated market infos
      const updatedInfos = marketInfos.filter((i) => i.marketId !== marketId);
      setMarketInfos(updatedInfos);
      await AsyncStorage.setItem(
        MARKET_INFOS_KEY,
        JSON.stringify(updatedInfos),
      );

      await addActivityLog({
        action: "delete",
        description: `Markt geloescht: ${market.name}`,
        marketId,
        marketName: market.name,
        userId,
        userName,
      });
    },
    [markets, marketInfos, addActivityLog],
  );

  const updateMarket = useCallback(
    async (
      marketId: string,
      marketData: Partial<Omit<Market, "id" | "createdAt" | "createdBy">>,
      userId: string,
      userName: string,
    ) => {
      const market = markets.find((m) => m.id === marketId);
      if (!market) return;

      const updatedMarkets = markets.map((m) => {
        if (m.id === marketId) {
          return {
            ...m,
            ...marketData,
            updatedAt: new Date().toISOString(),
          };
        }
        return m;
      });

      setMarkets(updatedMarkets);
      await AsyncStorage.setItem(MARKETS_KEY, JSON.stringify(updatedMarkets));

      await addActivityLog({
        action: "edit",
        description: `Markt bearbeitet: ${market.name}`,
        marketId,
        marketName: marketData.name || market.name,
        userId,
        userName,
      });

      return updatedMarkets.find((m) => m.id === marketId);
    },
    [markets, addActivityLog],
  );

  const deleteMarketInfo = useCallback(
    async (infoId: string, userId: string, userName: string) => {
      const info = marketInfos.find((i) => i.id === infoId);
      if (!info) return;

      const updatedInfos = marketInfos.filter((i) => i.id !== infoId);
      setMarketInfos(updatedInfos);
      await AsyncStorage.setItem(
        MARKET_INFOS_KEY,
        JSON.stringify(updatedInfos),
      );

      await addActivityLog({
        action: "delete",
        description: `Info geloescht: ${info.category}`,
        marketId: info.marketId,
        marketName: markets.find((m) => m.id === info.marketId)?.name,
        userId,
        userName,
      });
    },
    [marketInfos, markets, addActivityLog],
  );

  const refresh = useCallback(() => {
    setIsLoading(true);
    loadData();
  }, []);

  return {
    markets: filteredMarkets,
    allMarkets: markets,
    marketInfos,
    activityLogs,
    isLoading,
    searchQuery,
    setSearchQuery,
    addMarketInfo,
    approveMarketInfo,
    rejectMarketInfo,
    addActivityLog,
    getMarketById,
    getMarketInfos,
    getPendingInfos,
    addMarket,
    updateMarketField,
    updateDoorCode,
    deleteMarket,
    updateMarket,
    deleteMarketInfo,
    refresh,
  };
}
