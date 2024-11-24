import type { AminoSignResponse } from "@cosmjs/amino";
import { fromBech32 } from "@cosmjs/encoding";
import type { DirectSignResponse } from "@cosmjs/proto-signing";
import Long from "long";

import { useGrazInternalStore } from "../../store";
import type { Key, SignAminoParams, SignDirectParams, Wallet } from "../../types/wallet";
import { clearSession } from ".";
import { ChainInfo } from "@vectis/extension-client";

/**
 * Function to return {@link Wallet} object and throws and error if it does not exist on `window`.
 *
 * @example
 * ```ts
 * try {
 *   const vectis = getVectis();
 * } catch (error: Error) {
 *   console.error(error.message);
 * }
 * ```
 *
 *
 */
export const getVectis = (): Wallet => {
  if (typeof window.vectis !== "undefined") {
    const vectis = window.vectis.cosmos;
    const subscription: (reconnect: () => void) => () => void = (reconnect) => {
      const listener = () => {
        clearSession();
        reconnect();
      };
      window.addEventListener("vectis_accountChanged", listener);
      return () => {
        window.removeEventListener("vectis_accountChanged", listener);
      };
    };
    const getOfflineSignerOnlyAmino = (...args: Parameters<Wallet["getOfflineSignerOnlyAmino"]>) => {
      const chainId = args[0];
      return vectis.getOfflineSignerAmino(chainId);
    };

    const experimentalSuggestChain = async (...args: Parameters<Wallet["experimentalSuggestChain"]>) => {
      const [chainInfo] = args;
      if (!chainInfo.bech32Config) throw new Error("Bech32Config is required");
      if (!chainInfo.stakeCurrency) throw new Error("StakeCurrency is required");
      const adaptChainInfo: ChainInfo = {
        rpcUrl: chainInfo.rpc,
        restUrl: chainInfo.rest,
        prettyName: chainInfo.chainName.replace(" ", ""),
        bech32Prefix: chainInfo.bech32Config?.bech32PrefixAccAddr,
        currencies: chainInfo.currencies,
        feeCurrencies: chainInfo.feeCurrencies,
        chainId: chainInfo.chainId,
        chainName: chainInfo.chainName,
        bip44: chainInfo.bip44,
        stakeCurrency: chainInfo.stakeCurrency,
        features: chainInfo.features,
      };
      return vectis.suggestChains([adaptChainInfo]);
    };

    const getKey = async (chainId: string): Promise<Key> => {
      const key = await vectis.getKey(chainId);
      return {
        address: fromBech32(key.address).data,
        algo: key.algo,
        bech32Address: key.address,
        name: key.name,
        pubKey: key.pubKey,
        isKeystone: false,
        isNanoLedger: key.isNanoLedger,
      };
    };

    const signDirect = async (...args: SignDirectParams): Promise<DirectSignResponse> => {
      const { 1: signer, 2: signDoc } = args;
      return vectis.signDirect(signer, {
        bodyBytes: signDoc.bodyBytes || Uint8Array.from([]),
        authInfoBytes: signDoc.authInfoBytes || Uint8Array.from([]),
        accountNumber: Long.fromString(signDoc.accountNumber?.toString() || "", false),
        chainId: signDoc.chainId || "",
      });
    };

    const signAmino = async (...args: SignAminoParams): Promise<AminoSignResponse> => {
      const { 1: signer, 2: signDoc } = args;
      return vectis.signAmino(signer, signDoc);
    };

    return {
      enable: (chainId: string | string[]) => vectis.enable(chainId),
      getOfflineSigner: (chainId: string) => vectis.getOfflineSigner(chainId),
      getOfflineSignerAuto: (chainId: string) => vectis.getOfflineSignerAuto(chainId),
      getKey,
      subscription,
      getOfflineSignerOnlyAmino,
      experimentalSuggestChain,
      signDirect,
      signAmino,
    };
  }

  useGrazInternalStore.getState()._notFoundFn();
  throw new Error("window.vectis is not defined");
};
