import React from 'react'
import { Smile } from 'lucide-react';
import { useChatStore } from "../store/chat/useChatStore";

export default function GifModalButton() {
  const { openGifModal } = useChatStore();

  return (
      <button type="button" className="flex btn btn-circle text-zinc-400" onClick={openGifModal}>
        <Smile size={20}/>
      </button>
  )
}