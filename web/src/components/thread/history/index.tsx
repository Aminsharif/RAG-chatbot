import { Button } from "@/components/ui/button";
import { useThreads } from "@/providers/Thread";
import { Thread } from "@langchain/langgraph-sdk";

import { getContentString } from "../utils";
import { useQueryState, parseAsBoolean } from "nuqs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelRightOpen, PanelRightClose } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { groupThreads } from "./utils";
import { MoreVertical, Trash2, Edit } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { prettifyDateLabel } from "./utils";

// function ThreadList({
//   threads,
//   onThreadClick,
// }: {
//   threads: Thread[];
//   onThreadClick?: (threadId: string) => void;
// }) {
//   const [threadId, setThreadId] = useQueryState("threadId");
//   const groupedThreads = groupThreads(threads);
//   const [openMenuId, setOpenMenuId] = useState<string | null>(null);
//   const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [threadToDelete, setThreadToDelete] = useState<string | null>(null);
//   const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});
//   const { deleteThread } = useThreads();

//   // Handle click outside to close menu
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (openMenuId && menuRefs.current[openMenuId]) {
//         if (!menuRefs.current[openMenuId]?.contains(event.target as Node)) {
//           setOpenMenuId(null);
//         }
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [openMenuId]);

//   // Handler functions
//   const handleEdit = (threadId: string) => {
//     console.log("Edit thread:", threadId);
//     setOpenMenuId(null);
//   };

//   const handleDeleteClick = (threadId: string) => {
//     setThreadToDelete(threadId);
//     setShowDeleteConfirm(true);
//     setOpenMenuId(null);
//   };

//   const handleDeleteConfirm = useCallback(async () => {
//     if (!threadToDelete) return;

//     try {
//       setDeletingThreadId(threadToDelete);

//       // Call the delete function
//       const success = await deleteThread(threadToDelete);

//       if (success) {
//         // If the deleted thread was currently selected, clear the selection
//         if (threadToDelete === threadId) {
//           setThreadId(null);
//         }

//         toast.success("Thread deleted successfully");
        
//         // Optionally, you can trigger a refresh of threads
//         // This depends on how your app handles state updates
//       } else {
//         toast.error("Failed to delete thread");
//       }
//     } catch (error) {
//       console.error("Error deleting thread:", error);
//       toast.error("Error deleting thread");
//     } finally {
//       setDeletingThreadId(null);
//       setShowDeleteConfirm(false);
//       setThreadToDelete(null);
//     }
//   }, [threadToDelete, threadId, deleteThread, setThreadId]);

//   const handleDeleteCancel = () => {
//     setShowDeleteConfirm(false);
//     setThreadToDelete(null);
//     setDeletingThreadId(null);
//   };

//   return (
//     <>
//       <div className="h-full flex flex-col w-full gap-1 items-start justify-start overflow-y-scroll [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent">
//         {Object.entries(groupedThreads).map(([groupName, conversations]) => {
//           if (conversations.length === 0) return null;

//           return (
//             <div key={groupName} className="w-full">
//               {/* Group Label */}
//               <div className="sticky top-0 z-10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 px-1 py-2">
//                 <div className="flex items-center justify-between">
//                   <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
//                     {prettifyDateLabel(groupName)}
//                   </span>
//                   {/* <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
//                     {conversations.length}
//                   </span> */}
//                 </div>
//               </div>

//               {/* Conversations in this group */}
//               {conversations.map((t) => {
//                 let itemText = t.thread_id;
//                 if (
//                   typeof t.values === "object" &&
//                   t.values &&
//                   "messages" in t.values &&
//                   Array.isArray(t.values.messages) &&
//                   t.values.messages?.length > 0
//                 ) {
//                   const firstMessage = t.values.messages[0];
//                   itemText = getContentString(firstMessage.content);
//                 }

//                 const isActive = t.thread_id === threadId;
//                 const isDeleting = deletingThreadId === t.thread_id;

