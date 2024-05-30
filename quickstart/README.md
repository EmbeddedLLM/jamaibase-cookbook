# Quick Start with JamAI Base

## Frameworks

1. [Sveltekit](#sveltekit)


### Sveltekit
1. Create an account at https://cloud.jamaibase.com .
2. Create a project and get the **Project ID**
3. Create a **JamAI API Key** at the **Organization > Secrets**
4. Setup an action table.
    ```
    curl 'https://api.jamaibase.com/api/v1/gen_tables/action' \
    -H "Authorization: Bearer <your-jamai-api-key>" \
    -H "X-PROJECT-ID: <project-id>" \
    -H 'Content-Type: application/json' \
    --data-raw '{"id":"CountryCapital","cols":[{"id":"Country","dtype":"str","index":false,"gen_config":null},{"id":"Capital City","dtype":"str","index":false,"gen_config":{"model":"ellm/meta-llama/Llama-3-8B-Instruct","messages":[{"role":"system","content":"You are a helpful assistant."},{"role":"user","content":"What is the capital city of ${Country}? Don'\''t explain.\n<example 1>\nWhat is the capital city of USA?\nNew York\n</example 1>"}],"temperature":1,"max_tokens":10,"top_p":0.1}}]}'
    ```
5. Create a SvelteKit app using the npm create command.
    ```
    npm create svelte@latest myapp
    ```
6. Install the JamAI Base client library, `jamaibase`
    ```
    cd myapp && npm install jamaibase
    ```
7. Create the JamAI Base client
    * Create `src/lib/jamaiClient.js`.
        ```
        // src/lib/jamaiClient.js
        import JamAI from "jamaibase"


        export const jamai = new JamAI({
            baseURL: "https://api.jamaibase.com",
            apiKey: <your-jamai-api-key>,
            projectId: <project-id>
        });
        ```

8. Generate and query data from the JamAI Base
    * Create `src/routes/+page.server.js`.
        ```
        // src/routes/+page.server.js
        import { jamai } from "$lib/jamaiClient";

        export async function load() {
            const response = await jamai.addRow({
                table_type: "action",
                data: [
                    {
                        Country: "Germany"
                    },
                    {
                        Country: "USA"
                    },
                    {
                        Country: "Malaysia"
                    },
                    {
                        Country: "UK"
                    },
                    {
                        Country: "Chile"
                    },
                    {
                        Country: "Bhutan"
                    },
                    {
                        Country: "France"
                    }
                ],
                table_id: "CountryCapital",
                reindex: true,
                concurrent: true
            });
        
            const listRowResponse = await jamai.listRows({
                table_type: "action",
                table_id: "CountryCapital"
            });

            // const parsedData = PageListTableRowsResponseSchema.parse(listRowResponse);

            let country = [];
            let capitalcity = [];

            let countryCapital = [];

            for (const c of listRowResponse.items){
                console.log(c);
                countryCapital.push([
                    c['Country']['value'], c['Capital City']['value']
                ])
            }

            return {
                countryCapital: countryCapital
            }

        }
        ```

    * Replace the content of `+page.svelte`
        ```
        <script>
            export let data;
        </script>

        <ul>
            {#each data.countryCapital as countryCap}
            <li>Capital of {countryCap[0]}  is {countryCap[1]}</li>
            {/each}
        </ul>
        ```
9. Start the app
    * Start the app and go to http://localhost:5173 in a browser and you should see the list of countries with its capital.
        ```
        npm run dev
        ```