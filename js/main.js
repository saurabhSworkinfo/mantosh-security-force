/* ============================================================
   MANTOSH SECURITY FORCE — main.js
   Version: 2.0 (Latest — fully updated)
   Website: mantosecurity.com
   Last updated: March 2026
   ============================================================ */

    document.addEventListener('DOMContentLoaded', () => {

      // ── Page Loader ──
      const loader = document.getElementById('page-loader');
      window.addEventListener('load', () => {
        setTimeout(() => loader.classList.add('hide'), 1000);
      });
      // Fallback: hide after 2.5s regardless
      setTimeout(() => loader && loader.classList.add('hide'), 2500);

      // ── Back to Top ──
      const backToTop = document.getElementById('back-to-top');
      window.addEventListener('scroll', () => {
        backToTop.classList.toggle('show', window.scrollY > 400);
      });
      backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

      // ── Navbar scroll ──
      const navbar = document.getElementById('navbar');
      window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 40));

      // Hamburger
      const hamburger = document.getElementById('hamburger');
      const mobileMenu = document.getElementById('mobile-menu');
      hamburger.addEventListener('click', () => { hamburger.classList.toggle('open'); mobileMenu.classList.toggle('open'); });
      mobileMenu.querySelectorAll('a').forEach(l => l.addEventListener('click', () => { hamburger.classList.remove('open'); mobileMenu.classList.remove('open'); }));

      // Stats counter
      const counters = document.querySelectorAll('.stat-number');
      const statsStrip = document.getElementById('stats-strip');
      const runCounter = (el) => {
        const target = parseInt(el.dataset.target, 10);
        const step = target / (2000 / 16);
        let current = 0;
        const tick = () => { current += step; if (current < target) { el.textContent = Math.floor(current); requestAnimationFrame(tick); } else { el.textContent = target; } };
        tick();
      };
      if (statsStrip) new IntersectionObserver((e) => { e.forEach(en => { if (en.isIntersecting) { counters.forEach(runCounter); } }); }, { threshold: 0.5 }).observe(statsStrip);

      // Smooth scroll
      document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function(e) { const t = document.querySelector(this.getAttribute('href')); if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); } });
      });

      // ── Active nav highlight on scroll ──
      const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
      const sections = document.querySelectorAll('section[id], div[id="stats-strip"]');
      const onScroll = () => {
        let current = '';
        sections.forEach(sec => {
          if (window.scrollY >= sec.offsetTop - 120) current = sec.getAttribute('id');
        });
        navLinks.forEach(link => {
          link.classList.remove('nav-active');
          if (link.getAttribute('href') === '#' + current) link.classList.add('nav-active');
        });
      };
      window.addEventListener('scroll', onScroll, { passive: true });

      // ── Set min date to today ──
      const dateEl = document.getElementById('date');
      if (dateEl) {
        const today = new Date().toISOString().split('T')[0];
        dateEl.addEventListener('focus', function() {
          this.type = 'date';
          this.min = today;
        });
        dateEl.addEventListener('blur', function() {
          if (!this.value) this.type = 'text';
        });
      }

      // ── Popup close ──
      document.getElementById('popup-close').addEventListener('click', () => {
        document.getElementById('popup-overlay').classList.remove('show');
      });
      document.getElementById('popup-overlay').addEventListener('click', function(e) {
        if (e.target === this) this.classList.remove('show');
      });

      // ── Contact form — JS validation + Web3Forms submission ──
      const contactForm = document.getElementById('contactForm');
      if (contactForm) {

        // Helper: show field error
        const setError = (id, msg) => {
          const el = document.getElementById(id);
          const group = el.closest('.form-group');
          let err = group.querySelector('.field-error');
          if (!err) {
            err = document.createElement('span');
            err.className = 'field-error';
            err.style.cssText = 'display:block;font-family:var(--font-body);font-size:0.65rem;color:#e57373;padding:0 1.4rem 0.5rem;letter-spacing:0.05em;';
            group.appendChild(err);
          }
          err.textContent = msg;
          group.style.borderBottomColor = 'rgba(229,115,115,0.5)';
        };

        // Helper: clear field error
        const clearError = (id) => {
          const el = document.getElementById(id);
          const group = el.closest('.form-group');
          const err = group.querySelector('.field-error');
          if (err) err.textContent = '';
          group.style.borderBottomColor = '';
        };

        // Clear errors on input
        ['name','phone','email'].forEach(id => {
          document.getElementById(id).addEventListener('input', () => clearError(id));
        });

        // Phone — allow digits only, max 10
        document.getElementById('phone').addEventListener('input', function() {
          this.value = this.value.replace(/\D/g, '').slice(0, 10);
        });

        contactForm.addEventListener('submit', async function(e) {
          e.preventDefault();

          // ── Validation ──
          let valid = true;

          const name  = document.getElementById('name').value.trim();
          const phone     = document.getElementById('phone').value.trim();
          const phoneCode = document.getElementById('phone-code').value;
          const email = document.getElementById('email').value.trim();

          // Name — required, min 2 chars
          if (!name || name.length < 2) {
            setError('name', 'Please enter your full name.'); valid = false;
          } else { clearError('name'); }

          // Phone — required, exactly 10 digits
          const phoneClean = phone.replace(/[\s\-]/g, '');
          if (!phone) {
            setError('phone', 'Please enter your phone number.'); valid = false;
          } else if (!/^\d{10}$/.test(phoneClean)) {
            setError('phone', 'Enter exactly 10 digits (no country code).'); valid = false;
          } else { clearError('phone'); }

          // Email — required, valid format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
          if (!email) {
            setError('email', 'Please enter your email address.'); valid = false;
          } else if (!emailRegex.test(email)) {
            setError('email', 'Enter a valid email address.'); valid = false;
          } else { clearError('email'); }

          if (!valid) return; // Stop submission if errors

          // Combine country code + phone number before submitting
          const phoneInput = document.getElementById('phone');
          const originalPhone = phoneInput.value;
          phoneInput.value = phoneCode + originalPhone;

          // Set min date to today
          const dateInput = document.getElementById('date');

          // ── Submit to Web3Forms ──
          const btn = document.getElementById('submitBtn');

          // Popup helper
          const showPopup = (type, title, msg) => {
            document.getElementById('popup-icon').textContent  = type === 'success' ? '✅' : '❌';
            document.getElementById('popup-title').textContent = title;
            document.getElementById('popup-msg').textContent   = msg;
            document.getElementById('popup-overlay').classList.add('show');
          };

          btn.innerHTML = '<span>Sending...</span>';
          btn.style.opacity = '0.7';
          btn.disabled = true;

          try {
            const res  = await fetch('https://api.web3forms.com/submit', {
              method: 'POST',
              body: new FormData(contactForm)
            });
            const data = await res.json();
            if (data.success) {
              showPopup('success', 'Enquiry Sent!', 'Thank you. Your enquiry has been received. Our team will contact you within 24 hours.');
              contactForm.reset();
              phoneInput.value = '';
            } else { throw new Error('Failed'); }
          } catch {
            phoneInput.value = originalPhone; // restore on error
            showPopup('error', 'Something Went Wrong', 'We could not send your message. Please call us directly at +91 79912 72701.');
          } finally {
            btn.innerHTML = '<span>Send Enquiry</span>';
            btn.style.opacity = '1';
            btn.disabled = false;
          }
        });
      }

      // Reveal on scroll
      document.querySelectorAll('.reveal').forEach(el => {
        new IntersectionObserver((entries) => {
          entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
        }, { threshold: 0.1 }).observe(el);
      });
    });
