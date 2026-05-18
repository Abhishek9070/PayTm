import axios from "axios";

const adminApi = axios.create({
  baseURL: "http://localhost:8000/api/v1/admin",
  withCredentials: true
});

export default adminApi;
