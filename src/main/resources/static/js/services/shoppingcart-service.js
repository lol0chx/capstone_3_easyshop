let cartService;

class ShoppingCartService {

    cart = {
        items:[],
        total:0
    };

    photos = [];

    addToCart(productId)
    {
        const url = `${config.baseUrl}/cart/products/${productId}`;
        // const headers = userService.getHeaders();

        axios.post(url, {})// ,{headers})
            .then(response => {
                this.setCart(response.data)

                this.updateCartDisplay()

            })
            .catch(error => {

                const data = {
                    error: "Add to cart failed."
                };

                templateBuilder.append("error", data, "errors")
            })
    }

    setCart(data)
    {
        this.cart = {
            items: [],
            total: 0
        }

        this.cart.total = data.total;

        for (const [key, value] of Object.entries(data.items)) {
            this.cart.items.push(value);
        }
    }

    loadCart()
    {

        const url = `${config.baseUrl}/cart`;

        axios.get(url)
            .then(response => {
                this.setCart(response.data)

                this.updateCartDisplay()

            })
            .catch(error => {

                const data = {
                    error: "Load cart failed."
                };

                templateBuilder.append("error", data, "errors")
            })

    }

    loadCartPage()
    {
        // Use callback to ensure template is rendered before accessing elements
        templateBuilder.build('cart', {}, 'main', () => {
            const itemListDiv = document.getElementById("cart-item-list");
            const summaryDiv = document.getElementById("order-summary");

            if (!itemListDiv || !summaryDiv) {
                console.error("Cart elements not found in DOM");
                return;
            }

            if (this.cart.items.length === 0) {
                const emptyDiv = document.createElement("div");
                emptyDiv.classList.add("empty-cart-message");
                emptyDiv.innerHTML = `
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Start shopping to add items to your cart</p>
                    <button class="btn btn-primary" onclick="loadHome()" style="margin-top: 1rem;">
                        <i class="fas fa-shopping-bag" style="margin-right: 0.5rem;"></i>Continue Shopping
                    </button>
                `;
                itemListDiv.appendChild(emptyDiv);
            } else {
                // Build cart items
                this.cart.items.forEach(item => {
                    this.buildItem(item, itemListDiv);
                });

                // Build order summary
                const subtotal = this.cart.total;
                const tax = subtotal * 0.1; // 10% tax
                const total = subtotal + tax;

                summaryDiv.innerHTML = `
                    <div class="summary-item">
                        <span>Subtotal:</span>
                        <span>$${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="summary-item">
                        <span>Tax (10%):</span>
                        <span>$${tax.toFixed(2)}</span>
                    </div>
                    <div class="summary-item total">
                        <span>Total:</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                `;

                // Checkout Button
                const checkoutBtn = document.createElement("button");
                checkoutBtn.classList.add("btn", "btn-success");
                checkoutBtn.innerHTML = '<i class="fas fa-credit-card" style="margin-right: 0.5rem;"></i>Checkout';
                checkoutBtn.addEventListener("click", () => {
                    alert("Checkout functionality will be available soon!");
                });
                summaryDiv.appendChild(checkoutBtn);

                // Clear Cart Button
                const clearBtn = document.createElement("button");
                clearBtn.classList.add("btn", "btn-secondary");
                clearBtn.innerHTML = '<i class="fas fa-trash" style="margin-right: 0.5rem;"></i>Clear Cart';
                clearBtn.title = "Remove all items from cart";
                clearBtn.addEventListener("click", () => {
                    if (confirm('Are you sure you want to clear your entire cart?')) {
                        this.clearCart();
                    }
                });
                summaryDiv.appendChild(clearBtn);
            }
        });
    }

