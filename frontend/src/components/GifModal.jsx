import React, { useState, useEffect } from "react";
import { useChatStore } from "../store/chat/useChatStore";
import { Loader } from "lucide-react";
import toast from "react-hot-toast";

const GifModal = () => {
  const {
    modalGifUrls,
    isGifsLoading,
    searchForGifs,
    getTrendingGifs,
    closeGifModal,
    sendMessage,
  } = useChatStore();
  const [searchTerm, setSearchTerm] = useState("");

  // Automatic GIF search request after search bar input
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedTerm(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedTerm) {
      searchForGifs(debouncedTerm);
    }
  }, [debouncedTerm, searchForGifs]);

  // Populate GIF modal with trending GIFs if no search terms present
  useEffect(() => {
    let isSearchTermEmpty = searchTerm.trim() === "";
    if (isSearchTermEmpty) {
      getTrendingGifs();
    }
  }, [searchTerm, getTrendingGifs]);

  const handleGifSelection = async (gifUrl) => {
    await handleSendMessage(gifUrl);
    toast.success("GIF sent successfully");
  };

  const handleSendMessage = async (gifUrl) => {
    try {
      await sendMessage({
        text: "",
        image: null,
        gif: gifUrl,
      });
    } catch (error) {
      console.error("Failed to send GIF:", error);
    }
  };

  return (
    <div id="gif_modal" className="modal modal-open">
      <div className="modal-box py-12 max-w-full pt-0 h-[96%]">
        <div className="sticky top-0 bg-base-100 z-10 w-full">
          {/* Search input */}
          <div className="flex flex-nowrap justify-between w-full items-center gap-2">
            <input
              type="text"
              placeholder="Search KLIPY"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-sm w-full my-4"
            />

            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={closeGifModal}
            >
              ✕
            </button>
          </div>

          <div className="bg-black rounded p-1 w-full">
            <a href="https://klipy.com/en-US" target="_blank" rel="noopener noreferrer" aria-label="Visit KLIPY website">
              <img
                src="powered_by_klipy.png"
                alt="Powered by KLIPY"
                className="max-h-6 m-auto"
              />
            </a>
          </div>
        </div>
        {/* Render GIF results */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {modalGifUrls.map((gifUrl) => (
            <button
              key={gifUrl}
              className="aspect-square overflow-hidden rounded-md hover:opacity-70"
              onClick={() => {
                handleGifSelection(gifUrl);
              }}
            >
              <video
                src={gifUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
        {/* No GIFs found message */}
        {modalGifUrls.length === 0 && !isGifsLoading && "No GIFs Found :("}

        {/* GIFs loading spinner */}
        {isGifsLoading && (
          <div className="flex justify-center py-2">
            <Loader className="size-6 animate-spin opacity-50" />
          </div>
        )}
      </div>
    </div>
  );
};

export default GifModal;
