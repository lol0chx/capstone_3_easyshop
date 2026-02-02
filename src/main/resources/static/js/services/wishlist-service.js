let wishlistService;

class WishlistService {
    items = new Set();
    loaded = false;

    load() {
        if (!userService || !userService.isLoggedIn()) {
            this.items = new Set();
            this.loaded = true;
            return;
        }
        const url = `${config.baseUrl}/wishlist`;
        axios.get(url)
            .then(resp => {
                this.items = new Set((resp.data || []).map(p => p.productId));
                this.loaded = true;
            })
            .catch(_ => {
                this.items = new Set();
                this.loaded = true;
            });
    }

    has(productId) {
        return this.items.has(productId);
    }

    add(productId) {
        const url = `${config.baseUrl}/wishlist/${productId}`;
        axios.post(url, {})
            .then(_ => {
                this.items.add(productId);
                this.refreshAfterChange();
            })
            .catch(_ => {
                const data = { error: "Add to wishlist failed." };
                templateBuilder.append("error", data, "errors");
            });
    }

    remove(productId) {
        const url = `${config.baseUrl}/wishlist/${productId}`;
        axios.delete(url)
            .then(_ => {
                this.items.delete(productId);
                this.refreshAfterChange();
            })
            .catch(_ => {
                const data = { error: "Remove from wishlist failed." };
                templateBuilder.append("error", data, "errors");
            });
    }

    toggle(productId) {
        if (!userService || !userService.isLoggedIn()) {
            const data = { error: "Please login to use Wishlist." };
            templateBuilder.append("error", data, "errors");
            return;
        }
        if (this.has(productId)) this.remove(productId); else this.add(productId);
    }

    refreshAfterChange() {
        // Re-render products to update heart state if content grid is showing
        const content = document.getElementById('content');
        if (content) {
            productService.search();
        }
        // Also refresh wishlist page if open
        const wishlistContent = document.getElementById('wishlist-content');
        if (wishlistContent) {
            this.loadWishlistPage();
        }
    }

    loadWishlistPage() {
        if (!userService || !userService.isLoggedIn()) {
            const data = { error: "Please login to view your Wishlist." };
            templateBuilder.append("error", data, "errors");
            return;
        }

        // First render the wishlist template structure
        templateBuilder.build('wishlist', {}, 'main');
        
        // Add no-sidebar class to main for full-width
        const mainEl = document.querySelector('main');
        if (mainEl) mainEl.classList.add('no-sidebar');

        const url = `${config.baseUrl}/wishlist`;
        axios.get(url)
            .then(resp => {
                const products = resp.data || [];
                const wishlistContent = document.getElementById('wishlist-content');
                
                if (products.length === 0) {
                    wishlistContent.innerHTML = `
                        <div class="wishlist-empty">
                            <i class="fas fa-heart-broken" style="font-size: 4rem; color: #d1d5db; margin-bottom: 1rem;"></i>
                            <h3>Your wishlist is empty</h3>
                            <p>Start adding items you love by clicking the heart icon on products!</p>
                            <button class="btn btn-primary" onclick="loadHome()">
                                <i class="fas fa-shopping-bag" style="margin-right: 0.5rem;"></i>Browse Products
                            </button>
                        </div>
                    `;
                    return;
                }

                let html = '';
                products.forEach(product => {
                    const imageUrl = productService && productService.hasPhoto && productService.hasPhoto(product.imageUrl) 
                        ? product.imageUrl 
                        : 'no-image.jpg';
                    html += `
                        <div class="wishlist-item">
                            <div class="wishlist-item-image">
                                <img src="images/products/${imageUrl}" alt="${product.name}" onclick="showImageDetailForm('${product.name}','images/products/${imageUrl}')">
                            </div>
                            <div class="wishlist-item-details">
                                <h4 class="wishlist-item-name">${product.name}</h4>
                                <p class="wishlist-item-desc">${product.description || ''}</p>
                                <div class="wishlist-item-price">$${product.price.toFixed(2)}</div>
                            </div>
                            <div class="wishlist-item-actions">
                                <button class="btn btn-success" onclick="cartService.addToCart(${product.productId})">
                                    <i class="fas fa-cart-plus"></i> Add to Cart
                                </button>
                                <button class="btn btn-outline-danger" onclick="wishlistService.remove(${product.productId})">
                                    <i class="fas fa-trash"></i> Remove
                                </button>
                            </div>
                        </div>
                    `;
                });
                wishlistContent.innerHTML = html;
            })
            .catch(err => {
                const wishlistContent = document.getElementById('wishlist-content');
                if (wishlistContent) {
                    wishlistContent.innerHTML = `
                        <div class="wishlist-empty">
                            <i class="fas fa-exclamation-circle" style="font-size: 4rem; color: #ef4444; margin-bottom: 1rem;"></i>
                            <h3>Error loading wishlist</h3>
                            <p>Please try again later.</p>
                            <button class="btn btn-primary" onclick="loadHome()">
                                <i class="fas fa-home" style="margin-right: 0.5rem;"></i>Go Home
                            </button>
                        </div>
                    `;
                }
            });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    wishlistService = new WishlistService();
});
