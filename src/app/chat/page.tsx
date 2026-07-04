'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@presentation/components/ui/page-header';
import { EmptyState } from '@presentation/components/ui/empty-state';
import { Card } from '@presentation/components/ui/card';
import { Button } from '@presentation/components/ui/button';
import { Input } from '@presentation/components/ui/input';
import { useLanguage } from '@core/providers/language-provider';
import {
  MessageSquare, Send, Plus, Pin, Star, Trash, RefreshCw, Copy, Search, Bot
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  model: string;
  isPinned: boolean;
  isFavorite: boolean;
  messages: Message[];
}

export default function ChatPage() {
  const { t } = useLanguage();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel] = useState('gpt-4o-mini');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load models & seed sessions
  useEffect(() => {
    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setModels(data.data);
        }
      })
      .catch(() => {});

    // Seed default chat session
    const defaultSession: ChatSession = {
      id: 'default-session-id',
      title: 'Welcome Session',
      model: 'gpt-4o-mini',
      isPinned: true,
      isFavorite: false,
      messages: [
        { role: 'assistant', content: 'Hello! I am Moataz AI assistant. How can I help you today?' },
      ],
    };
    setSessions([defaultSession]);
    setActiveSessionId('default-session-id');
  }, []);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isStreaming]);

  const handleCreateSession = () => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: `Chat ${sessions.length + 1}`,
      model: selectedModel,
      isPinned: false,
      isFavorite: false,
      messages: [],
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || !activeSessionId) return;

    if (!customText) setInput('');
    setIsStreaming(true);

    // Update session state with user message
    const userMsg: Message = { role: 'user', content: textToSend };
    let updatedMessages = [...(activeSession?.messages || []), userMsg];
    
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, messages: updatedMessages } : s))
    );

    try {
      // Setup SSE request
      const response = await fetch('/api/gateway/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: activeSession?.model || selectedModel,
          messages: updatedMessages,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from Gateway endpoint');
      }

      // Add placeholder assistant message
      const assistantMsg: Message = { role: 'assistant', content: '' };
      updatedMessages = [...updatedMessages, assistantMsg];
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId ? { ...s, messages: updatedMessages } : s))
      );

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split('\n');
          buffer = chunks.pop() || '';

          for (const chunk of chunks) {
            const cleanChunk = chunk.trim();
            // Basic SSE line parser matching our adapter format
            if (cleanChunk.startsWith('{') || cleanChunk.startsWith('{"id":')) {
              try {
                const parsed = JSON.parse(cleanChunk);
                const content = parsed.delta?.content || '';
                
                updatedMessages[updatedMessages.length - 1].content += content;
                setSessions((prev) =>
                  prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [...updatedMessages] } : s))
                );
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Stream processing failed.');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Message copied to clipboard.');
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(sessions[0]?.id || null);
    }
    toast.success('Conversation deleted.');
  };

  const handleTogglePin = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s))
    );
  };

  const handleToggleFavorite = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isFavorite: !s.isFavorite } : s))
    );
  };

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <PageHeader title={t.pages.chatTitle} subtitle={t.pages.chatSubtitle} />
      
      <div className="grid grid-rows-[16rem_1fr] gap-4 sm:gap-6 md:grid-rows-1 md:grid-cols-4 h-[calc(100vh-13rem)] sm:h-[calc(100vh-14rem)] min-h-[28rem]">
        {/* Left panel: Sessions list */}
        <Card className="md:col-span-1 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b space-y-3">
            <Button className="w-full gap-2" size="sm" onClick={handleCreateSession}>
              <Plus className="h-4 w-4" />
              <span>New Conversation</span>
            </Button>
            <div className="relative">
              <Search className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-9 h-9"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                  activeSessionId === session.id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium truncate">{session.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePin(session.id);
                    }}
                    className={`p-1 hover:text-foreground transition-colors ${session.isPinned ? 'text-primary' : ''}`}
                    aria-label={session.isPinned ? 'Unpin conversation' : 'Pin conversation'}
                    aria-pressed={session.isPinned}
                  >
                    <Pin className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(session.id);
                    }}
                    className={`p-1 hover:text-foreground transition-colors ${session.isFavorite ? 'text-yellow-500' : ''}`}
                    aria-label={session.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    aria-pressed={session.isFavorite}
                  >
                    <Star className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSession(session.id);
                    }}
                    className="p-1 hover:text-destructive transition-colors"
                    aria-label="Delete conversation"
                  >
                    <Trash className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right panel: Active chat window */}
        <Card className="md:col-span-3 flex flex-col h-full overflow-hidden">
          {activeSession ? (
            <div className="flex flex-col h-full">
              {/* Top bar */}
              <div className="p-3 sm:p-4 border-b flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Bot className="h-5 w-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">{activeSession.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">Model: {activeSession.model}</p>
                  </div>
                </div>
                <select
                  value={activeSession.model}
                  onChange={(e) => {
                    const model = e.target.value;
                    setSessions((prev) =>
                      prev.map((s) => (s.id === activeSession.id ? { ...s, model } : s))
                    );
                  }}
                  className="max-w-[9rem] sm:max-w-none shrink-0 text-xs rounded-md border border-input bg-background p-1.5 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {activeSession.messages.length === 0 ? (
                  <EmptyState
                    icon={<MessageSquare className="h-12 w-12" />}
                    title="Start Chatting"
                    description="Select a model above and type your prompt to begin."
                  />
                ) : (
                  activeSession.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 max-w-[80%] ${
                        msg.role === 'user' ? 'ms-auto flex-row-reverse' : ''
                      }`}
                    >
                      <div
                        className={`p-3.5 rounded-xl text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                        <div className="mt-2 flex items-center justify-end gap-2 border-t pt-1.5 opacity-60">
                          <button
                            onClick={() => handleCopy(msg.content)}
                            className="p-1 hover:text-foreground hover:scale-105 transition"
                            title="Copy message"
                            aria-label="Copy message"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          {msg.role === 'assistant' && (
                            <button
                              onClick={() => {
                                const lastUserIndex = activeSession.messages
                                  .slice(0, index)
                                  .reverse()
                                  .findIndex((m) => m.role === 'user');
                                if (lastUserIndex !== -1) {
                                  const realIdx = index - 1 - lastUserIndex;
                                  const prompt = activeSession.messages[realIdx].content;
                                  handleSendMessage(prompt);
                                }
                              }}
                              className="p-1 hover:text-foreground hover:scale-105 transition"
                              title="Regenerate answer"
                              aria-label="Regenerate answer"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isStreaming && (
                  <div className="flex gap-3 max-w-[80%]">
                    <div className="p-3 bg-muted rounded-xl flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Bottom input area */}
              <div className="p-4 border-t flex gap-2 items-center">
                <Input
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  disabled={isStreaming}
                  className="flex-1"
                />
                <Button size="icon" onClick={() => handleSendMessage()} loading={isStreaming} disabled={!input.trim()} aria-label="Send message">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<MessageSquare className="h-12 w-12" />}
              title="No Active Session"
              description="Create a new conversation to start using Moataz AI."
              action={
                <Button size="sm" onClick={handleCreateSession}>
                  Create Chat
                </Button>
              }
            />
          )}
        </Card>
      </div>
    </div>
  );
}
