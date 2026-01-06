import React from "react";
import { useThreads } from "../providers/Thread";
import { ModelOptions } from "../app/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const modelOptionsAndLabels: Partial<Record<ModelOptions, string>> = {
  "groq/llama-3.1-8b-instant": "llama-3.1-8b-instant",
  "groq/llama-3.3-70b-versatile": "llama-3.3-70b",
  "groq/qwen/qwen3-32b": "qwen3-32b",
  "groq/meta-llama/llama-4-scout-17b-16e-instruct": "llama-4-scout-17b"
};

export function SelectModelComponent() {
  const { selectedModel, setSelectedModel } = useThreads();
  
  return (
    <Select
      onValueChange={(v) => setSelectedModel(v as ModelOptions)}
      value={selectedModel}
      defaultValue="groq/llama-3.3-70b-versatile" // Updated default to match available options
    >
      <SelectTrigger className="w-[180px] border-gray-300 text-gray-800 bg-white hover:bg-gray-50">
        <SelectValue placeholder="Select Model" />
      </SelectTrigger>
      <SelectContent className="bg-white text-gray-800 border-gray-300 shadow-lg">
        {Object.entries(modelOptionsAndLabels).map(([model, label]) => (
          <SelectItem 
            className="hover:bg-gray-100 focus:bg-gray-100 cursor-pointer" 
            key={model} 
            value={model}
          >
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export const SelectModel = React.memo(SelectModelComponent);