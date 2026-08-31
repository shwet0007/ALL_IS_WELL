import React, { useState, useEffect } from 'react';
import { PregnancyResource } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import ResourceCard from '@/components/resources/ResourceCard';
import ResourceDetailDialog from '@/components/resources/ResourceDetailDialog';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    BookMarked,
    Search,
    Baby,
    Heart,
    Moon,
    Utensils,
    Sparkles,
    ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { MOCK_MOTHER_RESOURCES } from '@/data/mockMotherResources';
import { cn } from '@/lib/utils';

const categories = ['All', 'Recovery', 'Baby Nutrition', 'Sleep & Routines', 'Growth & Development', 'Mental Wellness', 'Safety & First Aid'];

const MotherResourcesSection = () => {
    const { userProfile } = useAuth();
    const [resources, setResources] = useState<PregnancyResource[]>([]);
    const [savedResourceIds, setSavedResourceIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [showSavedOnly, setShowSavedOnly] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedResource, setSelectedResource] = useState<PregnancyResource | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const babyAge = "2 months";
    const recoveryStage = "Postpartum Recovery";

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 800));
                setResources(MOCK_MOTHER_RESOURCES);
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

    const recommendedResources = resources.slice(0, 4);

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
            {/* Header / For You Today */}
            <header className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 md:p-8 shadow-sm border border-purple-100/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-bold text-purple-600 uppercase tracking-wider mb-2">
                            <Sparkles className="w-4 h-4" /> For You Today
                        </div>
                        <h2 className="text-3xl font-bold text-foreground mb-2">
                            Good morning, {userProfile?.name.split(' ')[0] || 'Mom'}! ☀️
                        </h2>
                        <div className="flex flex-wrap gap-3 mt-3">
                            <span className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-full text-xs font-semibold text-muted-foreground shadow-sm border">
                                👶 Baby is {babyAge} old
                            </span>
                            <span className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-full text-xs font-semibold text-muted-foreground shadow-sm border">
                                ❤️ {recoveryStage}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    {[
                        { label: 'Feeding', icon: Utensils, color: 'bg-orange-100 text-orange-600' },
                        { label: 'Sleep', icon: Moon, color: 'bg-indigo-100 text-indigo-600' },
                        { label: 'Baby Care', icon: Baby, color: 'bg-blue-100 text-blue-600' },
                        { label: 'My Health', icon: Heart, color: 'bg-rose-100 text-rose-600' },
                    ].map((link, idx) => (
                        <div
                            key={idx}
                            className="bg-white/60 backdrop-blur hover:bg-white transition-colors p-3 rounded-xl flex items-center gap-3 cursor-pointer border border-transparent hover:border-border/50 shadow-sm"
                            onClick={() => {
                                // Simple scroll or filter logic could go here
                                toast.info(`Viewing ${link.label} resources`);
                            }}
                        >
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", link.color)}>
                                <link.icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium">{link.label}</span>
                        </div>
                    ))}
                </div>
            </header>

            {/* Recommended Section (Horizontal Scroll) */}
            {!showSavedOnly && !searchQuery && (
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            Using verified insights <ShieldCheck className="w-4 h-4 text-green-500" />
                        </h3>
                    </div>
                    <div className="flex overflow-x-hidden gap-4 pb-4 -mx-4 px-4 ">
                        {recommendedResources.map(resource => (
                            <div key={resource.id} className="min-w-[280px] w-[280px] md:min-w-[320px]">
                                <ResourceCard
                                    resource={resource}
                                    isSaved={savedResourceIds.includes(resource.id)}
                                    onToggleSave={(e) => handleToggleSave(resource.id, e)}
                                    onClick={() => {
                                        setSelectedResource(resource);
                                        setIsDialogOpen(true);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Sticky Search & Tabs */}
            <div className="sticky top-0 bg-background/95 backdrop-blur-lg z-20 py-4 -mx-4 px-4 space-y-4 shadow-sm">
                <div className="relative max-w-xl mx-auto md:mx-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search resources for you and your baby..."
                        className="pl-9 rounded-full bg-secondary/30 border-transparent focus:bg-background transition-all"
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
                                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-full px-5 py-2.5 border bg-card shadow-sm text-muted-foreground hover:bg-muted transition-all text-sm font-medium whitespace-nowrap"
                                    >
                                        {category}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>
                )}
            </div>

            {/* Main Grid */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-muted-foreground">
                    {activeCategory === 'All' ? 'All Resources' : activeCategory}
                </h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSavedOnly(!showSavedOnly)}
                    className={cn("gap-2", showSavedOnly && "text-primary bg-primary/10")}
                >
                    <BookMarked className="w-4 h-4" />
                    {showSavedOnly ? "Showing Saved" : "Show Saved"}
                </Button>
            </div>

            {filteredResources.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed border-muted">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="font-bold text-lg text-muted-foreground">
                        No resources found
                    </h3>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                        We're adding more content for this stage soon!
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

export default MotherResourcesSection;
