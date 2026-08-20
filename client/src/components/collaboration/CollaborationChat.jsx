import { useState, useRef, useEffect } from "react";
import { FiSend, FiMessageSquare } from "react-icons/fi";
import useCollaborationStore from "../../collaboration/collaborationStore";
import collaborationService from "../../collaboration/collaborationService";

export default function CollaborationChat() {
  const { chatMessages, identity } = useCollaborationStore();
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text || !text.trim()) return;
    collaborationService.sendChatMessage(text);
    setText("");
  };

  return (
    <div className="flex flex-col h-64 border border-neutral-800 rounded-xl bg-neutral-950/60 overflow-hidden font-sans text-xs">
      {/* Header */}
      <div className="px-3 py-2 bg-neutral-900/80 border-b border-neutral-800 flex items-center justify-between text-neutral-300 font-semibold">
        <span className="flex items-center gap-1.5 text-xs text-purple-300">
          <FiMessageSquare className="text-purple-400" />
          Project Chat
        </span>
        <span className="text-[10px] text-neutral-500 font-mono">
          {chatMessages.length} msgs
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 font-sans">
        {chatMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[11px] text-neutral-500 italic text-center">
            No messages yet. Say hi to your team!
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isSelf = msg.userId === identity.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isSelf ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1 text-[10px] text-neutral-400 mb-0.5 px-1 font-mono">
                  <span
                    style={{ color: msg.avatarColor || "#3B82F6" }}
                    className="font-bold"
                  >
                    {msg.senderName || "Collaborator"}
                  </span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div
                  className={`max-w-[85%] px-3 py-1.5 rounded-xl leading-relaxed text-xs break-words ${
                    isSelf
                      ? "bg-purple-600 text-white rounded-tr-none"
                      : "bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSend} className="p-2 bg-neutral-900 border-t border-neutral-800 flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
          className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-purple-500 font-sans"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white transition cursor-pointer"
          title="Send message"
        >
          <FiSend className="text-xs" />
        </button>
      </form>
    </div>
  );
}
