package com.aalliswell.service;

import com.aalliswell.dto.activity.ActivityDtos;
import com.aalliswell.entity.Product;
import com.aalliswell.enums.ProductCategory;
import com.aalliswell.repository.ProductRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MarketplaceService {

    private final ProductRepository productRepository;

    public MarketplaceService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<ActivityDtos.ProductResponse> products(String category) {
        List<Product> products = category == null || category.isBlank() || "all".equalsIgnoreCase(category)
                ? productRepository.findAllByOrderBySponsoredDescCreatedAtDesc()
                : productRepository.findByCategoryOrderBySponsoredDescCreatedAtDesc(
                        EnumParser.parse(ProductCategory.class, category, ProductCategory.BABY));
        return products.stream().map(ActivityDtos.ProductResponse::from).toList();
    }

    @Transactional
    public ActivityDtos.ProductResponse create(ActivityDtos.ProductRequest request) {
        Product product = new Product();
        apply(product, request);
        return ActivityDtos.ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public int seed() {
        productRepository.deleteAll();
        List<Product> products = seedProducts().stream().map(request -> {
            Product product = new Product();
            apply(product, request);
            return product;
        }).toList();
        productRepository.saveAll(products);
        return products.size();
    }

    private void apply(Product product, ActivityDtos.ProductRequest request) {
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(EnumParser.parse(ProductCategory.class, request.getCategory(), ProductCategory.BABY));
        product.setPrice(request.getPrice());
        product.setSponsored(Boolean.TRUE.equals(request.getIsSponsored()));
        product.setCompanyName(request.getCompanyName());
        product.setExternalLink(request.getExternalLink());
    }

    private List<ActivityDtos.ProductRequest> seedProducts() {
        return List.of(
                product("Premium Soft Diapers (Pack of 50)", "Ultra-soft, absorbent diapers for newborn comfort.", "baby", "INR 1299", true),
                product("Prenatal Multivitamins", "Essential nutrients for mother and baby health.", "pregnancy", "INR 850", true),
                product("Baby Moisturizing Lotion", "Gentle hypoallergenic formula for delicate baby skin.", "baby", "INR 450", false),
                product("Anti-Colic Feeding Bottle", "BPA-free bottle that reduces air intake.", "baby", "INR 699", false),
                product("Maternity Yoga Pants", "Stretchy high-waisted comfortable wear for all trimesters.", "clothing", "INR 1499", false),
                product("Organic Baby Wipes", "Fragrance-free wipes for delicate skin.", "hygiene", "INR 399", false),
                product("Pregnancy Pillow", "Full-body support for better sleep.", "pregnancy", "INR 2499", true),
                product("Infant Paracetamol Drops", "Use only as prescribed by a doctor.", "medicine", "Consult Doctor", false)
        );
    }

    private ActivityDtos.ProductRequest product(
            String name,
            String description,
            String category,
            String price,
            boolean sponsored
    ) {
        ActivityDtos.ProductRequest request = new ActivityDtos.ProductRequest();
        request.setName(name);
        request.setDescription(description);
        request.setImageUrl("https://images.unsplash.com/photo-1596461944747-062f6b8c8c7c?q=80&w=800&auto=format&fit=crop");
        request.setCategory(category);
        request.setPrice(price);
        request.setIsSponsored(sponsored);
        request.setCompanyName(sponsored ? "Aal Is Well Partner" : null);
        request.setExternalLink("https://www.amazon.in/s?k=" + name.replace(" ", "+"));
        return request;
    }
}
