<template>
    <div>
        <nav>
            <ul>
                <li><NuxtLink to="/">Home</NuxtLink></li>
                <li><NuxtLink to="/create-table">Create Table</NuxtLink></li>
            </ul>
        </nav>
        <slot />
    </div>
</template>

<script setup></script>

<style scoped>
nav {
    background-color: #f8f9fa;
    padding: 10px;
}

nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    gap: 20px;
}

nav ul li {
    display: inline;
}

nav a {
    text-decoration: none;
    color: #007bff;
}

nav a:hover {
    text-decoration: underline;
}
</style>
