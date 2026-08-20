/**
 * Server Presence Manager for Pix / PixelIDE (Sprint 15)
 * Tracks connected sockets, room memberships, user identities, active files, and presence rosters.
 */

import { getDeterministicColor, sanitizeUsername } from "./collaborationUtils.js";

class PresenceManager {
  constructor() {
    // Map socketId -> { socketId, userId, name, avatarColor, roomId, activeFile, connectedAt }
    this.users = new Map();
    // Map roomId -> Set of socketIds
    this.roomSockets = new Map();
  }

  /**
   * Registers or updates a user connection in a room.
   */
  addUser({ socketId, userId, name, avatarColor, roomId, activeFile = null }) {
    const cleanName = sanitizeUsername(name);
    const color = avatarColor || getDeterministicColor(userId || socketId);

    const userObj = {
      socketId,
      userId: userId || socketId,
      name: cleanName,
      avatarColor: color,
      roomId,
      activeFile: activeFile || "app.js",
      connectedAt: new Date().toISOString(),
    };

    this.users.set(socketId, userObj);

    if (!this.roomSockets.has(roomId)) {
      this.roomSockets.set(roomId, new Set());
    }
    this.roomSockets.get(roomId).add(socketId);

    return userObj;
  }

  /**
   * Updates active file for a user socket.
   */
  updateActiveFile(socketId, activeFile) {
    const user = this.users.get(socketId);
    if (user) {
      user.activeFile = activeFile || "app.js";
      return user;
    }
    return null;
  }

  /**
   * Updates display name for a user socket.
   */
  updateUsername(socketId, name) {
    const user = this.users.get(socketId);
    if (user) {
      user.name = sanitizeUsername(name);
      return user;
    }
    return null;
  }

  /**
   * Removes a socket connection.
   */
  removeUser(socketId) {
    const user = this.users.get(socketId);
    if (!user) return null;

    const { roomId } = user;
    this.users.delete(socketId);

    if (this.roomSockets.has(roomId)) {
      const roomSet = this.roomSockets.get(roomId);
      roomSet.delete(socketId);
      if (roomSet.size === 0) {
        this.roomSockets.delete(roomId);
      }
    }

    return user;
  }

  /**
   * Gets list of all connected users in a room.
   */
  getRoomUsers(roomId) {
    const socketIds = this.roomSockets.get(roomId);
    if (!socketIds) return [];

    const roster = [];
    socketIds.forEach((sId) => {
      const user = this.users.get(sId);
      if (user) roster.push(user);
    });
    return roster;
  }

  /**
   * Gets user object by socket ID.
   */
  getUser(socketId) {
    return this.users.get(socketId) || null;
  }
}

export const presenceManager = new PresenceManager();
export default presenceManager;
