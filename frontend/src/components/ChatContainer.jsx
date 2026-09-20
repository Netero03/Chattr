import { useChatStore } from "../store/chat/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import { useAuthStore } from "../store/auth/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import NoMessages from "./NoMessages";
import { Clipboard, Loader, X } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    isMessagesLoading,
    selectedUser,
    typingUsers,
    aiStreamText,
    isAIStreaming,
    aiSummary,
    aiTasks,
    clearAIArtifacts,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  const copySummary = async () => {
    if (!aiSummary) return;
    const sections = [aiSummary.summary];
    if (aiSummary.keyPoints?.length) sections.push(`Key points:\n- ${aiSummary.keyPoints.join("\n- ")}`);
    if (aiSummary.decisions?.length) sections.push(`Decisions:\n- ${aiSummary.decisions.join("\n- ")}`);
    if (aiSummary.openQuestions?.length) sections.push(`Open questions:\n- ${aiSummary.openQuestions.join("\n- ")}`);
    await navigator.clipboard?.writeText(sections.join("\n\n"));
  };

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    clearAIArtifacts();
  }, [selectedUser?._id, clearAIArtifacts]);

  return (
    <div className="h-full w-full flex flex-col">
      <ChatHeader />
      {messages.length === 0 && !isMessagesLoading ? (
        <NoMessages />
      ) : (
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {messages.map((message) => {
            const isAssistantMessage = message.isAI || message.senderId === "ai";
            const isOwnMessage = message.senderId === authUser._id;

            return (
              <div
                key={message._id}
                className={`chat min-w-0 ${
                  isAssistantMessage ? "chat-start" : isOwnMessage ? "chat-end" : "chat-start"
                }`}
              >
                <div className=" chat-image avatar">
                  <div className="size-10 rounded-full border">
                    <img
                      src={
                        isAssistantMessage
                          ? "/avatar.png"
                          : isOwnMessage
                            ? authUser.profilePic || "/avatar.png"
                            : selectedUser.profilePic || "/avatar.png"
                      }
                      alt="profile pic"
                    />
                  </div>
                </div>
                <div className="chat-header mb-1">
                  <span className="text-xs opacity-70 mr-2">
                    {isAssistantMessage ? "Chattr AI" : ""}
                  </span>
                  <time className="text-xs opacity-50 ml-1">
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
                <div
                  className={`chat-bubble wrap-anywhere whitespace-pre-wrap ${
                    isAssistantMessage ? "chat-bubble-primary" : ""
                  }`}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="rounded-md mb-2 w-full max-w-[90vw] sm:max-w-[200px]"
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                  {message.gif && (
                    <div>
                      <video
                        src={message.gif}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="rounded-md mb-2 w-full max-w-[90vw] sm:max-w-[200px]"
                      />
                      <img src="klipy_watermark.png" alt="KLIPY" className="h-3" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Dummy div to scroll to bottom */}
          <div ref={messageEndRef} />
          {isAIStreaming && (
            <div className="chat chat-start">
              <div className="chat-bubble chat-bubble-primary whitespace-pre-wrap">
                <span className="text-xs opacity-70">Chattr AI</span>
                <p>{aiStreamText || "Thinking..."}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {isMessagesLoading && (
        <div className="flex justify-center py-2">
          <Loader className="size-6 animate-spin opacity-50" />
        </div>
      )}

      {(aiSummary || aiTasks.length > 0) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation">
          <div
            className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-lg border border-primary/30 bg-base-100 p-4 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-inspector-title"
          >
            <div className="flex items-center justify-between gap-2">
              <h4 id="ai-inspector-title" className="text-lg font-semibold text-primary">AI inspector</h4>
              <div className="flex gap-1">
                {aiSummary && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={copySummary} title="Copy summary">
                    <Clipboard size={16} />
                    <span className="sr-only">Copy summary</span>
                  </button>
                )}
                <button type="button" className="btn btn-ghost btn-sm" onClick={clearAIArtifacts} title="Close AI inspector">
                  <X size={16} />
                  <span className="sr-only">Close AI inspector</span>
                </button>
              </div>
            </div>

            {aiSummary && (
              <section className="mt-3">
                <h5 className="font-medium">Summary</h5>
                <p className="mt-1 whitespace-pre-wrap text-sm">{aiSummary.summary}</p>
                {aiSummary.keyPoints?.length > 0 && (
                  <>
                    <h5 className="mt-3 font-medium">Key points</h5>
                    <ul className="list-disc pl-5 text-sm opacity-80">
                      {aiSummary.keyPoints.map((point) => <li key={point}>{point}</li>)}
                    </ul>
                  </>
                )}
                {aiSummary.decisions?.length > 0 && (
                  <>
                    <h5 className="mt-3 font-medium">Decisions</h5>
                    <ul className="list-disc pl-5 text-sm opacity-80">
                      {aiSummary.decisions.map((decision) => <li key={decision}>{decision}</li>)}
                    </ul>
                  </>
                )}
                {aiSummary.openQuestions?.length > 0 && (
                  <>
                    <h5 className="mt-3 font-medium">Open questions</h5>
                    <ul className="list-disc pl-5 text-sm opacity-80">
                      {aiSummary.openQuestions.map((question) => <li key={question}>{question}</li>)}
                    </ul>
                  </>
                )}
              </section>
            )}

            {aiTasks.length > 0 && (
              <section className="mt-4">
                <h5 className="font-medium">Action items</h5>
                <ul className="mt-2 space-y-2 text-sm">
                  {aiTasks.map((taskItem, index) => (
                    <li key={`${taskItem.task}-${index}`} className="rounded-md border border-base-300 p-2">
                      <div className="font-medium">{taskItem.task}</div>
                      <div className="opacity-75">
                        {taskItem.owner ? `Owner: ${taskItem.owner}` : "Owner: unassigned"}
                        {taskItem.dueDate ? ` • Due: ${taskItem.dueDate}` : ""}
                        {taskItem.priority ? ` • Priority: ${taskItem.priority}` : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="mt-4 flex justify-end">
              <button type="button" className="btn btn-sm btn-primary" onClick={clearAIArtifacts}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Typing indicator */}
      {selectedUser && typingUsers.has(selectedUser._id) && (
        <p className="italic mx-4 text-sm">
          {selectedUser.fullName} is typing...
        </p>
      )}
      <MessageInput />
    </div>
  );
};
export default ChatContainer;
