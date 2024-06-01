import { Adapter, StreamingAdapterObserver } from '@nlux/react';
import { JamAI } from "jamaibase";


export const createStreamAdapter = (
  jamaiInstance: JamAI, 
  newTableId: string,
  baseURL: string,
  apiKey: string,
  projectId: string
): Adapter => ({
  streamText: async (prompt: string, observer: StreamingAdapterObserver) => {

    const response = await fetch(`${baseURL}/api/v1/gen_tables/chat/rows/add`, {
      method: 'POST',
      headers: { 
        'Authorization': 'Bearer ' + apiKey,
        'X-Project-ID': projectId,
        'Content-Type': 'application/json' },
      body: JSON.stringify({
        table_type: "chat",
        data: [
          {
            User: prompt
          }
        ],
        table_id: newTableId,
        reindex: true,
        concurrent: true,
        stream: true
      }),
    });

    if (response.status !== 200) {
      observer.error(new Error('Failed to connect to the server'));
      return;
    }

    if (!response.body) {
      return;
    }

    // const reader = response.body.getReader();
    const reader = response.body.getReader();
    const textDecoder = new TextDecoder();
    let doneReading = false;

    while (!doneReading) {
      const { value, done } = await reader.read();
      if (done) {
        doneReading = true;
        continue;
      }

      let data = textDecoder.decode(value).toString();
      if (data.endsWith("\n\n")) {
          const lines = data
              .split("\n\n")
              .filter((i: string) => i.trim())
              .flatMap((line: string) => line.split("\n")); //? Split by \n to handle collation

          for (const line of lines) {
              const chunk = line
                  .toString()
                  .replace(/^data: /, "")
                  .replace(/data: \[DONE\]\s+$/, "");

              if (chunk.trim() == "[DONE]") break;

              try {
                  const parsedValue = JSON.parse(chunk);
                  console.log(parsedValue);
                  observer.next(parsedValue["choices"][0]["message"]["content"]);
              } catch (err) {
                  console.error("Error parsing:", chunk);
                  continue;
              }
          }
      } else {
          const chunk = data
              .toString()
              .replace(/^data: /, "")
              .replace(/data: \[DONE\]\s+$/, "");

          if (chunk.trim() == "[DONE]") observer.complete();

          try {
              const parsedValue = JSON.parse(chunk);
              observer.next(parsedValue["choices"][0]["message"]["content"]);
          } catch (err) {
              console.error("Error parsing:", chunk);
          }
      }
    }

    observer.complete();
  }
});