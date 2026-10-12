import type {
  IProject,
  IProjectDetail,
  ProjectFormData,
} from "../types/project.type";
import axiosInstance from "./axiosInstance";

export const getAllProjects = async (): Promise<IProject[]> => {
  const response = await axiosInstance.get("/projects");
  return response.data.data;
};

export const getProjectById = async (id: string): Promise<IProjectDetail> => {
  const response = await axiosInstance.get(`/projects/${id}`);
  return response.data.data;
};

export const createProject = async (
  projectData: ProjectFormData,
): Promise<IProject> => {
  const response = await axiosInstance.post("/projects", projectData);
  return response.data.data.project;
};

export const updateProject = async (
  id: string,
  projectData: Partial<ProjectFormData>,
): Promise<IProject> => {
  const response = await axiosInstance.patch(`/projects/${id}`, projectData);
  return response.data.data.project;
};

export const deleteProject = async (id: string): Promise<IProject> => {
  const response = await axiosInstance.delete(`/projects/${id}`);
  return response.data.data.project;
};
