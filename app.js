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

    const highlightNav = () => {
        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 120) {
                current = section.getAttribute('id');
            }
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
    garden: { base: 'assets/garden_layouts/web/', count: 5 },
    rooms: { base: 'assets/rooms/web/', count: 4 },
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
    images.forEach(({ src, alt }, i) => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = alt;
        img.loading = 'lazy';
        img.className = 'intro-img' + (i % 2 === 0 ? ' intro-img--offset' : '');
        container.appendChild(img);
    });
}

/* ==================== GALLERY (drag-scroll) ==================== */
function buildGallery(items) {
    const track = document.getElementById('galleryTrack');
    if (!track) return;
    track.innerHTML = '';

    items.forEach(({ src, alt }) => {
        const card = document.createElement('div');
        card.className = 'gallery-card';
        card.setAttribute('role', 'listitem');

        const img = document.createElement('img');
        img.src = src;
        img.alt = alt;
        img.loading = 'lazy';
        card.appendChild(img);
        track.appendChild(card);
    });

    attachGalleryDrag(track);
}

function initGallery() {
    const images = getImages('garden', i => `Coco Villa garden photo ${i}`);
    buildGallery(images);
}

function attachGalleryDrag(track) {
    let isDragging = false, startX = 0, scrollStart = 0;

    track.addEventListener('mousedown', e => {
        isDragging = true;
        startX = e.pageX - track.offsetLeft;
        scrollStart = track.scrollLeft;
        track.classList.add('dragging');
        e.preventDefault();
    });
    document.addEventListener('mousemove', e => {
        if (!isDragging) return;
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
        // Slide
        const slide = document.createElement('div');
        slide.className = 'room-slide' + (i === 0 ? ' active' : '');

        const img = document.createElement('img');
        img.src = src;
        img.alt = alt;
        img.loading = i === 0 ? 'eager' : 'lazy';
        slide.appendChild(img);
        slidesEl.appendChild(slide);

        // Dot
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Room photo ${i + 1}`);
        dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
        dot.addEventListener('click', () => goToSlide(i));
        dotsEl.appendChild(dot);
    });

    if (totalSlides > 1) {
        clearInterval(carouselTimer);
        carouselTimer = setInterval(() => changeSlide(1), 5000);
    }
}

function initRoomCarousel() {
    const images = getImages('rooms', i => `Coco Villa room photo ${i}`);
    buildCarousel(images);
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
    if (e.key === 'Escape') closeBookingModal();
});

document.addEventListener('keydown', e => {
    const modal = document.getElementById('bookingModal');
    if (!modal || !modal.classList.contains('open') || e.key !== 'Tab') return;
    const focusables = Array.from(
        modal.querySelectorAll('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter(el => !el.closest('.modal-backdrop'));
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey) { if (document.activeElement === first) { last.focus(); e.preventDefault(); } }
    else { if (document.activeElement === last) { first.focus(); e.preventDefault(); } }
});

/* ==================== MAP INTERACTIONS ==================== */
const VILLA_COORDS = '6.022760,80.246185';
const BASE_MAP_SRC = query => `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=14&output=embed`;
let mapResetTimer = null;

function initMapInteractions() { /* driven by inline onmouseenter / onclick */ }

function updateMap(query) {
    const frame = document.getElementById('mapFrame');
    if (!frame) return;
    clearTimeout(mapResetTimer);
    frame.style.opacity = '0.5';
    frame.src = BASE_MAP_SRC(query);
    frame.addEventListener('load', () => { frame.style.opacity = '1'; }, { once: true });
}

function resetMap() {
    mapResetTimer = setTimeout(() => updateMap(`${VILLA_COORDS}&ll=6.028397,80.237084`), 300);
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
