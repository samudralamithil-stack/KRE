/**
 * Kaligiri Renewable Energy - Main JavaScript
 * Handles navigation, gentle scroll reveals, active spy, and form interactions
 */

(function() {
    'use strict';

    // ==========================================================================
    // 1. Mobile Navigation Drawer
    // ==========================================================================
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    function toggleNav() {
        if (!navToggle || !navMenu) return;
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', String(!isExpanded));
        navMenu.classList.toggle('is-open', !isExpanded);
        document.body.style.overflow = !isExpanded ? 'hidden' : '';
    }

    function closeNav() {
        if (!navToggle || !navMenu) return;
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', toggleNav);

        navLinks.forEach(link => {
            link.addEventListener('click', closeNav);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
                closeNav();
                navToggle.focus();
            }
        });

        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('is-open') &&
                !navMenu.contains(e.target) &&
                !navToggle.contains(e.target)) {
                closeNav();
            }
        });
    }

    // ==========================================================================
    // 2. Header Scroll Transition
    // ==========================================================================
    const header = document.querySelector('.header');

    function handleHeaderScroll() {
        if (!header) return;
        if (window.scrollY > 40) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();

    // ==========================================================================
    // 3. Gentle Scroll Reveal (Subtle Upward Motion, Respects Reduced Motion)
    // ==========================================================================
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealItems = document.querySelectorAll('.reveal-item');

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '0px 0px -8% 0px',
            threshold: 0.08
        });

        revealItems.forEach(item => {
            revealObserver.observe(item);
        });
    } else {
        // Fallback or reduced motion: make all visible immediately
        revealItems.forEach(item => {
            item.classList.add('is-revealed');
        });
    }

    // ==========================================================================
    // 4. Smooth Anchor Link Navigation
    // ==========================================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerOffset = header ? header.offsetHeight + 16 : 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                });

                if (history.pushState) {
                    history.pushState(null, '', targetId);
                }
            }
        });
    });

    // ==========================================================================
    // 5. Active Section Navigation Spy
    // ==========================================================================
    const trackedSections = document.querySelectorAll('section[id]');
    const navAnchors = Array.from(document.querySelectorAll('.nav-link:not(.nav-cta)'));

    function updateNavSpy() {
        if (!trackedSections.length || !navAnchors.length) return;
        const scrollPosition = window.scrollY + (header ? header.offsetHeight : 80) + 60;

        trackedSections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navAnchors.forEach(link => {
                    const isActive = link.getAttribute('href') === '#' + sectionId;
                    link.classList.toggle('active', isActive);
                });
            }
        });
    }

    window.addEventListener('scroll', updateNavSpy, { passive: true });

    // ==========================================================================
    // 6. Stakeholder Contact Form Handling
    // ==========================================================================
    const contactForm = document.querySelector('.contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('.form-submit-btn');
            const originalText = submitBtn.textContent;

            const name = document.getElementById('name')?.value.trim() || '';
            const email = document.getElementById('email')?.value.trim() || '';
            const organization = document.getElementById('organization')?.value.trim() || '';
            const interest = document.getElementById('interest')?.value || '';
            const message = document.getElementById('message')?.value.trim() || '';

            if (!name || !email) {
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Preparing Message...';

            const mailtoSubject = encodeURIComponent(`Inquiry from ${name} - ${interest || 'Partnership'}`);
            const mailtoBody = encodeURIComponent(
                `Name: ${name}\n` +
                `Email: ${email}\n` +
                `Organization: ${organization}\n` +
                `Area of Interest: ${interest}\n\n` +
                `Message:\n${message}\n`
            );

            window.location.href = `mailto:kaligirirenewableenergy@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

            setTimeout(() => {
                submitBtn.textContent = 'Opening Mail Client...';
                setTimeout(() => {
                    submitBtn.textContent = 'Message Prepared ✓';
                    submitBtn.style.background = 'var(--color-leaf)';
                    setTimeout(() => {
                        contactForm.reset();
                        submitBtn.textContent = originalText;
                        submitBtn.style.background = '';
                        submitBtn.disabled = false;
                    }, 2500);
                }, 1000);
            }, 600);
        });
    }
})();