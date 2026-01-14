let productService;

class ProductService {

    photos = [];


    filter = {
        cat: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        subCategory: undefined,
        queryString: (includePaging) => {
            let qs = "";
            if(this.filter.cat){ qs = `cat=${this.filter.cat}`; }
            if(this.filter.minPrice)
            {
                const minP = `minPrice=${this.filter.minPrice}`;
                if(qs.length>0) {   qs += `&${minP}`; }
                else { qs = minP; }
            }
            if(this.filter.maxPrice)
            {
                const maxP = `maxPrice=${this.filter.maxPrice}`;
                if(qs.length>0) {   qs += `&${maxP}`; }
                else { qs = maxP; }
            }
            if(this.filter.subCategory)
            {
                const sub = `subCategory=${this.filter.subCategory}`;
                if(qs.length>0) {   qs += `&${sub}`; }
                else { qs = sub; }
            }

            if(includePaging)
            {
                const p = `page=${this.page}`;
                const s = `size=${this.size}`;
                if(qs.length>0) { qs += `&${p}&${s}`; }
                else { qs = `${p}&${s}`; }
            }

            return qs.length > 0 ? `?${qs}` : "";
        }
    }

    constructor() {

        //load list of photos into memory
        axios.get("images/products/photos.json")
            .then(response => {
                this.photos = response.data;
            });
    }

    page = 1;
    size = 12;
    total = 0;

    computePageSize()
    {
        // Show exactly two rows of products based on available width
        try {
            const content = document.getElementById('content');
            if (!content) return;
            const width = content.clientWidth || window.innerWidth;
            const minCardW = 280;
            const cols = Math.max(1, Math.floor(width / minCardW));
            const computed = cols * 2; // two rows
            // Clamp to a reasonable range
            this.size = Math.min(24, Math.max(4, computed));
        } catch (_) {
            // keep default size
        }
    }

    hasPhoto(photo){
        return this.photos.filter(p => p == photo).length > 0;
    }

    addCategoryFilter(cat)
    {
        if(cat == 0) this.clearCategoryFilter();
        else this.filter.cat = cat;
    }
    addMinPriceFilter(price)
    {
        if(price == 0 || price == "") this.clearMinPriceFilter();
        else this.filter.minPrice = price;
    }
    addMaxPriceFilter(price)
    {
        if(price == 0 || price == "") this.clearMaxPriceFilter();
        else this.filter.maxPrice = price;
    }
    addSubcategoryFilter(subCategory)
    {
        if(subCategory == "") this.clearSubcategoryFilter();
        else this.filter.subCategory = subCategory;
    }

    clearCategoryFilter()
    {
        this.filter.cat = undefined;
    }
    clearMinPriceFilter()
    {
        this.filter.minPrice = undefined;
    }
    clearMaxPriceFilter()
    {
        this.filter.maxPrice = undefined;
    }
    clearSubcategoryFilter()
    {
        this.filter.subCategory = undefined;
    }

    search()
    {
        this.computePageSize();
        const countUrl = `${config.baseUrl}/products/count${this.filter.queryString(false)}`;
        const pageUrl = `${config.baseUrl}/products${this.filter.queryString(true)}`;

        axios.get(countUrl)
            .then(countResp => {
                this.total = countResp.data || 0;
                return axios.get(pageUrl);
            })
            .then(response => {
                let data = {};
                data.products = response.data;

                data.products.forEach(product => {
                    if(!this.hasPhoto(product.imageUrl))
                    {
                        product.imageUrl = "no-image.jpg";
                    }
                    // mark wishlist state if available
                    try {
                        if (typeof wishlistService !== 'undefined' && wishlistService && wishlistService.loaded) {
                            product.isWishlisted = wishlistService.has(product.productId);
                        } else {
                            product.isWishlisted = false;
                        }
                    } catch(_) { product.isWishlisted = false; }
                })

                data.page = this.page;
                data.size = this.size;
                data.total = this.total;
                data.hasPrev = this.page > 1;
                data.hasNext = (this.page * this.size) < this.total;

                templateBuilder.build('product', data, 'content', this.enableButtons);
            })
            .catch(error => {
                const data = {
                    error: "Searching products failed."
                };

                templateBuilder.append("error", data, "errors")
            });
    }

    enableButtons()
    {
        const buttons = [...document.querySelectorAll(".add-button")];

        if(userService.isLoggedIn())
        {
            buttons.forEach(button => {
                button.classList.remove("invisible")
            });
        }
        else
        {
            buttons.forEach(button => {
                button.classList.add("invisible")
            });
        }
    }

    nextPage()
    {
        if ((this.page * this.size) < this.total)
        {
            this.page += 1;
            this.search();
        }
    }

    prevPage()
    {
        if (this.page > 1)
        {
            this.page -= 1;
            this.search();
        }
    }
}





document.addEventListener('DOMContentLoaded', () => {
    productService = new ProductService();

});
