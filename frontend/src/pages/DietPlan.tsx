import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { saveDietPlanProgress, getDietPlanProgress } from '@/lib/db';
import Layout from '@/components/layout/Layout';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Milk,
  Apple,
  UtensilsCrossed,
  Soup,
  Salad,
  Cookie,
  Sandwich,
  Coffee,
  Moon,
  CheckCircle2,
  ArrowLeft,
  Leaf,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { generatePersonalizedDiet } from '@/lib/groq';

interface MealItem {
  id: string;
  text: string;
  icon: React.ComponentType<{ className?: string }>;
  checked: boolean;
}

interface DietSection {
  id: string;
  title: string;
  time: string;
  items: MealItem[];
  color: string;
}

// Define icon mapping outside component to avoid serialization issues
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Milk,
  Apple,
  UtensilsCrossed,
  Soup,
  Salad,
  Cookie,
  Sandwich,
  Coffee,
  Moon,
  Leaf,
};

// Initialize default sections
const getDefaultSections = (): DietSection[] => [
  {
    id: 'early-morning',
    title: 'Early Morning',
    time: '6:00 AM - 7:00 AM',
    color: 'from-yellow-50 to-amber-50',
    items: [
      { id: 'em1', text: 'Warm milk or warm water', icon: Milk, checked: false },
      { id: 'em2', text: 'Soaked almonds or walnuts', icon: Apple, checked: false },
    ],
  },
  {
    id: 'breakfast',
    title: 'Breakfast',
    time: '8:00 AM - 9:00 AM',
    color: 'from-green-50 to-emerald-50',
    items: [
      { id: 'bf1', text: 'Vegetable poha / upma / oats', icon: UtensilsCrossed, checked: false },
      { id: 'bf2', text: 'Whole wheat chapati with sabzi', icon: Cookie, checked: false },
      { id: 'bf3', text: 'One fresh fruit', icon: Apple, checked: false },
    ],
  },
  {
    id: 'mid-morning',
    title: 'Mid-Morning Snack',
    time: '10:30 AM - 11:00 AM',
    color: 'from-yellow-50 to-amber-50',
    items: [
      { id: 'mm1', text: 'Fruit bowl or coconut water', icon: Apple, checked: false },
      { id: 'mm2', text: 'Light sprouts chaat', icon: Salad, checked: false },
    ],
  },
  {
    id: 'lunch',
    title: 'Lunch',
    time: '12:30 PM - 1:30 PM',
    color: 'from-green-50 to-emerald-50',
    items: [
      { id: 'ln1', text: 'Chapati or rice', icon: UtensilsCrossed, checked: false },
      { id: 'ln2', text: 'Dal / pulses', icon: Soup, checked: false },
      { id: 'ln3', text: 'Seasonal vegetables', icon: Leaf, checked: false },
      { id: 'ln4', text: 'Curd or buttermilk', icon: Milk, checked: false },
      { id: 'ln5', text: 'Salad', icon: Salad, checked: false },
    ],
  },
  {
    id: 'evening',
    title: 'Evening Snack',
    time: '4:00 PM - 5:00 PM',
    color: 'from-yellow-50 to-amber-50',
    items: [
      { id: 'ev1', text: 'Roasted chana / makhana', icon: Cookie, checked: false },
      { id: 'ev2', text: 'Vegetable sandwich or peanuts', icon: Sandwich, checked: false },
      { id: 'ev3', text: 'Herbal tea or milk', icon: Coffee, checked: false },
    ],
  },
  {
    id: 'dinner',
    title: 'Dinner (Light)',
    time: '7:00 PM - 8:00 PM',
    color: 'from-green-50 to-emerald-50',
    items: [
      { id: 'dn1', text: 'Chapati with vegetable curry or khichdi', icon: UtensilsCrossed, checked: false },
      { id: 'dn2', text: 'Paneer / tofu / egg (optional)', icon: Soup, checked: false },
      { id: 'dn3', text: 'Warm milk before sleep', icon: Moon, checked: false },
    ],
  },
];

