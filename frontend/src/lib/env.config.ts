export const ENV = {
    VITE_IS_DEVELOPMENT: import.meta.env.VITE_IS_DEVELOPMENT === "true",
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "",
}
