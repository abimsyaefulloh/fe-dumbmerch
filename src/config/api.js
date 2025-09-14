import axios from "axios";

// Create base URL API
export const API = axios.create({
  baseURL: "http://api.batch24.studentdumbways.my.id/api/v1"
});

// Set Authorization Token Header
export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.commin["Authorization"];
  }
};
