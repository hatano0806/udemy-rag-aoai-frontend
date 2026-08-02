import type { RagChoice, RagProvider } from "./types";
import { DefaultAzureCredential } from "@azure/identity";
import { AIProjectClient } from "@azure/ai-projects";

/**
 * Microsoft Foundry 経由で RAG を実行するプロバイダー。
 *
 * 認証は Entra ID のみ対応（API キー不可）。
 * ローカル開発では Azure CLI を入れたうえで `az login` が必要。
 * @see https://aka.ms/azsdk/js/identity/defaultazurecredential
 */
export class MsFoundryRagProvider implements RagProvider {
  async getOnYourData(message: string): Promise<RagChoice[]> {
    console.log("on your data start (ms-foundry)");

    const endpoint = process.env.AZURE_FOUNDRY_API_ENDPOINT;
    const agentName = process.env.AZURE_FOUNDRY_AGENT_NAME;

    if (!endpoint || !agentName) {
      throw new Error(
        "AZURE_FOUNDRY_API_ENDPOINT と AZURE_FOUNDRY_AGENT_NAME を .env.local に設定してください。",
      );
    }

    const projectClient = new AIProjectClient(
      endpoint,
      new DefaultAzureCredential(),
    );

    const openAIClient = await projectClient.getOpenAIClient();
    const conversation = await openAIClient.conversations.create({
      items: [
        {
          type: "message",
          role: "user",
          content: message,
        },
      ],
    });
    const response = await openAIClient.responses.create(
      {
        conversation: conversation.id,
      },
      {
        body: {
          agent_reference: {
            name: agentName,
            version: "3",
            type: "agent_reference",
          },
        },
      },
    );

    return [
      {
        message: {
          content: response.output_text,
          role: "assistant",
        },
      },
    ];
  }
}