//                 return (
//                   <div
//                     key={t.thread_id}
//                     className={`group relative w-full px-1 py-1 rounded-lg ${
//                       isActive ? "bg-blue-50" : "hover:bg-gray-50"
//                     } ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}
//                   >
//                     <div className="flex items-center justify-between w-full">
//                       {/* Thread button */}
//                       <div
//                         className={`flex-1 text-left items-start justify-start font-normal w-[240px] py-2 px-3 rounded-l-lg cursor-pointer ${
//                           isActive ? "text-blue-600" : ""
//                         }`}
//                         onClick={(e) => {
//                           e.preventDefault();
//                           if (isDeleting) return;
//                           onThreadClick?.(t.thread_id);
//                           if (t.thread_id === threadId) return;
//                           setThreadId(t.thread_id);
//                         }}
//                       >
//                         <p className="truncate text-ellipsis text-sm">
//                           {isDeleting ? "Deleting..." : itemText}
//                         </p>
//                       </div>

//                       {/* Three-dot menu button */}
//                       <div className="relative">
//                         <button
//                           disabled={isDeleting}
//                           className={`h-10 w-10 p-0 flex items-center justify-center rounded-r-lg transition-all ${
//                             isActive 
//                               ? "text-blue-600 hover:bg-blue-100" 
//                               : "opacity-0 group-hover:opacity-100 text-gray-500 hover:bg-gray-200"
//                           } ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             if (isDeleting) return;
//                             setOpenMenuId(
//                               openMenuId === t.thread_id ? null : t.thread_id
//                             );
//                           }}
//                         >
//                           {isDeleting ? (
//                             <div className="h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
//                           ) : (
//                             <MoreVertical className="h-4 w-4" />
//                           )}
//                         </button>

//                         {/* Dropdown menu */}
//                         {openMenuId === t.thread_id && (
//                           <div
//                             ref={(el) => {
//                               if (el) {
//                                 menuRefs.current[t.thread_id] = el;
//                               } else {
//                                 delete menuRefs.current[t.thread_id];
//                               }
//                             }}
//                             className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border bg-white shadow-lg"
//                           >
//                             <div className="py-1">
//                               <button
//                                 onClick={() => handleEdit(t.thread_id)}
//                                 className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                                 disabled={isDeleting}
//                               >
//                                 <Edit className="mr-2 h-4 w-4" />
//                                 Rename
//                               </button>
//                               <button
//                                 onClick={() => handleDeleteClick(t.thread_id)}
//                                 className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 disabled:opacity-50"
//                                 disabled={isDeleting}
//                               >
//                                 <Trash2 className="mr-2 h-4 w-4" />
//                                 Delete
//                               </button>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           );
//         })}
//       </div>

//       {/* Confirmation Dialog */}
//       <ConfirmationDialog
//         open={showDeleteConfirm}
//         onOpenChange={setShowDeleteConfirm}
//         title="Delete Thread"
//         description="Are you sure you want to delete this thread? This action cannot be undone."
//         confirmText="Delete"
//         cancelText="Cancel"
//         variant="destructive"
//         onConfirm={handleDeleteConfirm}
//         loading={!!deletingThreadId}
//       />
//     </>
//   );
// }

