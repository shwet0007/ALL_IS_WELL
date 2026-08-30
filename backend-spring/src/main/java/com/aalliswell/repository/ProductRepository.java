package com.aalliswell.repository;

import com.aalliswell.entity.Product;
import com.aalliswell.enums.ProductCategory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findAllByOrderBySponsoredDescCreatedAtDesc();

    List<Product> findByCategoryOrderBySponsoredDescCreatedAtDesc(ProductCategory category);
}
