/**
 * Client Collaboration Service for Pix / PixelIDE (Sprint 15)
 * Coordinates Socket.IO client connection, Yjs CRDT document synchronization,
 * Monaco Editor binding (y-monaco), remote cursors & selections, presence rosters,
 * file operations sync, and real-time chat.
 */

import { io } from "socket.io-client";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import useCollaborationStore from "./collaborationStore";
import useWorkspaceStore from "../store/workspaceStore";

const SERVER_URL =
  typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? window.location.origin
    : "http://localhost:5000";

class CollaborationService {
  constructor() {
    this.socket = null;
    this.activeRoomId = null;
    this.ydoc = new Y.Doc();
    this.monacoBinding = null;
    this.remoteDecorations = new Map(); // socketId -> decorationIds[]
    this.currentEditor = null;
    this.currentMonaco = null;
    this.activeFileId = null;
    this.isRemoteFileOp = false;

    // Listen to local Y.Doc updates and broadcast via Socket.IO
    this.ydoc.on("update", (update, origin) => {
      if (origin !== "remote" && this.socket && this.socket.connected && this.activeRoomId) {
        // Convert Uint8Array update to Base64 for safe JSON transmission over Socket.IO
        const base64Update = btoa(String.fromCharCode(...update));
        this.socket.emit("yjs-update", {
          roomId: this.activeRoomId,
          fileId: this.activeFileId || "default",
          update: base64Update,
        });
      }
    });
  }

  /**
   * Initializes Socket.IO connection and joins collaboration room for a project.
   */
  connect(projectId = "default-project") {
    if (this.activeRoomId === projectId && this.socket && this.socket.connected) {
      return;
    }

    this.activeRoomId = projectId;
    useCollaborationStore.getState().setCurrentRoomId(projectId);
    useCollaborationStore.getState().setConnectionStatus("connecting");

    if (!this.socket) {
      this.socket = io(SERVER_URL, {
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        transports: ["websocket", "polling"],
      });

      this._registerSocketListeners();
    } else if (this.socket.connected) {
      this._joinRoom();
    } else {
      this.socket.connect();
    }
  }

  /**
   * Registers Socket.IO event handlers.
   */
  _registerSocketListeners() {
    this.socket.on("connect", () => {
      console.log(`[Collab] Connected to server: ${this.socket.id}`);
      useCollaborationStore.getState().setConnectionStatus("connected");
      this._joinRoom();
    });

    this.socket.on("disconnect", () => {
      console.warn("[Collab] Disconnected from server");
      useCollaborationStore.getState().setConnectionStatus("disconnected");
      this._clearRemoteDecorations();
    });

    this.socket.on("connect_error", (err) => {
      console.warn("[Collab] Connection error:", err.message);
      useCollaborationStore.getState().setConnectionStatus("disconnected");
    });

    this.socket.on("room-joined", (data) => {
      console.log(`[Collab] Joined room '${data.roomId}'`);
      useCollaborationStore.getState().setPresenceList(data.roster || []);
      useCollaborationStore.getState().setChatMessages(data.chatHistory || []);
    });

    this.socket.on("presence-update", (data) => {
      useCollaborationStore.getState().setPresenceList(data.roster || []);
    });

    // Handle incoming Yjs CRDT updates from remote users
    this.socket.on("yjs-update", (data) => {
      if (!data.update) return;
      try {
        const binaryString = atob(data.update);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        Y.applyUpdate(this.ydoc, bytes, "remote");
      } catch (err) {
        console.error("[Collab] Failed to apply Yjs update:", err);
      }
    });

    // Handle incoming remote cursor position & selection
    this.socket.on("cursor-update", (data) => {
      this._handleRemoteCursor(data);
    });

    // Handle incoming file operations (create, delete, rename, content sync)
    this.socket.on("file-op", (data) => {
      this._handleRemoteFileOp(data);
    });

    // Handle incoming room chat messages
    this.socket.on("chat-message", (msg) => {
      useCollaborationStore.getState().addChatMessage(msg);
    });
  }