function ThreadList({
  threads,
  onThreadClick,
}: {
  threads: Thread[];
  onThreadClick?: (threadId: string) => void;
}) {
  const [threadId, setThreadId] = useQueryState("threadId");
  const groupedThreads = groupThreads(threads);
  const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);
  const { deleteThread } = useThreads();

  const handleDeleteClick = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering thread selection
    setThreadToDelete(threadId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = useCallback(async () => {
    if (!threadToDelete) return;

    try {
      setDeletingThreadId(threadToDelete);

      // Call the delete function
      const success = await deleteThread(threadToDelete);

      if (success) {
        // If the deleted thread was currently selected, clear the selection
        if (threadToDelete === threadId) {
          setThreadId(null);
        }

        toast.success("Thread deleted successfully");
      } else {
        toast.error("Failed to delete thread");
      }
    } catch (error) {
      console.error("Error deleting thread:", error);
      toast.error("Error deleting thread");
    } finally {
      setDeletingThreadId(null);
      setShowDeleteConfirm(false);
      setThreadToDelete(null);
    }
  }, [threadToDelete, threadId, deleteThread, setThreadId]);

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setThreadToDelete(null);
    setDeletingThreadId(null);
  };

  return (
    <>
      <div className="h-full flex flex-col w-full gap-1 items-start justify-start overflow-y-scroll [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent">
        {Object.entries(groupedThreads).map(([groupName, conversations]) => {
          if (conversations.length === 0) return null;

          return (
            <div key={groupName} className="w-full">
              {/* Group Label */}
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 px-1 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {prettifyDateLabel(groupName)}
                  </span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {conversations.length}
                  </span>
                </div>
              </div>

              {/* Conversations in this group */}
              {conversations.map((t) => {
                let itemText = t.thread_id;
                if (
                  typeof t.values === "object" &&
                  t.values &&
                  "messages" in t.values &&
                  Array.isArray(t.values.messages) &&
                  t.values.messages?.length > 0
                ) {
                  const firstMessage = t.values.messages[0];
                  itemText = getContentString(firstMessage.content);
                }

                const isActive = t.thread_id === threadId;
                const isDeleting = deletingThreadId === t.thread_id;

                return (
                  <div
                    key={t.thread_id}
                    className={`group relative w-full px-1 py-1 rounded-lg ${
                      isActive ? "bg-blue-50" : "hover:bg-gray-50"
                    } ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      {/* Thread button */}
                      <div
                        className={`flex-1 text-left items-start justify-start font-normal w-[240px] py-2 px-3 rounded-lg cursor-pointer ${
                          isActive ? "text-blue-600" : ""
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (isDeleting) return;
                          onThreadClick?.(t.thread_id);
                          if (t.thread_id === threadId) return;
                          setThreadId(t.thread_id);
                        }}
                      >
                        <p className="truncate text-ellipsis text-sm">
                          {isDeleting ? "Deleting..." : itemText}
                        </p>
                      </div>

                      {/* Delete icon button */}
                      <button
                        disabled={isDeleting}
                        className={`h-10 w-10 p-0 flex items-center justify-center rounded-lg transition-all ${
                          isActive 
                            ? "text-red-600 hover:bg-red-100" 
                            : "opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-600 hover:bg-gray-200"
                        } ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={(e) => handleDeleteClick(t.thread_id, e)}
                        title="Delete thread"
                        aria-label={`Delete thread ${itemText}`}
                      >
                        {isDeleting ? (
                          <div className="h-4 w-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Thread"
        description="Are you sure you want to delete this thread? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        loading={!!deletingThreadId}
      />
    </>
  );
}
function ThreadHistoryLoading() {
  return (
    <div className="h-full flex flex-col w-full gap-2 items-start justify-start overflow-y-scroll [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent">
      {Array.from({ length: 30 }).map((_, i) => (
        <Skeleton key={`skeleton-${i}`} className="w-[280px] h-10" />
      ))}
    </div>
  );
}

export default function ThreadHistory() {
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  const [chatHistoryOpen, setChatHistoryOpen] = useQueryState(
    "chatHistoryOpen",
    parseAsBoolean.withDefault(false),
  );

  const { getThreads, deleteThread, threads, setThreads, threadsLoading, setThreadsLoading } =
    useThreads();

  useEffect(() => {
    if (typeof window === "undefined") return;
    setThreadsLoading(true);
    getThreads()
      .then(setThreads)
      .catch(console.error)
      .finally(() => setThreadsLoading(false));
  }, []);

  return (
    <>
      <div className="hidden lg:flex flex-col border-r-[1px] border-slate-300 items-start justify-start gap-6 h-screen w-[300px] shrink-0 shadow-inner-right">
        <div className="flex items-center justify-between w-full pt-1.5 px-4">
          <Button
            className="hover:bg-gray-100"
            variant="ghost"
            onClick={() => setChatHistoryOpen((p) => !p)}
          >
            {chatHistoryOpen ? (
              <PanelRightOpen className="size-5" />
            ) : (
              <PanelRightClose className="size-5" />
            )}
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">
            Thread History
          </h1>
        </div>
        {threadsLoading ? (
          <ThreadHistoryLoading />
        ) : (
          <ThreadList threads={threads} />
        )}
      </div>
      <div className="lg:hidden">
        <Sheet
          open={!!chatHistoryOpen && !isLargeScreen}
          onOpenChange={(open) => {
            if (isLargeScreen) return;
            setChatHistoryOpen(open);
          }}
        >
          <SheetContent side="left" className="lg:hidden flex">
            <SheetHeader>
              <SheetTitle>Thread History</SheetTitle>
            </SheetHeader>
            <ThreadList
              threads={threads}
              onThreadClick={() => setChatHistoryOpen((o) => !o)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
