import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createUserProfile } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, User, Baby, Stethoscope, ChevronRight, ChevronLeft, HeartPulse, Activity, Utensils, Droplets, Clock, Milk } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

export default function ProfileSetup() {
    const { currentUser, userProfile, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);

    // --- State Management ---
    // Step 1: Basic Info
    const [role, setRole] = useState<'pregnant' | 'mother' | 'doctor'>('pregnant');
    const [name, setName] = useState('');
    const [language, setLanguage] = useState('English');
    const [emergencyName, setEmergencyName] = useState('');
    const [emergencyPhone, setEmergencyPhone] = useState('');

    // Step 2: Physical Details
    const [age, setAge] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');

    // Step 3: Medical Background
    const [conditions, setConditions] = useState({
        diabetes: false,
        bp: false,
        thyroid: false,
        anemia: false,
        asthma: false,
    });
    const [otherConditions, setOtherConditions] = useState('');

    // Step 4: Role Specific
    // Pregnant
    const [pregnancyStartDate, setPregnancyStartDate] = useState('');
    const [trimester, setTrimester] = useState('first');
    const [highRisk, setHighRisk] = useState(false);
    const [prevComplications, setPrevComplications] = useState('');

    // Mother
    const [babyDob, setBabyDob] = useState('');
    const [babyName, setBabyName] = useState('');
    const [babyGender, setBabyGender] = useState('boy');
    const [babyBloodGroup, setBabyBloodGroup] = useState('');
    const [deliveryType, setDeliveryType] = useState('normal');
    const [birthWeight, setBirthWeight] = useState('');
    const [premature, setPremature] = useState(false);
    // Removed basic feedingPreference from Step 4 as it moves to Step 6 detailed
    // But keeping it in state if we want to default it? actually let's move it to Step 6 fully.
    // For now, I'll keep the variable but maybe hide the input in step 4 if I move it to step 6?
    // The requirement says "Baby Feeding Preferences" in Step 6.
    // So I will remove "Feeding Preference" from Step 4 UI and move to Step 6 state.

    // Step 4 Mother Fields kept:
    const [babyAllergies, setBabyAllergies] = useState(''); // Medical allergies
    const [babyHealthConditions, setBabyHealthConditions] = useState('');
    const [pediatricianName, setPediatricianName] = useState('');
    const [pediatricianContact, setPediatricianContact] = useState('');

    // Doctor
    const [specialization, setSpecialization] = useState('');
    const [clinicName, setClinicName] = useState('');

    // Step 5: Lifestyle
    const [sleepQuality, setSleepQuality] = useState('good');
    const [activityLevel, setActivityLevel] = useState('medium');

    // Step 6: Diet (Mother & Pregnant)
    const [dietType, setDietType] = useState('veg');
    const [allergies, setAllergies] = useState(''); // Food allergies
    const [restrictions, setRestrictions] = useState<string[]>([]);
    const [mealPattern, setMealPattern] = useState('3-meals');
    const [waterIntake, setWaterIntake] = useState('2-3L');

    // Step 6: Baby Feeding (Mother Only)
    const [babyFeedingType, setBabyFeedingType] = useState('breast');
    const [solidFoodStarted, setSolidFoodStarted] = useState('no'); // UI radio needs string usually for simpler handling, convert to bool on submit
    const [weaningStyle, setWeaningStyle] = useState('traditional');
    const [babyDietAllergies, setBabyDietAllergies] = useState(''); // Specific food allergies for baby

    const totalSteps = role === 'doctor' ? 5 : 6;

    useEffect(() => {
        if (userProfile?.profileCompleted) {
            navigate('/', { replace: true });
        }
    }, [userProfile, navigate]);

    const handleNext = () => {
        // Basic validation before next
        if (step === 1) {
            if (!name || !emergencyName || !emergencyPhone) {
                setError("Please fill in all required fields.");
                return;
            }
        }
        setError('');
        setStep(prev => Math.min(prev + 1, totalSteps));
    };

    const handleBack = () => {
        setStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!currentUser) return;
        setError('');
        setLoading(true);

        try {
            const profileData: any = {
                name,
                email: currentUser.email || '',
                role,
                language,
                emergencyContact: {
                    name: emergencyName,
                    phone: emergencyPhone
                },
                age,
                height,
                weight,
                bloodGroup,
                medicalConditions: {
                    ...conditions,
                    other: otherConditions
                },
                lifestyle: {
                    sleep: sleepQuality,
                    activity: activityLevel,
                }
            };

            // Construct nested dietPreferences
            if (role !== 'doctor') {
                profileData.dietPreferences = {
                    mother: {
                        dietType: dietType as any,
                        restrictions,
                        allergies: allergies.split(',').map(s => s.trim()).filter(Boolean),
                        mealPattern,
                        waterIntake
                    }
                };

                if (role === 'mother') {
                    profileData.dietPreferences.baby = {
                        feedingType: babyFeedingType as any,
                        allergies: babyDietAllergies.split(',').map(s => s.trim()).filter(Boolean),
                        solidFoodStarted: solidFoodStarted === 'yes',
                        weaningStyle: solidFoodStarted === 'yes' ? weaningStyle as any : undefined
                    };
                }
            } else {
                // Doctor: save basic diet/allergies to lifestyle if needed, or omit if not applicable?
                // Original Step 5 for doctor had diet/allergies. Let's keep them in lifestyle for doctor?
                // The prompt implies Diet Prefs is mainly for Mother/Pregnant. 
                // I will skip dietPreferences for Doctor and just keep lifestyle basics if they were set.
                profileData.lifestyle.diet = dietType; // reuse state
                profileData.lifestyle.allergies = allergies;
            }

            // Add role-specific fields
            if (role === 'pregnant') {
                profileData.pregnancyStartDate = pregnancyStartDate;
                profileData.trimester = trimester;
                profileData.highRisk = highRisk;
                profileData.previousComplications = prevComplications;
            } else if (role === 'mother') {
                profileData.babyDob = babyDob;
                profileData.babyName = babyName;
                profileData.babyGender = babyGender;
                profileData.babyBloodGroup = babyBloodGroup;
                profileData.deliveryType = deliveryType;
                profileData.birthWeight = birthWeight;
                profileData.premature = premature;

                // feedingPreference removed from here as it's in dietPreferences.baby now?
                // Actually the backend User model *also* has `feedingPreference` in the root (legacy from my first pass).
                // I should probably populate it too for backward comp or ease of access, or just rely on dietPreferences.
                // Let's populate the root one too if it exists in schema.
                profileData.feedingPreference = babyFeedingType as any;

                profileData.babyAllergies = babyAllergies; // Medical
                profileData.babyHealthConditions = babyHealthConditions;
                profileData.pediatricianName = pediatricianName;
                profileData.pediatricianContact = pediatricianContact;
            } else if (role === 'doctor') {
                profileData.specialization = specialization;
                profileData.clinicName = clinicName;
            }

            await createUserProfile(currentUser.uid, profileData);

            if (refreshProfile) {
                await refreshProfile();
            }
            localStorage.setItem('userRole', role);

            // Redirect to appropriate dashboard based on role
            if (role === 'pregnant') {
                navigate('/dashboard/pregnant');
            } else if (role === 'mother') {
                navigate('/dashboard/mother');
            } else if (role === 'doctor') {
                navigate('/dashboard/doctor');
            } else {
                navigate('/');
            }
        } catch (err: any) {
            console.error(err);
            setError('Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleRestriction = (restriction: string) => {
        setRestrictions(prev =>
            prev.includes(restriction)
                ? prev.filter(r => r !== restriction)
                : [...prev, restriction]
        );
    };

    return (
        <div className="min-h-screen py-10 px-4 bg-background animate-fade-in flex items-center justify-center">
            <Card className="w-full max-w-3xl border-2 border-primary/10 shadow-xl overflow-hidden">
                <div className="bg-primary/5 p-1">
                    <Progress value={(step / totalSteps) * 100} className="h-2" />
                </div>

                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-3xl font-bold text-primary">
                        {step === 1 && "Welcome! Let's get to know you"}
                        {step === 2 && "Physical Details"}
                        {step === 3 && "Medical History"}
                        {step === 4 && (role === 'pregnant' ? "Pregnancy Journey" : role === 'mother' ? "Baby Details" : "Professional Info")}
                        {step === 5 && "Lifestyle & Habits"}
                        {step === 6 && (role === 'mother' ? "Diet & Feeding" : "Diet Preferences")}
                    </CardTitle>
                    <CardDescription>
                        Step {step} of {totalSteps}: {step === 6 ? "Personalizing nutrition for you & baby" : "Sharing these details helps us personalize your care."}
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-6">
                    {/* Safety Disclaimer */}
                    <Alert className="mb-6 bg-blue-50 border-blue-200">
                        <AlertDescription className="text-blue-800 text-xs">
                            🔒 Your privacy is our priority. This information is used ONLY for personalization and guidance.
                            It does NOT replace professional medical advice.
                        </AlertDescription>
                    </Alert>

                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-6">
                        {/* STEP 1: BASIC INFO */}
                        {step === 1 && (
                            <div className="space-y-6 animate-slide-up">
                                <div className="space-y-3">
                                    <Label className="text-base font-medium">I am a...</Label>
                                    <RadioGroup value={role} onValueChange={(val: any) => setRole(val)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { id: 'pregnant', icon: User, label: 'Pregnant Woman' },
                                            { id: 'mother', icon: Baby, label: 'New Mother' },
                                            { id: 'doctor', icon: Stethoscope, label: 'Doctor' }
                                        ].map((item) => (
                                            <div key={item.id}>
                                                <RadioGroupItem value={item.id} id={item.id} className="peer sr-only" />
                                                <Label htmlFor={item.id} className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all shadow-sm">
                                                    <item.icon className="mb-3 h-6 w-6" />
                                                    {item.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name *</Label>
                                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="language">Preferred Language *</Label>
                                        <Select value={language} onValueChange={setLanguage}>
                                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="English">English</SelectItem>
                                                <SelectItem value="Hindi">Hindi</SelectItem>
                                                <SelectItem value="Marathi">Marathi</SelectItem>
                                                <SelectItem value="Gujarati">Gujarati</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ename">Emergency Contact Name *</Label>
                                        <Input id="ename" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} placeholder="Partner / Parent" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ephone">Emergency Contact Phone *</Label>
                                        <Input id="ephone" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} type="tel" placeholder="+91..." />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: PHYSICAL DETAILS */}
                        {step === 2 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
                                <div className="space-y-2">
                                    <Label htmlFor="age">Age (Years)</Label>
                                    <Input id="age" type="number" min="18" max="60" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 28" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="blood">Blood Group</Label>
                                    <Select value={bloodGroup} onValueChange={setBloodGroup}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                                                <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="height">Height (cm)</Label>
                                    <Input id="height" type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g. 165" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="weight">Current Weight (kg)</Label>
                                    <Input id="weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 68" />
                                </div>
                            </div>
                        )}

                        {/* STEP 3: MEDICAL HISTORY */}
                        {step === 3 && (
                            <div className="space-y-6 animate-slide-up">
                                <Label className="text-base text-muted-foreground">Do you have any of the following conditions?</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { key: 'diabetes', label: 'Diabetes / Gestational Diabetes' },
                                        { key: 'bp', label: 'High Blood Pressure' },
                                        { key: 'thyroid', label: 'Thyroid Issues' },
                                        { key: 'anemia', label: 'Anemia (Low Hemoglobin)' },
                                        { key: 'asthma', label: 'Asthma / Breathing Issues' },
                                    ].map((condition) => (
                                        <div key={condition.key} className="flex items-center space-x-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                            <Checkbox
                                                id={condition.key}
                                                checked={(conditions as any)[condition.key]}
                                                onCheckedChange={(checked) => setConditions({ ...conditions, [condition.key]: !!checked })}
                                            />
                                            <Label htmlFor={condition.key} className="font-normal cursor-pointer flex-1">{condition.label}</Label>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="other_cond">Other Conditions (Optional)</Label>
                                    <Textarea id="other_cond" value={otherConditions} onChange={(e) => setOtherConditions(e.target.value)} placeholder="Any other chronic conditions we should know about?" />
                                </div>
                            </div>
                        )}

                        {/* STEP 4: ROLE SPECIFIC */}
                        {step === 4 && (
                            <div className="space-y-6 animate-slide-up">
                                {role === 'pregnant' && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="lmp">Pregnancy Start Date (LMP) *</Label>
                                                <Input id="lmp" type="date" value={pregnancyStartDate} onChange={(e) => setPregnancyStartDate(e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="trimester">Current Trimester</Label>
                                                <Select value={trimester} onValueChange={setTrimester}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="first">First</SelectItem>
                                                        <SelectItem value="second">Second</SelectItem>
                                                        <SelectItem value="third">Third</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 p-4 rounded-lg border bg-amber-50 border-amber-200">
                                            <Checkbox id="highRisk" checked={highRisk} onCheckedChange={(c) => setHighRisk(!!c)} />
                                            <Label htmlFor="highRisk" className="text-amber-900">My doctor has identified this as a High-Risk Pregnancy</Label>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Previous Complications (Optional)</Label>
                                            <Textarea value={prevComplications} onChange={(e) => setPrevComplications(e.target.value)} placeholder="e.g. Pre-eclampsia, preterm birth..." />
                                        </div>
                                    </>
                                )}

                                {role === 'mother' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label>Baby's Name *</Label>
                                                <Input value={babyName} onChange={(e) => setBabyName(e.target.value)} placeholder="e.g. Aryan" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Baby's Date of Birth *</Label>
                                                <Input type="date" value={babyDob} onChange={(e) => setBabyDob(e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Baby's Gender</Label>
                                                <Select value={babyGender} onValueChange={setBabyGender}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="boy">Boy</SelectItem>
                                                        <SelectItem value="girl">Girl</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Baby's Blood Group</Label>
                                                <Input value={babyBloodGroup} onChange={(e) => setBabyBloodGroup(e.target.value)} placeholder="e.g. O+" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Delivery Type</Label>
                                                <Select value={deliveryType} onValueChange={setDeliveryType}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="normal">Normal Vaginal</SelectItem>
                                                        <SelectItem value="c-section">C-Section</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Birth Weight (kg)</Label>
                                                <Input type="number" step="0.1" value={birthWeight} onChange={(e) => setBirthWeight(e.target.value)} />
                                            </div>
                                            {/* Feeding Preference moved to Step 6 */}
                                            <div className="space-y-2">
                                                <Label>Pediatrician Name</Label>
                                                <Input value={pediatricianName} onChange={(e) => setPediatricianName(e.target.value)} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label>Medical Allergies (if any)</Label>
                                                <Textarea value={babyAllergies} onChange={(e) => setBabyAllergies(e.target.value)} placeholder="e.g. Penicillin..." />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Health Conditions / Issues</Label>
                                                <Textarea value={babyHealthConditions} onChange={(e) => setBabyHealthConditions(e.target.value)} placeholder="e.g. Jaundice at birth, Colic..." />
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Checkbox id="premature" checked={premature} onCheckedChange={(c) => setPremature(!!c)} />
                                            <Label htmlFor="premature">Baby was born premature</Label>
                                        </div>
                                    </div>
                                )}

                                {role === 'doctor' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Specialization *</Label>
                                            <Input value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="e.g. Gynecologist" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Clinic / Hospital Name *</Label>
                                            <Input value={clinicName} onChange={(e) => setClinicName(e.target.value)} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 5: LIFESTYLE */}
                        {step === 5 && (
                            <div className="space-y-6 animate-slide-up">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2"><Activity className="w-4 h-4" /> Physical Activity Level</Label>
                                        <Select value={activityLevel} onValueChange={setActivityLevel}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low (Sedentary)</SelectItem>
                                                <SelectItem value="medium">Medium (Light Exercise)</SelectItem>
                                                <SelectItem value="high">High (Active)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2"><HeartPulse className="w-4 h-4" /> Sleep Quality</Label>
                                        <Select value={sleepQuality} onValueChange={setSleepQuality}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="good">Good (7-8 hours)</SelectItem>
                                                <SelectItem value="average">Average (5-6 hours)</SelectItem>
                                                <SelectItem value="poor">Poor (Broken sleep)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Show Basic Diet/Allergies here ONLY if Doctor (Others have dedicated Step 6) */}
                                    {role === 'doctor' && (
                                        <>
                                            <div className="space-y-2">
                                                <Label className="flex items-center gap-2"><Utensils className="w-4 h-4" /> Diet Type</Label>
                                                <Select value={dietType} onValueChange={setDietType}>
                                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="veg">Vegetarian</SelectItem>
                                                        <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                                                        <SelectItem value="mixed">Mixed / Flexitarian</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Food Allergies (Optional)</Label>
                                                <Input value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="e.g. Peanuts, Lactose..." />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 6: DIET PREFERENCES (Pregnant & Mother) */}
                        {step === 6 && (role === 'pregnant' || role === 'mother') && (
                            <div className="space-y-8 animate-slide-up">

                                {/* MOTHER'S OWN DIET */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 text-primary font-bold text-lg border-b pb-2">
                                        <Utensils className="w-5 h-5" />
                                        {role === 'mother' ? "Mother's Diet Preferences" : "Your Diet Preferences"}
                                    </div>

                                    {/* Diet Type */}
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold">Diet Type *</Label>
                                        <RadioGroup value={dietType} onValueChange={setDietType} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {['veg', 'non-veg', 'eggetarian', 'vegan'].map((type) => (
                                                <div key={type}>
                                                    <RadioGroupItem value={type} id={`diet-${type}`} className="peer sr-only" />
                                                    <Label htmlFor={`diet-${type}`} className="flex items-center justify-center rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer capitalize shadow-sm transition-all text-center h-full">
                                                        {type.replace('-', ' ')}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>

                                    {/* Restrictions */}
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold">Dietary Restrictions</Label>
                                        <div className="flex flex-wrap gap-3">
                                            {['Gluten-free', 'Lactose-free', 'Low sugar', 'Low salt', 'None'].map(r => (
                                                <div
                                                    key={r}
                                                    onClick={() => toggleRestriction(r)}
                                                    className={`px-4 py-2 rounded-full border cursor-pointer transition-all ${restrictions.includes(r) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}`}
                                                >
                                                    {r}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Allergies */}
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold">Food Allergies</Label>
                                        <Input
                                            value={allergies}
                                            onChange={(e) => setAllergies(e.target.value)}
                                            placeholder="Peanuts, Shellfish, Soy..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Meal Pattern */}
                                        <div className="space-y-3">
                                            <Label className="flex items-center gap-2 text-base font-semibold">
                                                <Clock className="w-5 h-5" /> Meal Pattern
                                            </Label>
                                            <RadioGroup value={mealPattern} onValueChange={setMealPattern} className="grid grid-cols-1 gap-2">
                                                {[
                                                    { v: '3-meals', l: '3 Meals / Day' },
                                                    { v: 'frequent', l: 'Small Frequent Meals' },
                                                    { v: 'irregular', l: 'Irregular' }
                                                ].map((m) => (
                                                    <div key={m.v} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={m.v} id={m.v} />
                                                        <Label htmlFor={m.v} className="font-normal cursor-pointer">{m.l}</Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>

                                        {/* Water Intake */}
                                        <div className="space-y-3">
                                            <Label className="flex items-center gap-2 text-base font-semibold">
                                                <Droplets className="w-5 h-5 text-blue-500" /> Daily Water Intake
                                            </Label>
                                            <RadioGroup value={waterIntake} onValueChange={setWaterIntake} className="grid grid-cols-1 gap-2">
                                                {[
                                                    { v: '<2L', l: 'Less than 2L' },
                                                    { v: '2-3L', l: '2 - 3 Liters' },
                                                    { v: '>3L', l: 'More than 3L' }
                                                ].map((w) => (
                                                    <div key={w.v} className="flex items-center space-x-2">
                                                        <RadioGroupItem value={w.v} id={w.v} />
                                                        <Label htmlFor={w.v} className="font-normal cursor-pointer">{w.l}</Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>
                                    </div>
                                </div>

                                {/* BABY FEEDING PREFERENCES (Mother Only) */}
                                {role === 'mother' && (
                                    <div className="space-y-6 pt-6 border-t border-dashed">
                                        <div className="flex items-center gap-2 text-pink-500 font-bold text-lg border-b pb-2 px-1">
                                            <Milk className="w-5 h-5" />
                                            Baby Feeding Preferences
                                        </div>

                                        {/* Feeding Type */}
                                        <div className="space-y-3">
                                            <Label className="text-base font-semibold">Feeding Type *</Label>
                                            <RadioGroup value={babyFeedingType} onValueChange={setBabyFeedingType} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {[
                                                    { id: 'breast', label: 'Breastfeeding' },
                                                    { id: 'formula', label: 'Formula' },
                                                    { id: 'mixed', label: 'Mixed' }
                                                ].map((item) => (
                                                    <div key={item.id}>
                                                        <RadioGroupItem value={item.id} id={`feed-${item.id}`} className="peer sr-only" />
                                                        <Label htmlFor={`feed-${item.id}`} className="flex items-center justify-center rounded-xl border-2 border-muted bg-pink-50/50 p-3 hover:bg-pink-100 peer-data-[state=checked]:border-pink-500 peer-data-[state=checked]:text-pink-700 cursor-pointer shadow-sm transition-all h-full">
                                                            {item.label}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-base font-semibold">Solid Foods Started?</Label>
                                                <RadioGroup value={solidFoodStarted} onValueChange={setSolidFoodStarted} className="flex gap-6">
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="yes" id="solid-yes" />
                                                        <Label htmlFor="solid-yes">Yes</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="no" id="solid-no" />
                                                        <Label htmlFor="solid-no">No</Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>

                                            {solidFoodStarted === 'yes' && (
                                                <div className="space-y-3 animate-fade-in">
                                                    <Label className="text-base font-semibold">Weaning Style</Label>
                                                    <RadioGroup value={weaningStyle} onValueChange={setWeaningStyle} className="flex gap-6">
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="traditional" id="wean-trad" />
                                                            <Label htmlFor="wean-trad">Traditional (Purees)</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="blw" id="wean-blw" />
                                                            <Label htmlFor="wean-blw">Baby-Led Weaning</Label>
                                                        </div>
                                                    </RadioGroup>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Baby Food Allergies (if any)</Label>
                                            <Input
                                                value={babyDietAllergies}
                                                onChange={(e) => setBabyDietAllergies(e.target.value)}
                                                placeholder="e.g. Eggs, Cow's Milk..."
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </CardContent>
                <CardFooter className="flex justify-between p-6 bg-secondary/10">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={step === 1 || loading}
                        className="gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back
                    </Button>

                    {step < totalSteps ? (
                        <Button onClick={handleNext} className="gap-2">
                            Next Step <ChevronRight className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={loading} className="gap-2 px-8">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Complete Setup'}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
