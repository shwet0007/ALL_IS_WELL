import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, Globe, User, Bot, Loader2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getDiseaseAwarenessResponse } from '@/lib/groq';
import { useAuth } from '@/contexts/AuthContext';
import { speechToText, textToSpeech, playAudio } from '@/lib/sarvam';

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

const QUICK_QUERIES = [
    { label: "Jaundice signs", query: "What are the common signs of jaundice in newborns and when should I worry?" },
    { label: "Infant Fever", query: "My baby has a fever. What are the precautions and red flags?" },
    { label: "Colic vs Gas", query: "How can I tell if my baby has colic or just gas? What can I do?" },
    { label: "RSV Symptoms", query: "What are the symptoms of RSV and how to prevent it?" }
];

interface InfantDiseaseAssistantProps {
    isPregnancyMode?: boolean;
}

export default function InfantDiseaseAssistant({ isPregnancyMode = false }: InfantDiseaseAssistantProps) {
    const { currentUser, userProfile } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: isPregnancyMode
                ? "Hello! I'm your Pregnancy Awareness Assistant. I can help you understand common pregnancy-related topics, symptoms, and when to consult a doctor. How can I help you today?"
                : "Hello! I'm your Pediatric Awareness Assistant. I can help you understand common infant diseases, symptoms, and when to call a doctor. How can I help you today?",
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

    // Update greeting when profile loads
    useEffect(() => {
        if (userProfile?.babyName && messages.length === 1 && !isPregnancyMode) {
            setMessages([{
                id: '1',
                text: `Hello! I'm your Pediatric Awareness Assistant for ${userProfile.babyName}. I can help you understand common infant diseases, symptoms, and when to call a doctor. How can I help you today?`,
                sender: 'bot',
                timestamp: new Date(),
            }]);
        }
    }, [userProfile?.babyName, isPregnancyMode]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    // Auto-start listening when assistant mode is enabled
    useEffect(() => {
        if (assistantMode && !isRecording && !isTyping && !isPlayingAudio && assistantStatus === 'idle') {
            const timer = setTimeout(() => {
                if (assistantMode) {
                    startRecording();
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [assistantMode, isRecording, isTyping, isPlayingAudio, assistantStatus]);

    const handleSend = async (text: string = inputText) => {
        if (!text.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: text,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        try {
            const responseText = await getDiseaseAwarenessResponse(
                text,
                language,
                userProfile
            );

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: responseText,
                sender: 'bot',
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMsg]);

            if (voiceMode && !assistantMode) {
                playAudioResponse(responseText);
            }
        } catch (error) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "An error occurred. Please try again or consult a doctor.",
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const playAudioResponse = async (text: string) => {
        setIsPlayingAudio(true);
        setAssistantStatus('speaking');
        try {
            const selectedLang = languages.find(l => l.id === language);
            const langCode = selectedLang?.code || 'en-IN';
            const audioBase64 = await textToSpeech(text, langCode, 'anushka');
            await playAudio(audioBase64);
        } catch (error) {
            console.error('Error playing audio:', error);
        } finally {
            setIsPlayingAudio(false);
            setAssistantStatus('idle');
        }
    };

    const startRecording = async () => {
        try {
            setAssistantStatus('listening');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const audioChunks: Blob[] = [];

            mediaRecorder.ondataavailable = (event) => audioChunks.push(event.data);

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                stream.getTracks().forEach(track => track.stop());

                setIsTyping(true);
                setAssistantStatus('thinking');
                try {
                    const selectedLang = languages.find(l => l.id === language);
                    const langCode = selectedLang?.code || 'en-IN';
                    const transcript = await speechToText(audioBlob, langCode);

                    if (transcript) {
                        const userMsg: Message = {
                            id: Date.now().toString(),
                            text: transcript,
                            sender: 'user',
                            timestamp: new Date(),
                        };
                        setMessages((prev) => [...prev, userMsg]);

                        const responseText = await getDiseaseAwarenessResponse(transcript, language, userProfile);

                        const botMsg: Message = {
                            id: (Date.now() + 1).toString(),
                            text: responseText,
                            sender: 'bot',
                            timestamp: new Date(),
                        };
                        setMessages((prev) => [...prev, botMsg]);

                        await playAudioResponse(responseText);
                    }
                } catch (error) {
                    console.error('Error processing voice:', error);
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
            setAssistantStatus('idle');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className="flex flex-col h-[500px] bg-card rounded-xl overflow-hidden border border-border shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-border bg-gradient-to-r from-blue-50 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg text-white shadow-soft">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">
                            {isPregnancyMode ? 'Pregnancy Awareness' : 'Disease Awareness'} Assistant
                        </h4>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {assistantMode ? (
                                <span className="font-medium text-blue-600">
                                    {assistantStatus === 'listening' && '🎤 Listening...'}
                                    {assistantStatus === 'thinking' && '🤔 Thinking...'}
                                    {assistantStatus === 'speaking' && '🔊 Speaking...'}
                                    {assistantStatus === 'idle' && '✨ Ready'}
                                </span>
                            ) : (
                                `Data-Driven ${isPregnancyMode ? 'Prenatal' : 'Pediatric'} AI`
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                    <Button
                        variant={assistantMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                            setAssistantMode(!assistantMode);
                            if (!assistantMode) setVoiceMode(true);
                        }}
                        className="h-7 text-[10px] md:text-xs gap-1"
                    >
                        <Bot className="w-3 h-3 md:w-4 md:h-4" />
                        {assistantMode ? 'Assistant ON' : 'Asst Mode'}
                    </Button>

                    {!assistantMode && (
                        <Button
                            variant={voiceMode ? "default" : "outline"}
                            size="sm"
                            onClick={() => setVoiceMode(!voiceMode)}
                            className="h-7 text-[10px] md:text-xs gap-1"
                        >
                            <Volume2 className="w-3 h-3 md:w-4 md:h-4" />
                            {voiceMode ? 'Voice On' : 'Voice Off'}
                        </Button>
                    )}

                    <div className="flex items-center gap-1 bg-background rounded-full px-2 py-0.5 border border-border">
                        <Globe className="w-3 h-3 text-muted-foreground" />
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-transparent text-[10px] md:text-xs font-medium outline-none cursor-pointer"
                        >
                            {languages.map(lang => (
                                <option key={lang.id} value={lang.id}>{lang.flag} {lang.id.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-muted/5">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex gap-3 max-w-[90%]",
                                msg.sender === 'user' ? "ml-auto flex-row-reverse" : ""
                            )}
                        >
                            <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1",
                                msg.sender === 'user' ? "bg-secondary text-secondary-foreground" : "bg-blue-600 text-white"
                            )}>
                                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>

                            <div
                                className={cn(
                                    "p-3 rounded-2xl text-sm shadow-sm",
                                    msg.sender === 'user'
                                        ? "bg-secondary text-secondary-foreground rounded-tr-none"
                                        : "bg-white border border-border rounded-tl-none"
                                )}
                            >
                                <div className="whitespace-pre-wrap leading-relaxed">
                                    {msg.text}
                                </div>
                                <p className="text-[8px] opacity-40 mt-1 text-right">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div className="bg-white border border-border p-3 rounded-2xl rounded-tl-none shadow-sm">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-blue-600/50 rounded-full animate-bounce" />
                                    <span className="w-1.5 h-1.5 bg-blue-600/50 rounded-full animate-bounce delay-75" />
                                    <span className="w-1.5 h-1.5 bg-blue-600/50 rounded-full animate-bounce delay-150" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Quick Queries */}
            <div className="px-4 py-2 border-t border-border bg-muted/5">
                <div className="flex flex-wrap gap-2">
                    {(isPregnancyMode ? [
                        { label: "Nausea Relief", query: "What are some safe ways to relieve morning sickness/nausea?" },
                        { label: "Sleep Quality", query: "How can I improve my sleep quality during the third trimester?" },
                        { label: "Safe Exercise", query: "What exercises are safe and beneficial during pregnancy?" },
                        { label: "Warning Signs", query: "What are the critical warning signs in pregnancy that require immediate care?" }
                    ] : QUICK_QUERIES).map((q) => (
                        <Button
                            key={q.label}
                            variant="outline"
                            size="sm"
                            className="text-[9px] h-6 rounded-full px-3 border-blue-100 hover:bg-blue-50 text-blue-700"
                            onClick={() => handleSend(q.query)}
                            disabled={isTyping || isRecording}
                        >
                            {q.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Input Area */}
            <div className="p-3 bg-card border-t border-border">
                {isPlayingAudio && (
                    <div className="mb-1 flex items-center gap-1.5 text-[10px] text-blue-600 animate-pulse">
                        <Volume2 className="w-3 h-3" />
                        Speaking...
                    </div>
                )}
                <div className="flex gap-2 items-center bg-muted/30 p-1.5 rounded-xl border border-border">
                    <Button
                        variant={isRecording ? "destructive" : "ghost"}
                        size="icon"
                        className={cn(
                            "h-8 w-8 shrink-0",
                            isRecording ? "animate-pulse" : "text-muted-foreground hover:text-blue-600"
                        )}
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isTyping || isPlayingAudio}
                    >
                        {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>

                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={isRecording ? "Listening..." : "Ask your question..."}
                        className="flex-1 bg-transparent border-none outline-none text-xs px-2"
                        disabled={isRecording || isTyping}
                    />

                    <Button
                        onClick={() => handleSend()}
                        size="icon"
                        className="h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-700 shadow-sm"
                        disabled={!inputText.trim() || isTyping || isRecording}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
                <p className="text-center text-[8px] text-muted-foreground mt-1.5">
                    Consult a doctor for emergencies. Data-driven awareness based on your {isPregnancyMode ? 'pregnancy' : "baby's"} profile.
                </p>
            </div>
        </div>
    );
}
