/**
 * Coco Villa – Static Website JavaScript
 * 100% static, no API calls, no database connections
 */

/* ==================== INITIALISATION ==================== */
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initIntroImages();
    initGallery();
    initRoomCarousel();
    initRevealAnimations();
    initMapInteractions();
    document.getElementById('year').textContent = new Date().getFullYear();
});


/* ==================== NAVBAR ==================== */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    let ticking = false;

    const updateNavbar = () => {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }, { passive: true });

    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    // Cache offsets once — never read offsetTop inside scroll handler (forced reflow)
    let sectionOffsets = [];
    const cacheSectionOffsets = () => {
        sectionOffsets = Array.from(sections).map(s => ({
            id: s.getAttribute('id'),
            top: s.offsetTop,
        }));
    };
    cacheSectionOffsets();
    window.addEventListener('resize', cacheSectionOffsets, { passive: true });

    const highlightNav = () => {
        let current = '';
        sectionOffsets.forEach(({ id, top }) => {
            if (window.scrollY >= top - 120) current = id;
        });
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.style.opacity = (href && href.includes(current) && current !== '') ? '1' : '1';
        });
    };

    window.addEventListener('scroll', highlightNav, { passive: true });
}

/* ==================== MOBILE MENU ==================== */
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    hamburger.addEventListener('click', () => {
        mobileMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
    });
}

function openMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
}

function closeMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
}

/* ==================== IMAGE MANIFEST ==================== */
/**
 * Static manifest of image counts per folder.
 * Update these numbers when you add or remove images.
 * Using a manifest avoids ALL network probe requests and 404 errors.
 */
const IMAGE_MANIFEST = {
    experience: { base: 'assets/experience/', count: 2 },
    garden: { base: 'assets/garden_layouts/web/', count: 9 },
    rooms: { base: 'assets/rooms/web/', count: 11 },
};

/**
 * Builds an image list from the manifest — no network requests, no 404s.
 * @param {string}   key     Key in IMAGE_MANIFEST
 * @param {Function} makeAlt Function(index) → alt text string
 * @returns {Array<{src: string, alt: string}>}
 */
function getImages(key, makeAlt = (i) => `Photo ${i}`) {
    const { base, count } = IMAGE_MANIFEST[key];
    return Array.from({ length: count }, (_, i) => ({
        src: `${base}${i + 1}.webp`,
        alt: makeAlt(i + 1),
    }));
}


/* ==================== INTRO IMAGES ==================== */
function initIntroImages() {
    const container = document.getElementById('introImages');
    if (!container) return;

    const images = getImages('experience', i => `Coco Villa experience photo ${i}`);
    container.innerHTML = '';

    // 1. Render skeletons immediately
    images.forEach((_, i) => {
        const skel = document.createElement('div');
        skel.className = 'intro-img skeleton' + (i % 2 === 0 ? ' intro-img--offset' : '');
        container.appendChild(skel);
    });

    // 2. Load real images and swap skeletons
    images.forEach(({ src, alt }, i) => {
        const loader = new Image();
        loader.onload = () => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = alt;
            img.loading = 'lazy';
            img.className = 'intro-img' + (i % 2 === 0 ? ' intro-img--offset' : '');
            makeClickable(img, () => images, i);
            container.children[i].replaceWith(img);
        };
        loader.src = src;
    });
}

