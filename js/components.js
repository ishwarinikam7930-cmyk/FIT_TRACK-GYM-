/* ============================================
   FitTrack – Reusable UI Component Builders
   ============================================ */

const Components = {

  /* ── Icon Helper ── */
  icon(name, className = '') {
    const svg = Icons[name] || '';
    if (className) {
      return svg.replace('<svg', `<svg class="${className}"`);
    }
    return svg;
  },

  /* ── Metric Card ── */
  metricCard({ label, value, detail, icon, colorClass, delay = 0 }) {
    return `
      <div class="metric-card animate-fade-in-up stagger-${delay}" role="group" aria-label="${label}">
        <div class="metric-card__icon metric-card__icon--${colorClass}">
          ${this.icon(icon)}
        </div>
        <div class="metric-card__content">
          <div class="metric-card__label">${label}</div>
          <div class="metric-card__value">${value}</div>
          ${detail ? `<div class="metric-card__detail">${detail}</div>` : ''}
        </div>
      </div>
    `;
  },

  /* ── Exercise Row ── */
  exerciseRow({ id, name, sets, reps, rest, completed, index }) {
    return `
      <div class="exercise-row ${completed ? 'completed' : ''}" data-exercise-id="${id}" role="listitem">
        <div class="exercise-row__number">${index}</div>
        <div class="exercise-row__checkbox ${completed ? 'checked' : ''}" 
             role="checkbox" 
             aria-checked="${completed}" 
             aria-label="Mark ${name} as complete"
             tabindex="0"
             data-exercise-id="${id}">
          ${completed ? this.icon('check') : ''}
        </div>
        <div class="exercise-row__info">
          <div class="exercise-row__name">${name}</div>
          <div class="exercise-row__details">
            <span class="exercise-row__detail-item">${sets} sets</span>
            <span class="exercise-row__detail-item">${reps} reps</span>
            <span class="exercise-row__detail-item">${rest} rest</span>
          </div>
        </div>
      </div>
    `;
  },

  /* ── Meal Card ── */
  mealCard({ type, emoji, time, items, trainerNote }) {
    const itemsHtml = items.map(item => `<div class="meal-card__item">${item}</div>`).join('');
    return `
      <div class="meal-card animate-fade-in-up" role="article" aria-label="${type}">
        <div class="meal-card__header">
          <span class="meal-card__emoji" aria-hidden="true">${emoji}</span>
          <div class="meal-card__title-group">
            <div class="meal-card__type">${type}</div>
            <div class="meal-card__time">${time}</div>
          </div>
        </div>
        <div class="meal-card__items">${itemsHtml}</div>
        ${trainerNote ? `
          <div class="meal-card__note">
            <span class="meal-card__note-icon" aria-hidden="true">${this.icon('lightbulb')}</span>
            <span>${trainerNote}</span>
          </div>
        ` : ''}
      </div>
    `;
  },

  /* ── Session Card ── */
  sessionCard({ id, trainerName, trainerInitials, date, day, time, type, status, topic }) {
    const isCompleted = status === 'completed' || status === 'Completed';
    const statusColor = isCompleted ? 'completed' : status === 'confirmed' ? 'confirmed' : 'upcoming';
    const statusBadge = isCompleted
      ? '<span class="badge badge--blue"><span class="badge__dot"></span> Completed</span>'
      : status === 'confirmed'
      ? '<span class="badge badge--emerald"><span class="badge__dot"></span> Confirmed</span>'
      : '<span class="badge badge--blue"><span class="badge__dot"></span> Upcoming</span>';

    return `
      <div class="session-card animate-fade-in" role="article" aria-label="Session with ${trainerName}">
        <div class="session-card__avatar-wrap">
          <div class="avatar avatar--lg avatar--placeholder">${trainerInitials}</div>
          <div class="session-card__status-dot session-card__status-dot--${statusColor}"></div>
        </div>
        <div class="session-card__info">
          <div class="session-card__trainer">${trainerName}</div>
          <div class="session-card__meta">
            <span class="session-card__meta-item">${this.icon('calendar')} ${day}, ${date}</span>
            <span class="session-card__meta-item">${this.icon('clock')} ${time}</span>
          </div>
          <div class="session-card__meta" style="margin-top: 4px;">
            <span class="session-card__meta-item">${this.icon('video')} ${type}</span>
            ${statusBadge}
          </div>
          <p style="font-size: var(--text-sm); color: var(--text-muted); margin-top: 8px;">${topic}</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;">
          ${!isCompleted ? `
            <button class="btn btn--primary btn--sm" id="view-session-${id}" onclick="Dashboard.launchVideoSession('${id}')" aria-label="Start 1-on-1 Video Session">
              ${this.icon('video')} Start Video Session
            </button>
          ` : ''}
          ${FitTrackData.getSessionRecording(id) ? `
            <button class="btn btn--secondary btn--sm" onclick="Dashboard.openSavedRecordingViewer('${id}')" style="display:inline-flex;align-items:center;gap:4px;color:#38BDF8;border-color:#38BDF8;font-size:11px;padding:3px 8px;">
              ${this.icon('video')} View Recording
            </button>
          ` : ''}
        </div>
      </div>
    `;
  },

  /* ── Notification Item ── */
  notificationItem({ id, type, text, time, read }) {
    const iconClassMap = {
      workout: 'notification-item__icon--workout',
      plan: 'notification-item__icon--plan',
      session: 'notification-item__icon--session',
      message: 'notification-item__icon--message',
    };
    const iconNameMap = {
      workout: 'workout',
      plan: 'target',
      session: 'calendar',
      message: 'messages',
    };

    return `
      <div class="notification-item ${read ? '' : 'unread'}" data-notification-id="${id}" role="article" aria-label="Notification">
        <div class="notification-item__icon ${iconClassMap[type] || ''}">
          ${this.icon(iconNameMap[type] || 'bell')}
        </div>
        <div class="notification-item__content">
          <div class="notification-item__text">${text}</div>
          <div class="notification-item__time">${time}</div>
        </div>
        ${read ? '' : '<div class="notification-item__dot" aria-label="Unread"></div>'}
      </div>
    `;
  },

  /* ── Weekly Calendar ── */
  weeklyCalendar(days) {
    const daysHtml = days.map(d => {
      const classes = ['weekly-calendar__day'];
      if (d.isToday) classes.push('today');
      if (d.hasSession) classes.push('has-session');
      return `
        <div class="${classes.join(' ')}" role="button" aria-label="${d.dayName} ${d.dayNumber}${d.isToday ? ' (Today)' : ''}${d.hasSession ? ' (Session scheduled)' : ''}">
          <span class="weekly-calendar__day-name">${d.dayName}</span>
          <span class="weekly-calendar__day-number">${d.dayNumber}</span>
        </div>
      `;
    }).join('');

    return `<div class="weekly-calendar" role="group" aria-label="Weekly schedule">${daysHtml}</div>`;
  },

  /* ── Progress History Item ── */
  progressHistoryItem({ date, text }) {
    return `
      <div class="progress-history__item">
        <div class="progress-history__dot"></div>
        <span class="progress-history__date">${date}</span>
        <span class="progress-history__text">${text}</span>
      </div>
    `;
  },

  /* ── Toast ── */
  toast({ type = 'success', title, message }) {
    const iconMap = {
      success: 'checkCircle',
      error: 'x',
      info: 'info',
      warning: 'info',
    };

    return `
      <div class="toast toast--${type}" role="alert" aria-live="polite">
        <div class="toast__icon">${this.icon(iconMap[type] || 'info')}</div>
        <div class="toast__content">
          <div class="toast__title">${title}</div>
          ${message ? `<div class="toast__message">${message}</div>` : ''}
        </div>
        <div class="toast__close" role="button" aria-label="Dismiss notification" tabindex="0">${this.icon('x')}</div>
      </div>
    `;
  },

  /* ── Modal ── */
  modal({ id, title, body, primaryBtn, secondaryBtn }) {
    return `
      <div class="modal-overlay" id="${id}-overlay" role="dialog" aria-modal="true" aria-labelledby="${id}-title">
        <div class="modal">
          <div class="modal__header">
            <h3 class="modal__title" id="${id}-title">${title}</h3>
            <button class="modal__close" aria-label="Close dialog" data-modal-close="${id}">
              ${this.icon('x')}
            </button>
          </div>
          <div class="modal__body">${body}</div>
          <div class="modal__footer">
            ${secondaryBtn ? `<button class="btn btn--secondary" data-modal-close="${id}">${secondaryBtn}</button>` : ''}
            ${primaryBtn ? `<button class="btn btn--primary" id="${id}-confirm">${primaryBtn}</button>` : ''}
          </div>
        </div>
      </div>
    `;
  },

  /* ── Empty State ── */
  emptyState({ icon, title, text }) {
    return `
      <div class="empty-state">
        <div class="empty-state__icon">${this.icon(icon || 'info')}</div>
        <div class="empty-state__title">${title}</div>
        <p class="empty-state__text">${text}</p>
      </div>
    `;
  },

  /* ── Loading Skeleton ── */
  skeleton(type = 'card') {
    if (type === 'card') {
      return `
        <div class="card" style="padding: var(--space-5);">
          <div class="skeleton skeleton--title"></div>
          <div class="skeleton skeleton--text"></div>
          <div class="skeleton skeleton--text-sm"></div>
        </div>
      `;
    }
    if (type === 'metric') {
      return `<div class="skeleton skeleton--card" style="height: 100px;"></div>`;
    }
    return `<div class="skeleton skeleton--text"></div>`;
  },
};
