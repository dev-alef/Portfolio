// ============================================================
// PORTFÓLIO ALERSON FERREIRA — main.js
// ============================================================

// --- DADOS DE TECNOLOGIAS ---
const techs = [
  { icon: '⚛️', label: 'React' },
  { icon: '🟢', label: 'Node.js' },
  { icon: '🟨', label: 'JavaScript' },
  { icon: '📘', label: 'TypeScript' },
  { icon: '🌐', label: 'HTML5' },
  { icon: '🎨', label: 'CSS3' },
  { icon: '🐍', label: 'Python' },
  { icon: '🗄️', label: 'MongoDB' },
  { icon: '🐘', label: 'PostgreSQL' },
  { icon: '🔒', label: 'Cibersegurança' },
  { icon: '🤖', label: 'IA / LLMs' },
  { icon: '⚙️', label: 'N8N' },
  { icon: '🐙', label: 'Git & GitHub' },
  { icon: '🐳', label: 'Docker' },
  { icon: '☁️', label: 'Vercel' },
  { icon: '📱', label: 'React Native' },
];

// --- INTRO LOADING ---
const introMessages = [
  'Plantando sementes...',
  'Regando raízes...',
  'Crescendo galhos...',
  'Sincronizando floresta...',
  'Abrindo o dossel...',
  'Pronto para explorar 🌿',
];

function runIntro() {
  const bar      = document.getElementById('introBar');
  const pct      = document.getElementById('introPct');
  const statusTx = document.getElementById('introStatusText');
  const btnEnter = document.getElementById('btnEnter');
  const btnSkip  = document.getElementById('btnSkip');
  const progressWrap = document.querySelector('.intro-progress-wrap');
  
  if (!bar) return;

  let current = 0;
  const duration = 4000; // 4 segundos total
  const interval = 80;
  const steps = duration / interval;
  const increment = 100 / steps;

  const timer = setInterval(() => {
    current = Math.min(current + increment, 100);
    bar.style.width = current + '%';
    pct.textContent = Math.round(current) + '%';
    if (progressWrap) progressWrap.setAttribute('aria-valuenow', Math.round(current));

    const msgIdx = Math.floor((current / 100) * (introMessages.length - 1));
    statusTx.textContent = introMessages[msgIdx] || introMessages[0];

    if (current >= 100) {
      clearInterval(timer);
      statusTx.textContent = 'Sistemas online — bem-vindo à floresta 🌲';
      btnEnter.classList.add('visible');
    }
  }, interval);

  // Botão ENTRAR
  btnEnter.addEventListener('click', () => enterSite());

  // Botão PULAR — melhoria de acessibilidade/UX
  btnSkip.addEventListener('click', () => {
    clearInterval(timer);
    enterSite();
  });

  btnSkip.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clearInterval(timer); enterSite(); }
  });
}

function enterSite() {
  const intro = document.getElementById('intro');
  if (!intro) return;
  intro.classList.add('hidden');
  // Clique de "entrar" conta como interação do usuário — aproveita pra já iniciar o áudio
  document.dispatchEvent(new Event('site:enter'));
  // Foco para o conteúdo principal para acessibilidade
  setTimeout(() => {
    const hero = document.getElementById('hero');
    if (hero) hero.setAttribute('tabindex', '-1'), hero.focus({ preventScroll: true });
  }, 1100);
}

// --- PARTÍCULAS DE FOLHAS ---
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const count = window.innerWidth < 768 ? 12 : 25;
  for (let i = 0; i < count; i++) {
    const leaf = document.createElement('div');
    leaf.className = 'leaf';
    leaf.style.cssText = `
      left: ${Math.random() * 100}%;
      top: ${Math.random() * -20}%;
      width: ${Math.random() * 5 + 3}px;
      height: ${Math.random() * 5 + 3}px;
      animation-duration: ${Math.random() * 12 + 8}s;
      animation-delay: ${Math.random() * 8}s;
      opacity: 0;
    `;
    container.appendChild(leaf);
  }
}

// --- TECH STACK CAROUSEL ---
function buildTechCarousel() {
  const track = document.getElementById('techTrack');
  if (!track) return;
  // Duplicar para loop infinito
  const doubled = [...techs, ...techs];
  doubled.forEach(t => {
    const pill = document.createElement('div');
    pill.className = 'tech-pill';
    pill.innerHTML = `<span aria-hidden="true">${t.icon}</span><span>${t.label}</span>`;
    track.appendChild(pill);
  });
}

// --- NAVEGAÇÃO ATIVA NO SCROLL ---
function setupActiveNav() {
  const sections = document.querySelectorAll('section[id], #hero');
  const navLinks = document.querySelectorAll('.nav-links a');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => {
          a.classList.remove('active');
          a.removeAttribute('aria-current');
        });
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) { active.classList.add('active'); active.setAttribute('aria-current', 'page'); }
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
}

