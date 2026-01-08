// frontend/src/lib/api.ts

import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies for cross-origin requests
});

// Request Interceptor: Attaches the access token to every outgoing request.
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      // Skip for auth endpoints
      const authEndpoints = ['/api/v1/auth/login', '/api/v1/auth/refresh-token'];
      if (!authEndpoints.some(endpoint => config.url.includes(endpoint))) {
        const token = localStorage.getItem("staff_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: The core logic for handling token expiration.
api.interceptors.response.use(
  (response) => {
    // If the request was successful, just return the response.
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
        const isMeetingAuthEndpoint = originalRequest.url.includes('/api/v1/meetings/create');


    // Check if the error is due to an expired access token (e.g., a 401 or 500 error from the filter)
    // and that we haven't already tried to refresh the token for this request.
    if (error.response?.status === 401 && !originalRequest._retry && !isMeetingAuthEndpoint) {
      originalRequest._retry = true; // Mark the request to prevent infinite retry loops.

      try {
        const refreshToken = localStorage.getItem("staff_refresh_token");

        // If there's no refresh token, the user must log in.
        if (!refreshToken) {
          localStorage.clear();
          window.location.href = '/staff-login';
          return Promise.reject(new Error("No refresh token available."));
        }

        // Attempt to get a new access token using the refresh token.
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh-token`,
          { refreshToken: refreshToken }
        );
        
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        // If successful, update the tokens in local storage.
        localStorage.setItem("staff_token", newAccessToken);
        localStorage.setItem("staff_refresh_token", newRefreshToken);

        // Update the header on the original request and retry it.
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        // THIS IS THE CRITICAL BLOCK FOR YOUR REQUIREMENT
        // This block will execute if the refresh token API call fails for ANY reason.
        
        console.error("Refresh token is invalid or expired. Logging out.", refreshError);

        // 1. Delete all tokens (access and refresh) from local storage.
        localStorage.clear(); 

        // 2. Redirect the user to the login page to start over.
        window.location.href = '/staff-login'; 

        // 3. Reject the promise to stop the original failed request.
        return Promise.reject(refreshError);
      }
    }

    // For any other errors, just pass them along.
    return Promise.reject(error);
  }
);

export default api;