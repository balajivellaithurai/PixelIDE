/**
 * Zustand Store for Client Collaboration State (Sprint 15)
 * Manages socket connection status, collaborator presence, local user identity,
 * room chat messages, and share modal visibility.
 */

import { create } from "zustand";
import { getLocalIdentity, saveLocalIdentity } from "./collaborationUtils";

const useCollaborationStore = create((set, get) => ({
  // Connection Status: "disconnected" | "connecting" | "connected"
  connectionStatus: "disconnected",
  currentRoomId: null,

  // User Identity State
  identity: getLocalIdentity(),

  // Active Collaborators Roster: Array of { socketId, userId, name, avatarColor, activeFile, connectedAt }
  presenceList: [],

  // Project Room Chat
  chatMessages: [],

  // Share Modal UI
  showShareModal: false,

  // Actions
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setCurrentRoomId: (roomId) => set({ currentRoomId: roomId }),

  setIdentity: (newIdentity) => {
    const updated = saveLocalIdentity(newIdentity);
    set({ identity: updated });
  },

  setPresenceList: (roster) => set({ presenceList: roster || [] }),

  addChatMessage: (msg) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, msg].slice(-100), // Retain last 100 messages
    })),

  setChatMessages: (messages) => set({ chatMessages: messages || [] }),

  openShareModal: () => set({ showShareModal: true }),
  closeShareModal: () => set({ showShareModal: false }),
}));

export default useCollaborationStore;
