import { axiosInstance } from "../lib/axios";


export const authService = {
  checkAuth() {
    return axiosInstance.get("/auth/check-auth");
  },

  signup(data) {
    return axiosInstance.post("/auth/signup", data);
  },

  login(data) {
    return axiosInstance.post("/auth/login", data);
  },

  logout() {
    return axiosInstance.post("/auth/logout");
  },

  updateProfile(data) {
    return axiosInstance.put("/auth/update-profile", data);
  },
};
