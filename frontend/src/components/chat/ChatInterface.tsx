import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, MoreVertical, Globe, User, Bot, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getGroqResponse } from '@/lib/groq';
import { useAuth } from '@/contexts/AuthContext';
import { speechToText, textToSpeech, playAudio } from '@/lib/sarvam';
import { getDailyCheckupStatus } from '@/lib/db';
import { useNavigate } from 'react-router-dom';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const languages = [
    { id: 'en', label: 'English', flag: '🇬🇧', code: 'en-IN', name: 'English' },
    { id: 'hi', label: 'हिंदी (Hindi)', flag: '🇮🇳', code: 'hi-IN', name: 'Hindi' },
    { id: 'ta', label: 'தமிழ் (Tamil)', flag: '🇮🇳', code: 'ta-IN', name: 'Tamil' },
    { id: 'te', label: 'తెలుగు (Telugu)', flag: '🇮🇳', code: 'te-IN', name: 'Telugu' },
    { id: 'kn', label: 'ಕನ್ನಡ (Kannada)', flag: '🇮🇳', code: 'kn-IN', name: 'Kannada' },
    { id: 'ml', label: 'മലയാളം (Malayalam)', flag: '🇮🇳', code: 'ml-IN', name: 'Malayalam' },
    { id: 'bn', label: 'বাংলা (Bengali)', flag: '🇮🇳', code: 'bn-IN', name: 'Bengali' },
    { id: 'gu', label: 'ગુજરાતી (Gujarati)', flag: '🇮🇳', code: 'gu-IN', name: 'Gujarati' },
    { id: 'mr', label: 'मराठी (Marathi)', flag: '🇮🇳', code: 'mr-IN', name: 'Marathi' },
    { id: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)', flag: '🇮🇳', code: 'pa-IN', name: 'Punjabi' },
];

