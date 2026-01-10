package org.yearup.data;

import org.yearup.models.Product;
import java.util.List;

public interface WishlistDao {
    List<Product> listByUserId(int userId);
    void add(int userId, int productId);
    void remove(int userId, int productId);
    boolean exists(int userId, int productId);
}
