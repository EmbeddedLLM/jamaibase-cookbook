"use client";

import { table } from "console";
import {
    PageListTableMetaResponse,
    TableTypes,
} from "jamaibase/resources/gen_tables/tables";
import { ChangeEvent, useEffect, useState } from "react";

export default function Home() {
    const [tableData, setTableData] = useState<PageListTableMetaResponse>();
    const [tableType, setTableType] = useState("action");

    const handleTableTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setTableType(e.target.value);
    };

    useEffect(() => {
        const fetchData = async () => {
            console.log("fetch data");
            const response = await fetch(`/api/list-tables?type=${tableType}`);
            if (response.ok) {
                const data: PageListTableMetaResponse = await response.json();
                setTableData(data);
            } else {
                console.error("Failed to fetch data:", response.statusText);
            }
        };
        fetchData();
    }, [tableType]);
    return (
        <main className="flex min-h-screen flex-col  p-24">
            <div className="max-w-sm mx-auto my-10 p-5 bg-white rounded-lg shadow-md">
                <label
                    htmlFor="movieGenre"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Choose Table Type:
                </label>
                <select
                    value={tableType}
                    onChange={handleTableTypeChange}
                    className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                >
                    <option value="action">Action</option>
                    <option value="chat">Chat</option>
                    <option value="knowledge">Knowledge</option>
                </select>
            </div>

            <div className="space-y-6">
                <h1 className="text-4xl">List of Tables</h1>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Table ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Columns
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Column Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Number of Rows
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-300 text-black">
                        {tableData?.items.map((table) => (
                            <tr key={table.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {table.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <ul className="space-y-2">
                                        {table.cols.map((column) => (
                                            <li className="" key={column.id}>
                                                <span>{column.id}: </span>
                                                <span>{column.dtype}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <ul className="space-y-2">
                                        {table.cols.map((column) => (
                                            <li className="" key={column.id}>
                                                <span>
                                                    {column.gen_config
                                                        ? "Ouput"
                                                        : "Input"}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {table.num_rows}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
