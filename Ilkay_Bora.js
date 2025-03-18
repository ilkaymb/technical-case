(() => {
    const self = {
        products: [],
        likedProducts: [],
        currentPage: 0,
        itemsPerPage: 6,
        productApiUrl: 'https://gist.githubusercontent.com/sevindi/5765c5812bbc8238a38b3cf52f233651/raw/56261d81af8561bf0a7cf692fe572f9e1e91f372/products.json'
    };


    function isJQueryLoaded() {
        return typeof jQuery !== 'undefined';
    }


    function isFontAwesomeLoaded() {
        return !!document.querySelector('link[href*="font-awesome"]');
    }

    async function loadResources() {
        return new Promise((resolve) => {
            if (isJQueryLoaded() && isFontAwesomeLoaded()) {
                console.log("jQuery and Font Awesome are already loaded!");
                resolve();
                return;
            }

            if (!isJQueryLoaded()) {
                var script = document.createElement('script');
                script.src = "https://code.jquery.com/jquery-3.6.0.min.js";
                
                script.onload = function() {
                    console.log("jQuery loaded successfully!");
                    
                    if (!isFontAwesomeLoaded()) {
                        loadFontAwesome(resolve);
                    } else {
                        resolve();
                    }
                };
                
                document.head.appendChild(script);
            } 
            else if (!isFontAwesomeLoaded()) {
                loadFontAwesome(resolve);
            }
        });
    }

    function loadFontAwesome(callback) {
        var fontAwesomeStyle = document.createElement('link');
        fontAwesomeStyle.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css";
        fontAwesomeStyle.rel = 'stylesheet';
        fontAwesomeStyle.onload = function() {
            console.log("Font Awesome loaded successfully!");
            callback();
        };
        document.head.appendChild(fontAwesomeStyle);
    }

    const init = () => {
        if (!document.querySelector('.product-detail')) {
            return;
        }

        loadLikedProducts();

        const cachedProducts = localStorage.getItem('lcwCarouselProducts');
        if (cachedProducts) {
            self.products = JSON.parse(cachedProducts);
            buildHTML();
            buildCSS();
            setEvents();
            updateCarousel();
        } else {
            fetchProducts()
                .then(() => {
                    buildHTML();
                    buildCSS();
                    setEvents();
                    updateCarousel();
                })
                .catch(error => {
                    console.error('Error initializing carousel:', error);
                });
        }
    };

    const fetchProducts = () => {
        return fetch(self.productApiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                self.products = data;
                localStorage.setItem('lcwCarouselProducts', JSON.stringify(data));
            });
    };

    const loadLikedProducts = () => {
        const saved = localStorage.getItem('lcwLikedProducts');
        if (saved) {
            self.likedProducts = JSON.parse(saved);
        }
    };

    const saveLikedProducts = () => {
        localStorage.setItem('lcwLikedProducts', JSON.stringify(self.likedProducts));
    };

    const buildHTML = () => {
        const html = `
        <div>
        <h2 class="lcw-carousel-title">You Might Also Like</h2>
            <div class="lcw-carousel-container">
                <div class="lcw-carousel-wrapper">
                    <button class="lcw-carousel-arrow lcw-carousel-prev">&#8249</button>
                        <div class="lcw-carousel-track"></div>
                    <button class="lcw-carousel-arrow lcw-carousel-next">&#8250</button>
                </div>
            </div>
        </div>
        `;

        $('.product-detail').append(html);
    };

    const buildCSS = () => {
        const css = `
            .lcw-carousel-container {
                display: flex;
                align-items: center;
                position: relative;
                overflow: hidden;
                width: 100%;
                margin: 0 auto;
            }

            .lcw-carousel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding: 15px 10px;
            }

            .lcw-carousel-title {
                font-family: "Open Sans", sans-serif;
                font-weight: 400;
                font-size: 28px;
                color: #555;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .lcw-carousel-arrow {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 50px;
                height: 50px;
                font-size: 60px;
                background-color: transparent;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                z-index: 100;
            }

            .lcw-carousel-prev {
                left: 10px;
            }

            .lcw-carousel-next {
                right: 10px;
            }

            .lcw-carousel-arrow:hover {

            }

            .lcw-carousel-arrow:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .lcw-carousel-wrapper {
                position: relative;
                padding: 0 5px 15px;
            }

            .lcw-carousel-track {
                display: flex;
                transition: transform 0.3s ease;
                gap: 10px; 
            }

            .lcw-product-card {
                flex: 0 0 calc(16.666% - 10px); 
                box-sizing: border-box;
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor:pointer;
            }

            .lcw-product-image-container {
                position: relative;
                aspect-ratio: 3/4;
                background-color: #f5f5f5;
            }

            .lcw-product-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .lcw-product-like {
                position: absolute;
                top: 10px;
                right: 10px;
                width: 40px;
                height: 40px;
                background-color: white;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                border: 1px solid #e5e5e5;
                transition: all 0.2s ease;
                z-index: 2;
                box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.01);
            }

            .lcw-product-like i {
                color: #ccc;
                font-size: 20px;
            }

            .lcw-product-info {
                padding: 10px 5px;
            }

            .lcw-product-title {
                font-size: 18px;
                font-weight: 400;
                color: #333;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }

            .lcw-product-price {
                font-size: 20px;
                white-space: nowrap;
                letter-spacing: -0.2px;
                color: #193db0;
            }

            .lcw-product-like.liked i {
                color: rgb(25, 61, 176);
            }

            @media (max-width: 768px) {
                .lcw-carousel-prev {
                    left: 0;
                }

                .lcw-carousel-next {
                    right: 0;
                }

                .lcw-carousel-arrow {
                    font-size: 40px;
                    width: 50px;
                    height: 50px;
                }

                .lcw-product-title {
                    font-size: 16px;
                }
            }

            @media (max-width: 1200px) {
                .lcw-product-card {
                    flex: 0 0 calc(20% - 15px);
                }
            }

            @media (max-width: 992px) {
                .lcw-product-card {
                    flex: 0 0 calc(25% - 15px);
                }
            }

            @media (max-width: 768px) {
                .lcw-product-card {
                    flex: 0 0 calc(33.333% - 15px);
                }
            }

            @media (max-width: 576px) {
                .lcw-product-card {
                    flex: 0 0 calc(50% - 15px);
                }

                .lcw-carousel-title {
                    font-size: 18px;
                }
            }
        `;

        $('<style>').addClass('lcw-carousel-style').html(css).appendTo('head');
    };

    const setEvents = () => {
        $('.lcw-carousel-prev').on('click', () => {
            if (self.currentPage > 0) {
                self.currentPage--;
                updateCarousel();
            }
        });

        $('.lcw-carousel-next').on('click', () => {
            const maxPages = Math.ceil(self.products.length / self.itemsPerPage) - 1;
            if (self.currentPage < maxPages) {
                self.currentPage++;
                updateCarousel();
            }
        });

        $(window).on('resize', () => {
            updateItemsPerPage();
            updateCarousel();
        });

        $(document).on('click', '.lcw-product-like', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const productId = $(this).data('product-id');
            toggleLike(productId);
        });

        $(document).on('click', '.lcw-product-card', function() {
            const productUrl = $(this).data('product-url');
            if (productUrl) {
                window.open(productUrl, '_blank');
            }
        });

        updateItemsPerPage();
    };

    const updateItemsPerPage = () => {
        const width = $(window).width();
        if (width <= 576) {
            self.itemsPerPage = 2;
        } else if (width <= 768) {
            self.itemsPerPage = 3;
        } else if (width <= 992) {
            self.itemsPerPage = 4;
        } else if (width <= 1200) {
            self.itemsPerPage = 5;
        } else {
            self.itemsPerPage = 6;
        }

        const maxPages = Math.ceil(self.products.length / self.itemsPerPage) - 1;
        if (self.currentPage > maxPages) {
            self.currentPage = maxPages;
        }
    };

    const toggleLike = (productId) => {
        const likedIndex = self.likedProducts.indexOf(productId);
        
        if (likedIndex === -1) {
            self.likedProducts.push(productId);
            $(`.lcw-product-like[data-product-id="${productId}"]`).addClass('liked');
        } else {
            self.likedProducts.splice(likedIndex, 1);
            $(`.lcw-product-like[data-product-id="${productId}"]`).removeClass('liked');
        }
        
        saveLikedProducts();
    };

    const updateCarousel = () => {
        const $track = $('.lcw-carousel-track');
        $track.empty();

        const startIndex = self.currentPage * self.itemsPerPage;
        const endIndex = Math.min(startIndex + self.itemsPerPage, self.products.length);

        for (let i = startIndex; i < endIndex; i++) {
            const product = self.products[i];
            const isLiked = self.likedProducts.includes(product.id);
            
            const productCard = `
                <div class="lcw-product-card" data-product-url="${product.url}">
                    <div class="lcw-product-image-container">
                        <img class="lcw-product-image" src="${product.img}" alt="${product.name}">
                        <button class="lcw-product-like ${isLiked ? 'liked' : ''}" data-product-id="${product.id}">
                            <i class="fa fa-heart heart" aria-hidden="true"></i>
                        </button>
                    </div>
                    <div class="lcw-product-info">
                        <h3 class="lcw-product-title">${product.name}</h3>
                        <p class="lcw-product-price">${product.price} TL</p>
                    </div>
                </div>
            `;
            
            $track.append(productCard);
        }

        $('.lcw-carousel-prev').prop('disabled', self.currentPage === 0);
        $('.lcw-carousel-next').prop('disabled', self.currentPage >= Math.ceil(self.products.length / self.itemsPerPage) - 1);
        
    };

    (async function initializeApp() {
        await loadResources();
        console.log("All resources loaded, initializing application...");
        init();
    })();

})();