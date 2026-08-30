import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PregnancyResource } from '@/lib/db';
import {
    PlayCircle,
    Headphones,
    FileText,
    Radio,
    Clock,
    Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResourceCardProps {
    resource: PregnancyResource;
    isSaved: boolean;
    onToggleSave: (e: React.MouseEvent) => void;
    onClick: () => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, isSaved, onToggleSave, onClick }) => {

    const getTheme = (category: string) => {
        switch (category) {
            case 'Nutrition': return { bg: 'bg-emerald-100', icon: 'text-emerald-600', tag: 'bg-emerald-200 text-emerald-800' };
            case 'Mental Health': return { bg: 'bg-purple-100', icon: 'text-purple-600', tag: 'bg-purple-200 text-purple-800' };
            case 'Exercise': return { bg: 'bg-orange-100', icon: 'text-orange-600', tag: 'bg-orange-200 text-orange-800' };
            case 'Pregnancy Care': return { bg: 'bg-pink-100', icon: 'text-pink-600', tag: 'bg-pink-200 text-pink-800' };
            // Mother Categories
            case 'Recovery': return { bg: 'bg-purple-100', icon: 'text-purple-600', tag: 'bg-purple-200 text-purple-800' }; // Lavender
            case 'Baby Nutrition': return { bg: 'bg-orange-100', icon: 'text-orange-600', tag: 'bg-orange-200 text-orange-800' }; // Peach
            case 'Sleep & Routines': return { bg: 'bg-indigo-100', icon: 'text-indigo-600', tag: 'bg-indigo-200 text-indigo-800' }; // Soft Blue/Indigo
            case 'Growth & Development': return { bg: 'bg-emerald-100', icon: 'text-emerald-600', tag: 'bg-emerald-200 text-emerald-800' }; // Mint/Green
            case 'Mental Wellness': return { bg: 'bg-rose-100', icon: 'text-rose-600', tag: 'bg-rose-200 text-rose-800' }; // Rose/Pink
            case 'Safety & First Aid': return { bg: 'bg-red-100', icon: 'text-red-600', tag: 'bg-red-200 text-red-800' }; // Red
            default: return { bg: 'bg-blue-100', icon: 'text-blue-600', tag: 'bg-blue-200 text-blue-800' };
        }
    };

    const theme = getTheme(resource.category);

    const getIcon = (type: string) => {
        const className = cn("w-10 h-10", theme.icon);
        switch (type) {
            case 'video': return <PlayCircle className={className} />;
            case 'podcast': return <Headphones className={className} />;
            case 'article': return <FileText className={className} />;
            case 'live': return <Radio className={cn(className, "animate-pulse")} />;
            default: return <FileText className={className} />;
        }
    };

    return (
        <Card
            className="group cursor-pointer hover:shadow-lg transition-all overflow-hidden border-border/40 bg-card rounded-2xl h-full flex flex-col"
            onClick={onClick}
        >
            <div className={cn("h-40 relative flex items-center justify-center transition-colors", theme.bg)}>
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-colors" />

                {resource.thumbnail ? (
                    <img
                        src={resource.thumbnail}
                        alt={resource.title}
                        className="w-full h-full object-cover opacity-90 mix-blend-overlay"
                    />
                ) : null}

                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="bg-white/80 p-3 rounded-full shadow-sm backdrop-blur-sm">
                        {getIcon(resource.type)}
                    </div>
                </div>

                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm">
                    {resource.type}
                </span>
            </div>

            <CardContent className="p-5 relative flex-1 flex flex-col">
                <Button
                    size="icon"
                    variant="ghost"
                    className={cn(
                        "absolute -top-5 right-4 rounded-full shadow-md hover:scale-110 transition-all h-10 w-10 border-2 border-white",
                        isSaved ? "bg-red-500 text-white hover:bg-red-600" : "bg-white text-muted-foreground hover:bg-gray-50 hover:text-red-500"
                    )}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(e);
                    }}
                >
                    <Heart className={cn("w-5 h-5", isSaved && "fill-current")} />
                </Button>

                <div className="mb-3 mt-1">
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full", theme.tag)}>
                        {resource.category}
                    </span>
                </div>

                <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2 text-foreground">
                    {resource.title}
                </h3>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 line-height-relaxed flex-1">
                    {resource.description}
                </p>

                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mt-auto pt-4 border-t border-border/50 w-full">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{resource.duration || '5 min read'}</span>
                    <span className="mx-1">•</span>
                    <span className="capitalize">{resource.type}</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default ResourceCard;
