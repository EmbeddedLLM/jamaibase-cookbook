import { Adapter, StreamingAdapterObserver } from '@nlux/react';


export const createStreamAdapter = (
  newTableId: string,
): Adapter => ({
  streamText: async (prompt: string, observer: StreamingAdapterObserver) => {
    const body = { prompt: prompt, table_id: newTableId };
    const response = await fetch('http://localhost:8080/chat-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.status !== 200) {
      observer.error(new Error('Failed to connect to the server'));
      return;
    }

    if (!response.body) {
      return;
    }

    // Read a stream of server-sent events
    // and feed them to the observer as they are being generated
    const reader = response.body.getReader();
    const textDecoder = new TextDecoder();
    let doneReading = false;

    while (!doneReading) {
      const { done, value } = await reader.read();
      if (done) {
        doneReading = true;
        continue;
      }
      const content = textDecoder.decode(value);
      if (content) {
        observer.next(content);
      }
    }

    observer.complete();
  }
});