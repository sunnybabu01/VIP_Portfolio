document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================
  // 1. THEME MANAGEMENT (DARK / LIGHT MODE)
  // ==========================================
  const themeToggleBtn = document.getElementById('theme-toggle');
  const lightIcon = document.getElementById('theme-toggle-light-icon');
  const darkIcon = document.getElementById('theme-toggle-dark-icon');

  // Set initial theme
  const currentTheme = localStorage.getItem('color-theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  if (currentTheme === 'dark') {
    document.documentElement.classList.add('dark');
    if (darkIcon) darkIcon.classList.remove('hidden');
    if (lightIcon) lightIcon.classList.add('hidden');
  } else {
    document.documentElement.classList.remove('dark');
    if (darkIcon) darkIcon.classList.add('hidden');
    if (lightIcon) lightIcon.classList.remove('hidden');
  }

  // Toggle theme action
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      // toggle icons
      if (lightIcon && darkIcon) {
        lightIcon.classList.toggle('hidden');
        darkIcon.classList.toggle('hidden');
      }

      // toggle class
      if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('color-theme', 'light');
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('color-theme', 'dark');
      }
    });
  }

  // ==========================================
  // 2. HERO TYPING ANIMATION
  // ==========================================
  const typingElement = document.getElementById('typing-text');
  if (typingElement) {
    const wordsAttr = typingElement.getAttribute('data-words');
    const words = wordsAttr ? wordsAttr.split(',').map(w => w.trim()) : ['Software Developer', 'Full Stack Developer', 'AI/ML Enthusiast'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function type() {
      const currentWord = words[wordIndex];
      
      if (isDeleting) {
        typingElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50; // delete faster
      } else {
        typingElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 120; // normal typing
      }

      if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true;
        typingSpeed = 2000; // hold word for 2 seconds
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typingSpeed = 500; // pause before next word
      }

      setTimeout(type, typingSpeed);
    }

    setTimeout(type, 1000);
  }

  // ==========================================
  // 3. FADE-IN SCROLL REVEAL (INTERSECTION OBSERVER)
  // ==========================================
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target); // Reveal once
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => revealObserver.observe(el));
  }

  // ==========================================
  // 4. DYNAMIC PROJECTS FILTERING (CLIENT-SIDE)
  // ==========================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const searchInput = document.getElementById('project-search');

  function filterProjects() {
    const activeCategoryBtn = document.querySelector('.filter-btn.active');
    const category = activeCategoryBtn ? activeCategoryBtn.getAttribute('data-category') : 'All';
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';

    projectCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      const cardTitle = card.querySelector('.project-title').textContent.toLowerCase();
      const cardDesc = card.querySelector('.project-desc').textContent.toLowerCase();
      const cardTechs = card.getAttribute('data-techs') ? card.getAttribute('data-techs').toLowerCase() : '';

      const matchesCategory = category === 'All' || cardCategory === category;
      const matchesSearch = cardTitle.includes(searchQuery) || 
                            cardDesc.includes(searchQuery) || 
                            cardTechs.includes(searchQuery);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'block';
        setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'scale(1)'; }, 10);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => { card.style.display = 'none'; }, 200);
      }
    });
  }

  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active', 'bg-blue-600', 'text-white'));
        filterBtns.forEach(b => b.classList.add('bg-gray-100', 'text-gray-700', 'dark:bg-gray-800', 'dark:text-gray-300'));
        
        btn.classList.add('active', 'bg-blue-600', 'text-white');
        btn.classList.remove('bg-gray-100', 'text-gray-700', 'dark:bg-gray-800', 'dark:text-gray-300');
        filterProjects();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterProjects);
  }

  // ==========================================
  // 5. MODAL MANAGER (PROJECT DETAILS POPUP)
  // ==========================================
  const modalTriggers = document.querySelectorAll('[data-modal-target]');
  const modalCloseBtns = document.querySelectorAll('[data-modal-close]');

  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = trigger.getAttribute('data-modal-target');
      const modal = document.getElementById(targetId);
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden'; // Lock background scroll
      }
    });
  });

  modalCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-container');
      if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
      }
    });
  });

  // Close modal when clicking on backdrop
  const modals = document.querySelectorAll('.modal-container');
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
      }
    });
  });

  // ==========================================
  // 6. CONTACT FORM AJAX HANDLER
  // ==========================================
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    const formBtn = contactForm.querySelector('button[type="submit"]');
    const successToast = document.getElementById('contact-success-toast');
    const errorToast = document.getElementById('contact-error-toast');
    const errorToastText = document.getElementById('contact-error-text');

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        name: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        subject: document.getElementById('contact-subject').value,
        message: document.getElementById('contact-message').value
      };

      // Disable button, show sending state
      const originalBtnText = formBtn.innerHTML;
      formBtn.disabled = true;
      formBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Sending...';

      try {
        const response = await fetch('/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
          // Show success toast
          if (successToast) {
            successToast.classList.remove('hidden');
            setTimeout(() => { successToast.classList.add('hidden'); }, 4000);
          }
          // Reset form
          contactForm.reset();
        } else {
          throw new Error(data.message || 'Submission failed');
        }
      } catch (err) {
        // Show error toast
        if (errorToastText) errorToastText.textContent = err.message;
        if (errorToast) {
          errorToast.classList.remove('hidden');
          setTimeout(() => { errorToast.classList.add('hidden'); }, 5000);
        }
      } finally {
        formBtn.disabled = false;
        formBtn.innerHTML = originalBtnText;
      }
    });
  }
});