  /**
   * Internal helper to join room with local identity.
   */
  _joinRoom() {
    if (!this.socket || !this.socket.connected || !this.activeRoomId) return;

    const identity = useCollaborationStore.getState().identity;
    const activeFileId = useWorkspaceStore.getState().activeFileId;
    const files = useWorkspaceStore.getState().files || [];
    const activeFile = files.find((f) => f.id === activeFileId);

    this.socket.emit("join-room", {
      projectId: this.activeRoomId,
      userId: identity.id,
      name: identity.name,
      avatarColor: identity.avatarColor,
      activeFile: activeFile ? activeFile.name : "app.js",
    });
  }

  /**
   * Binds Monaco editor instance and active file model to Yjs CRDT document.
   */
  bindMonacoEditor(editor, monaco, activeFileId) {
    this.currentEditor = editor;
    this.currentMonaco = monaco;
    this.activeFileId = activeFileId;

    if (this.monacoBinding) {
      this.monacoBinding.destroy();
      this.monacoBinding = null;
    }

    if (!editor || !monaco || !activeFileId) return;

    const model = editor.getModel();
    if (!model) return;

    // Get or create Y.Text for this file ID inside Y.Doc
    const ytext = this.ydoc.getText(`file_${activeFileId}`);

    // If Y.Text is empty and local model has content, initialize Y.Text with local model content
    if (ytext.toString() === "" && model.getValue() !== "") {
      this.ydoc.transact(() => {
        ytext.insert(0, model.getValue());
      });
    }

    try {
      this.monacoBinding = new MonacoBinding(
        ytext,
        model,
        new Set([editor]),
        null // local awareness
      );
    } catch (e) {
      console.warn("[Collab] MonacoBinding warning:", e);
    }

    // Listen to local cursor & selection movement and broadcast via Socket.IO
    editor.onDidChangeCursorPosition((e) => {
      const selection = editor.getSelection();
      this._broadcastCursor(e.position, selection);
    });
  }

  /**
   * Broadcasts local cursor & selection to room.
   */
  _broadcastCursor(position, selection) {
    if (!this.socket || !this.socket.connected || !this.activeRoomId || !this.activeFileId) return;

    this.socket.emit("cursor-update", {
      fileId: this.activeFileId,
      cursor: {
        line: position ? position.lineNumber : 1,
        column: position ? position.column : 1,
      },
      selection: selection
        ? {
            startLine: selection.startLineNumber,
            startColumn: selection.startColumn,
            endLine: selection.endLineNumber,
            endColumn: selection.endColumn,
          }
        : null,
    });
  }

  /**
   * Renders remote cursor and selection decorations in Monaco.
   */
  _handleRemoteCursor(data) {
    if (!this.currentEditor || !this.currentMonaco) return;
    if (data.fileId !== this.activeFileId) return;

    const { socketId, name, color, cursor, selection } = data;
    const oldDecorations = this.remoteDecorations.get(socketId) || [];

    const newDecorations = [];

    // 1. Selection Range Highlight Decoration
    if (
      selection &&
      (selection.startLine !== selection.endLine || selection.startColumn !== selection.endColumn)
    ) {
      newDecorations.push({
        range: new this.currentMonaco.Range(
          selection.startLine,
          selection.startColumn,
          selection.endLine,
          selection.endColumn
        ),
        options: {
          className: `remote-selection-${socketId}`,
          isWholeLine: false,
        },
      });
    }

    // 2. Cursor Line & Label Decoration
    if (cursor) {
      newDecorations.push({
        range: new this.currentMonaco.Range(cursor.line, cursor.column, cursor.line, cursor.column),
        options: {
          className: `remote-cursor-${socketId}`,
          hoverMessage: { value: `**${name}** (Collaborator)` },
          beforeContentClassName: `remote-cursor-label-${socketId}`,
        },
      });
    }

    // Dynamically inject CSS for remote user cursor color & label tag
    this._injectRemoteCursorCSS(socketId, name, color);

    const updatedIds = this.currentEditor.deltaDecorations(oldDecorations, newDecorations);
    this.remoteDecorations.set(socketId, updatedIds);
  }

