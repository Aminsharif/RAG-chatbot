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
import { useAuthContext } from "@/providers/Auth";;

interface ThreadContextType {
  getThreads: () => Promise<Thread[]>;
  deleteThread: (threadId: string) => Promise<boolean>;
  threads: Thread[];
  setThreads: Dispatch<SetStateAction<Thread[]>>;
  threadsLoading: boolean;
  setThreadsLoading: Dispatch<SetStateAction<boolean>>;
  selectedModel: ModelOptions;
  setSelectedModel: Dispatch<SetStateAction<ModelOptions>>;
  getThreadId:() => Promise<string | null>
  updateThreadMetadata: (threadId:string, userId:string, metadata?: Record<string, any>) => Promise<boolean>;
}

const ThreadContext = createContext<ThreadContextType | undefined>(undefined);

// function getThreadSearchMetadata(
//   assistantId: string,
//   user_id: string,
// ): { graph_id: string, user_id: string } | { assistant_id: string, user_id: string } {
//   if (validate(assistantId)) {
//     return { assistant_id: assistantId, user_id: user_id};
//   } else {
//     return { graph_id: assistantId, user_id: user_id };
//   }
// }

function getThreadSearchMetadata(
  assistantId: string,
  user_id: string,
): Record<string, string> {
  const metadata: Record<string, string> = { user_id };
  
  if (validate(assistantId)) {
    metadata.assistant_id = assistantId;
  } else {
    metadata.graph_id = assistantId;
  }
  
  return metadata;
}

export function ThreadProvider({ children }: { children: ReactNode }) {
    // Get environment variables
  const envApiUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;
  const envAssistantId: string | undefined =
    process.env.NEXT_PUBLIC_ASSISTANT_ID;

  // Use URL params with env var fallbacks
  const [apiUrl] = useQueryState("apiUrl", {
    defaultValue: envApiUrl || "",
  });
  const [assistantId] = useQueryState("assistantId", {
    defaultValue: envAssistantId || "",
  });

  // Determine final values to use, prioritizing URL params then env vars
  const finalApiUrl = apiUrl || envApiUrl;
  const finalAssistantId = assistantId || envAssistantId;

  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelOptions>(
    "groq/llama-3.3-70b-versatile",
  );
  const { session } = useAuthContext();
  const user = session?.user || undefined;
  const getThreads = useCallback(async (): Promise<Thread[]> => {
    if (!finalApiUrl || !finalAssistantId) return [];
    const jwt = session?.accessToken || undefined;
    const client = createClient(finalApiUrl, getApiKey() ?? undefined, jwt);
    const user_id = user?.id || "default"
    const threads = await client.threads.search({

      metadata: {
        ...getThreadSearchMetadata(finalAssistantId, user_id),
      },
      limit: 100,
    });

    return threads;
  }, [finalApiUrl, finalAssistantId]);

const updateThreadMetadata = useCallback(async (
  threadId: string,
  userId: string,
  metadata?: Record<string, any>
): Promise<boolean> => {
  try {
    if (!finalApiUrl || !threadId || !userId) {
      console.error("Missing required parameters");
      return false;
    }
    const jwt = session?.accessToken || undefined;
    const client = createClient(finalApiUrl, getApiKey() ?? undefined, jwt);
    await client.threads.update(threadId, {
      metadata: {
        user_id: userId,
        assistant_id: finalAssistantId,
        ...metadata,
        updated_at: new Date().toISOString(),
      },
    });
    
    return true;
  } catch (error) {
    console.error("Failed to update thread metadata:", error);
    return false;
  }
}, [finalApiUrl, finalAssistantId]);

const getThreadId = useCallback(async (): Promise<string | null> => {
  try {
    if (!finalApiUrl || !finalAssistantId) {
      return null;
    }
    const jwt = session?.accessToken || undefined;
    const user = session?.user
    const client = createClient(finalApiUrl, getApiKey() ?? undefined, jwt);
    const { thread_id } = await client.threads.create({
      metadata: {
        user_id: user?.id,
      },
    });
    return thread_id;
  } catch (error) {
    console.error("Failed to create thread:", error);
    return null;
  }
}, [finalApiUrl, finalAssistantId]);

  // In your Thread context provider (Thread.tsx or wherever your useThreads hook is defined)
  const deleteThread = useCallback(async (threadId: string): Promise<boolean> => {
    if (!finalApiUrl || !threadId) return false;
    const jwt = session?.accessToken || undefined;

    try {
      const client = createClient(finalApiUrl, getApiKey() ?? undefined,jwt);
      await client.threads.delete(threadId);

      // Update local state immediately - remove the deleted thread
      setThreads(prev => prev.filter(thread => thread.thread_id !== threadId));

      return true;
    } catch (error) {
      console.error('Failed to delete thread:', error);
      return false;
    }
  }, [finalApiUrl]);

  const value = {
    getThreads,
    threads,
    setThreads,
    threadsLoading,
    setThreadsLoading,
    selectedModel,
    setSelectedModel,
    deleteThread,
    getThreadId,
    updateThreadMetadata
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
