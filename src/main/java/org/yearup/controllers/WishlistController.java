package org.yearup.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.yearup.data.ProductDao;
import org.yearup.data.UserDao;
import org.yearup.data.WishlistDao;
import org.yearup.models.Product;
import org.yearup.models.User;
import org.yearup.security.SecurityUtils;

import java.util.List;

@RestController
@RequestMapping("wishlist")
@CrossOrigin
@PreAuthorize("isAuthenticated()")
public class WishlistController {

    private final WishlistDao wishlistDao;
    private final UserDao userDao;
    private final ProductDao productDao;

    @Autowired
    public WishlistController(WishlistDao wishlistDao, UserDao userDao, ProductDao productDao) {
        this.wishlistDao = wishlistDao;
        this.userDao = userDao;
        this.productDao = productDao;
    }

    @GetMapping("")
    public List<Product> list() {
        try {
            String username = SecurityUtils.getCurrentUsername().orElse("");
            if (username.isBlank()) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
            User user = userDao.getByUserName(username);
            if (user == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
            return wishlistDao.listByUserId(user.getId());
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Oops... our bad.");
        }
    }

    @PostMapping("{productId}")
    public void add(@PathVariable int productId) {
        try {
            String username = SecurityUtils.getCurrentUsername().orElse("");
            if (username.isBlank()) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
            User user = userDao.getByUserName(username);
            if (user == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
            if (productDao.getById(productId) == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
            wishlistDao.add(user.getId(), productId);
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Oops... our bad.");
        }
    }

    @DeleteMapping("{productId}")
    public void remove(@PathVariable int productId) {
        try {
            String username = SecurityUtils.getCurrentUsername().orElse("");
            if (username.isBlank()) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
            User user = userDao.getByUserName(username);
            if (user == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
            wishlistDao.remove(user.getId(), productId);
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Oops... our bad.");
        }
    }
}
