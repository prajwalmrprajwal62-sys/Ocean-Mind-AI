import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getGeminiApiKey } from '../lib/env';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SYSTEM_INSTRUCTION = `You are "OceanBot", the official AI assistant for OceanMind+. 
OceanMind+ is a comprehensive marine conservation and environmental management platform.

Your goal is to help users navigate the website and answer questions about its features:
1. **Dashboard**: Provides a high-level overview of environmental impact, including total waste collected and pollution reports.
2. **Waste Management**: Allows users to log different types of waste (plastic, organic, recyclable). It provides an "Environmental Score" and AI-powered suggestions for waste reduction.
3. **Pollution Control**: A real-time map where users can report marine pollution (like oil spills or plastic accumulation). It uses AI to predict future pollution trends based on report frequency.
4. **Resource Optimization**: A decision-support system for sustainable fishing. Users input fish population and planned catch, and the AI determines if it's within safe biological limits (30% of population).

Tone: Professional, eco-conscious, helpful, and encouraging.
If asked about topics unrelated to OceanMind+ or marine conservation, politely redirect the conversation back to the platform's mission.
Always encourage sustainable practices.`;

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello! I am OceanBot. How can I help you protect our oceans today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        setMessages(prev => [...prev, { role: 'model', text: 'Chat is not configured yet. Set GEMINI_API_KEY in your environment and restart the app.' }]);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
        history: messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }))
      });

      const response = await chat.sendMessage({ message: userMessage });
      const botText = response.text || "I'm sorry, I couldn't process that request.";
      
      setMessages(prev => [...prev, { role: 'model', text: botText }]);
    } catch (error) {
      console.error("ChatBot Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '64px' : '500px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "w-[350px] md:w-[400px] bg-black border border-[#1A1A1A] rounded-2xl shadow-2xl overflow-hidden flex flex-col mb-4 transition-all duration-300",
              isMinimized && "h-16"
            )}
          >
            {/* Header */}
            <div className="p-4 bg-[#0A0A0A] border-b border-[#1A1A1A] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#D1FF4D] rounded-full flex items-center justify-center">
                  <Bot size={18} className="text-black" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tighter">OceanBot</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#D1FF4D] rounded-full animate-pulse" />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-gray-500">AI Assistant</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 text-gray-500 hover:text-white transition-colors"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-gray-500 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                  {messages.map((m, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "flex gap-3 max-w-[85%]",
                        m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        m.role === 'user' ? "bg-white/10" : "bg-[#D1FF4D]/10"
                      )}>
                        {m.role === 'user' ? <User size={14} /> : <Bot size={14} className="text-[#D1FF4D]" />}
                      </div>
                      <div className={cn(
                        "p-3 rounded-2xl text-sm leading-relaxed",
                        m.role === 'user' 
                          ? "bg-white/5 text-white rounded-tr-none" 
                          : "bg-[#1A1A1A] text-gray-200 rounded-tl-none"
                      )}>
                        <div className="markdown-body">
                          <Markdown>{m.text}</Markdown>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 mr-auto">
                      <div className="w-8 h-8 rounded-full bg-[#D1FF4D]/10 flex items-center justify-center shrink-0">
                        <Bot size={14} className="text-[#D1FF4D]" />
                      </div>
                      <div className="p-3 bg-[#1A1A1A] rounded-2xl rounded-tl-none">
                        <Loader2 size={16} className="animate-spin text-[#D1FF4D]" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 bg-[#0A0A0A] border-t border-[#1A1A1A]">
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about OceanMind+..."
                      className="flex-1 bg-black border border-[#1A1A1A] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#D1FF4D] transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="p-2 bg-[#D1FF4D] text-black rounded-xl hover:shadow-[0_0_15px_rgba(209,255,77,0.3)] disabled:opacity-50 disabled:hover:shadow-none transition-all"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
        }}
        className={cn(
          "w-14 h-14 bg-[#D1FF4D] text-black rounded-full flex items-center justify-center shadow-2xl hover:shadow-[0_0_30px_rgba(209,255,77,0.4)] transition-all",
          isOpen && "scale-0 opacity-0"
        )}
      >
        <MessageSquare size={24} />
      </motion.button>
    </div>
  );
}
