import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import JamAI from 'jamaibase';
import dotenv from "dotenv";
import { v4 as uuid4v } from 'uuid';

dotenv.config({
    path: "server/.env"
});

const jamai = new JamAI({
    baseURL: process.env["BASEURL"]!,
    apiKey: process.env["JAMAI_APIKEY"]!,
    projectId: process.env["PROJECT_ID"]!
});

const app: Express = express();
const port = 8080;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to NLUX + Node.js demo server!');
});

app.post('/new-session', async (req: Request, res: Response) => {

    const new_table_id = `${process.env["AGENT_ID"]!}-conv-${uuid4v()}`;
    await jamai.duplicateTable({
        table_id_src: process.env["AGENT_ID"]!,
        table_type: "chat",
        table_id_dst: new_table_id,
        include_data: false,
        deploy: true
    });

    res.send(JSON.stringify(
        {
            table_id: new_table_id
        }
    )) 

});

app.post('/chat-api', async (req: Request, res: Response) => {

    const prompt = req.body['prompt'];
    const table_id = req.body['table_id'];

    const response = await jamai.addRowStream({
        table_type: "chat",
        data: [
            {
                User: prompt
            }
        ],
        table_id: table_id,
        reindex: true,
        concurrent: true
    });

    const reader = response.getReader();
    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        res.write(value["choices"][0]["message"]["content"], 'utf-8');

    }
    res.end();
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});