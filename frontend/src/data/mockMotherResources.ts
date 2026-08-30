
import { PregnancyResource } from '@/lib/db';

export const MOCK_MOTHER_RESOURCES: PregnancyResource[] = [
    {
        id: 'm1',
        title: 'Postpartum Recovery: First 6 Weeks',
        description: 'A gentle guide to healing your body after delivery. What to expect, red flags, and self-care tips.',
        type: 'article',
        url: 'https://example.com/recovery',
        category: 'Recovery',
        thumbnail: 'https://images.unsplash.com/photo-1516670879410-b98a39a9cffa?w=900&q=80', // Relaxing/bed
        duration: '12 min read',
        isLocked: false
    },
    {
        id: 'm2',
        title: 'Newborn Feeding Basics 101',
        description: 'Understand hunger cues, latching techniques (for breastfeeding), and bottle-feeding best practices.',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=example-feeding',
        category: 'Baby Nutrition',
        thumbnail: 'https://images.unsplash.com/photo-1555541624-9b26500858e6?w=900&q=80', // Feeding
        duration: '15 min',
        isLocked: false
    },
    {
        id: 'm3',
        title: 'Sleep Training: Gentle Methods',
        description: 'Help your baby establish a healthy sleep rhythm without tears. Techniques for 3-6 month olds.',
        type: 'audio',
        url: 'https://example.com/sleep-podcast',
        category: 'Sleep & Routines',
        thumbnail: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=900&q=80', // Sleeping baby
        duration: '25 min listen',
        isLocked: false
    },
    {
        id: 'm4',
        title: 'Baby Milestones: Month 1-3',
        description: 'What to expect in the "fourth trimester". Tracking growth, reflexes, and sensory development.',
        type: 'article',
        url: 'https://example.com/milestones',
        category: 'Growth & Development',
        thumbnail: 'https://images.unsplash.com/photo-1510154221590-3c22b404481b?w=900&q=80', // Cute baby
        duration: '8 min read',
        isLocked: false
    },
    {
        id: 'm5',
        title: 'Postpartum Blues vs. Depression',
        description: 'Recognizing the signs of PPD and anxiety. You are not alone—expert advice on seeking help.',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=example-ppd',
        category: 'Mental Wellness',
        thumbnail: 'https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb5b?w=900&q=80', // Woman thinking/calm
        duration: '20 min',
        isLocked: false
    },
    {
        id: 'm6',
        title: 'Infant CPR & Choking First Aid',
        description: 'Essential life-saving skills every parent should know. Quick reference guide.',
        type: 'article',
        url: 'https://example.com/cpr',
        category: 'Safety & First Aid',
        thumbnail: 'https://images.unsplash.com/photo-1584515933487-77982caed292?w=900&q=80', // Hands/Safety
        duration: '5 min read',
        isLocked: false
    },
    {
        id: 'm7',
        title: 'Starting Solids: A Guide',
        description: 'When and how to introduce solid foods to your baby. Purees vs. Baby-Led Weaning.',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=example-solids',
        category: 'Baby Nutrition',
        thumbnail: 'https://images.unsplash.com/photo-1563721342621-e377f3d978a1?w=900&q=80', // Baby eating
        duration: '18 min',
        isLocked: false
    },
    {
        id: 'm8',
        title: 'Pelvic Floor Exercises',
        description: 'Strengthen your core and pelvic floor safely after birth with these guided exercises.',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=example-pelvic',
        category: 'Recovery',
        thumbnail: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=900&q=80', // Yoga/exercise
        duration: '10 min',
        isLocked: false
    }
];
