import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PregnancyResource } from "@/lib/db";
import { ExternalLink, Clock, PlayCircle, Headphones, FileText, Info } from 'lucide-react';

interface ResourceDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    resource: PregnancyResource | null;
}

const ResourceDetailDialog: React.FC<ResourceDetailDialogProps> = ({ isOpen, onClose, resource }) => {
    if (!resource) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return <PlayCircle className="w-5 h-5 text-red-500" />;
            case 'podcast': return <Headphones className="w-5 h-5 text-purple-500" />;
            case 'article': return <FileText className="w-5 h-5 text-blue-500" />;
            default: return <Info className="w-5 h-5" />;
        }
    };

    // Helper to get YouTube Embed URL
    const getEmbedUrl = (url: string) => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
            return `https://www.youtube.com/embed/${videoId}`;
        }
        return null;
    };

    const embedUrl = resource.type === 'video' ? getEmbedUrl(resource.url) : null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-secondary/10 text-secondary-foreground px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                            {resource.category}
                        </span>
                        <div className="flex items-center gap-1 text-muted-foreground text-xs">
                            <Clock className="w-3 h-3" />
                            {resource.duration || '5 min'}
                        </div>
                    </div>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        {getIcon(resource.type)}
                        {resource.title}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Media Embed or Placeholder */}
                    {resource.type === 'video' && embedUrl ? (
                        <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                            <iframe
                                width="100%"
                                height="100%"
                                src={embedUrl}
                                title={resource.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    ) : (
                        <div className="bg-muted/30 p-8 rounded-xl text-center border-dashed border-2 border-border">
                            {getIcon(resource.type)}
                            <p className="mt-2 text-muted-foreground">
                                This content is hosted externally.
                            </p>
                            <Button variant="outline" className="mt-4 gap-2" asChild>
                                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4" />
                                    Open {resource.type === 'article' ? 'Article' : 'Resource'}
                                </a>
                            </Button>
                        </div>
                    )}

                    <div className="prose prose-sm max-w-none">
                        <h4 className="font-semibold text-lg">About this resource</h4>
                        <p className="text-muted-foreground leading-relaxed">
                            {resource.description}
                        </p>
                    </div>
                </div>

                <DialogFooter className="md:justify-between items-center border-t pt-4">
                    <p className="text-xs text-muted-foreground text-center md:text-left mb-2 md:mb-0 max-w-[70%]">
                        <Info className="w-3 h-3 inline mr-1" />
                        Disclaimer: This content is for educational purposes and does not replace professional medical advice.
                    </p>
                    <Button onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ResourceDetailDialog;