/* ==================== GALLERY (drag-scroll) ==================== */
function buildGallery(items) {
    const track = document.getElementById('galleryTrack');
    if (!track) return;
    track.innerHTML = '';

    // 1. Render skeleton cards at correct dimensions right away
    items.forEach(() => {
        const skel = document.createElement('div');
        skel.className = 'gallery-card skeleton';
        skel.setAttribute('role', 'listitem');
        track.appendChild(skel);
    });

    attachGalleryDrag(track);

    // 2. Load real images and swap each skeleton individually
    items.forEach(({ src, alt }, i) => {
        const loader = new Image();
        loader.onload = () => {
            const card = document.createElement('div');
            card.className = 'gallery-card';
            card.setAttribute('role', 'listitem');
            card.style.cursor = 'zoom-in';
            const img = document.createElement('img');
            img.src = src;
            img.alt = alt;
            img.loading = 'lazy';
            card.appendChild(img);
            // Wire lightbox on the card (img has pointer-events:none)
            // Guard: only open if user barely moved (not a drag)
            card.addEventListener('click', () => {
                const dragged = track._getDragDistance ? track._getDragDistance() : 0;
                if (dragged > 6) return;
                openLightbox(items, i);
            });
            track.children[i].replaceWith(card);
        };
        loader.src = src;
    });
}


function initGallery() {
    const images = getImages('garden', i => `Coco Villa garden photo ${i}`);
    buildGallery(images);
}

function attachGalleryDrag(track) {
    let isDragging = false, startX = 0, scrollStart = 0, dragDistance = 0;

    track.addEventListener('mousedown', e => {
        isDragging = true;
        startX = e.pageX - track.offsetLeft;
        scrollStart = track.scrollLeft;
        dragDistance = 0;
        track.classList.add('dragging');
        e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
        dragDistance = Math.abs(e.pageX - track.offsetLeft - startX);
        track.scrollLeft = scrollStart - (e.pageX - track.offsetLeft - startX) * 1.2;
    });
    document.addEventListener('mouseup', () => { isDragging = false; track.classList.remove('dragging'); });
    track.addEventListener('mouseleave', () => { isDragging = false; track.classList.remove('dragging'); });

    let touchStartX = 0, touchScrollStart = 0;
    track.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].pageX;
        touchScrollStart = track.scrollLeft;
    }, { passive: true });
    track.addEventListener('touchmove', e => {
        track.scrollLeft = touchScrollStart - (e.touches[0].pageX - touchStartX);
    }, { passive: true });

    // Expose drag distance so card click handlers can ignore drags
    track._getDragDistance = () => dragDistance;
}

