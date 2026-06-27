(function () {
  'use strict';

  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return document.querySelectorAll(s); };

  var navbar = $('#navbar');
  var hamburger = $('#navHamburger');
  var mobileMenu = $('#mobileMenu');
  var backToTopBtn = $('#backToTop');
  var toast = $('#toast');
  var toastText = toast.querySelector('.toast__text');
  var toastIcon = toast.querySelector('.toast__icon');
  var toastTimer = null;
  var ticking = false;

  function handleScroll() {
    var y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 50);
    backToTopBtn.classList.toggle('visible', y > 500);
    updateActiveNav();
    ticking = false;
  }

  function updateActiveNav() {
    var pos = window.scrollY + 160;
    var current = '';
    $$('section[id]').forEach(function (s) {
      if (pos >= s.offsetTop && pos < s.offsetTop + s.offsetHeight) current = s.id;
    });
    $$('.nav-links__item').forEach(function (l) {
      l.classList.toggle('nav-links__item--active', l.dataset.section === current);
    });
  }

  function closeMobile() {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  function scrollTo(id) {
    var el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight - 24,
      behavior: 'smooth'
    });
  }

  function showToast(msg, icon) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = msg;
    toastIcon.className = 'toast__icon fas ' + (icon || 'fa-check-circle');
    toast.classList.add('show');
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
      toastTimer = null;
    }, 3200);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast('Copied: ' + text, 'fa-clipboard-check');
      }).catch(function () { fallbackCopy(text); });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('Copied: ' + text, 'fa-clipboard-check');
    } catch (e) {
      showToast('Failed to copy', 'fa-circle-exclamation');
    }
    document.body.removeChild(ta);
  }

  function animateCounter(el) {
    var target = parseInt(el.dataset.count, 10);
    var suffix = el.textContent.replace(/[0-9]/g, '');
    var start = performance.now();
    var dur = 2000;
    function tick(now) {
      var t = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function detectOS() {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('win') !== -1) return 'windows';
    if (ua.indexOf('mac') !== -1) return 'macos';
    if (ua.indexOf('linux') !== -1) return 'linux';
    return 'windows';
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(handleScroll); ticking = true; }
  }, { passive: true });

  hamburger.addEventListener('click', function () {
    var opening = !mobileMenu.classList.contains('open');
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = opening ? 'hidden' : '';
  });

  $$('[data-mobile-link]').forEach(function (l) {
    l.addEventListener('click', closeMobile);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMobile();
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); scrollTo('install'); }
  });

  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = this.getAttribute('href');
      if (id === '#') return;
      var target = $(id);
      if (target) {
        e.preventDefault();
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight - 24,
          behavior: 'smooth'
        });
      }
    });
  });

  backToTopBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }).observe.bind(null);

  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal').forEach(function (el) { revealObs.observe(el); });

  var counterObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { animateCounter(e.target); counterObs.unobserve(e.target); }
    });
  }, { threshold: 0.5 });

  $$('[data-count]').forEach(function (el) { counterObs.observe(el); });

  $$('[data-download]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var p = this.dataset.download;
      var n = { windows: 'Windows', macos: 'macOS', linux: 'Linux' };
      showToast('Preparing un&script for ' + n[p] + '...', 'fa-circle-down');
      setTimeout(function () { showToast('Download ready — un&script for ' + n[p], 'fa-circle-check'); }, 2000);
    });
  });

  $$('[data-ver]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var v = this.dataset.ver;
      showToast('Downloading un&script v' + v + '...', 'fa-circle-down');
      setTimeout(function () { showToast('un&script v' + v + ' is ready!', 'fa-circle-check'); }, 1600);
    });
  });

  $$('[data-cmd]').forEach(function (btn) {
    btn.addEventListener('click', function () { copyText(this.dataset.cmd); });
  });

  ['footerChangelog', 'footerRoadmap', 'footerDocs', 'footerApi', 'footerExtensions', 'footerThemes', 'footerBlog'].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', function (e) {
      e.preventDefault();
      showToast(this.textContent.trim() + ' page is coming soon!', 'fa-hammer');
    });
  });

  var heroBtn = $('#heroDownloadBtn');
  if (heroBtn) {
    var os = detectOS();
    var labels = { windows: 'Download for Windows', macos: 'Download for macOS', linux: 'Download for Linux' };
    var nodes = heroBtn.childNodes;
    for (var i = nodes.length - 1; i >= 0; i--) {
      if (nodes[i].nodeType === Node.TEXT_NODE && nodes[i].textContent.trim().length > 0) {
        nodes[i].textContent = ' ' + labels[os];
        break;
      }
    }
    heroBtn.addEventListener('click', function (e) {
      e.preventDefault();
      scrollTo('install');
      setTimeout(function () {
        var cards = $$('.platform-card');
        var idx = { windows: 0, macos: 1, linux: 2 }[os];
        var card = cards[idx];
        if (!card) return;
        card.style.borderColor = 'rgba(74, 158, 255, 0.5)';
        card.style.boxShadow = '0 16px 48px rgba(74, 158, 255, 0.2)';
        card.style.transform = 'translateY(-8px)';
        setTimeout(function () {
          card.style.borderColor = '';
          card.style.boxShadow = '';
          card.style.transform = '';
        }, 2200);
      }, 650);
    });
  }

  var mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', function (e) {
    mx = (e.clientX / window.innerWidth - 0.5) * 24;
    my = (e.clientY / window.innerHeight - 0.5) * 24;
  });

  function parallax() {
    cx += (mx - cx) * 0.04;
    cy += (my - cy) * 0.04;
    $$('.bg-orb').forEach(function (orb, i) {
      var s = (i + 1) * 0.5;
      orb.style.transform = 'translate(' + (cx * s).toFixed(2) + 'px,' + (cy * s).toFixed(2) + 'px)';
    });
    requestAnimationFrame(parallax);
  }

  if (!('ontouchstart' in window)) parallax();

  var gradientEl = $('.hero__title-gradient');
  if (gradientEl) {
    var phrases = ['Faster & Smarter', 'With Confidence', 'Your Way', 'Without Limits'];
    var pi = 0, ci = 0, deleting = false;

    function typeLoop() {
      var phrase = phrases[pi];
      if (!deleting) {
        ci++;
        if (ci > phrase.length) { setTimeout(function () { deleting = true; typeLoop(); }, 2800); return; }
      } else {
        ci--;
        if (ci < 0) { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(typeLoop, 400); return; }
      }
      gradientEl.textContent = phrase.substring(0, ci);
      setTimeout(typeLoop, deleting ? 40 : 80);
    }

    setTimeout(function () {
      ci = phrases[0].length;
      setTimeout(function () { deleting = true; typeLoop(); }, 2800);
    }, 2500);
  }

  handleScroll();
})();
