export const BACKEND_BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001"
    : "https://relay.azurewebsites.net";