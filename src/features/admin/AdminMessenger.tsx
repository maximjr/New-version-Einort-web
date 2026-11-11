import { useState, useEffect, useRef } from "react";
import { 
  Send, 
  MessageSquare, 
  Loader2, 
  X,
  Check,
  CheckCheck,
  Paperclip,
  Activity,
  Flag,
  Archive,
  CheckCircle2,
  FolderLock,
  Globe,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { messageService, Conversation, Message } from "../../services/admin/messageService";

interface AdminMessengerProps {
  clients: any[];
  currentAdminId: string;
}

import { useMessaging } from "../../hooks/useMessaging";
import { useTranslation } from "react-i18next";

function safelyFormatTime(timestamp: any, t: any): string {
  try {
    if (!timestamp) return t("messenger.now");
    if (typeof timestamp.toDate === "function") {
      return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (timestamp instanceof Date) {
      return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (typeof timestamp === 'number') {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  } catch (err) {
    console.debug("Failed parsing timestamp:", err);
  }
  return t("messenger.sent");
}

export function AdminMessenger({ clients, currentAdminId }: AdminMessengerProps) {
  const { t } = useTranslation("admin");
  const { conversations } = useMessaging();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [clientPresence, setClientPresence] = useState<Record<string, boolean>>({});
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [mockAttachment, setMockAttachment] = useState<string | null>(null);
  const [showAttachMock, setShowAttachMock] = useState(false);

  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isInitialScrollRef = useRef(true);

  // Reset scroll behavior on client change
  useEffect(() => {
    isInitialScrollRef.current = true;
    prevMessagesLengthRef.current = 0;
  }, [selectedClientId]);

  // 1. Register Admin Presence on mount
  useEffect(() => {
    messageService.setPresence(currentAdminId, true, "super_admin");
    return () => {
      messageService.setPresence(currentAdminId, false, "super_admin");
    };
  }, [currentAdminId]);

  // 3. Monitor individual Client Presences globally
  useEffect(() => {
    const unsubscibers: (() => void)[] = [];
    
    clients.forEach((c) => {
      const unsub = messageService.subscribePresence(c.id, (presence) => {
        setClientPresence((prev) => ({
          ...prev,
          [c.id]: !!presence?.isOnline
        }));
      });
      unsubscibers.push(unsub);
    });

    return () => {
      unsubscibers.forEach((unsub) => unsub());
    };
  }, [clients]);

  // 4. Handle selecting a client conversation
  useEffect(() => {
    if (!selectedClientId) {
      setSelectedConversation(null);
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    let active = true;

    async function openChat() {
      try {
        const id = await messageService.getOrCreateConversation(selectedClientId!, currentAdminId);
        if (!active) return;

        // Clear Admin unread counts when opening this conversation
        messageService.markAsRead(id, currentAdminId);

        // Map updates to conversation selection
        // Automatically handled by the effect below. No need for another manual subscription here.

        // Load Messages
        const unsubMsgs = messageService.subscribeMessages(id, (newMsgs) => {
          if (!active) return;
          setMessages(newMsgs);
          setLoadingMessages(false);
          // Auto clear admin unread counts on fresh incoming payload
          messageService.markAsRead(id, currentAdminId);
        }, (err) => {
          console.warn("Messages loading failed for conversation:", id, err);
          if (active) {
            setSyncError("Messages link broken.");
            setLoadingMessages(false);
          }
        });

        return () => {
          unsubMsgs();
        };
      } catch (err) {
        console.error("Error setting up dynamic chat pipeline:", err);
        if (active) setLoadingMessages(false);
      }
    }

    let unsubscribersPromise = openChat();

    return () => {
      active = false;
      unsubscribersPromise.then((unsub) => unsub?.());
    };
  }, [selectedClientId, currentAdminId]);

  // Map updates to conversation selection globally from hook
  useEffect(() => {
    if (selectedClientId && conversations.length > 0) {
      const id = `${selectedClientId}_${currentAdminId}`;
      const found = conversations.find((c) => c.id === id);
      if (found) {
        setSelectedConversation(found);
      }
    }
  }, [conversations, selectedClientId, currentAdminId]);

  // 5. Scroll to bottom of message panel
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
    if (messageEndRef.current) {
      if (isInitialScrollRef.current) {
         messageEndRef.current.scrollIntoView({ behavior: "auto" });
         if (!loadingMessages) {
            isInitialScrollRef.current = false;
         }
      } else if (messages.length > prevMessagesLengthRef.current) {
         if (isNearBottom) {
           messageEndRef.current.scrollIntoView({ behavior: "smooth" });
         }
      }
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages, loadingMessages, isNearBottom]);

  useEffect(() => {
    if (inputText === '' && inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  }, [inputText]);

  // 6. Send payload
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !mockAttachment) return;
    if (!selectedClientId || !selectedConversation) return;

    setSending(true);
    const textToSend = inputText.trim();
    const attachments = mockAttachment ? [{ name: "Review and Document.pdf", url: mockAttachment }] : [];

    setInputText("");
    setMockAttachment(null);
    setShowAttachMock(false);

    try {
      await messageService.sendMessage(
        selectedConversation.id,
        currentAdminId,
        selectedClientId,
        textToSend || t("messenger.administrative_shared"),
        attachments.length > 0 ? "file" : "text",
        attachments
      );
      
      scrollToBottom();
      
      if (window.innerWidth > 768) {
         inputRef.current?.focus();
      }
    } catch (err) {
      console.error("Administrative send action blocked:", err);
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

  const updatePriority = async (priority: string) => {
    if (!selectedConversation) return;
    try {
      await messageService.updateConversationPriority(selectedConversation.id, priority);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (status: string) => {
    if (!selectedConversation) return;
    try {
      await messageService.updateConversationStatus(selectedConversation.id, status);
    } catch (err) {
      console.error(err);
    }
  };

  const simulateAttachment = () => {
    setMockAttachment("https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop");
    setShowAttachMock(false);
  };

  // Find client info safely
  const activeSelectedClient = clients.find((c) => c.id === selectedClientId);

  return (
    <div className="flex flex-col lg:flex-row h-full lg:h-[650px] bg-[#0a0f18]/90 border border-white/[0.05] rounded-3xl overflow-hidden shadow-2xl relative">
      {/* Background flare */}
      <div className="hidden lg:block absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full pointer-events-none -mr-40 -mt-40"></div>

      {/* LEFT PANEL: Conversation and client directory */}
      <div className="w-full lg:w-[320px] flex flex-col border-r border-white/[0.05] bg-black/20 shrink-0">
        <div className="p-5 border-b border-white/[0.05]">
          <h3 className="text-[13px] font-semibold tracking-wide text-white flex items-center gap-2">
            <MessageSquare size={16} className="text-primary" /> {t("messenger.active_clients")}
          </h3>
          <p className="text-[11px] text-slate-500 font-light mt-1 w-full truncate">{t("messenger.select_client")}</p>
        </div>

        <div className="flex-1 overflow-y-auto w-full scrollbar-premium pb-4" data-lenis-prevent="true">
          {clients.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-[13px] font-light">
              {t("messenger.no_registered_clients")}
            </div>
          ) : (
            <div className="px-3 pt-3 space-y-1">
              {clients.map((c) => {
                const convId = `${c.id}_${currentAdminId}`;
                const conv = conversations.find((v) => v.id === convId);
                const unread = conv?.unreadCount?.[currentAdminId] || 0;
                const online = clientPresence[c.id] || false;
                const isSelected = selectedClientId === c.id;
                const clientName = c.fullName || c.displayName || c.name || t("placeholders.role_client");

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClientId(c.id)}
                    className={`w-full flex items-center gap-3 p-3 text-left transition-all rounded-xl relative ${
                      isSelected
                        ? "bg-primary/10 border-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                        : "bg-transparent hover:bg-white/[0.03] border-transparent"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-[13px] uppercase transition-colors ${isSelected ? "bg-primary text-white shadow-lg" : "bg-white/[0.05] text-slate-300"}`}>
                        {clientName.substring(0, 2)}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0a0f18] transition-colors ${online ? "bg-emerald-400" : "bg-transparent border-transparent"}`}></span>
                    </div>

                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className={`text-[13px] font-medium truncate pr-2 ${isSelected ? "text-white" : "text-slate-300"}`}>{clientName}</p>
                        {unread > 0 && (
                          <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 bg-cyan-500 text-[#0a0f18] text-[10px] font-bold rounded-full shadow-[0_0_10px_rgba(34,211,238,0.4)]">
                            {unread}
                          </span>
                        )}
                      </div>
                      
                      {conv?.lastMessage ? (
                        <p className={`text-[11px] truncate leading-relaxed font-light ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                          {conv.lastMessage}
                        </p>
                      ) : (
                        <p className={`text-[11px] truncate font-light italic ${isSelected ? "text-slate-400" : "text-slate-600"}`}>
                          {t("messenger.no_messages")}
                        </p>
                      )}
                    </div>

                    {conv?.priority && conv.priority !== "none" && (
                      <span className={`absolute left-0 top-1/2 -mt-2 w-1 h-4 rounded-r-md ${
                        conv.priority === "high" ? "bg-red-500/80" : conv.priority === "medium" ? "bg-orange-500/80" : "bg-yellow-500/80"
                      }`}></span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Dynamic messaging zone */}
      <div className="flex-1 flex flex-col relative z-10 w-full min-h-[460px]">
        {syncError && (
          <div className="absolute top-0 left-0 right-0 z-50 bg-red-500/10 backdrop-blur-md border-b border-red-500/20 px-5 py-2.5 text-red-500 text-[11px] flex items-center justify-center gap-2">
            <Activity size={14} className="animate-pulse" />
            <span>{syncError}</span>
          </div>
        )}

        {selectedClientId && activeSelectedClient ? (
          <div className="flex flex-col h-full bg-transparent flex-1">
            {/* Header / Client Info & Flags controller */}
            <div className="px-5 py-4 border-b border-white/[0.05] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-black/10 backdrop-blur-md shrink-0">
               <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/10 text-white flex items-center justify-center font-medium text-sm uppercase shrink-0">
                      {(activeSelectedClient.fullName || activeSelectedClient.displayName || activeSelectedClient.name || "CL").substring(0, 2)}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-[14px] font-semibold tracking-wide text-white">
                        {activeSelectedClient.fullName || activeSelectedClient.displayName || activeSelectedClient.name || t("placeholders.role_client")}
                      </h4>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium uppercase ${clientPresence[activeSelectedClient.id] ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-slate-400"}`}>
                        {clientPresence[activeSelectedClient.id] ? t("messenger.online") : t("messenger.offline")}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-light">{activeSelectedClient.email}</p>
                  </div>
               </div>

              {/* CRM Priority Flags Selector & Thread status */}
              <div className="flex flex-wrap items-center gap-1.5 md:gap-3 bg-white/[0.02] border border-white/[0.05] p-1.5 rounded-xl shrink-0">
                <div className="flex items-center gap-1.5 px-2">
                  <Flag size={12} className="text-slate-500" />
                  <select
                    value={selectedConversation?.priority || "none"}
                    onChange={(e) => updatePriority(e.target.value)}
                    className="bg-transparent text-slate-300 hover:text-white text-[11px] font-medium tracking-wide rounded focus:outline-none cursor-pointer py-1 appearance-none"
                  >
                    <option value="none" className="bg-[#0a0f18] text-slate-300">{t("messenger.standard_priority")}</option>
                    <option value="low" className="bg-[#0a0f18] text-slate-300">{t("messenger.low_priority")}</option>
                    <option value="medium" className="bg-[#0a0f18] text-slate-300">{t("messenger.medium_priority")}</option>
                    <option value="high" className="bg-[#0a0f18] text-slate-300">{t("messenger.high_priority")}</option>
                  </select>
                </div>

                <div className="w-[1px] h-4 bg-white/10 hidden md:block"></div>

                <div className="flex items-center gap-1.5 px-2">
                  <Archive size={12} className="text-slate-500" />
                  <select
                    value={selectedConversation?.status || "active"}
                    onChange={(e) => updateStatus(e.target.value)}
                    className="bg-transparent text-slate-300 hover:text-white text-[11px] font-medium tracking-wide rounded focus:outline-none cursor-pointer py-1 appearance-none"
                  >
                    <option value="active" className="bg-[#0a0f18] text-slate-300">{t("messenger.active")}</option>
                    <option value="archived" className="bg-[#0a0f18] text-slate-300">{t("messenger.archived")}</option>
                    <option value="closed" className="bg-[#0a0f18] text-slate-300">{t("messenger.closed")}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Timeline Stream Scroll */}
            <div className="relative flex-1 flex flex-col overflow-hidden">
              <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                data-lenis-prevent="true"
                className="flex-1 overflow-y-auto px-5 py-6 bg-gradient-to-b from-transparent to-black/10 scrollbar-premium"
              >
                {loadingMessages ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 py-12 text-slate-400">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <p className="text-[11px] font-medium tracking-wide">{t("messenger.retrieving_history")}</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5 py-12">
                  <div className="w-16 h-16 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-400 shadow-xl relative">
                    <div className="absolute inset-0 rounded-full bg-white/[0.02] blur-xl"></div>
                    <Globe className="w-6 h-6 relative z-10 opacity-50" />
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-[15px] font-semibold text-white tracking-wide">{t("messenger.secure_link_established")}</h5>
                    <p className="text-slate-400 font-light text-[13px] leading-relaxed max-w-sm mx-auto">
                      {t("messenger.channel_open", { name: activeSelectedClient.fullName || activeSelectedClient.displayName || activeSelectedClient.name || t("placeholders.role_client") })}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((ms, idx) => {
                    const isMe = ms.senderId === currentAdminId;
                    return (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        key={ms.id || idx}
                        className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2.5 group`}
                      >
                        {!isMe && (
                          <div className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/10 text-white flex items-center justify-center text-[10px] font-medium uppercase shrink-0 shadow-sm mb-5">
                            CL
                          </div>
                        )}
                        <div className={`max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                          <div className={`px-4 py-3 text-[13.5px] font-light shadow-[0_4px_24px_rgba(0,0,0,0.2)] transition-all ${
                            isMe 
                              ? "bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md text-white rounded-2xl rounded-br-sm border border-white/[0.08]" 
                              : "bg-white/[0.06] backdrop-blur-md text-slate-100 rounded-2xl rounded-bl-sm border border-white/[0.08]"
                          }`}>
                            <p className="whitespace-pre-wrap leading-relaxed break-words">{ms.text}</p>
                            
                            {ms.attachments && ms.attachments.length > 0 && (
                              <div className={`mt-3 pt-3 border-t space-y-2 ${isMe ? "border-white/10" : "border-white/10"}`}>
                                {ms.attachments.map((attach, aIdx) => (
                                  <a 
                                    key={aIdx}
                                    href={attach.url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className={`flex items-center gap-2 text-[12px] font-medium hover:underline transition-colors text-cyan-400 hover:text-cyan-300`}
                                  >
                                    <Paperclip size={12} className="shrink-0" />
                                    <span>{attach.name || t("messenger.attachment")}</span>
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className={`flex items-center gap-1.5 mt-1.5 px-1 text-[10px] text-slate-500 font-medium ${isMe ? "justify-end" : "justify-start"} transition-opacity`}>
                            <span>
                              {safelyFormatTime(ms.timestamp, t)}
                            </span>
                            {isMe && (
                              <span className="flex items-center ml-0.5">
                                {ms.read ? (
                                  <CheckCheck size={14} className="text-primary" />
                                ) : (
                                  <Check size={12} className="text-slate-500" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messageEndRef} className="h-2" />
                </div>
              )}
              
              <AnimatePresence>
                {!isNearBottom && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                    onClick={scrollToBottom}
                    className="absolute bottom-4 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white shadow-lg flex items-center justify-center backdrop-blur transition-all border border-white/10 z-[100]"
                    aria-label="Scroll to bottom"
                  >
                    <ChevronDown size={20} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            </div>

            {/* Admin reply composer */}
            <form onSubmit={handleSendMessage} className="p-3 md:p-4 bg-black/20 border-t border-white/[0.05] backdrop-blur-md shrink-0">
              {mockAttachment && (
                <div className="flex items-center justify-between mb-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl px-3 py-2 text-[12px] text-cyan-400">
                  <span className="truncate flex items-center gap-2 font-medium">
                    <CheckCircle2 size={14} /> {t("messenger.document_attached")}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setMockAttachment(null)}
                    className="text-cyan-400/80 hover:text-cyan-400 p-0.5 cursor-pointer rounded-full hover:bg-cyan-500/10 transition-colors"
                  >
                     <X size={14} />
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-end sm:items-end gap-2.5">
                <div className="relative shrink-0 mb-1 w-full sm:w-auto flex justify-between sm:block">
                  <button
                    type="button"
                    onClick={() => setShowAttachMock(!showAttachMock)}
                    className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer shadow-sm"
                  >
                    <Paperclip size={15} />
                  </button>
                  <AnimatePresence>
                    {showAttachMock && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-12 left-0 w-48 bg-[#1a2133] border border-white/[0.08] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] p-2 space-y-0.5 z-30"
                      >
                        <button 
                          type="button"
                          onClick={simulateAttachment}
                          className="w-full text-left font-medium text-[12px] text-slate-200 hover:text-white hover:bg-white/5 py-2 px-3 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                        >
                          <Paperclip size={12} className="text-primary" /> {t("messenger.engineering_audit")}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="w-full sm:flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                    }}
                    onKeyDown={handleKeyPress}
                    placeholder={t("messenger.reply_placeholder", { name: activeSelectedClient.fullName || activeSelectedClient.displayName || activeSelectedClient.name || t("placeholders.role_client") })}
                    disabled={sending}
                    rows={1}
                    className="w-full min-h-[44px] max-h-32 bg-white/[0.04] border border-white/[0.08] focus:border-white/20 focus:ring-1 focus:ring-white/10 rounded-2xl px-4 py-[13.5px] text-[14px] text-white placeholder-slate-400 font-light focus:outline-none resize-none transition-all scrollbar-premium shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending || (!inputText.trim() && !mockAttachment)}
                  className="w-full sm:w-11 h-11 sm:mb-0.5 rounded-full bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer font-medium text-[13px] sm:text-base"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : (
                    <>
                      <span className="sm:hidden block mr-2">{t("messenger.send")}</span>
                      <Send size={16} className="sm:ml-0.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-transparent">
            <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center text-slate-600 shadow-2xl relative mb-6">
              <div className="absolute inset-0 rounded-full bg-white/[0.01] blur-2xl"></div>
              <FolderLock size={28} className="relative z-10" />
            </div>
            <h3 className="text-[17px] font-semibold text-white tracking-wide mb-2">{t("messenger.executive_command_center")}</h3>
            <p className="text-slate-400 font-light text-[14px] max-w-sm mx-auto leading-relaxed">
              {t("messenger.select_client_long")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
