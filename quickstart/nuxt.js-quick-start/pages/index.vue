<template>
    <main>
        <div class="container">
            <label>Choose Table Type:</label>
            <select v-model="tableType" @change="fetchTables">
                <option value="action">Action</option>
                <option value="chat">Chat</option>
                <option value="knowledge">Knowledge</option>
            </select>
        </div>

        <div class="container">
            <h1>List of Tables</h1>
            <table>
                <thead>
                    <tr>
                        <th>Table ID</th>
                        <th>Columns</th>
                        <th>Column Type</th>
                        <th>Number of Rows</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="table in tableData.items" :key="table.id">
                        <td>{{ table.id }}</td>
                        <td>
                            <ul>
                                <li
                                    v-for="column in table.cols"
                                    :key="column.id"
                                >
                                    {{ column.id }}: {{ column.dtype }}
                                </li>
                            </ul>
                        </td>
                        <td>
                            <ul>
                                <li
                                    v-for="column in table.cols"
                                    :key="column.id"
                                >
                                    {{ column.gen_config ? "Output" : "Input" }}
                                </li>
                            </ul>
                        </td>
                        <td>{{ table.num_rows }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </main>
</template>

<script setup>
import { ref, onMounted } from "vue";

const tableType = ref("action");
const tableData = ref({ items: [] });

async function fetchTables() {
    const response = await $fetch(`/api/list-tables?type=${tableType.value}`);

    if (response.success) {
        tableData.value = response.data;
    } else {
        console.error("Failed to fetch data");
    }
}

onMounted(() => {
    fetchTables();
});
</script>

<style scoped>
/* Main layout styling */
main {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding: 24px;
}

/* Container styling */
.container {
    max-width: 600px;
    margin: 40px auto;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Label and select input styling */
label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #333;
}

select {
    display: block;
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #fff;
    margin-bottom: 20px;
    font-size: 14px;
}

/* Table styling */
table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}

th,
td {
    padding: 12px;
    border: 1px solid #ddd;
    text-align: left;
}

th {
    background-color: #f4f4f4;
    font-weight: 600;
}

tr:nth-child(even) {
    background-color: #f9f9f9;
}

tr:hover {
    background-color: #f1f1f1;
}

/* Responsive styling */
@media (max-width: 600px) {
    .container {
        padding: 10px;
    }

    table,
    th,
    td {
        font-size: 12px;
    }

    th,
    td {
        padding: 8px;
    }
}
</style>
