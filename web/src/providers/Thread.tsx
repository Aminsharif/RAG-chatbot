import { validate } from "uuid";
import { getApiKey } from "@/lib/api-key";
import { Thread } from "@langchain/langgraph-sdk";
import { useQueryState } from "nuqs";
import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { createClient } from "./client";
import { ModelOptions } from "@/app/types";

interface ThreadContextType {
  getThreads: () => Promise<Thread[]>;
  deleteThread: (threadId: string) => Promise<boolean>;
  threads: Thread[];
  setThreads: Dispatch<SetStateAction<Thread[]>>;
  threadsLoading: boolean;
  setThreadsLoading: Dispatch<SetStateAction<boolean>>;
  selectedModel: ModelOptions;
  setSelectedModel: Dispatch<SetStateAction<ModelOptions>>;
}

const ThreadContext = createContext<ThreadContextType | undefined>(undefined);

function getThreadSearchMetadata(
  assistantId: string,
): { graph_id: string } | { assistant_id: string } {
  if (validate(assistantId)) {
    return { assistant_id: assistantId };
  } else {
    return { graph_id: assistantId };
  }
}

export function ThreadProvider({ children }: { children: ReactNode }) {
  const [apiUrl] = useQueryState("apiUrl");
  const [assistantId] = useQueryState("assistantId");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelOptions>(
    "groq/llama-3.3-70b-versatile",
  );
  const getThreads = useCallback(async (): Promise<Thread[]> => {
    if (!apiUrl || !assistantId) return [];
    const client = createClient(apiUrl, getApiKey() ?? undefined);

    const threads = await client.threads.search({
      metadata: {
        ...getThreadSearchMetadata(assistantId),
      },
      limit: 100,
    });

    return threads;
  }, [apiUrl, assistantId]);

  // In your Thread context provider (Thread.tsx or wherever your useThreads hook is defined)
  const deleteThread = useCallback(async (threadId: string): Promise<boolean> => {
    if (!apiUrl || !threadId) return false;

    try {
      const client = createClient(apiUrl, getApiKey() ?? undefined);
      await client.threads.delete(threadId);

      // Update local state immediately - remove the deleted thread
      setThreads(prev => prev.filter(thread => thread.thread_id !== threadId));

      return true;
    } catch (error) {
      console.error('Failed to delete thread:', error);
      return false;
    }
  }, [apiUrl]);

  const value = {
    getThreads,
    threads,
    setThreads,
    threadsLoading,
    setThreadsLoading,
    selectedModel,
    setSelectedModel,
    deleteThread,
  };

  return (
    <ThreadContext.Provider value={value}>{children}</ThreadContext.Provider>
  );
}

export function useThreads() {
  const context = useContext(ThreadContext);
  if (context === undefined) {
    throw new Error("useThreads must be used within a ThreadProvider");
  }
  return context;
}
