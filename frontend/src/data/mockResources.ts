
import { PregnancyResource } from '@/lib/db';

export const MOCK_RESOURCES: PregnancyResource[] = [
    {
        id: '1',
        title: 'Complete Guide to Prenatal Nutrition',
        description: 'Learn about the essential nutrients for you and your baby during each trimester. Includes a weekly meal plan.',
        type: 'article',
        url: 'https://example.com/nutrition',
        category: 'Nutrition',
        thumbnail: 'https://images.unsplash.com/photo-1532509617251-546051752bdc?w=900&q=80', // Food
        duration: '10 min read',
        isLocked: false
    },
    {
        id: '2',
        title: '15-Minute Prenatal Yoga for Beginners',
        description: 'Gentle stretching and breathing exercises designed specifically for expecting mothers to relieve back pain.',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=B87FpWtcLPQ', // Example ID, assumes handling logic
        category: 'Exercise',
        thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=900&q=80', // Yoga
        duration: '15 min',
        isLocked: false
    },
    {
        id: '3',
        title: 'Managing Anxiety & Stress During Pregnancy',
        description: 'Expert tips on how to stay calm, practice mindfulness, and prepare mentally for childbirth.',
        type: 'audio', // treated as podcast
        url: 'https://example.com/podcast/anxiety',
        category: 'Mental Health',
        thumbnail: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=900&q=80', // Meditation
        duration: '20 min listen',
        isLocked: false
    },
    {
        id: '4',
        title: 'Understanding the Trimesters',
        description: 'A comprehensive timeline of your baby\'s development and the changes your body goes through.',
        type: 'article',
        url: 'https://example.com/trimesters',
        category: 'Pregnancy Care',
        thumbnail: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df4?w=900&q=80', // Ultrasound/Care
        duration: '8 min read',
        isLocked: false
    },
    {
        id: '5',
        title: 'Healthy Smoothies for Morning Sickness',
        description: 'Delicious and easy-to-digest smoothie recipes that help combat nausea.',
        type: 'article',
        url: 'https://example.com/smoothies',
        category: 'Nutrition',
        thumbnail: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=900&q=80', // Smoothie
        duration: '5 min read',
        isLocked: false
    },
    {
        id: '6',
        title: 'Guided Meditation for Sleep',
        description: 'Struggling to sleep? Listen to this soothing guided meditation to help you drift off deeply.',
        type: 'audio',
        url: 'https://example.com/sleep-audio',
        category: 'Mental Health',
        thumbnail: 'https://images.unsplash.com/photo-1512438248247-f0f2d5aa115e?w=900&q=80', // Sleep
        duration: '30 min',
        isLocked: false
    },
    {
        id: '7',
        title: 'Safe Cardio Exercises',
        description: 'Low-impact cardio routines that are safe and effective for maintaining fitness while pregnant.',
        type: 'video',
        url: 'https://www.youtube.com/watch?v=example',
        category: 'Exercise',
        thumbnail: 'https://images.unsplash.com/photo-1571019611242-c5c5e9fbfa99?w=900&q=80', // Exercise
        duration: '25 min',
        isLocked: false
    },
    {
        id: '8',
        title: 'Hospital Bag Checklist',
        description: 'Don\'t forget a thing! The ultimate checklist for what to pack for labor and delivery.',
        type: 'article',
        url: 'https://example.com/checklist',
        category: 'Pregnancy Care',
        thumbnail: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=900&q=80', // Bag/Prep
        duration: '6 min read',
        isLocked: false
    }
];

export const FEATURED_RESOURCE: PregnancyResource = {
    id: 'featured-1',
    title: 'Your Week-by-Week Pregnancy Journey',
    description: 'Track your baby\'s growth and expert advice for every stage of your pregnancy in this comprehensive video series.',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=example-featured',
    category: 'Pregnancy Care',
    thumbnail: 'https://images.unsplash.com/photo-1606214539158-751bd5d8f28d?w=1200&q=90', // Featured Hero
    duration: 'Series',
    isLocked: false
};
