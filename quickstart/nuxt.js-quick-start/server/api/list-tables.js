import JamAI from "jamaibase";

const {
    JAMAI_API_KEY,
    public: { JAMAI_BASEURL, JAMAI_PROJECT_ID },
} = useRuntimeConfig();

const jamai = new JamAI({
    baseURL: JAMAI_BASEURL,
    apiKey: JAMAI_API_KEY,
    projectId: JAMAI_PROJECT_ID,
});

export default defineEventHandler(async (event) => {
    const { type = "action" } = getQuery(event);

    try {
        const data = await jamai.listTables({ table_type: type });
        return { success: true, data: data };
    } catch (error) {
        console.error("Error fetching tables:", error);
        return { success: false, data: "Something went wrong" };
    }
});
