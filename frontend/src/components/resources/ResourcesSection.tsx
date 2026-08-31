import React, { useState, useEffect } from 'react';
import { PregnancyResource } from '@/lib/db';
import ResourceCard from './ResourceCard';
import ResourceDetailDialog from './ResourceDetailDialog';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    BookMarked,
    Sparkles,
    Search,
    PlayCircle,
    ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_RESOURCES, FEATURED_RESOURCE } from '@/data/mockResources';

const categories = ['All', 'Nutrition', 'Mental Health', 'Exercise', 'Pregnancy Care'];

const ResourcesSection = () => {
    const [resources, setResources] = useState<PregnancyResource[]>([]);
    const [savedResourceIds, setSavedResourceIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [showSavedOnly, setShowSavedOnly] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedResource, setSelectedResource] = useState<PregnancyResource | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 800));

                setResources(MOCK_RESOURCES);
                setSavedResourceIds([]);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleToggleSave = async (resourceId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const isCurrentlySaved = savedResourceIds.includes(resourceId);

        if (isCurrentlySaved) {
            setSavedResourceIds(prev => prev.filter(id => id !== resourceId));
            toast.success("Removed from bookmarks");
        } else {
            setSavedResourceIds(prev => [...prev, resourceId]);
            toast.success("Saved to bookmarks");
        }
    };

    const filteredResources = resources.filter(resource => {
        const matchesCategory = activeCategory === 'All' || resource.category === activeCategory;
        const matchesSaved = !showSavedOnly || savedResourceIds.includes(resource.id);
        const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSaved && matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 animate-pulse">
                <div className="w-16 h-16 bg-muted rounded-full"></div>
                <div className="h-4 w-48 bg-muted rounded"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-2 text-foreground">
                        <Sparkles className="w-7 h-7 text-yellow-500 fill-yellow-500" />
                        Resources
                    </h2>
                    <p className="text-muted-foreground text-lg">Curated guides for your pregnancy journey</p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button
                        variant={showSavedOnly ? "secondary" : "outline"}
                        onClick={() => setShowSavedOnly(!showSavedOnly)}
                        className="gap-2"
                    >
                        <BookMarked className={showSavedOnly ? "fill-current" : ""} />
                        {showSavedOnly ? "Show All" : "Saved"}
                    </Button>
                </div>
            </div>

            {!showSavedOnly && !searchQuery && (
                <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xl shadow-pink-200">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="grid md:grid-cols-2 gap-8 p-8 relative z-10">
                        <div className="flex flex-col justify-center space-y-4">
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur self-start px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                <Sparkles className="w-3 h-3" /> Recommended for You
                            </div>
                            <h3 className="text-3xl font-bold leading-tight">
                                {FEATURED_RESOURCE.title}
                            </h3>
                            <p className="text-white/90 leading-relaxed max-w-md">
                                {FEATURED_RESOURCE.description}
                            </p>
                            <Button
                                className="self-start bg-white text-pink-600 hover:bg-white/90 font-bold gap-2 mt-2"
                                size="lg"
                                onClick={() => {
                                    setSelectedResource(FEATURED_RESOURCE);
                                    setIsDialogOpen(true);
                                }}
                            >
                                <PlayCircle className="w-5 h-5" />
                                Watch Now
                            </Button>
                        </div>
                        <div className="hidden md:flex items-center justify-center">
                            <div className="w-full h-48 rounded-2xl bg-black/20 backdrop-blur-sm flex items-center justify-center border border-white/10 shadow-inner">
                                <PlayCircle className="w-16 h-16 text-white opacity-80" />
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <div className="sticky top-0 bg-background/80 backdrop-blur-lg z-20 py-4 -mx-4 px-4 space-y-4">
                <div className="relative max-w-xl mx-auto md:mx-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search pregnancy resources..."
                        className="pl-9 rounded-full bg-muted/50 border-transparent focus:bg-background transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {!showSavedOnly && (
                    <div className="overflow-x-auto pb-2 scrollbar-hide">
                        <Tabs defaultValue="All" value={activeCategory} onValueChange={setActiveCategory} className="w-full">
                            <TabsList className="bg-transparent gap-3 h-auto p-0 justify-start">
                                {categories.map(category => (
                                    <TabsTrigger
                                        key={category}
                                        value={category}
                                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-full px-5 py-2.5 border bg-white shadow-sm text-muted-foreground hover:bg-muted transition-all text-sm font-medium"
                                    >
                                        {category}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>
                )}
            </div>

            {/* Grid */}
            {filteredResources.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-muted">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="font-bold text-lg text-muted-foreground">
                        {searchQuery ? `No results for "${searchQuery}"` : "No resources found"}
                    </h3>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                        Try adjusting your search or category.
                    </p>
                    {(searchQuery || showSavedOnly) && (
                        <Button
                            variant="link"
                            onClick={() => {
                                setSearchQuery('');
                                setShowSavedOnly(false);
                                setActiveCategory('All');
                            }}
                            className="mt-2 text-primary"
                        >
                            Clear filters
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
                    {filteredResources.map(resource => (
                        <ResourceCard
                            key={resource.id}
                            resource={resource}
                            isSaved={savedResourceIds.includes(resource.id)}
                            onToggleSave={(e) => handleToggleSave(resource.id, e)}
                            onClick={() => {
                                setSelectedResource(resource);
                                setIsDialogOpen(true);
                            }}
                        />
                    ))}
                </div>
            )}

            <ResourceDetailDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                resource={selectedResource}
            />
        </div>
    );
};

export default ResourcesSection;