// Main Content Component
export const DietPlanContent: React.FC = () => {
  const navigate = useNavigate();
  const [trimester, setTrimester] = useState<'first' | 'second' | 'third'>('second');

  // Initialize diet sections with meal items
  const [dietSections, setDietSections] = useState<DietSection[]>(getDefaultSections());

  // Load saved progress from Firestore
  useEffect(() => {
    const loadDietPlan = async () => {
      try {
        // Need user ID, but this component is wrapped. 
        // Ideally we pass user ID or fetch current user here, 
        // but for now let's use the layout auth context if possible 
        // OR we assume DietPlanContent is child of something with Auth.
        // Let's rely on onAuthStateChanged in db wrapper if needed, 
        // but simpler: check localStorage for user or use auth hook inside content
      } catch (e) { console.error(e) }
    };
  }, []);
  // WAIT - I need to use useAuth() here.

  const { currentUser, userProfile } = useAuth(); // Need to import useAuth
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (currentUser) {
        try {
          const savedData = await getDietPlanProgress(currentUser.uid);
          if (savedData && savedData.sections) {
            const today = new Date().toDateString();
            // Check if date matches, if not, maybe reset or keep (logic was: check date)
            // The original code reset if date didn't match? No, it only loaded if date matched.
            // If date doesn't match, we probably want default sections (new day).
            if (savedData.date === today) {
              const restoredSections = savedData.sections.map((section: any) => ({
                ...section,
                items: section.items.map((item: any) => ({
                  ...item,
                  icon: iconMap[item.iconName] || Milk,
                })),
              }));
              setDietSections(restoredSections);
            } else {
              setDietSections(getDefaultSections());
            }
          } else {
            setDietSections(getDefaultSections());
          }
        } catch (error) {
          console.error('Error loading diet plan:', error);
          setDietSections(getDefaultSections());
        }
      }
    };
    loadData();
  }, [currentUser]);

  const handleGenerateDiet = async () => {
    if (!currentUser || !userProfile) return;
    setGenerating(true);
    try {
      const generatedSections = await generatePersonalizedDiet(userProfile);

      // Map generated sections to DietSection format
      const mappedSections: DietSection[] = generatedSections.map((section: any) => ({
        id: section.id,
        title: section.title,
        time: section.time,
        color: section.color || 'bg-gray-50',
        items: section.items.map((item: any, index: number) => ({
          id: `${section.id}-${index}`,
          text: item.text,
          icon: iconMap[item.icon] || Milk,
          checked: false,
        })),
      }));

      setDietSections(mappedSections);
    } catch (error) {
      console.error("Failed to generate diet plan", error);
      alert("Failed to generate personalized diet plan. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // Save progress to Firestore
  useEffect(() => {
    const saveData = async () => {
      if (currentUser && dietSections.length > 0) {
        try {
          const today = new Date().toDateString();
          const serializableSections = dietSections.map((section) => ({
            ...section,
            items: section.items.map((item) => {
              const iconName = Object.keys(iconMap).find(
                (key) => iconMap[key] === item.icon
              ) || 'Milk';
              return {
                id: item.id,
                text: item.text,
                checked: item.checked,
                iconName,
              };
            }),
          }));

          await saveDietPlanProgress(currentUser.uid, today, serializableSections);
        } catch (error) {
          console.error("Error saving diet plan", error);
        }
      }
    };

    // Debounce save? Or simple effect. 
    // Given React 18 strict mode, this might fire twice. 
    // Firestore writes are cheap enough for this MVP.
    const timeoutId = setTimeout(() => {
      saveData();
    }, 1000); // 1s debounce to avoid rapid writes on every checkbox click

    return () => clearTimeout(timeoutId);

  }, [dietSections, currentUser]);

  const handleToggleItem = (sectionId: string, itemId: string) => {
    setDietSections((prev) =>
      prev.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: section.items.map((item) =>
              item.id === itemId ? { ...item, checked: !item.checked } : item
            ),
          };
        }
        return section;
      })
    );
  };

  const getCompletionPercentage = () => {
    const totalItems = dietSections.reduce((sum, section) => sum + section.items.length, 0);
    const checkedItems = dietSections.reduce(
      (sum, section) => sum + section.items.filter((item) => item.checked).length,
      0
    );
    return totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
  };

  const getTrimesterText = () => {
    switch (trimester) {
      case 'first':
        return 'First Trimester (Weeks 1-12)';
      case 'second':
        return 'Second Trimester (Weeks 13-27)';
      case 'third':
        return 'Third Trimester (Weeks 28-40)';
      default:
        return 'Second Trimester';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-full md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">
            Daily Diet Plan for Pregnancy 🥗
          </h1>
          <Button
            onClick={handleGenerateDiet}
            disabled={generating || !userProfile}
            variant="outline"
            size="sm"
            className="gap-2 ml-auto"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                AI Generate
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground ml-12">
          {getTrimesterText()}
        </p>
      </div>

      {/* Progress Indicator */}
      <Card className="bg-gradient-to-r from-green-50 to-yellow-50 border-green-200 mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Today's Progress</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-3 bg-white rounded-full overflow-hidden w-48">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-yellow-400 transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${getCompletionPercentage()}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-foreground min-w-[3rem] text-right">
                  {getCompletionPercentage()}%
                </span>
              </div>
            </div>
            {getCompletionPercentage() === 100 && (
              <CheckCircle2 className="h-8 w-8 text-green-500 animate-scale-in" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Diet Sections */}
      <div className="space-y-4 mb-6">
        {dietSections.map((section, sectionIndex) => {
          const sectionCheckedCount = section.items.filter((item) => item.checked).length;
          const sectionTotal = section.items.length;
          const sectionComplete = sectionCheckedCount === sectionTotal;

          return (
            <Card
              key={section.id}
              className={cn(
                'bg-gradient-to-br border-2 transition-all duration-300 hover:shadow-lg',
                section.color,
                sectionComplete && 'ring-2 ring-green-300 ring-offset-2'
              )}
              style={{ animationDelay: `${sectionIndex * 100}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-foreground mb-1">
                      {section.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{section.time}</p>
                  </div>
                  {sectionComplete && (
                    <CheckCircle2 className="h-6 w-6 text-green-600 animate-scale-in" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {section.items.map((item, itemIndex) => {
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl bg-white/60 backdrop-blur-sm transition-all duration-200',
                        item.checked && 'bg-white/90 scale-[1.02] shadow-md'
                      )}
                      style={{ animationDelay: `${(sectionIndex * 100) + (itemIndex * 50)}ms` }}
                    >
                      <Checkbox
                        checked={item.checked}
                        onCheckedChange={() => handleToggleItem(section.id, item.id)}
                        className="h-5 w-5 border-2 border-green-400 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      />
                      <IconComponent className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span
                        className={cn(
                          'flex-1 text-base font-medium transition-all',
                          item.checked
                            ? 'text-green-700 line-through decoration-2'
                            : 'text-foreground'
                        )}
                      >
                        {item.text}
                      </span>
                    </div>
                  );
                })}
                {sectionTotal > 0 && (
                  <p className="text-xs text-muted-foreground text-right pt-1">
                    {sectionCheckedCount} of {sectionTotal} completed
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Safety Disclaimer */}
      <Card className="bg-muted/50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-amber-600 text-lg">ℹ️</span>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Important Note</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This diet plan is general guidance and not medical advice. Please consult with
                your healthcare provider or a registered dietitian for personalized dietary
                recommendations based on your specific health needs and pregnancy stage.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Export Wrapper for Routing
const DietPlan: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  return (
    <Layout
      sidebar={<Sidebar activeTab={activeTab} onTabChange={setActiveTab} />}
      bottomNav={<BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
    >
      <Header
        userName="Sarah"
        onEmergencyClick={() => { }}
      />
      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6 pb-24">
        <DietPlanContent />
      </main>
    </Layout>
  );
};

export default DietPlan;