function scrollGallery(direction) {
    const track = document.getElementById('galleryTrack');
    if (!track) return;
    const card = track.querySelector('.gallery-card');
    const cardWidth = card ? card.offsetWidth + 24 : 320;
    track.scrollBy({ left: direction === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' });
}

/* ==================== ROOM CAROUSEL ==================== */
let currentSlide = 0, totalSlides = 0, carouselTimer = null;

function buildCarousel(images) {
    const slidesEl = document.getElementById('roomSlides');
    const dotsEl = document.getElementById('carouselDots');
    if (!slidesEl || !dotsEl) return;

    totalSlides = images.length;
    currentSlide = 0;
    slidesEl.innerHTML = '';
    dotsEl.innerHTML = '';

    images.forEach(({ src, alt }, i) => {
        // 1. Skeleton slide (first one is active so it's visible)
        const slide = document.createElement('div');
        slide.className = 'room-slide skeleton' + (i === 0 ? ' active' : '');
        slidesEl.appendChild(slide);

        // Dot
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Room photo ${i + 1}`);
        dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        dot.addEventListener('click', () => goToSlide(i));
        dotsEl.appendChild(dot);

        // 2. Load real image then swap out skeleton
        const loader = new Image();
        loader.onload = () => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = alt;
            img.loading = i === 0 ? 'eager' : 'lazy';
            slide.classList.remove('skeleton');
            slide.appendChild(img);
            makeClickable(img, () => images, i);
        };
        loader.src = src;
    });

    if (totalSlides > 1) {
        clearInterval(carouselTimer);
        carouselTimer = setInterval(() => changeSlide(1), 5000);
    }
}

function initRoomCarousel() {
    const images = getImages('rooms', i => `Coco Villa room photo ${i}`);
    buildCarousel(images);

    // Touch swipe support (same as gallery drag, but for the opacity-based carousel)
    const carousel = document.querySelector('.room-carousel');
    if (!carousel) return;

    let touchStartX = 0;

    carousel.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
        // Pause auto-advance while user is interacting
        clearInterval(carouselTimer);
    }, { passive: true });

    carousel.addEventListener('touchend', e => {
        const delta = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(delta) > 40) {          // 40px threshold feels natural
            changeSlide(delta > 0 ? 1 : -1); // swipe left → next, right → prev
        }
        // Resume auto-advance after swipe
        if (totalSlides > 1) {
            carouselTimer = setInterval(() => changeSlide(1), 5000);
        }
    }, { passive: true });
}

function changeSlide(direction) {
    const slides = document.querySelectorAll('.room-slide');
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
    slides[currentSlide].classList.add('active');
    updateDots();
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.room-slide');
    slides[currentSlide].classList.remove('active');
    currentSlide = index;
    slides[currentSlide].classList.add('active');
    updateDots();
}

function updateDots() {
    document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        const active = i === currentSlide;
        dot.classList.toggle('active', active);
        dot.setAttribute('aria-selected', active ? 'true' : 'false');
    });
}

/* ==================== BOOKING MODAL ==================== */
function openBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        const first = modal.querySelector('.modal-close, .booking-option');
        if (first) first.focus();
    }, 100);
}

function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    const trigger = document.getElementById('openBookingBtn') || document.getElementById('heroBookBtn');
    if (trigger) trigger.focus();
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        const airbnb = document.getElementById('airbnbModal');
        if (airbnb && airbnb.classList.contains('open')) { closeAirbnbModal(); return; }
        closeBookingModal();
    }
});

document.addEventListener('keydown', e => {
    // Trap focus inside whichever modal is open
    const airbnb = document.getElementById('airbnbModal');
    const booking = document.getElementById('bookingModal');
    const modal = (airbnb && airbnb.classList.contains('open')) ? airbnb : booking;

    if (!modal || !modal.classList.contains('open') || e.key !== 'Tab') return;
    const focusables = Array.from(
        modal.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter(el => !el.closest('.modal-backdrop'));
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey) { if (document.activeElement === first) { last.focus(); e.preventDefault(); } }
    else { if (document.activeElement === last) { first.focus(); e.preventDefault(); } }
});

/* ==================== AIRBNB MODAL ==================== */
function openAirbnbModal() {
    closeBookingModal(); // Hide primary modal if it was open
    const modal = document.getElementById('airbnbModal');
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        const first = modal.querySelector('.modal-close, .booking-option');
        if (first) first.focus();
    }, 100);
}

function closeAirbnbModal() {
    const modal = document.getElementById('airbnbModal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

/* ==================== MAP INTERACTIONS ==================== */
const DEFAULT_MAP_QUERY = '6.0231583168159055,80.24683406347937';
const BASE_MAP_SRC = query => `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=17&output=embed`;
let mapResetTimer = null;
let mapLoaded = false;

/**
 * Lazy-load the map iframe only when the location section scrolls into view.
 * This prevents Google Maps from making any network requests on initial page load,
 * removing it from the critical path and addressing the cache TTL warning.
 */
function initMapInteractions() {
    const section = document.getElementById('location');
    const frame = document.getElementById('mapFrame');
    if (!section || !frame) return;

    if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !mapLoaded) {
                mapLoaded = true;
                frame.src = BASE_MAP_SRC(DEFAULT_MAP_QUERY);
                obs.disconnect();
            }
        }, { rootMargin: '200px' }); // start loading 200px before it enters view
        obs.observe(section);
    } else {
        // Fallback: load immediately for browsers without IntersectionObserver
        frame.src = BASE_MAP_SRC(DEFAULT_MAP_QUERY);
        mapLoaded = true;
    }
}

function updateMap(query) {
    const frame = document.getElementById('mapFrame');
    if (!frame) return;
    clearTimeout(mapResetTimer);
    frame.style.opacity = '0.5';
    frame.src = BASE_MAP_SRC(query);
    mapLoaded = true;
    frame.addEventListener('load', () => { frame.style.opacity = '1'; }, { once: true });
}

function resetMap() {
    mapResetTimer = setTimeout(() => updateMap(DEFAULT_MAP_QUERY), 300);
}

function showAttractions() {
    updateMap('Tourist attractions in Unawatuna');
}

/* ==================== REVEAL ANIMATIONS ==================== */
function initRevealAnimations() {
    const els = document.querySelectorAll('.intro-section, .gallery-section, .stay-section, .location-section');
    els.forEach(el => el.classList.add('reveal'));

    if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
        els.forEach(el => obs.observe(el));
    } else {
        els.forEach(el => el.classList.add('visible'));
    }
}

/* ==================== SMOOTH ANCHOR SCROLL ==================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const navHeight = document.getElementById('navbar')?.offsetHeight || 80;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navHeight - 16, behavior: 'smooth' });
        closeMobileMenu();
    });
});

/* ==================== LIGHTBOX ==================== */
const lightboxState = {
    images: [],   // { src, alt }
    index: 0,
};

function openLightbox(imageList, startIndex) {
    lightboxState.images = imageList;
    lightboxState.index = startIndex;
    _lightboxRender();

    const lb = document.getElementById('lightbox');
    lb.removeAttribute('aria-hidden');
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('lightboxClose').focus();
}

function closeLightbox() {
    const lb = document.getElementById('lightbox');
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function _lightboxNav(delta) {
    const n = lightboxState.images.length;
    if (n <= 1) return;
    lightboxState.index = (lightboxState.index + delta + n) % n;
    _lightboxRender();
}

function _lightboxRender() {
    const { images, index } = lightboxState;
    const img = document.getElementById('lightboxImg');
    const counter = document.getElementById('lightboxCounter');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');

    // Animate out → swap → animate in
    img.style.opacity = '0';
    img.style.transform = 'scale(0.92)';

    // Short delay lets CSS transition reset before new src loads
    setTimeout(() => {
        const { src, alt } = images[index];
        img.src = src;
        img.alt = alt || '';

        img.onload = () => {
            img.style.opacity = '';
            img.style.transform = '';
        };
        // If already cached, onload won't fire — force it
        if (img.complete && img.naturalWidth) {
            img.style.opacity = '';
            img.style.transform = '';
        }
    }, 80);

    // Counter
    counter.textContent = images.length > 1 ? `${index + 1} / ${images.length}` : '';

    // Hide arrows when only 1 image
    const showArrows = images.length > 1;
    prevBtn.style.display = showArrows ? '' : 'none';
    nextBtn.style.display = showArrows ? '' : 'none';
}

// Wire up buttons
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
    document.getElementById('lightboxBackdrop').addEventListener('click', closeLightbox);
    document.getElementById('lightboxPrev').addEventListener('click', () => _lightboxNav(-1));
    document.getElementById('lightboxNext').addEventListener('click', () => _lightboxNav(1));
});

// Keyboard navigation
document.addEventListener('keydown', e => {
    const lb = document.getElementById('lightbox');
    if (!lb || !lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') _lightboxNav(1);
    if (e.key === 'ArrowLeft') _lightboxNav(-1);
});

// Touch / swipe support
(function () {
    let touchStartX = 0;
    document.addEventListener('touchstart', e => {
        const lb = document.getElementById('lightbox');
        if (!lb || !lb.classList.contains('open')) return;
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    document.addEventListener('touchend', e => {
        const lb = document.getElementById('lightbox');
        if (!lb || !lb.classList.contains('open')) return;
        const delta = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(delta) > 44) _lightboxNav(delta > 0 ? 1 : -1);
    }, { passive: true });
})();

/* ------ Helpers to register images with the lightbox ------ */
/**
 * makeClickable(el, imageList, index)
 * Wraps el to open the lightbox when clicked.
 */
function makeClickable(el, getImages, index) {
    el.style.cursor = 'zoom-in';
    el.addEventListener('click', () => {
        openLightbox(getImages(), index);
    });
}
