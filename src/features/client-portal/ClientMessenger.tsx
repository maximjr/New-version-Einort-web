import { useState, useEffect, useRef } from "react";
import {
  Send,
  Loader2,
  X,
  Paperclip,
  Activity,
  ChevronLeft,
  MoreVertical,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  messageService,
  Message,
} from "../../services/admin/messageService";
import { useMessaging } from "../../hooks/useMessaging";

interface ClientMessengerProps {
  userId: string;
  userEmail: string;
  userName: string;
  onClose?: () => void;
}



export function ClientMessenger({
  userId,
  userEmail,
  userName,
  onClose,
}: ClientMessengerProps) {
  const { conversations } = useMessaging();
    const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [adminIdResolved, setAdminIdResolved] = useState<string>("super_admin");
  const [inputText, setInputText] = useState("");
  const [adminOnline, setAdminOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [showAttachMock, setShowAttachMock] = useState(false);
  const [mockAttachment, setMockAttachment] = useState<string | null>(null);

  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let active = true;

    messageService.setPresence(userId, true, "client");

    async function initConversation() {
      try {
        const superAdminId = await messageService.getSuperAdminUid();
        if (active) {
          setAdminIdResolved(superAdminId);
        }

        await messageService.migrateLegacyConversation(userId, superAdminId);

        const id = await messageService.getOrCreateConversation(
          userId,
          superAdminId,
        );
        if (active) {
          setConversationId(id);
        }
      } catch (err: any) {
        if (
          err?.code !== "permission-denied" &&
          !err?.message?.includes("Missing or insufficient permissions")
        ) {
          console.error("Failed to establish secure conduit:", err);
        }
        if (active) {
          setSyncError("Communication channel initializing...");
          setLoading(false);
        }
      }
    }

    initConversation();

    return () => {
      active = false;
      messageService.setPresence(userId, false, "client");
    };
  }, [userId, userEmail, userName]);

  useEffect(() => {
    if (!conversationId) return;

    messageService.markAsRead(conversationId, userId);

    const unsubMessages = messageService.subscribeMessages(
      conversationId,
      (newMessages) => {
        setMessages(newMessages);
        setLoading(false);
        messageService.markAsRead(conversationId, userId);
      },
      (err) => {
        console.warn("Messages stream subscription failure:", err);
        setSyncError("Messages streams read authorization denied.");
        setLoading(false);
      },
    );

    const unsubAdminPresence = messageService.subscribePresence(
      adminIdResolved,
      (presenceData) => {
        if (presenceData) {
          setAdminOnline(!!presenceData.isOnline);
        } else {
          setAdminOnline(false);
        }
      },
    );

    return () => {
      unsubMessages();
      unsubAdminPresence();
    };
  }, [conversationId, userId, adminIdResolved]);

  useEffect(() => {
    if (conversationId && conversations) {
      const found = conversations.find((c) => c.id === conversationId);
      if (found) {
      }
    }
  }, [conversations, conversationId]);

  const isInitialScrollRef = useRef(true);
  const prevMessagesLengthRef = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;
    setIsNearBottom(isAtBottom);
  };

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Premium optimized scrolling: snap to bottom on load, smooth only on new messages
    if (messageEndRef.current) {
      if (isInitialScrollRef.current) {
         messageEndRef.current.scrollIntoView({ behavior: "auto" });
         if (!loading) {
            isInitialScrollRef.current = false;
         }
      } else if (messages.length > prevMessagesLengthRef.current) {
        // Only auto-scroll if user is already near bottom (or if it's the current user sending a message - but we can just rely on near bottom)
        if (isNearBottom) {
          messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages, loading, isNearBottom]);

  useEffect(() => {
    if (inputText === '' && inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  }, [inputText]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !mockAttachment) return;
    if (!conversationId) return;

    setSending(true);
    const textToSend = inputText.trim();
    const attachments = mockAttachment
      ? [{ name: "Attached Document Reference", url: mockAttachment }]
      : [];

    setInputText("");
    setMockAttachment(null);
    setShowAttachMock(false);

    try {
      await messageService.sendMessage(
        conversationId,
        userId,
        adminIdResolved,
        textToSend || "Shared an attachment preview reference.",
        attachments.length > 0 ? "file" : "text",
        attachments,
      );
      
      scrollToBottom();
      
      // Auto-focus input after send (desktop mainly, skip on mobile to prevent keyboard bounce)
      if (window.innerWidth > 768) {
         inputRef.current?.focus();
      }
    } catch (err) {
      console.error("Error sending enterprise payload:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const simulateAttachment = (type: string) => {
    if (type === "blueprint") {
      setMockAttachment(
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop",
      );
    } else {
      setMockAttachment(
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop",
      );
    }
    setShowAttachMock(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] dark:bg-[#09090b] md:bg-transparent md:dark:bg-transparent overflow-hidden relative">
      {/* 
        Header: iOS style clean header on mobile, elegant slate on desktop 
      */}
      <div className="h-16 md:h-[72px] px-2 md:px-5 bg-white/80 dark:bg-[#0a0f18]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/[0.05] flex items-center justify-between relative z-20 shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden w-10 h-10 flex items-center justify-center text-primary transition-colors cursor-pointer active:opacity-70"
            >
              <ChevronLeft size={28} strokeWidth={2.5} />
            </button>
          )}
          
          <div className="relative flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center border border-black/5 dark:border-white/10 shadow-sm overflow-hidden">
                <img src="/favicon.png" alt="Einort" className="w-5 h-5 md:w-6 md:h-6 object-contain" onError={(e) => { e.currentTarget.style.display='none'; }}/>
                {/* Fallback pattern if image fails */}
                <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-500 dark:text-slate-400 -z-10">
                  ES
                </div>
              </div>
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2 border-white dark:border-[#0a0f18] ${adminOnline ? "bg-emerald-500" : "bg-slate-400 dark:bg-slate-600"}`}
              ></span>
            </div>
            <div className="flex flex-col justify-center">
              <h4 className="text-[15px] md:text-[16px] font-semibold tracking-tight text-slate-900 dark:text-white leading-tight">
                Einort Support
              </h4>
              <p className="text-[12px] md:text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-1 flex items-center gap-1.5">
                {adminOnline ? "Always active" : "Typically replies in 5m"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center">
           <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer active:opacity-70">
              <MoreVertical size={20} />
            </button>
          {onClose && (
            <button
              onClick={onClose}
              className="hidden md:flex w-9 h-9 rounded-full items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {syncError && (
        <div className="bg-red-50 dark:bg-red-500/10 border-b border-red-100 dark:border-red-500/20 py-2.5 px-5 text-[12px] text-red-600 dark:text-red-400 flex items-center justify-center gap-2 shrink-0">
          <Activity size={14} className="animate-pulse" />
          <span className="font-medium">{syncError}</span>
        </div>
      )}

      {/* Message Timeline */}
      <div className="relative flex-1 flex flex-col overflow-hidden">
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          data-lenis-prevent="true"
          className="flex-1 overflow-y-auto px-4 py-6 space-y-6 md:space-y-8 bg-black/[0.02] dark:bg-black/20 scrollbar-premium"
        >
          {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-6">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-20 h-20 bg-primary/10 rounded-full blur-[30px] animate-pulse"></div>
              <div className="w-8 h-8 border-[1.5px] border-black/5 dark:border-white/5 border-t-[#007AFF] dark:border-t-primary rounded-full animate-spin"></div>
            </div>
            <div className="h-[2px] w-20 flex overflow-hidden rounded-full bg-black/5 dark:bg-white/5 relative">
               <div className="absolute inset-y-0 left-0 bg-[#007AFF] dark:bg-primary w-1/3 rounded-full animate-progress z-10"></div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 pb-12 space-y-6">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border border-black/5 dark:border-white/5 flex items-center justify-center text-slate-300 dark:text-slate-600 shadow-xl relative overflow-hidden">
               <img src="/favicon.png" alt="Einort" className="w-10 h-10 md:w-12 md:h-12 object-contain opacity-50" onError={(e) => { e.currentTarget.style.display='none'; }}/>
            </div>
            <div className="space-y-2 max-w-[280px] md:max-w-sm">
              <h5 className="text-[17px] md:text-[20px] font-semibold text-slate-900 dark:text-white tracking-tight">
                How can we help?
              </h5>
              <p className="text-slate-500 dark:text-slate-400 text-[14px] md:text-[15px] leading-relaxed">
                Send us a message and our engineering team will get back to you shortly.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8 pb-4">
            {messages.map((ms, idx) => {
              const isMe = ms.senderId === userId;
              
              // Grouping logic based on time
              let showTimestamp = true;
              if (idx > 0) {
                 const prevMs = messages[idx - 1];
                 const timeDiff = Math.abs((ms.timestamp?.toMillis?.() || Date.now()) - (prevMs.timestamp?.toMillis?.() || Date.now()));
                 // If less than 5 minutes, don't show giant timestamp unless it's a new sender
                 if (timeDiff < 300000 && ms.senderId === prevMs.senderId) {
                    showTimestamp = false;
                 }
              }

              return (
                <div key={ms.id || idx} className="flex flex-col">
                  {showTimestamp && (
                     <div className="flex justify-center mb-5 md:mb-6 mt-2">
                        <span className="text-[11px] md:text-[12px] font-semibold text-slate-400 dark:text-slate-500 tracking-wide">
                          {ms.timestamp ? new Date(ms.timestamp?.toDate ? ms.timestamp.toDate() : ms.timestamp).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Just now"}
                        </span>
                     </div>
                  )}
                  
                  <motion.div
                    layout="position"
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2.5 group`}
                  >
                    {!isMe && (
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-black/5 dark:border-white/5 flex items-center justify-center shrink-0 shadow-sm mb-1 overflow-hidden">
                        <img src="/favicon.png" alt="ES" className="w-4 h-4 object-contain brightness-0 opacity-40 dark:brightness-200" onError={(e) => { e.currentTarget.style.display='none'; }}/>
                      </div>
                    )}
                    <div className={`max-w-[85%] md:max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <div
                        className={`px-4 py-2.5 md:py-3 text-[15px] leading-[1.4] tracking-[-0.01em] shadow-sm transition-all ${
                          isMe
                            ? "bg-[#007AFF] text-white rounded-[20px] rounded-br-[4px]" // iMessage Blue
                            : "bg-white dark:bg-[#1a2133] text-slate-900 dark:text-slate-100 rounded-[20px] rounded-bl-[4px] border border-black/5 dark:border-white/[0.05]"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {ms.text}
                        </p>

                        {/* Attachments rendering */}
                        {ms.attachments && ms.attachments.length > 0 && (
                          <div
                            className={`mt-3 pt-3 border-t space-y-2 ${isMe ? "border-white/20" : "border-black/10 dark:border-white/10"}`}
                          >
                            {ms.attachments.map((attach, aIdx) => (
                              <a
                                key={aIdx}
                                href={attach.url}
                                target="_blank"
                                rel="noreferrer"
                                className={`flex items-center gap-2 text-[13px] font-medium hover:opacity-80 transition-opacity ${
                                  isMe ? "text-white" : "text-primary"
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isMe ? 'bg-white/20' : 'bg-primary/10'}`}>
                                   <Paperclip size={14} />
                                </div>
                                <span className="truncate max-w-[150px] md:max-w-[200px]">{attach.name || "Attachment"}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Sub-bubble Status */}
                      {isMe && (
                         <div className={`flex items-center gap-1 mt-1 text-[11px] font-medium transition-opacity opacity-0 group-hover:opacity-100 ${ms.read ? 'text-[#007AFF] dark:text-primary' : 'text-slate-400 dark:text-slate-500'}`}>
                            {ms.read ? "Read" : "Delivered"}
                         </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              );
            })}
            <div ref={messageEndRef} className="h-4" />
          </div>
        )}
        
        <AnimatePresence>
          {!isNearBottom && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              onClick={scrollToBottom}
              className="absolute bottom-4 right-6 w-10 h-10 rounded-full bg-black/80 dark:bg-white/80 hover:bg-black dark:hover:bg-white text-white dark:text-black shadow-lg flex items-center justify-center backdrop-blur transition-all border border-black/10 dark:border-white/10 z-[100]"
              aria-label="Scroll to bottom"
            >
              <ChevronDown size={20} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      </div>

      {/* Message input panel */}
      <form
        onSubmit={handleSendMessage}
        className="bg-white/90 dark:bg-[#0a0f18]/90 backdrop-blur-xl border-t border-black/5 dark:border-white/[0.05] shrink-0
                   pb-[max(12px,env(safe-area-inset-bottom))] px-3 pt-3 md:px-5 md:pt-4 md:pb-5 relative z-30"
      >
        {mockAttachment && (
          <div className="flex items-center justify-between mb-3 bg-slate-50 dark:bg-primary/10 border border-slate-200 dark:border-primary/20 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 dark:text-primary mx-1">
            <span className="truncate flex items-center gap-2 font-medium">
              <div className="w-6 h-6 rounded bg-black/5 dark:bg-primary/20 flex items-center justify-center">
                 <Paperclip size={14} /> 
              </div>
              Attachment Ready
            </span>
            <button
              type="button"
              onClick={() => setMockAttachment(null)}
              className="text-slate-400 hover:text-slate-600 dark:text-primary/70 dark:hover:text-primary p-1 cursor-pointer rounded-full hover:bg-black/5 dark:hover:bg-primary/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2.5 md:gap-3 max-w-4xl mx-auto">
          {/* Attachment Button */}
          <div className="relative shrink-0 mb-1 pl-1 md:pl-0">
            <button
              type="button"
              onClick={() => setShowAttachMock(!showAttachMock)}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-slate-100 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/[0.08] hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            >
              <Paperclip size={20} strokeWidth={2} />
            </button>
            <AnimatePresence>
              {showAttachMock && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-14 left-0 w-56 bg-white dark:bg-[#1a2133] border border-black/10 dark:border-white/[0.08] rounded-2xl shadow-2xl p-2 space-y-1 z-50 backdrop-blur-xl"
                >
                  <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider px-3 py-2 border-b border-black/5 dark:border-white/5 mb-1 flex items-center gap-1.5">
                    Attach File
                  </p>
                  <button
                    type="button"
                    onClick={() => simulateAttachment("blueprint")}
                    className="w-full text-left font-medium text-[14px] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 py-3 px-3 rounded-xl transition-colors cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-primary/10 flex items-center justify-center shrink-0">
                       <Paperclip size={16} className="text-[#007AFF] dark:text-primary" />
                    </div>
                    Blueprint Document
                  </button>
                  <button
                    type="button"
                    onClick={() => simulateAttachment("audit")}
                    className="w-full text-left font-medium text-[14px] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 py-3 px-3 rounded-xl transition-colors cursor-pointer flex items-center gap-3"
                  >
                     <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-primary/10 flex items-center justify-center shrink-0">
                       <Paperclip size={16} className="text-[#007AFF] dark:text-primary" />
                    </div>
                    Deliverable Audit
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              onKeyDown={handleKeyPress}
              placeholder={sending ? "Sending..." : "Message Support..."}
              disabled={sending}
              rows={1}
              className="w-full min-h-[42px] md:min-h-[46px] max-h-32 bg-slate-100/80 dark:bg-[#141a26]/80 backdrop-blur-md border border-transparent focus:border-black/10 dark:focus:border-primary/30 rounded-[24px] px-4 py-2.5 md:py-[13px] text-base md:text-[14px] text-slate-900 dark:text-white placeholder-slate-500 font-normal focus:outline-none resize-none transition-colors scrollbar-premium disabled:opacity-50"
              style={{
                // Prevent iOS zoom on focus
                fontSize: '16px' 
              }}
            />
          </div>

          {/* Send Button: iMessage native style */}
          <div className="shrink-0 mb-0.5 md:mb-1 pr-1 md:pr-0">
            <button
              type="submit"
              disabled={sending || (!inputText.trim() && !mockAttachment)}
              className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                 (inputText.trim() || mockAttachment) && !sending
                   ? "bg-[#007AFF] dark:bg-primary hover:bg-[#005bb5] dark:hover:bg-primary-hover text-white shadow-md active:scale-95 cursor-pointer"
                   : "bg-slate-200 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-default"
              }`}
            >
              {sending ? (
                <Loader2 size={18} className="animate-spin text-white" />
              ) : (
                <Send size={16} className="ml-0.5" strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

