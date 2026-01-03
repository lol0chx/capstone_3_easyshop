// Detect if running under Spring Boot (same-origin) or a static preview server.
// If not on 8080/8081, fall back to the Spring Boot default API at localhost:8080.
const origin = window.location.origin;
const isBootOrigin = origin.includes(":8080") || origin.includes(":8081");
const config = {
    baseUrl: isBootOrigin ? origin : "http://localhost:8080"
};
// Diagnostics: always log the detected API base URL
console.log("API baseUrl:", config.baseUrl, "page origin:", origin);
