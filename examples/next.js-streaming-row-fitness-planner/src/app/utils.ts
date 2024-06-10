export async function processJsonStream<T>(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    processContent: (content: T) => void,
    handleComplete?: () => void,
    handleError?: (error: any) => void
) {
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Split by the delimiter "}{" }
        let boundary = buffer.indexOf("}{");

        while (boundary !== -1) {
            const jsonString = buffer.substring(0, boundary + 1);
            buffer = buffer.substring(boundary + 1);

            try {
                const parsedChunk = JSON.parse(jsonString);
                processContent(parsedChunk);
            } catch (error) {
                console.error("Error parsing JSON chunk:", jsonString);
                handleError && handleError(error);
            }

            boundary = buffer.indexOf("}{");
        }

        // Attempt to parse whatever is left in the buffer
        try {
            const parsedChunk = JSON.parse(buffer);
            processContent(parsedChunk);
            buffer = "";
        } catch (error) {
            // Continue buffering since we might not have a complete JSON object yet
        }
    }

    if (buffer.trim()) {
        try {
            const parsedChunk = JSON.parse(buffer.trim());
            processContent(parsedChunk);
        } catch (error) {
            console.error("Error parsing remaining buffer:", buffer.trim());
            handleError && handleError(error);
        }
    }

    handleComplete && handleComplete();
}
