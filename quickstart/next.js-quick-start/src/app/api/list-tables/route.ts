import JamAI from "jamaibase";
import {
    PageListTableMetaResponse,
    TableTypes,
} from "jamaibase/resources/gen_tables/tables";
import { NextRequest, NextResponse } from "next/server";

const jamai = new JamAI({
    baseURL: process.env.NEXT_PUBLIC_JAMAI_BASEURL!,
    apiKey: process.env.JAMAI_API_KEY,
    projectId: process.env.JAMAI_PROJECT_ID,
});

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const tableType = (searchParams.get("type") || "action") as TableTypes;

    try {
        let data: PageListTableMetaResponse = await jamai.listTables({
            table_type: tableType,
        });
        console.log("data: ", data.items.length);
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error fetching tables:", error.response);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
