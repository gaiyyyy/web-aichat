import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Bot, User, Send, Trash2 } from 'lucide-react';
import { chatApi } from '../api/chat';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface ChatHistory {
  id: string;
  roomId: number;
  name: string;
  messages: Message[];
  createdAt: number;
}

function ChatPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [histories, setHistories] = useState<ChatHistory[]>([]);
  const [currentHistoryId, setCurrentHistoryId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistories = () => {
    const stored = localStorage.getItem('chatHistories');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setHistories(parsed);
      } catch {
        setHistories([]);
      }
    }
  };

  const saveToHistory = (msgs: Message[]) => {
    if (msgs.length === 0) return;

    const historyId = currentHistoryId || `history_${Date.now()}`;
    const newHistory: ChatHistory = {
      id: historyId,
      roomId: Number(roomId),
      name: `对话 ${histories.length + 1}`,
      messages: msgs,
      createdAt: Date.now()
    };

    setHistories(prev => {
      const filtered = prev.filter(h => h.id !== historyId);
      const updated = [newHistory, ...filtered];
      localStorage.setItem('chatHistories', JSON.stringify(updated));
      return updated;
    });

    if (!currentHistoryId) {
      setCurrentHistoryId(historyId);
    }
  };

  const loadHistory = (history: ChatHistory) => {
    setMessages(history.messages);
    setCurrentHistoryId(history.id);
    setGameStarted(history.messages.some(m => m.role === 'ai'));
    setGameEnded(history.messages.some(m => m.content.includes('游戏已结束')));
  };

  const deleteHistory = (id: string) => {
    setHistories(prev => {
      const updated = prev.filter(h => h.id !== id);
      localStorage.setItem('chatHistories', JSON.stringify(updated));
      return updated;
    });
    if (currentHistoryId === id) {
      setMessages([]);
      setCurrentHistoryId('');
      setGameStarted(false);
      setGameEnded(false);
    }
  };

  useEffect(() => {
    loadHistories();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      saveToHistory(messages);
    }
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!roomId || isLoading || !content.trim()) return;

    const userMessage: Message = { role: 'user', content: content.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiResponse = await chatApi.sendMessage(Number(roomId), content.trim());
      const aiMessage: Message = { role: 'ai', content: aiResponse };
      setMessages(prev => [...prev, aiMessage]);

      if (aiResponse.includes('游戏已结束')) {
        setGameEnded(true);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        role: 'ai',
        content: '抱歉，发送消息失败，请稍后重试。'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = async () => {
    if (gameStarted) return;
    setGameStarted(true);
    await sendMessage('开始');
  };

  const handleEnd = async () => {
    if (gameEnded) return;
    await sendMessage('结束');
  };

  const handleSend = () => {
    if (inputValue.trim()) {
      if (!gameStarted && inputValue.trim() === '开始') {
        setGameStarted(true);
      }
      sendMessage(inputValue);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="h-screen flex">
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800">历史对话</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {histories.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-sm">
                暂无对话记录
              </div>
            ) : (
              <div className="space-y-2 p-3">
                {histories.map((history) => (
                  <div
                    key={history.id}
                    onClick={() => loadHistory(history)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-between group ${
                      currentHistoryId === history.id
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span className="text-sm font-medium truncate flex-1">
                      {history.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteHistory(history.id);
                      }}
                      className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-300 ${
                        currentHistoryId === history.id
                          ? 'hover:bg-slate-600'
                          : ''
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-800">AI 脑筋急转弯</h1>
              <div className="text-sm text-slate-600">
                房间号: <span className="font-mono font-semibold text-slate-800">{roomId}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      message.role === 'ai'
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {message.role === 'ai' ? (
                      <Bot className="w-5 h-5" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div
                    className={`max-w-xl px-4 py-3 rounded-2xl ${
                      message.role === 'ai'
                        ? 'bg-white border border-slate-200 text-slate-800'
                        : 'bg-slate-700 text-white'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-slate-700 text-white">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-white border-t border-slate-200 px-6 py-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={handleStart}
                    disabled={gameStarted}
                    className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                      gameStarted
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-700 text-white hover:bg-slate-600 active:scale-95'
                    }`}
                  >
                    开始
                  </button>
                  <button
                    onClick={handleEnd}
                    disabled={gameEnded || !gameStarted}
                    className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                      gameEnded || !gameStarted
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-700 text-white hover:bg-slate-600 active:scale-95'
                    }`}
                  >
                    结束游戏
                  </button>
                </div>

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="请输入内容"
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-400 text-sm"
                  />
                  <button
                    onClick={handleSend}
                    disabled={isLoading || !inputValue.trim()}
                    className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span className="font-medium">发送</span>
                  </button>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
