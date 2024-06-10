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
    const { table_id, column_name, column_d_type } = await readBody(event);

    try {
        const response = await jamai.createActionTable({
            id: table_id,
            cols: [{ id: column_name, dtype: column_d_type }],
        });

        return { success: true, data: response };
    } catch (error) {
        console.error("error: ", error.response);
        return { success: false, message: "Something went wrong!" };
    }
});
