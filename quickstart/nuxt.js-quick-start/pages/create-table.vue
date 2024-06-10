<template>
    <main>
        <h1>Create Action Table</h1>

        <div v-if="form.success">
            <p>Successfully created the table.</p>
        </div>
        <div v-else-if="form.error">
            <p>Sorry, something went wrong!</p>
        </div>

        <form @submit.prevent="submitForm">
            <label>
                Table ID
                <input v-model="tableId" />
            </label>
            <label>
                Column Name
                <input v-model="columnName" />
            </label>
            <label>
                Column Data Type
                <select v-model="columnDType">
                    <option value="str">str</option>
                    <option value="int">int</option>
                    <option value="float">float</option>
                    <option value="bool">bool</option>
                </select>
            </label>
            <button type="submit">Create</button>
        </form>
    </main>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const tableId = ref("");
const columnName = ref("");
const columnDType = ref("str");
const form = ref({ success: false, error: false });
const router = useRouter();

async function submitForm() {
    const { data } = useFetch("/api/create-table", {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: {
            table_id: tableId.value,
            column_name: columnName.value,
            column_d_type: columnDType.value,
        },
    });

    if (data.value?.success) {
        form.value.success = true;
        form.value.error = false;
    } else {
        form.value.success = false;
        form.value.error = true;
    }
}
</script>