  /**
   * Dynamically injects CSS rules for remote cursor highlight & username label.
   */
  _injectRemoteCursorCSS(socketId, name, color = "#3B82F6") {
    const styleId = `collab-style-${socketId}`;
    let styleEl = document.getElementById(styleId);

    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    styleEl.innerHTML = `
      .remote-selection-${socketId} {
        background-color: ${color}33 !important;
      }
      .remote-cursor-${socketId} {
        border-left: 2px solid ${color} !important;
      }
      .remote-cursor-label-${socketId}::before {
        content: "${name}";
        position: absolute;
        top: -18px;
        left: 0;
        background-color: ${color};
        color: #ffffff;
        font-size: 10px;
        font-family: sans-serif;
        padding: 1px 4px;
        border-radius: 3px;
        white-space: nowrap;
        pointer-events: none;
        z-index: 10;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }
    `;
  }

  /**
   * Clears all remote cursor decorations.
   */
  _clearRemoteDecorations() {
    if (this.currentEditor && this.remoteDecorations.size > 0) {
      this.remoteDecorations.forEach((decIds) => {
        this.currentEditor.deltaDecorations(decIds, []);
      });
      this.remoteDecorations.clear();
    }
  }

  /**
   * Broadcasts active file change when user switches tabs.
   */
  notifyActiveFileChanged(activeFileName) {
    if (!this.socket || !this.socket.connected || !this.activeRoomId) return;

    this.socket.emit("active-file-update", {
      roomId: this.activeRoomId,
      activeFile: activeFileName,
    });
  }

  /**
   * Broadcasts updated display name.
   */
  notifyUsernameChanged(newName) {
    if (!this.socket || !this.socket.connected || !this.activeRoomId) return;

    this.socket.emit("username-update", {
      name: newName,
    });
  }

  /**
   * Broadcasts file operation (create, delete, rename).
   */
  broadcastFileOp(opType, payload) {
    if (this.isRemoteFileOp) return; // Prevent echoing back remote operations
    if (!this.socket || !this.socket.connected || !this.activeRoomId) return;

    this.socket.emit("file-op", {
      roomId: this.activeRoomId,
      type: opType,
      ...payload,
    });
  }

  /**
   * Handles remote file operation events and updates local workspace store without loop.
   */
  _handleRemoteFileOp(data) {
    const { type, file, fileId, oldName, newName } = data;
    const store = useWorkspaceStore.getState();

    this.isRemoteFileOp = true;
    try {
      if (type === "create" && file) {
        const exists = store.files.some((f) => f.id === file.id || f.name === file.name);
        if (!exists) {
          store.createFile(file.name, file.language || "javascript", file.content || "");
        }
      } else if (type === "delete" && (fileId || file?.id)) {
        const id = fileId || file.id;
        store.closeFile(id);
      } else if (type === "rename" && fileId && newName) {
        store.renameFile(fileId, newName);
      }
    } catch (e) {
      console.warn("[Collab] Remote file op failed:", e);
    } finally {
      this.isRemoteFileOp = false;
    }
  }

  /**
   * Sends a real-time room chat message.
   */
  sendChatMessage(text) {
    if (!this.socket || !this.socket.connected || !this.activeRoomId) return;
    if (!text || !text.trim()) return;

    this.socket.emit("chat-message", {
      message: text.trim(),
    });
  }

  /**
   * Disconnects socket cleanly.
   */
  disconnect() {
    if (this.monacoBinding) {
      this.monacoBinding.destroy();
      this.monacoBinding = null;
    }
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.activeRoomId = null;
    useCollaborationStore.getState().setConnectionStatus("disconnected");
  }
}

export const collaborationService = new CollaborationService();
export default collaborationService;
