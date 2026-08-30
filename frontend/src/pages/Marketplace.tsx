import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingBag, Star, ExternalLink, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Layout from '@/components/layout/Layout';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
    _id: string;
    name: string;
    description: string;
    imageUrl: string;
    category: string;
    price?: string;
    isSponsored: boolean;
    companyName?: string;
    externalLink?: string;
}

const Marketplace: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const navigate = useNavigate();
    const { userProfile } = useAuth();

    useEffect(() => {
        fetchProducts();
    }, [activeCategory]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const query = activeCategory === 'all' ? '' : `?category=${activeCategory}`;
            const data = await api.get(`/marketplace/products${query}`);
            setProducts(data.products || []);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { id: 'all', label: 'All Products' },
        { id: 'baby', label: 'Baby Care' },
        { id: 'pregnancy', label: 'Pregnancy Care' },
        { id: 'medicine', label: 'Medicines' },
        { id: 'clothing', label: 'Clothing' },
        { id: 'hygiene', label: 'Hygiene' },
    ];

    const handleTabChange = (tab: string) => {
        if (tab === 'marketplace') return;

        // Navigate back to dashboard with the selected tab
        if (userProfile?.role) {
            navigate(`/dashboard/${userProfile.role}`);
        } else {
            navigate('/login');
        }
    };

    return (
        <Layout
            sidebar={<Sidebar activeTab="marketplace" onTabChange={handleTabChange} />}
            bottomNav={<BottomNav activeTab="marketplace" onTabChange={handleTabChange} />}
        >
            <div className="flex flex-col min-h-screen bg-gray-50/50 pb-20 md:pb-0">
                {/* Header */}
                <header className="px-6 py-4 bg-white border-b sticky top-0 z-20 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary">
                        <ShoppingBag className="w-6 h-6" />
                        <h1 className="text-xl font-bold tracking-tight">Marketplace</h1>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 p-6">
                    <div className="max-w-6xl mx-auto space-y-6">

                        {/* Intro Banner */}
                        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-2xl border border-pink-100 mb-6">
                            <h2 className="text-lg font-semibold text-pink-900 mb-2">Curated for You & Baby</h2>
                            <p className="text-pink-700">Explore trusted products for your motherhood journey. Purchases support our platform.</p>
                        </div>

                        <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory} className="w-full">
                            <TabsList className="mb-6 h-auto flex-wrap justify-start bg-transparent p-0 gap-2">
                                {categories.map((cat) => (
                                    <TabsTrigger
                                        key={cat.id}
                                        value={cat.id}
                                        className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-full px-4 py-2 border bg-white shadow-sm"
                                    >
                                        {cat.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            <TabsContent value={activeCategory} className="mt-0">
                                {loading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <Card key={i} className="overflow-hidden">
                                                <Skeleton className="h-48 w-full" />
                                                <CardContent className="p-4 space-y-2">
                                                    <Skeleton className="h-4 w-3/4" />
                                                    <Skeleton className="h-4 w-1/2" />
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {products.map((product) => (
                                            <Card
                                                key={product._id}
                                                className={`overflow-hidden transition-all duration-300 hover:shadow-lg group ${product.isSponsored ? 'border-amber-200 ring-1 ring-amber-100 bg-amber-50/30' : 'hover:border-primary/50'}`}
                                            >
                                                <div className="relative aspect-square overflow-hidden bg-gray-100">
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = 'https://placehold.co/600x400?text=Image+Unavailable';
                                                        }}
                                                    />
                                                    {product.isSponsored && (
                                                        <Badge className="absolute top-2 right-2 bg-amber-400 text-amber-950 hover:bg-amber-500 border-amber-200 gap-1 shadow-sm">
                                                            <Star className="w-3 h-3 fill-amber-950" />
                                                            Sponsored
                                                        </Badge>
                                                    )}
                                                    {product.price && (
                                                        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-medium">
                                                            {product.price}
                                                        </div>
                                                    )}
                                                </div>

                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start gap-2 mb-2">
                                                        <div>
                                                            <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider mb-1">{product.category}</p>
                                                            <h3 className="font-semibold text-gray-900 leading-tight line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600 line-clamp-2 h-10 mb-2">{product.description}</p>
                                                    {product.companyName && product.isSponsored && (
                                                        <p className="text-xs text-amber-700 font-medium">Promoted by {product.companyName}</p>
                                                    )}
                                                </CardContent>

                                                <CardFooter className="p-4 pt-0">
                                                    <Button
                                                        className="w-full gap-2"
                                                        variant={product.isSponsored ? "default" : "outline"}
                                                        asChild={!!product.externalLink}
                                                    >
                                                        {product.externalLink ? (
                                                            <a href={product.externalLink} target="_blank" rel="noopener noreferrer">
                                                                View Details <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        ) : (
                                                            <span>View Details</span>
                                                        )}
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </div>
                                )}

                                {!loading && products.length === 0 && (
                                    <div className="text-center py-20 text-muted-foreground bg-white rounded-xl border border-dashed">
                                        <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p>No products found in this category.</p>
                                    </div>
                                )}

                                <Alert className="mt-10 bg-blue-50 border-blue-100 text-blue-800">
                                    <AlertCircle className="h-4 w-4 stroke-blue-800" />
                                    <AlertTitle>Safety Notice</AlertTitle>
                                    <AlertDescription>
                                        Products listed here are for convenience and awareness. Please consult with your healthcare provider before purchasing medical products or supplements.
                                    </AlertDescription>
                                </Alert>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Marketplace;
