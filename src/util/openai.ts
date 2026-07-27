import { AzureKeyCredential, OpenAIClient } from "@azure/openai";
import axios from "axios";
import { headers } from "next/headers";
import { join } from "path";

export const getOnYourData = async (message: string): Promise<any[]> => {
  return new Promise(async (resolve, reject) => {
    const endpoint = process.env.AZURE_OPENAI_API_ENDPOINT!;
    const azureApiKey = process.env.AZURE_OPENAI_API_KEY!;
    const deploymentId = process.env.AZURE_OPENAI_API_DEPLOYMENT_ID!;

    console.log("on your data start");

    const indexName = "rag-udemy-ks-index";
    const apiUrl = `https://aisearch-udemy-rag-handson.search.windows.net/indexes/${indexName}/docs/search?api-version=2024-07-01`;
    // const requestData = {
    //   messages: [{ role: "user", content: message }],
    // };
    const requestData = {
      search: message, // ユーザーの入力文字でキーワード検索
      select: "snippet",
    };
    const headers = {
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.AZURE_AISEARCH_API_KEY!,
      },
    };

    const res = await axios.post(apiUrl, requestData, headers);

    const content = `
    # 質問
    ${message}
    # 回答
    ${(res.data.value ?? []).map((doc: { snippet: string }) => `${doc.snippet.replace("\\n", "")}`).join("")}
    `;

    const messages: any[] = [
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

    resolve(result.choices);
  });
};
