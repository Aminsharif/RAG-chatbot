export type Source = {
  url: string;
  title: string;
};

export type Message = {
  id: string;
  createdAt?: Date;
  content: string;
  type: "system" | "human" | "ai" | "function";
  sources?: Source[];
  name?: string;
  function_call?: { name: string };
};

export type Feedback = {
  feedback_id: string;
  score: number;
  comment?: string;
};

export type ModelOptions =
  | "groq/llama-3.1-8b-instant"
  | "groq/llama-3.3-70b-versatile"
  | "groq/qwen/qwen3-32b"
  | "groq/meta-llama/llama-4-scout-17b-16e-instruct";
