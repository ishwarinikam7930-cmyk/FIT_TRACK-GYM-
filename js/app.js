/* ============================================
   FitTrack – Main Application Orchestrator
   ============================================ */

/* ── Auth Utility ── */
const Auth = {
  /** Check if user is logged in via sessionStorage */
  isLoggedIn() {
    try {
      const user = sessionStorage.getItem('fittrack_user');
      if (!user) return false;
      const parsed = JSON.parse(user);
      return parsed && parsed.loggedIn === true;
    } catch (e) {
      return false;
    }
  },

  /** Get the logged-in user object */
  getUser() {
    try {
      return JSON.parse(sessionStorage.getItem('fittrack_user'));
    } catch (e) {
      return null;
    }
  },

  /** Clear session and redirect to login */
  logout() {
    try {
      sessionStorage.removeItem('fittrack_user');
    } catch (e) { /* ignore */ }
    window.location.href = 'login.html';
  },

  /** Ensure authenticated session, providing demo defaults if opened directly */
  guard() {
    if (!this.isLoggedIn()) {
      const isTrainer = window.location.pathname.includes('trainer-dashboard');
      const defaultUser = isTrainer ? {
        name: 'Coach Arjun Mehta',
        email: 'arjun.mehta@fittrack.com',
        role: 'trainer',
        loggedIn: true
      } : {
        name: 'Ishwari Nikam',
        email: 'ishwari.nikam@email.com',
        role: 'user',
        loggedIn: true
      };
      try {
        sessionStorage.setItem('fittrack_user', JSON.stringify(defaultUser));
      } catch (e) { /* ignore */ }
    }
    return true;
  }
};

