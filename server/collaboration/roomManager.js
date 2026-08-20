/**
 * Server Room Manager for Pix / PixelIDE (Sprint 15)
 * Manages collaboration room state, room documents, chat history, and room cleanup.
 */

class RoomManager {
  constructor() {
    // Map roomId -> { roomId, createdAt, chatHistory: [], files: Map(fileId -> yjsUpdateBuffer) }
    this.rooms = new Map();
  }

  /**
   * Ensures room entry exists.
   */
  getOrCreateRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        roomId,
        createdAt: new Date().toISOString(),
        chatHistory: [],
        fileUpdates: new Map(), // fileId -> array of uint8 updates
      });
    }
    return this.rooms.get(roomId);
  }

  /**
   * Adds chat message to room history (max 100 messages retained).
   */
  addChatMessage(roomId, messageObj) {
    const room = this.getOrCreateRoom(roomId);
    room.chatHistory.push(messageObj);
    if (room.chatHistory.length > 100) {
      room.chatHistory.shift();
    }
    return messageObj;
  }

  /**
   * Gets chat history for a room.
   */
  getChatHistory(roomId) {
    const room = this.rooms.get(roomId);
    return room ? room.chatHistory : [];
  }

  /**
   * Cleans up room if empty.
   */
  cleanupRoomIfEmpty(roomId, activeUserCount) {
    if (activeUserCount <= 0 && this.rooms.has(roomId)) {
      this.rooms.delete(roomId);
    }
  }
}

export const roomManager = new RoomManager();
export default roomManager;
