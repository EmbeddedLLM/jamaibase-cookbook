import JamAI from "jamaibase";
import { NextRequest, NextResponse } from "next/server";
import { StreamingTextResponse } from "ai";
import { GenTableStreamChatCompletionChunk } from "jamaibase/resources/gen_tables/chat";

const jamai = new JamAI({
    baseURL: process.env.NEXT_PUBLIC_JAMAI_BASEURL!,
    apiKey: process.env.JAMAI_API_KEY,
    projectId: process.env.JAMAI_PROJECT_ID,
});

export async function POST(request: NextRequest) {
    const body = await request.json();
    try {
        let stream = await jamai.addRowStream({
            table_type: "action",
            data: [
                {
                    age: body.age,
                    height: body.height,
                    weight: body.weight,
                    sex: body.sex,
                    preferred_body_type: body.preferredBodyType,
                },
            ],
            table_id: "fitness_planner",
            reindex: null,
            concurrent: true,
        });

        return new StreamingTextResponse(streamText(stream));
    } catch (error: any) {
        console.error("Error fetching tables:", error.response);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

function streamText(
    inputStream: ReadableStream<GenTableStreamChatCompletionChunk>
): ReadableStream<string> {
    const reader = inputStream.getReader();

    return new ReadableStream<string>({
        async start(controller) {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    controller.close();
                    break;
                }
                // Extract the text content from the chunk
                const text = JSON.stringify(value);

                if (text) {
                    // Enqueue the text content as a chunk to the new stream
                    controller.enqueue(text);
                }
            }
        },
        cancel() {
            reader.releaseLock();
        },
    });
}