const App = {
  toastTimeout: null,

  /* ── Initialize ── */
  init() {
    try {
      // Auth guard: ensure authenticated demo session
      Auth.guard();
    } catch (e) {
      console.warn('Auth guard error:', e);
    }

    try {
      // Initialize dashboard role based on URL/page/session
      Dashboard.initRole();
    } catch (e) {
      console.warn('Dashboard.initRole error:', e);
    }

    try {
      // Render topbar
      this.renderTopbar();
    } catch (e) {
      console.warn('Topbar render error:', e);
    }

    try {
      // Render sidebar
      Sidebar.init();
    } catch (e) {
      console.warn('Sidebar init error:', e);
    }

    try {
      // Render dashboard sections / router
      Dashboard.renderAll();
    } catch (e) {
      console.error('Dashboard renderAll error:', e);
    }

    try {
      // Initialize charts (after DOM)
      setTimeout(() => {
        try {
          Charts.init();
        } catch (err) {
          console.warn('Charts init error:', err);
        }
      }, 300);
    } catch (e) {}

    try {
      // Bind all global events
      this.bindEvents();
    } catch (e) {
      console.warn('Bind events error:', e);
    }
  },

  /* ── Top Navigation Bar ── */
  renderTopbar() {
    const topbar = document.getElementById('topbar');
    if (!topbar) return;

    const isTrainer = Dashboard.currentRole === 'trainer';

    if (isTrainer) {
      const trainer = (typeof FitTrackData !== 'undefined' && FitTrackData.trainerProfile) || (typeof FitTrackData !== 'undefined' && FitTrackData.activeTrainer) || {
        name: 'Coach Rahul Mehta',
        avatarInitials: 'RM'
      };
      const unreadNotifs = typeof FitTrackData !== 'undefined' && FitTrackData.getTrainerUnreadNotificationsCount ? FitTrackData.getTrainerUnreadNotificationsCount() : 0;
      const unreadMsgs = typeof FitTrackData !== 'undefined' && FitTrackData.getTrainerUnreadMessagesCount ? FitTrackData.getTrainerUnreadMessagesCount() : 0;

      topbar.innerHTML = `
        <div class="topbar__left">
          <button class="topbar__hamburger" id="hamburger-btn" aria-label="Toggle sidebar menu">
            ${Icons.menu}
          </button>
          <div>
            <h1 class="topbar__title" onclick="Dashboard.navigate('trainer_dashboard')" style="cursor:pointer;">FitTrack Trainer Portal</h1>
            <span class="topbar__welcome">Welcome back, <strong>Rahul</strong>! · <span style="color:var(--color-emerald-600);font-weight:700;">Verified Master Coach</span></span>
          </div>
        </div>

        <div class="topbar__right">
          <!-- Search Clients -->
          <div class="topbar__search">
            <span class="topbar__search-icon" aria-hidden="true">${Icons.search}</span>
            <input type="text" 
                   class="topbar__search-input" 
                   placeholder="Search clients by name, goal, plan..." 
                   id="topbar-search"
                   oninput="Dashboard.handleGlobalSearch(this.value)"
                   aria-label="Search clients">
          </div>

          <!-- Messages Icon -->
          <button class="topbar__notification" id="topbar-messages-btn" aria-label="Messages (${unreadMsgs} new)" onclick="Dashboard.navigate('trainer_messages')" title="Client Messages">
            ${Icons.messages}
            ${unreadMsgs > 0 ? `<span class="topbar__notification-count" style="background:#8B5CF6;">${unreadMsgs}</span>` : ''}
          </button>

          <!-- Notification Bell -->
          <button class="topbar__notification" id="topbar-notification-btn" aria-label="Notifications (${unreadNotifs} unread)" onclick="Dashboard.navigate('trainer_notifications')" title="Trainer Alerts">
            ${Icons.bell}
            ${unreadNotifs > 0 ? `<span class="topbar__notification-count">${unreadNotifs}</span>` : ''}
          </button>

          <!-- Trainer Profile Dropdown -->
          <div class="topbar__profile" id="topbar-profile" tabindex="0" aria-label="Trainer menu" aria-haspopup="true" aria-expanded="false">
            <div class="avatar avatar--sm avatar--placeholder" 
                 style="display:flex;align-items:center;justify-content:center;font-size:var(--text-xs);font-weight:800;width:36px;height:36px;border-radius:var(--radius-full);background:linear-gradient(135deg, #059669, #047857);color:#fff;box-shadow:var(--shadow-sm);">
              ${trainer.avatarInitials || 'RM'}
            </div>
            <div class="topbar__profile-info">
              <span class="topbar__profile-name">Coach Rahul Mehta</span>
              <span class="topbar__profile-role" style="color:var(--color-emerald-600);font-weight:700;">Master Coach</span>
            </div>
            <span class="topbar__profile-chevron" aria-hidden="true">${Icons.chevronDown}</span>

            <!-- Dropdown -->
            <div class="topbar__dropdown" id="profile-dropdown" role="menu">
              <button class="topbar__dropdown-item" type="button" role="menuitem" onclick="App.handleDropdownNavigate('trainer_public_profile')">
                ${Icons.profile} <span>My Profile</span>
              </button>
              <button class="topbar__dropdown-item" type="button" role="menuitem" onclick="App.handleDropdownNavigate('trainer_qualifications')">
                ${Icons.shield} <span>Qualifications</span>
              </button>
              <button class="topbar__dropdown-item" type="button" role="menuitem" onclick="App.handleDropdownNavigate('trainer_availability')">
                ${Icons.clock} <span>Availability</span>
              </button>
              <button class="topbar__dropdown-item" type="button" role="menuitem" onclick="App.handleDropdownNavigate('trainer_plans')">
                ${Icons.plans} <span>My Plans</span>
              </button>
              <button class="topbar__dropdown-item" type="button" role="menuitem" onclick="App.handleDropdownNavigate('trainer_settings')">
                ${Icons.settings} <span>Settings</span>
              </button>
              <div class="topbar__dropdown-divider"></div>
              <button class="topbar__dropdown-item danger" type="button" role="menuitem" id="topbar-logout-btn" onclick="App.handleLogout()">
                ${Icons.logout} <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      const user = (typeof FitTrackData !== 'undefined' && FitTrackData.currentUser) || {
        name: 'Ishwari Nikam',
        fullName: 'Ishwari Nikam',
        avatarInitials: 'IN'
      };
      const sessionUser = Auth.getUser();
      const unreadNotifs = typeof FitTrackData !== 'undefined' && FitTrackData.getUserUnreadNotificationsCount ? FitTrackData.getUserUnreadNotificationsCount() : 0;
      const unreadMsgs = typeof FitTrackData !== 'undefined' && FitTrackData.getUserUnreadMessagesCount ? FitTrackData.getUserUnreadMessagesCount() : 0;

      topbar.innerHTML = `
        <div class="topbar__left">
          <button class="topbar__hamburger" id="hamburger-btn" aria-label="Toggle sidebar menu">
            ${Icons.menu}
          </button>
          <div>
            <h1 class="topbar__title" onclick="Dashboard.navigate('dashboard')" style="cursor:pointer;">FitTrack Platform</h1>
            <span class="topbar__welcome">Welcome back, <strong>${sessionUser ? sessionUser.name.split(' ')[0] : user.name}</strong>! · <span style="color:var(--color-primary);font-weight:700;">Pro Plan Active</span></span>
          </div>
        </div>

        <div class="topbar__right">
          <!-- Search Input -->
          <div class="topbar__search">
            <span class="topbar__search-icon" aria-hidden="true">${Icons.search}</span>
            <input type="text" 
                   class="topbar__search-input" 
                   placeholder="Search workouts, diet, trainers, goals..." 
                   id="topbar-search"
                   oninput="Dashboard.handleGlobalSearch(this.value)"
                   aria-label="Search dashboard">
          </div>

          <!-- Messages Icon -->
          <button class="topbar__notification" id="topbar-messages-btn" aria-label="Messages (${unreadMsgs} new)" onclick="Dashboard.navigate('messages')" title="Messages">
            ${Icons.messages}
            ${unreadMsgs > 0 ? `<span class="topbar__notification-count" style="background:#8B5CF6;">${unreadMsgs}</span>` : ''}
          </button>

          <!-- Notification Bell -->
          <button class="topbar__notification" id="topbar-notification-btn" aria-label="Notifications (${unreadNotifs} unread)" onclick="Dashboard.navigate('notifications')" title="Notifications">
            ${Icons.bell}
            ${unreadNotifs > 0 ? `<span class="topbar__notification-count">${unreadNotifs}</span>` : ''}
          </button>

          <!-- User Profile Dropdown -->
          <div class="topbar__profile" id="topbar-profile" tabindex="0" aria-label="User menu" aria-haspopup="true" aria-expanded="false">
            <div class="avatar avatar--sm avatar--placeholder" 
                 style="display:flex;align-items:center;justify-content:center;font-size:var(--text-xs);font-weight:800;width:36px;height:36px;border-radius:var(--radius-full);background:linear-gradient(135deg, #10B981, #059669);color:#fff;box-shadow:var(--shadow-sm);">
              ${user.avatarInitials}
            </div>
            <div class="topbar__profile-info">
              <span class="topbar__profile-name">${sessionUser ? sessionUser.name : user.fullName}</span>
              <span class="topbar__profile-role">Pro Member</span>
            </div>
            <span class="topbar__profile-chevron" aria-hidden="true">${Icons.chevronDown}</span>

            <!-- Dropdown -->
            <div class="topbar__dropdown" id="profile-dropdown" role="menu">
              <button class="topbar__dropdown-item" type="button" role="menuitem" onclick="App.handleDropdownNavigate('profile')">
                ${Icons.profile} <span>My Profile</span>
              </button>
              <button class="topbar__dropdown-item" type="button" role="menuitem" onclick="App.handleDropdownNavigate('goal')">
                ${Icons.goal} <span>My Goal</span>
              </button>
              <button class="topbar__dropdown-item" type="button" role="menuitem" onclick="App.handleDropdownNavigate('my_plan')">
                ${Icons.purchase} <span>My Plan</span>
              </button>
              <button class="topbar__dropdown-item" type="button" role="menuitem" onclick="App.handleDropdownNavigate('settings')">
                ${Icons.settings} <span>Settings</span>
              </button>
              <div class="topbar__dropdown-divider"></div>
              <button class="topbar__dropdown-item danger" type="button" role="menuitem" id="topbar-logout-btn" onclick="App.handleLogout()">
                ${Icons.logout} <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    // Re-bind hamburger
    const hamburger = document.getElementById('hamburger-btn');
    if (hamburger) {
      hamburger.addEventListener('click', () => Sidebar.toggle());
    }
  },

  /* ── Dropdown Navigation & Auth Helpers ── */
  handleDropdownNavigate(viewId) {
    const dropdown = document.getElementById('profile-dropdown');
    const profileBtn = document.getElementById('topbar-profile');
    if (dropdown) dropdown.classList.remove('show');
    if (profileBtn) profileBtn.setAttribute('aria-expanded', 'false');
    Dashboard.navigate(viewId);
  },

  handleLogout() {
    const dropdown = document.getElementById('profile-dropdown');
    const profileBtn = document.getElementById('topbar-profile');
    if (dropdown) dropdown.classList.remove('show');
    if (profileBtn) profileBtn.setAttribute('aria-expanded', 'false');
    Auth.logout();
  },

  /* ── Bind Global Events ── */
  bindEvents() {
    // Profile dropdown toggle & keyboard support
    const profileBtn = document.getElementById('topbar-profile');
    const dropdown = document.getElementById('profile-dropdown');
    if (profileBtn && dropdown) {
      profileBtn.addEventListener('click', (e) => {
        // If clicking on a dropdown item button inside the menu, let the button handle it
        if (e.target.closest('#profile-dropdown')) {
          return;
        }
        e.stopPropagation();
        const isOpen = dropdown.classList.toggle('show');
        profileBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      profileBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.target === profileBtn) {
            e.preventDefault();
            const isOpen = dropdown.classList.toggle('show');
            profileBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            if (isOpen) {
              const firstItem = dropdown.querySelector('.topbar__dropdown-item');
              if (firstItem) firstItem.focus();
            }
          }
        } else if (e.key === 'Escape') {
          dropdown.classList.remove('show');
          profileBtn.setAttribute('aria-expanded', 'false');
          profileBtn.focus();
        }
      });

      document.addEventListener('click', (e) => {
        if (!e.target.closest('#topbar-profile')) {
          dropdown.classList.remove('show');
          profileBtn.setAttribute('aria-expanded', 'false');
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dropdown.classList.contains('show')) {
          dropdown.classList.remove('show');
          profileBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Topbar Search
    const searchInput = document.getElementById('topbar-search');
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const query = searchInput.value.trim().toLowerCase();
          if (query) {
            if (query.includes('train') || query.includes('coach') || query.includes('arjun')) {
              Dashboard.navigate('trainers');
            } else if (query.includes('plan') || query.includes('price') || query.includes('buy') || query.includes('pro')) {
              Dashboard.navigate('plans');
            } else if (query.includes('diet') || query.includes('meal') || query.includes('workout') || query.includes('activit')) {
              Dashboard.navigate('activities');
            } else if (query.includes('session') || query.includes('book') || query.includes('video')) {
              Dashboard.navigate('sessions');
            } else if (query.includes('goal') || query.includes('weight') || query.includes('target')) {
              Dashboard.navigate('goal');
            } else if (query.includes('progress') || query.includes('chart') || query.includes('stat')) {
              Dashboard.navigate('progress');
            } else if (query.includes('chat') || query.includes('message')) {
              Dashboard.navigate('messages');
            } else if (query.includes('review') || query.includes('rate') || query.includes('star')) {
              Dashboard.navigate('reviews');
            } else if (query.includes('profile') || query.includes('account')) {
              Dashboard.navigate('profile');
            } else {
              this.showToast('info', 'Search Results', `Showing dashboard results for "${query}".`);
              Dashboard.navigate('dashboard');
            }
            searchInput.value = '';
          }
        }
      });
    }

    // Global Exercise checkboxes
    document.addEventListener('click', (e) => {
      const checkbox = e.target.closest('.exercise-row__checkbox');
      if (checkbox) {
        this.handleExerciseToggle(checkbox);
      }
    });

    // Global Logout button
    document.addEventListener('click', (e) => {
      if (e.target.closest('#topbar-logout-btn')) {
        Auth.logout();
      }
    });

    // Close client detail modal on overlay click
    document.addEventListener('click', (e) => {
      const modalOverlay = document.getElementById('client-detail-modal-overlay');
      if (modalOverlay && modalOverlay.classList.contains('visible') && e.target === modalOverlay) {
        Dashboard.closeClientDetailModal();
      }
    });

    // Hash navigation & browser history (Back / Forward)
    window.addEventListener('popstate', () => {
      const rawHash = window.location.hash.replace(/^#/, '');
      const mapped = Dashboard.mapHashToView ? Dashboard.mapHashToView(rawHash) : rawHash;
      Dashboard.navigate(mapped, false);
    });

    window.addEventListener('hashchange', () => {
      const rawHash = window.location.hash.replace(/^#/, '');
      const mapped = Dashboard.mapHashToView ? Dashboard.mapHashToView(rawHash) : rawHash;
      if (mapped && mapped !== Dashboard.currentView) {
        Dashboard.navigate(mapped, false);
      }
    });

    // WebRTC Live Call Keyboard Shortcuts (M = Mic, V = Cam, S = Screen Share, F = Maximize, R = Record)
    document.addEventListener('keydown', (e) => {
      const videoModal = document.getElementById('video-session-modal-overlay');
      if (videoModal && videoModal.classList.contains('visible')) {
        // Ignore if user is currently typing in an input/textarea
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

        if (e.key === 'm' || e.key === 'M') {
          e.preventDefault();
          Dashboard.toggleVideoMic();
        } else if (e.key === 'v' || e.key === 'V') {
          e.preventDefault();
          Dashboard.toggleVideoCam();
        } else if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          Dashboard.toggleVideoScreenShare();
        } else if (e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          Dashboard.toggleVideoMaximize();
        } else if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          Dashboard.toggleVideoRecording();
        }
      }
    });

    // Cleanup hardware media streams & save recording on page unload/close
    window.addEventListener('beforeunload', () => {
      if (Dashboard.videoSession) {
        Dashboard.closeVideoSession();
      }
    });
  },

  /* ── Exercise Toggle ── */
  handleExerciseToggle(checkbox) {
    const exId = checkbox.dataset.exerciseId;
    const row = checkbox.closest('.exercise-row');
    const isChecked = checkbox.classList.contains('checked');

    if (isChecked) {
      checkbox.classList.remove('checked');
      checkbox.innerHTML = '';
      checkbox.setAttribute('aria-checked', 'false');
      if (row) row.classList.remove('completed');
    } else {
      checkbox.classList.add('checked');
      checkbox.innerHTML = Components.icon('check');
      checkbox.setAttribute('aria-checked', 'true');
      if (row) row.classList.add('completed');
      this.showToast('success', 'Exercise Completed! 💪', 'Great form! Exercise progress recorded.');
    }

    const exercise = FitTrackData.todaysWorkout.exercises.find(e => e.id === exId);
    if (exercise) {
      exercise.completed = !isChecked;
    }
  },

  /* ── Mark All Complete ── */
  handleMarkAllComplete() {
    const exercises = FitTrackData.todaysWorkout.exercises;
    exercises.forEach(e => e.completed = true);

    document.querySelectorAll('.exercise-row__checkbox').forEach(cb => {
      cb.classList.add('checked');
      cb.innerHTML = Components.icon('check');
      cb.setAttribute('aria-checked', 'true');
    });

    document.querySelectorAll('.exercise-row').forEach(row => {
      row.classList.add('completed');
    });

    this.showToast('success', 'Workout Completed! 🎉', 'Superb job! All exercises for today marked complete.');
  },

  /* ── Modal Helpers ── */
  openModal(id) {
    const overlay = document.getElementById(`${id}-overlay`);
    if (overlay) {
      overlay.classList.add('visible');
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        const firstInput = overlay.querySelector('input, select, textarea');
        if (firstInput) firstInput.focus();
      }, 200);
    }
  },

  closeModal(id) {
    const overlay = document.getElementById(`${id}-overlay`);
    if (overlay) {
      overlay.classList.remove('visible');
      document.body.style.overflow = '';
    }
  },

  /* ── Toast System ── */
  showToast(type, title, message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toastHtml = Components.toast({ type, title, message });
    container.insertAdjacentHTML('beforeend', toastHtml);

    const toast = container.lastElementChild;

    const closeBtn = toast.querySelector('.toast__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.removeToast(toast));
    }

    setTimeout(() => this.removeToast(toast), 4000);
  },

  removeToast(toast) {
    if (!toast || !toast.parentElement) return;
    toast.classList.add('removing');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 300);
  }
};

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
