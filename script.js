/**
 * Premium Career Website - Interactive Features
 * Theme Toggle, Navigation, Timeline Modals, Editable Content
 */

(function () {
    'use strict';

    // =========================================
    // THEME TOGGLE
    // =========================================

    const themeToggle = document.getElementById('themeToggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    function getTheme() {
        const saved = localStorage.getItem('cv-theme');
        if (saved) return saved;
        return prefersDark.matches ? 'dark' : 'light';
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('cv-theme', theme);
    }

    // Initialize theme
    setTheme(getTheme());

    // Toggle theme on button click
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            setTheme(next);
        });
    }

    // Listen for system preference changes
    prefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('cv-theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });

    // =========================================
    // NAVIGATION
    // =========================================

    const nav = document.getElementById('mainNav');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Scroll effect for navigation
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close menu when link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle?.classList.remove('active');
            navMenu?.classList.remove('active');
        });
    });

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');

    function highlightNavLink() {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 150;
            const sectionId = section.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNavLink);
    highlightNavLink();

    // =========================================
    // TIMELINE MODAL
    // =========================================

    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const modalContent = document.getElementById('modalContent');
    const expandButtons = document.querySelectorAll('.timeline-expand');
    const timelineEntries = document.querySelectorAll('.timeline-entry');
    const timelinePlusButtons = document.querySelectorAll('.timeline-plus');
    // New horizontal timeline elements
    const timelineHItems = document.querySelectorAll('.timeline-h-item');
    const timelineHPlusButtons = document.querySelectorAll('.timeline-h-plus');

    function openModal(templateId) {
        const template = document.getElementById(templateId);
        if (template && modalContent && modalOverlay) {
            modalContent.innerHTML = template.innerHTML;
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => {
                if (modalContent) modalContent.innerHTML = '';
            }, 400);
        }
    }

    // Old timeline expand buttons
    expandButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-modal');
            if (modalId) openModal(modalId);
        });
    });

    // New timeline entries - click on entry to open modal
    timelineEntries.forEach(entry => {
        entry.addEventListener('click', (e) => {
            // Don't trigger if clicking on editable content
            if (e.target.hasAttribute('contenteditable')) return;
            const modalId = entry.getAttribute('data-modal');
            if (modalId) openModal(modalId);
        });
    });

    // New timeline plus buttons
    timelinePlusButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent entry click
            const entry = btn.closest('.timeline-entry');
            const modalId = entry?.getAttribute('data-modal');
            if (modalId) openModal(modalId);
        });
    });

    // Horizontal timeline items - click on item to open modal
    timelineHItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Don't trigger if clicking on editable content or plus button
            if (e.target.hasAttribute('contenteditable')) return;
            if (e.target.closest('.timeline-h-plus')) return;
            const modalId = item.getAttribute('data-modal');
            if (modalId) openModal(modalId);
        });
    });

    // Horizontal timeline plus buttons
    timelineHPlusButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const item = btn.closest('.timeline-h-item');
            const modalId = item?.getAttribute('data-modal');
            if (modalId) openModal(modalId);
        });
    });

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // =========================================
    // EDITABLE CONTENT PERSISTENCE
    // =========================================

    const STORAGE_KEY = 'career-website-content';

    function generateContentId(element, index) {
        // Create a more stable ID based on element context
        const section = element.closest('section')?.id || 'unknown';
        const tagName = element.tagName.toLowerCase();
        const className = element.className?.split(' ')[0] || '';
        return `${section}-${tagName}-${className}-${index}`;
    }

    function saveContent() {
        const content = {};
        document.querySelectorAll('[contenteditable="true"]').forEach((el, index) => {
            const id = generateContentId(el, index);
            content[id] = el.innerHTML;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
        showSaveIndicator();
    }

    function loadContent() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const content = JSON.parse(saved);
                document.querySelectorAll('[contenteditable="true"]').forEach((el, index) => {
                    const id = generateContentId(el, index);
                    if (content[id] !== undefined) {
                        el.innerHTML = content[id];
                    }
                });
            } catch (e) {
                console.log('Could not load saved content');
            }
        }
    }

    // Save indicator
    function showSaveIndicator() {
        let indicator = document.querySelector('.save-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'save-indicator';
            indicator.innerHTML = `
                <iconify-icon icon="solar:check-circle-bold" width="16"></iconify-icon>
                <span>Saved</span>
            `;
            indicator.style.cssText = `
                position: fixed;
                bottom: 24px;
                right: 24px;
                background: var(--accent);
                color: white;
                padding: 10px 20px;
                border-radius: 100px;
                font-size: 13px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 8px;
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.3s ease;
                z-index: 9999;
            `;
            document.body.appendChild(indicator);
        }

        // Show indicator
        setTimeout(() => {
            indicator.style.opacity = '1';
            indicator.style.transform = 'translateY(0)';
        }, 10);

        // Hide after 2 seconds
        setTimeout(() => {
            indicator.style.opacity = '0';
            indicator.style.transform = 'translateY(20px)';
        }, 2000);
    }

    // =========================================
    // FLOATING SAVE BUTTON
    // =========================================

    let hasUnsavedChanges = false;
    let saveButton = null;

    function createSaveButton() {
        saveButton = document.createElement('button');
        saveButton.className = 'floating-save-btn';
        saveButton.innerHTML = `
            <iconify-icon icon="solar:diskette-bold" width="20"></iconify-icon>
            <span>Save Changes</span>
        `;
        saveButton.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: linear-gradient(135deg, var(--accent), #ff8c00);
            color: white;
            padding: 14px 28px;
            border: none;
            border-radius: 100px;
            font-size: 14px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px);
            transition: all 0.3s ease;
            z-index: 9998;
            box-shadow: 0 8px 30px rgba(234, 88, 12, 0.4);
            font-family: var(--font-body);
        `;
        document.body.appendChild(saveButton);

        // Add hover effects
        saveButton.addEventListener('mouseenter', () => {
            saveButton.style.transform = hasUnsavedChanges ? 'translateY(-2px) scale(1.02)' : 'translateY(20px)';
            saveButton.style.boxShadow = '0 12px 40px rgba(234, 88, 12, 0.5)';
        });

        saveButton.addEventListener('mouseleave', () => {
            saveButton.style.transform = hasUnsavedChanges ? 'translateY(0) scale(1)' : 'translateY(20px)';
            saveButton.style.boxShadow = '0 8px 30px rgba(234, 88, 12, 0.4)';
        });

        // Save on click
        saveButton.addEventListener('click', () => {
            saveContent();
            hideSaveButton();
        });
    }

    function showSaveButton() {
        if (!saveButton) createSaveButton();
        hasUnsavedChanges = true;
        saveButton.style.opacity = '1';
        saveButton.style.visibility = 'visible';
        saveButton.style.transform = 'translateY(0)';
    }

    function hideSaveButton() {
        hasUnsavedChanges = false;
        if (saveButton) {
            saveButton.style.opacity = '0';
            saveButton.style.visibility = 'hidden';
            saveButton.style.transform = 'translateY(20px)';
        }
    }

    // Create save button on load
    createSaveButton();

    // Load saved content on page load
    loadContent();

    // Editable content enhancements
    document.querySelectorAll('[contenteditable="true"]').forEach(element => {
        // Prevent Enter key in single-line fields
        if (!element.classList.contains('about-intro') &&
            !element.matches('.achievements li')) {
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    element.blur();
                }
            });
        }

        // Clean paste
        element.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
            showSaveButton(); // Show save button on paste
        });

        // Show save button when content changes
        element.addEventListener('input', () => {
            showSaveButton();
        });

        // Also show on focus to indicate editing mode
        element.addEventListener('focus', () => {
            // Small delay to avoid showing immediately on accidental clicks
            setTimeout(() => {
                if (document.activeElement === element) {
                    showSaveButton();
                }
            }, 500);
        });
    });

    // Keyboard shortcut to reset content (Ctrl/Cmd + Shift + R)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
            e.preventDefault();
            if (confirm('Reset all content to original? This cannot be undone.')) {
                localStorage.removeItem(STORAGE_KEY);
                location.reload();
            }
        }

        // Ctrl+S / Cmd+S to save changes
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (hasUnsavedChanges) {
                saveContent();
                hideSaveButton();
            }
            showSaveIndicator();
        }
    });

    // =========================================
    // SCROLL ANIMATIONS
    // =========================================

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const animateOnScroll = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    };

    const scrollObserver = new IntersectionObserver(animateOnScroll, observerOptions);

    // Add initial styles and observe elements
    const animatedElements = document.querySelectorAll(
        '.timeline-card, .experience-card, .skill-card, .education-card, .cert-card, .contact-card'
    );

    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        scrollObserver.observe(el);
    });

    // =========================================
    // SMOOTH SCROLL BEHAVIOR
    // =========================================

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const navHeight = nav?.offsetHeight || 70;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // =========================================
    // PROFILE IMAGE UPLOAD (Optional)
    // =========================================

    const profileImage = document.querySelector('.profile-image');

    if (profileImage) {
        profileImage.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';

            input.onchange = (e) => {
                const file = e.target.files?.[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const img = document.createElement('img');
                        img.src = event.target.result;
                        img.alt = 'Profile Photo';

                        // Clear placeholder content
                        profileImage.innerHTML = '';
                        profileImage.appendChild(img);

                        // Save to localStorage
                        try {
                            localStorage.setItem('cv-profile-image', event.target.result);
                        } catch (e) {
                            console.log('Image too large to save locally');
                        }
                    };
                    reader.readAsDataURL(file);
                }
            };

            input.click();
        });

        // Load saved profile image
        const savedImage = localStorage.getItem('cv-profile-image');
        if (savedImage) {
            profileImage.innerHTML = `<img src="${savedImage}" alt="Profile Photo">`;
        }
    }

})();

// =========================================
// VERTICAL TIMELINE TOGGLE (must be global for onclick)
// =========================================

function toggleTimelineCard(btn) {
    const card = btn.closest('.timeline-alt-card');
    const drawer = card.querySelector('.timeline-alt-drawer');
    const icon = btn.querySelector('.toggle-icon');

    drawer.classList.toggle('open');
    btn.classList.toggle('active');

    // Highlight card when open
    if (drawer.classList.contains('open')) {
        card.style.borderColor = 'rgba(234, 88, 12, 0.3)';
        card.style.background = 'rgba(23, 23, 23, 0.8)';
    } else {
        card.style.borderColor = '';
        card.style.background = '';
    }
}