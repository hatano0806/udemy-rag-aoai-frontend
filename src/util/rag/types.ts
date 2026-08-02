export type RagChoice = {
  message?: {
    content?: string | null;
    role?: string;
  };
  index?: number;
  finishReason?: string;
};

export type RagProviderType = "azure-search-openai" | "ms-foundry";

export interface RagProvider {
  getOnYourData(message: string): Promise<RagChoice[]>;
}
