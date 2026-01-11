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
    }
}

document.addEventListener('DOMContentLoaded', () => {
    wishlistService = new WishlistService();
});
