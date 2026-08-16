import axios from "axios";
import { API_BASE_URL } from "../config/api";

// Creates an Axios instance for sending requests to the backend server.
export const axiosInstance = axios.create( {
    baseURL: API_BASE_URL,
    withCredentials: true,
} );