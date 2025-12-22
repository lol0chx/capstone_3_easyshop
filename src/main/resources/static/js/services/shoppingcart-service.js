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
        const main = document.getElementById("main")
        main.innerHTML = "";

        // wrapper
        let div = document.createElement("div");
        div.classList.add("filter-box");
        main.appendChild(div);

        const contentDiv = document.createElement("div")
        contentDiv.id = "content";
        contentDiv.classList.add("content-form");

        // header
        const cartHeader = document.createElement("div")
        cartHeader.classList.add("cart-header")

        const h1 = document.createElement("h1")
        h1.innerText = "Cart";
        cartHeader.appendChild(h1);

        const button = document.createElement("button");
        button.classList.add("btn")
        button.classList.add("btn-danger")
        button.innerText = "Clear";
        button.addEventListener("click", () => this.clearCart());
        cartHeader.appendChild(button)

        contentDiv.appendChild(cartHeader)

        // items list
        this.cart.items.forEach(item => {
            this.buildItem(item, contentDiv)
        });

        // total summary at bottom
        const totalBox = document.createElement("div");
        totalBox.classList.add("cart-total", "mt-3");
        const totalLabel = document.createElement("h2");
        const totalNumber = Number(this.cart.total || 0);
        totalLabel.innerText = `Total: $${totalNumber.toFixed(2)}`;
        totalBox.appendChild(totalLabel);
        contentDiv.appendChild(totalBox);

        main.appendChild(contentDiv);
    }

    buildItem(item, parent)
    {
        let outerDiv = document.createElement("div");
        outerDiv.classList.add("cart-item");

        let div = document.createElement("div");
        outerDiv.appendChild(div);
        let h4 = document.createElement("h4")
        h4.innerText = item.product.name;
        div.appendChild(h4);

        let photoDiv = document.createElement("div");
        photoDiv.classList.add("photo")
        let img = document.createElement("img");
        const photoName = (item.product.imageUrl && item.product.imageUrl.trim().length > 0)
            ? item.product.imageUrl
            : "no-image.jpg";
        // use relative path for consistency with templates
        img.src = `images/products/${photoName}`
        img.alt = item.product.name || "Product image";
        img.onerror = () => { img.src = "images/products/no-image.jpg"; };
        img.addEventListener("click", () => {
            showImageDetailForm(item.product.name, img.src)
        })
        photoDiv.appendChild(img)
        let priceH4 = document.createElement("h4");
        priceH4.classList.add("price");
        priceH4.innerText = `$${item.product.price}`;
        photoDiv.appendChild(priceH4);
        outerDiv.appendChild(photoDiv);

        let descriptionDiv = document.createElement("div");
        descriptionDiv.innerText = item.product.description;
        outerDiv.appendChild(descriptionDiv);

        let quantityDiv = document.createElement("div")
        quantityDiv.classList.add("quantity-controls");

        const minusBtn = document.createElement("button");
        minusBtn.classList.add("btn","btn-secondary","btn-sm");
        minusBtn.innerText = "-";
        minusBtn.addEventListener("click", () => this.decrementItem(item.product.productId, item.quantity));
        quantityDiv.appendChild(minusBtn);

        const qtySpan = document.createElement("span");
        qtySpan.classList.add("mx-2");
        qtySpan.innerText = `Quantity: ${item.quantity}`;
        quantityDiv.appendChild(qtySpan);

        const plusBtn = document.createElement("button");
        plusBtn.classList.add("btn","btn-secondary","btn-sm");
        plusBtn.innerText = "+";
        plusBtn.addEventListener("click", () => this.incrementItem(item.product.productId));
        quantityDiv.appendChild(plusBtn);

        const removeBtn = document.createElement("button");
        removeBtn.classList.add("btn","btn-danger","btn-sm","ms-3");
        removeBtn.innerText = "Remove";
        removeBtn.addEventListener("click", () => this.removeItem(item.product.productId));
        quantityDiv.appendChild(removeBtn);

        outerDiv.appendChild(quantityDiv)


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
                // Reload cart from server to ensure total stays accurate
                const cartUrl = `${config.baseUrl}/cart`;
                return axios.get(cartUrl)
            })
            .then(response => {
                this.setCart(response.data);
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
