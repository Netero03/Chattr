import { handleToastErrorMessage } from "../../../lib/utils";
import { chatService } from "../../../services/chatService";

const createGifsSlice = (set) => ({
  isGifsLoading: false,
  modalGifUrls: [],
  isGifModalOpen: false,

  openGifModal: () => set({ isGifModalOpen: true }),
  closeGifModal: () => set({ isGifModalOpen: false }),

  searchForGifs: async (query) => {
    try {
      set({ isGifsLoading: true });
      const response = await chatService.searchForGifs(query);
      const newGifUrls = response.data;
      set({ modalGifUrls: newGifUrls });
    } catch (error) {
      handleToastErrorMessage(error);
    } finally {
      set({ isGifsLoading: false });
    }
  },

  getTrendingGifs: async () => {
    try {
      set({ isGifsLoading: true });
      const response = await chatService.getTrendingGifs();
      const newGifUrls = response.data;
      set({ modalGifUrls: newGifUrls });
    } catch (error) {
      handleToastErrorMessage(error);
    } finally {
      set({ isGifsLoading: false });
    }
  },

});

export default createGifsSlice;
