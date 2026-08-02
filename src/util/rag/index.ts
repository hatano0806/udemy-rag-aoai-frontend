import { AzureSearchOpenAIRagProvider } from "./azureSearchOpenai";
import { MsFoundryRagProvider } from "./msFoundry";
import type { RagProvider, RagProviderType } from "./types";

export type { RagChoice, RagProvider, RagProviderType } from "./types";

const providers: Record<RagProviderType, () => RagProvider> = {
  "azure-search-openai": () => new AzureSearchOpenAIRagProvider(),
  "ms-foundry": () => new MsFoundryRagProvider(),
};

export const getRagProvider = (providerType?: RagProviderType): RagProvider => {
  const type =
    providerType ??
    (process.env.RAG_PROVIDER as RagProviderType | undefined) ??
    "azure-search-openai";

  const createProvider = providers[type];
  if (!createProvider) {
    throw new Error(`未対応の RAG プロバイダーです: ${type}`);
  }

  return createProvider();
};
