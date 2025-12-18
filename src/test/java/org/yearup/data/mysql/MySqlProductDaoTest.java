package org.yearup.data.mysql;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.yearup.models.Product;

import java.math.BigDecimal;
import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MySqlProductDaoTest extends BaseDaoTestClass
{
    private MySqlProductDao dao;

    @BeforeEach
    public void setup()
    {
        dao = new MySqlProductDao(dataSource);
    }

    @Test
    public void getById_shouldReturn_theCorrectProduct()
    {
        // arrange
        int productId = 1;
        Product expected = new Product()
        {{
            setProductId(1);
            setName("Smartphone");
            setPrice(new BigDecimal("499.99"));
            setCategoryId(1);
            setDescription("A powerful and feature-rich smartphone for all your communication needs.");
            setSubCategory("Black");
            setStock(50);
            setFeatured(false);
            setImageUrl("smartphone.jpg");
        }};

        // act
        var actual = dao.getById(productId);

        // assert
        assertEquals(expected.getPrice(), actual.getPrice(), "Because I tried to get product 1 from the database.");
    }

    @Test
    public void search_byCategory_only_shouldReturn_onlyCategoryMatches()
    {
        // act
        var results = dao.search(1, null, null, null);

        // assert (Smartphone, Laptop, Headphones)
        assertNotNull(results);
        assertEquals(3, results.size());
        assertTrue(results.stream().allMatch(p -> p.getCategoryId() == 1));
    }

    @Test
    public void search_byMinPrice_only_shouldApplyLowerBound()
    {
        // act
        var results = dao.search(null, new BigDecimal("80"), null, null);

        // assert (>= 80: Smartphone 499.99, Laptop 899.99, Headphones 99.99, Cookware Set 149.99)
        assertNotNull(results);
        assertEquals(4, results.size());
        assertTrue(results.stream().allMatch(p -> p.getPrice().compareTo(new BigDecimal("80")) >= 0));
    }




    @Test
    public void search_byMinAndMax_shouldApplyBothBounds()
    {
        // act
        var results = dao.search(null, new BigDecimal("50"), new BigDecimal("100"), null);

        // assert (expected 5 items: 59.99, 69.99, 79.99, 59.99, 99.99)
        assertNotNull(results);
        assertEquals(5, results.size());
        assertTrue(results.stream().allMatch(p -> p.getPrice().compareTo(new BigDecimal("50")) >= 0
                && p.getPrice().compareTo(new BigDecimal("100")) <= 0));
    }

    @Test
    public void search_bySubCategory_shouldBeCaseInsensitive()
    {
        // act
        var results = dao.search(null, null, null, "red");

        // assert (Cookware Set: subcategory 'Red')
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("Red", results.get(0).getSubCategory());
    }

    @Test
    public void search_byCategory_and_SubCategory_shouldCombineFilters()
    {
        // act
        var results = dao.search(3, null, null, "black");

        // assert (Coffee Maker in category 3, subcategory 'Black')
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(3, results.get(0).getCategoryId());
        assertEquals("Black", results.get(0).getSubCategory());
    }

}