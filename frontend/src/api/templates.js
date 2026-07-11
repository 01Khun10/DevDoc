import { useQuery } from "@tanstack/react-query";
import {
  getTemplateSections,
  listProfiles,
  listTemplatesByProfile
} from "../services/templateService";

export function useProfiles(options = {}) {
  return useQuery({ queryKey: ["profiles"], queryFn: listProfiles, ...options });
}

export function useTemplatesByProfile(profileCode, options = {}) {
  return useQuery({
    queryKey: ["templates", profileCode],
    queryFn: () => listTemplatesByProfile(profileCode),
    enabled: Boolean(profileCode),
    ...options
  });
}

export function useTemplateSections(templateCode, options = {}) {
  return useQuery({
    queryKey: ["templates", templateCode, "sections"],
    queryFn: () => getTemplateSections(templateCode),
    enabled: Boolean(templateCode),
    ...options
  });
}
