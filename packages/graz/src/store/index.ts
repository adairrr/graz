import type { ChainInfo, Keplr, Key } from "@keplr-wallet/types";
import type { CapsuleProvider } from "@leapwallet/cosmos-social-login-capsule-provider";
import type { ISignClient, SignClientTypes } from "@walletconnect/types";
import type { Web3ModalConfig } from "@web3modal/standalone";
import { create } from "zustand";
import type { PersistOptions } from "zustand/middleware";
import { createJSONStorage } from "zustand/middleware";
import { persist, subscribeWithSelector } from "zustand/middleware";

import type { Dictionary } from "../types/core";
import { WalletType } from "../types/wallet";

export interface ChainConfig {
  path?: string;
  rpcHeaders?: Dictionary;
  gas?: {
    price: string;
    denom: string;
  };
}
export interface WalletConnectStore {
  options: SignClientTypes.Options | null;
  web3Modal?: Pick<Web3ModalConfig, "themeVariables" | "themeMode" | "privacyPolicyUrl" | "termsOfServiceUrl"> | null;
}

export interface CapsuleConfig {
  apiKey: string;
  env: "DEV" | "SANDBOX" | "BETA" | "PROD";
}

export interface CapsuleState {
  showModal: boolean;
  chainId?: string[];
}
export interface GrazInternalStore {
  recentChainIds: string[] | null;
  capsuleConfig: CapsuleConfig | null;
  capsuleState: CapsuleState | null;
  chains: ChainInfo[] | null;
  chainsConfig: Record<string, ChainConfig> | null;
  /**
   * Graz will use this number to determine how many concurrent requests to make when using `multiChain` args in hooks.
   * Defaults to 3.
   */
  multiChainFetchConcurrency: number;
  walletType: WalletType;
  walletConnect: WalletConnectStore | null;
  walletDefaultOptions: Keplr["defaultOptions"] | null;
  _notFoundFn: () => void;
  _reconnect: boolean;
  _reconnectConnector: WalletType | null;
  _onReconnectFailed: () => void;
}

export interface GrazSessionStore {
  accounts: Record<string, Key> | null;
  activeChainIds: string[] | null;
  status: "connected" | "connecting" | "reconnecting" | "disconnected";
  wcSignClients: Map<WalletType, ISignClient>;
  capsuleClient: CapsuleProvider | null;
}

export type GrazSessionPersistedStore = Pick<GrazSessionStore, "accounts" | "activeChainIds">;

export type GrazInternalPersistedStore = Pick<
  GrazInternalStore,
  "recentChainIds" | "_reconnect" | "_reconnectConnector" | "walletType"
>;

export const grazInternalDefaultValues: GrazInternalStore = {
  recentChainIds: null,
  chains: null,
  chainsConfig: null,
  capsuleConfig: null,
  capsuleState: null,
  multiChainFetchConcurrency: 3,
  walletType: WalletType.KEPLR,
  walletConnect: {
    options: null,
    web3Modal: null,
  },
  walletDefaultOptions: null,
  _notFoundFn: () => null,
  _onReconnectFailed: () => null,
  _reconnect: false,
  _reconnectConnector: null,
};

export const grazSessionDefaultValues: GrazSessionStore = {
  accounts: null,
  activeChainIds: null,
  status: "disconnected",
  wcSignClients: new Map(),
  capsuleClient: null,
};

const sessionOptions: PersistOptions<GrazSessionStore, GrazSessionPersistedStore> = {
  name: "graz-session",
  version: 2,
  partialize: (x) => ({
    accounts: x.accounts,
    activeChainIds: x.activeChainIds,
  }),
  storage: createJSONStorage(() => sessionStorage),
};

const persistOptions: PersistOptions<GrazInternalStore, GrazInternalPersistedStore> = {
  name: "graz-internal",
  partialize: (x) => ({
    recentChainIds: x.recentChainIds,
    _reconnect: x._reconnect,
    _reconnectConnector: x._reconnectConnector,
    walletType: x.walletType,
  }),
  version: 2,
};

export const useGrazSessionStore = create(
  subscribeWithSelector(persist(() => grazSessionDefaultValues, sessionOptions)),
);

export const useGrazInternalStore = create(
  subscribeWithSelector(persist(() => grazInternalDefaultValues, persistOptions)),
);
