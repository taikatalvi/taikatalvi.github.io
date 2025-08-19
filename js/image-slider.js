/**
 * Image Slider JavaScript
 * A reusable image slider component with touch support and accessibility features
 */

class ImageSlider {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            autoPlay: options.autoPlay !== false,
            autoPlayInterval: options.autoPlayInterval || 5000,
            transitionType: options.transitionType || 'fade', // 'fade' or 'slide'
            showIndicators: options.showIndicators !== false,
            showNavigation: options.showNavigation || false, // Changed default to false
            touchEnabled: options.touchEnabled !== false,
            keyboardEnabled: options.keyboardEnabled !== false,
            loop: options.loop !== false,
            ...options
        };
        
        this.currentIndex = 0;
        this.images = [];
        this.indicators = [];
        this.autoPlayTimer = null;
        this.isTransitioning = false;
        
        this.init();
    }
    
    init() {
        if (!this.container) {
            console.error('ImageSlider: Container not found');
            return;
        }
        
        this.images = Array.from(this.container.querySelectorAll('img'));
        this.totalImages = this.images.length;
        
        if (this.totalImages === 0) {
            console.warn('ImageSlider: No images found');
            return;
        }
        
        this.createNavigation();
        if (this.options.showIndicators) {
            this.createIndicators();
        }
        
        this.setupEventListeners();
        this.showImage(0);
        
        if (this.options.autoPlay) {
            this.startAutoPlay();
        }
    }
    
    createNavigation() {
        if (!this.options.showNavigation) return;
        
        const nav = document.createElement('div');
        nav.className = 'slider-nav';
        
        const prevBtn = document.createElement('button');
        prevBtn.className = 'slider-btn';
        prevBtn.innerHTML = '‹';
        prevBtn.setAttribute('aria-label', 'Previous image');
        prevBtn.onclick = () => this.previous();
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'slider-btn';
        nextBtn.innerHTML = '›';
        nextBtn.setAttribute('aria-label', 'Next image');
        nextBtn.onclick = () => this.next();
        
        nav.appendChild(prevBtn);
        nav.appendChild(nextBtn);
        
        this.container.parentNode.insertBefore(nav, this.container.nextSibling);
        this.prevBtn = prevBtn;
        this.nextBtn = nextBtn;
    }
    
    createIndicators() {
        const indicatorsContainer = document.createElement('div');
        indicatorsContainer.className = 'slider-indicators';
        
        for (let i = 0; i < this.totalImages; i++) {
            const indicator = document.createElement('span');
            indicator.className = 'indicator';
            indicator.setAttribute('aria-label', `Go to image ${i + 1}`);
            indicator.onclick = () => this.goToImage(i);
            indicatorsContainer.appendChild(indicator);
            this.indicators.push(indicator);
        }
        
        this.container.parentNode.insertBefore(indicatorsContainer, this.container.nextSibling);
    }
    
    setupEventListeners() {
        if (this.options.keyboardEnabled) {
            document.addEventListener('keydown', this.handleKeyDown.bind(this));
        }
        
        if (this.options.touchEnabled) {
            this.setupTouchEvents();
        }
        
        // Pause auto-play on hover
        if (this.options.autoPlay) {
            this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
            this.container.addEventListener('mouseleave', () => this.startAutoPlay());
        }
    }
    
    setupTouchEvents() {
        let startX = 0;
        let startY = 0;
        let startTime = 0;
        
        this.container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        });
        
        this.container.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const endTime = Date.now();
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = endTime - startTime;
            
            // Only handle horizontal swipes
            if (Math.abs(deltaX) > Math.abs(deltaY) && deltaTime < 500) {
                if (deltaX > 50) {
                    this.previous();
                } else if (deltaX < -50) {
                    this.next();
                }
            }
        });
    }
    
    handleKeyDown(e) {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.previous();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.next();
                break;
            case 'Home':
                e.preventDefault();
                this.goToImage(0);
                break;
            case 'End':
                e.preventDefault();
                this.goToImage(this.totalImages - 1);
                break;
        }
    }
    
    showImage(index) {
        if (this.isTransitioning || index < 0 || index >= this.totalImages) {
            return;
        }
        
        this.isTransitioning = true;
        
        // Remove active class from all images and indicators
        this.images.forEach(img => {
            img.classList.remove('active', 'prev');
        });
        
        if (this.indicators.length > 0) {
            this.indicators.forEach(ind => ind.classList.remove('active'));
        }
        
        // Add active class to current image and indicator
        this.images[index].classList.add('active');
        if (this.indicators.length > 0) {
            this.indicators[index].classList.add('active');
        }
        
        // Update navigation button states
        if (this.prevBtn) {
            this.prevBtn.disabled = !this.options.loop && index === 0;
        }
        if (this.nextBtn) {
            this.nextBtn.disabled = !this.options.loop && index === this.totalImages - 1;
        }
        
        this.currentIndex = index;
        
        // Update ARIA labels
        this.container.setAttribute('aria-label', `Image ${index + 1} of ${this.totalImages}`);
        
        // Transition complete
        setTimeout(() => {
            this.isTransitioning = false;
        }, 500);
    }
    
    next() {
        if (this.options.loop) {
            this.showImage((this.currentIndex + 1) % this.totalImages);
        } else if (this.currentIndex < this.totalImages - 1) {
            this.showImage(this.currentIndex + 1);
        }
    }
    
    previous() {
        if (this.options.loop) {
            this.showImage((this.currentIndex - 1 + this.totalImages) % this.totalImages);
        } else if (this.currentIndex > 0) {
            this.showImage(this.currentIndex - 1);
        }
    }
    
    goToImage(index) {
        if (index >= 0 && index < this.totalImages) {
            this.showImage(index);
        }
    }
    
    startAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
        }
        
        this.autoPlayTimer = setInterval(() => {
            this.next();
        }, this.options.autoPlayInterval);
    }
    
    pauseAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }
    
    stopAutoPlay() {
        this.pauseAutoPlay();
        this.options.autoPlay = false;
    }
    
    destroy() {
        this.pauseAutoPlay();
        
        if (this.options.keyboardEnabled) {
            document.removeEventListener('keydown', this.handleKeyDown.bind(this));
        }
        
        // Remove event listeners and clean up
        this.container = null;
        this.images = [];
        this.indicators = [];
    }
}

// Auto-initialize sliders when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const sliders = document.querySelectorAll('.image-slider');
    sliders.forEach(slider => {
        const containerId = slider.id;
        if (containerId) {
            new ImageSlider(containerId);
        }
    });
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageSlider;
}
