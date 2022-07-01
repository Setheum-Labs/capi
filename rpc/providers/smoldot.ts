import type * as smoldot from "../../_deps/smoldot.ts";
import { Beacon } from "../../Beacon.ts";
import { AnyMethods, ErrorCtor } from "../../util/mod.ts";
import * as B from "../Base.ts";
import { IngressMessage, InitMessage } from "../messages.ts";

export class SmoldotBeacon<M extends AnyMethods> extends Beacon<string, M> {}
export type SmoldotClientHooks<M extends AnyMethods> = B.ClientHooks<M, SmoldotInternalError>;

export async function smoldotClient<M extends AnyMethods>(
  beacon: SmoldotBeacon<M>,
  hooks?: SmoldotClientHooks<M>,
): Promise<SmoldotClient<M> | FailedToStartSmoldotError | FailedToAddChainError> {
  const smoldotInstance = await ensureInstance();
  if (smoldotInstance instanceof Error) {
    return smoldotInstance;
  }
  const onMessageContainer: { onMessage?: (message: unknown) => void } = {};
  try {
    // TODO: wire up `onError`
    const chain = await smoldotInstance.addChain({
      chainSpec: beacon.discoveryValue,
      jsonRpcCallback: (response) => {
        onMessageContainer.onMessage?.(response);
      },
    });
    return new SmoldotClient(onMessageContainer, chain.remove, hooks);
  } catch (_e) {
    return new FailedToAddChainError();
  }
}

export class SmoldotClient<M extends AnyMethods>
  extends B.Client<M, SmoldotInternalError, string, unknown>
{
  #chain?: smoldot.Chain;

  constructor(
    onMessageContainer: {
      onMessage?: B.Client<M, SmoldotInternalError, string, unknown>["onMessage"];
    },
    readonly remove: () => void,
    hooks?: SmoldotClientHooks<M>,
  ) {
    super(hooks);
    onMessageContainer.onMessage = this.onMessage;
  }

  _send = (egressMessage: InitMessage<M>): void => {
    this.#chain?.sendJsonRpc(JSON.stringify(egressMessage));
  };

  parseIngressMessage = (
    rawIngressMessage: string,
  ): IngressMessage<M> | B.ParseRawIngressMessageError => {
    try {
      return JSON.parse(rawIngressMessage);
    } catch (_e) {
      return new B.ParseRawIngressMessageError();
    }
  };

  parseError = (_e: unknown): SmoldotInternalError => {
    return new SmoldotInternalError();
  };

  _close = async (): Promise<undefined | FailedToRemoveChainError> => {
    try {
      this.remove();
      return;
    } catch (e) {
      if (e instanceof Error) {
        // TODO: handle the following in a special manner?
        // - `AlreadyDestroyedError`
        // - `CrashError`
      }
      return new FailedToRemoveChainError();
    }
  };
}

const _state: { smoldotInstance?: smoldot.Client } = {};

async function ensureInstance(): Promise<smoldot.Client | FailedToStartSmoldotError> {
  if (!_state.smoldotInstance) {
    try {
      const smoldot = await import("../../_deps/smoldot.ts");
      _state.smoldotInstance = smoldot.start();
    } catch (_e) {
      return new FailedToStartSmoldotError();
    }
  }
  return _state.smoldotInstance;
}

export class FailedToStartSmoldotError extends ErrorCtor("FailedToStartSmoldot") {}
export class FailedToAddChainError extends ErrorCtor("FailedToAddChain") {}
export class SmoldotInternalError extends ErrorCtor("SmoldotInternal") {}
export class FailedToRemoveChainError extends ErrorCtor("FailedToRemoveChain") {}