/* ============================================
   FitTrack – Master Dashboard & Feature Router
   Supports:
   - USER ROLE (11 User Options)
   - TRAINER ROLE (10 Trainer Options)
   - Seamless Role Switching & Live Interactions
   ============================================ */

const Dashboard = {
  currentRole: 'user', // default or loaded from session
  currentView: 'dashboard',
  selectedTrainerFilter: 'all',
  selectedBilling: 'monthly',
  activeActivityTab: 'workouts',
  currentRatingValue: 5,
  activeTrainerClientId: 'client_001',
  clientsSearchQuery: '',
  clientsStatusFilter: 'all',
  clientsGoalFilter: 'all',
  clientsSortBy: 'progress',
  clientsCurrentPage: 1,
  clientsPerPage: 8,
  prefilledSessionClient: null,

  /* ── Synchronize All Badges Across Header, Sidebar & State ── */
  updateBadges() {
    if (typeof FitTrackData !== 'undefined' && FitTrackData.syncNavBadges) {
      FitTrackData.syncNavBadges();
    }

    const isTrainer = this.currentRole === 'trainer';
    const unreadMsgs = isTrainer ? FitTrackData.getTrainerUnreadMessagesCount() : FitTrackData.getUserUnreadMessagesCount();
    const unreadNotifs = isTrainer ? FitTrackData.getTrainerUnreadNotificationsCount() : FitTrackData.getUserUnreadNotificationsCount();

    // 1. Update Topbar Messages Button Badge
    const topbarMsgBtn = document.getElementById('topbar-messages-btn');
    if (topbarMsgBtn) {
      topbarMsgBtn.setAttribute('aria-label', `Messages (${unreadMsgs} new)`);
      let badge = topbarMsgBtn.querySelector('.topbar__notification-count');
      if (unreadMsgs > 0) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'topbar__notification-count';
          if (isTrainer) badge.style.background = '#8B5CF6';
          topbarMsgBtn.appendChild(badge);
        }
        badge.textContent = unreadMsgs;
      } else if (badge) {
        badge.remove();
      }
    }

    // 2. Update Topbar Notifications Bell Badge
    const topbarNotifBtn = document.getElementById('topbar-notification-btn');
    if (topbarNotifBtn) {
      topbarNotifBtn.setAttribute('aria-label', `Notifications (${unreadNotifs} unread)`);
      let badge = topbarNotifBtn.querySelector('.topbar__notification-count');
      if (unreadNotifs > 0) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'topbar__notification-count';
          topbarNotifBtn.appendChild(badge);
        }
        badge.textContent = unreadNotifs;
      } else if (badge) {
        badge.remove();
      }
    }

    // 3. Update ALL Sidebar Nav Badges Dynamically
    const navItems = isTrainer ? FitTrackData.trainerSidebarNav : FitTrackData.sidebarNav;
    if (Array.isArray(navItems)) {
      navItems.forEach(item => {
        if (!item || !item.id) return;
        const navEl = document.getElementById(`nav-${item.id}`);
        if (!navEl) return;
        let badgeEl = navEl.querySelector('.sidebar__nav-badge');
        if (item.badge && item.badge > 0) {
          if (!badgeEl) {
            badgeEl = document.createElement('span');
            badgeEl.className = 'sidebar__nav-badge';
            navEl.appendChild(badgeEl);
          }
          badgeEl.setAttribute('aria-label', `${item.badge} new`);
          badgeEl.textContent = item.badge;
        } else if (badgeEl) {
          badgeEl.remove();
        }
      });
    }
  },

  /* ── Switch Active View ── */
  navigate(viewId, updateHash = true) {
    this.currentView = viewId;

    if (updateHash) {
      const hashStr = '#' + viewId;
      if (window.location.hash !== hashStr) {
        history.pushState({ viewId }, '', hashStr);
      }
    }

    // Mark current section as viewed so remaining notifications / badges update
    if (typeof FitTrackData !== 'undefined') {
      if (FitTrackData.markSectionAsViewed) {
        FitTrackData.markSectionAsViewed(viewId, this.currentRole);
      }

      // When navigating to messages, mark messages as read
      if (viewId === 'messages') {
        FitTrackData.markAllUserMessagesAsRead();
      } else if (viewId === 'trainer_messages') {
        FitTrackData.markAllTrainerMessagesAsRead();
      }

      // When navigating to notifications, mark all notifications as read
      if (viewId === 'notifications') {
        FitTrackData.markAllNotificationsAsRead(false);
      } else if (viewId === 'trainer_notifications') {
        FitTrackData.markAllNotificationsAsRead(true);
      }
    }

    Sidebar.setActive(viewId);
    this.updateBadges();
    this.renderCurrentView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  /* ── Map Hash / Route aliases to Canonical View IDs ── */
  mapHashToView(rawHash, role = this.currentRole) {
    if (!rawHash) return role === 'trainer' ? 'trainer_dashboard' : 'dashboard';
    const hash = rawHash.toLowerCase().replace(/^#/, '').trim();
    if (role === 'trainer') {
      if (['overview', 'dashboard', 'home', 'main'].includes(hash)) return 'trainer_dashboard';
      if (['profile', 'my-profile', 'public-profile', 'trainer_public_profile'].includes(hash)) return 'trainer_public_profile';
      if (['qualifications', 'certifications', 'trainer_qualifications'].includes(hash)) return 'trainer_qualifications';
      if (['availability', 'schedule-time', 'trainer_availability'].includes(hash)) return 'trainer_availability';
      if (['plans', 'plan-builder', 'my-plans', 'trainer_plans'].includes(hash)) return 'trainer_plans';
      if (['plan-approval', 'trainer_plan_approval'].includes(hash)) return 'trainer_plan_approval';
      if (['clients', 'roster', 'trainer_clients'].includes(hash)) return 'trainer_clients';
      if (['activities', 'workouts', 'workout', 'diet', 'nutrition', 'assign-activities', 'trainer_assign_activities'].includes(hash)) return 'trainer_assign_activities';
      if (['sessions', 'schedule', 'video-sessions', 'video', 'trainer_schedule_sessions'].includes(hash)) return 'trainer_schedule_sessions';
      if (['progress', 'analytics', 'review-progress', 'client-progress', 'trainer_review_progress'].includes(hash)) return 'trainer_review_progress';
      if (['messages', 'chat', 'crm', 'trainer_messages', 'trainer_crm'].includes(hash)) return 'trainer_messages';
      if (['reviews', 'ratings', 'feedback', 'trainer_reviews'].includes(hash)) return 'trainer_reviews';
      if (['notifications', 'alerts', 'trainer_notifications'].includes(hash)) return 'trainer_notifications';
      if (['settings', 'account', 'trainer_settings'].includes(hash)) return 'trainer_settings';
      return hash.startsWith('trainer_') ? hash : `trainer_${hash}`;
    } else {
      if (['overview', 'dashboard', 'home', 'main'].includes(hash)) return 'dashboard';
      if (['profile', 'my-profile'].includes(hash)) return 'profile';
      if (['goal', 'my-goal', 'goals'].includes(hash)) return 'goal';
      if (['trainers', 'find-trainers', 'coach'].includes(hash)) return 'trainers';
      if (['plans', 'compare-plans', 'pricing'].includes(hash)) return 'trainers';
      if (['my_plan', 'my-plan', 'purchase'].includes(hash)) return 'my_plan';
      if (['activities', 'workout', 'workouts', 'diet', 'nutrition'].includes(hash)) return 'activities';
      if (['sessions', 'video-sessions', 'schedule', 'video'].includes(hash)) return 'sessions';
      if (['progress', 'analytics', 'charts'].includes(hash)) return 'progress';
      if (['messages', 'chat'].includes(hash)) return 'messages';
      if (['reviews', 'feedback', 'ratings'].includes(hash)) return 'reviews';
      if (['notifications', 'alerts'].includes(hash)) return 'notifications';
      if (['settings', 'account'].includes(hash)) return 'settings';
      return hash;
    }
  },

  /* ── Time-based Responsive Greeting ── */
  getTimeGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Welcome';
  },

  /* ── Initialize active role ── */
  initRole() {
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    const bodyRole = typeof document !== 'undefined' && document.body ? document.body.getAttribute('data-dashboard-role') : null;
    const isTrainerPage = (bodyRole === 'trainer') || window.location.pathname.includes('trainer-dashboard');
    const isUserPage = (bodyRole === 'user') || window.location.pathname.includes('user-dashboard');
    const rawHash = window.location.hash.replace(/^#/, '');

    if (isTrainerPage || roleParam === 'trainer') {
      this.currentRole = 'trainer';
      this.currentView = this.mapHashToView(rawHash, 'trainer');
      const user = Auth.getUser() || {};
      user.role = 'trainer';
      user.name = user.name || 'Coach';
      user.email = user.email || 'coach@fittrack.com';
      user.loggedIn = true;
      try { sessionStorage.setItem('fittrack_user', JSON.stringify(user)); } catch (e) {}
    } else if (isUserPage || roleParam === 'user') {
      this.currentRole = 'user';
      this.currentView = this.mapHashToView(rawHash, 'user');
      const user = Auth.getUser() || {};
      user.role = 'user';
      user.name = user.name || 'Member';
      user.email = user.email || 'member@fittrack.com';
      user.loggedIn = true;
      try { sessionStorage.setItem('fittrack_user', JSON.stringify(user)); } catch (e) {}
    } else {
      const sessionUser = Auth.getUser();
      if (sessionUser && sessionUser.role) {
        this.currentRole = sessionUser.role;
        this.currentView = this.mapHashToView(rawHash, this.currentRole);
      } else {
        this.currentRole = 'user';
        this.currentView = this.mapHashToView(rawHash, 'user');
      }
    }

    if (typeof FitTrackData !== 'undefined' && FitTrackData.syncWithSessionUser) {
      FitTrackData.syncWithSessionUser();
    }

    if (typeof FitTrackData !== 'undefined') {
      if (FitTrackData.markSectionAsViewed) {
        FitTrackData.markSectionAsViewed(this.currentView, this.currentRole);
      }
      if (this.currentView === 'notifications') {
        FitTrackData.markAllNotificationsAsRead(false);
      } else if (this.currentView === 'trainer_notifications') {
        FitTrackData.markAllNotificationsAsRead(true);
      } else if (this.currentView === 'messages') {
        FitTrackData.markAllUserMessagesAsRead();
      } else if (this.currentView === 'trainer_messages') {
        FitTrackData.markAllTrainerMessagesAsRead();
      }
    }
  },

  /* ── Switch Role (Demo toggle between User and Trainer) ── */
  switchRole(newRole) {
    this.currentRole = newRole;
    this.currentView = newRole === 'trainer' ? 'trainer_dashboard' : 'dashboard';
    
    // Update session storage for persistence
    try {
      const user = Auth.getUser() || {};
      user.role = newRole;
      if (newRole === 'trainer') {
        user.name = 'Coach Arjun Mehta';
        user.email = 'arjun.mehta@fittrack.com';
      } else {
        user.name = 'Ishwari Nikam';
        user.email = 'ishwari.nikam@email.com';
      }
      user.loggedIn = true;
      sessionStorage.setItem('fittrack_user', JSON.stringify(user));
    } catch (e) { /* ignore */ }

    FitTrackData.syncNavBadges();
    App.renderTopbar();
    Sidebar.render();
    Sidebar.bindEvents();
    Sidebar.setActive(this.currentView);
    this.updateBadges();
    this.renderCurrentView();
    App.showToast('info', 'Role Switched', `Switched to ${newRole === 'trainer' ? 'Trainer (Coach Arjun)' : 'User (Ishwari Nikam)'} Dashboard.`);
  },

  /* ── Master Render / Init ── */
  renderAll() {
    this.initRole();
    this.updateBadges();
    this.renderCurrentView();
  },

  init() {
    this.renderAll();
  },

  /* ── Switch Active View ── */

  /* ── Render Master Router ── */
  renderCurrentView() {
    const content = document.getElementById('dashboard-content');
    if (!content) return;

    let viewHtml = '';

    // TRAINER VIEWS (14 Dedicated Trainer Features)
    if (this.currentView.startsWith('trainer_') || this.currentRole === 'trainer') {
      switch (this.currentView) {
        case 'trainer_public_profile':
          viewHtml = this.renderTrainerPublicProfileView();
          break;
        case 'trainer_qualifications':
          viewHtml = this.renderTrainerQualificationsView();
          break;
        case 'trainer_availability':
          viewHtml = this.renderTrainerAvailabilityView();
          break;
        case 'trainer_plans':
          viewHtml = this.renderTrainerPlansView();
          break;
        case 'trainer_plan_approval':
          viewHtml = this.renderTrainerPlanApprovalView();
          break;
        case 'trainer_clients':
          viewHtml = this.renderTrainerClientsView();
          break;
        case 'trainer_assign_activities':
          viewHtml = this.renderTrainerAssignActivitiesView();
          break;
        case 'trainer_schedule_sessions':
          viewHtml = this.renderTrainerScheduleSessionsView();
          break;
        case 'trainer_review_progress':
          viewHtml = this.renderTrainerReviewProgressView();
          break;
        case 'trainer_messages':
        case 'trainer_crm':
          viewHtml = this.renderTrainerMessagesView();
          break;
        case 'trainer_reviews':
          viewHtml = this.renderTrainerReviewsView();
          break;
        case 'trainer_notifications':
          viewHtml = this.renderTrainerNotificationsView();
          break;
        case 'trainer_settings':
          viewHtml = this.renderTrainerSettingsView();
          break;
        case 'trainer_register':
          this.openRegisterModal('trainer');
          return;
        case 'trainer_dashboard':
        default:
          viewHtml = this.renderTrainerDashboardOverview();
          break;
      }
    } 
    // USER VIEWS
    else {
      switch (this.currentView) {
        case 'profile':
          viewHtml = this.renderProfileView();
          break;
        case 'goal':
          viewHtml = this.renderGoalView();
          break;
        case 'trainers':
        case 'plans':
          viewHtml = this.renderTrainersView();
          break;
        case 'my_plan':
          viewHtml = this.renderMyPlanView();
          break;
        case 'activities':
        case 'workout':
        case 'diet':
          viewHtml = this.renderActivitiesView();
          break;
        case 'sessions':
          viewHtml = this.renderSessionsView();
          break;
        case 'progress':
          viewHtml = this.renderProgressView();
          break;
        case 'messages':
          viewHtml = this.renderMessagesView();
          break;
        case 'reviews':
          viewHtml = this.renderReviewsView();
          break;
        case 'notifications':
          viewHtml = this.renderNotificationsView();
          break;
        case 'settings':
          viewHtml = this.renderSettingsView();
          break;
        case 'register':
          this.openRegisterModal('user');
          return;
        case 'dashboard':
        default:
          viewHtml = this.renderDashboardOverview();
          break;
      }
    }

    content.innerHTML = `
      ${this.renderModals()}
      ${viewHtml}
    `;

    // Post-render init & bindings
    this.bindViewEvents();
    if (this.currentView === 'dashboard' || this.currentView === 'progress' || this.currentView === 'trainer_dashboard') {
      setTimeout(() => Charts.init(), 100);
    }
  },


  /* ── Bind View Events ── */
  bindViewEvents() {
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        App.closeModal(btn.dataset.modalClose);
      });
    });
  },

  /* ══════════════════════════════════════════════
     TRAINER DASHBOARD & 14 DEDICATED TRAINER FEATURES
     ══════════════════════════════════════════════ */

  /* ── 1. TRAINER DASHBOARD OVERVIEW (Operational Command Center) ── */
  renderTrainerDashboardOverview() {
    const trainer = FitTrackData.trainerProfile;
    const clients = FitTrackData.activeClients;
    const sessions = FitTrackData.trainerSessions;
    const reviews = FitTrackData.clientProgressReviews;
    const plans = FitTrackData.trainerPublishedPlans;

    const sessionUser = Auth.getUser();
    const trainerFullName = (sessionUser && sessionUser.name) ? sessionUser.name : (trainer.fullName || 'Coach');
    const trainerFirstName = trainerFullName.replace(/^Coach\s+/i, '').split(' ')[0] || 'Coach';
    const greeting = this.getTimeGreeting();

    return `
      <!-- Trainer Welcome Hero Banner -->
      <section class="welcome-hero animate-fade-in-up" style="background: linear-gradient(135deg, #065F46 0%, #047857 50%, #1E293B 100%);">
        <div class="welcome-hero__text">
          <div class="welcome-hero__badge" style="color:#A7F3D0;">
            ${Components.icon('shield')} <span>FITTRACK TRAINER COMMAND PORTAL</span>
          </div>
          <h1 class="welcome-hero__heading">${greeting}, ${trainerFirstName}! 🏋️‍♂️</h1>
          <p class="welcome-hero__subtext">
            You are actively coaching <strong>${trainer.activeClientsCount} enrolled clients</strong> with a <strong>${trainer.rating} ★★★★★</strong> rating. 
            You have <strong>${sessions.length} 1-on-1 video sessions</strong> scheduled this week.
          </p>
          <div class="welcome-hero__cta-group">
            <button class="welcome-hero__cta" onclick="Dashboard.navigate('trainer_assign_activities')">
              ${Components.icon('activity')} <span>Assign Activities (12)</span>
            </button>
            <button class="welcome-hero__cta welcome-hero__cta--outline" onclick="Dashboard.navigate('trainer_clients')">
              ${Components.icon('trainers')} <span>View All 24 Clients</span>
            </button>
            <button class="welcome-hero__cta welcome-hero__cta--outline" onclick="Dashboard.navigate('trainer_schedule_sessions')">
              ${Components.icon('sessions')} <span>Schedule 1-on-1 Call</span>
            </button>
            <button class="welcome-hero__cta welcome-hero__cta--outline" onclick="Dashboard.navigate('trainer_messages')">
              ${Components.icon('messages')} <span>Client Messages (8)</span>
            </button>
          </div>
        </div>

        <div class="welcome-hero__trainer" style="min-width:290px;background:rgba(255,255,255,0.12);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.25);">
          <div class="welcome-hero__trainer-label" style="color:#A7F3D0;">Monthly Operations Summary</div>
          <div style="font-size:var(--text-3xl);font-weight:800;color:#fff;margin-bottom:2px;">
            $3,240 <span style="font-size:var(--text-xs);font-weight:400;color:rgba(255,255,255,0.8);">/ this month</span>
          </div>
          <div style="font-size:var(--text-xs);color:rgba(255,255,255,0.9);margin-bottom:var(--space-2);">
            24 / 30 Capacity (80% full) · 92% Client Compliance
          </div>
          <div class="duration-progress-bar" style="background:rgba(255,255,255,0.25);height:6px;margin-bottom:var(--space-3);">
            <div class="duration-progress-bar__fill" style="width: 80%; background:#34D399;"></div>
          </div>
          <div class="welcome-hero__trainer-plan">
            <div class="welcome-hero__trainer-plan-icon">
              ${Components.icon('checkCircle')}
            </div>
            <span>${trainer.verifiedStatus}</span>
          </div>
        </div>
      </section>

      <!-- 3. TRAINER OVERVIEW: 6 KPI CARDS -->
      <div class="metrics-grid mb-6">
        ${Components.metricCard({ label: 'Active Clients', value: `${trainer.activeClientsCount}`, detail: '30 Max Capacity (80% full)', icon: 'trainers', colorClass: 'emerald', delay: 1 })}
        ${Components.metricCard({ label: 'Published Plans', value: `${trainer.publishedPlansCount}`, detail: '4 Live · 1 In Review · 1 Draft', icon: 'plans', colorClass: 'blue', delay: 2 })}
        ${Components.metricCard({ label: 'Upcoming Sessions', value: `${trainer.upcomingSessionsCount}`, detail: 'Next: Today 5:00 PM (Aarav S.)', icon: 'video', colorClass: 'purple', delay: 3 })}
        ${Components.metricCard({ label: 'Pending Activities', value: `${trainer.pendingActivitiesCount}`, detail: 'Assignments & Workout Audits', icon: 'activities', colorClass: 'amber', delay: 4 })}
        ${Components.metricCard({ label: 'Unread Messages', value: `${trainer.unreadMessagesCount}`, detail: '3 Priority Client Questions', icon: 'messages', colorClass: 'purple', delay: 5 })}
        ${Components.metricCard({ label: 'Average Rating', value: `${trainer.rating} ★`, detail: 'From 142 Verified Reviews', icon: 'star', colorClass: 'amber', delay: 6 })}
      </div>

      <!-- Direct Self-Service Storefront Banner -->
      <div class="card card--flat mb-6" style="background:linear-gradient(90deg, #ECFDF5 0%, #F0FDF4 100%);border:1px solid #A7F3D0;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--space-3);">
          <div style="display:flex;align-items:center;gap:var(--space-3);">
            <span style="font-size:24px;">🚀</span>
            <div>
              <div style="font-weight:700;font-size:var(--text-sm);color:#065F46;">Self-Service Storefront Active · All Published Plans Live</div>
              <div style="font-size:var(--text-xs);color:#047857;">Members can directly discover your profile, compare packages, book sessions, and subscribe instantly.</div>
            </div>
          </div>
          <div style="display:flex;gap:var(--space-2);">
            <button class="btn btn--primary btn--sm" onclick="Dashboard.navigate('trainer_plans')">
              Manage Published Plans →
            </button>
          </div>
        </div>
      </div>

      <!-- 4. MY ACTIVE CLIENTS & 8. SESSIONS (Two Column Layout) -->
      <div class="two-column mb-6">
        
        <!-- Client Compliance Roster -->
        <div class="card card--flat">
          <div class="card__header">
            <div>
              <span class="dashboard-highlight-card__tag">4. CLIENT OVERVIEW</span>
              <h2 class="card__title" style="display:flex;align-items:center;gap:var(--space-2);margin-top:2px;">
                ${Components.icon('trainers')} My Active Clients (Top Roster)
              </h2>
              <p class="card__subtitle">Showing 6 of ${trainer.activeClientsCount} actively subscribed fitness members</p>
            </div>
            <button class="btn btn--secondary btn--sm" onclick="Dashboard.navigate('trainer_clients')">
              View All 24 Clients →
            </button>
          </div>

          <div class="flex flex-col gap-3">
            ${clients.map(c => `
              <div style="border:1px solid var(--border-light);border-radius:var(--radius-md);padding:var(--space-3) var(--space-4);background:var(--bg-surface);display:flex;justify-content:space-between;align-items:center;gap:var(--space-3);">
                <div style="display:flex;align-items:center;gap:var(--space-3);">
                  <div class="avatar avatar--sm avatar--placeholder" style="background:${c.avatarBg};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;">
                    ${c.initials}
                  </div>
                  <div>
                    <div style="font-weight:700;font-size:var(--text-sm);">${c.name}</div>
                    <div style="font-size:var(--text-xs);color:var(--text-muted);">${c.plan} · <strong>${c.goal}</strong></div>
                  </div>
                </div>
                <div style="text-align:right;">
                  <span class="badge badge--${c.statusClass}">${c.overallProgress}% Progress</span>
                  <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">Next: ${c.nextSession.split('·')[0]}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Scheduled Sessions Timeline -->
        <div class="card card--flat">
          <div class="card__header">
            <div>
              <span class="dashboard-highlight-card__tag">7. SESSION MANAGEMENT</span>
              <h2 class="card__title" style="display:flex;align-items:center;gap:var(--space-2);margin-top:2px;">
                ${Components.icon('sessions')} Today & Upcoming Sessions
              </h2>
              <p class="card__subtitle">${sessions.filter(s => s.category !== 'completed' && s.category !== 'cancelled').length} scheduled appointments this week</p>
            </div>
            <button class="btn btn--primary btn--sm" onclick="Dashboard.navigate('trainer_schedule_sessions')">
              + Book Call
            </button>
          </div>

          <div class="flex flex-col gap-3">
            ${sessions.slice(0, 3).map(s => {
              const isCompleted = s.status === 'Completed' || s.category === 'completed';
              const isInProgress = s.status === 'In Progress';
              const chipClass = isCompleted ? 'badge--blue' : isInProgress ? 'badge--amber' : s.status === 'Confirmed' ? 'badge--emerald' : 'badge--gray';

              return `
                <div class="session-entry-card" style="margin-bottom:0;">
                  <div class="session-entry-card__top">
                    <div class="session-entry-card__date">
                      📅 ${s.date} · ⏰ ${s.time}
                    </div>
                    <span class="badge ${chipClass}">● ${s.status.toUpperCase()}</span>
                  </div>
                  <div style="font-size:var(--text-sm);font-weight:700;color:var(--text-primary);margin-bottom:2px;">
                    Client: <strong>${s.clientName}</strong> · ${s.type}
                  </div>
                  <div class="session-entry-card__topic">
                    🎯 <strong>Agenda:</strong> ${s.topic}
                  </div>
                  <div style="display:flex;gap:var(--space-2);margin-top:var(--space-2);flex-wrap:wrap;align-items:center;">
                    ${!isCompleted ? `
                      <button class="btn btn--primary btn--sm" onclick="Dashboard.launchVideoSession('${s.id}')" style="display:inline-flex;align-items:center;justify-content:center;gap:4px;">
                        ${Components.icon('video')} ${isInProgress ? 'Rejoin Session' : 'Start Session'}
                      </button>
                    ` : ''}
                    ${(s.recording || FitTrackData.getSessionRecording(s.id)) ? `
                      <button class="btn btn--secondary btn--sm" onclick="Dashboard.openSavedRecordingViewer('${s.id}')" style="display:inline-flex;align-items:center;gap:4px;color:#38BDF8;border-color:#38BDF8;background:rgba(56,189,248,0.1);">
                        🎥 View Recording
                      </button>
                    ` : ''}
                    <button class="btn btn--secondary btn--sm" onclick="Dashboard.showSessionDetails('${s.id}')" style="display:inline-flex;align-items:center;gap:4px;">
                      View Details
                    </button>
                    <button class="btn btn--secondary btn--sm" onclick="Dashboard.openRescheduleModal('${s.id}')" style="display:inline-flex;align-items:center;gap:4px;">
                      Reschedule
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>

      <!-- Recent Client Progress Submissions for Feedback -->
      <div class="card card--flat mb-6">
        <div class="card__header">
          <div>
            <span class="dashboard-highlight-card__tag">5. CLIENT PROGRESS AUDIT</span>
            <h2 class="card__title" style="display:flex;align-items:center;gap:var(--space-2);margin-top:2px;">
              ${Components.icon('progress')} Recent Client Workout & Nutrition Logs
            </h2>
            <p class="card__subtitle">Review incoming progress entries and send corrective coaching feedback</p>
          </div>
          <button class="btn btn--secondary btn--sm" onclick="Dashboard.navigate('trainer_review_progress')">
            Open Progress Center →
          </button>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:var(--space-4);">
          ${reviews.slice(0, 3).map(r => `
            <div style="border:1px solid var(--border-light);border-radius:var(--radius-lg);padding:var(--space-4);background:var(--bg-surface);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);">
                <div style="display:flex;align-items:center;gap:var(--space-2);">
                  <div class="avatar avatar--xs avatar--placeholder" style="background:#059669;color:#fff;font-weight:700;">${r.clientInitials}</div>
                  <strong style="font-size:var(--text-sm);">${r.clientName}</strong>
                </div>
                <span class="badge ${r.coachStatus.includes('Approved') ? 'badge--emerald' : 'badge--amber'}">${r.coachStatus}</span>
              </div>
              <p style="font-size:var(--text-xs);color:var(--text-secondary);background:var(--bg-surface-hover);padding:var(--space-2);border-radius:var(--radius-sm);margin-bottom:var(--space-2);">
                "${r.loggedEntry}"
              </p>
              <div style="font-size:11px;color:var(--color-primary);font-weight:600;margin-bottom:var(--space-3);">
                📊 Result: ${r.weightChange} (${r.compliance})
              </div>
              <button class="btn btn--secondary btn--sm" style="width:100%;font-size:11px;" onclick="Dashboard.navigate('trainer_review_progress')">
                ${Components.icon('edit')} Audit & Send Feedback
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /* ── 2. TRAINER PUBLIC PROFILE (MY PROFILE) ── */
  renderTrainerPublicProfileView() {
    const t = FitTrackData.trainerProfile;

    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">${Components.icon('profile')} My Trainer Profile</h1>
          <p class="view-subtitle">Manage your public bio, certifications, hourly rates, specialties, and storefront presentation</p>
        </div>
        <div style="display:flex;gap:var(--space-2);">
          <button class="btn btn--secondary" onclick="Dashboard.previewPublicProfileModal()">
            👁️ Preview Public Profile
          </button>
          <button class="btn btn--primary" onclick="Dashboard.handleSavePublicProfile()">
            ${Components.icon('check')} Save & Update Profile
          </button>
        </div>
      </div>

      <div class="profile-layout">
        <!-- Live Public Card Preview -->
        <div class="card card--flat profile-card-summary">
          <div class="profile-card__avatar-lg" style="background:linear-gradient(135deg, #059669, #047857);">${t.avatarInitials}</div>
          <h3 style="font-size:var(--text-xl);font-weight:800;color:var(--text-primary);">${t.name}</h3>
          <p style="font-size:var(--text-xs);color:var(--color-emerald-700);font-weight:700;margin-top:2px;">${t.title}</p>
          <div class="profile-stat-badge">⭐ ${t.rating} (${t.reviewsCount} Verified Reviews) · ${t.experienceYears}+ Years Exp</div>

          <div class="bmi-meter-box" style="text-align:center;margin-top:var(--space-4);">
            <div style="font-size:var(--text-xs);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;">HOURLY 1-ON-1 RATE</div>
            <div class="bmi-meter-box__value">$${t.ratePerHour} <span style="font-size:var(--text-sm);font-weight:400;color:var(--text-muted);">/ 60 min session</span></div>
          </div>

          <div style="margin-top:var(--space-4);text-align:left;">
            <div style="font-size:var(--text-xs);font-weight:700;color:var(--text-muted);margin-bottom:6px;text-transform:uppercase;">COACHING SPECIALTIES</div>
            <div style="display:flex;gap:4px;flex-wrap:wrap;">
              ${t.specialties.map(s => `<span class="trainer-tag">${s}</span>`).join('')}
            </div>
          </div>

          <div style="margin-top:var(--space-4);text-align:left;font-size:var(--text-xs);">
            <div style="font-weight:700;color:var(--text-muted);margin-bottom:4px;text-transform:uppercase;">AVAILABLE TIMINGS</div>
            <div style="color:var(--text-primary);">${t.availableTimings}</div>
          </div>
        </div>

        <!-- Edit Form -->
        <div class="card card--flat">
          <h3 class="card__title mb-4">Public Profile Information</h3>
          <form id="form-public-profile" onsubmit="event.preventDefault(); Dashboard.handleSavePublicProfile();">
            <div class="profile-form-grid">
              <div class="form-group">
                <label class="form-label" for="tp-name">Display Name</label>
                <input type="text" class="form-input" id="tp-name" value="${t.name}" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="tp-title">Professional Title</label>
                <input type="text" class="form-input" id="tp-title" value="${t.title}" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="tp-rate">Session Rate ($ / hour)</label>
                <input type="number" class="form-input" id="tp-rate" value="${t.ratePerHour}" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="tp-exp">Years of Experience</label>
                <input type="number" class="form-input" id="tp-exp" value="${t.experienceYears}" required>
              </div>
            </div>

            <div class="form-group mt-4">
              <label class="form-label" for="tp-style">Primary Training Style & Methodology</label>
              <input type="text" class="form-input" id="tp-style" value="${t.trainingStyle}" required>
            </div>

            <div class="form-group mt-4">
              <label class="form-label" for="tp-bio">Detailed Coach Bio & Philosophy</label>
              <textarea class="form-textarea" id="tp-bio" rows="4" required>${t.bio}</textarea>
            </div>

            <div class="form-group mt-4">
              <label class="form-label" for="tp-specialties">Specialties (Comma Separated)</label>
              <input type="text" class="form-input" id="tp-specialties" value="${t.specialties.join(', ')}">
            </div>

            <div style="margin-top:var(--space-6);display:flex;justify-content:flex-end;gap:var(--space-3);">
              <button type="submit" class="btn btn--primary">Update & Publish Profile</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  /* ── 3. QUALIFICATIONS & CERTIFICATIONS ── */
  renderTrainerQualificationsView() {
    const quals = FitTrackData.trainerProfile.qualifications;
    const verifiedCount = quals.filter(q => q.status === 'Verified').length;
    const pendingCount = quals.filter(q => q.status.includes('Pending')).length;

    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">${Components.icon('shield')} Qualifications & Certifications</h1>
          <p class="view-subtitle">Manage your professional certifications, degrees, and specialized coaching credentials</p>
        </div>
      </div>

      <!-- Verification Overview Bar -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:var(--space-3);margin-bottom:var(--space-6);">
        <div style="background:#ECFDF5;border:1px solid #A7F3D0;border-radius:var(--radius-lg);padding:var(--space-4);">
          <div style="font-size:var(--text-xs);color:#065F46;font-weight:700;text-transform:uppercase;">Active Badges</div>
          <div style="font-size:var(--text-2xl);font-weight:800;color:#059669;margin-top:2px;">${quals.length} Credentials</div>
        </div>
        <div style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:var(--radius-lg);padding:var(--space-4);">
          <div style="font-size:var(--text-xs);color:#1E40AF;font-weight:700;text-transform:uppercase;">Profile Credibility</div>
          <div style="font-size:var(--text-2xl);font-weight:800;color:#2563EB;margin-top:2px;">100% Verified</div>
        </div>
        <div style="background:#FDF2F8;border:1px solid #FBCFE8;border-radius:var(--radius-lg);padding:var(--space-4);">
          <div style="font-size:var(--text-xs);color:#9D174D;font-weight:700;text-transform:uppercase;">Accreditation Status</div>
          <div style="font-size:var(--text-sm);font-weight:700;color:#DB2777;margin-top:4px;">FitTrack Master Coach Certified</div>
        </div>
      </div>

      <div class="two-column">
        <!-- Submit Qualification Form -->
        <div class="card card--flat">
          <h3 class="card__title mb-4">Add New Credential</h3>
          <form id="form-submit-qual" onsubmit="event.preventDefault(); Dashboard.handleSubmitQualification();">
            <div class="form-group">
              <label class="form-label" for="qual-title">Certification / Degree Title</label>
              <input type="text" class="form-input" id="qual-title" placeholder="e.g. Certified Functional Strength Coach (CFSC)" required>
            </div>

            <div class="form-group">
              <label class="form-label" for="qual-issuer">Issuing Body / Accredited Institute</label>
              <input type="text" class="form-input" id="qual-issuer" placeholder="e.g. NSCA, ACE, ACSM, ISSA, NASM" required>
            </div>

            <div class="profile-form-grid">
              <div class="form-group">
                <label class="form-label" for="qual-year">Year Awarded</label>
                <input type="number" class="form-input" id="qual-year" value="2026" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="qual-id">Credential / License ID</label>
                <input type="text" class="form-input" id="qual-id" placeholder="e.g. CSCS-2026-99881">
              </div>
            </div>

            <div class="form-group mt-4">
              <label class="form-label">Upload Certificate Document (PDF / JPG)</label>
              <div style="border:2px dashed var(--border-light);border-radius:var(--radius-md);padding:var(--space-6);text-align:center;background:var(--bg-surface-hover);cursor:pointer;" onclick="App.showToast('info', 'File Selector', 'Demo: Certificate document selected.');">
                <div style="font-size:var(--text-2xl);margin-bottom:4px;">📄</div>
                <div style="font-size:var(--text-sm);font-weight:600;color:var(--color-primary);">Click to upload certificate document</div>
                <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:2px;">PDF, PNG, JPG up to 10MB</div>
              </div>
            </div>

            <button type="submit" class="btn btn--primary mt-4" style="width:100%;">
              ${Components.icon('checkCircle')} Add Credential to Public Profile
            </button>
          </form>
        </div>

        <!-- Verified Qualifications List -->
        <div class="card card--flat">
          <div class="card__header">
            <h3 class="card__title">Verified Credentials</h3>
            <span class="badge badge--emerald">${quals.length} Total</span>
          </div>
          <p class="card__subtitle mb-4">Official accredited credentials displayed on your public trainer profile</p>

          <div class="flex flex-col gap-3" id="qual-list">
            ${quals.map(q => `
              <div style="border:1px solid var(--border-light);border-radius:var(--radius-md);padding:var(--space-3) var(--space-4);background:var(--bg-surface);display:flex;justify-content:space-between;align-items:center;gap:var(--space-3);">
                <div style="display:flex;align-items:center;gap:var(--space-3);">
                  <div style="width:36px;height:36px;border-radius:var(--radius-md);background:${q.status === 'Verified' ? '#ECFDF5' : '#FFFBEB'};color:${q.status === 'Verified' ? '#059669' : '#D97706'};display:flex;align-items:center;justify-content:center;font-weight:700;">
                    ${q.status === 'Verified' ? '✓' : '⏳'}
                  </div>
                  <div>
                    <div style="font-weight:700;font-size:var(--text-sm);">${q.name}</div>
                    <div style="font-size:var(--text-xs);color:var(--text-muted);">${q.issuer} · Awarded ${q.year}</div>
                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:var(--space-2);">
                  <span class="badge ${q.status === 'Verified' ? 'badge--emerald' : 'badge--amber'}">${q.status}</span>
                  <button class="btn btn--secondary btn--sm" style="color:#EF4444;border-color:rgba(239,68,68,0.3);padding:2px 8px;font-size:11px;" onclick="Dashboard.deleteQualification('${q.id}')" title="Remove credential">✕</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  /* ── 4. DEFINE AVAILABILITY ── */
  renderTrainerAvailabilityView() {
    const avail = FitTrackData.trainerAvailability;

    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">${Components.icon('clock')} Define Availability Schedule</h1>
          <p class="view-subtitle">Set your weekly coaching hours, session durations, break times, and client appointment capacities</p>
        </div>
        <button class="btn btn--primary" onclick="Dashboard.handleSaveAvailability()">
          ${Components.icon('check')} Save Schedule
        </button>
      </div>

      <div class="two-column">
        <!-- Weekly Days Schedule -->
        <div class="card card--flat">
          <h3 class="card__title mb-4">Weekly Working Hours</h3>
          <div class="flex flex-col gap-3" id="availability-days-list">
            ${avail.days.map(d => `
              <div style="border:1px solid var(--border-light);border-radius:var(--radius-md);padding:var(--space-3) var(--space-4);display:flex;justify-content:space-between;align-items:center;background:${d.enabled ? 'var(--bg-surface)' : 'var(--bg-surface-hover)'};">
                <div style="display:flex;align-items:center;gap:var(--space-3);">
                  <input type="checkbox" id="avail-check-${d.day}" ${d.enabled ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--color-primary);" onchange="Dashboard.toggleDayAvailability('${d.day}', this.checked)">
                  <label for="avail-check-${d.day}" style="font-weight:700;font-size:var(--text-sm);">${d.day}</label>
                </div>
                <div style="display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-xs);">
                  ${d.enabled ? `
                    <span class="badge badge--emerald">${d.start} – ${d.end}</span>
                    <span style="color:var(--text-muted);">(${d.slots.length} slots)</span>
                  ` : `
                    <span class="badge badge--gray">Unavailable / Rest</span>
                  `}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Slot & Capacity Configuration -->
        <div class="card card--flat">
          <h3 class="card__title mb-4">Booking Parameters</h3>
          <form onsubmit="event.preventDefault(); Dashboard.handleSaveAvailability();">
            <div class="form-group">
              <label class="form-label" for="avail-duration">Default Session Duration</label>
              <select class="form-input" id="avail-duration">
                <option value="45">45 Minutes</option>
                <option value="60" selected>60 Minutes (Standard)</option>
                <option value="90">90 Minutes (Comprehensive)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="avail-break">Buffer Time Between Sessions</label>
              <select class="form-input" id="avail-break">
                <option value="10">10 Minutes</option>
                <option value="15" selected>15 Minutes</option>
                <option value="30">30 Minutes</option>
              </select>
            </div>

            <div class="profile-form-grid">
              <div class="form-group">
                <label class="form-label" for="avail-max-day">Max Sessions / Day</label>
                <input type="number" class="form-input" id="avail-max-day" value="${avail.maxSessionsPerDay}">
              </div>
              <div class="form-group">
                <label class="form-label" for="avail-capacity">Max Client Capacity</label>
                <input type="number" class="form-input" id="avail-capacity" value="${avail.maxClientsCapacity}">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="avail-tz">Timezone</label>
              <input type="text" class="form-input" id="avail-tz" value="${avail.timezone}" readonly>
            </div>

            <button type="submit" class="btn btn--primary mt-4" style="width:100%;">Commit Availability</button>
          </form>
        </div>
      </div>
    `;
  },

  /* ── 5. MY PLANS (CREATE & MANAGE PLANS DIRECTLY) ── */
  /* ── 5. TRAINER PUBLISHED PROGRAMMES (DURATION-BASED STOREFRONT) ── */
  renderTrainerPlansView() {
    const plans = FitTrackData.trainerPublishedPlans || [];

    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">${Components.icon('plans')} My Fitness Programmes & Pricing</h1>
          <p class="view-subtitle">Create complete duration-based programmes, set your own prices in ₹, and publish directly to members</p>
        </div>
      </div>

      <div class="two-column">
        <!-- Create Programme Form -->
        <div class="card card--flat">
          <h3 class="card__title mb-4">Create New Duration-Based Programme</h3>
          <form id="form-create-plan" onsubmit="event.preventDefault(); Dashboard.handleCreatePlan();">
            <div class="form-group">
              <label class="form-label" for="new-plan-title">Programme Name <span class="required">*</span></label>
              <input type="text" class="form-input" id="new-plan-title" placeholder="e.g. 3 Months Fat Loss & Muscle Sculpt" required>
            </div>

            <div class="profile-form-grid">
              <div class="form-group">
                <label class="form-label" for="new-plan-category">Programme Category <span class="required">*</span></label>
                <select class="form-input" id="new-plan-category">
                  <option value="Weight Loss">Weight Loss</option>
                  <option value="Muscle Gain">Muscle Gain / Hypertrophy</option>
                  <option value="Strength & Conditioning">Strength & Conditioning</option>
                  <option value="HIIT & Fat Loss">HIIT & Fat Loss</option>
                  <option value="Yoga & Mobility">Yoga & Mobility</option>
                  <option value="General Fitness">General Fitness & Longevity</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="new-plan-dur">Programme Duration <span class="required">*</span></label>
                <select class="form-input" id="new-plan-dur">
                  <option value="1 Month">1 Month</option>
                  <option value="3 Months" selected>3 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="12 Months">12 Months</option>
                </select>
              </div>
            </div>

            <div class="form-group mt-3">
              <label class="form-label" for="new-plan-price">Total Programme Price (₹) <span class="required">*</span></label>
              <div style="position:relative;">
                <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-weight:700;color:var(--text-muted);font-size:var(--text-base);">₹</span>
                <input type="number" class="form-input" id="new-plan-price" placeholder="e.g. 2999" min="1" step="1" style="padding-left:30px;" required>
              </div>
              <small style="color:var(--text-muted);font-size:11px;margin-top:4px;display:block;">You set your own price. FitTrack charges ₹0 platform fee. You receive 100% of the listed price.</small>
            </div>

            <div class="form-group mt-3">
              <label class="form-label" for="new-plan-workout">Workout Programme Details</label>
              <input type="text" class="form-input" id="new-plan-workout" placeholder="e.g. 5-Day Push/Pull/Legs Split, Form Analysis, Progressive Loading" required>
            </div>

            <div class="form-group mt-3">
              <label class="form-label" for="new-plan-diet">Diet & Nutrition Guidance</label>
              <input type="text" class="form-input" id="new-plan-diet" placeholder="e.g. Custom Macro Blueprint with Bi-weekly Adjustments" required>
            </div>

            <div class="form-group mt-3">
              <label class="form-label" for="new-plan-benefits">Features & Benefits (Comma separated)</label>
              <input type="text" class="form-input" id="new-plan-benefits" placeholder="e.g. Direct WhatsApp Chat, Video Form Audits, Progress Reviews" required>
            </div>

            <div class="form-group mt-3">
              <label class="form-label" for="new-plan-desc">Programme Description & Methodology</label>
              <textarea class="form-textarea" id="new-plan-desc" rows="3" placeholder="Outline goals, target audience, and training philosophy..." required></textarea>
            </div>

            <div style="background:#ECFDF5;border:1px solid #A7F3D0;padding:var(--space-3);border-radius:var(--radius-md);margin-top:var(--space-3);font-size:var(--text-xs);color:#065F46;">
              ⚡ <strong>Direct Self-Service Publishing:</strong> This complete duration-based programme will immediately appear on your profile in "Find Trainers" for members to view and purchase.
            </div>

            <button type="submit" class="btn btn--primary mt-4" style="width:100%;">
              ${Components.icon('checkCircle')} Publish Programme
            </button>
          </form>
        </div>

        <!-- Published & Draft Programmes -->
        <div class="card card--flat">
          <div class="card__header">
            <h3 class="card__title">My Active Programmes</h3>
            <span class="badge badge--emerald">${plans.filter(p => p.status === 'Published').length} Active Live</span>
          </div>
          <div class="flex flex-col gap-4" id="trainer-plans-list">
            ${plans.map(p => `
              <div style="border:1px solid var(--border-light);border-radius:var(--radius-lg);padding:var(--space-4);background:var(--bg-surface);">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                  <div>
                    <span class="badge ${p.status === 'Published' ? 'badge--emerald' : 'badge--gray'}">${p.status}</span>
                    <h4 style="font-weight:700;font-size:var(--text-base);margin-top:6px;">${p.title}</h4>
                    <div style="font-size:var(--text-xs);color:var(--text-muted);">${p.category || 'Fitness'} · ${p.duration} · <strong style="color:var(--color-primary);font-size:var(--text-sm);">${p.formattedPrice || '₹' + p.price}</strong></div>
                  </div>
                  <div style="text-align:right;">
                    <span style="font-weight:700;color:var(--color-primary);font-size:var(--text-sm);">${p.enrolledCount} Enrolled</span>
                  </div>
                </div>
                <p style="font-size:var(--text-xs);color:var(--text-secondary);margin-top:8px;line-height:var(--leading-relaxed);">${p.description}</p>
                <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--border-light);padding-top:var(--space-2);margin-top:var(--space-3);font-size:11px;">
                  <span style="color:var(--text-muted);">Published: ${p.publishedDate || 'Active'}</span>
                  <div style="display:flex;gap:var(--space-2);">
                    <button class="btn btn--secondary btn--sm" style="font-size:11px;padding:3px 8px;" onclick="Dashboard.togglePlanPublishStatus('${p.id}')">
                      ${p.status === 'Published' ? 'Unpublish' : 'Publish Live'}
                    </button>
                    <button class="btn btn--secondary btn--sm" style="font-size:11px;padding:3px 8px;" onclick="Dashboard.openEditPlanModal('${p.id}')">Edit</button>
                    <button class="btn btn--secondary btn--sm" style="font-size:11px;padding:3px 8px;color:#EF4444;border-color:rgba(239,68,68,0.3);" onclick="Dashboard.deleteTrainerPlan('${p.id}')">Delete</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  /* ── 6. PLAN CATALOG & DIRECT PUBLISHING STOREFRONT ── */
  renderTrainerPlanApprovalView() {
    return this.renderTrainerPlansView();
  },

  /* ── 7. CLIENT OVERVIEW (MY ACTIVE CLIENTS) ── */
  renderTrainerClientsView() {
    const allClients = FitTrackData.activeClients || [];
    const totalCount = allClients.length;
    const activeCount = allClients.filter(c => c.status === 'Active').length;
    const pendingCount = allClients.filter(c => c.status === 'Pending').length;
    const inactiveCount = allClients.filter(c => c.status === 'Inactive').length;

    // Filter by Search, Status, Goal
    let filtered = allClients.filter(c => {
      // Search query
      if (this.clientsSearchQuery) {
        const q = this.clientsSearchQuery.toLowerCase();
        const matchesName = (c.name || '').toLowerCase().includes(q);
        const matchesGoal = (c.goal || '').toLowerCase().includes(q);
        const matchesPlan = (c.plan || '').toLowerCase().includes(q);
        const matchesEmail = (c.email || '').toLowerCase().includes(q);
        if (!matchesName && !matchesGoal && !matchesPlan && !matchesEmail) return false;
      }
      // Status filter
      if (this.clientsStatusFilter && this.clientsStatusFilter !== 'all') {
        if (c.status.toLowerCase() !== this.clientsStatusFilter.toLowerCase()) return false;
      }
      // Goal category filter
      if (this.clientsGoalFilter && this.clientsGoalFilter !== 'all') {
        if (c.goalCategory !== this.clientsGoalFilter) return false;
      }
      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (this.clientsSortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (this.clientsSortBy === 'attendance') {
        return (b.sessionAttendance || 0) - (a.sessionAttendance || 0);
      } else if (this.clientsSortBy === 'nextSession') {
        return (a.nextSession || '').localeCompare(b.nextSession || '');
      } else {
        // default: progress high to low
        return (b.overallProgress || 0) - (a.overallProgress || 0);
      }
    });

    return `
      <div class="view-header">
        <div>
          <div style="display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap;">
            <h1 class="view-title">${Components.icon('trainers')} My Clients</h1>
            <span class="badge badge--emerald" style="font-size:var(--text-xs);font-weight:800;padding:4px 10px;">${totalCount} Total</span>
          </div>
          <p class="view-subtitle">Monitor individual client adherence, fitness goals, workout volumes, and schedule coaching interventions</p>
        </div>
        <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
          <button class="btn btn--secondary" onclick="Dashboard.navigate('trainer_schedule_sessions')">
            ${Components.icon('sessions')} Schedule Session
          </button>
          <button class="btn btn--primary" onclick="Dashboard.navigate('trainer_assign_activities')">
            ${Components.icon('plus')} Assign Activities
          </button>
        </div>
      </div>

      <!-- Quick KPI Strip -->
      <div class="grid grid-4 mb-6">
        ${Components.metricCard({ label: 'Total Enrolled', value: `${totalCount}`, detail: 'Coaching capacity: 30', icon: 'trainers', colorClass: 'emerald', delay: 1 })}
        ${Components.metricCard({ label: 'Active Adherents', value: `${activeCount}`, detail: 'High weekly engagement', icon: 'checkCircle', colorClass: 'blue', delay: 2 })}
        ${Components.metricCard({ label: 'Pending Onboarding', value: `${pendingCount}`, detail: 'Intake / consult awaited', icon: 'clock', colorClass: 'amber', delay: 3 })}
        ${Components.metricCard({ label: 'Avg Progress Rate', value: '82%', detail: '+4.5% vs last month', icon: 'progress', colorClass: 'purple', delay: 4 })}
      </div>

      <!-- Filter & Search Toolbar -->
      <div class="card card--flat mb-6" style="padding:var(--space-4);">
        <div style="display:flex;flex-direction:column;gap:var(--space-3);">
          
          <!-- Top Row: Search and Selects -->
          <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;align-items:center;justify-content:space-between;">
            <!-- Search Bar -->
            <div style="position:relative;flex:1;min-width:260px;">
              <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none;">
                ${Icons.search}
              </span>
              <input type="text" 
                     class="form-input" 
                     placeholder="Search clients by name, goal, plan, or email..." 
                     value="${this.clientsSearchQuery || ''}"
                     oninput="Dashboard.handleClientsSearch(this.value)"
                     style="padding-left:36px;width:100%;height:40px;border-radius:var(--radius-lg);"
                     aria-label="Search clients">
            </div>

            <!-- Goal Category Filter -->
            <div style="min-width:180px;">
              <select class="form-input" 
                      style="height:40px;border-radius:var(--radius-lg);" 
                      onchange="Dashboard.handleClientsGoalFilter(this.value)"
                      aria-label="Filter by goal category">
                <option value="all" ${this.clientsGoalFilter === 'all' ? 'selected' : ''}>All Goal Categories</option>
                <option value="weight" ${this.clientsGoalFilter === 'weight' ? 'selected' : ''}>Weight Management</option>
                <option value="hypertrophy" ${this.clientsGoalFilter === 'hypertrophy' ? 'selected' : ''}>Hypertrophy & Strength</option>
                <option value="endurance" ${this.clientsGoalFilter === 'endurance' ? 'selected' : ''}>Endurance & Mobility</option>
              </select>
            </div>

            <!-- Sort By Selector -->
            <div style="min-width:170px;">
              <select class="form-input" 
                      style="height:40px;border-radius:var(--radius-lg);" 
                      onchange="Dashboard.handleClientsSort(this.value)"
                      aria-label="Sort clients by">
                <option value="progress" ${this.clientsSortBy === 'progress' ? 'selected' : ''}>Highest Progress</option>
                <option value="attendance" ${this.clientsSortBy === 'attendance' ? 'selected' : ''}>Best Attendance</option>
                <option value="name" ${this.clientsSortBy === 'name' ? 'selected' : ''}>Client Name (A–Z)</option>
                <option value="nextSession" ${this.clientsSortBy === 'nextSession' ? 'selected' : ''}>Next Session Date</option>
              </select>
            </div>
          </div>

          <!-- Bottom Row: Status Filter Tabs -->
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;align-items:center;border-top:1px solid var(--border-light);padding-top:var(--space-3);">
            <span style="font-size:var(--text-xs);font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-right:4px;">Status:</span>
            <button class="filter-btn ${this.clientsStatusFilter === 'all' ? 'active' : ''}" onclick="Dashboard.handleClientsStatusFilter('all')">
              All (${totalCount})
            </button>
            <button class="filter-btn ${this.clientsStatusFilter === 'active' ? 'active' : ''}" onclick="Dashboard.handleClientsStatusFilter('active')">
              Active (${activeCount})
            </button>
            <button class="filter-btn ${this.clientsStatusFilter === 'pending' ? 'active' : ''}" onclick="Dashboard.handleClientsStatusFilter('pending')">
              Pending (${pendingCount})
            </button>
            <button class="filter-btn ${this.clientsStatusFilter === 'inactive' ? 'active' : ''}" onclick="Dashboard.handleClientsStatusFilter('inactive')">
              Inactive (${inactiveCount})
            </button>
            
            ${(this.clientsSearchQuery || this.clientsStatusFilter !== 'all' || this.clientsGoalFilter !== 'all') ? `
              <button class="btn btn--secondary btn--sm" style="margin-left:auto;font-size:11px;padding:4px 10px;" onclick="Dashboard.resetClientsFilters()">
                ✕ Reset Filters
              </button>
            ` : ''}
          </div>

        </div>
      </div>

      <!-- Clients List Container (Grid + Pagination) -->
      <div id="trainer-clients-container">
        ${this.renderClientsGridAndPagination(filtered)}
      </div>
    `;
  },

  /* ── Render Clients Grid & Pagination Sub-component ── */
  renderClientsGridAndPagination(clientsList = null) {
    if (!clientsList) {
      const allClients = FitTrackData.activeClients || [];
      clientsList = allClients.filter(c => {
        if (this.clientsSearchQuery) {
          const q = this.clientsSearchQuery.toLowerCase();
          const matchesName = (c.name || '').toLowerCase().includes(q);
          const matchesGoal = (c.goal || '').toLowerCase().includes(q);
          const matchesPlan = (c.plan || '').toLowerCase().includes(q);
          const matchesEmail = (c.email || '').toLowerCase().includes(q);
          if (!matchesName && !matchesGoal && !matchesPlan && !matchesEmail) return false;
        }
        if (this.clientsStatusFilter && this.clientsStatusFilter !== 'all') {
          if (c.status.toLowerCase() !== this.clientsStatusFilter.toLowerCase()) return false;
        }
        if (this.clientsGoalFilter && this.clientsGoalFilter !== 'all') {
          if (c.goalCategory !== this.clientsGoalFilter) return false;
        }
        return true;
      });

      clientsList.sort((a, b) => {
        if (this.clientsSortBy === 'name') return a.name.localeCompare(b.name);
        if (this.clientsSortBy === 'attendance') return (b.sessionAttendance || 0) - (a.sessionAttendance || 0);
        if (this.clientsSortBy === 'nextSession') return (a.nextSession || '').localeCompare(b.nextSession || '');
        return (b.overallProgress || 0) - (a.overallProgress || 0);
      });
    }

    const totalFiltered = clientsList.length;

    // Empty State
    if (totalFiltered === 0) {
      return `
        <div class="card card--flat" style="text-align:center;padding:var(--space-10) var(--space-6);margin-top:var(--space-4);">
          <div style="width:64px;height:64px;border-radius:var(--radius-full);background:var(--bg-surface-hover);display:flex;align-items:center;justify-content:center;margin:0 auto var(--space-4);color:var(--text-muted);">
            ${Icons.trainers}
          </div>
          <h3 style="font-size:var(--text-lg);font-weight:700;color:var(--text-primary);margin-bottom:var(--space-2);">No Clients Found</h3>
          <p style="font-size:var(--text-sm);color:var(--text-muted);max-width:400px;margin:0 auto var(--space-4);">
            No clients match "${this.clientsSearchQuery || 'the selected criteria'}". Try adjusting your filters or search keywords.
          </p>
          <button class="btn btn--secondary btn--sm" onclick="Dashboard.resetClientsFilters()">
            Reset All Filters
          </button>
        </div>
      `;
    }

    // Pagination calculations
    const perPage = this.clientsPerPage || 8;
    const totalPages = Math.ceil(totalFiltered / perPage);
    const currentPage = Math.min(Math.max(1, this.clientsCurrentPage || 1), totalPages);
    const startIndex = (currentPage - 1) * perPage;
    const endIndex = Math.min(startIndex + perPage, totalFiltered);
    const pageItems = clientsList.slice(startIndex, endIndex);

    return `
      <!-- Cards Grid -->
      <div class="trainers-grid" style="grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));gap:var(--space-5);">
        ${pageItems.map(c => `
          <div class="trainer-card" style="padding:var(--space-5);border-radius:var(--radius-xl);display:flex;flex-direction:column;justify-content:space-between;">
            
            <div>
              <!-- Card Top Header -->
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-3);">
                <div style="display:flex;align-items:center;gap:var(--space-3);">
                  <div class="trainer-card__avatar" style="background:${c.avatarBg};width:46px;height:46px;font-size:var(--text-base);box-shadow:var(--shadow-sm);">
                    ${c.initials}
                  </div>
                  <div>
                    <h3 style="font-weight:800;font-size:var(--text-base);color:var(--text-primary);margin:0;line-height:1.2;">
                      ${c.name}
                    </h3>
                    <span style="font-size:11px;color:var(--color-primary);font-weight:700;">
                      ${c.plan}
                    </span>
                  </div>
                </div>

                <span class="badge badge--${c.statusClass}" style="font-size:10px;font-weight:800;text-transform:uppercase;">
                  ● ${c.status}
                </span>
              </div>

              <!-- Goal & Weight Box -->
              <div style="background:var(--bg-surface-hover);border-radius:var(--radius-lg);padding:var(--space-3);font-size:var(--text-xs);margin-bottom:var(--space-3);border:1px solid var(--border-light);">
                <div style="color:var(--text-primary);font-weight:600;margin-bottom:4px;display:flex;align-items:center;gap:4px;">
                  🎯 <span>${c.goal}</span>
                </div>
                <div style="color:var(--text-muted);display:flex;justify-content:space-between;">
                  <span>⚖️ Weight: <strong>${c.currentWeight}</strong></span>
                  <span>Target: <strong style="color:var(--color-primary);">${c.targetWeight}</strong></span>
                </div>
              </div>

              <!-- Progress Bar -->
              <div style="margin-bottom:var(--space-3);">
                <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;font-weight:700;margin-bottom:4px;">
                  <span style="color:var(--text-secondary);">Goal Adherence</span>
                  <span style="color:var(--color-primary);">${c.overallProgress}%</span>
                </div>
                <div style="background:var(--border-light);height:7px;border-radius:var(--radius-full);overflow:hidden;">
                  <div style="width:${c.overallProgress}%;height:100%;background:linear-gradient(90deg, #10B981, #059669);border-radius:var(--radius-full);transition:width 0.4s ease;"></div>
                </div>
              </div>

              <!-- Mini Adherence Matrix -->
              <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:4px;text-align:center;margin-bottom:var(--space-3);">
                <div style="background:var(--bg-surface);border:1px solid var(--border-light);padding:5px 2px;border-radius:var(--radius-sm);">
                  <div style="font-size:9px;font-weight:700;color:var(--text-muted);">WORKOUTS</div>
                  <strong style="font-size:var(--text-xs);color:var(--color-emerald-600);">${c.workoutCompletion}%</strong>
                </div>
                <div style="background:var(--bg-surface);border:1px solid var(--border-light);padding:5px 2px;border-radius:var(--radius-sm);">
                  <div style="font-size:9px;font-weight:700;color:var(--text-muted);">DIET</div>
                  <strong style="font-size:var(--text-xs);color:var(--color-blue-600);">${c.dietAdherence}%</strong>
                </div>
                <div style="background:var(--bg-surface);border:1px solid var(--border-light);padding:5px 2px;border-radius:var(--radius-sm);">
                  <div style="font-size:9px;font-weight:700;color:var(--text-muted);">ATTENDANCE</div>
                  <strong style="font-size:var(--text-xs);color:var(--color-purple-600);">${c.sessionAttendance}%</strong>
                </div>
              </div>

              <!-- Next Session / Activity Pill -->
              <div style="font-size:11px;color:var(--text-muted);display:flex;align-items:center;gap:6px;margin-bottom:var(--space-3);background:rgba(16, 185, 129, 0.06);padding:6px 8px;border-radius:var(--radius-md);">
                <span>📅</span>
                <span style="color:var(--text-primary);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  ${c.nextSession || 'No session booked'}
                </span>
              </div>
            </div>

            <!-- Card Actions Footer -->
            <div style="display:flex;gap:var(--space-2);border-top:1px solid var(--border-light);padding-top:var(--space-3);margin-top:var(--space-2);">
              <button class="btn btn--secondary btn--sm" style="flex:1;font-size:11px;padding:6px 4px;justify-content:center;" onclick="Dashboard.openClientDetailModal('${c.id}')" title="View complete client dossier">
                👁️ Profile
              </button>
              <button class="btn btn--secondary btn--sm" style="font-size:11px;padding:6px 8px;justify-content:center;" onclick="Dashboard.messageClient('${c.id}')" title="Chat with client">
                💬 Chat
              </button>
              <button class="btn btn--primary btn--sm" style="font-size:11px;padding:6px 8px;justify-content:center;" onclick="Dashboard.scheduleSessionForClient('${c.name}')" title="Book 1-on-1 session">
                📅 Schedule
              </button>
            </div>

          </div>
        `).join('')}
      </div>

      <!-- Pagination Footer -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:var(--space-6);padding:var(--space-4) 0;border-top:1px solid var(--border-light);flex-wrap:wrap;gap:var(--space-3);">
        <div style="font-size:var(--text-sm);color:var(--text-muted);">
          Showing <strong>${startIndex + 1}–${endIndex}</strong> of <strong>${totalFiltered}</strong> clients
        </div>

        ${totalPages > 1 ? `
          <div style="display:flex;gap:var(--space-1);align-items:center;">
            <button class="btn btn--secondary btn--sm" 
                    ${currentPage === 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}
                    onclick="Dashboard.handleClientsPage(${currentPage - 1})">
              Previous
            </button>
            
            ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
              <button class="btn btn--sm ${p === currentPage ? 'btn--primary' : 'btn--secondary'}" 
                      style="min-width:32px;padding:4px 8px;"
                      onclick="Dashboard.handleClientsPage(${p})">
                ${p}
              </button>
            `).join('')}

            <button class="btn btn--secondary btn--sm" 
                    ${currentPage === totalPages ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}
                    onclick="Dashboard.handleClientsPage(${currentPage + 1})">
              Next
            </button>
          </div>
        ` : ''}
      </div>
    `;
  },

  /* ── Trainer Clients Page Handlers ── */
  handleClientsSearch(query) {
    this.clientsSearchQuery = query || '';
    this.clientsCurrentPage = 1;
    this.renderClientsListOnly();
  },

  handleClientsStatusFilter(status) {
    this.clientsStatusFilter = status;
    this.clientsCurrentPage = 1;
    this.renderCurrentView();
  },

  handleClientsGoalFilter(category) {
    this.clientsGoalFilter = category;
    this.clientsCurrentPage = 1;
    this.renderClientsListOnly();
  },

  handleClientsSort(sortBy) {
    this.clientsSortBy = sortBy;
    this.renderClientsListOnly();
  },

  handleClientsPage(page) {
    this.clientsCurrentPage = page;
    this.renderClientsListOnly();
    const listEl = document.getElementById('trainer-clients-container');
    if (listEl) listEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  resetClientsFilters() {
    this.clientsSearchQuery = '';
    this.clientsStatusFilter = 'all';
    this.clientsGoalFilter = 'all';
    this.clientsSortBy = 'progress';
    this.clientsCurrentPage = 1;
    this.renderCurrentView();
  },

  renderClientsListOnly() {
    const container = document.getElementById('trainer-clients-container');
    if (container) {
      container.innerHTML = this.renderClientsGridAndPagination();
    } else {
      this.renderCurrentView();
    }
  },

  messageClient(clientId) {
    this.activeTrainerClientId = clientId;
    this.navigate('trainer_messages');
  },

  scheduleSessionForClient(clientName) {
    this.prefilledSessionClient = clientName;
    this.navigate('trainer_schedule_sessions');
  },

  openClientDetailModal(clientId) {
    const client = FitTrackData.activeClients.find(c => c.id === clientId);
    if (!client) return;

    let modal = document.getElementById('client-detail-modal-overlay');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'client-detail-modal-overlay';
      modal.className = 'modal-overlay';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-card" style="max-width:620px;width:100%;max-height:90vh;overflow-y:auto;position:relative;">
        <div class="modal-header" style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid var(--border-light);padding-bottom:var(--space-4);">
          <div style="display:flex;gap:var(--space-4);align-items:center;">
            <div class="trainer-card__avatar" style="background:${client.avatarBg};width:54px;height:54px;font-size:var(--text-lg);">${client.initials}</div>
            <div>
              <div style="display:flex;align-items:center;gap:8px;">
                <h2 style="font-size:var(--text-xl);font-weight:800;color:var(--text-primary);margin:0;">${client.name}</h2>
                <span class="badge badge--${client.statusClass}">● ${client.status}</span>
              </div>
              <div style="font-size:var(--text-xs);color:var(--color-primary);font-weight:700;margin-top:2px;">${client.plan} · Enrolled ${client.joinDate || 'Jan 2026'}</div>
            </div>
          </div>
          <button class="modal-close" onclick="Dashboard.closeClientDetailModal()" aria-label="Close modal" style="background:none;border:none;font-size:24px;cursor:pointer;color:var(--text-muted);line-height:1;">&times;</button>
        </div>

        <div class="modal-body" style="padding:var(--space-4) 0;display:flex;flex-direction:column;gap:var(--space-4);">
          <!-- Contact & Goal Row -->
          <div style="background:var(--bg-surface-hover);padding:var(--space-4);border-radius:var(--radius-lg);display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);font-size:var(--text-xs);">
            <div>📧 <strong>Email:</strong> <span style="color:var(--text-secondary);">${client.email || 'client@fittrack.com'}</span></div>
            <div>📱 <strong>Phone:</strong> <span style="color:var(--text-secondary);">${client.phone || '+91 98000 00000'}</span></div>
            <div style="grid-column:1/-1;">🎯 <strong>Primary Fitness Goal:</strong> <span style="color:var(--text-primary);font-weight:600;">${client.goal}</span></div>
            <div>⚖️ <strong>Current Weight:</strong> <span style="font-weight:700;color:var(--color-primary);">${client.currentWeight}</span></div>
            <div>🏁 <strong>Target Weight:</strong> <span style="font-weight:700;color:var(--color-primary);">${client.targetWeight}</span></div>
          </div>

          <!-- Overall Progress Bar -->
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:var(--text-xs);font-weight:700;">
              <span>Overall Goal Adherence & Progress</span>
              <span style="color:var(--color-primary);font-size:var(--text-sm);">${client.overallProgress}%</span>
            </div>
            <div class="progress-bar-bg" style="background:var(--border-light);height:10px;border-radius:var(--radius-full);overflow:hidden;">
              <div class="progress-bar-fill" style="width:${client.overallProgress}%;height:100%;background:linear-gradient(90deg, #10B981, #059669);border-radius:var(--radius-full);transition:width 0.6s ease;"></div>
            </div>
          </div>

          <!-- Adherence Breakdown 3 Cards -->
          <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:var(--space-3);text-align:center;">
            <div style="background:var(--bg-surface);border:1px solid var(--border-light);padding:var(--space-3);border-radius:var(--radius-md);">
              <div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Workouts Logged</div>
              <div style="font-size:var(--text-lg);font-weight:800;color:var(--color-emerald-600);margin-top:2px;">${client.workoutCompletion}%</div>
            </div>
            <div style="background:var(--bg-surface);border:1px solid var(--border-light);padding:var(--space-3);border-radius:var(--radius-md);">
              <div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Diet Adherence</div>
              <div style="font-size:var(--text-lg);font-weight:800;color:var(--color-blue-600);margin-top:2px;">${client.dietAdherence}%</div>
            </div>
            <div style="background:var(--bg-surface);border:1px solid var(--border-light);padding:var(--space-3);border-radius:var(--radius-md);">
              <div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Session Attendance</div>
              <div style="font-size:var(--text-lg);font-weight:800;color:var(--color-purple-600);margin-top:2px;">${client.sessionAttendance}%</div>
            </div>
          </div>

          <!-- Activity & Schedule Info -->
          <div style="display:flex;flex-direction:column;gap:8px;font-size:var(--text-xs);background:var(--bg-surface-hover);padding:var(--space-3);border-radius:var(--radius-md);">
            <div>⚡ <strong>Latest Activity:</strong> <span style="color:var(--text-secondary);">${client.lastActivity || 'No recent activity'}</span></div>
            <div>📅 <strong>Next Session:</strong> <span style="color:var(--text-primary);font-weight:700;">${client.nextSession}</span></div>
          </div>
        </div>

        <div class="modal-footer" style="display:flex;gap:var(--space-3);justify-content:flex-end;border-top:1px solid var(--border-light);padding-top:var(--space-4);margin-top:var(--space-2);flex-wrap:wrap;">
          <button class="btn btn--secondary btn--sm" onclick="Dashboard.closeClientDetailModal(); Dashboard.messageClient('${client.id}');">💬 Chat</button>
          <button class="btn btn--secondary btn--sm" onclick="Dashboard.closeClientDetailModal(); Dashboard.scheduleSessionForClient('${client.name}');">📅 Schedule Session</button>
          <button class="btn btn--primary btn--sm" onclick="Dashboard.closeClientDetailModal(); Dashboard.openAssignForClient('${client.name}');">📋 Assign Activity</button>
        </div>
      </div>
    `;

    modal.classList.add('visible');
    document.body.style.overflow = 'hidden';
  },

  closeClientDetailModal() {
    const modal = document.getElementById('client-detail-modal-overlay');
    if (modal) {
      modal.classList.remove('visible');
      document.body.style.overflow = '';
    }
  },

  /* ── 8. ASSIGN ACTIVITIES ── */
  renderTrainerAssignActivitiesView() {
    const clients = FitTrackData.activeClients;
    const assignedList = FitTrackData.assignedActivitiesList;

    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">${Components.icon('activities')} Assign Activities & Nutrition</h1>
          <p class="view-subtitle">Program workout splits, cardio targets, and macro nutrition directly to client dashboards</p>
        </div>
      </div>

      <div class="two-column mb-6">
        <!-- Assign Activity Form -->
        <div class="card card--flat">
          <h3 class="card__title mb-4">Program New Activity</h3>
          <form id="form-assign-workout" onsubmit="event.preventDefault(); Dashboard.handleAssignWorkout();">
            <div class="profile-form-grid">
              <div class="form-group">
                <label class="form-label" for="asg-client">Select Client</label>
                <select class="form-input" id="asg-client">
                  ${clients.map(c => `<option value="${c.name}">${c.name} (${c.plan})</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="asg-type">Activity Type</label>
                <select class="form-input" id="asg-type">
                  <option value="Workout">Workout (General)</option>
                  <option value="Strength Training" selected>Strength Training</option>
                  <option value="Cardio">Cardio</option>
                  <option value="Diet">Diet & Nutrition</option>
                  <option value="Recovery">Recovery & Mobility</option>
                  <option value="Other">Other Custom Task</option>
                </select>
              </div>
            </div>

            <div class="form-group mt-3">
              <label class="form-label" for="asg-exercise">Activity / Exercise Title</label>
              <input type="text" class="form-input" id="asg-exercise" value="Legs & Core Power (Squats + RDLs)" required>
            </div>

            <div class="profile-form-grid">
              <div class="form-group">
                <label class="form-label" for="asg-sets">Working Sets / Meals</label>
                <input type="number" class="form-input" id="asg-sets" value="4">
              </div>

              <div class="form-group">
                <label class="form-label" for="asg-reps">Reps / Target Load / Macros</label>
                <input type="text" class="form-input" id="asg-reps" value="8-10 reps (50 kg load)">
              </div>
            </div>

            <div class="profile-form-grid">
              <div class="form-group">
                <label class="form-label" for="asg-day">Scheduled Date / Day</label>
                <input type="text" class="form-input" id="asg-day" value="Wednesday, Sep 24">
              </div>

              <div class="form-group">
                <label class="form-label" for="asg-duration">Duration & Frequency</label>
                <input type="text" class="form-input" id="asg-duration" value="55 min · 4x / week">
              </div>
            </div>

            <div class="form-group mt-3">
              <label class="form-label" for="asg-tips">Instructions & Technique Notes</label>
              <textarea class="form-textarea" id="asg-tips" rows="2">Keep chest upright, drive heels into floor, lock out core at top.</textarea>
            </div>

            <button type="submit" class="btn btn--primary mt-4" style="width:100%;">
              ${Components.icon('checkCircle')} Push Activity to Client Dashboard
            </button>
          </form>
        </div>

        <!-- Assigned Activities Log Table -->
        <div class="card card--flat">
          <div class="card__header">
            <h3 class="card__title">Recent Assigned Activities</h3>
            <span class="badge badge--emerald">${assignedList.length} Active</span>
          </div>
          <div class="flex flex-col gap-3">
            ${assignedList.map(a => `
              <div style="border:1px solid var(--border-light);border-radius:var(--radius-md);padding:var(--space-3);background:var(--bg-surface);">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span style="font-weight:700;font-size:var(--text-sm);">${a.clientName}</span>
                  <span class="badge badge--purple">${a.type}</span>
                </div>
                <div style="font-size:var(--text-sm);font-weight:600;margin-top:2px;">${a.activityName}</div>
                <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:2px;">📅 ${a.date} · ⏱️ ${a.duration}</div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;font-size:11px;">
                  <span style="color:var(--text-secondary);">${a.status}</span>
                  <span style="color:var(--color-primary);font-weight:700;">${a.completion}% Done</span>
                </div>
                <div style="display:flex;gap:6px;margin-top:8px;justify-content:flex-end;">
                  ${a.completion < 100 ? `
                    <button class="btn btn--secondary btn--sm" style="font-size:11px;padding:2px 8px;color:var(--color-emerald-600);border-color:rgba(16,185,129,0.3);" onclick="Dashboard.completeAssignedActivity('${a.id}')">✓ Mark Done</button>
                  ` : `
                    <span class="badge badge--emerald" style="font-size:10px;">Audit Approved</span>
                  `}
                  <button class="btn btn--secondary btn--sm" style="font-size:11px;padding:2px 8px;color:#EF4444;border-color:rgba(239,68,68,0.3);" onclick="Dashboard.removeAssignedActivity('${a.id}')">✕ Delete</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  /* ── 9. SESSION MANAGEMENT ── */
  renderTrainerScheduleSessionsView() {
    const sessions = FitTrackData.trainerSessions || [];
    const clients = FitTrackData.activeClients || [];
    const filter = this.trainerSessionCategoryFilter || 'all';

    const upcomingCount = sessions.filter(s => s && (s.category === 'upcoming' || s.category === 'today' || (s.status !== 'Completed' && !s.status.includes('Cancelled')))).length;
    const completedCount = sessions.filter(s => s && (s.category === 'completed' || s.status === 'Completed')).length;
    const cancelledCount = sessions.filter(s => s && (s.category === 'cancelled' || s.status.includes('Cancelled'))).length;

    const displayedSessions = sessions.filter(s => {
      const isComp = s.status === 'Completed' || s.category === 'completed';
      const isCanc = s.status.includes('Cancelled') || s.category === 'cancelled';
      const isUpc = !isComp && !isCanc;
      if (filter === 'upcoming') return isUpc;
      if (filter === 'completed') return isComp;
      if (filter === 'cancelled') return isCanc;
      return true;
    });

    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">${Components.icon('sessions')} 1-on-1 Session Management</h1>
          <p class="view-subtitle">Schedule, launch, reschedule, and manage video consultations and biomechanics audits</p>
        </div>
      </div>

      <!-- Session Filter Tabs -->
      <div class="filter-tabs mb-4" style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="filter-btn ${filter === 'all' ? 'active' : ''}" onclick="Dashboard.setTrainerSessionFilter('all')">All (${sessions.length})</button>
        <button class="filter-btn ${filter === 'upcoming' ? 'active' : ''}" onclick="Dashboard.setTrainerSessionFilter('upcoming')">Upcoming (${upcomingCount})</button>
        <button class="filter-btn ${filter === 'completed' ? 'active' : ''}" onclick="Dashboard.setTrainerSessionFilter('completed')">Completed (${completedCount})</button>
        <button class="filter-btn ${filter === 'cancelled' ? 'active' : ''}" onclick="Dashboard.setTrainerSessionFilter('cancelled')">Cancelled (${cancelledCount})</button>
      </div>

      <div class="two-column">
        <!-- New Session Form -->
        <div class="card card--flat">
          <h3 class="card__title mb-4">Book 1-on-1 Appointment</h3>
          <form id="form-trainer-session" onsubmit="event.preventDefault(); Dashboard.handleTrainerScheduleSession();">
            <div class="form-group">
              <label class="form-label" for="ts-client">Select Client</label>
              <select class="form-input" id="ts-client">
                ${clients.map(c => `<option value="${c.name}" ${this.prefilledSessionClient === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="ts-type">Session Type</label>
              <select class="form-input" id="ts-type">
                <option value="1-on-1 Video Coaching">1-on-1 Video Coaching (60 min)</option>
                <option value="Squat & Deadlift Form Audit">Squat & Deadlift Form Audit (45 min)</option>
                <option value="Nutrition Blueprint Strategy">Nutrition Blueprint Strategy (30 min)</option>
                <option value="Monthly Fitness Assessment">Monthly Fitness Assessment (45 min)</option>
              </select>
            </div>

            <div class="profile-form-grid">
              <div class="form-group">
                <label class="form-label" for="ts-date">Date</label>
                <input type="date" class="form-input" id="ts-date" value="2026-09-28" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="ts-time">Time Slot</label>
                <select class="form-input" id="ts-time">
                  <option value="08:00 AM – 09:00 AM">08:00 AM – 09:00 AM</option>
                  <option value="10:00 AM – 11:00 AM">10:00 AM – 11:00 AM</option>
                  <option value="11:30 AM – 12:30 PM">11:30 AM – 12:30 PM</option>
                  <option value="04:00 PM – 05:00 PM">04:00 PM – 05:00 PM</option>
                  <option value="05:00 PM – 06:00 PM">05:00 PM – 06:00 PM</option>
                  <option value="06:00 PM – 07:00 PM" selected>06:00 PM – 07:00 PM</option>
                </select>
              </div>
            </div>

            <div class="form-group mt-3">
              <label class="form-label" for="ts-topic">Agenda / Consultation Topic</label>
              <input type="text" class="form-input" id="ts-topic" value="Bi-weekly Form & Plan Review" required>
            </div>

            <button type="submit" class="btn btn--primary mt-4" style="width:100%;">
              ${Components.icon('checkCircle')} Confirm Appointment & Generate Video Room
            </button>
          </form>
        </div>

        <!-- Confirmed Sessions List -->
        <div class="card card--flat">
          <div class="card__header">
            <h3 class="card__title">Scheduled Video Sessions</h3>
            <span class="badge badge--emerald">${displayedSessions.length} Showing · ${sessions.length} Total</span>
          </div>
          <div class="flex flex-col gap-4" id="trainer-sessions-list">
            ${displayedSessions.length === 0 ? `
              <div style="text-align:center;padding:var(--space-8);color:var(--text-muted);border:1px dashed var(--border-light);border-radius:var(--radius-lg);">
                <div style="font-size:32px;margin-bottom:8px;">📅</div>
                <div style="font-weight:700;color:var(--text-primary);margin-bottom:4px;">No Sessions in "${filter}"</div>
                <div style="font-size:12px;margin-bottom:12px;">There are no sessions currently categorized under this filter.</div>
                <button class="btn btn--secondary btn--sm" onclick="Dashboard.setTrainerSessionFilter('all')">Show All Sessions</button>
              </div>
            ` : displayedSessions.map(s => {
              const isCompleted = s.status === 'Completed' || s.category === 'completed';
              const isCancelled = s.status.includes('Cancelled') || s.category === 'cancelled';
              const isInProgress = s.status === 'In Progress';
              const hasRecording = s.recording || FitTrackData.getSessionRecording(s.id);
              const chipClass = isCompleted ? 'badge--blue' : isCancelled ? 'badge--gray' : isInProgress ? 'badge--amber' : 'badge--emerald';

              return `
                <div class="session-entry-card" id="session-card-${s.id}" style="margin-bottom:0;">
                  <div class="session-entry-card__top">
                    <div class="session-entry-card__date">
                      📅 ${s.date} · ⏰ ${s.time}
                    </div>
                    <span class="badge ${chipClass}">
                      ● ${s.status}
                    </span>
                  </div>
                  <div style="font-size:var(--text-sm);font-weight:700;color:var(--text-primary);margin-bottom:2px;">
                    Client: <strong>${s.clientName}</strong> · ${s.type} (${s.duration || '60 min'})
                  </div>
                  <div class="session-entry-card__topic">
                    🎯 <strong>Agenda:</strong> ${s.topic}
                  </div>
                  <div style="display:flex;gap:var(--space-2);margin-top:var(--space-2);flex-wrap:wrap;align-items:center;">
                    ${!isCompleted && !isCancelled ? (isInProgress ? `
                      <button class="btn btn--primary btn--sm" onclick="Dashboard.launchVideoSession('${s.id}')" style="display:inline-flex;align-items:center;justify-content:center;gap:4px;">
                        ${Components.icon('video')} Rejoin Session
                      </button>
                    ` : `
                      <button class="btn btn--primary btn--sm" onclick="Dashboard.launchVideoSession('${s.id}')" style="display:inline-flex;align-items:center;justify-content:center;gap:4px;">
                        ${Components.icon('video')} Start Session
                      </button>
                    `) : ''}

                    ${hasRecording ? `
                      <button class="btn btn--secondary btn--sm" onclick="Dashboard.openSavedRecordingViewer('${s.id}')" style="display:inline-flex;align-items:center;gap:4px;color:#38BDF8;border-color:#38BDF8;background:rgba(56,189,248,0.1);">
                        🎥 View Recording
                      </button>
                    ` : ''}

                    <button class="btn btn--secondary btn--sm" onclick="Dashboard.showSessionDetails('${s.id}')" style="display:inline-flex;align-items:center;gap:4px;">
                      👁️ View Details
                    </button>

                    <button class="btn btn--secondary btn--sm" onclick="Dashboard.openRescheduleModal('${s.id}')" style="display:inline-flex;align-items:center;gap:4px;">
                      📅 Reschedule
                    </button>

                    ${!isCompleted && !isCancelled ? `
                      <button class="btn btn--secondary btn--sm" onclick="Dashboard.markSessionCompleted('${s.id}')" style="display:inline-flex;align-items:center;gap:4px;color:var(--color-emerald-600);border-color:rgba(16,185,129,0.3);">
                        ✓ Complete
                      </button>
                      <button class="btn btn--secondary btn--sm" onclick="Dashboard.cancelTrainerSession('${s.id}')" style="display:inline-flex;align-items:center;gap:4px;color:#EF4444;border-color:rgba(239,68,68,0.3);">
                        ✕ Cancel
                      </button>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  },

  /* ── 10. CLIENT PROGRESS ANALYTICS ── */
  renderTrainerReviewProgressView() {
    const clients = FitTrackData.activeClients || [];
    const currentClient = clients.find(c => c.id === this.activeProgressClientId) || clients[0];
    const reviews = FitTrackData.clientProgressReviews || [];

    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">${Components.icon('progress')} Client Progress Analytics</h1>
          <p class="view-subtitle">Audit workout completion rates, diet adherence, session attendance, and provide feedback</p>
        </div>
        <div style="display:flex;align-items:center;gap:var(--space-2);">
          <label style="font-size:var(--text-xs);font-weight:700;color:var(--text-muted);">SELECT CLIENT:</label>
          <select class="form-input" id="progress-client-select" style="width:200px;" onchange="Dashboard.switchProgressClient(this.value)">
            ${clients.map(c => `<option value="${c.id}" ${currentClient.id === c.id ? 'selected' : ''}>${c.name} (${c.goal.slice(0, 18)}...)</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Selected Client Progress Analytics KPI Cards -->
      <div class="metrics-grid mb-6">
        ${Components.metricCard({ label: 'Goal Completion', value: `${currentClient.overallProgress}%`, detail: `Target: ${currentClient.targetWeight}`, icon: 'trophy', colorClass: 'emerald', delay: 1 })}
        ${Components.metricCard({ label: 'Workout Completion', value: `${currentClient.workoutCompletion}%`, detail: '4/5 Workouts this week', icon: 'fire', colorClass: 'blue', delay: 2 })}
        ${Components.metricCard({ label: 'Diet Adherence', value: `${currentClient.dietAdherence}%`, detail: 'High Protein Target Met', icon: 'diet', colorClass: 'amber', delay: 3 })}
        ${Components.metricCard({ label: 'Session Attendance', value: `${currentClient.sessionAttendance}%`, detail: '9 of 10 calls attended', icon: 'video', colorClass: 'purple', delay: 4 })}
      </div>

      <div class="two-column mb-6">
        <!-- Progress Trajectory Chart -->
        <div class="card card--flat">
          <div class="card__header">
            <div>
              <h3 class="card__title">Weight & Strength Trajectory — ${currentClient.name}</h3>
              <p class="card__subtitle">${currentClient.currentWeight} · Goal: ${currentClient.targetWeight}</p>
            </div>
            <span class="badge badge--emerald">On Track</span>
          </div>
          <div class="progress-chart-container mb-3" style="min-height:220px;">
            <canvas id="progress-chart" aria-label="Client Progress Trajectory"></canvas>
          </div>
        </div>

        <!-- Feedback & Adjustment Audit -->
        <div class="card card--flat">
          <h3 class="card__title mb-3">Weekly Client Logs & Coach Feedback</h3>
          <div class="flex flex-col gap-4">
            ${reviews.map(r => `
              <div style="border:1px solid var(--border-light);border-radius:var(--radius-md);padding:var(--space-3);background:var(--bg-surface);">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <strong style="font-size:var(--text-sm);">${r.clientName}</strong>
                  <span class="badge ${r.coachStatus.includes('Approved') ? 'badge--emerald' : 'badge--amber'}">${r.coachStatus}</span>
                </div>
                <div style="font-size:var(--text-xs);color:var(--text-secondary);margin:4px 0;">"${r.loggedEntry}"</div>
                <div style="font-size:11px;color:var(--color-primary);font-weight:700;">Result: ${r.weightChange}</div>
                <div class="form-group mt-2">
                  <textarea class="form-textarea" rows="2" style="font-size:11px;" id="coach-feedback-${r.id}">${r.coachNote}</textarea>
                </div>
                <div style="text-align:right;margin-top:4px;">
                  <button class="btn btn--primary btn--sm" style="font-size:11px;padding:3px 8px;" onclick="Dashboard.handleSaveCoachFeedback('${r.id}', '${r.clientName}')">
                    Save & Send Feedback
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  switchProgressClient(clientId) {
    const c = FitTrackData.activeClients.find(x => x.id === clientId);
    if (c) {
      App.showToast('info', 'Client Loaded', `Loaded detailed analytics for ${c.name}.`);
    }
  },

  /* ── 11. CLIENT COMMUNICATION (MESSAGES) ── */
  renderTrainerMessagesView() {
    const threads = FitTrackData.trainerChatThreads;
    const activeClientId = this.activeTrainerClientId || (threads[0] && threads[0].clientId);
    const activeThread = threads.find(t => t.clientId === activeClientId) || threads[0];

    // Mark current active thread as read
    if (activeThread) {
      FitTrackData.markTrainerThreadMessagesAsRead(activeThread.clientId);
      this.updateBadges();
    }

    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">${Components.icon('messages')} Client Communication</h1>
          <p class="view-subtitle">Direct real-time 1-on-1 private messaging channel with your active coaching clients</p>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:300px 1fr;gap:var(--space-4);min-height:550px;">
        
        <!-- Clients List Sidebar -->
        <div class="card card--flat" style="padding:var(--space-3);">
          <div class="form-group mb-3">
            <input type="text" class="form-input" placeholder="Search clients..." style="font-size:var(--text-xs);">
          </div>
          <div class="flex flex-col gap-2">
            ${threads.map(t => {
              const isActive = t.clientId === activeThread.clientId;
              return `
                <div style="border:1px solid ${isActive ? 'var(--color-primary)' : 'var(--border-light)'};border-radius:var(--radius-md);padding:var(--space-3);background:${isActive ? 'var(--bg-surface-hover)' : 'var(--bg-surface)'};cursor:pointer;" onclick="Dashboard.selectTrainerThread('${t.clientId}')">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div style="display:flex;align-items:center;gap:var(--space-2);">
                      <div class="avatar avatar--xs avatar--placeholder" style="background:${t.avatarBg};color:#fff;font-weight:700;">${t.initials}</div>
                      <strong style="font-size:var(--text-xs);">${t.clientName}</strong>
                    </div>
                    ${t.unreadCount > 0 ? `<span class="badge badge--purple" style="font-size:9px;">${t.unreadCount} new</span>` : ''}
                  </div>
                  <div style="font-size:11px;color:var(--text-secondary);margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${t.lastMessage}</div>
                  <div style="font-size:9px;color:var(--text-muted);margin-top:2px;">${t.lastTime} · <span style="color:${t.status === 'online' ? '#059669' : 'gray'};">● ${t.status}</span></div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Active Conversation Area -->
        <div class="chat-container" style="margin:0;">
          <div class="chat-header">
            <div class="chat-trainer-info">
              <div class="avatar avatar--md avatar--placeholder" style="background:${activeThread.avatarBg};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;">
                ${activeThread.initials}
              </div>
              <div>
                <div style="font-weight:700;font-size:var(--text-base);">${activeThread.clientName}</div>
                <div style="font-size:var(--text-xs);color:var(--text-muted);display:flex;align-items:center;gap:4px;">
                  <span class="online-dot"></span> Online · Subscribed Client (Pro Plan)
                </div>
              </div>
            </div>
            <button class="btn btn--secondary btn--sm" onclick="Dashboard.navigate('trainer_schedule_sessions')">
              ${Components.icon('video')} Start Video Call
            </button>
          </div>

          <div class="chat-body" id="chat-body">
            ${activeThread.messages.map(m => `
              <div class="chat-message ${m.sender === 'trainer' ? 'user' : 'trainer'}">
                <div class="avatar avatar--sm avatar--placeholder" style="background:${m.sender === 'trainer' ? '#059669' : activeThread.avatarBg};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;">
                  ${m.sender === 'trainer' ? 'RM' : activeThread.initials}
                </div>
                <div>
                  <div class="chat-bubble">${m.text}</div>
                  <div class="chat-time">${m.time}</div>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="chat-suggestions">
            <button class="suggestion-chip" onclick="Dashboard.sendQuickTrainerReply('Great technique on your deadlift video! Add 2.5kg next session.')">🏋️ Good technique on video</button>
            <button class="suggestion-chip" onclick="Dashboard.sendQuickTrainerReply('Your meal plan macros have been updated for this week.')">🥗 Updated meal macros</button>
            <button class="suggestion-chip" onclick="Dashboard.sendQuickTrainerReply('Confirmed our 1-on-1 video call appointment for today.')">📅 Confirmed session time</button>
          </div>

          <form class="chat-footer" id="trainer-chat-form" onsubmit="event.preventDefault(); Dashboard.handleTrainerSendMessage();">
            <input type="text" class="chat-input" id="trainer-chat-input-text" placeholder="Type a message to ${activeThread.clientName}..." autocomplete="off" required>
            <button type="submit" class="btn btn--primary" style="border-radius:var(--radius-full);padding:var(--space-2) var(--space-5);">
              ${Components.icon('send')} Send
            </button>
          </form>
        </div>

      </div>
    `;
  },

  selectTrainerThread(clientId) {
    this.activeTrainerClientId = clientId;
    FitTrackData.markTrainerThreadMessagesAsRead(clientId);
    this.updateBadges();
    this.renderCurrentView();
  },

  sendQuickTrainerReply(text) {
    const input = document.getElementById('trainer-chat-input-text');
    if (input) {
      input.value = text;
      this.handleTrainerSendMessage();
    }
  },

  handleTrainerSendMessage() {
    const input = document.getElementById('trainer-chat-input-text');
    if (!input || !input.value.trim()) return;

    const text = input.value.trim();
    input.value = '';

    const threads = FitTrackData.trainerChatThreads;
    const activeClientId = this.activeTrainerClientId || (threads[0] && threads[0].clientId);
    const thread = threads.find(t => t.clientId === activeClientId) || threads[0];

    thread.messages.push({
      id: `tm_${Date.now()}`,
      sender: 'trainer',
      text,
      time: 'Just now',
      read: true
    });
    thread.lastMessage = text;
    thread.lastTime = 'Just now';

    FitTrackData.saveToStorage();
    this.renderCurrentView();

    setTimeout(() => {
      const isCurrentlyViewing = Dashboard.currentRole === 'trainer' && Dashboard.currentView === 'trainer_messages' && (Dashboard.activeTrainerClientId === thread.clientId || (!Dashboard.activeTrainerClientId && thread.clientId === threads[0].clientId));
      thread.messages.push({
        id: `tm_cli_${Date.now()}`,
        sender: 'client',
        text: 'Thank you Coach Rahul! Will follow this and update you after today’s workout.',
        time: 'Just now',
        read: isCurrentlyViewing ? true : false
      });
      thread.lastMessage = 'Thank you Coach Rahul! Will follow this and update you after today’s workout.';
      thread.lastTime = 'Just now';

      if (!isCurrentlyViewing) {
        thread.unreadCount = (thread.unreadCount || 0) + 1;
      }
      FitTrackData.syncNavBadges();
      FitTrackData.saveToStorage();

      if (isCurrentlyViewing) {
        Dashboard.renderCurrentView();
      }
      Dashboard.updateBadges();
      App.showToast('info', `${thread.clientName} Replied`, 'Client acknowledged your message.');
    }, 1000);
  },

  /* ── 12. REVIEWS & FEEDBACK ── */
  renderTrainerReviewsView() {
    const reviews = FitTrackData.trainerReviews;

    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">${Components.icon('reviews')} Client Reviews & Ratings</h1>
          <p class="view-subtitle">Read verified member feedback, testimonials, and coaching performance metrics</p>
        </div>
      </div>

      <div class="two-column">
        <!-- Rating Breakdown Card -->
        <div class="card card--flat">
          <div style="text-align:center;padding:var(--space-4);">
            <div style="font-size:var(--text-4xl);font-weight:800;color:var(--color-emerald-700);">4.8</div>
            <div style="font-size:var(--text-lg);color:#F59E0B;margin:4px 0;">★★★★★</div>
            <div style="font-size:var(--text-xs);color:var(--text-muted);">Based on 142 verified client ratings</div>

            <div style="margin-top:var(--space-6);display:flex;flex-direction:column;gap:var(--space-2);text-align:left;">
              <div style="display:flex;align-items:center;gap:var(--space-3);font-size:var(--text-xs);">
                <span style="width:45px;">5 Star</span>
                <div class="duration-progress-bar" style="height:8px;margin:0;"><div class="duration-progress-bar__fill" style="width:88%;"></div></div>
                <span style="width:30px;color:var(--text-muted);">88%</span>
              </div>
              <div style="display:flex;align-items:center;gap:var(--space-3);font-size:var(--text-xs);">
                <span style="width:45px;">4 Star</span>
                <div class="duration-progress-bar" style="height:8px;margin:0;"><div class="duration-progress-bar__fill" style="width:10%;"></div></div>
                <span style="width:30px;color:var(--text-muted);">10%</span>
              </div>
              <div style="display:flex;align-items:center;gap:var(--space-3);font-size:var(--text-xs);">
                <span style="width:45px;">3 Star</span>
                <div class="duration-progress-bar" style="height:8px;margin:0;"><div class="duration-progress-bar__fill" style="width:2%;"></div></div>
                <span style="width:30px;color:var(--text-muted);">2%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Verified Reviews Feed -->
        <div class="card card--flat">
          <div class="card__header">
            <h3 class="card__title">Verified Member Testimonials</h3>
            <span class="badge badge--emerald">${reviews.length} Featured</span>
          </div>

          <div class="flex flex-col gap-4">
            ${reviews.map(r => `
              <div class="review-card" style="margin-bottom:0;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                  <div style="display:flex;gap:var(--space-3);align-items:center;">
                    <div class="avatar avatar--sm avatar--placeholder" style="background:#059669;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;">
                      ${r.authorInitials}
                    </div>
                    <div>
                      <div style="font-weight:700;font-size:var(--text-sm);">${r.authorName}</div>
                      <div style="font-size:var(--text-xs);color:var(--text-muted);">${r.date}</div>
                    </div>
                  </div>
                  <span class="badge badge--purple" style="font-size:11px;">${r.tag}</span>
                </div>

                <div class="review-card__stars mt-2">
                  ${'★'.repeat(r.rating)}
                </div>

                <p style="font-size:var(--text-sm);color:var(--text-secondary);line-height:var(--leading-relaxed);margin-top:var(--space-2);">
                  "${r.comment}"
                </p>

                <div style="text-align:right;margin-top:var(--space-2);">
                  ${r.trainerReply ? `
                    <div style="background:var(--bg-surface-hover);border-left:3px solid var(--color-primary);padding:6px 10px;text-align:left;border-radius:4px;font-size:11px;color:var(--text-primary);margin-top:4px;">
                      <strong>Coach Rahul Mehta:</strong> "${r.trainerReply}"
                    </div>
                  ` : `
                    <button class="btn btn--secondary btn--sm" style="font-size:11px;padding:3px 8px;" onclick="Dashboard.replyToReview('${r.id}')">
                      💬 Send Coach Reply
                    </button>
                  `}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  /* ── 13. TRAINER NOTIFICATIONS ── */
  renderTrainerNotificationsView() {
    const notifs = FitTrackData.trainerNotifications;
    const unreadCount = notifs.filter(n => !n.read).length;

    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">${Components.icon('bell')} Trainer Notifications & Alerts</h1>
          <p class="view-subtitle">Stay updated on new client enrollments, published plans, session reminders, and incoming messages</p>
        </div>
        <button class="btn btn--secondary" onclick="Dashboard.markAllTrainerNotifsRead()">
          Mark All as Read (${unreadCount})
        </button>
      </div>

      <div class="card card--flat">
        <div class="card__header">
          <h3 class="card__title">Operational Alerts Feed</h3>
          <span class="badge badge--emerald">${unreadCount} Unread</span>
        </div>

        <div class="notification-feed-list">
          ${notifs.map(n => `
            <div class="notification-feed-item ${!n.read ? 'unread' : ''}" style="cursor:pointer;" onclick="Dashboard.handleTrainerNotificationClick('${n.id}', '${n.actionView}')">
              <div class="notification-feed-item__icon" style="background:${!n.read ? '#ECFDF5' : 'var(--bg-surface-hover)'};color:${!n.read ? '#059669' : 'var(--text-muted)'};">
                ${n.type === 'client' ? '👤' : n.type === 'plan_live' || n.type === 'plan_approval' ? '🚀' : n.type === 'session' ? '📅' : n.type === 'activity' ? '🏋️' : n.type === 'message' ? '💬' : '🔔'}
              </div>
              <div class="notification-feed-item__content">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <strong style="color:var(--text-primary);">${n.title}</strong>
                  <span class="notification-feed-item__time">${n.time}</span>
                </div>
                <div style="color:var(--text-secondary);margin-top:2px;">${n.message}</div>
                ${!n.read ? '<span class="badge badge--emerald" style="font-size:9px;padding:1px 6px;margin-top:4px;">NEW</span>' : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  markAllTrainerNotifsRead() {
    FitTrackData.markAllNotificationsAsRead(true);
    App.showToast('info', 'Notifications', 'All trainer notifications marked as read.');
    this.updateBadges();
    this.renderCurrentView();
  },

  handleTrainerNotificationClick(notifId, actionView) {
    FitTrackData.markNotificationAsRead(notifId, true);
    this.updateBadges();
    if (actionView) {
      this.navigate(actionView);
    } else {
      this.renderCurrentView();
    }
  },

  /* ── 14. TRAINER SETTINGS ── */
  renderTrainerSettingsView() {
    const t = FitTrackData.trainerProfile;

    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">${Components.icon('settings')} Trainer Operational Settings</h1>
          <p class="view-subtitle">Configure appointment booking preferences, notifications, and portal display options</p>
        </div>
        <button class="btn btn--primary" onclick="Dashboard.handleSaveTrainerSettings()">
          ${Components.icon('check')} Save Settings
        </button>
      </div>

      <div class="two-column">
        <!-- Booking & Capacity Preferences -->
        <div class="card card--flat">
          <h3 class="card__title mb-4">Client Booking Preferences</h3>
          <div class="flex flex-col gap-4">
            <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:var(--space-3);border-bottom:1px solid var(--border-light);">
              <div>
                <div style="font-weight:700;font-size:var(--text-sm);">Auto-Accept Video Session Bookings</div>
                <div style="font-size:var(--text-xs);color:var(--text-muted);">Automatically confirm appointments within your defined availability</div>
              </div>
              <input type="checkbox" checked style="width:20px;height:20px;accent-color:var(--color-primary);">
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:var(--space-3);border-bottom:1px solid var(--border-light);">
              <div>
                <div style="font-weight:700;font-size:var(--text-sm);">Client Activity Log Alerts</div>
                <div style="font-size:var(--text-xs);color:var(--text-muted);">Receive push notifications whenever an assigned client finishes a workout</div>
              </div>
              <input type="checkbox" checked style="width:20px;height:20px;accent-color:var(--color-primary);">
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div style="font-weight:700;font-size:var(--text-sm);">Email Summary of Weekly CRM Retention</div>
                <div style="font-size:var(--text-xs);color:var(--text-muted);">Weekly email digest of upcoming membership renewals</div>
              </div>
              <input type="checkbox" checked style="width:20px;height:20px;accent-color:var(--color-primary);">
            </div>
          </div>
        </div>

        <!-- Portal Preferences -->
        <div class="card card--flat">
          <h3 class="card__title mb-4">Portal Parameters</h3>
          <form onsubmit="event.preventDefault(); Dashboard.handleSaveTrainerSettings();">
            <div class="form-group">
              <label class="form-label" for="t-set-tz">Operational Timezone</label>
              <select class="form-input" id="t-set-tz">
                <option value="Asia/Kolkata" selected>India Standard Time (IST, UTC+5:30)</option>
                <option value="America/New_York">Eastern Time (ET, UTC-5)</option>
                <option value="Europe/London">Greenwich Mean Time (GMT, UTC+0)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="t-set-theme">Portal Visual Theme</label>
              <select class="form-input" id="t-set-theme" onchange="App.setTheme(this.value)">
                <option value="light" selected>Clean Modern Light</option>
                <option value="dark">Sleek Cyber Dark</option>
              </select>
            </div>

            <button type="submit" class="btn btn--primary mt-2" style="width:100%;">Save Preferences</button>
          </form>
        </div>
      </div>
    `;
  },

  /* ══════════════════════════════════════════════
     USER DASHBOARD & 11 USER FEATURES
     ══════════════════════════════════════════════ */

  /* ── 1. USER DASHBOARD OVERVIEW (Personal Fitness Command Center) ── */
  renderDashboardOverview() {
    const user = FitTrackData.currentUser;
    const trainer = FitTrackData.activeTrainer;
    const plan = FitTrackData.activePlan;
    const goal = FitTrackData.activeGoal;
    const workout = FitTrackData.todaysWorkout;
    const diet = FitTrackData.dietPlan;
    const sessions = FitTrackData.upcomingSessions;
    const progress = FitTrackData.progressData;

    const sessionUser = Auth.getUser();
    const userFullName = (sessionUser && sessionUser.name) ? sessionUser.name : (user.fullName || user.name || 'Member');
    const userFirstName = userFullName.split(' ')[0] || 'Member';
    const greeting = this.getTimeGreeting();

    const completedExCount = workout.exercises.filter(e => e.completed).length;
    const workoutPercent = Math.round((completedExCount / workout.exercises.length) * 100);

    return `
      <!-- Welcome Hero Banner -->
      <section class="welcome-hero animate-fade-in-up" style="background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 55%, #10B981 100%);">
        <div class="welcome-hero__text">
          <div class="welcome-hero__badge">
            ${Components.icon('checkCircle')} <span>FITTRACK USER COMMAND CENTER</span>
          </div>
          <h1 class="welcome-hero__heading">${greeting}, ${userFirstName}! 💪</h1>
          <p class="welcome-hero__subtext">
            You're currently on <strong>Day 16 of 30</strong> of your <strong>${plan.name}</strong> plan.
            Primary Goal: <strong>${goal.title}</strong> (<strong>${goal.progressPercentage}%</strong> achieved).
          </p>
          <div class="welcome-hero__cta-group">
            <button class="welcome-hero__cta" onclick="Dashboard.navigate('activities')">
              ${Components.icon('activity')}
              <span>Today's Activities (${completedExCount}/${workout.exercises.length})</span>
            </button>
            <button class="welcome-hero__cta welcome-hero__cta--outline" onclick="Dashboard.openLogProgressModal()">
              ${Components.icon('progress')}
              <span>Log Weight (${user.weight} kg)</span>
            </button>
            <button class="welcome-hero__cta welcome-hero__cta--outline" onclick="Dashboard.navigate('messages')">
              ${Components.icon('messages')}
              <span>Chat with Coach Arjun</span>
            </button>
          </div>
        </div>

        <div class="welcome-hero__trainer" style="min-width:280px;background:rgba(255,255,255,0.12);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.2);">
          <div class="welcome-hero__trainer-label" style="color:#E0E7FF;">Membership & Coach</div>
          <div style="font-size:var(--text-2xl);font-weight:800;color:#fff;margin-bottom:4px;">
            ${plan.name}
          </div>
          <div style="font-size:var(--text-xs);color:rgba(255,255,255,0.9);margin-bottom:var(--space-2);">
            ⏳ <strong>${plan.daysRemaining} Days Left</strong> in current cycle
          </div>
          <div class="duration-progress-bar" style="background:rgba(255,255,255,0.25);height:6px;margin-bottom:var(--space-3);">
            <div class="duration-progress-bar__fill" style="width: 53%; background:#34D399;"></div>
          </div>
          <div class="welcome-hero__trainer-plan">
            <div class="welcome-hero__trainer-plan-icon">
              ${Components.icon('trophy')}
            </div>
            <span>Assigned Coach: ${trainer.name} (4.9 ★)</span>
          </div>
        </div>
      </section>

      <!-- 3. Top 5 Attractive Summary Cards -->
      <div class="metrics-grid mb-6">
        ${Components.metricCard({ label: 'Current Plan', value: 'Pro Coaching', detail: `${plan.daysRemaining} Days Left · $59/mo`, icon: 'target', colorClass: 'emerald', delay: 1 })}
        ${Components.metricCard({ label: 'Active Trainer', value: trainer.shortName, detail: '4.9 ★ Strength Specialist', icon: 'trainers', colorClass: 'blue', delay: 2 })}
        ${Components.metricCard({ label: 'Next Session', value: 'Today, 6:00 PM', detail: '1-on-1 Video Coaching Call', icon: 'video', colorClass: 'purple', delay: 3 })}
        ${Components.metricCard({ label: 'Progress Tracking', value: `${user.weight} kg`, detail: 'Down 3.5 kg · Target 58 kg', icon: 'fire', colorClass: 'amber', delay: 4 })}
        ${Components.metricCard({ label: 'Goal Completion', value: `${goal.progressPercentage}%`, detail: `Target: ${this.formatGoalDate(goal.targetDate)}`, icon: 'trophy', colorClass: 'emerald', delay: 5 })}
      </div>

      <!-- 4. MY FITNESS GOAL (Dedicated Card) -->
      <div class="card card--flat mb-6" style="border-left: 4px solid var(--color-emerald-500);">
        <div class="card__header">
          <div>
            <span class="dashboard-highlight-card__tag">4. MY FITNESS GOAL</span>
            <h2 class="card__title" style="display:flex;align-items:center;gap:var(--space-2);margin-top:2px;">
              ${Components.icon('goal')} Current Goal: ${goal.title}
            </h2>
            <p class="card__subtitle">${goal.goalType} · Target Date: <strong>${this.formatGoalDate(goal.targetDate)}</strong></p>
          </div>
          <div style="display:flex;gap:var(--space-2);align-items:center;">
            <span class="badge badge--emerald" style="font-size:var(--text-xs);padding:6px 12px;">● Status: On Track</span>
            <button class="btn btn--secondary btn--sm" onclick="Dashboard.openEditGoalModal()">
              ${Components.icon('edit')} Edit Goal
            </button>
          </div>
        </div>

        <div style="background:var(--bg-surface-hover);border:1px solid var(--border-light);border-radius:var(--radius-lg);padding:var(--space-4);margin-bottom:var(--space-4);">
          <div style="display:flex;justify-content:space-between;align-items:center;font-weight:700;font-size:var(--text-sm);margin-bottom:var(--space-2);">
            <span>Overall Goal Completion Progress</span>
            <span style="color:var(--color-primary);font-size:var(--text-base);">${goal.progressPercentage}% Completed</span>
          </div>
          <div class="duration-progress-bar" style="height:10px;margin-bottom:var(--space-2);">
            <div class="duration-progress-bar__fill" style="width: ${goal.progressPercentage}%;"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--text-muted);">
            <span>Starting Baseline: ${goal.startWeight} kg</span>
            <span>Current Weight: <strong>${user.weight} kg</strong></span>
            <span>Target Goal: <strong>${goal.targetWeight} kg</strong></span>
          </div>
        </div>

      </div>

      <!-- 5. MY TRAINER & 6. MY PLAN (Two Column Layout) -->
      <div class="two-column mb-6">
        
        <!-- 5. MY TRAINER CARD -->
        <div class="dashboard-highlight-card dashboard-highlight-card--emerald">
          <div>
            <div class="dashboard-highlight-card__header">
              <span class="dashboard-highlight-card__tag">5. MY TRAINER</span>
              <span class="badge badge--emerald">Verified Master Coach</span>
            </div>
            <div style="display:flex;align-items:center;gap:var(--space-4);margin-bottom:var(--space-3);">
              <div class="avatar avatar--xl avatar--placeholder" style="background:#059669;color:#fff;font-weight:800;font-size:var(--text-lg);display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow-sm);">
                ${trainer.avatarInitials}
              </div>
              <div>
                <h3 style="font-size:var(--text-lg);font-weight:800;color:var(--text-primary);">${trainer.name}</h3>
                <div style="font-size:var(--text-xs);color:var(--color-primary);font-weight:600;">${trainer.specialization} · ${trainer.experience}</div>
                <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:2px;">
                  ⭐ <strong>${trainer.rating} / 5.0</strong> (${trainer.reviewsCount} member reviews)
                </div>
              </div>
            </div>
            
            <div style="background:var(--bg-surface-hover);border-radius:var(--radius-md);padding:var(--space-3);margin-bottom:var(--space-3);font-size:var(--text-xs);">
              <div style="margin-bottom:4px;"><strong>Qualifications:</strong> ${trainer.certifications.join(', ')}</div>
              <div style="color:var(--text-secondary);line-height:1.4;">"${trainer.bio}"</div>
            </div>

            <div style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:var(--space-2);">
              Active Coaching Plan: <strong style="color:var(--text-primary);">${trainer.plan}</strong>
            </div>
          </div>

          <div style="display:flex;gap:var(--space-2);border-top:1px solid var(--border-light);padding-top:var(--space-3);margin-top:var(--space-2);">
            <button class="btn btn--primary btn--sm" style="flex:1;" onclick="Dashboard.navigate('messages')">
              ${Components.icon('messages')} Communication (Chat)
            </button>
            <button class="btn btn--secondary btn--sm" style="flex:1;" onclick="Dashboard.navigate('trainers')">
              View Profile
            </button>
          </div>
        </div>

        <!-- 6. MY PLAN CARD -->
        <div class="dashboard-highlight-card dashboard-highlight-card--purple">
          <div>
            <div class="dashboard-highlight-card__header">
              <span class="dashboard-highlight-card__tag">6. MY PLAN</span>
              <span class="badge badge--purple">Status: Active</span>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:var(--space-2);">
              <h3 style="font-size:var(--text-xl);font-weight:800;color:var(--text-primary);">${plan.name}</h3>
              <span style="font-size:var(--text-base);font-weight:700;color:var(--color-purple-700);">${plan.price} <span style="font-size:var(--text-xs);font-weight:400;color:var(--text-muted);">/ monthly</span></span>
            </div>
            
            <div style="background:var(--bg-surface-hover);border-radius:var(--radius-md);padding:var(--space-3);margin-bottom:var(--space-3);">
              <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);font-weight:600;margin-bottom:4px;">
                <span>Subscription Period</span>
                <span style="color:var(--color-purple-700);font-weight:700;">${plan.daysRemaining} Days Remaining</span>
              </div>
              <div class="duration-progress-bar">
                <div class="duration-progress-bar__fill" style="width: 53%;"></div>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted);margin-top:2px;">
                <span>Start: ${plan.startDate}</span>
                <span>End / Renewal: ${plan.endDate}</span>
              </div>
            </div>

            <div style="font-size:var(--text-xs);color:var(--text-secondary);margin-bottom:var(--space-3);">
              <div style="font-weight:700;color:var(--text-primary);margin-bottom:4px;">Included Features:</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">
                <div>✓ Assigned Personal Coach</div>
                <div>✓ 2 Video Sessions / Month</div>
                <div>✓ Daily Custom Workout Plan</div>
                <div>✓ Custom Macro Meal Plan</div>
              </div>
            </div>
          </div>

          <div style="display:flex;gap:var(--space-2);border-top:1px solid var(--border-light);padding-top:var(--space-3);margin-top:var(--space-2);">
            <button class="btn btn--primary btn--sm" style="flex:1;" onclick="Dashboard.navigate('my_plan')">
              ${Components.icon('purchase')} View Plan
            </button>
            <button class="btn btn--secondary btn--sm" style="flex:1;" onclick="Dashboard.navigate('messages')">
              Contact Trainer
            </button>
          </div>
        </div>

      </div>

      <!-- 7. TODAY'S ACTIVITIES (WORKOUT & DIET CHECKLIST) -->
      <div class="card card--flat mb-6">
        <div class="card__header">
          <div>
            <span class="dashboard-highlight-card__tag">7. TODAY'S ACTIVITIES</span>
            <h2 class="card__title" style="display:flex;align-items:center;gap:var(--space-2);margin-top:2px;">
              ${Components.icon('activities')} Daily Workout & Diet Checklist
            </h2>
            <p class="card__subtitle">${workout.date} · Legs & Core Focus & 2,150 kcal Diet Blueprint</p>
          </div>
          <div style="display:flex;gap:var(--space-2);align-items:center;">
            <span class="badge badge--emerald">${completedExCount} Completed</span>
            <span class="badge badge--blue">${workout.exercises.length - completedExCount} Pending</span>
            <button class="btn btn--primary btn--sm" onclick="Dashboard.markTodayWorkoutComplete()">
              Mark All Complete
            </button>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:var(--space-4);">
          <!-- Workout Activities -->
          <div>
            <h4 style="font-size:var(--text-sm);font-weight:700;color:var(--text-primary);margin-bottom:var(--space-3);display:flex;align-items:center;gap:6px;">
              🏋️ Workout Activities (${completedExCount}/${workout.exercises.length})
            </h4>
            <div class="flex flex-col gap-2">
              ${workout.exercises.map((ex, i) => `
                <div class="exercise-row ${ex.completed ? 'completed' : ''}" style="cursor:pointer;" onclick="Dashboard.toggleTodayExercise('${ex.id}')">
                  <div class="exercise-row__number">${i + 1}</div>
                  <div class="exercise-row__checkbox ${ex.completed ? 'checked' : ''}">
                    ${ex.completed ? Components.icon('check') : ''}
                  </div>
                  <div class="exercise-row__info">
                    <div class="exercise-row__name">${ex.name}</div>
                    <div class="exercise-row__details">
                      <span class="exercise-row__detail-item">${ex.sets} sets x ${ex.reps}</span>
                      <span class="exercise-row__detail-item">🏋️ ${ex.weight}</span>
                      <span class="exercise-row__detail-item">⏱️ ${ex.rest} rest</span>
                    </div>
                  </div>
                  <span class="badge ${ex.completed ? 'badge--emerald' : 'badge--blue'}" style="font-size:10px;">
                    ${ex.completed ? 'Completed' : 'Pending'}
                  </span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Diet Activities -->
          <div>
            <h4 style="font-size:var(--text-sm);font-weight:700;color:var(--text-primary);margin-bottom:var(--space-3);display:flex;align-items:center;gap:6px;">
              🥗 Diet Activities (${diet.totalCalories})
            </h4>
            <div class="diet-meal-timeline">
              ${diet.meals.map((meal, idx) => `
                <div class="diet-meal-row" style="cursor:pointer;" onclick="App.showToast('info', 'Meal Tracked', '${meal.type} logged in nutrition journal.')">
                  <div class="diet-meal-row__header">
                    <div class="diet-meal-row__title">
                      <span>${meal.emoji}</span>
                      <span>${meal.type}</span>
                      <span style="font-size:10px;color:var(--text-muted);">(${meal.calories})</span>
                    </div>
                    <span class="badge ${idx < 2 ? 'badge--emerald' : 'badge--blue'}" style="font-size:10px;">
                      ${idx < 2 ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  <div class="diet-meal-row__items" style="font-size:11px;">
                    ${meal.items.slice(0, 2).join(' • ')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div style="margin-top:var(--space-4);text-align:right;">
          <button class="btn btn--secondary btn--sm" onclick="Dashboard.navigate('activities')">
            View Complete Weekly Activities Split →
          </button>
        </div>
      </div>

      <!-- 8. UPCOMING SESSIONS & 9. PROGRESS TRACKING -->
      <div class="two-column mb-6">
        
        <!-- 8. UPCOMING SESSIONS -->
        <div class="card card--flat">
          <div class="card__header">
            <div>
              <span class="dashboard-highlight-card__tag">8. UPCOMING SESSIONS</span>
              <h2 class="card__title" style="display:flex;align-items:center;gap:var(--space-2);margin-top:2px;">
                ${Components.icon('sessions')} 1-on-1 Video Coaching Sessions
              </h2>
              <p class="card__subtitle">Scheduled appointments with Coach Arjun Mehta</p>
            </div>
            <button class="btn btn--primary btn--sm" onclick="Dashboard.navigate('sessions')">
              + Book Session
            </button>
          </div>

          <div class="flex flex-col gap-3">
            ${sessions.map(s => `
              <div class="session-entry-card">
                <div class="session-entry-card__top">
                  <div class="session-entry-card__date">
                    📅 ${s.day}, ${s.date} · ⏰ ${s.time}
                  </div>
                  <span class="badge ${s.status === 'confirmed' ? 'badge--emerald' : 'badge--blue'}">
                    ● ${s.status.toUpperCase()}
                  </span>
                </div>
                <div style="font-size:var(--text-sm);font-weight:700;color:var(--text-primary);margin-bottom:2px;">
                  ${s.type} · ⏱️ 60 minutes
                </div>
                <div class="session-entry-card__topic">
                  🎯 <strong>Agenda:</strong> ${s.topic}
                </div>
                <div style="display:flex;gap:var(--space-2);margin-top:var(--space-2);">
                  <button class="btn btn--primary btn--sm" style="flex:1;" onclick="App.showToast('info', 'Joining Video Call', 'Opening 1-on-1 video call room with ${s.trainerName}...');">
                    ${Components.icon('video')} Join Session
                  </button>
                  <button class="btn btn--secondary btn--sm" onclick="Dashboard.navigate('sessions')">
                    Reschedule
                  </button>
                  <button class="btn btn--secondary btn--sm" onclick="App.showToast('info', 'Session Details', 'Coach: ${s.trainerName} | Status: Confirmed | Link ready.');">
                    View Details
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 9. PROGRESS TRACKING & CHARTS -->
        <div class="card card--flat">
          <div class="card__header">
            <div>
              <span class="dashboard-highlight-card__tag">9. PROGRESS TRACKING</span>
              <h2 class="card__title" style="display:flex;align-items:center;gap:var(--space-2);margin-top:2px;">
                ${Components.icon('progress')} Weight & Analytics Trend
              </h2>
              <p class="card__subtitle">Baseline ${progress.startWeight} kg → Current ${progress.currentWeight} kg (Target: ${progress.targetWeight} kg)</p>
            </div>
            <button class="btn btn--primary btn--sm" onclick="Dashboard.openLogProgressModal()">
              + Log Progress
            </button>
          </div>

          <div class="progress-chart-container mb-3" style="min-height:200px;">
            <canvas id="progress-chart" aria-label="Progress Chart"></canvas>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-2);margin-bottom:var(--space-3);text-align:center;">
            <div style="background:var(--bg-surface-hover);padding:var(--space-2);border-radius:var(--radius-md);">
              <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;">Total Lost</div>
              <div style="font-weight:700;color:var(--color-emerald-600);font-size:var(--text-sm);">-3.5 kg</div>
            </div>
            <div style="background:var(--bg-surface-hover);padding:var(--space-2);border-radius:var(--radius-md);">
              <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;">Body Fat</div>
              <div style="font-weight:700;color:var(--color-purple-600);font-size:var(--text-sm);">22.4% (-4.1%)</div>
            </div>
            <div style="background:var(--bg-surface-hover);padding:var(--space-2);border-radius:var(--radius-md);">
              <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;">Workouts</div>
              <div style="font-weight:700;color:var(--color-blue-600);font-size:var(--text-sm);">15 / 20 Done</div>
            </div>
          </div>

          <div class="progress-history">
            ${progress.recentHistory.slice(0, 3).map(h => Components.progressHistoryItem(h)).join('')}
          </div>
        </div>

      </div>

      <!-- 10. FIND TRAINERS DISCOVERY PREVIEW -->
      <div class="card card--flat mb-6">
        <div class="card__header">
          <div>
            <span class="dashboard-highlight-card__tag">10. FIND TRAINERS</span>
            <h2 class="card__title" style="display:flex;align-items:center;gap:var(--space-2);margin-top:2px;">
              ${Components.icon('trainers')} Explore Certified Expert Coaches
            </h2>
            <p class="card__subtitle">Browse verified personal trainers tailored to your fitness objectives</p>
          </div>
          <button class="btn btn--secondary btn--sm" onclick="Dashboard.navigate('trainers')">
            Browse All Trainers (${FitTrackData.trainersList.length}) →
          </button>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:var(--space-4);">
          ${FitTrackData.trainersList.slice(0, 3).map(t => `
            <div class="trainer-card" style="margin-bottom:0;">
              <div class="trainer-card__header">
                <div class="avatar avatar--lg avatar--placeholder" style="background:${t.avatarBg};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;">
                  ${t.avatarInitials}
                </div>
                <div>
                  <h4 style="font-size:var(--text-sm);font-weight:800;color:var(--text-primary);">${t.name}</h4>
                  <div style="font-size:11px;color:var(--color-primary);font-weight:600;">${t.specialization}</div>
                  <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">⭐ ${t.rating} · ${t.experience}</div>
                </div>
              </div>
              <p style="font-size:11px;color:var(--text-secondary);line-height:1.4;margin:var(--space-2) 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
                ${t.bio}
              </p>
              <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--border-light);padding-top:var(--space-2);margin-top:var(--space-2);">
                <span style="font-size:var(--text-xs);font-weight:700;color:var(--text-primary);">${t.rate}</span>
                <div style="display:flex;gap:4px;">
                  <button class="btn btn--secondary btn--sm" style="font-size:11px;padding:4px 8px;" onclick="Dashboard.navigate('plans')">Compare Plan</button>
                  <button class="btn btn--primary btn--sm" style="font-size:11px;padding:4px 8px;" onclick="Dashboard.bookWithTrainer('${t.name}')">Choose</button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /* ── 2. MAINTAIN PROFILE VIEW ── */
  renderProfileView() {
    const u = FitTrackData.currentUser;
    const bmi = (u.weight / ((u.height / 100) * (u.height / 100))).toFixed(1);

    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">${Components.icon('profile')} Maintain Profile</h1>
          <p class="view-subtitle">Manage personal information, health biometrics, and emergency contacts</p>
        </div>
        <button class="btn btn--primary" id="btn-save-profile">
          ${Components.icon('check')} Save Changes
        </button>
      </div>

      <div class="profile-layout">
        <div class="card card--flat profile-card-summary">
          <div class="profile-card__avatar-lg">${u.avatarInitials}</div>
          <h3 style="font-size:var(--text-lg);font-weight:700;">${u.fullName}</h3>
          <p style="font-size:var(--text-xs);color:var(--text-muted);">${u.email}</p>
          <div class="profile-stat-badge">${u.role.toUpperCase()} · ${u.subscription.toUpperCase()} MEMBER</div>

          <div class="bmi-meter-box">
            <div style="font-size:var(--text-xs);color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;">Calculated BMI</div>
            <div class="bmi-meter-box__value">${bmi} <span style="font-size:var(--text-sm);font-weight:400;color:var(--color-emerald-600);">(Normal / Healthy)</span></div>
            <p style="font-size:var(--text-xs);color:var(--text-muted);margin-top:4px;">Height: ${u.height}cm | Weight: ${u.weight}kg</p>
          </div>

          <div style="margin-top:var(--space-6);text-align:left;">
            <div style="font-size:var(--text-xs);font-weight:600;color:var(--text-muted);margin-bottom:6px;">MEMBERSHIP STATUS</div>
            <div style="font-size:var(--text-sm);"><strong>Plan:</strong> ${FitTrackData.activePlan.name}</div>
            <div style="font-size:var(--text-sm);margin-top:4px;"><strong>Trainer:</strong> ${FitTrackData.activeTrainer.name}</div>
            <div style="font-size:var(--text-sm);margin-top:4px;"><strong>Member Since:</strong> ${u.joinedDate}</div>
          </div>
        </div>

        <div class="card card--flat">
          <h3 class="card__title mb-4">Personal & Health Details</h3>
          <form id="form-profile" onsubmit="event.preventDefault(); Dashboard.handleSaveProfile();">
            <div class="profile-form-grid">
              <div class="form-group">
                <label class="form-label" for="prof-fullname">Full Name</label>
                <input type="text" class="form-input" id="prof-fullname" value="${u.fullName}" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="prof-email">Email Address</label>
                <input type="email" class="form-input" id="prof-email" value="${u.email}" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="prof-phone">Phone Number</label>
                <input type="text" class="form-input" id="prof-phone" value="${u.phone}">
              </div>

              <div class="form-group">
                <label class="form-label" for="prof-city">City / Location</label>
                <input type="text" class="form-input" id="prof-city" value="${u.city}">
              </div>

              <div class="form-group">
                <label class="form-label" for="prof-height">Height (cm)</label>
                <input type="number" class="form-input" id="prof-height" value="${u.height}">
              </div>

              <div class="form-group">
                <label class="form-label" for="prof-weight">Current Weight (kg)</label>
                <input type="number" step="0.1" class="form-input" id="prof-weight" value="${u.weight}">
              </div>

              <div class="form-group">
                <label class="form-label" for="prof-target-weight">Target Weight (kg)</label>
                <input type="number" step="0.1" class="form-input" id="prof-target-weight" value="${u.targetWeight}">
              </div>

              <div class="form-group">
                <label class="form-label" for="prof-bodyfat">Body Fat (%)</label>
                <input type="number" step="0.1" class="form-input" id="prof-bodyfat" value="${u.bodyFat}">
              </div>

              <div class="form-group">
                <label class="form-label" for="prof-fitness-lvl">Fitness Level</label>
                <select class="form-input" id="prof-fitness-lvl">
                  <option value="Beginner" ${u.fitnessLevel === 'Beginner' ? 'selected' : ''}>Beginner (0-6 months)</option>
                  <option value="Intermediate" ${u.fitnessLevel === 'Intermediate' ? 'selected' : ''}>Intermediate (6-24 months)</option>
                  <option value="Advanced" ${u.fitnessLevel === 'Advanced' ? 'selected' : ''}>Advanced (2+ years)</option>
                  <option value="Elite" ${u.fitnessLevel === 'Elite' ? 'selected' : ''}>Elite Athlete</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="prof-diet-pref">Dietary Preference</label>
                <input type="text" class="form-input" id="prof-diet-pref" value="${u.dietaryPreference}">
              </div>
            </div>

            <div class="form-group mt-4">
              <label class="form-label" for="prof-allergies">Allergies & Food Restrictions</label>
              <input type="text" class="form-input" id="prof-allergies" value="${u.allergies}">
            </div>

            <div class="form-group mt-4">
              <label class="form-label" for="prof-med-history">Medical History / Past Injuries</label>
              <textarea class="form-textarea" id="prof-med-history" rows="2">${u.medicalHistory}</textarea>
            </div>

            <div class="form-group mt-4">
              <label class="form-label" for="prof-emergency">Emergency Contact Details</label>
              <input type="text" class="form-input" id="prof-emergency" value="${u.emergencyContact}">
            </div>

            <div style="margin-top:var(--space-6);display:flex;justify-content:flex-end;gap:var(--space-3);">
              <button type="button" class="btn btn--secondary" onclick="Dashboard.navigate('dashboard')">Cancel</button>
              <button type="submit" class="btn btn--primary">Update Profile</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  /* ── 3. DEFINE A GOAL VIEW ── */
  renderGoalView() {
    const goal = FitTrackData.activeGoal;

    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">${Components.icon('goal')} Define a Fitness Goal</h1>
          <p class="view-subtitle">Set clear measurable targets, caloric thresholds, and a target deadline</p>
        </div>
        <button class="btn btn--primary" id="btn-save-goal" onclick="Dashboard.handleSaveGoal()">
          ${Components.icon('check')} Save Goal
        </button>
      </div>

      <div class="goal-progress-header">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--space-4);">
          <div>
            <span class="badge badge--emerald mb-2">Active Goal Program</span>
            <h2 style="font-size:var(--text-2xl);font-weight:700;color:#fff;">${goal.title}</h2>
            <p style="font-size:var(--text-sm);color:rgba(255,255,255,0.8);">${goal.goalType} · Started on ${this.formatGoalDate(goal.startDate)} · Target: ${this.formatGoalDate(goal.targetDate)}</p>
          </div>
          <div style="text-align:right;">
            <span style="font-size:var(--text-3xl);font-weight:800;color:var(--color-emerald-400);">${goal.progressPercentage}%</span>
            <div style="font-size:var(--text-xs);color:rgba(255,255,255,0.7);">Progress Achieved</div>
          </div>
        </div>

        <div class="progress-bar mt-4" style="background:rgba(255,255,255,0.2);">
          <div class="progress-bar__fill" style="width:${goal.progressPercentage}%;background:var(--color-emerald-400);"></div>
        </div>

        <div class="goal-progress-stats">
          <div class="goal-stat-item">
            <div class="goal-stat-item__label">Start Weight</div>
            <div class="goal-stat-item__val">${goal.startWeight} kg</div>
          </div>
          <div class="goal-stat-item">
            <div class="goal-stat-item__label">Current Weight</div>
            <div class="goal-stat-item__val">${goal.currentWeight} kg</div>
          </div>
          <div class="goal-stat-item">
            <div class="goal-stat-item__label">Target Weight</div>
            <div class="goal-stat-item__val" style="color:var(--color-emerald-400);">${goal.targetWeight} kg</div>
          </div>
          <div class="goal-stat-item">
            <div class="goal-stat-item__label">Days Remaining</div>
            <div class="goal-stat-item__val">${Math.max(0, goal.totalDays - goal.daysElapsed)} days</div>
          </div>
        </div>
      </div>

      <div class="card card--flat">
          <h3 class="card__title mb-4">Goal Parameters</h3>
          <form id="form-goal" onsubmit="event.preventDefault(); Dashboard.handleSaveGoal();">
            <div class="form-group">
              <label class="form-label" for="goal-title">Goal Program Title</label>
              <input type="text" class="form-input" id="goal-title" value="${goal.title}" required>
            </div>

            <div class="form-group">
              <label class="form-label" for="goal-type">Primary Focus Type</label>
              <select class="form-input" id="goal-type">
                ${this.renderGoalTypeOptions(goal.goalType)}
              </select>
            </div>

            <div class="profile-form-grid">
              <div class="form-group">
                <label class="form-label" for="goal-target-weight">Target Weight (kg)</label>
                <input type="number" step="0.1" class="form-input" id="goal-target-weight" value="${goal.targetWeight}" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="goal-target-cal">Daily Calorie Target (kcal)</label>
                <input type="number" class="form-input" id="goal-target-cal" value="${goal.targetCalories}" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="goal-workouts-week">Workouts / Week</label>
                <select class="form-input" id="goal-workouts-week">
                  <option value="3" ${Number(goal.targetWorkoutsPerWeek) === 3 ? 'selected' : ''}>3 Days (Full Body)</option>
                  <option value="4" ${Number(goal.targetWorkoutsPerWeek) === 4 ? 'selected' : ''}>4 Days (Upper / Lower)</option>
                  <option value="5" ${Number(goal.targetWorkoutsPerWeek) === 5 ? 'selected' : ''}>5 Days (Push / Pull / Legs)</option>
                  <option value="6" ${Number(goal.targetWorkoutsPerWeek) === 6 ? 'selected' : ''}>6 Days (Advanced PPL)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="goal-target-date">Target Deadline</label>
                <input type="date" class="form-input" id="goal-target-date" value="${goal.targetDate}" required>
              </div>
            </div>

            <button type="submit" class="btn btn--primary mt-4" style="width:100%;">Update & Commit Goal</button>
          </form>
        </div>
    `;
  },

  /* ── 4. BROWSE TRAINERS & DURATION-BASED PROGRAMMES ── */
  renderTrainersView() {
    const trainers = FitTrackData.trainersList || [];
    const filter = this.selectedTrainerFilter || 'all';
    const filteredTrainers = filter === 'all' 
      ? trainers 
      : trainers.filter(t => t.category === filter);

    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">${Components.icon('trainers')} Find Expert Trainers & Fitness Programmes</h1>
          <p class="view-subtitle">Browse certified trainers and their duration-based fitness programmes. Each trainer sets their own transparent programme price with ₹0 platform fees.</p>
        </div>
      </div>

      <div class="filter-tabs">
        <button class="filter-btn ${filter === 'all' ? 'active' : ''}" onclick="Dashboard.filterTrainers('all')">All Specialties</button>
        <button class="filter-btn ${filter === 'strength' ? 'active' : ''}" onclick="Dashboard.filterTrainers('strength')">Strength & Conditioning</button>
        <button class="filter-btn ${filter === 'hiit' ? 'active' : ''}" onclick="Dashboard.filterTrainers('hiit')">HIIT & Fat Loss</button>
        <button class="filter-btn ${filter === 'yoga' ? 'active' : ''}" onclick="Dashboard.filterTrainers('yoga')">Yoga & Mobility</button>
        <button class="filter-btn ${filter === 'nutrition' ? 'active' : ''}" onclick="Dashboard.filterTrainers('nutrition')">Nutrition & Diet</button>
      </div>

      <div class="trainers-grid" style="grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: var(--space-6);">
        ${filteredTrainers.map(t => {
          const progs = t.programmes || [];
          return `
            <div class="trainer-card" style="display:flex;flex-direction:column;justify-content:space-between;padding:var(--space-6);border-radius:var(--radius-xl);background:var(--bg-surface);box-shadow:var(--shadow-sm);border:1px solid var(--border-light);position:relative;">
              ${t.isAssigned ? '<span class="badge badge--emerald" style="position:absolute;top:16px;right:16px;font-size:11px;">Current Coach</span>' : ''}
              
              <div>
                <div class="trainer-card__header" style="margin-bottom:var(--space-4);">
                  <div class="trainer-card__avatar" style="background:${t.avatarBg};width:54px;height:54px;font-size:var(--text-lg);font-weight:800;">${t.avatarInitials}</div>
                  <div>
                    <h3 style="font-weight:700;font-size:var(--text-lg);color:var(--text-primary);">${t.name}</h3>
                    <div style="font-size:var(--text-xs);color:var(--text-muted);">${t.title}</div>
                    <div style="display:flex;align-items:center;gap:4px;margin-top:2px;font-size:var(--text-xs);color:#F59E0B;font-weight:600;">
                      ${Components.icon('star')} ${t.rating} <span style="color:var(--text-muted);font-weight:400;">(${t.reviewsCount} verified reviews)</span>
                    </div>
                  </div>
                </div>

                <p style="font-size:var(--text-xs);color:var(--text-secondary);line-height:1.6;margin-bottom:var(--space-3);">${t.bio}</p>

                <div class="trainer-card__badges" style="margin-bottom:var(--space-4);">
                  ${t.tags.map(tag => `<span class="trainer-tag">${tag}</span>`).join('')}
                </div>

                <!-- Duration-Based Programmes Section -->
                <div style="border-top:1px solid var(--border-light);padding-top:var(--space-4);margin-top:var(--space-2);">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-3);">
                    <h4 style="font-size:var(--text-xs);text-transform:uppercase;letter-spacing:0.05em;color:var(--text-primary);font-weight:800;display:flex;align-items:center;gap:6px;">
                      ${Components.icon('plans')} Available Programmes (${progs.length})
                    </h4>
                    <span style="font-size:11px;color:var(--color-primary);font-weight:600;">₹0 Platform Fee</span>
                  </div>

                  <div style="display:flex;flex-direction:column;gap:var(--space-3);">
                    ${progs.map(p => `
                      <div style="border:1px solid var(--border-light);border-radius:var(--radius-lg);padding:var(--space-3);background:var(--bg-surface-hover);transition:all 0.2s ease;">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
                          <div>
                            <div style="font-weight:700;font-size:var(--text-xs);color:var(--text-primary);line-height:1.3;">${p.title}</div>
                            <div style="display:flex;align-items:center;gap:8px;margin-top:3px;font-size:11px;color:var(--text-muted);">
                              <span class="badge badge--purple" style="font-size:10px;padding:1px 6px;">${p.duration}</span>
                              <span>${p.category || 'Fitness'}</span>
                            </div>
                          </div>
                          <div style="text-align:right;white-space:nowrap;">
                            <div style="font-size:var(--text-base);font-weight:800;color:var(--color-primary);">₹${p.price.toLocaleString('en-IN')}</div>
                            <span style="font-size:10px;color:var(--text-muted);">Total Programme Fee</span>
                          </div>
                        </div>

                        <div style="font-size:11px;color:var(--text-secondary);margin-top:6px;line-height:1.4;">
                          ${p.workoutFeatures}
                        </div>

                        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding-top:6px;border-top:1px dashed var(--border-light);">
                          <div style="display:flex;gap:4px;flex-wrap:wrap;">
                            ${(p.benefits || []).slice(0, 2).map(b => `<span style="font-size:10px;color:var(--color-emerald-700);background:#ECFDF5;padding:2px 6px;border-radius:4px;">✓ ${b}</span>`).join('')}
                          </div>
                          <button class="btn btn--primary btn--sm" style="font-size:11px;padding:4px 12px;" onclick="Dashboard.openPurchaseModal('${p.id}')">
                            Select Programme
                          </button>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>

              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:var(--space-4);padding-top:var(--space-3);border-top:1px solid var(--border-light);font-size:var(--text-xs);">
                <span><strong>Experience:</strong> ${t.experience}</span>
                <button class="btn btn--secondary btn--sm" style="font-size:11px;padding:4px 10px;" onclick="Dashboard.reviewTrainer('${t.name}')">Leave Review</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  /* ── 5. COMPARE PLANS VIEW (REMOVED: REDIRECTS TO TRAINERS) ── */
  renderPlansView() {
    return this.renderTrainersView();
  },

  /* ── 6. VIEW ASSIGNED ACTIVITIES VIEW ── */
  renderActivitiesView() {
    const isWorkouts = this.activeActivityTab === 'workouts';
    const workout = FitTrackData.todaysWorkout;
    const diet = FitTrackData.dietPlan;
    const weeklyWorkouts = FitTrackData.assignedActivities.workoutDays;

    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">${Components.icon('activities')} Assigned Activities</h1>
          <p class="view-subtitle">Your personalized workout splits and customized meal nutrition assigned by Coach Arjun</p>
        </div>
      </div>

      <div class="activity-tabs">
        <button class="activity-tab-btn ${isWorkouts ? 'active' : ''}" onclick="Dashboard.setActivityTab('workouts')">
          ${Components.icon('workout')} Assigned Workouts Schedule
        </button>
        <button class="activity-tab-btn ${!isWorkouts ? 'active' : ''}" onclick="Dashboard.setActivityTab('diet')">
          ${Components.icon('diet')} Assigned Nutrition & Diet Plan
        </button>
      </div>

      ${isWorkouts ? `
        <div class="two-column">
          <div class="card card--flat">
            <div class="card__header">
              <div>
                <h3 class="card__title" style="display:flex;align-items:center;gap:var(--space-2);">
                  ${Components.icon('fire')} Today: ${workout.title}
                </h3>
                <p class="card__subtitle">${workout.subtitle} · ~${workout.estimatedDuration}</p>
              </div>
              <span class="badge badge--emerald">${workout.exercises.filter(e => e.completed).length} / ${workout.exercises.length} Done</span>
            </div>

            <div id="exercise-list" role="list">
              ${workout.exercises.map((ex, i) => `
                <div class="exercise-row ${ex.completed ? 'completed' : ''}" data-exercise-id="${ex.id}" role="listitem">
                  <div class="exercise-row__number">${i + 1}</div>
                  <div class="exercise-row__checkbox ${ex.completed ? 'checked' : ''}" 
                       role="checkbox" 
                       aria-checked="${ex.completed}" 
                       tabindex="0"
                       data-exercise-id="${ex.id}">
                    ${ex.completed ? Components.icon('check') : ''}
                  </div>
                  <div class="exercise-row__info">
                    <div class="exercise-row__name">${ex.name}</div>
                    <div class="exercise-row__details">
                      <span class="exercise-row__detail-item">${ex.sets} sets</span>
                      <span class="exercise-row__detail-item">${ex.reps}</span>
                      <span class="exercise-row__detail-item">Load: ${ex.weight}</span>
                      <span class="exercise-row__detail-item">${ex.rest} rest</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="workout-section__actions">
              <button class="btn btn--primary" id="btn-mark-all-complete">Mark All Completed</button>
              <button class="btn btn--secondary" onclick="Dashboard.navigate('progress')">+ Log Workout Metrics</button>
            </div>
          </div>

          <div class="card card--flat">
            <h3 class="card__title mb-4">Weekly Assigned Routine Split</h3>
            ${weeklyWorkouts.map(w => `
              <div class="workout-day-card ${w.isToday ? 'active-day' : ''}">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span style="font-weight:700;font-size:var(--text-sm);color:${w.isToday ? 'var(--color-primary)' : 'var(--text-primary)'};">
                    ${w.day} ${w.isToday ? '(Today)' : ''}
                  </span>
                  <span class="badge ${w.status === 'Completed' ? 'badge--emerald' : w.status === 'In Progress' ? 'badge--amber' : 'badge--gray'}">
                    ${w.status}
                  </span>
                </div>
                <div style="font-size:var(--text-sm);font-weight:600;margin-top:4px;">${w.title}</div>
                <div style="font-size:var(--text-xs);color:var(--text-muted);margin-top:2px;">${w.exercisesCount} exercises · ~${w.duration}</div>
                <p style="font-size:var(--text-xs);color:var(--text-secondary);background:var(--bg-surface-hover);padding:6px 10px;border-radius:var(--radius-sm);margin-top:8px;">
                  💡 <strong>Coach Tip:</strong> ${w.trainerTip}
                </p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : `
        <div class="card card--flat mb-6">
          <div class="card__header">
            <div>
              <h2 class="card__title" style="display:flex;align-items:center;gap:var(--space-2);">
                ${Components.icon('diet')} Daily Nutrition Blueprint (${diet.date})
              </h2>
              <p class="card__subtitle">Target: ${diet.totalCalories}</p>
            </div>
            <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;">
              <span class="badge badge--emerald">Protein: ${diet.macros.protein}</span>
              <span class="badge badge--blue">Carbs: ${diet.macros.carbs}</span>
              <span class="badge badge--amber">Fats: ${diet.macros.fats}</span>
              <span class="badge badge--purple">Fiber: ${diet.macros.fiber}</span>
            </div>
          </div>
          <div class="diet-grid">
            ${diet.meals.map(meal => Components.mealCard(meal)).join('')}
          </div>
        </div>
      `}
    `;
  },

  /* ── 7. BOOK SESSIONS VIEW ── */
  renderSessionsView() {
    const upcoming = FitTrackData.upcomingSessions;
    const past = FitTrackData.pastSessions;
    const trainers = FitTrackData.trainersList;

    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">${Components.icon('sessions')} Book Coaching Sessions</h1>
          <p class="view-subtitle">Schedule 1-on-1 video consultations, form audits, and dietary planning with your trainer</p>
        </div>
      </div>

      <div class="booking-grid">
        <div class="card card--flat">
          <h3 class="card__title mb-4">Book a New Session</h3>
          <form id="form-book-session" onsubmit="event.preventDefault(); Dashboard.handleBookSession();">
            <div class="form-group">
              <label class="form-label" for="book-trainer">Select Trainer</label>
              <select class="form-input" id="book-trainer">
                ${trainers.map(t => `<option value="${t.name}">${t.name} (${t.specialization})</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="book-type">Session Type</label>
              <select class="form-input" id="book-type">
                <option value="1-on-1 Video Coaching">1-on-1 Video Coaching (60 min)</option>
                <option value="Squat & Deadlift Form Audit">Squat & Deadlift Form Audit (45 min)</option>
                <option value="Diet & Macro Nutrition Strategy">Diet & Macro Nutrition Strategy (30 min)</option>
                <option value="Monthly Fitness Assessment">Monthly Fitness Assessment (45 min)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="book-date">Choose Date</label>
              <input type="date" class="form-input" id="book-date" value="2026-09-28" required>
            </div>

            <div class="form-group">
              <label class="form-label">Available Time Slots</label>
              <div class="slot-picker" id="slot-picker">
                <div class="slot-btn selected" data-slot="08:00 AM – 09:00 AM" onclick="Dashboard.selectSlot(this)">🌅 08:00 AM – 09:00 AM</div>
                <div class="slot-btn" data-slot="11:30 AM – 12:30 PM" onclick="Dashboard.selectSlot(this)">☀️ 11:30 AM – 12:30 PM</div>
                <div class="slot-btn" data-slot="04:00 PM – 05:00 PM" onclick="Dashboard.selectSlot(this)">🥤 04:00 PM – 05:00 PM</div>
                <div class="slot-btn" data-slot="06:00 PM – 07:00 PM" onclick="Dashboard.selectSlot(this)">🌙 06:00 PM – 07:00 PM</div>
              </div>
            </div>

            <div class="form-group mt-4">
              <label class="form-label" for="book-notes">Session Goal / Notes for Coach</label>
              <textarea class="form-textarea" id="book-notes" rows="2" placeholder="e.g., Check my knee tracking on heavy back squats..."></textarea>
            </div>

            <button type="submit" class="btn btn--primary mt-4" style="width:100%;">
              ${Components.icon('checkCircle')} Confirm & Book Session
            </button>
          </form>
        </div>

        <div class="flex flex-col gap-6">
          <div class="card card--flat">
            <div class="card__header">
              <h3 class="card__title">Scheduled Upcoming Sessions</h3>
              <span class="badge badge--blue">${upcoming.length} active</span>
            </div>
            <div class="flex flex-col gap-4">
              ${upcoming.map(s => Components.sessionCard(s)).join('')}
            </div>
          </div>

          <div class="card card--flat">
            <h3 class="card__title mb-3">Past Completed Sessions</h3>
            <div class="flex flex-col gap-3">
              ${past.map(p => `
                <div style="border:1px solid var(--border-light);border-radius:var(--radius-md);padding:var(--space-3) var(--space-4);background:var(--bg-surface-hover);">
                  <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--text-muted);">
                    <span>${p.trainerName}</span>
                    <span>${p.date}</span>
                  </div>
                  <div style="font-size:var(--text-sm);font-weight:600;margin-top:2px;">${p.type}</div>
                  <div style="font-size:var(--text-xs);color:var(--text-secondary);margin-top:4px;">💬 <strong>Feedback:</strong> ${p.trainerFeedback}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /* ── 8. RECORD PROGRESS VIEW ── */
  renderProgressView() {
    const p = FitTrackData.progressData;

    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">${Components.icon('progress')} Record Progress</h1>
          <p class="view-subtitle">Track your body weight, body fat %, workout notes, and see your transformative trends</p>
        </div>
      </div>

      <div class="progress-record-layout">
        <div class="card card--flat">
          <h3 class="card__title mb-4">Log Today's Measurement</h3>
          <form id="form-record-progress" onsubmit="event.preventDefault(); Dashboard.handleRecordProgress();">
            <div class="form-group">
              <label class="form-label" for="rec-date">Date</label>
              <input type="date" class="form-input" id="rec-date" value="2026-09-24" required>
            </div>

            <div class="form-group">
              <label class="form-label" for="rec-weight">Current Weight (kg)</label>
              <input type="number" step="0.1" class="form-input" id="rec-weight" value="${p.currentWeight}" required>
            </div>

            <div class="form-group">
              <label class="form-label" for="rec-bodyfat">Body Fat (%) [Optional]</label>
              <input type="number" step="0.1" class="form-input" id="rec-bodyfat" value="${p.currentBodyFat}">
            </div>

            <div class="form-group">
              <label class="form-label" for="rec-workouts">Workouts Done This Week</label>
              <input type="number" class="form-input" id="rec-workouts" value="4">
            </div>

            <div class="form-group">
              <label class="form-label" for="rec-notes">Workout / Energy Notes</label>
              <textarea class="form-textarea" id="rec-notes" rows="3" placeholder="e.g. Completed 6 exercises, hit PR on bench press..."></textarea>
            </div>

            <button type="submit" class="btn btn--primary mt-2" style="width:100%;">
              ${Components.icon('plus')} Save Progress Entry
            </button>
          </form>
        </div>

        <div class="flex flex-col gap-6">
          <div class="card card--flat">
            <div class="card__header">
              <div>
                <h3 class="card__title">Weight Loss & Strength Trajectory</h3>
                <p class="card__subtitle">Started at 68.0 kg → Current: ${p.currentWeight} kg (-3.5 kg)</p>
              </div>
              <span class="badge badge--emerald">On Track</span>
            </div>
            <div class="progress-chart-container mb-4">
              <canvas id="progress-chart" aria-label="Progress Trajectory"></canvas>
            </div>
          </div>

          <div class="card card--flat">
            <h3 class="card__title mb-4">Logged Progress History</h3>
            <div class="table-container">
              <table class="fittrack-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Weight</th>
                    <th>Body Fat</th>
                    <th>Workouts/Wk</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody id="progress-table-body">
                  ${p.weightLogs.slice().reverse().map(log => `
                    <tr>
                      <td><strong>${log.date}</strong></td>
                      <td><span class="badge badge--emerald">${log.weight} kg</span></td>
                      <td>${log.bodyFat ? log.bodyFat + '%' : '—'}</td>
                      <td>${log.workouts}</td>
                      <td style="color:var(--text-secondary);">${log.notes}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /* ── 9. COMMUNICATE WITH TRAINER (CHAT) ── */
  renderMessagesView() {
    // Mark all user messages as read when opening messages view
    FitTrackData.markAllUserMessagesAsRead();
    this.updateBadges();

    const trainer = FitTrackData.activeTrainer;
    const messages = FitTrackData.chatMessages;

    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">${Components.icon('messages')} Communicate with Trainer</h1>
          <p class="view-subtitle">Direct 1-on-1 private messaging channel with your assigned coach, Arjun Mehta</p>
        </div>
        <button class="btn btn--primary btn--sm" onclick="Dashboard.navigate('sessions')">
          ${Components.icon('video')} Start Video Session
        </button>
      </div>

      <div class="chat-container">
        <div class="chat-header">
          <div class="chat-trainer-info">
            <div class="avatar avatar--md avatar--placeholder" style="background:#059669;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;">
              ${trainer.avatarInitials}
            </div>
            <div>
              <div style="font-weight:700;font-size:var(--text-base);">${trainer.name}</div>
              <div style="font-size:var(--text-xs);color:var(--text-muted);display:flex;align-items:center;gap:4px;">
                <span class="online-dot"></span> Online & Active Coach · ${trainer.specialization}
              </div>
            </div>
          </div>
          <span class="badge badge--emerald">Pro Member Chat</span>
        </div>

        <div class="chat-body" id="chat-body">
          ${messages.map(m => `
            <div class="chat-message ${m.sender}" data-msg-id="${m.id}" onclick="Dashboard.handleUserMessageClick('${m.id}')">
              <div class="avatar avatar--sm avatar--placeholder" style="background:${m.sender === 'user' ? '#10B981' : '#059669'};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;">
                ${m.avatar}
              </div>
              <div>
                <div class="chat-bubble">${m.text}</div>
                <div class="chat-time">${m.time}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="chat-suggestions">
          <button class="suggestion-chip" onclick="Dashboard.sendQuickReply('How should I adjust my calories for recovery day?')">🍽️ Adjust calories on rest day</button>
          <button class="suggestion-chip" onclick="Dashboard.sendQuickReply('Can you review my squat video from today?')">🏋️‍♂️ Form review on squats</button>
          <button class="suggestion-chip" onclick="Dashboard.sendQuickReply('Finished all exercises today with great energy!')">💪 Finished today\\'s workout</button>
          <button class="suggestion-chip" onclick="Dashboard.sendQuickReply('Can we confirm Saturday 6 PM video call?')">📅 Confirm video session</button>
        </div>

        <form class="chat-footer" id="chat-form" onsubmit="event.preventDefault(); Dashboard.handleSendMessage();">
          <input type="text" class="chat-input" id="chat-input-text" placeholder="Type a message to Coach Arjun..." autocomplete="off" required>
          <button type="submit" class="btn btn--primary" style="border-radius:var(--radius-full);padding:var(--space-2) var(--space-5);">
            ${Components.icon('send')} Send
          </button>
        </form>
      </div>
    `;
  },

  handleUserMessageClick(msgId) {
    if (FitTrackData.markUserMessageAsRead(msgId)) {
      this.updateBadges();
    }
  },

  /* ── 10. SUBMIT A REVIEW VIEW ── */
  renderReviewsView() {
    const reviews = FitTrackData.trainerReviews;
    const trainers = FitTrackData.trainersList;

    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">${Components.icon('reviews')} Submit a Trainer Review</h1>
          <p class="view-subtitle">Share your feedback, rate your coach's expertise, and help fellow members achieve their goals</p>
        </div>
      </div>

      <div class="two-column">
        <div class="card card--flat">
          <h3 class="card__title mb-4">Write a Review</h3>
          <form id="form-submit-review" onsubmit="event.preventDefault(); Dashboard.handleSubmitReview();">
            <div class="form-group">
              <label class="form-label" for="review-trainer-select">Trainer to Review</label>
              <select class="form-input" id="review-trainer-select">
                ${trainers.map(t => `<option value="${t.name}">${t.name} (${t.specialization})</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Star Rating (1 to 5 Stars)</label>
              <div class="star-rating-picker" id="star-picker">
                <span class="star-pick active" data-rating="1" onclick="Dashboard.setRating(1)">★</span>
                <span class="star-pick active" data-rating="2" onclick="Dashboard.setRating(2)">★</span>
                <span class="star-pick active" data-rating="3" onclick="Dashboard.setRating(3)">★</span>
                <span class="star-pick active" data-rating="4" onclick="Dashboard.setRating(4)">★</span>
                <span class="star-pick active" data-rating="5" onclick="Dashboard.setRating(5)">★</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="review-tag">Primary Highlight Tag</label>
              <select class="form-input" id="review-tag">
                <option value="Form & Technique Check">Form & Technique Check</option>
                <option value="Strength & Hypertrophy">Strength & Hypertrophy</option>
                <option value="Diet & Macro Nutrition">Diet & Macro Nutrition</option>
                <option value="Extreme Motivation & Support">Extreme Motivation & Support</option>
                <option value="Prompt Chat Responses">Prompt Chat Responses</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="review-text">Your Feedback & Experience</label>
              <textarea class="form-textarea" id="review-text" rows="4" placeholder="How did this coach help you reach your goals? What was their coaching style like?" required></textarea>
            </div>

            <button type="submit" class="btn btn--primary mt-2" style="width:100%;">
              ${Components.icon('star')} Submit Verified Review
            </button>
          </form>
        </div>

        <div class="card card--flat">
          <div class="card__header">
            <h3 class="card__title">Verified Member Reviews</h3>
            <span class="badge badge--emerald">${reviews.length} total reviews</span>
          </div>
          <div class="reviews-feed" id="reviews-feed">
            ${reviews.map(r => `
              <div class="review-card">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                  <div style="display:flex;gap:var(--space-3);align-items:center;">
                    <div class="avatar avatar--sm avatar--placeholder" style="background:#10B981;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;">
                      ${r.authorInitials}
                    </div>
                    <div>
                      <div style="font-weight:700;font-size:var(--text-sm);">${r.authorName}</div>
                      <div style="font-size:var(--text-xs);color:var(--text-muted);">Reviewed <strong>${r.trainerName}</strong> · ${r.date}</div>
                    </div>
                  </div>
                  <span class="badge badge--purple" style="font-size:11px;">${r.tag}</span>
                </div>

                <div class="review-card__stars mt-2">
                  ${'★'.repeat(r.rating)}
                </div>

                <p style="font-size:var(--text-sm);color:var(--text-secondary);line-height:var(--leading-relaxed);margin-top:var(--space-2);">
                  "${r.comment}"
                </p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  /* ── 11. MY PLAN (DEDICATED FULL VIEW) ── */
  renderMyPlanView() {
    const plan = FitTrackData.activePlan;
    const trainer = FitTrackData.activeTrainer;

    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">${Components.icon('purchase')} My Active Plan & Subscription</h1>
          <p class="view-subtitle">Manage your coaching tier, billing renewal cycles, features breakdown, and trainer assignment</p>
        </div>
        <div style="display:flex;gap:var(--space-2);">
          <button class="btn btn--secondary" onclick="Dashboard.navigate('plans')">
            Upgrade / Compare Plans
          </button>
          <button class="btn btn--primary" onclick="Dashboard.navigate('messages')">
            ${Components.icon('messages')} Contact Trainer
          </button>
        </div>
      </div>

      <div class="two-column mb-6">
        <!-- Main Plan Status Card -->
        <div class="card card--flat">
          <div class="card__header">
            <div>
              <span class="badge badge--purple mb-2">ACTIVE SUBSCRIPTION</span>
              <h2 class="card__title" style="font-size:var(--text-2xl);">${plan.name}</h2>
              <p class="card__subtitle">All-Inclusive Personal Coaching & Custom Nutrition Blueprint</p>
            </div>
            <div style="text-align:right;">
              <span style="font-size:var(--text-2xl);font-weight:800;color:var(--color-purple-700);">${plan.price}</span>
              <div style="font-size:var(--text-xs);color:var(--text-muted);">billed monthly</div>
            </div>
          </div>

          <div style="background:var(--bg-surface-hover);border:1px solid var(--border-light);border-radius:var(--radius-lg);padding:var(--space-4);margin-bottom:var(--space-4);">
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:var(--text-sm);font-weight:700;margin-bottom:6px;">
              <span>Current Billing Period</span>
              <span style="color:var(--color-primary);">${plan.daysRemaining} Days Remaining</span>
            </div>
            <div class="duration-progress-bar" style="height:10px;margin-bottom:6px;">
              <div class="duration-progress-bar__fill" style="width: 53%;"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);color:var(--text-muted);">
              <span>Cycle Started: <strong>${plan.startDate}</strong></span>
              <span>Next Auto-Renewal: <strong>${plan.endDate}</strong></span>
            </div>
          </div>

          <div style="margin-bottom:var(--space-4);">
            <h4 style="font-size:var(--text-sm);font-weight:700;color:var(--text-primary);margin-bottom:var(--space-3);">Included Coaching Features</h4>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);">
              <div style="display:flex;align-items:center;gap:8px;font-size:var(--text-xs);">
                <span style="color:var(--color-emerald-600);font-weight:bold;">✓</span> Dedicated Personal Trainer (Arjun Mehta)
              </div>
              <div style="display:flex;align-items:center;gap:8px;font-size:var(--text-xs);">
                <span style="color:var(--color-emerald-600);font-weight:bold;">✓</span> 2 Monthly 1-on-1 Video Consultations
              </div>
              <div style="display:flex;align-items:center;gap:8px;font-size:var(--text-xs);">
                <span style="color:var(--color-emerald-600);font-weight:bold;">✓</span> Customized Weekly Workout Schedules
              </div>
              <div style="display:flex;align-items:center;gap:8px;font-size:var(--text-xs);">
                <span style="color:var(--color-emerald-600);font-weight:bold;">✓</span> Personalized Macro-Nutrient Diet Targets
              </div>
              <div style="display:flex;align-items:center;gap:8px;font-size:var(--text-xs);">
                <span style="color:var(--color-emerald-600);font-weight:bold;">✓</span> Form Audit Video Reviews in Chat
              </div>
              <div style="display:flex;align-items:center;gap:8px;font-size:var(--text-xs);">
                <span style="color:var(--color-emerald-600);font-weight:bold;">✓</span> Unlimited Direct In-App Chat Messaging
              </div>
            </div>
          </div>

          <div style="display:flex;gap:var(--space-2);border-top:1px solid var(--border-light);padding-top:var(--space-3);">
            <button class="btn btn--secondary btn--sm" onclick="App.showToast('info', 'Subscription Settings', 'Auto-renew is active on Visa ending in •••• 4242.');">
              Manage Payment Method
            </button>
            <button class="btn btn--secondary btn--sm" style="color:var(--color-red-600);" onclick="App.showToast('warning', 'Cancel Subscription', 'Please contact support or your coach before cancelling.');">
              Pause / Cancel Membership
            </button>
          </div>
        </div>

        <!-- Assigned Trainer Card -->
        <div class="card card--flat">
          <div class="card__header">
            <div>
              <span class="badge badge--emerald mb-2">ASSIGNED COACH</span>
              <h3 class="card__title">${trainer.name}</h3>
              <p class="card__subtitle">${trainer.specialization} · ${trainer.experience}</p>
            </div>
            <div class="avatar avatar--lg avatar--placeholder" style="background:#059669;color:#fff;font-weight:800;font-size:var(--text-base);display:flex;align-items:center;justify-content:center;">
              ${trainer.avatarInitials}
            </div>
          </div>

          <p style="font-size:var(--text-xs);color:var(--text-secondary);line-height:1.5;margin-bottom:var(--space-4);">
            "${trainer.bio}"
          </p>

          <div style="background:var(--bg-surface-hover);border-radius:var(--radius-md);padding:var(--space-3);margin-bottom:var(--space-4);font-size:var(--text-xs);">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span style="color:var(--text-muted);">Coach Rating:</span>
              <strong>⭐ ${trainer.rating} / 5.0 (${trainer.reviewsCount} reviews)</strong>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span style="color:var(--text-muted);">Certifications:</span>
              <strong>${trainer.certifications.join(', ')}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="color:var(--text-muted);">Next Scheduled Session:</span>
              <strong style="color:var(--color-primary);">Today, 6:00 PM</strong>
            </div>
          </div>

          <div style="display:flex;gap:var(--space-2);">
            <button class="btn btn--primary btn--sm" style="flex:1;" onclick="Dashboard.navigate('messages')">
              ${Components.icon('messages')} Chat with Coach
            </button>
            <button class="btn btn--secondary btn--sm" style="flex:1;" onclick="Dashboard.navigate('sessions')">
              ${Components.icon('sessions')} Book Next Call
            </button>
          </div>
        </div>
      </div>

      <!-- Invoicing & Billing History -->
      <div class="card card--flat">
        <div class="card__header">
          <h3 class="card__title">Billing & Invoicing History</h3>
          <span class="badge badge--emerald">Status: Good Standing</span>
        </div>
        <div class="table-container">
          <table class="fittrack-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>#FT-98421</strong></td>
                <td>Sep 15, 2026</td>
                <td>Pro Coaching Monthly Membership Plan</td>
                <td><strong>$59.00</strong></td>
                <td><span class="badge badge--emerald">PAID</span></td>
                <td><button class="btn btn--secondary btn--sm" style="font-size:11px;padding:3px 8px;" onclick="App.showToast('info', 'Downloading PDF', 'Invoice #FT-98421 PDF downloaded.')">Download PDF</button></td>
              </tr>
              <tr>
                <td><strong>#FT-91024</strong></td>
                <td>Aug 15, 2026</td>
                <td>Pro Coaching Monthly Membership Plan</td>
                <td><strong>$59.00</strong></td>
                <td><span class="badge badge--emerald">PAID</span></td>
                <td><button class="btn btn--secondary btn--sm" style="font-size:11px;padding:3px 8px;" onclick="App.showToast('info', 'Downloading PDF', 'Invoice #FT-91024 PDF downloaded.')">Download PDF</button></td>
              </tr>
              <tr>
                <td><strong>#FT-85412</strong></td>
                <td>Jul 15, 2026</td>
                <td>Starter Fitness Access Package</td>
                <td><strong>$39.00</strong></td>
                <td><span class="badge badge--emerald">PAID</span></td>
                <td><button class="btn btn--secondary btn--sm" style="font-size:11px;padding:3px 8px;" onclick="App.showToast('info', 'Downloading PDF', 'Invoice #FT-85412 PDF downloaded.')">Download PDF</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  /* ── 12. NOTIFICATIONS VIEW ── */
  renderNotificationsView() {
    const notifs = FitTrackData.notifications;
    const unreadCount = notifs.filter(n => !n.read).length;

    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">${Components.icon('bell')} Notifications & Alerts</h1>
          <p class="view-subtitle">Stay updated on assigned workouts, message replies, upcoming video sessions, and billing</p>
        </div>
        <div style="display:flex;gap:var(--space-2);">
          <button class="btn btn--secondary" onclick="Dashboard.markAllNotificationsRead()">
            Mark All as Read (${unreadCount})
          </button>
        </div>
      </div>

      <div class="card card--flat">
        <div class="card__header">
          <div>
            <h3 class="card__title">Recent Activity Feed</h3>
            <p class="card__subtitle">${unreadCount} unread system notifications</p>
          </div>
          <div style="display:flex;gap:var(--space-2);">
            <button class="btn btn--secondary btn--sm filter-btn active" onclick="App.showToast('info', 'Filter', 'Showing all notifications.')">All (${notifs.length})</button>
            <button class="btn btn--secondary btn--sm filter-btn" onclick="App.showToast('info', 'Filter', 'Showing workouts alerts.')">Workouts</button>
            <button class="btn btn--secondary btn--sm filter-btn" onclick="App.showToast('info', 'Filter', 'Showing messages alerts.')">Messages</button>
          </div>
        </div>

        <div class="notification-feed-list">
          ${notifs.map(n => `
            <div class="notification-feed-item ${!n.read ? 'unread' : ''}" style="cursor:pointer;" onclick="Dashboard.handleNotificationClick('${n.id}', '${n.actionView}')">
              <div class="notification-feed-item__icon" style="background:${!n.read ? 'var(--color-emerald-100)' : 'var(--bg-surface-hover)'};color:${!n.read ? 'var(--color-emerald-700)' : 'var(--text-muted)'};">
                ${n.type === 'message' ? '💬' : n.type === 'workout' ? '🏋️' : n.type === 'session' ? '📅' : '🔔'}
              </div>
              <div class="notification-feed-item__content">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <strong style="color:var(--text-primary);">${n.title}</strong>
                  <span class="notification-feed-item__time">${n.time}</span>
                </div>
                <div style="color:var(--text-secondary);margin-top:2px;">${n.message}</div>
                ${!n.read ? '<span class="badge badge--emerald" style="font-size:9px;padding:1px 6px;margin-top:4px;">NEW</span>' : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  handleNotificationClick(notifId, actionView) {
    FitTrackData.markNotificationAsRead(notifId, false);
    this.updateBadges();
    if (actionView) {
      this.navigate(actionView);
    } else {
      this.renderCurrentView();
    }
  },

  /* ── 13. SETTINGS VIEW ── */
  renderSettingsView() {
    const u = FitTrackData.currentUser;

    return `
      <div class="view-header">
        <div>
          <h1 class="view-title">${Components.icon('settings')} Account & App Settings</h1>
          <p class="view-subtitle">Manage biometrics preferences, reminder schedules, security, and interface configuration</p>
        </div>
        <button class="btn btn--primary" onclick="App.showToast('success', 'Settings Saved! ⚙️', 'Your preferences and notifications schedule have been committed.');">
          ${Components.icon('check')} Save Preferences
        </button>
      </div>

      <div class="two-column">
        <!-- Notification & Reminders Settings -->
        <div class="card card--flat">
          <h3 class="card__title mb-4">Notification Preferences</h3>
          <div class="flex flex-col gap-4">
            <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:var(--space-3);border-bottom:1px solid var(--border-light);">
              <div>
                <div style="font-weight:700;font-size:var(--text-sm);">Daily Workout Reminders</div>
                <div style="font-size:var(--text-xs);color:var(--text-muted);">Receive a push reminder at 7:00 AM on workout days</div>
              </div>
              <input type="checkbox" checked style="width:20px;height:20px;accent-color:var(--color-primary);">
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:var(--space-3);border-bottom:1px solid var(--border-light);">
              <div>
                <div style="font-weight:700;font-size:var(--text-sm);">Coach Chat Instant Alerts</div>
                <div style="font-size:var(--text-xs);color:var(--text-muted);">Push alerts when Coach Arjun sends a message or form feedback</div>
              </div>
              <input type="checkbox" checked style="width:20px;height:20px;accent-color:var(--color-primary);">
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:var(--space-3);border-bottom:1px solid var(--border-light);">
              <div>
                <div style="font-weight:700;font-size:var(--text-sm);">Meal & Macro Logging Reminders</div>
                <div style="font-size:var(--text-xs);color:var(--text-muted);">Evening reminder at 8:30 PM to log daily caloric intake</div>
              </div>
              <input type="checkbox" checked style="width:20px;height:20px;accent-color:var(--color-primary);">
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div style="font-weight:700;font-size:var(--text-sm);">Weekly Sunday Progress Audit</div>
                <div style="font-size:var(--text-xs);color:var(--text-muted);">Prompt to record weigh-in and body fat measurements</div>
              </div>
              <input type="checkbox" checked style="width:20px;height:20px;accent-color:var(--color-primary);">
            </div>
          </div>
        </div>

        <!-- Preferences & Units -->
        <div class="card card--flat">
          <h3 class="card__title mb-4">Measurement & Display Units</h3>
          <form onsubmit="event.preventDefault(); App.showToast('success', 'Preferences Updated', 'Units updated.');">
            <div class="form-group">
              <label class="form-label" for="set-units">Weight & Height Units</label>
              <select class="form-input" id="set-units">
                <option value="metric" selected>Metric (kg, cm)</option>
                <option value="imperial">Imperial (lbs, ft/in)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="set-tz">Timezone</label>
              <select class="form-input" id="set-tz">
                <option value="Asia/Kolkata" selected>India Standard Time (IST, UTC+5:30)</option>
                <option value="America/New_York">Eastern Time (ET, UTC-5)</option>
                <option value="Europe/London">Greenwich Mean Time (GMT, UTC+0)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="set-theme">Dashboard Visual Theme</label>
              <select class="form-input" id="set-theme" onchange="App.setTheme(this.value)">
                <option value="light" selected>Clean Modern Light</option>
                <option value="dark">Sleek Cyber Dark</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="set-privacy">Privacy Mode</label>
              <select class="form-input" id="set-privacy">
                <option value="trainer_only" selected>Only Assigned Coach can see biometrics</option>
                <option value="community">Allow Community Leaderboard display</option>
              </select>
            </div>

            <button type="submit" class="btn btn--primary mt-2" style="width:100%;">Save Preferences</button>
          </form>
        </div>
      </div>
    `;
  },

  /* ── MODALS (Purchase Plan, Register, Edit Goal, Log Progress) ── */
  renderModals() {
    return `
      <!-- Session Details Modal -->
      <div class="modal-overlay" id="session-details-modal-overlay" role="dialog" aria-modal="true">
        <div class="modal" style="max-width:560px;">
          <div class="modal__header">
            <h3 class="modal__title">1-on-1 Session Details</h3>
            <button class="modal__close" data-modal-close="session-details-modal">${Components.icon('x')}</button>
          </div>
          <div class="modal__body" id="session-details-modal-body">
            <!-- Populated dynamically by showSessionDetails -->
          </div>
        </div>
      </div>

      <!-- Reschedule Session Modal -->
      <div class="modal-overlay" id="session-reschedule-modal-overlay" role="dialog" aria-modal="true">
        <div class="modal" style="max-width:520px;">
          <div class="modal__header">
            <h3 class="modal__title">Reschedule Session</h3>
            <button class="modal__close" data-modal-close="session-reschedule-modal">${Components.icon('x')}</button>
          </div>
          <div class="modal__body">
            <form id="form-reschedule-session-modal" onsubmit="event.preventDefault(); Dashboard.handleConfirmReschedule();">
              <input type="hidden" id="resched-session-id">
              <div style="background:var(--bg-surface-hover);padding:12px;border-radius:var(--radius-md);margin-bottom:14px;border:1px solid var(--border-light);">
                <div style="font-size:11px;color:var(--text-muted);font-weight:700;text-transform:uppercase;">CLIENT & SESSION TYPE</div>
                <div style="font-size:15px;font-weight:700;color:var(--text-primary);margin-top:2px;" id="resched-client-name">-</div>
                <div style="font-size:12px;color:var(--text-secondary);margin-top:4px;" id="resched-current-info">-</div>
              </div>
              <div class="profile-form-grid">
                <div class="form-group">
                  <label class="form-label" for="resched-date">New Date</label>
                  <input type="date" class="form-input" id="resched-date" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="resched-time">New Time Slot</label>
                  <select class="form-input" id="resched-time">
                    <option value="08:00 AM – 09:00 AM">08:00 AM – 09:00 AM</option>
                    <option value="10:00 AM – 11:00 AM">10:00 AM – 11:00 AM</option>
                    <option value="11:30 AM – 12:30 PM">11:30 AM – 12:30 PM</option>
                    <option value="04:00 PM – 05:00 PM">04:00 PM – 05:00 PM</option>
                    <option value="05:00 PM – 06:00 PM">05:00 PM – 06:00 PM</option>
                    <option value="06:00 PM – 07:00 PM" selected>06:00 PM – 07:00 PM</option>
                  </select>
                </div>
              </div>
              <div class="form-group mt-3">
                <label class="form-label" for="resched-reason">Updated Agenda / Topic</label>
                <input type="text" class="form-input" id="resched-reason" value="Form Check & Progress Audit">
              </div>
              <div class="modal__footer" style="padding:0;border:none;margin-top:var(--space-4);">
                <button type="button" class="btn btn--secondary" data-modal-close="session-reschedule-modal">Cancel</button>
                <button type="submit" class="btn btn--primary">${Components.icon('checkCircle')} Confirm New Time</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Public Profile Preview Modal -->
      <div class="modal-overlay" id="preview-profile-modal-overlay" role="dialog" aria-modal="true">
        <div class="modal" style="max-width:480px;text-align:center;">
          <div class="modal__header">
            <h3 class="modal__title">Public Trainer Storefront Card</h3>
            <button class="modal__close" data-modal-close="preview-profile-modal">${Components.icon('x')}</button>
          </div>
          <div class="modal__body" id="preview-profile-modal-body" style="padding:var(--space-4);">
            <!-- Populated dynamically -->
          </div>
          <div class="modal__footer" style="justify-content:center;">
            <button class="btn btn--secondary" data-modal-close="preview-profile-modal">Close Preview</button>
          </div>
        </div>
      </div>

      <!-- Edit Training Plan Modal -->
      <div class="modal-overlay" id="edit-plan-modal-overlay" role="dialog" aria-modal="true">
        <div class="modal" style="max-width:540px;">
          <div class="modal__header">
            <h3 class="modal__title">Edit Training Plan</h3>
            <button class="modal__close" data-modal-close="edit-plan-modal">${Components.icon('x')}</button>
          </div>
          <div class="modal__body">
            <form id="form-edit-plan-modal" onsubmit="event.preventDefault(); Dashboard.handleSaveEditPlan();">
              <input type="hidden" id="edit-plan-id">
              <div class="form-group">
                <label class="form-label" for="edit-plan-title">Plan Package Title</label>
                <input type="text" class="form-input" id="edit-plan-title" required>
              </div>
              <div class="profile-form-grid">
                <div class="form-group">
                  <label class="form-label" for="edit-plan-tier">Coaching Tier</label>
                  <select class="form-input" id="edit-plan-tier">
                    <option value="Pro Coaching">Pro Coaching ($59/mo)</option>
                    <option value="Elite Coaching">Elite Coaching ($99/mo)</option>
                    <option value="Starter Access">Starter Access ($39/mo)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" for="edit-plan-dur">Program Duration</label>
                  <select class="form-input" id="edit-plan-dur">
                    <option value="4 Weeks (30 Days)">4 Weeks (30 Days)</option>
                    <option value="6 Weeks (42 Days)">6 Weeks (42 Days)</option>
                    <option value="8 Weeks (56 Days)">8 Weeks (56 Days)</option>
                    <option value="12 Weeks (90 Days)">12 Weeks (90 Days)</option>
                  </select>
                </div>
              </div>
              <div class="form-group mt-3">
                <label class="form-label" for="edit-plan-desc">Plan Overview</label>
                <textarea class="form-textarea" id="edit-plan-desc" rows="3" required></textarea>
              </div>
              <div class="modal__footer" style="padding:0;border:none;margin-top:var(--space-4);">
                <button type="button" class="btn btn--secondary" data-modal-close="edit-plan-modal">Cancel</button>
                <button type="submit" class="btn btn--primary">${Components.icon('checkCircle')} Save Plan Changes</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Edit Fitness Goal Modal -->
      <div class="modal-overlay" id="edit-goal-modal-overlay" role="dialog" aria-modal="true">
        <div class="modal">
          <div class="modal__header">
            <h3 class="modal__title">Edit Fitness Goal & Targets</h3>
            <button class="modal__close" data-modal-close="edit-goal-modal">${Components.icon('x')}</button>
          </div>
          <div class="modal__body">
            <form id="form-edit-goal-modal" onsubmit="event.preventDefault(); Dashboard.handleSaveGoalModal();">
              <div class="form-group">
                <label class="form-label" for="m-goal-title">Goal Program Title</label>
                <input type="text" class="form-input" id="m-goal-title" value="${FitTrackData.activeGoal.title}" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="m-goal-type">Primary Goal Type</label>
                <select class="form-input" id="m-goal-type">
                  ${this.renderGoalTypeOptions(FitTrackData.activeGoal.goalType)}
                </select>
              </div>

              <div class="profile-form-grid">
                <div class="form-group">
                  <label class="form-label" for="m-goal-target-weight">Target Weight (kg)</label>
                  <input type="number" step="0.1" class="form-input" id="m-goal-target-weight" value="${FitTrackData.activeGoal.targetWeight}" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="m-goal-cal">Daily Calories (kcal)</label>
                  <input type="number" class="form-input" id="m-goal-cal" value="${FitTrackData.activeGoal.targetCalories}" required>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="m-goal-target-date">Target Completion Date</label>
                <input type="date" class="form-input" id="m-goal-target-date" value="${FitTrackData.activeGoal.targetDate}" required>
              </div>

              <div class="modal__footer" style="padding:0;border:none;margin-top:var(--space-4);">
                <button type="button" class="btn btn--secondary" data-modal-close="edit-goal-modal">Cancel</button>
                <button type="submit" class="btn btn--primary">${Components.icon('check')} Update Goal</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Log Progress Quick Modal -->
      <div class="modal-overlay" id="log-progress-modal-overlay" role="dialog" aria-modal="true">
        <div class="modal">
          <div class="modal__header">
            <h3 class="modal__title">Log Weight & Progress</h3>
            <button class="modal__close" data-modal-close="log-progress-modal">${Components.icon('x')}</button>
          </div>
          <div class="modal__body">
            <form id="form-log-progress-modal" onsubmit="event.preventDefault(); Dashboard.handleLogProgressSubmit();">
              <div class="profile-form-grid">
                <div class="form-group">
                  <label class="form-label" for="m-log-weight">Current Weight (kg)</label>
                  <input type="number" step="0.1" class="form-input" id="m-log-weight" value="${FitTrackData.currentUser.weight}" required>
                </div>
                <div class="form-group">
                  <label class="form-label" for="m-log-bodyfat">Body Fat (%)</label>
                  <input type="number" step="0.1" class="form-input" id="m-log-bodyfat" value="${FitTrackData.progressData.currentBodyFat}">
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="m-log-notes">Workout / Energy Notes</label>
                <textarea class="form-textarea" id="m-log-notes" rows="2" placeholder="e.g. Completed today's leg split, energy was 9/10!"></textarea>
              </div>

              <div class="modal__footer" style="padding:0;border:none;margin-top:var(--space-4);">
                <button type="button" class="btn btn--secondary" data-modal-close="log-progress-modal">Cancel</button>
                <button type="submit" class="btn btn--primary">${Components.icon('plus')} Commit Log</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Purchase Plan Checkout Modal -->
      <div class="modal-overlay" id="purchase-modal-overlay" role="dialog" aria-modal="true">
        <div class="modal">
          <div class="modal__header">
            <h3 class="modal__title">Complete Plan Purchase</h3>
            <button class="modal__close" data-modal-close="purchase-modal">${Components.icon('x')}</button>
          </div>
          <div class="modal__body">
            <div class="checkout-summary-box">
              <div class="checkout-row">
                <span>Selected Plan</span>
                <strong id="chk-plan-name">Pro Coaching Plan</strong>
              </div>
              <div class="checkout-row">
                <span>Billing Frequency</span>
                <span>Monthly Access</span>
              </div>
              <div class="checkout-row">
                <span>Subtotal</span>
                <span id="chk-price">$59.00</span>
              </div>
              <div class="checkout-row">
                <span>Trainer Assignment</span>
                <span style="color:var(--color-primary);font-weight:600;">Coach Arjun Mehta (Included)</span>
              </div>
              <div class="checkout-row total">
                <span>Total Amount Due</span>
                <span id="chk-total" style="color:var(--color-primary);font-size:var(--text-lg);">$59.00</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="pay-method">Payment Method</label>
              <select class="form-input" id="pay-method">
                <option value="card">💳 Credit / Debit Card (Visa, Mastercard)</option>
                <option value="upi">📱 UPI / Google Pay / PhonePe</option>
                <option value="netbanking">🏦 Net Banking</option>
                <option value="paypal">🅿️ PayPal</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="promo-code">Promo Code / Coupon</label>
              <div style="display:flex;gap:var(--space-2);">
                <input type="text" class="form-input" id="promo-code" placeholder="Enter coupon (e.g. FITTRACK20)">
                <button type="button" class="btn btn--secondary" onclick="Dashboard.applyCoupon()">Apply</button>
              </div>
            </div>
          </div>
          <div class="modal__footer">
            <button class="btn btn--secondary" data-modal-close="purchase-modal">Cancel</button>
            <button class="btn btn--primary" id="btn-confirm-purchase" onclick="Dashboard.handleConfirmPurchase()">
              ${Components.icon('checkCircle')} Confirm & Activate Plan
            </button>
          </div>
        </div>
      </div>

      <!-- Register Modal (User / Trainer) -->
      <div class="modal-overlay" id="register-modal-overlay" role="dialog" aria-modal="true">
        <div class="modal">
          <div class="modal__header">
            <h3 class="modal__title" id="reg-modal-title">Register Account</h3>
            <button class="modal__close" data-modal-close="register-modal">${Components.icon('x')}</button>
          </div>
          <div class="modal__body">
            <form id="form-register-new" onsubmit="event.preventDefault(); Dashboard.handleRegisterAccount();">
              <div class="form-group">
                <label class="form-label" for="reg-role">Account Type</label>
                <select class="form-input" id="reg-role" onchange="Dashboard.onRegisterRoleChange(this.value)">
                  <option value="user" ${this.currentRole === 'user' ? 'selected' : ''}>Fitness Member / User</option>
                  <option value="trainer" ${this.currentRole === 'trainer' ? 'selected' : ''}>Certified Personal Trainer</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="reg-name">Full Name</label>
                <input type="text" class="form-input" id="reg-name" placeholder="e.g. Arjun Mehta or Ishwari Nikam" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="reg-email">Email Address</label>
                <input type="email" class="form-input" id="reg-email" placeholder="e.g. name@fittrack.com" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="reg-pass">Create Password</label>
                <input type="password" class="form-input" id="reg-pass" placeholder="At least 6 characters" required>
              </div>
              <div class="form-group" id="reg-extra-group">
                <label class="form-label" for="reg-specialty" id="reg-extra-label">Primary Fitness Goal</label>
                <input type="text" class="form-input" id="reg-specialty" placeholder="e.g. Fat Loss, Hypertrophy, Endurance">
              </div>
              <div class="modal__footer" style="padding:0;border:none;margin-top:var(--space-4);">
                <button type="button" class="btn btn--secondary" data-modal-close="register-modal">Cancel</button>
                <button type="submit" class="btn btn--primary">${Components.icon('checkCircle')} Create Account</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Live 1-on-1 WebRTC Video Session Modal -->
      <div class="modal-overlay" id="video-session-modal-overlay" role="dialog" aria-modal="true" style="z-index:9999;">
        <div class="modal" id="video-session-modal-container" style="max-width:860px;background:#0F172A;color:#fff;border:1px solid rgba(255,255,255,0.1);padding:0;overflow:hidden;border-radius:var(--radius-xl);width:95vw;box-shadow:0 25px 60px rgba(0,0,0,0.8);position:relative;">
          
          <!-- Top Header Bar -->
          <div id="v-modal-header" style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;background:#1E293B;border-bottom:1px solid rgba(255,255,255,0.08);position:relative;z-index:20;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span class="online-dot" id="v-connection-dot" style="background:#10B981;box-shadow:0 0 10px #10B981;"></span>
              <div>
                <h3 style="color:#fff;font-size:15px;margin:0;font-weight:700;" id="v-room-title">1-on-1 Live Coaching Session</h3>
                <span style="font-size:11px;color:#94A3B8;" id="v-room-subtitle">Encrypted HD Video Room · Connected</span>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:10px;">
              <!-- Recording Indicator Badge for Both Participants -->
              <div id="v-header-rec-badge" class="recording-badge" style="display:none;">
                <span class="rec-pulse-dot"></span>
                <span id="v-header-rec-text">REC 00:00</span>
              </div>
              <span style="font-family:monospace;font-size:12px;background:rgba(16,185,129,0.15);color:#34D399;padding:4px 8px;border-radius:4px;font-weight:700;" id="v-call-timer">00:00</span>
              <button class="modal__action-btn" id="btn-toggle-maximize" onclick="Dashboard.toggleVideoMaximize()" aria-label="Toggle Fullscreen" title="Maximize (F)">
                ${Icons.maximize}
              </button>
              <button class="modal__close" style="color:#94A3B8;" onclick="Dashboard.closeVideoSession()" aria-label="End and close session">${Components.icon('x')}</button>
            </div>
          </div>

          <!-- Device Permission / Error Notification Banner -->
          <div id="v-device-error-banner" style="display:none;background:rgba(239, 68, 68, 0.18);border-bottom:1px solid rgba(239, 68, 68, 0.35);padding:10px 20px;align-items:center;justify-content:space-between;gap:12px;">
            <div style="display:flex;align-items:center;gap:8px;font-size:12px;color:#FCA5A5;">
              <span>⚠️</span>
              <span id="v-device-error-text">Camera / Microphone access was blocked. Please grant permissions.</span>
            </div>
            <button class="btn btn--secondary btn--sm" style="font-size:11px;padding:4px 10px;background:#EF4444;color:#fff;border:none;border-radius:var(--radius-md);" onclick="Dashboard.retryMediaPermissions()">
              🔄 Retry Access
            </button>
          </div>

          <!-- In-Call Recording Consent Prompt Overlay -->
          <div id="v-recording-consent-modal" style="display:none;position:absolute;inset:0;background:rgba(15,23,42,0.88);backdrop-filter:blur(6px);z-index:50;align-items:center;justify-content:center;padding:20px;">
            <div style="background:#1E293B;border:1px solid rgba(255,255,255,0.15);border-radius:var(--radius-xl);max-width:440px;width:100%;padding:24px;text-align:center;box-shadow:0 20px 40px rgba(0,0,0,0.6);">
              <div style="width:48px;height:48px;border-radius:50%;background:rgba(239,68,68,0.15);color:#EF4444;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:22px;">
                🔴
              </div>
              <h4 style="font-size:17px;font-weight:700;color:#fff;margin-bottom:8px;" id="v-consent-title">Recording Consent Request</h4>
              <p style="font-size:13px;color:#94A3B8;line-height:1.5;margin-bottom:20px;" id="v-consent-message">
                Coach Rahul Mehta wants to record this 1-on-1 session for exercise form analysis and training review. Do you allow this session to be recorded?
              </p>
              <div style="display:flex;gap:12px;justify-content:center;">
                <button class="btn btn--secondary" onclick="Dashboard.handleRecordingConsent(false)" style="flex:1;background:#334155;color:#fff;border:none;">
                  ✕ Decline
                </button>
                <button class="btn btn--primary" onclick="Dashboard.handleRecordingConsent(true)" style="flex:1;background:#10B981;border-color:#10B981;">
                  ✓ Allow & Record
                </button>
              </div>
            </div>
          </div>

          <!-- Saved Recording Panel / Preview Modal -->
          <div id="v-recording-saved-modal" style="display:none;position:absolute;inset:0;background:rgba(15,23,42,0.92);backdrop-filter:blur(8px);z-index:60;align-items:center;justify-content:center;padding:20px;">
            <div style="background:#1E293B;border:1px solid rgba(255,255,255,0.15);border-radius:var(--radius-xl);max-width:540px;width:100%;padding:24px;box-shadow:0 25px 50px rgba(0,0,0,0.8);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="color:#10B981;font-size:18px;">✅</span>
                  <h4 style="font-size:16px;font-weight:700;color:#fff;margin:0;">Call Recording Finalized</h4>
                </div>
                <button class="modal__close" style="color:#94A3B8;" onclick="Dashboard.closeRecordingSavedModal()">${Components.icon('x')}</button>
              </div>
              <div style="border-radius:var(--radius-lg);overflow:hidden;background:#0F172A;margin-bottom:16px;border:1px solid rgba(255,255,255,0.08);">
                <video id="v-saved-player" controls playsinline style="width:100%;max-height:260px;display:block;background:#000;"></video>
              </div>
              <div style="background:#0F172A;border-radius:var(--radius-md);padding:12px 16px;margin-bottom:18px;font-size:12px;color:#94A3B8;display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                <div>⏱️ <strong>Duration:</strong> <span id="v-saved-dur" style="color:#fff;">00:00</span></div>
                <div>📁 <strong>Size:</strong> <span id="v-saved-size" style="color:#fff;">0 MB</span></div>
                <div>📅 <strong>Date:</strong> <span id="v-saved-date" style="color:#fff;">Today</span></div>
                <div>🔒 <strong>Access:</strong> <span style="color:#34D399;">Private & Encrypted</span></div>
              </div>
              <div style="display:flex;gap:10px;justify-content:flex-end;">
                <button class="btn btn--secondary btn--sm" onclick="Dashboard.closeRecordingSavedModal()" style="background:#334155;color:#fff;border:none;">
                  🗑️ Delete / Dismiss
                </button>
                <button class="btn btn--primary btn--sm" onclick="Dashboard.downloadRecording()" style="display:inline-flex;align-items:center;gap:6px;">
                  📥 Download Recording
                </button>
              </div>
            </div>
          </div>

          <!-- Screen Share Large Viewport (Conditional) -->
          <div id="v-screen-viewport" style="display:none;padding:16px 20px 0;background:#0F172A;">
            <div class="video-screen-container">
              <video id="v-screen-video" autoplay playsinline></video>
              <div style="position:absolute;top:10px;left:12px;background:rgba(0,0,0,0.7);padding:4px 10px;border-radius:6px;font-size:11px;color:#38BDF8;font-weight:700;display:flex;align-items:center;gap:6px;">
                <span>🖥️</span> <span id="v-screen-sharer-label">Screen Share Stream</span>
              </div>
            </div>
          </div>

          <!-- Main Participants Video Grid -->
          <div id="v-participants-grid" class="video-grid-split" style="padding:20px;background:#0F172A;min-height:300px;">
            
            <!-- Remote Participant Stream (Client or Coach) -->
            <div class="video-tile" id="v-remote-tile">
              <video id="v-remote-video" autoplay playsinline style="display:none;"></video>

              <div class="video-tile__placeholder" id="v-remote-placeholder">
                <div class="avatar avatar--xl avatar--placeholder" style="background:linear-gradient(135deg, #059669, #047857);color:#fff;font-size:32px;width:76px;height:76px;border-radius:50%;margin-bottom:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(5,150,105,0.4);" id="v-remote-avatar">
                  AS
                </div>
                <div style="font-weight:700;font-size:15px;color:#fff;" id="v-remote-name">Client: Aarav Sharma</div>
                <span style="font-size:11px;color:#94A3B8;margin-top:2px;" id="v-remote-status">Waiting for peer stream...</span>
              </div>

              <!-- Remote Muted Pill Badge (Top Right) -->
              <div class="video-tile__overlay video-tile__overlay--top-right" id="v-remote-muted-badge" style="display:none;">
                🔇 Muted
              </div>

              <!-- Remote Stats (Bottom Left) -->
              <div class="video-tile__overlay video-tile__overlay--bottom-left" id="v-remote-stats">
                P2P Encrypted Room
              </div>
            </div>

            <!-- Local Participant Stream (You) -->
            <div class="video-tile local" id="v-local-tile">
              <video id="v-local-video" autoplay playsinline muted></video>

              <div class="video-tile__placeholder" id="v-local-placeholder" style="display:none;">
                <div class="avatar avatar--xl avatar--placeholder" style="background:linear-gradient(135deg, #2563EB, #1D4ED8);color:#fff;font-size:32px;width:76px;height:76px;border-radius:50%;margin-bottom:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(37,99,235,0.4);" id="v-local-avatar">
                  RM
                </div>
                <div style="font-weight:700;font-size:15px;color:#fff;" id="v-local-name">You (Coach Rahul Mehta)</div>
                <span style="font-size:11px;color:#EF4444;margin-top:2px;" id="v-local-status">Camera Off</span>
              </div>

              <!-- Local Muted Pill Badge (Top Right) -->
              <div class="video-tile__overlay video-tile__overlay--top-right" id="v-local-muted-badge" style="display:none;">
                🔇 Muted
              </div>

              <!-- Local Stats (Bottom Left) -->
              <div class="video-tile__overlay video-tile__overlay--bottom-left" id="v-local-stats">
                Local Camera · Active
              </div>
            </div>

          </div>

          <!-- Session Agenda / Notes Bar -->
          <div id="v-modal-agenda" style="background:#1E293B;padding:12px 20px;border-top:1px solid rgba(255,255,255,0.08);font-size:12px;color:#CBD5E1;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
            <div>🎯 <strong>Agenda:</strong> <span id="v-room-agenda">Form & Plan Review</span></div>
            <div style="color:#94A3B8;font-size:11px;display:flex;align-items:center;gap:6px;">
              <span style="width:7px;height:7px;border-radius:50%;background:#10B981;display:inline-block;"></span>
              <span>FitTrack WebRTC Engine (Shortcuts: <strong>M</strong>=Mic, <strong>V</strong>=Cam, <strong>S</strong>=Share, <strong>F</strong>=Fullscreen)</span>
            </div>
          </div>

          <!-- Interactive Call Controls -->
          <div id="v-modal-controls" style="padding:16px 20px;background:#0F172A;display:flex;align-items:center;justify-content:center;gap:12px;border-top:1px solid rgba(255,255,255,0.08);flex-wrap:wrap;">
            <button class="btn btn--secondary btn--sm" id="btn-toggle-mic" onclick="Dashboard.toggleVideoMic()" style="background:#334155;color:#fff;border-radius:50px;padding:8px 18px;font-weight:600;display:inline-flex;align-items:center;gap:6px;">
              🎤 Mic On
            </button>
            <button class="btn btn--secondary btn--sm" id="btn-toggle-cam" onclick="Dashboard.toggleVideoCam()" style="background:#334155;color:#fff;border-radius:50px;padding:8px 18px;font-weight:600;display:inline-flex;align-items:center;gap:6px;">
              📹 Cam On
            </button>
            <button class="btn btn--secondary btn--sm" id="btn-toggle-screen" onclick="Dashboard.toggleVideoScreenShare()" style="background:#334155;color:#fff;border-radius:50px;padding:8px 18px;font-weight:600;display:inline-flex;align-items:center;gap:6px;">
              🖥️ Share Screen
            </button>
            <button class="btn btn--secondary btn--sm" id="btn-toggle-record" onclick="Dashboard.toggleVideoRecording()" style="background:#334155;color:#fff;border-radius:50px;padding:8px 18px;font-weight:600;display:inline-flex;align-items:center;gap:6px;">
              <span style="color:#EF4444;font-size:12px;">●</span> Record
            </button>
            <button class="btn btn--secondary btn--sm" id="btn-pause-record" onclick="Dashboard.togglePauseRecording()" style="display:none;background:#334155;color:#fff;border-radius:50px;padding:8px 14px;font-weight:600;align-items:center;gap:6px;">
              ⏸️ Pause
            </button>
            <button class="btn btn--danger btn--sm" id="btn-end-call" onclick="Dashboard.closeVideoSession()" style="background:#EF4444;color:#fff;border-radius:50px;padding:8px 22px;font-weight:700;display:inline-flex;align-items:center;gap:6px;">
              📞 End Call
            </button>
          </div>

        </div>
      </div>
    `;
  },

  /* ── WebRTC 1-on-1 Live Video Call System ── */
  videoSession: {
    activeSessionId: null,
    localStream: null,
    remoteStream: null,
    screenStream: null,
    peerConnection: null,
    signalingChannel: null,
    audioContext: null,
    localAnalyser: null,
    remoteAnalyser: null,
    speakingInterval: null,
    timerInterval: null,
    callSeconds: 0,
    isMicOn: true,
    isCamOn: true,
    isScreenSharing: false,
    remoteIsScreenSharing: false,
    remoteMicOn: true,
    remoteCamOn: true,
    connectionState: 'disconnected',
    myRole: 'coach',

    // Maximize & Inactivity state
    isMaximized: false,
    inactivityTimer: null,

    // Call Recording state
    isRecording: false,
    isRecordingPaused: false,
    mediaRecorder: null,
    recordedChunks: [],
    recordingSeconds: 0,
    recordingTimerInterval: null,
    recordingCanvas: null,
    recordingCanvasCtx: null,
    recordingCanvasStream: null,
    recordingAudioDest: null,
    recordingRafId: null,
    lastRecordedBlob: null,
    lastRecordingUrl: null,
    lastRecordingMeta: null,
    consentPending: false,
    hasConnected: false,

    // Synthetic video loop refs
    syntheticClientRaf: null,
    syntheticCoachRaf: null,
    syntheticScreenRaf: null
  },

  async launchVideoSession(sessionId) {
    const isTrainer = this.currentRole === 'trainer';
    let session = null;

    if (isTrainer) {
      session = FitTrackData.trainerSessions.find(s => s.id === sessionId) || (sessionId ? null : FitTrackData.trainerSessions[0]);
    } else {
      session = FitTrackData.upcomingSessions.find(s => s.id === sessionId) || (sessionId ? null : FitTrackData.upcomingSessions[0]);
    }

    if (session && (session.status === 'Completed' || session.category === 'completed')) {
      App.showToast('error', 'Session Completed', 'This video coaching session has already ended and cannot be restarted.');
      return;
    }

    const sid = session ? session.id : (sessionId || 'ts_001');

    // Server API safeguard
    const startCheck = await FitTrackAPI.startSession(sid);
    if (!startCheck.success) {
      App.showToast('error', 'Cannot Start Session', startCheck.error || 'This session has already ended.');
      return;
    }

    this.videoSession.activeSessionId = sid;
    this.videoSession.myRole = isTrainer ? 'coach' : 'client';
    this.videoSession.hasConnected = false;

    // Populate modal titles & avatars
    const titleElem = document.getElementById('v-room-title');
    const agendaElem = document.getElementById('v-room-agenda');
    const remoteAvatar = document.getElementById('v-remote-avatar');
    const remoteName = document.getElementById('v-remote-name');
    const localAvatar = document.getElementById('v-local-avatar');
    const localName = document.getElementById('v-local-name');

    if (session) {
      if (titleElem) titleElem.textContent = session.type || '1-on-1 Live Coaching Session';
      if (agendaElem) agendaElem.textContent = session.topic || 'Form & Training Plan Audit';
      if (isTrainer) {
        if (remoteAvatar) remoteAvatar.textContent = session.clientInitials || (session.clientName ? session.clientName.split(' ').map(n => n[0]).join('').slice(0, 2) : 'CL');
        const sessionUser = Auth.getUser();
        const myName = sessionUser ? sessionUser.name : 'Coach';
        const myInitials = myName.replace(/^Coach\s+/i, '').split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'TR';
        if (remoteName) remoteName.textContent = `Client: ${session.clientName || 'Client'}`;
        if (localAvatar) localAvatar.textContent = myInitials;
        if (localName) localName.textContent = `You (${myName.startsWith('Coach') ? myName : 'Coach ' + myName})`;
      } else {
        const sessionUser = Auth.getUser();
        const myName = sessionUser ? sessionUser.name : (FitTrackData.currentUser?.fullName || 'Member');
        const myInitials = myName.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'FT';
        if (remoteAvatar) remoteAvatar.textContent = session.trainerInitials || 'AM';
        if (remoteName) remoteName.textContent = session.trainerName || 'Coach Arjun Mehta';
        if (localAvatar) localAvatar.textContent = myInitials;
        if (localName) localName.textContent = `You (${myName})`;
      }
    }

    // Reset video UI state
    this.videoSession.callSeconds = 0;
    this.videoSession.isMicOn = true;
    this.videoSession.isCamOn = true;
    this.videoSession.isScreenSharing = false;
    this.videoSession.isMaximized = false;
    this.videoSession.isRecording = false;
    this.videoSession.isRecordingPaused = false;
    this.videoSession.consentPending = false;

    const maxBtn = document.getElementById('btn-toggle-maximize');
    if (maxBtn) {
      maxBtn.innerHTML = Icons.maximize;
      maxBtn.title = 'Maximize (F)';
    }

    const recBadge = document.getElementById('v-header-rec-badge');
    if (recBadge) recBadge.style.display = 'none';

    const recBtn = document.getElementById('btn-toggle-record');
    if (recBtn) {
      recBtn.innerHTML = '<span style="color:#EF4444;font-size:12px;">●</span> Record';
      recBtn.style.background = '#334155';
    }

    const pauseBtn = document.getElementById('btn-pause-record');
    if (pauseBtn) pauseBtn.style.display = 'none';

    const consentModal = document.getElementById('v-recording-consent-modal');
    if (consentModal) consentModal.style.display = 'none';

    const savedModal = document.getElementById('v-recording-saved-modal');
    if (savedModal) savedModal.style.display = 'none';

    const timerElem = document.getElementById('v-call-timer');
    if (timerElem) timerElem.textContent = '00:00';

    const micBtn = document.getElementById('btn-toggle-mic');
    if (micBtn) {
      micBtn.textContent = '🎤 Mic On';
      micBtn.style.background = '#334155';
    }
    const camBtn = document.getElementById('btn-toggle-cam');
    if (camBtn) {
      camBtn.textContent = '📹 Cam On';
      camBtn.style.background = '#334155';
    }
    const screenBtn = document.getElementById('btn-toggle-screen');
    if (screenBtn) {
      screenBtn.textContent = '🖥️ Share Screen';
      screenBtn.style.background = '#334155';
    }

    const localMutedBadge = document.getElementById('v-local-muted-badge');
    if (localMutedBadge) localMutedBadge.style.display = 'none';

    const errorBanner = document.getElementById('v-device-error-banner');
    if (errorBanner) errorBanner.style.display = 'none';

    const screenViewport = document.getElementById('v-screen-viewport');
    if (screenViewport) screenViewport.style.display = 'none';

    const grid = document.getElementById('v-participants-grid');
    if (grid) grid.className = 'video-grid-split';

    App.openModal('video-session-modal');

    // Setup fullscreen change & inactivity listeners
    this.setupFullscreenListeners();

    // Start Live Hardware Capture & WebRTC Peer Connection
    await this.initWebRTCSession(sid);
  },

  /* ── Feature A: Maximize & Fullscreen Logic ── */
  toggleVideoMaximize() {
    const modalContainer = document.getElementById('video-session-modal-container');
    const modalOverlay = document.getElementById('video-session-modal-overlay');
    const maxBtn = document.getElementById('btn-toggle-maximize');

    if (!modalContainer || !modalOverlay) return;

    if (!this.videoSession.isMaximized) {
      // Enter Maximize / Fullscreen
      this.videoSession.isMaximized = true;

      // Use Fullscreen API if supported
      const fsTarget = modalContainer.requestFullscreen ? modalContainer : (modalOverlay.requestFullscreen ? modalOverlay : null);
      if (fsTarget && !document.fullscreenElement) {
        fsTarget.requestFullscreen().catch(() => {
          // Fallback to CSS full-viewport mode
          modalContainer.classList.add('modal--fullscreen');
          modalOverlay.classList.add('has-fullscreen');
        });
      } else {
        // Fallback to CSS full-viewport mode
        modalContainer.classList.add('modal--fullscreen');
        modalOverlay.classList.add('has-fullscreen');
      }

      if (maxBtn) {
        maxBtn.innerHTML = Icons.minimize;
        maxBtn.title = 'Minimize (Esc or F)';
      }

      App.showToast('info', 'Fullscreen Mode', 'Call maximized. Press F or Esc to minimize.');
    } else {
      // Exit Maximize / Fullscreen
      this.videoSession.isMaximized = false;

      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      modalContainer.classList.remove('modal--fullscreen', 'controls-hidden');
      modalOverlay.classList.remove('has-fullscreen');

      if (maxBtn) {
        maxBtn.innerHTML = Icons.maximize;
        maxBtn.title = 'Maximize (F)';
      }

      if (this.videoSession.inactivityTimer) {
        clearTimeout(this.videoSession.inactivityTimer);
        this.videoSession.inactivityTimer = null;
      }
    }
  },

  setupFullscreenListeners() {
    const modalContainer = document.getElementById('video-session-modal-container');
    const modalOverlay = document.getElementById('video-session-modal-overlay');
    if (!modalContainer || modalContainer._fsListenersBound) return;
    modalContainer._fsListenersBound = true;

    // Listen to Fullscreen API changes (e.g. user pressed Esc)
    const handleFullscreenChange = () => {
      const maxBtn = document.getElementById('btn-toggle-maximize');
      if (!document.fullscreenElement) {
        this.videoSession.isMaximized = false;
        modalContainer.classList.remove('modal--fullscreen', 'controls-hidden');
        if (modalOverlay) modalOverlay.classList.remove('has-fullscreen');
        if (maxBtn) {
          maxBtn.innerHTML = Icons.maximize;
          maxBtn.title = 'Maximize (F)';
        }
      } else {
        this.videoSession.isMaximized = true;
        modalContainer.classList.add('modal--fullscreen');
        if (modalOverlay) modalOverlay.classList.add('has-fullscreen');
        if (maxBtn) {
          maxBtn.innerHTML = Icons.minimize;
          maxBtn.title = 'Maximize (Esc or F)';
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    // Auto-hide controls & header after 3 seconds of inactivity in fullscreen
    const resetInactivityTimer = () => {
      modalContainer.classList.remove('controls-hidden');
      if (this.videoSession.inactivityTimer) {
        clearTimeout(this.videoSession.inactivityTimer);
      }
      if (this.videoSession.isMaximized) {
        this.videoSession.inactivityTimer = setTimeout(() => {
          if (this.videoSession.isMaximized) {
            modalContainer.classList.add('controls-hidden');
          }
        }, 3000);
      }
    };

    modalContainer.addEventListener('mousemove', resetInactivityTimer);
    modalContainer.addEventListener('mousedown', resetInactivityTimer);
    modalContainer.addEventListener('touchstart', resetInactivityTimer, { passive: true });

    // Keyboard shortcuts when video room is open
    if (!window._videoShortcutsBound) {
      window._videoShortcutsBound = true;
      document.addEventListener('keydown', (e) => {
        const overlay = document.getElementById('video-session-modal-overlay');
        if (!overlay || !overlay.classList.contains('visible')) return;
        const tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

        const k = e.key.toLowerCase();
        if (k === 'm') {
          e.preventDefault();
          this.toggleVideoMic();
        } else if (k === 'v') {
          e.preventDefault();
          this.toggleVideoCam();
        } else if (k === 's') {
          e.preventDefault();
          this.toggleVideoScreenShare();
        } else if (k === 'f') {
          e.preventDefault();
          this.toggleVideoMaximize();
        } else if (k === 'r') {
          e.preventDefault();
          this.toggleVideoRecording();
        } else if (k === 'p') {
          e.preventDefault();
          this.togglePauseRecording();
        }
      });
    }
  },

  /* ── Feature B: Call Recording Engine ── */
  toggleVideoRecording() {
    if (!this.videoSession.isRecording) {
      if (!window.MediaRecorder) {
        App.showToast('warning', 'Recording Unsupported', 'MediaRecorder API is not available on this browser.');
        return;
      }
      this.startMediaRecorder();
    } else {
      this.stopVideoRecording();
    }
  },

  handleRecordingConsent(allowed) {
    const consentModal = document.getElementById('v-recording-consent-modal');
    if (consentModal) consentModal.style.display = 'none';

    if (this.videoSession.signalingChannel) {
      this.videoSession.signalingChannel.postMessage({
        type: 'record_consent_response',
        accepted: allowed,
        sender: this.videoSession.myRole,
        sessionId: this.videoSession.activeSessionId
      });
    }

    if (allowed) {
      App.showToast('success', 'Recording Allowed', 'Session recording permitted.');
    } else {
      App.showToast('info', 'Recording Declined', 'You declined session recording.');
    }
  },

  startMediaRecorder() {
    try {
      this.videoSession.recordedChunks = [];
      this.videoSession.recordingSeconds = 0;

      // 1. Prepare Video Layout Compositor Canvas (1280x720)
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d', { alpha: false });
      this.videoSession.recordingCanvas = canvas;
      this.videoSession.recordingCanvasCtx = ctx;

      const localVideo = document.getElementById('v-local-video');
      const remoteVideo = document.getElementById('v-remote-video');
      const screenVideo = document.getElementById('v-screen-video');

      // Continuous Layout Compositing Loop
      const renderCanvas = () => {
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const isScreenActive = (this.videoSession.isScreenSharing || this.videoSession.remoteIsScreenSharing) && screenVideo && screenVideo.srcObject;

        if (isScreenActive && (screenVideo.readyState >= 2 || screenVideo.videoWidth > 0)) {
          // Large Screen Share View
          try {
            ctx.drawImage(screenVideo, 0, 0, 1280, 720);
          } catch (e) {}

          // Small thumbnails in bottom right corner
          // Remote participant
          ctx.fillStyle = '#1E293B';
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 2;
          ctx.fillRect(980, 420, 280, 140);
          ctx.strokeRect(980, 420, 280, 140);
          if (remoteVideo && (remoteVideo.readyState >= 2 || remoteVideo.videoWidth > 0) && this.videoSession.remoteCamOn) {
            try { ctx.drawImage(remoteVideo, 980, 420, 280, 140); } catch (e) {}
          } else {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.fillText('Client Stream', 1040, 495);
          }

          // Local participant
          ctx.fillRect(980, 570, 280, 140);
          ctx.strokeRect(980, 570, 280, 140);
          if (localVideo && (localVideo.readyState >= 2 || localVideo.videoWidth > 0) && this.videoSession.isCamOn) {
            try { ctx.drawImage(localVideo, 980, 570, 280, 140); } catch (e) {}
          } else {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.fillText('Coach Stream', 1040, 645);
          }
        } else {
          // Side-by-side Dual Participant View
          // Left Tile: Remote Participant
          ctx.fillStyle = '#1E293B';
          ctx.strokeStyle = 'rgba(255,255,255,0.1)';
          ctx.lineWidth = 2;
          ctx.fillRect(20, 50, 605, 620);
          ctx.strokeRect(20, 50, 605, 620);

          if (remoteVideo && (remoteVideo.readyState >= 2 || remoteVideo.videoWidth > 0) && this.videoSession.remoteCamOn) {
            try { ctx.drawImage(remoteVideo, 20, 50, 605, 620); } catch (e) {}
          } else {
            // Placeholder
            ctx.fillStyle = '#059669';
            ctx.beginPath();
            ctx.arc(322, 330, 45, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('AS', 322, 338);
            ctx.font = '16px Inter, sans-serif';
            ctx.fillText('Client: Aarav Sharma', 322, 410);
            ctx.textAlign = 'start';
          }

          // Left Label Pill
          ctx.fillStyle = 'rgba(15,23,42,0.85)';
          ctx.fillRect(35, 620, 220, 34);
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 12px Inter, sans-serif';
          ctx.fillText('Client: Aarav Sharma', 45, 642);

          // Right Tile: Local Participant
          ctx.fillStyle = '#1E293B';
          ctx.fillRect(655, 50, 605, 620);
          ctx.strokeRect(655, 50, 605, 620);

          if (localVideo && (localVideo.readyState >= 2 || localVideo.videoWidth > 0) && this.videoSession.isCamOn) {
            try { ctx.drawImage(localVideo, 655, 50, 605, 620); } catch (e) {}
          } else {
            // Placeholder
            ctx.fillStyle = '#2563EB';
            ctx.beginPath();
            ctx.arc(957, 330, 45, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('RM', 957, 338);
            ctx.font = '16px Inter, sans-serif';
            ctx.fillText('You (Coach Rahul Mehta)', 957, 410);
            ctx.textAlign = 'start';
          }

          // Right Label Pill
          ctx.fillStyle = 'rgba(15,23,42,0.85)';
          ctx.fillRect(670, 620, 240, 34);
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 12px Inter, sans-serif';
          ctx.fillText('Coach: Rahul Mehta', 680, 642);
        }

        // Top Watermark
        ctx.fillStyle = 'rgba(15,23,42,0.8)';
        ctx.fillRect(0, 0, 1280, 42);
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(24, 21, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px Inter, sans-serif';
        ctx.fillText('FitTrack 1-on-1 Coaching Session · Encrypted P2P HD Record', 38, 26);

        if (this.videoSession.isRecording) {
          this.videoSession.recordingRafId = requestAnimationFrame(renderCanvas);
        }
      };

      this.videoSession.recordingRafId = requestAnimationFrame(renderCanvas);
      const canvasStream = canvas.captureStream(30);

      // 2. Audio Mixing with Web Audio API Destination
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!this.videoSession.audioContext || this.videoSession.audioContext.state === 'closed') {
        this.videoSession.audioContext = new AudioContextClass();
      }
      const audioCtx = this.videoSession.audioContext;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }

      const audioDest = audioCtx.createMediaStreamDestination();
      this.videoSession.recordingAudioDest = audioDest;

      // Connect local stream audio
      if (this.videoSession.localStream && this.videoSession.localStream.getAudioTracks().length > 0) {
        try {
          const localAudioSrc = audioCtx.createMediaStreamSource(this.videoSession.localStream);
          localAudioSrc.connect(audioDest);
        } catch (e) {}
      }

      // Connect remote video audio if available
      if (remoteVideo && remoteVideo.srcObject && remoteVideo.srcObject.getAudioTracks().length > 0) {
        try {
          const remoteAudioSrc = audioCtx.createMediaStreamSource(remoteVideo.srcObject);
          remoteAudioSrc.connect(audioDest);
        } catch (e) {}
      }

      // Ensure audio track exists for recorder
      if (audioDest.stream.getAudioTracks().length === 0) {
        try {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          gain.gain.value = 0.0001;
          osc.connect(gain);
          gain.connect(audioDest);
          osc.start();
        } catch (e) {}
      }

      // 3. Combine Video & Audio Tracks into Single Recording Stream
      const combinedTracks = [
        ...canvasStream.getVideoTracks(),
        ...audioDest.stream.getAudioTracks()
      ];
      const combinedStream = new MediaStream(combinedTracks);

      // 4. Select Supported MIME Type
      const preferredMimes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4'
      ];
      let selectedMime = '';
      for (const m of preferredMimes) {
        if (MediaRecorder.isTypeSupported(m)) {
          selectedMime = m;
          break;
        }
      }

      const options = selectedMime ? { mimeType: selectedMime } : {};
      const recorder = new MediaRecorder(combinedStream, options);
      this.videoSession.mediaRecorder = recorder;
      this.videoSession.isRecording = true;
      this.videoSession.isRecordingPaused = false;

      recorder.ondataavailable = (evt) => {
        if (evt.data && evt.data.size > 0) {
          this.videoSession.recordedChunks.push(evt.data);
        }
      };

      recorder.onstop = () => {
        this.finalizeRecording(selectedMime);
      };

      // Collect data every 1000ms to safeguard against mid-session aborts
      recorder.start(1000);

      // 5. Update UI State & Timers
      const recBadge = document.getElementById('v-header-rec-badge');
      const recText = document.getElementById('v-header-rec-text');
      const recBtn = document.getElementById('btn-toggle-record');
      const pauseBtn = document.getElementById('btn-pause-record');

      if (recBadge) recBadge.style.display = 'inline-flex';
      if (recText) recText.textContent = 'REC 00:00';
      if (recBtn) {
        recBtn.innerHTML = '<span class="rec-pulse-dot"></span> Stop Recording';
        recBtn.style.background = '#EF4444';
      }
      if (pauseBtn) {
        pauseBtn.style.display = 'inline-flex';
        pauseBtn.innerHTML = '⏸️ Pause';
      }

      if (this.videoSession.recordingTimerInterval) clearInterval(this.videoSession.recordingTimerInterval);
      this.videoSession.recordingTimerInterval = setInterval(() => {
        if (!this.videoSession.isRecordingPaused) {
          this.videoSession.recordingSeconds++;
          const mins = String(Math.floor(this.videoSession.recordingSeconds / 60)).padStart(2, '0');
          const secs = String(this.videoSession.recordingSeconds % 60).padStart(2, '0');
          if (recText) recText.textContent = `REC ${mins}:${secs}`;
        }
      }, 1000);

      // Broadcast recording status to remote peer
      if (this.videoSession.signalingChannel) {
        this.videoSession.signalingChannel.postMessage({
          type: 'record_started',
          sender: this.videoSession.myRole,
          sessionId: this.videoSession.activeSessionId
        });
      }

      App.showToast('success', 'Recording Started! 🔴', 'Audio and layout are being captured in HD.');

    } catch (err) {
      console.warn('Start MediaRecorder failed:', err);
      App.showToast('warning', 'Recording Error', `Failed to start recording: ${err.message}`);
      this.videoSession.isRecording = false;
    }
  },

  togglePauseRecording() {
    const recorder = this.videoSession.mediaRecorder;
    const pauseBtn = document.getElementById('btn-pause-record');
    const recText = document.getElementById('v-header-rec-text');
    if (!recorder || !this.videoSession.isRecording) return;

    if (!this.videoSession.isRecordingPaused) {
      // Pause
      if (recorder.state === 'recording') {
        recorder.pause();
      }
      this.videoSession.isRecordingPaused = true;
      if (pauseBtn) pauseBtn.innerHTML = '▶️ Resume';
      if (recText) recText.textContent = 'PAUSED';
      App.showToast('info', 'Recording Paused', 'Call recording is paused.');
    } else {
      // Resume
      if (recorder.state === 'paused') {
        recorder.resume();
      }
      this.videoSession.isRecordingPaused = false;
      if (pauseBtn) pauseBtn.innerHTML = '⏸️ Pause';
      App.showToast('info', 'Recording Resumed', 'Call recording resumed.');
    }
  },

  stopVideoRecording() {
    if (!this.videoSession.isRecording) return;

    this.videoSession.isRecording = false;
    this.videoSession.isRecordingPaused = false;

    if (this.videoSession.recordingTimerInterval) {
      clearInterval(this.videoSession.recordingTimerInterval);
      this.videoSession.recordingTimerInterval = null;
    }

    if (this.videoSession.recordingRafId) {
      cancelAnimationFrame(this.videoSession.recordingRafId);
      this.videoSession.recordingRafId = null;
    }

    if (this.videoSession.mediaRecorder && this.videoSession.mediaRecorder.state !== 'inactive') {
      this.videoSession.mediaRecorder.stop();
    }

    const recBadge = document.getElementById('v-header-rec-badge');
    const recBtn = document.getElementById('btn-toggle-record');
    const pauseBtn = document.getElementById('btn-pause-record');

    if (recBadge) recBadge.style.display = 'none';
    if (pauseBtn) pauseBtn.style.display = 'none';
    if (recBtn) {
      recBtn.innerHTML = '<span style="color:#EF4444;font-size:12px;">●</span> Record';
      recBtn.style.background = '#334155';
    }

    // Broadcast stopped
    if (this.videoSession.signalingChannel) {
      this.videoSession.signalingChannel.postMessage({
        type: 'record_stopped',
        sender: this.videoSession.myRole,
        sessionId: this.videoSession.activeSessionId
      });
    }

    App.showToast('info', 'Recording Stopped', 'Finalizing and encoding video file...');
  },

  finalizeRecording(mimeType) {
    if (!this.videoSession.recordedChunks || this.videoSession.recordedChunks.length === 0) return;

    const blobType = mimeType || 'video/webm';
    const blob = new Blob(this.videoSession.recordedChunks, { type: blobType });
    const url = URL.createObjectURL(blob);
    const sizeMb = (blob.size / (1024 * 1024)).toFixed(2);
    const durMins = String(Math.floor(this.videoSession.recordingSeconds / 60)).padStart(2, '0');
    const durSecs = String(this.videoSession.recordingSeconds % 60).padStart(2, '0');
    const durFormatted = `${durMins}:${durSecs}`;

    const recordData = {
      id: `rec_${Date.now()}`,
      sessionId: this.videoSession.activeSessionId || 'ts_001',
      clientName: this.currentRole === 'trainer' ? 'Aarav Sharma' : (Auth.getUser()?.name || FitTrackData.currentUser?.fullName || 'Member'),
      duration: durFormatted,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      size: `${sizeMb} MB`,
      blob,
      url,
      mimeType: blobType
    };

    this.videoSession.lastRecordedBlob = blob;
    this.videoSession.lastRecordingUrl = url;
    this.videoSession.lastRecordingMeta = recordData;

    // Save record into FitTrackData catalog
    FitTrackData.saveSessionRecording(recordData);

    // Populate and show Saved Recording Modal
    const player = document.getElementById('v-saved-player');
    const durElem = document.getElementById('v-saved-dur');
    const sizeElem = document.getElementById('v-saved-size');
    const dateElem = document.getElementById('v-saved-date');
    const savedModal = document.getElementById('v-recording-saved-modal');

    if (player) {
      player.src = url;
      player.load();
    }
    if (durElem) durElem.textContent = durFormatted;
    if (sizeElem) sizeElem.textContent = `${sizeMb} MB`;
    if (dateElem) dateElem.textContent = recordData.date;
    if (savedModal) savedModal.style.display = 'flex';

    App.showToast('success', 'Recording Saved! 🎬', 'Video ready for preview and instant download.');
  },

  downloadRecording() {
    if (!this.videoSession.lastRecordingUrl) {
      App.showToast('warning', 'Download', 'No active recording found to download.');
      return;
    }

    const a = document.createElement('a');
    a.href = this.videoSession.lastRecordingUrl;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `FitTrack_Session_${this.videoSession.activeSessionId || 'coaching'}_${dateStr}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    App.showToast('success', 'Downloading Recording', 'Session video file download initiated.');
  },

  closeRecordingSavedModal() {
    const savedModal = document.getElementById('v-recording-saved-modal');
    const player = document.getElementById('v-saved-player');
    if (player) {
      player.pause();
    }
    if (savedModal) {
      savedModal.style.display = 'none';
    }
  },

  openSavedRecordingViewer(sessionId) {
    const rec = FitTrackData.getSessionRecording(sessionId) || (FitTrackData.sessionRecordings && FitTrackData.sessionRecordings[0]);
    if (!rec) {
      App.showToast('info', 'No Recording', 'No saved recording found for this session yet.');
      return;
    }

    this.videoSession.lastRecordingUrl = rec.url;
    this.videoSession.lastRecordingMeta = rec;

    const player = document.getElementById('v-saved-player');
    const durElem = document.getElementById('v-saved-dur');
    const sizeElem = document.getElementById('v-saved-size');
    const dateElem = document.getElementById('v-saved-date');
    const savedModal = document.getElementById('v-recording-saved-modal');

    if (player) {
      player.src = rec.url;
      player.load();
    }
    if (durElem) durElem.textContent = rec.duration || '00:00';
    if (sizeElem) sizeElem.textContent = rec.size || 'Saved';
    if (dateElem) dateElem.textContent = rec.date || 'Today';

    App.openModal('video-session-modal');
    if (savedModal) savedModal.style.display = 'flex';
  },

  /* ── Synthetic High-Fidelity Video Feed Generator (HTML5 Canvas 30fps) ── */
  createSyntheticVideoFeed(type, name, initials) {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d', { alpha: false });
    let frame = 0;
    let running = true;

    // Attach silent Web Audio oscillator track so MediaRecorder and WebRTC always have an audio track
    let audioTrack = null;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        if (!this.videoSession.audioContext || this.videoSession.audioContext.state === 'closed') {
          this.videoSession.audioContext = new AudioContextClass();
        }
        const actx = this.videoSession.audioContext;
        if (actx.state === 'suspended') actx.resume().catch(() => {});
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        gain.gain.value = 0.0001;
        osc.connect(gain);
        const dst = actx.createMediaStreamDestination();
        gain.connect(dst);
        osc.start();
        audioTrack = dst.stream.getAudioTracks()[0];
      }
    } catch (e) {}

    const render = () => {
      if (!running) return;
      frame++;
      const t = frame * 0.04;

      if (type === 'client') {
        // Client Live Workout & AI Biomechanics Pose Estimation Feed
        const grad = ctx.createLinearGradient(0, 0, 640, 360);
        grad.addColorStop(0, '#0F172A');
        grad.addColorStop(0.5, '#1E293B');
        grad.addColorStop(1, '#0F172A');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 640, 360);

        // Perspective Gym Grid Floor
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 40; x < 640; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 260);
          ctx.lineTo(x * 1.25 - 80, 360);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(0, 260);
        ctx.lineTo(640, 260);
        ctx.stroke();

        // Athlete Squat Kinematics (sinusoidal motion curve)
        const squatCycle = (Math.sin(t * 1.6) + 1) / 2; // 0 = standing, 1 = deep squat
        const hipDrop = squatCycle * 44;
        const kneeFlex = squatCycle * 26;

        const headX = 320, headY = 92 + hipDrop * 0.6;
        const shoulderX = 320, shoulderY = 122 + hipDrop * 0.7;
        const hipX = 320, hipY = 178 + hipDrop;
        const kneeLX = 296 - kneeFlex * 0.4, kneeLY = 238 + hipDrop * 0.35;
        const kneeRX = 344 + kneeFlex * 0.4, kneeRY = 238 + hipDrop * 0.35;
        const ankleLX = 292, ankleLY = 294;
        const ankleRX = 348, ankleRY = 294;
        const barY = shoulderY - 8;

        // Olympic Barbell & Weight Plates
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(210, barY);
        ctx.lineTo(430, barY);
        ctx.stroke();

        ctx.fillStyle = '#EF4444';
        ctx.fillRect(202, barY - 24, 12, 48);
        ctx.fillRect(216, barY - 20, 8, 40);
        ctx.fillRect(418, barY - 24, 12, 48);
        ctx.fillRect(408, barY - 20, 8, 40);

        // Torso / Body Silhouette
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.arc(headX, headY, 17, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(shoulderX, shoulderY);
        ctx.lineTo(hipX, hipY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(kneeLX, kneeLY);
        ctx.lineTo(ankleLX, ankleLY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(hipX, hipY);
        ctx.lineTo(kneeRX, kneeRY);
        ctx.lineTo(ankleRX, ankleRY);
        ctx.stroke();

        // AI Joint Tracking Overlay (Glowing emerald joints)
        const joints = [
          [headX, headY], [shoulderX, shoulderY], [hipX, hipY],
          [kneeLX, kneeLY], [kneeRX, kneeRY], [ankleLX, ankleLY], [ankleRX, ankleRY]
        ];
        joints.forEach(([jx, jy]) => {
          ctx.fillStyle = '#10B981';
          ctx.beginPath();
          ctx.arc(jx, jy, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#34D399';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(jx, jy, 7.5, 0, Math.PI * 2);
          ctx.stroke();
        });

        // AI Knee Flexion Angle Arc & Label
        const kneeAngle = Math.round(160 - squatCycle * 68);
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(kneeLX, kneeLY, 22, -Math.PI / 2, -Math.PI / 2 + (kneeAngle * Math.PI / 180));
        ctx.stroke();

        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 12px Inter, monospace';
        ctx.fillText(`${kneeAngle}°`, kneeLX - 36, kneeLY - 6);

        // Biometrics & AI Telemetry HUD Overlay
        ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
        ctx.fillRect(16, 16, 225, 90);
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.strokeRect(16, 16, 225, 90);

        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText('⚡ AI SQUAT FORM TELEMETRY', 26, 32);

        ctx.fillStyle = '#10B981';
        ctx.font = '11px Inter, monospace';
        ctx.fillText(`Knee Depth: ${kneeAngle <= 96 ? 'PARALLEL (OPTIMAL)' : 'DESCENDING...'}`, 26, 50);

        const hr = Math.round(136 + Math.sin(t * 0.7) * 4);
        ctx.fillStyle = '#F87171';
        ctx.fillText(`❤️ Heart Rate: ${hr} BPM`, 26, 68);

        const reps = Math.floor(frame / 120) % 10 + 1;
        ctx.fillStyle = '#FBBF24';
        ctx.fillText(`🏋️ Rep: ${reps} / 10 · Score: 98%`, 26, 86);

        // Watermark Live Badge
        ctx.fillStyle = 'rgba(239, 68, 68, 0.88)';
        ctx.fillRect(525, 16, 95, 24);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText('● LIVE 60fps', 533, 32);

      } else {
        // Coach Rahul Mehta Studio Video Feed
        const grad = ctx.createLinearGradient(0, 0, 640, 360);
        grad.addColorStop(0, '#0B1329');
        grad.addColorStop(0.6, '#1E293B');
        grad.addColorStop(1, '#0B1329');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 640, 360);

        // Subtle Studio Background Grid
        ctx.strokeStyle = 'rgba(37, 99, 235, 0.08)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 640; i += 40) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, 360);
          ctx.stroke();
        }

        // Coach Halo Avatar
        const pulse = Math.sin(t * 2.2) * 5;
        ctx.fillStyle = 'rgba(37, 99, 235, 0.18)';
        ctx.beginPath();
        ctx.arc(320, 142, 60 + pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#2563EB';
        ctx.beginPath();
        ctx.arc(320, 142, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#60A5FA';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 30px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(initials || 'RM', 320, 153);

        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.fillText(name || 'Coach Rahul Mehta (You)', 320, 222);
        ctx.font = '12px Inter, sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText('FitTrack Elite Head Coach · 1-on-1 Studio', 320, 242);
        ctx.textAlign = 'start';

        // Animated Audio Waveform Equalizer
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(205, 266, 230, 42);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.strokeRect(205, 266, 230, 42);

        const barCount = 14;
        for (let b = 0; b < barCount; b++) {
          const h = 4 + Math.abs(Math.sin(t * 3 + b * 0.45)) * 26;
          const bx = 218 + b * 15;
          const by = 287 - h / 2;
          ctx.fillStyle = '#34D399';
          ctx.fillRect(bx, by, 8, h);
        }

        // Live HD Pill
        ctx.fillStyle = 'rgba(16, 185, 129, 0.88)';
        ctx.fillRect(505, 16, 115, 24);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText('● 1080p Studio HD', 513, 32);
      }

      if (running) {
        if (type === 'client') {
          this.videoSession.syntheticClientRaf = requestAnimationFrame(render);
        } else {
          this.videoSession.syntheticCoachRaf = requestAnimationFrame(render);
        }
      }
    };

    render();

    const stream = canvas.captureStream(30);
    if (audioTrack) {
      stream.addTrack(audioTrack);
    }

    stream._stopSynthetic = () => {
      running = false;
      if (type === 'client' && this.videoSession.syntheticClientRaf) {
        cancelAnimationFrame(this.videoSession.syntheticClientRaf);
        this.videoSession.syntheticClientRaf = null;
      }
      if (type === 'coach' && this.videoSession.syntheticCoachRaf) {
        cancelAnimationFrame(this.videoSession.syntheticCoachRaf);
        this.videoSession.syntheticCoachRaf = null;
      }
    };

    return stream;
  },

  /* ── Synthetic Screen Share Biomechanics Presentation Stream ── */
  createSyntheticScreenShareStream() {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d', { alpha: false });
    let frame = 0;
    let running = true;

    const render = () => {
      if (!running) return;
      frame++;
      const t = frame * 0.035;

      ctx.fillStyle = '#090D16';
      ctx.fillRect(0, 0, 1280, 720);

      // Top Presentation Bar
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(0, 0, 1280, 54);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.strokeRect(0, 0, 1280, 54);

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillText('FitTrack Telemetry Pro · Biomechanical Velocity & Force Suite', 24, 34);

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 12px Inter, monospace';
      ctx.fillText('● LIVE SCREEN SHARE STREAM', 1050, 34);

      // Left Panel: Force-Velocity Curve
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(30, 80, 580, 275);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.strokeRect(30, 80, 580, 275);

      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText('Force-Velocity Distribution Curve', 50, 110);

      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      for (let y = 140; y < 330; y += 40) {
        ctx.beginPath();
        ctx.moveTo(50, y);
        ctx.lineTo(580, y);
        ctx.stroke();
      }

      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 0; x < 520; x += 10) {
        const y = 230 - Math.sin(t + x * 0.02) * 45 - Math.cos(t * 0.5 + x * 0.01) * 20;
        if (x === 0) ctx.moveTo(50 + x, y);
        else ctx.lineTo(50 + x, y);
      }
      ctx.stroke();

      // Right Panel: Barbell Path & Symmetry
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(670, 80, 580, 275);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.strokeRect(670, 80, 580, 275);

      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.fillText('Barbell Vertical Path & Kinetic Symmetry', 690, 110);

      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < 35; i++) {
        const py = 140 + i * 4.8;
        const px = 860 + Math.sin(t * 2 + i * 0.16) * 14;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      ctx.fillStyle = '#94A3B8';
      ctx.font = '12px Inter, monospace';
      ctx.fillText('Bar Path Deviation: ± 1.1 cm (Elite)', 890, 205);
      ctx.fillText('Left Drive Symmetry: 50.4%', 890, 235);
      ctx.fillText('Right Drive Symmetry: 49.6%', 890, 255);

      // Bottom Large Telemetry Summary
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(30, 385, 1220, 295);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.strokeRect(30, 385, 1220, 295);

      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 15px Inter, sans-serif';
      ctx.fillText('Live Joint Angular Telemetry & Coach Notes', 50, 420);

      const metrics = [
        { label: 'Mean Concentric Velocity', val: `${(0.74 + Math.sin(t) * 0.06).toFixed(2)} m/s`, col: '#34D399' },
        { label: 'Peak Power Output', val: `${Math.round(850 + Math.sin(t * 1.5) * 55)} W`, col: '#38BDF8' },
        { label: 'Hip Extension Torque', val: `${Math.round(315 + Math.cos(t) * 12)} Nm`, col: '#FBBF24' },
        { label: 'Spine Neutrality Index', val: '98.2% (Optimal)', col: '#A78BFA' }
      ];

      metrics.forEach((m, idx) => {
        const mx = 60 + idx * 290;
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.fillRect(mx, 445, 260, 100);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.strokeRect(mx, 445, 260, 100);

        ctx.fillStyle = '#94A3B8';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText(m.label, mx + 16, 475);

        ctx.fillStyle = m.col;
        ctx.font = 'bold 22px Inter, monospace';
        ctx.fillText(m.val, mx + 16, 515);
      });

      ctx.fillStyle = '#94A3B8';
      ctx.font = '13px Inter, sans-serif';
      ctx.fillText('💡 Coach Feedback: "Drive through midfoot, maintain tight upper back brace out of the hole."', 60, 595);

      if (running) {
        this.videoSession.syntheticScreenRaf = requestAnimationFrame(render);
      }
    };

    render();

    const stream = canvas.captureStream(30);
    stream._stopSynthetic = () => {
      running = false;
      if (this.videoSession.syntheticScreenRaf) {
        cancelAnimationFrame(this.videoSession.syntheticScreenRaf);
        this.videoSession.syntheticScreenRaf = null;
      }
    };

    return stream;
  },

  /* ── 1-on-1 Video Session Initialization (WebRTC + Synthetic Feeds) ── */
  async initWebRTCSession(sessionId) {
    const isTrainer = this.currentRole === 'trainer';
    const sessionUser = Auth.getUser();
    const coachName = isTrainer ? (sessionUser ? sessionUser.name : 'Coach') : (FitTrackData.trainerProfile ? FitTrackData.trainerProfile.name : 'Coach Rahul Mehta');
    const clientName = isTrainer ? 'Aarav Sharma' : (sessionUser ? sessionUser.name : (FitTrackData.clientProfile ? FitTrackData.clientProfile.name : 'Member'));

    // 1. Get or create Local Video Stream (Coach)
    let localStream = null;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });
      }
    } catch (err) {
      console.warn('Real webcam not accessible, activating High-Definition Studio stream:', err);
    }

    if (!localStream) {
      localStream = this.createSyntheticVideoFeed('coach', isTrainer ? `${coachName} (You)` : coachName, isTrainer ? 'RM' : 'IN');
    }
    this.videoSession.localStream = localStream;

    // Attach to local video element
    const localVideo = document.getElementById('v-local-video');
    const localPlaceholder = document.getElementById('v-local-placeholder');
    const localStats = document.getElementById('v-local-stats');
    if (localVideo) {
      localVideo.srcObject = localStream;
      localVideo.style.display = 'block';
      localVideo.muted = true;
      localVideo.play().catch(() => {});
    }
    if (localPlaceholder) localPlaceholder.style.display = 'none';
    if (localStats) localStats.textContent = 'Local Camera · Active HD';

    // 2. Client Stream (Remote)
    // Always start with live client workout & posture telemetry stream
    const clientStream = this.createSyntheticVideoFeed('client', clientName, 'AS');
    this.videoSession.remoteStream = clientStream;

    const remoteVideo = document.getElementById('v-remote-video');
    const remotePlaceholder = document.getElementById('v-remote-placeholder');
    const remoteStatus = document.getElementById('v-remote-status');
    const remoteStats = document.getElementById('v-remote-stats');

    if (remoteVideo) {
      remoteVideo.srcObject = clientStream;
      remoteVideo.style.display = 'block';
      remoteVideo.play().catch(() => {});
    }
    if (remotePlaceholder) remotePlaceholder.style.display = 'none';
    if (remoteStatus) remoteStatus.textContent = '● Connected · Biomechanics AI Active';
    if (remoteStats) remoteStats.textContent = 'Client HD 1080p · AI Pose Tracking';

    // 3. Initialize Web Audio Analysers
    this.initAudioAnalyser(localStream, 'local');
    this.initAudioAnalyser(clientStream, 'remote');

    // 4. WebRTC Peer Connection & Multi-tab BroadcastChannel
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      this.videoSession.peerConnection = pc;

      localStream.getTracks().forEach(track => {
        try { pc.addTrack(track, localStream); } catch (e) {}
      });

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          // If a real peer joins from a second window, switch to peer stream
          if (this.videoSession.remoteStream && this.videoSession.remoteStream._stopSynthetic) {
            this.videoSession.remoteStream._stopSynthetic();
          }
          this.videoSession.remoteStream = event.streams[0];
          if (remoteVideo) {
            remoteVideo.srcObject = event.streams[0];
            remoteVideo.style.display = 'block';
            remoteVideo.play().catch(() => {});
          }
          if (remotePlaceholder) remotePlaceholder.style.display = 'none';
          if (remoteStatus) remoteStatus.textContent = '● Connected (Live Peer Stream)';
          if (remoteStats) remoteStats.textContent = 'Live Remote Peer · 720p HD';
          this.initAudioAnalyser(event.streams[0], 'remote');
        }
      };

      const channelName = 'fittrack_webrtc_session_' + sessionId;
      if (this.videoSession.signalingChannel) {
        this.videoSession.signalingChannel.close();
      }
      const channel = new BroadcastChannel(channelName);
      this.videoSession.signalingChannel = channel;

      channel.onmessage = async (e) => {
        const data = e.data;
        if (!data || data.sessionId !== sessionId || data.sender === this.videoSession.myRole) return;

        if (data.type === 'peer_join') {
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            channel.postMessage({
              type: 'sdp_offer',
              sdp: offer,
              sender: this.videoSession.myRole,
              sessionId: sessionId
            });
          } catch (err) {}
        } else if (data.type === 'sdp_offer') {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            channel.postMessage({
              type: 'sdp_answer',
              sdp: answer,
              sender: this.videoSession.myRole,
              sessionId: sessionId
            });
          } catch (err) {}
        } else if (data.type === 'sdp_answer') {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
          } catch (err) {}
        } else if (data.type === 'ice_candidate') {
          try {
            if (data.candidate) await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (err) {}
        } else if (data.type === 'media_state') {
          const remoteMutedBadge = document.getElementById('v-remote-muted-badge');
          if (remoteMutedBadge) remoteMutedBadge.style.display = data.isMicOn ? 'none' : 'flex';
          if (remoteVideo && remotePlaceholder) {
            if (data.isCamOn) {
              remoteVideo.style.display = 'block';
              remotePlaceholder.style.display = 'none';
            } else {
              remoteVideo.style.display = 'none';
              remotePlaceholder.style.display = 'flex';
            }
          }
        }
      };

      channel.postMessage({
        type: 'peer_join',
        sender: this.videoSession.myRole,
        sessionId: sessionId
      });
    } catch (e) {
      console.warn('WebRTC signaling notice:', e);
    }

    // 5. Start Active Call Duration Timer
    this.videoSession.hasConnected = true;
    if (this.videoSession.timerInterval) clearInterval(this.videoSession.timerInterval);
    this.videoSession.timerInterval = setInterval(() => {
      this.videoSession.callSeconds++;
      const mins = String(Math.floor(this.videoSession.callSeconds / 60)).padStart(2, '0');
      const secs = String(this.videoSession.callSeconds % 60).padStart(2, '0');
      const timerElem = document.getElementById('v-call-timer');
      if (timerElem) timerElem.textContent = `${mins}:${secs}`;
    }, 1000);

    App.showToast('success', '1-on-1 Coaching Room Active! 📹', 'Real-time video streams and AI telemetry connected.');
  },

  /* ── Audio Analyser & Speaking Detection (Web Audio API) ── */
  initAudioAnalyser(stream, target) {
    try {
      const audioTracks = stream.getAudioTracks();
      if (!audioTracks || audioTracks.length === 0) return;

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.videoSession.audioContext || this.videoSession.audioContext.state === 'closed') {
        this.videoSession.audioContext = new AudioContextClass();
      }
      const ctx = this.videoSession.audioContext;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      source.connect(analyser);

      if (target === 'local') {
        this.videoSession.localAnalyser = analyser;
      } else {
        this.videoSession.remoteAnalyser = analyser;
      }

      if (!this.videoSession.speakingInterval) {
        const buffer = new Uint8Array(128);
        this.videoSession.speakingInterval = setInterval(() => {
          if (this.videoSession.localAnalyser && this.videoSession.isMicOn) {
            this.videoSession.localAnalyser.getByteFrequencyData(buffer);
            let sum = 0;
            for (let i = 0; i < buffer.length; i++) sum += buffer[i];
            const avg = sum / buffer.length;
            const isSpeaking = avg > 14;

            const localTile = document.getElementById('v-local-tile');
            const localStatus = document.getElementById('v-local-status');
            if (localTile) localTile.classList.toggle('speaking', isSpeaking);
            if (localStatus && this.videoSession.isCamOn) {
              localStatus.textContent = isSpeaking ? '● Speaking (Active)' : 'Camera & Mic Active';
              localStatus.style.color = isSpeaking ? '#34D399' : '#94A3B8';
            }
          }

          if (this.videoSession.remoteAnalyser) {
            this.videoSession.remoteAnalyser.getByteFrequencyData(buffer);
            let sum = 0;
            for (let i = 0; i < buffer.length; i++) sum += buffer[i];
            const avg = sum / buffer.length;
            const isSpeaking = avg > 14;

            const remoteTile = document.getElementById('v-remote-tile');
            const remoteStatus = document.getElementById('v-remote-status');
            if (remoteTile) remoteTile.classList.toggle('speaking', isSpeaking);
            if (remoteStatus) {
              remoteStatus.textContent = isSpeaking ? '● Speaking (Active Stream)' : '● Connected · Biomechanics AI Active';
              remoteStatus.style.color = isSpeaking ? '#34D399' : '#94A3B8';
            }
          }
        }, 120);
      }
    } catch (e) {
      console.warn('Audio analyser init error:', e);
    }
  },

  retryMediaPermissions() {
    const errorBanner = document.getElementById('v-device-error-banner');
    if (errorBanner) errorBanner.style.display = 'none';
    if (this.videoSession.activeSessionId) {
      this.initWebRTCSession(this.videoSession.activeSessionId);
    }
  },

  /* ── Microphone Toggle ── */
  toggleVideoMic() {
    this.videoSession.isMicOn = !this.videoSession.isMicOn;
    const isMicOn = this.videoSession.isMicOn;

    if (this.videoSession.localStream) {
      const audioTracks = this.videoSession.localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMicOn;
      });
    }

    const btn = document.getElementById('btn-toggle-mic');
    if (btn) {
      btn.textContent = isMicOn ? '🎤 Mic On' : '🔇 Mic Muted';
      btn.style.background = isMicOn ? '#334155' : '#EF4444';
    }

    const localMutedBadge = document.getElementById('v-local-muted-badge');
    if (localMutedBadge) {
      localMutedBadge.style.display = isMicOn ? 'none' : 'flex';
    }

    if (this.videoSession.signalingChannel) {
      try {
        this.videoSession.signalingChannel.postMessage({
          type: 'media_state',
          isMicOn: isMicOn,
          isCamOn: this.videoSession.isCamOn,
          sender: this.videoSession.myRole,
          sessionId: this.videoSession.activeSessionId
        });
      } catch (e) {}
    }

    App.showToast('info', 'Microphone', isMicOn ? 'Microphone unmuted.' : 'Microphone muted.');
  },

  /* ── Camera Toggle ── */
  toggleVideoCam() {
    this.videoSession.isCamOn = !this.videoSession.isCamOn;
    const isCamOn = this.videoSession.isCamOn;

    if (this.videoSession.localStream) {
      const videoTracks = this.videoSession.localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = isCamOn;
      });
    }

    const btn = document.getElementById('btn-toggle-cam');
    if (btn) {
      btn.textContent = isCamOn ? '📹 Cam On' : '🚫 Cam Off';
      btn.style.background = isCamOn ? '#334155' : '#EF4444';
    }

    const localVideo = document.getElementById('v-local-video');
    const localPlaceholder = document.getElementById('v-local-placeholder');
    const localStatus = document.getElementById('v-local-status');

    if (localVideo && localPlaceholder) {
      if (isCamOn) {
        localVideo.style.display = 'block';
        localPlaceholder.style.display = 'none';
        if (localStatus) {
          localStatus.textContent = 'Camera & Mic Active';
          localStatus.style.color = '#94A3B8';
        }
      } else {
        localVideo.style.display = 'none';
        localPlaceholder.style.display = 'flex';
        if (localStatus) {
          localStatus.textContent = 'Camera Off';
          localStatus.style.color = '#EF4444';
        }
      }
    }

    if (this.videoSession.signalingChannel) {
      try {
        this.videoSession.signalingChannel.postMessage({
          type: 'media_state',
          isMicOn: this.videoSession.isMicOn,
          isCamOn: isCamOn,
          sender: this.videoSession.myRole,
          sessionId: this.videoSession.activeSessionId
        });
      } catch (e) {}
    }

    App.showToast('info', 'Camera', isCamOn ? 'Camera stream enabled.' : 'Camera video paused.');
  },

  /* ── Screen Share Toggle ── */
  async toggleVideoScreenShare() {
    if (this.videoSession.isScreenSharing) {
      this.stopScreenShare();
      return;
    }

    let screenStream = null;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: false
        });
      }
    } catch (err) {
      console.log('Native screen share prompt declined/unsupported, using Biomechanics Telemetry Presentation screen share');
    }

    if (!screenStream) {
      screenStream = this.createSyntheticScreenShareStream();
    }

    this.videoSession.screenStream = screenStream;
    this.videoSession.isScreenSharing = true;

    const screenVideo = document.getElementById('v-screen-video');
    const screenViewport = document.getElementById('v-screen-viewport');
    const grid = document.getElementById('v-participants-grid');
    const btn = document.getElementById('btn-toggle-screen');
    const sharerLabel = document.getElementById('v-screen-sharer-label');

    if (screenVideo) {
      screenVideo.srcObject = screenStream;
      screenVideo.play().catch(() => {});
    }
    if (screenViewport) screenViewport.style.display = 'block';
    if (grid) grid.className = 'video-grid-split with-screen';
    if (sharerLabel) sharerLabel.textContent = 'You are sharing: Biomechanics & Velocity Telemetry';
    if (btn) {
      btn.textContent = '🛑 Stop Sharing';
      btn.style.background = '#D97706';
    }

    const screenTrack = screenStream.getVideoTracks()[0];
    if (screenTrack) {
      screenTrack.onended = () => {
        this.stopScreenShare();
      };
    }

    if (this.videoSession.signalingChannel) {
      try {
        this.videoSession.signalingChannel.postMessage({
          type: 'screen_share',
          active: true,
          sender: this.videoSession.myRole,
          sessionId: this.videoSession.activeSessionId
        });
      } catch (e) {}
    }

    App.showToast('success', 'Screen Share Active', 'Screen presentation is streaming live to the session.');
  },

  stopScreenShare() {
    if (this.videoSession.screenStream) {
      if (this.videoSession.screenStream._stopSynthetic) {
        this.videoSession.screenStream._stopSynthetic();
      }
      this.videoSession.screenStream.getTracks().forEach(t => t.stop());
      this.videoSession.screenStream = null;
    }
    this.videoSession.isScreenSharing = false;

    const screenViewport = document.getElementById('v-screen-viewport');
    const screenVideo = document.getElementById('v-screen-video');
    const grid = document.getElementById('v-participants-grid');
    const btn = document.getElementById('btn-toggle-screen');

    if (screenVideo) screenVideo.srcObject = null;
    if (screenViewport) screenViewport.style.display = 'none';
    if (grid) grid.className = 'video-grid-split';
    if (btn) {
      btn.textContent = '🖥️ Share Screen';
      btn.style.background = '#334155';
    }

    if (this.videoSession.signalingChannel) {
      try {
        this.videoSession.signalingChannel.postMessage({
          type: 'screen_share',
          active: false,
          sender: this.videoSession.myRole,
          sessionId: this.videoSession.activeSessionId
        });
      } catch (e) {}
    }

    App.showToast('info', 'Screen Share Ended', 'Returned to standard camera view.');
  },

  /* ── End Call & Clean Hardware Resources ── */
  async closeVideoSession() {
    const activeSessionId = this.videoSession.activeSessionId;

    // 0. Stop active recording safely without losing data
    if (this.videoSession.isRecording) {
      this.stopVideoRecording();
    }

    // Exit fullscreen if active
    if (this.videoSession.isMaximized) {
      this.toggleVideoMaximize();
    }

    // 1. Stop all hardware media tracks & synthetic loops
    if (this.videoSession.localStream) {
      if (this.videoSession.localStream._stopSynthetic) {
        this.videoSession.localStream._stopSynthetic();
      }
      this.videoSession.localStream.getTracks().forEach(track => {
        track.stop();
      });
      this.videoSession.localStream = null;
    }

    if (this.videoSession.remoteStream) {
      if (this.videoSession.remoteStream._stopSynthetic) {
        this.videoSession.remoteStream._stopSynthetic();
      }
      this.videoSession.remoteStream.getTracks().forEach(track => {
        track.stop();
      });
      this.videoSession.remoteStream = null;
    }

    if (this.videoSession.screenStream) {
      if (this.videoSession.screenStream._stopSynthetic) {
        this.videoSession.screenStream._stopSynthetic();
      }
      this.videoSession.screenStream.getTracks().forEach(track => {
        track.stop();
      });
      this.videoSession.screenStream = null;
    }

    // 2. Announce departure and close signaling channel
    if (this.videoSession.signalingChannel) {
      try {
        this.videoSession.signalingChannel.postMessage({
          type: 'peer_leave',
          sender: this.videoSession.myRole,
          sessionId: activeSessionId
        });
        this.videoSession.signalingChannel.close();
      } catch (e) {}
      this.videoSession.signalingChannel = null;
    }

    // 3. Close WebRTC Peer Connection
    if (this.videoSession.peerConnection) {
      try {
        this.videoSession.peerConnection.close();
      } catch (e) {}
      this.videoSession.peerConnection = null;
    }

    // 4. Close Audio Context & Analyzers
    if (this.videoSession.speakingInterval) {
      clearInterval(this.videoSession.speakingInterval);
      this.videoSession.speakingInterval = null;
    }

    if (this.videoSession.audioContext) {
      try {
        this.videoSession.audioContext.close();
      } catch (e) {}
      this.videoSession.audioContext = null;
    }

    // 5. Clear Timers & Animation Frames
    if (this.videoSession.timerInterval) {
      clearInterval(this.videoSession.timerInterval);
      this.videoSession.timerInterval = null;
    }
    if (this.videoSession.recordingTimerInterval) {
      clearInterval(this.videoSession.recordingTimerInterval);
      this.videoSession.recordingTimerInterval = null;
    }
    if (this.videoSession.recordingRafId) {
      cancelAnimationFrame(this.videoSession.recordingRafId);
      this.videoSession.recordingRafId = null;
    }

    // 6. Reset Video Elements
    const localVideo = document.getElementById('v-local-video');
    const remoteVideo = document.getElementById('v-remote-video');
    const screenVideo = document.getElementById('v-screen-video');
    if (localVideo) localVideo.srcObject = null;
    if (remoteVideo) remoteVideo.srcObject = null;
    if (screenVideo) screenVideo.srcObject = null;

    App.closeModal('video-session-modal');

    // 7. Status flow: mark session Completed in data store
    if (activeSessionId) {
      try {
        await FitTrackAPI.completeSession(activeSessionId);
      } catch (e) {}

      const sTrainer = (FitTrackData.trainerSessions || []).find(s => s.id === activeSessionId);
      if (sTrainer) {
        sTrainer.status = 'Completed';
        sTrainer.category = 'completed';
      }
      const sUpcoming = (FitTrackData.upcomingSessions || []).find(s => s.id === activeSessionId);
      if (sUpcoming) {
        sUpcoming.status = 'Completed';
        sUpcoming.category = 'completed';
      }

      FitTrackData.saveToStorage();
      FitTrackData.syncNavBadges();
      Sidebar.render();
      Sidebar.bindEvents();
      this.renderCurrentView();

      App.showToast('success', 'Session Completed! 🎉', 'Video coaching session ended and marked as completed.');
    } else {
      App.showToast('info', 'Session Concluded', 'Video room closed.');
    }
  },

  async retryCompleteSession(sessionId) {
    try {
      const res = await FitTrackAPI.completeSession(sessionId);
      if (res.success) {
        FitTrackData.syncNavBadges();
        Sidebar.render();
        Sidebar.bindEvents();
        this.renderCurrentView();
        App.showToast('success', 'Session Completed! 🎉', 'Session successfully marked completed.');
      } else {
        App.showToast('error', 'Retry Failed', 'Unable to sync status to server.');
      }
    } catch (err) {
      App.showToast('error', 'Retry Failed', err.message);
    }
  },

  showSessionDetails(sessionId) {
    const session = FitTrackData.trainerSessions.find(s => s.id === sessionId);
    if (!session) return;
    const hasRec = session.recording || FitTrackData.getSessionRecording(sessionId);
    const modalBody = document.getElementById('session-details-modal-body');
    if (modalBody) {
      modalBody.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid var(--border-light);">
          <div>
            <span style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;">ID: ${session.id}</span>
            <h4 style="margin:2px 0 0;font-size:16px;font-weight:700;color:var(--text-primary);">${session.type}</h4>
          </div>
          <span class="badge ${session.status === 'Completed' ? 'badge--blue' : session.status === 'Confirmed' ? 'badge--emerald' : 'badge--gray'}">
            ● ${session.status}
          </span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;font-size:13px;">
          <div>
            <div style="color:var(--text-muted);font-size:11px;font-weight:600;">CLIENT</div>
            <div style="font-weight:600;color:var(--text-primary);">${session.clientName}</div>
          </div>
          <div>
            <div style="color:var(--text-muted);font-size:11px;font-weight:600;">COACH</div>
            <div style="font-weight:600;color:var(--text-primary);">Coach Rahul Mehta</div>
          </div>
          <div>
            <div style="color:var(--text-muted);font-size:11px;font-weight:600;">DATE & TIME</div>
            <div style="font-weight:600;color:var(--text-primary);">${session.date} · ${session.time}</div>
          </div>
          <div>
            <div style="color:var(--text-muted);font-size:11px;font-weight:600;">DURATION</div>
            <div style="font-weight:600;color:var(--text-primary);">${session.duration || '60 min'}</div>
          </div>
        </div>
        <div style="background:var(--bg-surface-hover);padding:10px 12px;border-radius:8px;margin-bottom:16px;border:1px solid var(--border-light);">
          <div style="color:var(--text-muted);font-size:11px;font-weight:600;margin-bottom:3px;">CONSULTATION AGENDA</div>
          <div style="font-size:13px;color:var(--text-primary);line-height:1.4;">${session.topic}</div>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;">
          ${hasRec ? `<button class="btn btn--secondary btn--sm" onclick="App.closeModal('session-details-modal'); Dashboard.openSavedRecordingViewer('${session.id}');" style="color:#38BDF8;border-color:#38BDF8;display:inline-flex;align-items:center;gap:4px;">🎥 View Recording</button>` : ''}
          ${session.status !== 'Completed' && !session.status.includes('Cancelled') ? `<button class="btn btn--primary btn--sm" onclick="App.closeModal('session-details-modal'); Dashboard.launchVideoSession('${session.id}');" style="display:inline-flex;align-items:center;gap:4px;">📹 Start Session</button>` : ''}
          <button class="btn btn--secondary btn--sm" onclick="App.closeModal('session-details-modal'); Dashboard.openRescheduleModal('${session.id}');" style="display:inline-flex;align-items:center;gap:4px;">📅 Reschedule</button>
          <button class="btn btn--secondary btn--sm" onclick="App.closeModal('session-details-modal');">Close</button>
        </div>
      `;
      App.openModal('session-details-modal');
    } else {
      App.showToast('info', 'Session Details', `Coach: Rahul Mehta | Client: ${session.clientName} | Status: ${session.status}`);
    }
  },

  openRescheduleForm(sessionId) {
    const session = FitTrackData.trainerSessions.find(s => s.id === sessionId);
    if (!session) return;

    if (this.currentView !== 'trainer_schedule_sessions') {
      this.navigate('trainer_schedule_sessions');
    }

    setTimeout(() => {
      const clientSelect = document.getElementById('ts-client');
      const typeSelect = document.getElementById('ts-type');
      const topicInput = document.getElementById('ts-topic');
      const form = document.getElementById('form-trainer-session');

      if (clientSelect) {
        for (let i = 0; i < clientSelect.options.length; i++) {
          if (clientSelect.options[i].value.includes(session.clientName) || session.clientName.includes(clientSelect.options[i].value)) {
            clientSelect.selectedIndex = i;
            break;
          }
        }
      }
      if (typeSelect) {
        for (let i = 0; i < typeSelect.options.length; i++) {
          if (typeSelect.options[i].value === session.type) {
            typeSelect.selectedIndex = i;
            break;
          }
        }
      }
      if (topicInput) {
        topicInput.value = `Follow-up: ${session.topic}`;
      }

      if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      App.showToast('info', 'Book Follow-Up Session 📅', `Booking form pre-filled for ${session.clientName}. Completed session history is preserved.`);
    }, 120);
  },

  /* ── INTERACTIVE EVENT HANDLERS & ACTIONS ── */
  bindViewEvents() {
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.dataset.modalClose;
        App.closeModal(modalId);
      });
    });

    const markAllBtn = document.getElementById('btn-mark-all-complete');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', () => App.handleMarkAllComplete());
    }

    if (this.currentView === 'messages') {
      const chatBody = document.getElementById('chat-body');
      if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    }
  },

  /* ── Trainer Action Handlers ── */
  handleSubmitQualification() {
    const title = document.getElementById('qual-title').value;
    const issuer = document.getElementById('qual-issuer').value;
    const year = document.getElementById('qual-year').value;

    FitTrackData.trainerProfile.qualifications.unshift({
      id: `q_${Date.now()}`,
      name: title,
      issuer,
      year,
      status: 'Verified'
    });

    App.showToast('success', 'Credential Added! 🏅', `"${title}" has been added and is now active on your public profile.`);
    this.renderCurrentView();
  },

  handleSavePublicProfile() {
    const name = document.getElementById('tp-name').value;
    const title = document.getElementById('tp-title').value;
    const rate = parseFloat(document.getElementById('tp-rate').value) || 45;
    const exp = parseInt(document.getElementById('tp-exp').value) || 8;
    const bio = document.getElementById('tp-bio').value;
    const specs = document.getElementById('tp-specialties').value.split(',').map(s => s.trim());

    FitTrackData.trainerProfile.name = name;
    FitTrackData.trainerProfile.title = title;
    FitTrackData.trainerProfile.ratePerHour = rate;
    FitTrackData.trainerProfile.experienceYears = exp;
    FitTrackData.trainerProfile.bio = bio;
    FitTrackData.trainerProfile.specialties = specs;

    App.showToast('success', 'Public Profile Updated! 🌟', 'Your public trainer profile changes are live for all members to view.');
    App.renderTopbar();
    this.renderCurrentView();
  },

  toggleDayAvailability(dayName, enabled) {
    const d = FitTrackData.trainerAvailability.days.find(x => x.day === dayName);
    if (d) {
      d.enabled = enabled;
      App.showToast('info', 'Availability Changed', `${dayName} marked as ${enabled ? 'Available' : 'Closed'}.`);
      this.renderCurrentView();
    }
  },

  handleSaveAvailability() {
    const cap = parseInt(document.getElementById('avail-capacity').value) || 40;
    FitTrackData.trainerAvailability.maxClientsCapacity = cap;
    App.showToast('success', 'Schedule Saved! ⏰', `Your weekly working hours and ${cap} clients capacity limit are updated.`);
    this.renderCurrentView();
  },

  handleCreatePlan() {
    const title = document.getElementById('new-plan-title').value;
    const tier = document.getElementById('new-plan-tier').value;
    const duration = document.getElementById('new-plan-dur').value;
    const desc = document.getElementById('new-plan-desc').value;
    const workout = document.getElementById('new-plan-workout') ? document.getElementById('new-plan-workout').value : 'Custom Periodization';
    const diet = document.getElementById('new-plan-diet') ? document.getElementById('new-plan-diet').value : 'Custom Nutrition Blueprint';

    const priceMap = { 'Pro Coaching': '$59 / month', 'Elite Coaching': '$99 / month', 'Starter Access': '$39 / month' };

    FitTrackData.trainerPublishedPlans.unshift({
      id: `tp_${Date.now()}`,
      title,
      tier,
      price: priceMap[tier] || '$59 / month',
      duration,
      enrolledCount: 0,
      status: 'Published',
      publishedDate: 'Just Now',
      workoutFeatures: workout,
      dietGuidance: diet,
      rating: 5.0,
      description: desc
    });

    App.showToast('success', 'Plan Published Instantly! 🚀', `"${title}" is now live and available for members to purchase and subscribe.`);
    this.renderCurrentView();
  },

  togglePlanPublishStatus(planId) {
    const plan = FitTrackData.trainerPublishedPlans.find(p => p.id === planId);
    if (plan) {
      plan.status = plan.status === 'Published' ? 'Draft' : 'Published';
      if (plan.status === 'Published' && (!plan.publishedDate || plan.publishedDate === '—')) {
        plan.publishedDate = 'Today';
      }
      App.showToast(plan.status === 'Published' ? 'success' : 'info', 'Plan Updated 🔄', `"${plan.title}" is now ${plan.status}.`);
      this.renderCurrentView();
    }
  },

  openAssignForClient(clientName) {
    this.navigate('trainer_assign_activities');
    setTimeout(() => {
      const sel = document.getElementById('asg-client');
      if (sel) sel.value = clientName;
    }, 100);
  },

  setTrainerSessionFilter(category) {
    this.trainerSessionCategoryFilter = category;
    this.renderCurrentView();
  },

  openRescheduleModal(sessionId) {
    const session = (FitTrackData.trainerSessions || []).find(s => s.id === sessionId);
    if (!session) {
      App.showToast('error', 'Session Not Found', 'Could not locate session record.');
      return;
    }

    const idInput = document.getElementById('resched-session-id');
    const nameEl = document.getElementById('resched-client-name');
    const infoEl = document.getElementById('resched-current-info');
    const dateInput = document.getElementById('resched-date');
    const timeSelect = document.getElementById('resched-time');
    const reasonInput = document.getElementById('resched-reason');

    if (idInput) idInput.value = session.id;
    if (nameEl) nameEl.textContent = `${session.clientName} · ${session.type}`;
    if (infoEl) infoEl.textContent = `Current Appointment: ${session.date} at ${session.time}`;
    if (dateInput) {
      dateInput.value = (session.date && session.date.includes('-')) ? session.date : new Date().toISOString().slice(0, 10);
    }
    if (timeSelect) {
      for (let i = 0; i < timeSelect.options.length; i++) {
        if (timeSelect.options[i].value === session.time) {
          timeSelect.selectedIndex = i;
          break;
        }
      }
    }
    if (reasonInput) reasonInput.value = session.topic || 'Form Check & Progress Audit';

    App.openModal('session-reschedule-modal');
  },

  handleConfirmReschedule() {
    const sid = document.getElementById('resched-session-id').value;
    const newDate = document.getElementById('resched-date').value;
    const newTime = document.getElementById('resched-time').value;
    const newReason = document.getElementById('resched-reason').value;

    const session = (FitTrackData.trainerSessions || []).find(s => s.id === sid);
    if (!session) {
      App.closeModal('session-reschedule-modal');
      return;
    }

    session.date = newDate;
    session.time = newTime;
    session.topic = newReason;
    session.status = 'Confirmed';
    session.category = 'upcoming';

    if (FitTrackData.upcomingSessions) {
      const uSession = FitTrackData.upcomingSessions.find(s => s.id === sid || s.topic === session.topic);
      if (uSession) {
        uSession.date = newDate;
        uSession.time = newTime;
        uSession.topic = newReason;
        uSession.status = 'confirmed';
      }
    }

    FitTrackData.syncNavBadges();
    FitTrackData.saveToStorage();
    App.closeModal('session-reschedule-modal');
    App.showToast('success', 'Session Rescheduled! 📅', `Session with ${session.clientName} moved to ${newDate} at ${newTime}.`);
    this.renderCurrentView();
  },

  markSessionCompleted(sessionId) {
    const session = (FitTrackData.trainerSessions || []).find(s => s.id === sessionId);
    if (!session) return;

    session.status = 'Completed';
    session.category = 'completed';

    if (FitTrackData.upcomingSessions) {
      const uSession = FitTrackData.upcomingSessions.find(s => s.id === sessionId);
      if (uSession) {
        uSession.status = 'completed';
      }
    }

    FitTrackData.syncNavBadges();
    FitTrackData.saveToStorage();
    App.showToast('success', 'Session Completed! 🎉', `1-on-1 session with ${session.clientName} marked as completed.`);
    this.renderCurrentView();
  },

  cancelTrainerSession(sessionId) {
    const session = (FitTrackData.trainerSessions || []).find(s => s.id === sessionId);
    if (!session) return;

    session.status = 'Cancelled by Coach';
    session.category = 'cancelled';

    if (FitTrackData.upcomingSessions) {
      const uSession = FitTrackData.upcomingSessions.find(s => s.id === sessionId);
      if (uSession) {
        uSession.status = 'cancelled';
      }
    }

    FitTrackData.syncNavBadges();
    FitTrackData.saveToStorage();
    App.showToast('warning', 'Session Cancelled', `Session with ${session.clientName} has been cancelled.`);
    this.renderCurrentView();
  },

  handleAssignWorkout() {
    const client = document.getElementById('asg-client').value;
    const typeSelect = document.getElementById('asg-type');
    const type = typeSelect ? typeSelect.value : 'Strength Training';
    const ex = document.getElementById('asg-exercise').value;
    const sets = document.getElementById('asg-sets').value || '4';
    const reps = document.getElementById('asg-reps').value || '8-10 reps';
    const day = document.getElementById('asg-day').value || 'Wednesday, Sep 24';
    const dur = document.getElementById('asg-duration').value || '50 min';
    const tips = document.getElementById('asg-tips') ? document.getElementById('asg-tips').value : '';

    if (!FitTrackData.assignedActivitiesList) {
      FitTrackData.assignedActivitiesList = [];
    }

    const cleanClientName = client.split('(')[0].trim();
    const newActivity = {
      id: `asg_${Date.now()}`,
      clientName: cleanClientName,
      type,
      activityName: ex,
      date: day,
      duration: dur,
      sets: parseInt(sets) || 4,
      reps,
      notes: tips,
      status: 'Assigned (Active)',
      completion: 0
    };

    FitTrackData.assignedActivitiesList.unshift(newActivity);
    FitTrackData.saveToStorage();
    FitTrackData.syncNavBadges();

    App.showToast('success', 'Activity Assigned! 🏋️', `Pushed "${ex}" (${sets} sets, ${reps}) to ${cleanClientName}'s schedule.`);
    this.renderCurrentView();
  },

  completeAssignedActivity(actId) {
    const act = (FitTrackData.assignedActivitiesList || []).find(a => a.id === actId);
    if (act) {
      act.status = 'Completed by Coach Audit';
      act.completion = 100;
      FitTrackData.saveToStorage();
      App.showToast('success', 'Activity Completed! ✓', `"${act.activityName}" marked as 100% completed.`);
      this.renderCurrentView();
    }
  },

  removeAssignedActivity(actId) {
    const idx = (FitTrackData.assignedActivitiesList || []).findIndex(a => a.id === actId);
    if (idx !== -1) {
      const removed = FitTrackData.assignedActivitiesList.splice(idx, 1)[0];
      FitTrackData.saveToStorage();
      App.showToast('info', 'Activity Removed', `"${removed.activityName}" removed from schedule.`);
      this.renderCurrentView();
    }
  },

  openEditPlanModal(planId) {
    const plan = (FitTrackData.trainerPublishedPlans || []).find(p => p.id === planId);
    if (!plan) return;

    const idInput = document.getElementById('edit-plan-id');
    const titleInput = document.getElementById('edit-plan-title');
    const tierSelect = document.getElementById('edit-plan-tier');
    const durSelect = document.getElementById('edit-plan-dur');
    const descInput = document.getElementById('edit-plan-desc');

    if (idInput) idInput.value = plan.id;
    if (titleInput) titleInput.value = plan.title;
    if (tierSelect) tierSelect.value = plan.tier;
    if (durSelect) durSelect.value = plan.duration;
    if (descInput) descInput.value = plan.description;

    App.openModal('edit-plan-modal');
  },

  handleSaveEditPlan() {
    const planId = document.getElementById('edit-plan-id').value;
    const plan = (FitTrackData.trainerPublishedPlans || []).find(p => p.id === planId);
    if (!plan) {
      App.closeModal('edit-plan-modal');
      return;
    }

    const title = document.getElementById('edit-plan-title').value;
    const tier = document.getElementById('edit-plan-tier').value;
    const duration = document.getElementById('edit-plan-dur').value;
    const desc = document.getElementById('edit-plan-desc').value;

    const priceMap = { 'Pro Coaching': '$59 / month', 'Elite Coaching': '$99 / month', 'Starter Access': '$39 / month' };

    plan.title = title;
    plan.tier = tier;
    plan.duration = duration;
    plan.price = priceMap[tier] || plan.price;
    plan.description = desc;

    FitTrackData.saveToStorage();
    App.closeModal('edit-plan-modal');
    App.showToast('success', 'Plan Updated! 📝', `"${title}" details have been updated.`);
    this.renderCurrentView();
  },

  deleteTrainerPlan(planId) {
    const idx = (FitTrackData.trainerPublishedPlans || []).findIndex(p => p.id === planId);
    if (idx !== -1) {
      const removed = FitTrackData.trainerPublishedPlans.splice(idx, 1)[0];
      FitTrackData.saveToStorage();
      App.showToast('info', 'Plan Removed', `"${removed.title}" has been removed from coaching plans.`);
      this.renderCurrentView();
    }
  },

  deleteQualification(qualId) {
    const quals = FitTrackData.trainerProfile.qualifications;
    const idx = quals.findIndex(q => q.id === qualId);
    if (idx !== -1) {
      const removed = quals.splice(idx, 1)[0];
      FitTrackData.saveToStorage();
      App.showToast('info', 'Credential Removed', `"${removed.name}" removed from credentials.`);
      this.renderCurrentView();
    }
  },

  replyToReview(revId) {
    const rev = (FitTrackData.trainerReviews || []).find(r => r.id === revId);
    if (!rev) return;
    const defaultReplies = [
      "Thank you for the wonderful feedback! Proud of your discipline and progress.",
      "Incredible consistency! Let's keep pushing for the next milestone.",
      "Appreciate the kind words! Keep up the great work on your nutrition and workouts."
    ];
    const reply = defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
    rev.trainerReply = reply;
    FitTrackData.saveToStorage();
    App.showToast('success', 'Reply Published! 💬', 'Your response to the client review is now visible.');
    this.renderCurrentView();
  },

  previewPublicProfileModal() {
    const t = FitTrackData.trainerProfile;
    const body = document.getElementById('preview-profile-modal-body');
    if (body) {
      body.innerHTML = `
        <div class="profile-card__avatar-lg" style="margin:0 auto var(--space-3);background:linear-gradient(135deg, #059669, #047857);">${t.avatarInitials}</div>
        <h3 style="font-size:var(--text-xl);font-weight:800;color:var(--text-primary);margin-bottom:2px;">${t.name}</h3>
        <p style="font-size:var(--text-xs);color:var(--color-emerald-700);font-weight:700;">${t.title}</p>
        <div style="margin:8px 0;font-size:12px;color:#F59E0B;font-weight:700;">⭐ ${t.rating} · ${t.reviewsCount} Verified Reviews · ${t.experienceYears}+ Years Exp</div>
        <div style="background:var(--bg-surface-hover);padding:10px;border-radius:8px;margin:12px 0;border:1px solid var(--border-light);">
          <div style="font-size:11px;color:var(--text-muted);font-weight:700;text-transform:uppercase;">HOURLY RATE</div>
          <div style="font-size:20px;font-weight:800;color:var(--color-primary);">$${t.ratePerHour} / hr</div>
        </div>
        <p style="font-size:12px;color:var(--text-secondary);line-height:1.5;margin-bottom:12px;">"${t.bio}"</p>
        <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;">
          ${t.specialties.map(s => `<span class="trainer-tag">${s}</span>`).join('')}
        </div>
      `;
      App.openModal('preview-profile-modal');
    }
  },

  handleSaveTrainerSettings() {
    const tzSelect = document.getElementById('t-set-tz');
    const themeSelect = document.getElementById('t-set-theme');
    if (tzSelect && FitTrackData.trainerAvailability) {
      FitTrackData.trainerAvailability.timezone = tzSelect.value;
    }
    if (themeSelect) {
      App.setTheme(themeSelect.value);
    }
    FitTrackData.saveToStorage();
    App.showToast('success', 'Settings Saved! ⚙️', 'Trainer operational preferences committed successfully.');
  },

  handleAssignDiet() {
    const client = document.getElementById('diet-asg-client').value;
    const cals = document.getElementById('diet-cal').value;
    const prot = document.getElementById('diet-protein').value;

    App.showToast('success', 'Nutrition Blueprint Pushed! 🥗', `Assigned ${cals} (${prot} protein) diet schedule to ${client}.`);
    this.navigate('trainer_clients');
  },

  async handleTrainerScheduleSession() {
    const client = document.getElementById('ts-client').value;
    const type = document.getElementById('ts-type').value;
    const date = document.getElementById('ts-date').value;
    const time = document.getElementById('ts-time').value;
    const topic = document.getElementById('ts-topic').value;

    const initials = client.split(' ').map(n => n[0]).join('').slice(0, 2);

    const newSession = {
      id: `ts_${Date.now()}`,
      clientName: client,
      clientInitials: initials,
      date,
      time,
      type,
      duration: '60 min',
      topic,
      category: 'upcoming',
      status: 'Confirmed',
      meetingLink: `https://meet.fittrack.com/session-${Date.now()}`
    };

    await FitTrackAPI.bookSession(newSession);
    this.trainerSessionCategoryFilter = 'upcoming';
    FitTrackData.syncNavBadges();
    Sidebar.render();
    Sidebar.bindEvents();

    App.showToast('success', 'Session Scheduled! 📅', `1-on-1 session with ${client} on ${date} at ${time} confirmed. Video link generated.`);
    this.renderCurrentView();
  },

  handleSaveCoachFeedback(revId, clientName) {
    const note = document.getElementById(`coach-feedback-${revId}`).value;
    const rev = FitTrackData.clientProgressReviews.find(r => r.id === revId);
    if (rev) {
      rev.coachNote = note;
      rev.coachStatus = 'Reviewed & Approved';
    }
    App.showToast('success', 'Feedback Sent! 💬', `Your progress audit and feedback note have been delivered to ${clientName}.`);
    this.renderCurrentView();
  },

  handleSaveCRMNote(clientId) {
    const note = document.getElementById(`crm-notes-${clientId}`).value;
    const client = FitTrackData.clientCRM.find(c => c.clientId === clientId);
    if (client) {
      client.notes = note;
    }
    App.showToast('success', 'Client Note Saved! 📝', 'Private relationship note updated successfully.');
  },

  /* ── User Action Handlers ── */
  handleSaveProfile() {
    const name = document.getElementById('prof-fullname').value;
    const email = document.getElementById('prof-email').value;
    const height = parseFloat(document.getElementById('prof-height').value) || 168;
    const weight = parseFloat(document.getElementById('prof-weight').value) || 64.5;
    const targetWeight = parseFloat(document.getElementById('prof-target-weight').value) || 58.0;

    FitTrackData.currentUser.fullName = name;
    FitTrackData.currentUser.name = name.split(' ')[0];
    FitTrackData.currentUser.email = email;
    FitTrackData.currentUser.height = height;
    FitTrackData.currentUser.weight = weight;
    FitTrackData.currentUser.targetWeight = targetWeight;

    App.showToast('success', 'Profile Updated!', 'Your profile information and fitness biometrics were saved successfully.');
    App.renderTopbar();
    this.renderCurrentView();
  },

  formatGoalDate(iso) {
    if (!iso) return '—';
    const d = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  },

  renderGoalTypeOptions(selected) {
    const types = [
      'Fat Loss & Muscle Toning',
      'Hypertrophy & Muscle Gain',
      'Strength & Powerlifting',
      'Endurance & Cardiovascular',
      'Mobility & Flexibility',
      'Weight Loss & Muscle Definition'
    ];
    const unique = types.includes(selected) || !selected ? types : [selected, ...types];
    return unique.map(type =>
      `<option value="${type}" ${type === selected ? 'selected' : ''}>${type}</option>`
    ).join('');
  },

  applyGoalTimeline() {
    const goal = FitTrackData.activeGoal;
    if (!goal || !goal.startDate || !goal.targetDate) return;
    const start = new Date(`${goal.startDate}T00:00:00`);
    const target = new Date(`${goal.targetDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(start.getTime()) || Number.isNaN(target.getTime())) return;
    const msPerDay = 1000 * 60 * 60 * 24;
    goal.totalDays = Math.max(1, Math.round((target - start) / msPerDay));
    goal.daysElapsed = Math.max(0, Math.round((today - start) / msPerDay));
  },

  persistActiveGoal() {
    if (typeof FitTrackData.saveToStorage === 'function') {
      FitTrackData.saveToStorage();
    }
  },

  handleSaveGoal() {
    const title = document.getElementById('goal-title').value;
    const goalTypeEl = document.getElementById('goal-type');
    const workoutsEl = document.getElementById('goal-workouts-week');
    const dateEl = document.getElementById('goal-target-date');
    const targetWeight = parseFloat(document.getElementById('goal-target-weight').value) || 58.0;
    const cal = parseInt(document.getElementById('goal-target-cal').value) || 2100;
    const targetDate = dateEl ? dateEl.value : FitTrackData.activeGoal.targetDate;

    FitTrackData.activeGoal.title = title;
    if (goalTypeEl) FitTrackData.activeGoal.goalType = goalTypeEl.value;
    FitTrackData.activeGoal.targetWeight = targetWeight;
    FitTrackData.activeGoal.targetCalories = cal;
    if (workoutsEl) FitTrackData.activeGoal.targetWorkoutsPerWeek = parseInt(workoutsEl.value, 10) || 5;
    FitTrackData.activeGoal.targetDate = targetDate;
    FitTrackData.currentUser.targetWeight = targetWeight;
    this.applyGoalTimeline();
    this.persistActiveGoal();

    App.showToast('success', 'Goal Defined!', 'Your new fitness target, deadline, and daily targets have been recorded.');
    this.renderCurrentView();
  },

  filterTrainers(cat) {
    this.selectedTrainerFilter = cat;
    this.renderCurrentView();
  },

  bookWithTrainer(trainerName) {
    this.navigate('sessions');
    setTimeout(() => {
      const select = document.getElementById('book-trainer');
      if (select) {
        select.value = trainerName;
      }
    }, 100);
  },

  reviewTrainer(trainerName) {
    this.navigate('reviews');
    setTimeout(() => {
      const select = document.getElementById('review-trainer-select');
      if (select) {
        select.value = trainerName;
      }
    }, 100);
  },

  toggleBillingCycle() {
    this.selectedBilling = this.selectedBilling === 'monthly' ? 'yearly' : 'monthly';
    this.renderCurrentView();
  },

  setActivityTab(tab) {
    this.activeActivityTab = tab;
    this.renderCurrentView();
  },

  toggleTodayExercise(id) {
    const ex = FitTrackData.todaysWorkout.exercises.find(e => e.id === id);
    if (ex) {
      ex.completed = !ex.completed;
      const count = FitTrackData.todaysWorkout.exercises.filter(e => e.completed).length;
      FitTrackData.todaysWorkout.completedExercises = count;
      App.showToast('info', ex.completed ? 'Exercise Done! 💪' : 'Exercise Unchecked', `${ex.name} ${ex.completed ? 'marked as completed' : 'unmarked'}. (${count}/${FitTrackData.todaysWorkout.exercises.length})`);
      this.renderCurrentView();
    }
  },

  markTodayWorkoutComplete() {
    FitTrackData.todaysWorkout.exercises.forEach(e => { e.completed = true; });
    FitTrackData.todaysWorkout.completedExercises = FitTrackData.todaysWorkout.exercises.length;
    FitTrackData.activePlan.completedWorkouts = Math.min(FitTrackData.activePlan.totalWorkouts, FitTrackData.activePlan.completedWorkouts + 1);
    
    FitTrackData.progressData.recentHistory.unshift({
      date: 'Today',
      text: `Completed "${FitTrackData.todaysWorkout.title}" (6/6 exercises done)`,
      type: 'workout'
    });

    const memberFirst = (Auth.getUser()?.name || FitTrackData.currentUser?.name || 'Athlete').split(' ')[0];
    App.showToast('success', 'Workout Complete! 🔥🏆', `Amazing job, ${memberFirst}! You completed today's ${FitTrackData.todaysWorkout.title} workout. Progress logged.`);
    this.renderCurrentView();
  },

  markAllNotificationsRead() {
    FitTrackData.markAllNotificationsAsRead(false);
    this.updateBadges();
    App.showToast('info', 'Notifications Updated', 'All notifications marked as read.');
    this.renderCurrentView();
  },

  selectSlot(el) {
    document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
    el.classList.add('selected');
  },

  handleBookSession() {
    const trainerName = document.getElementById('book-trainer').value;
    const type = document.getElementById('book-type').value;
    const date = document.getElementById('book-date').value;
    const selectedSlot = document.querySelector('.slot-btn.selected');
    const slot = selectedSlot ? selectedSlot.dataset.slot : '06:00 PM – 07:00 PM';
    const topic = document.getElementById('book-notes').value || '1-on-1 Fitness Consultation';

    const newSession = {
      id: `session_${Date.now()}`,
      trainerName,
      trainerInitials: trainerName.split(' ').map(n => n[0]).join('').slice(0, 2),
      date,
      day: 'Upcoming',
      time: slot,
      type,
      status: 'confirmed',
      topic
    };

    FitTrackData.upcomingSessions.unshift(newSession);
    App.showToast('success', 'Session Booked! 📅', `Your session with ${trainerName} on ${date} at ${slot} is confirmed.`);
    this.renderCurrentView();
  },

  handleRecordProgress() {
    const date = document.getElementById('rec-date').value;
    const weight = parseFloat(document.getElementById('rec-weight').value) || 64.5;
    const bodyFat = parseFloat(document.getElementById('rec-bodyfat').value) || 22.0;
    const workouts = parseInt(document.getElementById('rec-workouts').value) || 4;
    const notes = document.getElementById('rec-notes').value || 'Weekly log update';

    FitTrackData.progressData.currentWeight = weight;
    FitTrackData.currentUser.weight = weight;
    FitTrackData.progressData.weightLogs.push({
      date: date.slice(5),
      weight,
      bodyFat,
      workouts,
      notes
    });

    FitTrackData.progressData.recentHistory.unshift({
      date: date.slice(5),
      text: `Logged weight: ${weight} kg · ${notes}`,
      type: 'weight'
    });

    App.showToast('success', 'Progress Recorded! 📈', `Weight logged at ${weight} kg. Chart updated.`);
    this.renderCurrentView();
  },

  sendQuickReply(text) {
    const input = document.getElementById('chat-input-text');
    if (input) {
      input.value = text;
      this.handleSendMessage();
    }
  },

  handleSendMessage() {
    const input = document.getElementById('chat-input-text');
    if (!input || !input.value.trim()) return;

    const userText = input.value.trim();
    input.value = '';

    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      senderName: FitTrackData.currentUser.name,
      time: 'Just now',
      text: userText,
      avatar: FitTrackData.currentUser.avatarInitials,
      read: true
    };

    FitTrackData.chatMessages.push(newMsg);
    FitTrackData.saveToStorage();
    this.renderCurrentView();

    setTimeout(() => {
      const memberFirst = (Auth.getUser()?.name || FitTrackData.currentUser?.name || 'Athlete').split(' ')[0];
      let replyText = `Got your message, ${memberFirst}! Great consistency on keeping me updated. Keep pushing on today's program!`;
      if (userText.toLowerCase().includes('calorie') || userText.toLowerCase().includes('diet')) {
        replyText = "On rest days, keep protein at 135g and drop carbs slightly by ~30g. Stay well hydrated!";
      } else if (userText.toLowerCase().includes('squat') || userText.toLowerCase().includes('form')) {
        replyText = "Send over the video or we will review your knee path in our video session this Saturday at 6 PM!";
      } else if (userText.toLowerCase().includes('saturday') || userText.toLowerCase().includes('session')) {
        replyText = "Confirmed! Saturday 6:00 PM video call is locked in my schedule.";
      }

      const isCurrentlyViewingMessages = Dashboard.currentRole === 'user' && Dashboard.currentView === 'messages';

      FitTrackData.chatMessages.push({
        id: `msg_trainer_${Date.now()}`,
        sender: 'trainer',
        senderName: 'Coach Arjun',
        time: 'Just now',
        text: replyText,
        avatar: 'AM',
        read: isCurrentlyViewingMessages ? true : false
      });
      FitTrackData.syncNavBadges();
      FitTrackData.saveToStorage();

      if (isCurrentlyViewingMessages) {
        Dashboard.renderCurrentView();
      }
      Dashboard.updateBadges();
      App.showToast('info', 'Coach Arjun Replied', replyText);
    }, 900);
  },

  setRating(val) {
    this.currentRatingValue = val;
    document.querySelectorAll('.star-pick').forEach((el, i) => {
      if (i < val) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  },

  handleSubmitReview() {
    const trainerName = document.getElementById('review-trainer-select').value;
    const tag = document.getElementById('review-tag').value;
    const comment = document.getElementById('review-text').value;

    const newRev = {
      id: `rev_${Date.now()}`,
      trainerName,
      authorName: FitTrackData.currentUser.fullName,
      authorInitials: FitTrackData.currentUser.avatarInitials,
      rating: this.currentRatingValue,
      date: 'Today',
      tag,
      comment
    };

    FitTrackData.trainerReviews.unshift(newRev);
    App.showToast('success', 'Review Submitted! ⭐', `Thank you! Your verified ${this.currentRatingValue}-star review for ${trainerName} is live.`);
    this.renderCurrentView();
  },

  openPurchaseModal(tier = 'pro') {
    const plan = FitTrackData.plansList.find(p => p.tier === tier) || FitTrackData.plansList[1];
    
    document.getElementById('chk-plan-name').textContent = plan.name;
    document.getElementById('chk-price').textContent = `$${plan.priceMonthly}.00`;
    document.getElementById('chk-total').textContent = `$${plan.priceMonthly}.00`;
    
    App.openModal('purchase-modal');
  },

  applyCoupon() {
    const code = document.getElementById('promo-code').value.trim().toUpperCase();
    if (code === 'FITTRACK20') {
      document.getElementById('chk-total').textContent = '$47.20 (20% OFF Applied!)';
      App.showToast('success', 'Coupon Applied!', '20% discount applied to your order.');
    } else {
      App.showToast('warning', 'Invalid Coupon', 'Try coupon code "FITTRACK20" for 20% discount.');
    }
  },

  handleConfirmPurchase() {
    App.closeModal('purchase-modal');
    FitTrackData.activePlan.name = document.getElementById('chk-plan-name').textContent;
    FitTrackData.activePlan.daysRemaining = 30;
    FitTrackData.currentUser.subscription = 'pro';

    App.showToast('success', 'Plan Activated! 🎉', 'Your membership plan is now active with full coach access and video sessions.');
    this.navigate('dashboard');
  },

  openRegisterModal(role = 'trainer') {
    const modalTitle = document.getElementById('reg-modal-title');
    const roleSelect = document.getElementById('reg-role');
    if (modalTitle) modalTitle.textContent = role === 'trainer' ? 'Register as Certified Trainer' : 'Register New Member Account';
    if (roleSelect) roleSelect.value = role;
    this.onRegisterRoleChange(role);
    App.openModal('register-modal');
  },

  onRegisterRoleChange(role) {
    const label = document.getElementById('reg-extra-label');
    const input = document.getElementById('reg-specialty');
    if (label && input) {
      if (role === 'trainer') {
        label.textContent = 'Primary Coaching Specialty';
        input.placeholder = 'e.g. Strength & Conditioning, HIIT, Yoga';
      } else {
        label.textContent = 'Primary Fitness Goal';
        input.placeholder = 'e.g. Fat Loss, Hypertrophy, Endurance';
      }
    }
  },

  handleRegisterAccount() {
    const role = document.getElementById('reg-role').value;
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;

    App.closeModal('register-modal');

    if (role === 'trainer') {
      FitTrackData.trainerProfile.name = name;
      FitTrackData.trainerProfile.email = email;
      FitTrackData.trainerProfile.avatarInitials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
      this.switchRole('trainer');
      App.showToast('success', 'Trainer Registered! 🎉', `Welcome Coach ${name}! Your professional trainer dashboard is ready.`);
    } else {
      FitTrackData.currentUser.fullName = name;
      FitTrackData.currentUser.name = name.split(' ')[0];
      FitTrackData.currentUser.email = email;
      FitTrackData.currentUser.avatarInitials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
      this.switchRole('user');
      App.showToast('success', 'Account Registered! 🎉', `Welcome to FitTrack, ${name}! Your personalized dashboard is ready.`);
    }
  },

  openEditGoalModal() {
    App.openModal('edit-goal-modal');
  },

  handleSaveGoalModal() {
    const title = document.getElementById('m-goal-title').value;
    const goalTypeEl = document.getElementById('m-goal-type');
    const targetWeight = parseFloat(document.getElementById('m-goal-target-weight').value) || 58.0;
    const cal = parseInt(document.getElementById('m-goal-cal').value) || 2100;
    const targetDate = document.getElementById('m-goal-target-date').value;

    FitTrackData.activeGoal.title = title;
    if (goalTypeEl) FitTrackData.activeGoal.goalType = goalTypeEl.value;
    FitTrackData.activeGoal.targetWeight = targetWeight;
    FitTrackData.activeGoal.targetCalories = cal;
    FitTrackData.activeGoal.targetDate = targetDate;
    FitTrackData.currentUser.targetWeight = targetWeight;
    this.applyGoalTimeline();
    this.persistActiveGoal();

    App.closeModal('edit-goal-modal');
    App.showToast('success', 'Goal Updated! 🎯', `Your fitness goal "${title}" targeting ${targetWeight} kg by ${this.formatGoalDate(targetDate)} has been updated.`);
    this.renderCurrentView();
  },

  openLogProgressModal() {
    App.openModal('log-progress-modal');
  },

  handleLogProgressSubmit() {
    const weight = parseFloat(document.getElementById('m-log-weight').value) || 64.5;
    const bodyFat = parseFloat(document.getElementById('m-log-bodyfat').value) || 22.0;
    const notes = document.getElementById('m-log-notes').value || 'Quick weight log';

    FitTrackData.progressData.currentWeight = weight;
    FitTrackData.currentUser.weight = weight;
    FitTrackData.progressData.weightLogs.push({
      date: 'Today',
      weight,
      bodyFat,
      workouts: 4,
      notes
    });

    FitTrackData.progressData.recentHistory.unshift({
      date: 'Today',
      text: `Logged weight: ${weight} kg · ${notes}`,
      type: 'weight'
    });

    App.closeModal('log-progress-modal');
    App.showToast('success', 'Progress Logged! 📈', `Current weight updated to ${weight} kg. Analytics chart updated.`);
    this.renderCurrentView();
  },

  handleGlobalSearch(query) {
    if (!query || !query.trim()) return;
    const q = query.toLowerCase();
    if (q.includes('train') || q.includes('coach') || q.includes('arjun') || q.includes('rahul')) {
      this.navigate('trainers');
    } else if (q.includes('plan') || q.includes('price') || q.includes('sub')) {
      this.navigate('plans');
    } else if (q.includes('work') || q.includes('exer') || q.includes('diet') || q.includes('cal')) {
      this.navigate('activities');
    } else if (q.includes('sess') || q.includes('book') || q.includes('video')) {
      this.navigate('sessions');
    } else if (q.includes('prog') || q.includes('weight') || q.includes('chart')) {
      this.navigate('progress');
    } else if (q.includes('msg') || q.includes('chat') || q.includes('mess')) {
      this.navigate('messages');
    } else {
      App.showToast('info', 'Search Results', `Showing dashboard results for "${query}".`);
    }
  },

  renderAll() {
    this.initRole();
    this.renderCurrentView();
  }
};

