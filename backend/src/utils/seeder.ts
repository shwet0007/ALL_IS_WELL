import Product from '../models/Product';

const seedProducts = [
    {
        name: "Premium Soft Diapers (Pack of 50)",
        description: "Ultra-soft, absorbent diapers for newborn comfort. Rash-free protection.",
        imageUrl: "https://images.unsplash.com/photo-1596461944747-062f6b8c8c7c?auto=format&fit=crop&w=800&q=80",
        category: "baby",
        isSponsored: true,
        companyName: "PampersPro",
        externalLink: "https://www.amazon.in/s?k=baby+diapers",
        price: "₹1,299"
    },
    {
        name: "Prenatal Multivitamins",
        description: "Essential nutrients for mother and baby health including Folic Acid & Iron.",
        imageUrl: "https://images.unsplash.com/photo-1577744315357-e6f76527b140?auto=format&fit=crop&w=800&q=80",
        category: "pregnancy",
        isSponsored: true,
        companyName: "HealthMom",
        externalLink: "https://www.1mg.com/categories/vitamins-and-supplements-10",
        price: "₹850"
    },
    {
        name: "Baby Moisturizing Lotion",
        description: "Gentle, hypoallergenic formula for delicate baby skin. Paraben-free.",
        imageUrl: "https://images.unsplash.com/photo-1556228390-e59e51928014?auto=format&fit=crop&w=800&q=80",
        category: "baby",
        isSponsored: false,
        price: "₹450"
    },
    {
        name: "Anti-Colic Feeding Bottle",
        description: "Reduces air intake for comfortable feeding. BPA free plastic.",
        imageUrl: "https://images.unsplash.com/photo-1596461944747-062f6b8c8c7c?auto=format&fit=crop&w=800&q=80",
        category: "baby",
        isSponsored: false,
        price: "₹699"
    },
    {
        name: "Maternity Yoga Pants",
        description: "Stretchy, high-waisted comfortable wear for all trimesters.",
        imageUrl: "https://images.unsplash.com/photo-1505236273191-1dce886b01e9?auto=format&fit=crop&w=800&q=80",
        category: "clothing",
        isSponsored: false,
        price: "₹1,499"
    },
    {
        name: "Organic Baby Wipes (3 Packs)",
        description: "99% water, fragrance-free, dermatologically tested wipes.",
        imageUrl: "https://plus.unsplash.com/premium_photo-1675806456041-3e05a3962638?auto=format&fit=crop&w=800&q=80",
        category: "hygiene",
        isSponsored: false,
        price: "₹399"
    },
    {
        name: "Pregnancy Pillow (U-Shape)",
        description: "Full body support for better sleep and back pain relief.",
        imageUrl: "https://images.unsplash.com/photo-1542848285-d816fd80cdae?auto=format&fit=crop&w=800&q=80",
        category: "pregnancy",
        isSponsored: true,
        companyName: "SleepWell",
        price: "₹2,499"
    },
    {
        name: "Infant Paracetamol Drops",
        description: "Pain and fever relief. Dosage as per doctor's prescription only.",
        imageUrl: "https://images.unsplash.com/photo-1550572017-edb9134a4968?auto=format&fit=crop&w=800&q=80",
        category: "medicine",
        isSponsored: false,
        price: "Consult Doctor"
    }
];

export const seedMarketplace = async () => {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            console.log('🌱 Seeding Marketplace Data...');
            await Product.insertMany(seedProducts);
            console.log('✅ Marketplace Data Seeded Successfully');
        } else {
            console.log('ℹ️ Marketplace data already exists. Skipping seed.');
        }
    } catch (error) {
        console.error('❌ Error seeding marketplace data:', error);
    }
};
