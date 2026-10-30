/* ============================================
   FitTrack – Dynamic Sidebar Navigation
   Renders role-specific navigation for:
   - Trainer (10 Features)
   - User (11 Features)
   ============================================ */

const Sidebar = {
  isOpen: false,

  render() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    if (typeof FitTrackData !== 'undefined' && FitTrackData.syncNavBadges) {
      FitTrackData.syncNavBadges();
    }

    const isTrainer = Dashboard.currentRole === 'trainer';
    const navItems = isTrainer ? FitTrackData.trainerSidebarNav : FitTrackData.sidebarNav;

    sidebar.innerHTML = `
      <!-- Brand -->
      <div class="sidebar__brand" onclick="Dashboard.navigate('${isTrainer ? 'trainer_dashboard' : 'dashboard'}')" style="cursor:pointer;">
        <div class="sidebar__logo" aria-hidden="true">
          ${Icons.fitTrackLogo}
        </div>
        <div style="display:flex;flex-direction:column;">
          <span class="sidebar__brand-name">Fit<span>Track</span></span>
          <span style="font-size:10px;font-weight:700;color:var(--color-primary);text-transform:uppercase;letter-spacing:0.05em;">
            ${isTrainer ? 'Trainer Portal' : 'User Portal'}
          </span>
        </div>
      </div>

      <!-- Navigation List -->
      <nav class="sidebar__nav" role="navigation" aria-label="Main navigation">
        ${navItems.map(item => {
          if (item.type === 'divider') {
            return `<div class="sidebar__divider" style="margin:var(--space-2) 0;opacity:0.6;font-size:10px;font-weight:700;text-transform:uppercase;color:var(--text-muted);padding:0 var(--space-4);">${item.label || ''}</div>`;
          }
          const isCurrentActive = Dashboard.currentView === item.id;
          return `
            <a href="#${item.id}" 
               class="sidebar__nav-item ${isCurrentActive ? 'active' : ''} ${item.id === 'logout' ? 'logout-item' : ''}" 
               id="nav-${item.id}"
               role="menuitem"
               aria-current="${isCurrentActive ? 'page' : 'false'}"
               data-nav="${item.id}">
              <span class="sidebar__nav-icon" aria-hidden="true">${Icons[item.icon] || ''}</span>
              <span>${item.label}</span>
              ${item.badge ? `<span class="sidebar__nav-badge" aria-label="${item.badge} new">${item.badge}</span>` : ''}
            </a>
          `;
        }).join('')}
      </nav>

      <!-- Role Switcher & Footer -->
      <div class="sidebar__footer" style="padding:var(--space-3);background:var(--bg-surface-hover);border-top:1px solid var(--border-light);display:flex;flex-direction:column;gap:6px;">
        <button class="btn btn--secondary btn--sm" style="width:100%;font-size:11px;padding:6px 8px;display:flex;align-items:center;justify-content:center;gap:6px;" onclick="Dashboard.switchRole('${isTrainer ? 'user' : 'trainer'}')">
          🔄 Switch to ${isTrainer ? 'User View' : 'Trainer View'}
        </button>
        <div style="opacity: 0.6; font-size: 10px; text-align: center; color: var(--text-muted);">
          FitTrack Pro v2.5 · Role: <strong>${isTrainer ? 'Trainer' : 'User'}</strong>
        </div>
      </div>
    `;
  },

  toggle() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      sidebar.classList.add('open');
      overlay.classList.add('visible');
      document.body.style.overflow = 'hidden';
    } else {
      sidebar.classList.remove('open');
      overlay.classList.remove('visible');
      document.body.style.overflow = '';
    }
  },

  close() {
    if (this.isOpen) {
      this.toggle();
    }
  },

  setActive(navId) {
    document.querySelectorAll('.sidebar__nav-item').forEach(item => {
      item.classList.remove('active');
      item.setAttribute('aria-current', 'false');
    });
    const active = document.querySelector(`[data-nav="${navId}"]`);
    if (active) {
      active.classList.add('active');
      active.setAttribute('aria-current', 'page');
    }
  },

  bindEvents() {
    const hamburger = document.getElementById('hamburger-btn');
    if (hamburger) {
      hamburger.addEventListener('click', () => this.toggle());
    }

    const overlay = document.getElementById('sidebar-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => this.close());
    }

    document.querySelectorAll('.sidebar__nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const navId = item.dataset.nav;
        if (navId === 'logout') {
          Auth.logout();
        } else if (navId === 'register' || navId === 'trainer_register') {
          this.close();
          Dashboard.openRegisterModal(Dashboard.currentRole);
        } else if (navId) {
          this.close();
          Dashboard.navigate(navId);
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  },

  init() {
    this.render();
    this.bindEvents();
  }
};
