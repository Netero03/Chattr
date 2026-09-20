import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/chat/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import {
  MAX_MESSAGE_LENGTH,
  USER_TYPING_TIMEOUT_IN_MILLISECONDS,
} from "../../../shared/message.constants";
import GifModalButton from "./GifModalButton";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const {
    sendMessage,
    emitTypingEvent,
    emitStopTypingEvent,
    smartReplies,
    requestSmartReplies,
    autocomplete,
    requestAutocomplete,
    selectedUser,
    askAI,
    summarizeThread,
    extractTasks,
  } = useChatStore();

  useEffect(() => {
    requestSmartReplies();
  }, [requestSmartReplies, selectedUser?._id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const typingTimeoutRef = useRef(null);

  const handleTextChange = (e) => {
    setText(e.target.value);
    requestAutocomplete(e.target.value);

    // Use a timer to control user typing socket events
    emitTypingEvent();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(
      () => emitStopTypingEvent(),
      USER_TYPING_TIMEOUT_IN_MILLISECONDS,
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab" && autocomplete) {
      e.preventDefault();
      setText(`${text}${autocomplete}`);
    }
    if (e.key === "Escape") {
      useChatStore.setState({ autocomplete: "" });
    }
  };

  const handleAskAI = () => {
    const promptText = text.trim();
    if (!promptText) {
      messageInputRef.current?.focus();
      toast("Type a question for Chattr AI first.");
      return;
    }
    askAI(promptText);
    setText("");
    useChatStore.setState({ autocomplete: "" });
    emitStopTypingEvent();
  };

  const handleSummary = () => {
    summarizeThread();
    toast("Generating a conversation summary...");
  };

  const handleTasks = () => {
    extractTasks();
    toast("Extracting action items...");
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        gif: ""
      });

    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      emitStopTypingEvent();
    }
  };

  return (
    <div className="p-2 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {smartReplies.length > 0 && (
        <div className="mb-2 flex gap-2 overflow-x-auto">
          {smartReplies.map((reply) => (
            <button key={reply} type="button" className="btn btn-xs btn-outline whitespace-nowrap" onClick={() => setText(reply)}>
              {reply}
            </button>
          ))}
        </div>
      )}
      <div className="mb-2 flex items-center gap-2">
        <button type="button" className="btn btn-xs btn-outline" onClick={handleAskAI}>
          Ask AI
        </button>
        <button type="button" className="btn btn-xs btn-outline" onClick={handleSummary}>
          Summarize
        </button>
        <button type="button" className="btn btn-xs btn-outline" onClick={handleTasks}>
          Tasks
        </button>
      </div>
      {autocomplete && text && (
        <button type="button" className="mb-1 text-left text-sm opacity-50" onClick={() => setText(`${text}${autocomplete}`)}>
          {text}{autocomplete}
        </button>
      )}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            maxLength={MAX_MESSAGE_LENGTH}
            value={text}
            ref={messageInputRef}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
          <GifModalButton />
        </div>
        <button
          type="submit"
          className="flex btn btn-circle"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