    buildItem(item, parent)
    {
        // Outer cart item div with 4-column grid: photo | details | price | actions
        let outerDiv = document.createElement("div");
        outerDiv.classList.add("cart-item");

        // Photo div
        let photoDiv = document.createElement("div");
        photoDiv.classList.add("photo");
        let img = document.createElement("img");
        const photoName = (item.product.imageUrl && item.product.imageUrl.trim().length > 0)
            ? item.product.imageUrl
            : "no-image.jpg";
        img.src = `images/products/${photoName}`;
        img.alt = item.product.name || "Product image";
        img.onerror = () => { img.src = "images/products/no-image.jpg"; };
        img.addEventListener("click", () => {
            showImageDetailForm(item.product.name, img.src)
        });
        photoDiv.appendChild(img);
        outerDiv.appendChild(photoDiv);

        // Details div
        let detailsDiv = document.createElement("div");
        detailsDiv.classList.add("cart-item-details");

        let h4 = document.createElement("h4");
        h4.innerText = item.product.name;
        detailsDiv.appendChild(h4);

        let descriptionP = document.createElement("p");
        descriptionP.innerText = item.product.description;
        detailsDiv.appendChild(descriptionP);

        // Quantity controls in details
        let quantityDiv = document.createElement("div");
        quantityDiv.classList.add("cart-item-quantity");

        const minusBtn = document.createElement("button");
        minusBtn.innerText = "−";
        minusBtn.title = "Decrease quantity";
        minusBtn.addEventListener("click", () => this.decrementItem(item.product.productId, item.quantity));
        quantityDiv.appendChild(minusBtn);

        const qtySpan = document.createElement("span");
        qtySpan.innerText = `${item.quantity}`;
        quantityDiv.appendChild(qtySpan);

        const plusBtn = document.createElement("button");
        plusBtn.innerText = "+";
        plusBtn.title = "Increase quantity";
        plusBtn.addEventListener("click", () => this.incrementItem(item.product.productId));
        quantityDiv.appendChild(plusBtn);

        detailsDiv.appendChild(quantityDiv);
        outerDiv.appendChild(detailsDiv);

        // Price div
        let priceDiv = document.createElement("div");
        priceDiv.classList.add("cart-item-price");
        priceDiv.innerText = `$${item.product.price}`;
        outerDiv.appendChild(priceDiv);

        // Actions div
        let actionsDiv = document.createElement("div");
        actionsDiv.classList.add("cart-item-actions");

        // Remove button (small, secondary style)
        const removeBtn = document.createElement("button");
        removeBtn.classList.add("cart-item-remove");
        removeBtn.innerText = "Remove";
        removeBtn.title = "Remove this item from cart";
        removeBtn.addEventListener("click", () => {
            if (confirm(`Remove ${item.product.name} from cart?`)) {
                this.removeItem(item.product.productId);
            }
        });
        actionsDiv.appendChild(removeBtn);

        outerDiv.appendChild(actionsDiv);
        parent.appendChild(outerDiv);
    }

    clearCart()
    {

        const url = `${config.baseUrl}/cart`;

        axios.delete(url)
             .then(response => {
                 // 204 No Content expected; just reset local cart
                 this.cart = { items: [], total: 0 };

                 this.updateCartDisplay()
                 this.loadCartPage()

             })
             .catch(error => {

                 const data = {
                     error: "Empty cart failed."
                 };

                 templateBuilder.append("error", data, "errors")
             })
    }

    incrementItem(productId)
    {
        const url = `${config.baseUrl}/cart/products/${productId}`;
        axios.post(url, {})
            .then(response => {
                this.setCart(response.data);
                this.updateCartDisplay();
                this.loadCartPage();
            })
            .catch(error => {
                const data = { error: "Increase quantity failed." };
                templateBuilder.append("error", data, "errors")
            });
    }

    decrementItem(productId, currentQty)
    {
        if(currentQty <= 1)
        {
            this.removeItem(productId);
            return;
        }

        const url = `${config.baseUrl}/cart/products/${productId}`;
        const body = { quantity: currentQty - 1 };
        axios.put(url, body)
            .then(response => {
                this.setCart(response.data);
                this.updateCartDisplay();
                this.loadCartPage();
            })
            .catch(error => {
                const data = { error: "Decrease quantity failed." };
                templateBuilder.append("error", data, "errors")
            });
    }

    removeItem(productId)
    {
        const url = `${config.baseUrl}/cart/products/${productId}`;
        axios.delete(url)
            .then(() => {
                // remove locally and refresh
                this.cart.items = this.cart.items.filter(i => i.product.productId !== productId);
                this.updateCartDisplay();
                this.loadCartPage();
            })
            .catch(error => {
                const data = { error: "Remove item failed." };
                templateBuilder.append("error", data, "errors")
            });
    }

    updateCartDisplay()
    {
        try {
            // Show total quantity across all items (not just unique item count)
            const itemCount = this.cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
            const cartControl = document.getElementById("cart-items")

            cartControl.innerText = itemCount;
        }
        catch (e) {

        }
    }

    constructor() {
        // Load list of photos into memory (same source as ProductService)
        axios.get("images/products/photos.json")
            .then(response => {
                this.photos = response.data;
            });
    }

    hasPhoto(photo){
        return this.photos.filter(p => p == photo).length > 0;
    }
}





document.addEventListener('DOMContentLoaded', () => {
    cartService = new ShoppingCartService();

    if(userService.isLoggedIn())
    {
        cartService.loadCart();
    }

});
