import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateUser } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';
import Product from '../models/Product';

const router = Router();

// Get products with optional category filter
router.get(
    '/products',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: Request, res: Response) => {
        const { category } = req.query;
        const query: any = {};

        if (category && category !== 'all') {
            query.category = category;
        }

        // Sort by sponsored first, then newest
        const products = await Product.find(query).sort({ isSponsored: -1, createdAt: -1 });
        res.json({ products });
    })
);

// Add a single product (Admin/Dev helper)
router.post(
    '/products',
    apiLimiter,
    authenticateUser,
    asyncHandler(async (req: Request, res: Response) => {
        const product = new Product(req.body);
        await product.save();
        res.json({ success: true, product });
    })
);

// Seed database with mock data
router.post(
    '/seed',
    apiLimiter,
    // authenticateUser, // Optional: Commented out for easier initial seeding if needed, or keep for security
    asyncHandler(async (req: Request, res: Response) => {
        // Clear existing products to avoid duplicates during dev
        await Product.deleteMany({});

        const seedProducts = [
            {
                name: "Premium Soft Diapers (Pack of 50)",
                description: "Ultra-soft, absorbent diapers for newborn comfort. Rash-free protection.",
                imageUrl: "https://images.unsplash.com/photo-1596461944747-062f6b8c8c7c?q=80&w=800&auto=format&fit=crop",
                category: "baby",
                isSponsored: true,
                companyName: "PampersPro",
                externalLink: "https://www.amazon.in/s?k=baby+diapers",
                price: "₹1,299"
            },
            {
                name: "Prenatal Multivitamins",
                description: "Essential nutrients for mother and baby health including Folic Acid & Iron.",
                imageUrl: "https://images.unsplash.com/photo-1577744315357-e6f76527b140?q=80&w=800&auto=format&fit=crop",
                category: "pregnancy",
                isSponsored: true,
                companyName: "HealthMom",
                externalLink: "https://www.1mg.com/categories/vitamins-and-supplements-10",
                price: "₹850"
            },
            {
                name: "Baby Moisturizing Lotion",
                description: "Gentle, hypoallergenic formula for delicate baby skin. Paraben-free.",
                imageUrl: "https://images.unsplash.com/photo-1556228390-e59e51928014?q=80&w=800&auto=format&fit=crop",
                category: "baby",
                isSponsored: false,
                price: "₹450"
            },
            {
                name: "Anti-Colic Feeding Bottle",
                description: "Reduces air intake for comfortable feeding. BPA free plastic.",
                imageUrl: "https://images.unsplash.com/photo-1596461944747-062f6b8c8c7c?q=80&w=800&auto=format&fit=crop", // Fallback good image
                category: "baby",
                isSponsored: false,
                price: "₹699"
            },
            {
                name: "Maternity Yoga Pants",
                description: "Stretchy, high-waisted comfortable wear for all trimesters.",
                imageUrl: "https://images.unsplash.com/photo-1505236273191-1dce886b01e9?q=80&w=800&auto=format&fit=crop",
                category: "clothing",
                isSponsored: false,
                price: "₹1,499"
            },
            {
                name: "Organic Baby Wipes (3 Packs)",
                description: "99% water, fragrance-free, dermatologically tested wipes.",
                imageUrl: "https://plus.unsplash.com/premium_photo-1675806456041-3e05a3962638?q=80&w=800&auto=format&fit=crop",
                category: "hygiene",
                isSponsored: false,
                price: "₹399"
            },
            {
                name: "Pregnancy Pillow (U-Shape)",
                description: "Full body support for better sleep and back pain relief.",
                imageUrl: "https://images.unsplash.com/photo-1542848285-d816fd80cdae?q=80&w=800&auto=format&fit=crop", // Bedding image context
                category: "pregnancy",
                isSponsored: true,
                companyName: "SleepWell",
                price: "₹2,499"
            },
            {
                name: "Infant Paracetamol Drops",
                description: "Pain and fever relief. Dosage as per doctor's prescription only.",
                imageUrl: "https://images.unsplash.com/photo-1550572017-edb9134a4968?q=80&w=800&auto=format&fit=crop",
                category: "medicine",
                isSponsored: false,
                price: "Consult Doctor"
            }
        ];

        await Product.insertMany(seedProducts);
        res.json({ success: true, count: seedProducts.length });
    })
);

export default router;
