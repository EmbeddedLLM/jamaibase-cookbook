// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
    runtimeConfig: {
        JAMAI_API_KEY: process.env.JAMAI_API_KEY,
        public: {
            JAMAI_BASEURL: process.env.JAMAI_BASEURL,
            JAMAI_PROJECT_ID: process.env.JAMAI_PROJECT_ID,
        },
    },
});
