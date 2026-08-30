import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile, UserProfile } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
    Loader2, Edit2, Save, X, User, Phone, Globe, Calendar, Baby,
    Stethoscope, Activity, HeartPulse, Scale, Utensils, AlertCircle, LogOut
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Profile() {
    const { currentUser, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [profile, setProfile] = useState<UserProfile | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<UserProfile>>({});

    useEffect(() => {
        fetchProfile();
    }, [currentUser]);

    const fetchProfile = async () => {
        if (!currentUser) return;
        try {
            const data = await getUserProfile(currentUser.uid);
            setProfile(data);
            setFormData(data || {});
        } catch (err) {
            console.error(err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!currentUser) return;
        setSaving(true);
        setError('');
        try {
            await updateUserProfile(currentUser.uid, formData);
            setProfile(formData as UserProfile);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            setError('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = '/login';
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    const handleNestedChange = (parent: keyof UserProfile, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...(prev[parent] as any),
                [field]: value
            }
        }));
    };

    const handleDeepNestedChange = (parent: keyof UserProfile, sub: string, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...(prev[parent] as any),
                [sub]: {
                    ...((prev[parent] as any)?.[sub] || {}),
                    [field]: value
                }
            }
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!profile) return null;

    const userType = profile.role;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20 px-4 sm:px-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Profile Settings</h2>
                    <p className="text-muted-foreground">Manage your detailed health and personal information.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="gap-2 flex-1 sm:flex-initial border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden xs:inline">Sign Out</span>
                        <span className="xs:hidden">Sign Out</span>
                    </Button>
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2 flex-1 sm:flex-initial">
                            <Edit2 className="w-4 h-4" />
                            <span className="hidden xs:inline">Edit Profile</span>
                            <span className="xs:hidden">Edit</span>
                        </Button>
                    ) : (
                        <>
                            <Button onClick={() => setIsEditing(false)} variant="ghost" size="icon">
                                <X className="w-4 h-4" />
                            </Button>
                            <Button onClick={handleSave} disabled={saving} className="gap-2 flex-1 sm:flex-initial">
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                <span className="hidden xs:inline">Save Changes</span>
                                <span className="xs:hidden">Save</span>
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {/* 1. Personal Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            Personal Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            {isEditing ? (
                                <Input value={formData.name} onChange={(e) => handleChange('name', e.target.value)} />
                            ) : (
                                <p className="font-medium text-lg">{profile.name}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={profile.email} disabled className="bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <Label>Preferred Language</Label>
                            {isEditing ? (
                                <Select value={formData.language} onValueChange={(val) => handleChange('language', val)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="English">English</SelectItem>
                                        <SelectItem value="Hindi">Hindi</SelectItem>
                                        <SelectItem value="Marathi">Marathi</SelectItem>
                                        <SelectItem value="Gujarati">Gujarati</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className="font-medium">{profile.language}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Physical Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Scale className="w-5 h-5 text-indigo-500" />
                            Physical Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Age</Label>
                            {isEditing ? (
                                <Input type="number" value={formData.age} onChange={(e) => handleChange('age', e.target.value)} />
                            ) : (
                                <p className="font-medium">{profile.age || 'Not set'} years</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Blood Group</Label>
                            {isEditing ? (
                                <Select value={formData.bloodGroup} onValueChange={(val) => handleChange('bloodGroup', val)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                                            <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className="font-medium">{profile.bloodGroup || 'Not set'}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Height (cm)</Label>
                            {isEditing ? (
                                <Input type="number" value={formData.height} onChange={(e) => handleChange('height', e.target.value)} />
                            ) : (
                                <p className="font-medium">{profile.height || '--'} cm</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Weight (kg)</Label>
                            {isEditing ? (
                                <Input type="number" value={formData.weight} onChange={(e) => handleChange('weight', e.target.value)} />
                            ) : (
                                <p className="font-medium">{profile.weight || '--'} kg</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Emergency Contact */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Phone className="w-5 h-5 text-destructive" />
                            Emergency Contact
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            {isEditing ? (
                                <Input value={formData.emergencyContact?.name} onChange={(e) => handleNestedChange('emergencyContact', 'name', e.target.value)} />
                            ) : (
                                <p className="font-medium">{profile.emergencyContact?.name}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            {isEditing ? (
                                <Input value={formData.emergencyContact?.phone} onChange={(e) => handleNestedChange('emergencyContact', 'phone', e.target.value)} />
                            ) : (
                                <p className="font-medium">{profile.emergencyContact?.phone}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Lifestyle */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-green-600" />
                            Lifestyle
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Activity Lvl</Label>
                                {isEditing ? (
                                    <Select value={formData.lifestyle?.activity} onValueChange={(val) => handleNestedChange('lifestyle', 'activity', val)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <p className="font-medium capitalize">{profile.lifestyle?.activity || 'N/A'}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Sleep Quality</Label>
                                {isEditing ? (
                                    <Select value={formData.lifestyle?.sleep} onValueChange={(val) => handleNestedChange('lifestyle', 'sleep', val)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="good">Good</SelectItem>
                                            <SelectItem value="average">Average</SelectItem>
                                            <SelectItem value="poor">Poor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <p className="font-medium capitalize">{profile.lifestyle?.sleep || 'N/A'}</p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Diet Preference</Label>
                            {isEditing ? (
                                <Select value={formData.lifestyle?.diet} onValueChange={(val) => handleNestedChange('lifestyle', 'diet', val)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="veg">Vegetarian</SelectItem>
                                        <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                                        <SelectItem value="mixed">Mixed</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className="font-medium capitalize">{profile.lifestyle?.diet || 'N/A'}</p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Allergies</Label>
                            {isEditing ? (
                                <Input value={formData.lifestyle?.allergies} onChange={(e) => handleNestedChange('lifestyle', 'allergies', e.target.value)} placeholder="None" />
                            ) : (
                                <p className="font-medium">{profile.lifestyle?.allergies || 'None'}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 5. Medical History (Full Width) */}
                <Card className="md:col-span-2 border-orange-200 bg-orange-50/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-900">
                            <HeartPulse className="w-5 h-5" />
                            Medical Background
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {[
                                { k: 'diabetes', l: 'Diabetes' }, { k: 'bp', l: 'High BP' },
                                { k: 'thyroid', l: 'Thyroid' }, { k: 'anemia', l: 'Anemia' }, { k: 'asthma', l: 'Asthma' }
                            ].map(item => {
                                const isChecked = (formData.medicalConditions as any)?.[item.k];
                                return (
                                    <div key={item.k} className={`px-3 py-1 rounded-full border text-sm flex items-center gap-2 ${isChecked ? 'bg-orange-100 border-orange-300 text-orange-800 font-medium' : 'bg-background border-muted text-muted-foreground'}`}>
                                        {isEditing && (
                                            <Checkbox
                                                checked={isChecked}
                                                onCheckedChange={(c) => handleNestedChange('medicalConditions', item.k, !!c)}
                                                className="w-3 h-3"
                                            />
                                        )}
                                        {item.l}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="space-y-2">
                            <Label>Other Conditions</Label>
                            {isEditing ? (
                                <Textarea value={formData.medicalConditions?.other} onChange={(e) => handleNestedChange('medicalConditions', 'other', e.target.value)} className="bg-white" />
                            ) : (
                                <p className="text-sm bg-white/50 p-2 rounded border border-orange-100">{profile.medicalConditions?.other || 'None reported.'}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 6. Nutrition & Diet (Full Width) */}
                {(userType === 'pregnant' || userType === 'mother') && (
                    <Card className="md:col-span-2 border-green-200 bg-green-50/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-900">
                                <Utensils className="w-5 h-5" />
                                Nutrition & Diet
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Mother's Preferences */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-green-800 flex items-center gap-2">
                                    <User className="w-4 h-4" /> Your Preferences
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Diet Type</Label>
                                        {isEditing ? (
                                            <Select
                                                value={formData.dietPreferences?.mother?.dietType}
                                                onValueChange={(val) => handleDeepNestedChange('dietPreferences', 'mother', 'dietType', val)}
                                            >
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="veg">Vegetarian</SelectItem>
                                                    <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                                                    <SelectItem value="eggetarian">Eggetarian</SelectItem>
                                                    <SelectItem value="vegan">Vegan</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <p className="font-medium capitalize">{formData.dietPreferences?.mother?.dietType || 'Not set'}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Water Intake</Label>
                                        {isEditing ? (
                                            <Select
                                                value={formData.dietPreferences?.mother?.waterIntake}
                                                onValueChange={(val) => handleDeepNestedChange('dietPreferences', 'mother', 'waterIntake', val)}
                                            >
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="<2L">Less than 2L</SelectItem>
                                                    <SelectItem value="2-3L">2-3 Liters</SelectItem>
                                                    <SelectItem value=">3L">More than 3L</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <p className="font-medium">{formData.dietPreferences?.mother?.waterIntake || 'Not set'}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Meal Pattern</Label>
                                        {isEditing ? (
                                            <Select
                                                value={formData.dietPreferences?.mother?.mealPattern}
                                                onValueChange={(val) => handleDeepNestedChange('dietPreferences', 'mother', 'mealPattern', val)}
                                            >
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="3-meals">3 Major Meals</SelectItem>
                                                    <SelectItem value="frequent">Small Frequent Meals</SelectItem>
                                                    <SelectItem value="irregular">Irregular</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <p className="font-medium capitalize">{formData.dietPreferences?.mother?.mealPattern?.replace('-', ' ') || 'Not set'}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Food Restrictions</Label>
                                        {isEditing ? (
                                            <Input
                                                value={formData.dietPreferences?.mother?.restrictions?.join(', ')}
                                                onChange={(e) => handleDeepNestedChange('dietPreferences', 'mother', 'restrictions', e.target.value.split(',').map((s: string) => s.trim()))}
                                                placeholder="e.g. Gluten, Dairy (comma separated)"
                                            />
                                        ) : (
                                            <div className="flex flex-wrap gap-1">
                                                {formData.dietPreferences?.mother?.restrictions?.length ? (
                                                    formData.dietPreferences.mother.restrictions.map((r: string, i: number) => (
                                                        <span key={i} className="text-xs bg-white border px-2 py-1 rounded-full">{r}</span>
                                                    ))
                                                ) : <span className="text-muted-foreground">None</span>}
                                            </div>
                                        )}
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <Label>Allergies</Label>
                                        {isEditing ? (
                                            <Input
                                                value={formData.dietPreferences?.mother?.allergies?.join(', ')}
                                                onChange={(e) => handleDeepNestedChange('dietPreferences', 'mother', 'allergies', e.target.value.split(',').map((s: string) => s.trim()))}
                                                placeholder="e.g. Peanuts, Shellfish..."
                                            />
                                        ) : (
                                            <p className="text-sm bg-white/50 p-2 rounded border border-green-100">
                                                {formData.dietPreferences?.mother?.allergies?.join(', ') || 'None reported.'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Baby's Preferences (Mother Only) */}
                            {userType === 'mother' && (
                                <>
                                    <div className="h-px bg-green-200" />
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-green-800 flex items-center gap-2">
                                            <Baby className="w-4 h-4" /> Baby's Nutrition
                                        </h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Feeding Type</Label>
                                                {isEditing ? (
                                                    <Select
                                                        value={formData.dietPreferences?.baby?.feedingType}
                                                        onValueChange={(val) => handleDeepNestedChange('dietPreferences', 'baby', 'feedingType', val)}
                                                    >
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="breast">Breastfeeding</SelectItem>
                                                            <SelectItem value="formula">Formula</SelectItem>
                                                            <SelectItem value="mixed">Mixed</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <p className="font-medium capitalize">{formData.dietPreferences?.baby?.feedingType || 'Not set'}</p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Started Solids?</Label>
                                                {isEditing ? (
                                                    <Select
                                                        value={formData.dietPreferences?.baby?.solidFoodStarted ? "yes" : "no"}
                                                        onValueChange={(val) => handleDeepNestedChange('dietPreferences', 'baby', 'solidFoodStarted', val === 'yes')}
                                                    >
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="yes">Yes</SelectItem>
                                                            <SelectItem value="no">No</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <p className="font-medium">{formData.dietPreferences?.baby?.solidFoodStarted ? 'Yes' : 'No'}</p>
                                                )}
                                            </div>
                                            {formData.dietPreferences?.baby?.solidFoodStarted && (
                                                <div className="space-y-2">
                                                    <Label>Weaning Style</Label>
                                                    {isEditing ? (
                                                        <Select
                                                            value={formData.dietPreferences?.baby?.weaningStyle}
                                                            onValueChange={(val) => handleDeepNestedChange('dietPreferences', 'baby', 'weaningStyle', val)}
                                                        >
                                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="traditional">Traditional</SelectItem>
                                                                <SelectItem value="blw">Baby-Led Weaning</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <p className="font-medium capitalize">{formData.dietPreferences?.baby?.weaningStyle || 'Not set'}</p>
                                                    )}
                                                </div>
                                            )}
                                            <div className="md:col-span-2 space-y-2">
                                                <Label>Baby Allergies</Label>
                                                {isEditing ? (
                                                    <Input
                                                        value={formData.dietPreferences?.baby?.allergies?.join(', ')}
                                                        onChange={(e) => handleDeepNestedChange('dietPreferences', 'baby', 'allergies', e.target.value.split(',').map((s: string) => s.trim()))}
                                                        placeholder="e.g. Cow's Milk, Eggs..."
                                                    />
                                                ) : (
                                                    <p className="text-sm bg-white/50 p-2 rounded border border-green-100">
                                                        {formData.dietPreferences?.baby?.allergies?.join(', ') || 'None reported.'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* 7. Role Specific Details (Full Width) */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {userType === 'pregnant' && <Baby className="w-5 h-5 text-pink-500" />}
                            {userType === 'mother' && <Baby className="w-5 h-5 text-blue-500" />}
                            {userType === 'doctor' && <Stethoscope className="w-5 h-5 text-green-500" />}
                            {userType === 'pregnant' ? 'Pregnancy Details' : userType === 'mother' ? 'Baby Details' : 'Professional Details'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
                        {userType === 'pregnant' && (
                            <>
                                <div className="space-y-2">
                                    <Label>LMP Date</Label>
                                    {isEditing ? (
                                        <Input type="date" value={formData.pregnancyStartDate} onChange={(e) => handleChange('pregnancyStartDate', e.target.value)} />
                                    ) : (
                                        <p className="font-medium">{profile.pregnancyStartDate}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Trimester</Label>
                                    {isEditing ? (
                                        <Select value={formData.trimester} onValueChange={(val) => handleChange('trimester', val)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="first">First</SelectItem>
                                                <SelectItem value="second">Second</SelectItem>
                                                <SelectItem value="third">Third</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <p className="font-medium capitalize">{profile.trimester}</p>
                                    )}
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Label>Previous Complications</Label>
                                        {profile.highRisk && <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">High Risk</span>}
                                    </div>
                                    {isEditing ? (
                                        <Textarea value={formData.previousComplications} onChange={(e) => handleChange('previousComplications', e.target.value)} />
                                    ) : (
                                        <p className="text-sm bg-muted p-2 rounded">{profile.previousComplications || 'None reported.'}</p>
                                    )}
                                </div>
                            </>
                        )}
                        {/* Mother and Doctor blocks similar to previous but refined can go here if needed, keeping simple for brevity as user focus implies extensive personal data */}
                        {userType === 'mother' && (
                            <>
                                <div className="space-y-2">
                                    <Label>Baby's Name</Label>
                                    {isEditing ? (
                                        <Input value={formData.babyName} onChange={(e) => handleChange('babyName', e.target.value)} placeholder="e.g. Aryan" />
                                    ) : (
                                        <p className="font-medium">{profile.babyName || 'Not set'}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Baby DOB</Label>
                                    {isEditing ? (
                                        <Input type="date" value={formData.babyDob} onChange={(e) => handleChange('babyDob', e.target.value)} />
                                    ) : (
                                        <p className="font-medium">{profile.babyDob}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    {isEditing ? (
                                        <Select value={formData.babyGender} onValueChange={(val) => handleChange('babyGender', val)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="boy">Boy</SelectItem>
                                                <SelectItem value="girl">Girl</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <p className="font-medium capitalize">{profile.babyGender}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Blood Group</Label>
                                    {isEditing ? (
                                        <Input value={formData.babyBloodGroup} onChange={(e) => handleChange('babyBloodGroup', e.target.value)} placeholder="e.g. O+" />
                                    ) : (
                                        <p className="font-medium">{profile.babyBloodGroup || 'Not set'}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Delivery Type</Label>
                                    {isEditing ? (
                                        <Select value={formData.deliveryType} onValueChange={(val: any) => handleChange('deliveryType', val)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="normal">Normal</SelectItem>
                                                <SelectItem value="c-section">C-Section</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <p className="font-medium capitalize">{profile.deliveryType}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Feeding Preference</Label>
                                    {isEditing ? (
                                        <Select value={formData.feedingPreference} onValueChange={(val: any) => handleChange('feedingPreference', val)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="breast">Breastfeeding</SelectItem>
                                                <SelectItem value="formula">Formula</SelectItem>
                                                <SelectItem value="mixed">Mixed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <p className="font-medium capitalize">{profile.feedingPreference}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Birth Weight (kg)</Label>
                                    {isEditing ? (
                                        <Input type="number" step="0.1" value={formData.birthWeight} onChange={(e) => handleChange('birthWeight', e.target.value)} />
                                    ) : (
                                        <p className="font-medium">{profile.birthWeight || 'Not set'}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Pediatrician Name</Label>
                                    {isEditing ? (
                                        <Input value={formData.pediatricianName} onChange={(e) => handleChange('pediatricianName', e.target.value)} />
                                    ) : (
                                        <p className="font-medium">{profile.pediatricianName || 'Not set'}</p>
                                    )}
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label>Allergies</Label>
                                    {isEditing ? (
                                        <Textarea value={formData.babyAllergies} onChange={(e) => handleChange('babyAllergies', e.target.value)} placeholder="e.g. Milk, Dust..." />
                                    ) : (
                                        <p className="text-sm bg-muted p-2 rounded">{profile.babyAllergies || 'None reported.'}</p>
                                    )}
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label>Health Conditions / Issues</Label>
                                    {isEditing ? (
                                        <Textarea value={formData.babyHealthConditions} onChange={(e) => handleChange('babyHealthConditions', e.target.value)} placeholder="e.g. Jaundice at birth, Colic..." />
                                    ) : (
                                        <p className="text-sm bg-muted p-2 rounded">{profile.babyHealthConditions || 'None reported.'}</p>
                                    )}
                                </div>
                            </>
                        )}

                        {userType === 'doctor' && (
                            <>
                                <div className="space-y-2">
                                    <Label>Specialization</Label>
                                    {isEditing ? (
                                        <Input value={formData.specialization} onChange={(e) => handleChange('specialization', e.target.value)} placeholder="e.g. Gynecologist" />
                                    ) : (
                                        <p className="font-medium">{profile.specialization || 'Not set'}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label>Clinic/Hospital Name</Label>
                                    {isEditing ? (
                                        <Input value={formData.clinicName} onChange={(e) => handleChange('clinicName', e.target.value)} placeholder="e.g. City Hospital" />
                                    ) : (
                                        <p className="font-medium">{profile.clinicName || 'Not set'}</p>
                                    )}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
