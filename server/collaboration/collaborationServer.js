/**
 * Server Collaboration Server for Pix / PixelIDE (Sprint 15)
 * Configures Socket.IO server and binds real-time events for presence, Yjs updates, remote cursors, file ops, and chat.
 */

import { Server } from "socket.io";
import presenceManager from "./presenceManager.js";
import roomManager from "./roomManager.js";
import { sanitizeRoomId, sanitizeUsername, sanitizeChatMessage } from "./collaborationUtils.js";

/**
 * Initializes Socket.IO server on top of HTTP server.
 * @param {import('http').Server} httpServer
 */
export const initCollaborationServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    maxHttpBufferSize: 5e6, // 5MB max payload
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    /**
     * Event: join-room
     * Payload: { projectId, userId, name, avatarColor, activeFile }
     */
    socket.on("join-room", (data = {}) => {
      try {
        const roomId = sanitizeRoomId(data.projectId || data.roomId || "default-project");
        const cleanName = sanitizeUsername(data.name);

        socket.join(roomId);

        const user = presenceManager.addUser({
          socketId: socket.id,
          userId: data.userId || socket.id,
          name: cleanName,
          avatarColor: data.avatarColor,
          roomId,
          activeFile: data.activeFile || "app.js",
        });

        roomManager.getOrCreateRoom(roomId);

        // Send current room state to joining client
        const roster = presenceManager.getRoomUsers(roomId);
        const chatHistory = roomManager.getChatHistory(roomId);

        socket.emit("room-joined", {
          roomId,
          user,
          roster,
          chatHistory,
        });

        // Broadcast updated presence roster to everyone in room
        io.to(roomId).emit("presence-update", {
          roomId,
          roster,
          event: "user-joined",
          user,
        });

        console.log(`[Socket.IO] User '${cleanName}' (${socket.id}) joined room: ${roomId}`);
      } catch (err) {
        console.error("[Socket.IO join-room error]", err);
      }
    });

    /**
     * Event: active-file-update
     * Payload: { roomId, activeFile }
     */
    socket.on("active-file-update", (data = {}) => {
      try {
        const user = presenceManager.getUser(socket.id);
        if (!user) return;

        presenceManager.updateActiveFile(socket.id, data.activeFile);
        const roster = presenceManager.getRoomUsers(user.roomId);

        io.to(user.roomId).emit("presence-update", {
          roomId: user.roomId,
          roster,
          event: "active-file-changed",
          user: presenceManager.getUser(socket.id),
        });
      } catch (err) {
        console.error("[Socket.IO active-file-update error]", err);
      }
    });

    /**
     * Event: username-update
     * Payload: { name }
     */
    socket.on("username-update", (data = {}) => {
      try {
        const user = presenceManager.getUser(socket.id);
        if (!user) return;

        presenceManager.updateUsername(socket.id, data.name);
        const roster = presenceManager.getRoomUsers(user.roomId);

        io.to(user.roomId).emit("presence-update", {
          roomId: user.roomId,
          roster,
          event: "username-changed",
          user: presenceManager.getUser(socket.id),
        });
      } catch (err) {
        console.error("[Socket.IO username-update error]", err);
      }
    });

    /**
     * Event: yjs-update
     * Relays Yjs document CRDT updates to other clients in room.
     * Payload: { roomId, fileId, update } (base64 or ArrayBuffer)
     */
    socket.on("yjs-update", (data = {}) => {
      try {
        const user = presenceManager.getUser(socket.id);
        const roomId = user ? user.roomId : sanitizeRoomId(data.roomId);

        if (!data.update || !data.fileId) return;

        // Broadcast CRDT update to all OTHER clients in the room
        socket.to(roomId).emit("yjs-update", {
          fileId: data.fileId,
          update: data.update,
          senderSocketId: socket.id,
        });
      } catch (err) {
        console.error("[Socket.IO yjs-update error]", err);
      }
    });

    /**
     * Event: cursor-update
     * Relays remote cursor position & selection range.
     * Payload: { roomId, fileId, cursor: { line, column }, selection: { startLine, startColumn, endLine, endColumn } }
     */
    socket.on("cursor-update", (data = {}) => {
      try {
        const user = presenceManager.getUser(socket.id);
        if (!user) return;

        socket.to(user.roomId).emit("cursor-update", {
          socketId: socket.id,
          userId: user.userId,
          name: user.name,
          color: user.avatarColor,
          fileId: data.fileId,
          cursor: data.cursor,
          selection: data.selection,
        });
      } catch (err) {
        console.error("[Socket.IO cursor-update error]", err);
      }
    });

    /**
     * Event: file-op
     * Syncs file operations (create, delete, rename, full-content sync)
     * Payload: { type: 'create' | 'delete' | 'rename' | 'sync', file, oldName, newName }
     */
    socket.on("file-op", (data = {}) => {
      try {
        const user = presenceManager.getUser(socket.id);
        const roomId = user ? user.roomId : sanitizeRoomId(data.roomId);

        socket.to(roomId).emit("file-op", {
          ...data,
          senderSocketId: socket.id,
        });
      } catch (err) {
        console.error("[Socket.IO file-op error]", err);
      }
    });

    /**
     * Event: chat-message
     * Broadcasts room chat message.
     * Payload: { message }
     */
    socket.on("chat-message", (data = {}) => {
      try {
        const user = presenceManager.getUser(socket.id);
        if (!user) return;

        const cleanText = sanitizeChatMessage(data.message || data.text);
        if (!cleanText) return;

        const messageObj = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          socketId: socket.id,
          userId: user.userId,
          senderName: user.name,
          avatarColor: user.avatarColor,
          text: cleanText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        roomManager.addChatMessage(user.roomId, messageObj);

        io.to(user.roomId).emit("chat-message", messageObj);
      } catch (err) {
        console.error("[Socket.IO chat-message error]", err);
      }
    });

    /**
     * Event: disconnect
     */
    socket.on("disconnect", () => {
      try {
        const removedUser = presenceManager.removeUser(socket.id);
        if (removedUser) {
          const { roomId } = removedUser;
          const roster = presenceManager.getRoomUsers(roomId);

          io.to(roomId).emit("presence-update", {
            roomId,
            roster,
            event: "user-left",
            user: removedUser,
          });

          roomManager.cleanupRoomIfEmpty(roomId, roster.length);
          console.log(`[Socket.IO] User '${removedUser.name}' (${socket.id}) disconnected from room: ${roomId}`);
        }
      } catch (err) {
        console.error("[Socket.IO disconnect error]", err);
      }
    });
  });

  return io;
};

export default initCollaborationServer;
