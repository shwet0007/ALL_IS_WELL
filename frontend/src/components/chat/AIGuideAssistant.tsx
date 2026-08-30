import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Mic, MicOff, Volume2, Send, Loader2, GripHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { getGroqResponse } from '@/lib/groq';
import { speechToText, textToSpeech, playAudio } from '@/lib/sarvam';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const AIGuideAssistant: React.FC = () => {
    const { userProfile } = useAuth();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [language, setLanguage] = useState('en');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages, isTyping]);

    // Initial greeting based on page
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const pageName = getPageName(location.pathname);
            const greeting = `Hi ${userProfile?.name?.split(' ')[0] || 'there'}! I'm your AI Guide. You're currently on the ${pageName} page. How can I help you navigate or use this section?`;

            setMessages([{
                id: 'init',
                text: greeting,
                sender: 'bot',
                timestamp: new Date()
            }]);

            // Auto-speak initial greeting
            speak(greeting);
        }
    }, [isOpen, location.pathname, userProfile]);

    const getPageName = (path: string) => {
        if (path === '/' || path === '/dashboard') return 'Dashboard';
        if (path.includes('checkup')) return 'Daily Check-in';
        if (path.includes('chat')) return 'AI Chat';
        if (path.includes('diet')) return 'Diet Plan';
        if (path.includes('diary')) return 'Diary';
        if (path.includes('doctor')) return 'Doctor Consultation';
        if (path.includes('resources')) return 'Resources';
        if (path.includes('cry')) return 'Cry Awareness';
        if (path.includes('analytics')) return 'Analytics';
        return 'Current';
    };

    const handleSend = async (text: string) => {
        if (!text.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        try {
            const pageName = getPageName(location.pathname);
            const response = await getGroqResponse(
                text,
                language,
                { profile: userProfile },
                pageName
            );

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: response,
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMsg]);

            // Always read aloud the response for the guide
            await speak(response);
        } catch (error) {
            console.error('Guide Assistant Error:', error);
        } finally {
            setIsTyping(false);
        }
    };

    const speak = async (text: string) => {
        setIsPlayingAudio(true);
        try {
            const langCode = language === 'hi' ? 'hi-IN' : 'en-IN';
            const audioBase64 = await textToSpeech(text, langCode, 'anushka');
            await playAudio(audioBase64);
        } catch (e) {
            console.error('Speech error:', e);
        } finally {
            setIsPlayingAudio(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const audioChunks: Blob[] = [];

            mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                stream.getTracks().forEach(track => track.stop());

                setIsTyping(true);
                try {
                    const langCode = language === 'hi' ? 'hi-IN' : 'en-IN';
                    const transcript = await speechToText(audioBlob, langCode);
                    if (transcript) {
                        await handleSend(transcript);
                    }
                } catch (e) {
                    console.error('Voice processing error:', e);
                } finally {
                    setIsTyping(false);
                }
            };

            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
        } catch (e) {
            console.error('Microphone access denied:', e);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className="fixed inset-0 pointer-events-none z-[100]">
            {/* Draggable Button Container */}
            <motion.div
                drag
                dragMomentum={false}
                className="pointer-events-auto absolute right-6 md:right-10 bottom-24 md:bottom-10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "w-14 h-14 rounded-full shadow-2xl flex items-center justify-center p-0 transition-all",
                        isOpen ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
                    )}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-8 h-8 animate-pulse" />}
                </Button>
            </motion.div>

            {/* Assistant Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="pointer-events-auto fixed bottom-24 right-6 w-[350px] max-w-[90vw] z-[101]"
                    >
                        <Card className="shadow-2xl border-primary/20 bg-white/95 backdrop-blur-md overflow-hidden">
                            <CardHeader className="p-4 bg-primary text-primary-foreground flex flex-row items-center justify-between space-y-0">
                                <div className="flex items-center gap-2">
                                    <Bot className="w-5 h-5" />
                                    <CardTitle className="text-sm font-bold">Aal is Well Guide</CardTitle>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="bg-primary-foreground/10 text-[10px] rounded px-1 outline-none border border-white/20"
                                    >
                                        <option value="en" className="text-black">EN</option>
                                        <option value="hi" className="text-black">HI</option>
                                    </select>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-80 p-4" ref={scrollAreaRef}>
                                    <div className="space-y-4 pb-4">
                                        {messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={cn(
                                                    "flex flex-col max-w-[85%]",
                                                    msg.sender === 'user' ? "ml-auto items-end" : "items-start"
                                                )}
                                            >
                                                <div className={cn(
                                                    "p-3 rounded-2xl text-xs",
                                                    msg.sender === 'user'
                                                        ? "bg-primary text-primary-foreground rounded-tr-none"
                                                        : "bg-muted text-foreground rounded-tl-none border border-border"
                                                )}>
                                                    {msg.text}
                                                </div>
                                                <span className="text-[9px] text-muted-foreground mt-1 px-1">
                                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        ))}
                                        {isTyping && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                <span className="text-[10px]">Thinking...</span>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>

                                <div className="p-3 border-t bg-muted/30">
                                    <div className="flex gap-2">
                                        <Button
                                            size="icon"
                                            variant={isRecording ? "destructive" : "outline"}
                                            className={cn("shrink-0 h-10 w-10", isRecording && "animate-pulse")}
                                            onClick={isRecording ? stopRecording : startRecording}
                                        >
                                            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                        </Button>
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={inputText}
                                                onChange={(e) => setInputText(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
                                                placeholder="Ask me about this page..."
                                                className="w-full bg-white border rounded-lg pl-3 pr-10 py-2 text-xs focus:ring-1 focus:ring-primary outline-none"
                                            />
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="absolute right-1 top-1 h-8 w-8 text-primary"
                                                onClick={() => handleSend(inputText)}
                                                disabled={!inputText.trim() || isTyping}
                                            >
                                                <Send className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {isPlayingAudio && (
                                        <div className="flex items-center gap-2 mt-2 text-[10px] text-primary animate-pulse">
                                            <Volume2 className="w-3 h-3" />
                                            <span>Speaking...</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIGuideAssistant;