const ChatInterface = () => {
    const { userProfile } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: userProfile?.name
                ? `Hello ${userProfile.name}! I am your supportive health assistant. How are you feeling today?`
                : "Hello! I am your supportive health assistant. How are you feeling today?",
            sender: 'bot',
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [language, setLanguage] = useState('en');
    const [voiceMode, setVoiceMode] = useState(false);
    const [assistantMode, setAssistantMode] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [assistantStatus, setAssistantStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    // Update greeting when profile loads
    useEffect(() => {
        const initChat = async () => {
            if (!userProfile?.name) return;

            const baseGreeting = `Hello ${userProfile.name}! I am your supportive health assistant. How are you feeling today?`;
            const initialMessages: Message[] = [{
                id: '1',
                text: baseGreeting,
                sender: 'bot',
                timestamp: new Date(),
            }];

            // AI Chat Reminder Layer
            const now = new Date();
            const hour = now.getHours();
            if (hour >= 20 || hour < 5) {
                try {
                    const status = await getDailyCheckupStatus();
                    if (!status.completed) {
                        initialMessages.push({
                            id: 'reminder',
                            text: "Hey 👋 Before we wrap up the day, how are you feeling today? Let’s do your quick health check 💙",
                            sender: 'bot',
                            timestamp: new Date(),
                        });
                    }
                } catch (e) {
                    console.error("Failed to check daily checkup status in chat", e);
                }
            }

            if (messages.length <= 1) {
                setMessages(initialMessages);
            }
        };

        if (userProfile?.name) {
            initChat();
        }
    }, [userProfile?.name]);

    // Auto-start listening when assistant mode is enabled
    useEffect(() => {
        if (assistantMode && !isRecording && !isTyping && !isPlayingAudio && assistantStatus === 'idle') {
            // Auto-start recording after a brief delay
            const timer = setTimeout(() => {
                if (assistantMode) {
                    startRecording();
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [assistantMode, isRecording, isTyping, isPlayingAudio, assistantStatus]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        // Call Groq API with user profile context
        try {
            const responseText = await getGroqResponse(
                userMsg.text,
                language,
                { profile: userProfile }
            );

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: responseText,
                sender: 'bot',
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMsg]);

            // Play voice response if voice mode or assistant mode is on
            if (voiceMode || assistantMode) {
                setIsPlayingAudio(true);
                setAssistantStatus('speaking');
                try {
                    const selectedLang = languages.find(l => l.id === language);
                    const langCode = selectedLang?.code || 'en-IN';
                    const audioBase64 = await textToSpeech(
                        responseText,
                        langCode,
                        'anushka'
                    );
                    await playAudio(audioBase64);
                } catch (error) {
                    console.error('Error playing voice response:', error);
                } finally {
                    setIsPlayingAudio(false);
                    setAssistantStatus('idle');
                }
            }
        } catch (error) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "An unexpected error occurred.",
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
            if (!assistantMode && !isPlayingAudio) {
                setAssistantStatus('idle');
            }
        }
    };

    const handleKeyPress = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            await handleSend();
        }
    };

    // Voice Chat Functions
    const startRecording = async () => {
        try {
            setAssistantStatus('listening');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const audioChunks: Blob[] = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                stream.getTracks().forEach(track => track.stop());

                // Convert speech to text
                setIsTyping(true);
                setAssistantStatus('thinking');
                try {
                    // Get the language code from the languages array
                    const selectedLang = languages.find(l => l.id === language);
                    const langCode = selectedLang?.code || 'en-IN';
                    const transcript = await speechToText(audioBlob, langCode);

                    if (transcript) {
                        // Add user message
                        const userMsg: Message = {
                            id: Date.now().toString(),
                            text: transcript,
                            sender: 'user',
                            timestamp: new Date(),
                        };
                        setMessages((prev) => [...prev, userMsg]);

                        // Get AI response
                        const responseText = await getGroqResponse(
                            transcript,
                            language,
                            { profile: userProfile }
                        );

                        const botMsg: Message = {
                            id: (Date.now() + 1).toString(),
                            text: responseText,
                            sender: 'bot',
                            timestamp: new Date(),
                        };
                        setMessages((prev) => [...prev, botMsg]);

                        // Always play audio response when voice input is used
                        setIsPlayingAudio(true);
                        setAssistantStatus('speaking');
                        try {
                            const audioBase64 = await textToSpeech(
                                responseText,
                                langCode,
                                'anushka' // Female voice for v2 model
                            );
                            await playAudio(audioBase64);
                        } catch (error) {
                            console.error('Error playing audio:', error);
                        } finally {
                            setIsPlayingAudio(false);
                            setAssistantStatus('idle');
                        }
                    }
                } catch (error) {
                    console.error('Error processing voice:', error);
                    const errorMsg: Message = {
                        id: (Date.now() + 1).toString(),
                        text: "Sorry, I couldn't understand that. Please try again.",
                        sender: 'bot',
                        timestamp: new Date(),
                    };
                    setMessages((prev) => [...prev, errorMsg]);
                    setAssistantStatus('idle');
                } finally {
                    setIsTyping(false);
                }
            };

            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Please allow microphone access to use voice chat.');
            setAssistantStatus('idle');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[600px] bg-card rounded-2xl shadow-card overflow-hidden border border-border">
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-transparent flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-soft">
                        <Bot className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground">Aal is Well AI</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            {assistantMode ? (
                                <span className="font-medium">
                                    {assistantStatus === 'listening' && '🎤 Listening...'}
                                    {assistantStatus === 'thinking' && '🤔 Thinking...'}
                                    {assistantStatus === 'speaking' && '🔊 Speaking...'}
                                    {assistantStatus === 'idle' && '✨ Ready'}
                                </span>
                            ) : (
                                'Online • Medical Assistant'
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Assistant Mode Toggle */}
                    <Button
                        variant={assistantMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                            setAssistantMode(!assistantMode);
                            if (!assistantMode) {
                                setVoiceMode(true); // Auto-enable voice mode
                            }
                        }}
                        className="gap-2 font-semibold"
                    >
                        <Bot className="w-4 h-4" />
                        {assistantMode ? 'Assistant ON' : 'Assistant Mode'}
                    </Button>

                    {/* Voice Mode Toggle */}
                    {!assistantMode && (
                        <Button
                            variant={voiceMode ? "default" : "outline"}
                            size="sm"
                            onClick={() => setVoiceMode(!voiceMode)}
                            className="gap-2"
                        >
                            <Volume2 className="w-4 h-4" />
                            {voiceMode ? 'Voice On' : 'Voice Off'}
                        </Button>
                    )}

                    <div className="flex items-center gap-1 bg-background rounded-full px-3 py-1 border border-border">
                        <Globe className="w-3 h-3 text-muted-foreground" />
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-transparent text-sm font-medium outline-none cursor-pointer"
                        >
                            {languages.map(lang => (
                                <option key={lang.id} value={lang.id}>{lang.flag} {lang.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 bg-muted/10">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex gap-3 max-w-[85%]",
                                msg.sender === 'user' ? "ml-auto flex-row-reverse" : ""
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                                msg.sender === 'user' ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
                            )}>
                                {msg.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                            </div>

                            <div
                                className={cn(
                                    "p-3 rounded-2xl text-sm shadow-sm",
                                    msg.sender === 'user'
                                        ? "bg-secondary text-secondary-foreground rounded-tr-none"
                                        : "bg-white dark:bg-card border border-border rounded-tl-none text-foreground"
                                )}
                            >
                                {msg.text}
                                {msg.id === 'reminder' && (
                                    <div className="mt-3">
                                        <Button
                                            size="sm"
                                            className="w-full rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border-none"
                                            onClick={() => navigate('/daily-checkup')}
                                        >
                                            Start Health Check
                                        </Button>
                                    </div>
                                )}
                                <p className="text-[10px] opacity-50 mt-1 text-right">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex gap-3 max-w-[85%] animate-fade-in">
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-1">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div className="bg-white dark:bg-card border border-border p-4 rounded-2xl rounded-tl-none shadow-sm">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-card border-t border-border">
                {isPlayingAudio && (
                    <div className="mb-2 flex items-center gap-2 text-sm text-primary animate-pulse">
                        <Volume2 className="w-4 h-4" />
                        Playing audio response...
                    </div>
                )}

                <div className="flex gap-2 items-center bg-muted/30 p-2 rounded-2xl border border-border focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    {/* Voice Recording Button */}
                    <Button
                        variant={isRecording ? "destructive" : "ghost"}
                        size="icon"
                        className={cn(
                            "shrink-0",
                            isRecording ? "animate-pulse" : "text-muted-foreground hover:text-primary"
                        )}
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isTyping || isPlayingAudio}
                    >
                        {isRecording ? (
                            <MicOff className="w-5 h-5" />
                        ) : (
                            <Mic className="w-5 h-5" />
                        )}
                    </Button>

                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={
                            isRecording
                                ? "Recording..."
                                : language === 'hi'
                                    ? "यहाँ टाइप करें..."
                                    : "Type your message..."
                        }
                        className="flex-1 bg-transparent border-none outline-none text-sm p-2 w-full"
                        disabled={isRecording || isTyping}
                    />

                    <Button
                        onClick={() => handleSend()}
                        size="icon"
                        className="shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary-dark shadow-sm"
                        disabled={!inputText.trim()}
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
                <p className="text-center text-[10px] text-muted-foreground mt-2">
                    AI can make mistakes. Please consult a doctor for medical emergencies.
                </p>
            </div>
        </div>
    );
};

export default ChatInterface;
