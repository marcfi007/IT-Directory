import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Market, MarketInfo, ActivityLog } from "@/types";

const MARKETS_KEY = "@markets";
const MARKET_INFOS_KEY = "@market_infos";
const ACTIVITY_LOGS_KEY = "@activity_logs";

const DEMO_MARKETS: Market[] = [
  {
    id: "1",
    wawiNumber: "1001",
    name: "MediaMarkt Berlin Alexanderplatz",
    address: "Alexanderplatz 1",
    city: "Berlin",
    contactPerson: "Herr Mueller",
    parkingInfo: "Tiefgarage Einfahrt links, P3",
    doorCodes: "encrypted:4521",
    egateAccess: "Badge + PIN",
    egateBarcode: "MM1001ALEX",
    barcodeInfo: "Scanner Typ A, Exit-Gate rechts",
    serverLocation: "Serverraum UG, Rack 3",
    switchRouterLocation: "Hauptverteiler EG, Schrank B",
    specialNotes: "VLAN 10 fuer Kassen, VLAN 20 fuer Office",
    freeTextNotes: "24/7 Zugang moeglich mit Voranmeldung",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T14:45:00Z",
    createdBy: "1",
  },
  {
    id: "2",
    wawiNumber: "1002",
    name: "Saturn Hamburg Moenckebergstrasse",
    address: "Moenckebergstrasse 1",
    city: "Hamburg",
    contactPerson: "Frau Schmidt",
    parkingInfo: "Hinterhof Zufahrt, Code: siehe Tuercodes",
    doorCodes: "encrypted:7832",
    egateAccess: "Mitarbeitereingang Seite",
    egateBarcode: "SAT1002MBERG",
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
    wawiNumber: "1003",
    name: "MediaMarkt Muenchen Stachus",
    address: "Karlsplatz 25",
    city: "Muenchen",
    contactPerson: "Herr Weber",
    parkingInfo: "Oeffentliche TG nebenan",
    doorCodes: "encrypted:1234",
    egateAccess: "Personaleingang hinten",
    egateBarcode: "MM1003STACH",
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
    wawiNumber: "1004",
    name: "Saturn Koeln Hohe Strasse",
    address: "Hohe Strasse 100",
    city: "Koeln",
    parkingInfo: "Keine eigenen Parkplaetze",
    serverLocation: "Dachgeschoss Technikraum",
    createdAt: "2024-01-08T08:00:00Z",
    updatedAt: "2024-01-08T08:00:00Z",
    createdBy: "3",
  },
  {
    id: "5",
    wawiNumber: "1005",
    name: "MediaMarkt Frankfurt Zeil",
    address: "Zeil 112-114",
    city: "Frankfurt",
    contactPerson: "Herr Becker",
    parkingInfo: "Parkhaus Zeilgalerie",
    doorCodes: "encrypted:9999",
    egateAccess: "Haupteingang mit Badge",
    serverLocation: "UG Technikzentrale",
    switchRouterLocation: "Pro Etage ein Verteiler",
    specialNotes: "Citrix Umgebung",
    createdAt: "2024-01-05T12:00:00Z",
    updatedAt: "2024-01-19T16:30:00Z",
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
      await AsyncStorage.setItem(ACTIVITY_LOGS_KEY, JSON.stringify(updatedLogs));
    },
    [activityLogs]
  );

  const addMarketInfo = useCallback(
    async (info: Omit<MarketInfo, "id" | "createdAt" | "status">) => {
      const newInfo: MarketInfo = {
        ...info,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: "pending",
      };
      const updatedInfos = [newInfo, ...marketInfos];
      setMarketInfos(updatedInfos);
      await AsyncStorage.setItem(MARKET_INFOS_KEY, JSON.stringify(updatedInfos));

      await addActivityLog({
        action: "add",
        description: `Info hinzugefuegt: ${info.category}`,
        marketId: info.marketId,
        marketName: markets.find((m) => m.id === info.marketId)?.name,
        userId: info.createdBy,
        userName: info.createdByName,
      });

      return newInfo;
    },
    [marketInfos, markets, addActivityLog]
  );

  const approveMarketInfo = useCallback(
    async (infoId: string, userId: string, userName: string) => {
      const updatedInfos = marketInfos.map((info) =>
        info.id === infoId ? { ...info, status: "approved" as const } : info
      );
      setMarketInfos(updatedInfos);
      await AsyncStorage.setItem(MARKET_INFOS_KEY, JSON.stringify(updatedInfos));

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
    [marketInfos, markets, addActivityLog]
  );

  const rejectMarketInfo = useCallback(
    async (infoId: string, userId: string, userName: string) => {
      const updatedInfos = marketInfos.map((info) =>
        info.id === infoId ? { ...info, status: "rejected" as const } : info
      );
      setMarketInfos(updatedInfos);
      await AsyncStorage.setItem(MARKET_INFOS_KEY, JSON.stringify(updatedInfos));

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
    [marketInfos, markets, addActivityLog]
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
    [markets]
  );

  const getMarketInfos = useCallback(
    (marketId: string) => marketInfos.filter((i) => i.marketId === marketId),
    [marketInfos]
  );

  const getPendingInfos = useCallback(
    () => marketInfos.filter((i) => i.status === "pending"),
    [marketInfos]
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
    refresh,
  };
}
