export const babyReminderMessages = {
    medicine: [
        "Mummaaa 🥺 time for my medicine so I grow strong 💪❤️",
        "It's time for our special vitamins, Mumma! I'm waiting! ✨👶",
        "Pill time! Keep us healthy and happy, Muuumm! 💊💕"
    ],
    water: [
        "Mumma, I'm thirsty! Let's have some water together 💧🥤",
        "Stay hydrated for both of us, Mumma! Gulp gulp! 🌊🥰",
        "Time for a refreshing drink so I can start kicking! 💓🥛"
    ],
    food: [
        "I'm hungry, Mumma! Can we eat something yummy? 🍎🥣",
        "Meal time! I love it when you eat healthy for me 🥦🥘",
        "Feeding time for the little one! Let's fuel up, Mumma! 🥄😋"
    ],
    checkup: [
        "I can't wait to see the doctor and hear my heart beat! 🏥💓",
        "It's visit day! Let's go see if I've grown even bigger ✨👩‍⚕️",
        "Doctor time! I want to make sure I'm doing great in here! 📋👶"
    ],
    sleep: [
        "Time to rest, Mumma. I need my beauty sleep too 😴🌙",
        "Let's cuddle up and nap. I promise to be quiet! ✨🛌",
        "Lights out, Mumma! Dreaming about you tonight... 💖💤"
    ]
};

export type BabyMessageCategory = keyof typeof babyReminderMessages;

export const getRandomBabyMessage = (category: BabyMessageCategory): string => {
    const messages = babyReminderMessages[category];
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
};

export const getCategoryFromType = (type: string, title: string = ''): BabyMessageCategory => {
    const lowerTitle = title.toLowerCase();
    if (type === 'medication' || type === 'vaccination') return 'medicine';
    if (type === 'sleep') return 'sleep';
    if (type === 'checkup') return 'checkup';
    if (type === 'feeding') {
        if (lowerTitle.includes('water') || lowerTitle.includes('drink') || lowerTitle.includes('hydrate')) {
            return 'water';
        }
        return 'food';
    }
    return 'food'; // Default
};