// --- MENU MOBILE ---
function setupMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
    toggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  });

  // Fechar ao clicar em um link
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// --- ÁUDIO DE FUNDO (música / som ambiente) ---
const audioLibrary = {
  music: [
    'audio/music-1.mp3', 'audio/music-2.mp3', 'audio/music-3.mp3', 'audio/music-4.mp3',
    'audio/music-5.mp3', 'audio/music-6.mp3', 'audio/music-7.mp3', 'audio/music-8.mp3',
  ],
  ambience: [
    'audio/ambience-1.mp3', 'audio/ambience-2.mp3', 'audio/ambience-3.mp3',
    'audio/ambience-4.mp3', 'audio/ambience-5.mp3', 'audio/ambience-6.mp3',
  ],
};

function setupSound() {
  const btn = document.getElementById('soundBtn');
  const audio = document.getElementById('bgAudio');
  const modeBtns = document.querySelectorAll('.mode-btn');
  if (!btn || !audio) return;

  const targetVolume = 0.35;
  let playing = false;
  let mode = 'music';
  let trackIndex = 0;
  let fadeTimer = null;

  function fadeTo(target, onDone) {
    clearInterval(fadeTimer);
    fadeTimer = setInterval(() => {
      const step = 0.04;
      audio.volume = target > audio.volume
        ? Math.min(audio.volume + step, target)
        : Math.max(audio.volume - step, target);
      if (audio.volume === target) {
        clearInterval(fadeTimer);
        if (onDone) onDone();
      }
    }, 60);
  }

  function loadTrack(autoplay) {
    const list = audioLibrary[mode];
    audio.src = list[trackIndex % list.length];
    if (autoplay) {
      audio.volume = 0;
      audio.play().catch(() => {});
      fadeTo(targetVolume);
    }
  }

  function changeTrack(delta) {
    const list = audioLibrary[mode];
    trackIndex = (trackIndex + delta + list.length) % list.length;
    if (playing) fadeTo(0, () => loadTrack(true));
    else loadTrack(false);
  }

  audio.addEventListener('ended', () => changeTrack(1));

  const prevBtn = document.getElementById('prevTrack');
  const nextBtn = document.getElementById('nextTrack');
  if (prevBtn) prevBtn.addEventListener('click', () => changeTrack(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => changeTrack(1));

  modeBtns.forEach(mb => {
    mb.addEventListener('click', () => {
      if (mb.dataset.mode === mode) return;
      mode = mb.dataset.mode;
      trackIndex = 0;
      modeBtns.forEach(b => {
        b.classList.toggle('active', b === mb);
        b.setAttribute('aria-pressed', b === mb);
      });
      if (playing) fadeTo(0, () => loadTrack(true));
      else loadTrack(false);
    });
  });

  function setPlaying(next) {
    playing = next;
    btn.textContent = playing ? '🔊' : '🔇';
    btn.setAttribute('aria-pressed', playing);
    btn.setAttribute('aria-label', playing ? 'Desativar som' : 'Ativar som');

    if (playing) {
      if (!audio.src) loadTrack(false);
      audio.volume = 0;
      audio.play().catch(() => {});
      fadeTo(targetVolume);
    } else {
      fadeTo(0, () => audio.pause());
    }
  }

  btn.addEventListener('click', () => setPlaying(!playing));

  // Assim que a pessoa entra no site (clique em "Entrar"/"Pular intro"),
  // esse gesto já conta como interação do usuário e libera o autoplay com som.
  document.addEventListener('site:enter', () => {
    if (!playing) setPlaying(true);
  }, { once: true });

  loadTrack(false);
}

// --- FILTROS DO PORTFÓLIO ---
function setupFilters() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const match = filter === 'todos' || card.dataset.category === filter;
        card.style.display = match ? 'block' : 'none';
      });
    });
  });
}

// --- CONTADOR ANIMADO (Certificados) ---
function animateCounters() {
  const countEl = document.getElementById('certCount');
  const hoursEl = document.getElementById('certHours');
  if (!countEl || !hoursEl) return;

  // Valores — ajuste conforme adicionar certificados
  const targetCount = 1;
  const targetHours = 0;

  let c = 0, h = 0;
  const timer = setInterval(() => {
    if (c < targetCount) { c++; countEl.textContent = c; }
    if (h < targetHours) { h++; hoursEl.textContent = h + 'h'; }
    if (c >= targetCount && h >= targetHours) clearInterval(timer);
  }, 60);
}

// Disparar contador quando a seção de certificados entrar na tela
function setupCertObserver() {
  const certSection = document.getElementById('certificados');
  if (!certSection) return;
  let triggered = false;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !triggered) {
      triggered = true;
      animateCounters();
    }
  }, { threshold: 0.3 });
  obs.observe(certSection);
}

// --- SCROLL REVEAL SUAVE ---
function setupScrollReveal() {
  const targets = document.querySelectorAll(
    '.project-card, .cert-card, .exp-card, .stat-card, .missao-card'
  );
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity .5s ease, transform .5s ease';
    obs.observe(el);
  });
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
  runIntro();
  createParticles();
  buildTechCarousel();
  setupActiveNav();
  setupMobileMenu();
  setupSound();
  setupFilters();
  setupCertObserver();
  // Pequeno delay para o reveal não conflitar com o intro
  setTimeout(setupScrollReveal, 200);
});