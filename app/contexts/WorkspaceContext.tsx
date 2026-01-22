"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getStorageItem, setStorageItem, removeStorageItem } from "../lib/storage";
import { useRouter } from "next/navigation";

interface Workspace {
  id: string;
  name: string;
  ownerId: number;
  isOwner: boolean;
  owner: {
    id: number;
    name: string | null;
    email: string;
  };
  _count?: {
    categories: number;
    transactions: number;
  };
}

interface WorkspaceContextType {
  selectedWorkspaceId: string | null;
  setSelectedWorkspaceId: (workspaceId: string | null) => void;
  workspaces: Workspace[];
  loading: boolean;
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (name: string) => Promise<Workspace | null>;
  changeWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [selectedWorkspaceId, setSelectedWorkspaceIdState] = useState<string | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load selected workspace from localStorage on mount
  useEffect(() => {
    const savedWorkspaceId = getStorageItem("selectedWorkspaceId");
    if (savedWorkspaceId) {
      setSelectedWorkspaceIdState(savedWorkspaceId);
    }
  }, []);

  const setSelectedWorkspaceId = (workspaceId: string | null) => {
    setSelectedWorkspaceIdState(workspaceId);
    if (workspaceId) {
      setStorageItem("selectedWorkspaceId", workspaceId);
    } else {
      removeStorageItem("selectedWorkspaceId");
    }
  };

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const sessionToken = getStorageItem("sessionToken");
      
      if (!sessionToken) {
        setWorkspaces([]);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/workspaces", {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setWorkspaces([]);
          setLoading(false);
          return;
        }
        throw new Error("Failed to fetch workspaces");
      }

      const data = await response.json();
      setWorkspaces(data.workspaces || []);

      // If we have a selected workspace but it's not in the list, clear it
      if (selectedWorkspaceId) {
        const workspaceExists = data.workspaces?.some((w: Workspace) => w.id === selectedWorkspaceId);
        if (!workspaceExists) {
          setSelectedWorkspaceId(null);
        }
      }
    } catch (error) {
      console.error("Error fetching workspaces:", error);
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (name: string): Promise<Workspace | null> => {
    try {
      const sessionToken = getStorageItem("sessionToken");
      
      if (!sessionToken) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create workspace");
      }

      const data = await response.json();
      const newWorkspace = data.workspace;

      // Add to workspaces list
      setWorkspaces((prev) => [newWorkspace, ...prev]);

      // Select the new workspace
      setSelectedWorkspaceId(newWorkspace.id);

      return newWorkspace;
    } catch (error) {
      console.error("Error creating workspace:", error);
      throw error;
    }
  };

  // Fetch workspaces on mount
  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const changeWorkspace = () => {
    setSelectedWorkspaceId(null);
    removeStorageItem("selectedWorkspaceId");
    router.push("/workspace");
  };

  return (
    <WorkspaceContext.Provider
      value={{
        selectedWorkspaceId,
        setSelectedWorkspaceId,
        workspaces,
        loading,
        fetchWorkspaces,
        createWorkspace,
        changeWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}

