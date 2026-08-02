import { AzureKeyCredential, OpenAIClient } from "@azure/openai";
import axios from "axios";
import type { RagChoice, RagProvider } from "./types";

export class AzureSearchOpenAIRagProvider implements RagProvider {
  async getOnYourData(message: string): Promise<RagChoice[]> {
    const endpoint = process.env.AZURE_OPENAI_API_ENDPOINT!;
    const azureApiKey = process.env.AZURE_OPENAI_API_KEY!;
    const deploymentId = process.env.AZURE_OPENAI_API_DEPLOYMENT_ID!;

    console.log("on your data start (azure-search-openai)");

    const indexName = "rag-udemy-ks-index";
    const apiUrl = `https://aisearch-udemy-rag-handson.search.windows.net/indexes/${indexName}/docs/search?api-version=2024-07-01`;
    const requestData = {
      search: message,
      select: "snippet",
    };
    const requestHeaders = {
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.AZURE_AISEARCH_API_KEY!,
      },
    };

    const res = await axios.post(apiUrl, requestData, requestHeaders);

    const content = `
    # 質問
    ${message}
    # 回答
    ${(res.data.value ?? []).map((doc: { snippet: string }) => `${doc.snippet.replace("\\n", "")}`).join("")}
    `;

    const messages = [
      {
        role: "system",
        content: "You are a helpful assistant",
      },
      {
        role: "user",
        content: content,
      },
    ];
    console.log(messages);

    const client = new OpenAIClient(
      endpoint,
      new AzureKeyCredential(azureApiKey),
    );

    const result = await client.getChatCompletions(deploymentId, messages);

    return result.choices as RagChoice[];
  }
}
