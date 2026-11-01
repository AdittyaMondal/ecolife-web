'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ChevronDown,
  Info,
  Loader2,
  Maximize2,
  Minimize2,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';
import { toast } from 'sonner';
import { meQuery } from '@/hooks/use-auth';
import { homeQuery } from '@/hooks/use-home';
import { onboardingQuery } from '@/hooks/use-onboarding';
import { trackTodayQuery } from '@/hooks/use-track';
import { api } from '@/lib/fetcher';
import { cn } from '@/lib/utils';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const STORAGE_KEY = 'ecolife_ai_chat_history_v2';
const MAX_MEMORY_TURNS = 5; // Up to 5 previous chats (turns)

const SUGGESTED_PROMPTS = [
  'How are my emissions today compared to my baseline?',
  'Analyze my 15-question lifestyle answers',
  'How can I lower my daily commute emissions?',
  'What should I buy or plant with my EcoCoins?',
  'Give me an actionable eco challenge for today',
];

/** Formats inline **bold**, *italic*, and `code` */
function formatInline(text: string): React.ReactNode[] {
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={index} className="italic text-foreground/90">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="rounded-xs bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] font-medium text-primary-foreground dark:text-primary"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

/** Markdown-like text formatter for headers, bold, bullets, and line breaks */
function FormattedMessage({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={lineIdx} className="h-1.5" />;
        }

        if (/^---+$/.test(trimmed)) {
          return <hr key={lineIdx} className="my-2.5 border-border/60" />;
        }

        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={lineIdx} className="font-bold text-foreground text-sm pt-1 tracking-tight">
              {formatInline(trimmed.slice(4))}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={lineIdx} className="font-bold text-foreground text-base pt-1.5 tracking-tight">
              {formatInline(trimmed.slice(3))}
            </h3>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={lineIdx} className="font-extrabold text-foreground text-base pt-2 tracking-tight">
              {formatInline(trimmed.slice(2))}
            </h2>
          );
        }

        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1">
              <span className="text-primary font-bold select-none">•</span>
              <span className="flex-1 text-foreground/95">{formatInline(trimmed.slice(2))}</span>
            </div>
          );
        }

        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1">
              <span className="font-bold text-primary select-none">{numMatch[1]}.</span>
              <span className="flex-1 text-foreground/95">{formatInline(numMatch[2])}</span>
            </div>
          );
        }

        return (
          <p key={lineIdx} className="text-foreground/90">
            {formatInline(line)}
          </p>
        );
      })}
    </div>
  );
}

