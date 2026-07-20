import { useMutation } from "@tanstack/react-query";
import apiRequest from "../services/api";

async function updateProfile({ name }) {
  const response = await apiRequest("/api/auth/me", {
    method: "PATCH",
    body: { name }
  });
  return response.user;
}

async function changePassword({ currentPassword, newPassword }) {
  const response = await apiRequest("/api/auth/change-password", {
    method: "POST",
    body: { currentPassword, newPassword }
  });
  return response;
}

export function useUpdateProfile(options = {}) {
  return useMutation({
    mutationFn: updateProfile,
    ...options
  });
}

export function useChangePassword(options = {}) {
  return useMutation({
    mutationFn: changePassword,
    ...options
  });
}