export function FloatingChat() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [showInfo, setShowInfo] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Live queries for complete user context
  const { data: me } = useQuery(meQuery());
  const { data: onboarding } = useQuery(onboardingQuery());
  const { data: trackToday } = useQuery(trackTodayQuery());
  const { data: home } = useQuery(homeQuery());

  // Load chat history from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch {
      // Ignore parsing errors
    }

    // Default welcome message
    const initialName = me?.name ? ` ${me.name}` : '';
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `👋 Hello${initialName}! I am your **EcoLife AI Advisor**, running securely on our backend with Google Gemini Flash. \n\nI have live access to your profile, your **15 lifestyle onboarding answers**, today's **daily tracking**, and your **virtual garden**! \n\nHow can I help you reduce your footprint or earn EcoCoins today?`,
        timestamp: Date.now(),
      },
    ]);
  }, [me?.name]);

  // Persist messages
  React.useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch {
        // storage quota
      }
    }
  }, [messages]);

  // Auto-scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  React.useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom('auto');
    }
  }, [isOpen, isMinimized, messages]);

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  // Collect garden state if available
  const getGardenContext = () => {
    try {
      const raw = localStorage.getItem('ecolife_garden_v2');
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          biome: parsed.activeBiomeId,
          characterSkin: parsed.activeSkinId,
          treesCount: parsed.plantedTrees?.length || 0,
          petsCount: parsed.activePetIds?.length || 0,
        };
      }
    } catch {
      // ignore
    }
    return undefined;
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const contextPayload = {
        user: {
          name: me?.name,
          email: me?.email,
          coinsBalance: me?.wallet?.coinsBalance,
          pointsTotal: me?.wallet?.pointsTotal,
          streak: home?.streak?.current ?? 0,
          rank: home?.leaderboard?.me?.rank ?? null,
          organization: me?.organization?.name || me?.organization?.slug || null,
        },
        onboarding: {
          completed: onboarding?.complete,
          answers: onboarding?.answers,
          baseline: home?.today?.baselineTotalKg
            ? { totalKg: home.today.baselineTotalKg }
            : undefined,
        },
        dailyTrack: {
          date: trackToday?.date,
          logged: home?.today?.logged ?? !!trackToday?.existingLog,
          todayKg: home?.today?.breakdown?.totalKg,
          baselineTotalKg: home?.today?.baselineTotalKg,
          deltaKg: home?.today?.deltaKg,
          reductionPct: home?.today?.percentOfBaseline
            ? 100 - home.today.percentOfBaseline
            : undefined,
          answers: trackToday?.existingLog?.answers,
        },
        garden: getGardenContext(),
      };

      // Memory: last 5 previous turns (up to 10 previous messages + current)
      const historyToSend = newMessages
        .filter((m) => m.id !== 'welcome')
        .slice(-(MAX_MEMORY_TURNS * 2 + 1))
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // Call the backend API via same-origin fetcher (proxies to ecolife-server)
      const res = await api.post<{ reply: string }>('/ai/chat', {
        messages: historyToSend,
        context: contextPayload,
      });

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      toast.error('EcoLife AI Error', {
        description: err.message || 'Could not connect to AI advisor.',
      });
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ *Sorry, I encountered an issue:* ${err.message || 'Please check your connection and try again.'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    const initialName = me?.name ? ` ${me.name}` : '';
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Chat memory cleared. How can I assist you now${initialName}?`,
        timestamp: Date.now(),
      },
    ]);
    toast.success('Chat memory cleared');
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          aria-label="Open EcoLife AI Advisor"
          className={cn(
            'fixed right-4 bottom-20 md:right-6 md:bottom-6 z-40',
            'group flex items-center gap-2.5 rounded-full p-2.5 md:px-4 md:py-2.5',
            'bg-secondary text-secondary-foreground border border-border/80 shadow-lg shadow-forest-900/10',
            'hover:bg-secondary/90 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200',
            'ring-2 ring-primary/30 hover:ring-primary/60 backdrop-blur-md',
          )}
        >
          <div className="relative flex size-7 md:size-8 items-center justify-center shrink-0">
            <Image
              src="/logo.png"
              alt="EcoLife Logo"
              width={28}
              height={28}
              className="size-7 md:size-8 object-contain transition-transform group-hover:rotate-6"
              priority
            />
            <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-primary ring-2 ring-secondary animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-primary ring-2 ring-secondary" />
          </div>
          <div className="hidden flex-col items-start text-left md:flex pr-1">
            <span className="text-xs font-bold tracking-tight leading-none text-foreground">
              EcoLife AI
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <Sparkles className="size-2.5 text-primary" /> Advisor
            </span>
          </div>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="EcoLife AI Advisor Chat"
          className={cn(
            'fixed right-3 bottom-20 md:right-6 md:bottom-6 z-50',
            'w-[calc(100vw-1.5rem)] sm:w-[420px]',
            'flex flex-col rounded-xl border border-border bg-card/95 shadow-2xl backdrop-blur-xl',
            'transition-all duration-300 ease-out origin-bottom-right',
            isMinimized ? 'h-14 overflow-hidden' : 'h-[580px] max-h-[calc(100vh-6.5rem)]',
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-3.5 py-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex size-9 shrink-0 items-center justify-center rounded-sm bg-secondary p-1 border border-border/60">
                <Image
                  src="/logo.png"
                  alt="EcoLife AI Logo"
                  width={28}
                  height={28}
                  className="size-7 object-contain"
                />
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-primary ring-2 ring-card" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate font-bold text-foreground text-sm tracking-tight">
                    EcoLife AI
                  </h3>
                  <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground dark:text-primary leading-none">
                    Gemini Flash
                  </span>
                </div>
                <p className="truncate text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <span className="size-1.5 rounded-full bg-positive inline-block" />
                  Backend Sync · 5-Turn Memory
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setShowInfo(!showInfo)}
                title="Context data sync details"
                aria-label="Data access info"
                className={cn(
                  'rounded-xs p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition',
                  showInfo && 'bg-accent text-accent-foreground',
                )}
              >
                <Info className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleClearHistory}
                title="Clear chat history"
                aria-label="Clear chat history"
                className="rounded-xs p-1.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition"
              >
                <Trash2 className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Expand' : 'Minimize'}
                aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
                className="rounded-xs p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                {isMinimized ? (
                  <Maximize2 className="size-4" />
                ) : (
                  <Minimize2 className="size-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                aria-label="Close chat"
                className="rounded-xs p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Context Sync Info Drawer */}
              {showInfo && (
                <div className="border-b border-border/80 bg-accent/30 p-3 text-xs animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-1.5 font-semibold text-foreground">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="size-3 text-primary" /> Live Context Synced
                    </span>
                    <span className="text-[10px] text-muted-foreground bg-card border border-border px-1.5 py-0.5 rounded-xs">
                      Backend Managed
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5 rounded-xs bg-card/60 border border-border/50 px-2 py-1">
                      <span className="size-1.5 rounded-full bg-positive shrink-0" />
                      <span className="truncate">15Q Baseline: {onboarding?.complete ? 'Complete' : 'Pending'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-xs bg-card/60 border border-border/50 px-2 py-1">
                      <span className="size-1.5 rounded-full bg-positive shrink-0" />
                      <span className="truncate">Daily Log: {trackToday?.existingLog ? 'Logged' : 'Pending'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-xs bg-card/60 border border-border/50 px-2 py-1">
                      <span className="size-1.5 rounded-full bg-positive shrink-0" />
                      <span className="truncate">EcoCoins: {me?.wallet?.coinsBalance ?? 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-xs bg-card/60 border border-border/50 px-2 py-1">
                      <span className="size-1.5 rounded-full bg-positive shrink-0" />
                      <span className="truncate">Virtual Garden Sync</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 scroll-smooth bg-background/50">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex flex-col',
                        isUser ? 'items-end' : 'items-start',
                      )}
                    >
                      <div className="flex items-end gap-2 max-w-[88%]">
                        {!isUser && (
                          <div className="flex size-6 shrink-0 items-center justify-center rounded-xs bg-secondary p-0.5 border border-border/50 mb-1">
                            <Image
                              src="/logo.png"
                              alt="AI"
                              width={20}
                              height={20}
                              className="size-5 object-contain"
                            />
                          </div>
                        )}
                        <div
                          className={cn(
                            'rounded-lg p-3 text-xs sm:text-sm shadow-xs',
                            isUser
                              ? 'rounded-tr-xs bg-secondary text-secondary-foreground font-normal border border-secondary/50'
                              : 'rounded-tl-xs bg-card text-foreground border border-border/80 shadow-xs',
                          )}
                        >
                          {isUser ? (
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          ) : (
                            <FormattedMessage text={msg.content} />
                          )}
                        </div>
                      </div>
                      <span className="mt-1 px-1 text-[10px] text-muted-foreground">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground text-xs py-2 pl-2">
                    <div className="flex size-6 items-center justify-center rounded-xs bg-secondary p-0.5 border border-border/50">
                      <Image
                        src="/logo.png"
                        alt="Thinking"
                        width={20}
                        height={20}
                        className="size-5 object-contain animate-spin"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                      <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                      <span className="size-1.5 rounded-full bg-primary animate-bounce" />
                    </div>
                    <span className="text-[11px] text-muted-foreground">EcoLife AI is thinking...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto border-t border-border/60 bg-muted/30 px-3 py-2 no-scrollbar">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSend(prompt)}
                    className="shrink-0 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground/80 hover:text-foreground hover:border-primary/50 hover:bg-accent/40 active:scale-95 transition disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="border-t border-border bg-card p-2.5">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about emissions, trees, diet, or tips..."
                    disabled={isLoading}
                    className="flex-1 rounded-sm border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 disabled:opacity-50 transition"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    aria-label="Send message"
                    className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition disabled:opacity-40 shadow-xs"
                  >
                    {isLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
