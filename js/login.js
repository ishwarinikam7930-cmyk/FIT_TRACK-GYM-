/* ============================================
   FitTrack – Login & Registration Page Logic (UC-02)
   Handles authentication, direct self-service registration,
   role-based redirection, input validation, and demo autofill.
   ============================================ */

const LoginApp = (() => {

  /* ── SVG Icons (self-contained for login page) ── */
  const LoginIcons = {
    logo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    eyeOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
    arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
    alertCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    checkCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
    user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    trainer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5h11"/><path d="M6.5 17.5h11"/><path d="M12 2v4"/><path d="M12 18v4"/><rect x="4" y="6" width="4" height="12" rx="1"/><rect x="16" y="6" width="4" height="12" rx="1"/></svg>`,
    shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    target: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
    sparkles: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`
  };

  /* ── Demo Credentials Database ── */
  const demoCredentials = {
    user: {
      email: 'ishwari.nikam@email.com',
      password: 'User@123',
      name: 'Ishwari Nikam',
      role: 'user',
      redirect: 'user-dashboard.html',
    },
    trainer: {
      email: 'arjun.mehta@fittrack.com',
      password: 'Trainer@123',
      name: 'Coach Arjun Mehta',
      role: 'trainer',
      redirect: 'trainer-dashboard.html',
    },
  };

  /* ── State ── */
  let currentAuthMode = 'login'; // 'login' | 'register'
  let currentRole = 'user'; // 'user' | 'trainer'
  let passwordVisible = false;
  let regPasswordVisible = false;

  /* ── Render Page ── */
  function render() {
    document.body.innerHTML = `
      <div class="login-page" id="login-page">

        <!-- Animated Background -->
        <div class="login-bg-decoration">
          <div class="orb"></div>
          <div class="orb"></div>
          <div class="orb"></div>
          <div class="orb"></div>
        </div>

        <div class="login-container">

          <!-- Brand Header -->
          <div class="login-brand">
            <div class="login-logo" id="login-logo">
              ${LoginIcons.logo}
            </div>
            <h1 class="login-brand-name">Fit<span>Track</span></h1>
            <p class="login-brand-tagline">Your personal fitness journey starts here</p>
          </div>

          <!-- Card -->
          <div class="login-card">
            <div class="login-card-inner">

              <!-- Auth Mode Switcher (Sign In vs Register) -->
              <div class="login-mode-tabs" id="login-mode-tabs" role="tablist" aria-label="Sign In or Register">
                <button class="login-mode-tab active" data-mode="login" role="tab" aria-selected="true" id="tab-mode-login">
                  <span>Sign In</span>
                </button>
                <button class="login-mode-tab" data-mode="register" role="tab" aria-selected="false" id="tab-mode-register">
                  <span>Create Account</span>
                </button>
              </div>

              <!-- Role Tabs -->
              <div class="login-role-tabs" id="login-role-tabs" role="tablist" aria-label="Account role selection">
                <button class="login-role-tab active" data-role="user" role="tab" aria-selected="true" id="tab-user">
                  <span class="tab-icon">${LoginIcons.user}</span>
                  <span class="tab-label">Member</span>
                </button>
                <button class="login-role-tab" data-role="trainer" role="tab" aria-selected="false" id="tab-trainer">
                  <span class="tab-icon">${LoginIcons.trainer}</span>
                  <span class="tab-label">Coach / Trainer</span>
                </button>
              </div>

              <!-- Card Header -->
              <h2 class="login-card-title" id="login-card-title">Welcome back</h2>
              <p class="login-card-subtitle" id="login-card-subtitle">Sign in to your member account to continue</p>

              <!-- Error / Success Messages -->
              <div class="login-error" id="login-error" role="alert">
                ${LoginIcons.alertCircle}
                <span id="login-error-text"></span>
              </div>
              <div class="login-success" id="login-success" role="status">
                ${LoginIcons.checkCircle}
                <span id="login-success-text"></span>
              </div>

              <!-- 1. SIGN IN FORM -->
              <form class="login-form" id="login-form" novalidate autocomplete="on" style="display: flex;">

                <!-- Email Field -->
                <div class="login-field" id="field-email">
                  <label for="login-email">Email Address <span class="required">*</span></label>
                  <div class="login-input-wrapper">
                    <span class="login-input-icon">${LoginIcons.mail}</span>
                    <input
                      type="email"
                      id="login-email"
                      class="login-input"
                      placeholder="Enter your email"
                      required
                      autocomplete="email"
                      aria-describedby="email-error"
                    />
                  </div>
                  <span class="field-error" id="email-error">Please enter a valid email address</span>
                </div>

                <!-- Password Field -->
                <div class="login-field" id="field-password">
                  <label for="login-password">Password <span class="required">*</span></label>
                  <div class="login-input-wrapper">
                    <span class="login-input-icon">${LoginIcons.lock}</span>
                    <input
                      type="password"
                      id="login-password"
                      class="login-input"
                      placeholder="Enter your password"
                      required
                      autocomplete="current-password"
                      aria-describedby="password-error"
                    />
                    <button type="button" class="login-password-toggle" id="login-password-toggle" aria-label="Toggle password visibility">
                      ${LoginIcons.eye}
                    </button>
                  </div>
                  <span class="field-error" id="password-error">Password is required</span>
                </div>

                <!-- Remember Me & Forgot Password -->
                <div class="login-extras">
                  <label class="login-remember">
                    <input type="checkbox" id="login-remember" />
                    <span>Remember me</span>
                  </label>
                  <a href="#" class="login-forgot" id="login-forgot">Forgot password?</a>
                </div>

                <!-- Submit Button -->
                <button type="submit" class="login-submit-btn" id="login-submit-btn">
                  <span class="btn-text">Sign In</span>
                  ${LoginIcons.arrowRight}
                  <span class="login-spinner"></span>
                </button>

                <!-- Switch Link -->
                <div class="login-switch-prompt">
                  Don't have an account?
                  <button type="button" class="login-switch-link" id="link-to-register">Register now</button>
                </div>

              </form>

              <!-- 2. REGISTRATION FORM -->
              <form class="login-form" id="register-form" novalidate autocomplete="on" style="display: none;">

                <!-- Full Name Field -->
                <div class="login-field" id="field-reg-name">
                  <label for="reg-name">Full Name <span class="required">*</span></label>
                  <div class="login-input-wrapper">
                    <span class="login-input-icon">${LoginIcons.user}</span>
                    <input
                      type="text"
                      id="reg-name"
                      class="login-input"
                      placeholder="e.g. Ishwari Nikam"
                      required
                      autocomplete="name"
                      aria-describedby="reg-name-error"
                    />
                  </div>
                  <span class="field-error" id="reg-name-error">Full name is required</span>
                </div>

                <!-- Email Field -->
                <div class="login-field" id="field-reg-email">
                  <label for="reg-email">Email Address <span class="required">*</span></label>
                  <div class="login-input-wrapper">
                    <span class="login-input-icon">${LoginIcons.mail}</span>
                    <input
                      type="email"
                      id="reg-email"
                      class="login-input"
                      placeholder="e.g. ishwari@example.com"
                      required
                      autocomplete="email"
                      aria-describedby="reg-email-error"
                    />
                  </div>
                  <span class="field-error" id="reg-email-error">Please enter a valid email address</span>
                </div>

                <!-- Password & Confirm Password Grid -->
                <div class="login-form-grid">
                  <div class="login-field" id="field-reg-password">
                    <label for="reg-password">Password <span class="required">*</span></label>
                    <div class="login-input-wrapper">
                      <span class="login-input-icon">${LoginIcons.lock}</span>
                      <input
                        type="password"
                        id="reg-password"
                        class="login-input"
                        placeholder="At least 6 chars"
                        required
                        autocomplete="new-password"
                        aria-describedby="reg-password-error"
                      />
                      <button type="button" class="login-password-toggle" id="reg-password-toggle" aria-label="Toggle password visibility">
                        ${LoginIcons.eye}
                      </button>
                    </div>
                    <span class="field-error" id="reg-password-error">Min 6 characters</span>
                  </div>

                  <div class="login-field" id="field-reg-confirm-password">
                    <label for="reg-confirm-password">Confirm Password <span class="required">*</span></label>
                    <div class="login-input-wrapper">
                      <span class="login-input-icon">${LoginIcons.lock}</span>
                      <input
                        type="password"
                        id="reg-confirm-password"
                        class="login-input"
                        placeholder="Re-enter password"
                        required
                        autocomplete="new-password"
                        aria-describedby="reg-confirm-error"
                      />
                    </div>
                    <span class="field-error" id="reg-confirm-error">Passwords must match</span>
                  </div>
                </div>

                <!-- Role Specific Customized Field -->
                <div class="login-field" id="field-reg-role-extra">
                  <label for="reg-role-extra" id="label-reg-role-extra">Primary Fitness Goal <span class="required">*</span></label>
                  <div class="login-input-wrapper">
                    <span class="login-input-icon" id="icon-reg-role-extra">${LoginIcons.target}</span>
                    <select id="reg-role-extra" class="login-select" required>
                      <option value="Fat Loss & Muscle Toning">Fat Loss & Muscle Toning</option>
                      <option value="Strength & Muscle Hypertrophy">Strength & Muscle Hypertrophy</option>
                      <option value="Posture, Mobility & Core Reset">Posture, Mobility & Core Reset</option>
                      <option value="Athletic Conditioning & Endurance">Athletic Conditioning & Endurance</option>
                      <option value="General Health & Longevity">General Health & Longevity</option>
                    </select>
                  </div>
                </div>

                <!-- Terms Checkbox -->
                <div class="login-extras">
                  <label class="login-remember" id="field-reg-terms">
                    <input type="checkbox" id="reg-terms" checked />
                    <span>I agree to FitTrack's <a href="#" onclick="event.preventDefault(); App?.showToast ? App.showToast('info', 'Terms', 'Demo terms accepted.') : alert('Terms of Service accepted.');" style="color:var(--color-primary);text-decoration:underline;">Terms & Privacy</a></span>
                  </label>
                </div>

                <!-- Submit Button -->
                <button type="submit" class="login-submit-btn" id="reg-submit-btn">
                  <span class="btn-text" id="reg-btn-text">Create Member Account</span>
                  ${LoginIcons.sparkles}
                  <span class="login-spinner"></span>
                </button>

                <!-- Switch Link -->
                <div class="login-switch-prompt">
                  Already have an account?
                  <button type="button" class="login-switch-link" id="link-to-login">Sign in here</button>
                </div>

              </form>

              <!-- Quick Demo Login Section (Visible on Sign In) -->
              <div class="login-demo-section" id="login-demo-section">
                <div class="login-divider">
                  <span>Quick Demo Login</span>
                </div>

                <div class="login-demo-cards" id="login-demo-cards">
                  <div class="login-demo-card" data-role="user" id="demo-user" tabindex="0" role="button" aria-label="Login as demo user Ishwari Nikam">
                    <div class="login-demo-card-avatar role-user">IN</div>
                    <div class="login-demo-card-info">
                      <div class="login-demo-card-role">Member — Ishwari Nikam</div>
                      <div class="login-demo-card-email">ishwari.nikam@email.com</div>
                    </div>
                    <div class="login-demo-card-arrow">${LoginIcons.chevronRight}</div>
                  </div>
                  <div class="login-demo-card" data-role="trainer" id="demo-trainer" tabindex="0" role="button" aria-label="Login as demo trainer Coach Arjun">
                    <div class="login-demo-card-avatar role-trainer">AM</div>
                    <div class="login-demo-card-info">
                      <div class="login-demo-card-role">Trainer — Coach Arjun Mehta</div>
                      <div class="login-demo-card-email">arjun.mehta@fittrack.com</div>
                    </div>
                    <div class="login-demo-card-arrow">${LoginIcons.chevronRight}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Footer -->
          <div class="login-footer">
            <p>&copy; 2026 FitTrack. All rights reserved.</p>
          </div>

        </div>
      </div>
    `;

    bindEvents();
  }

  /* ── Bind Events ── */
  function bindEvents() {
    // Mode tabs (Sign In vs Register)
    const modeTabs = document.querySelectorAll('.login-mode-tab');
    modeTabs.forEach(tab => {
      tab.addEventListener('click', () => switchAuthMode(tab.dataset.mode));
    });

    // Role tabs (Member vs Coach)
    const roleTabs = document.querySelectorAll('.login-role-tab');
    roleTabs.forEach(tab => {
      tab.addEventListener('click', () => switchRole(tab.dataset.role));
    });

    // Switch links
    const linkToRegister = document.getElementById('link-to-register');
    if (linkToRegister) linkToRegister.addEventListener('click', () => switchAuthMode('register'));

    const linkToLogin = document.getElementById('link-to-login');
    if (linkToLogin) linkToLogin.addEventListener('click', () => switchAuthMode('login'));

    // Form submissions
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);

    const regForm = document.getElementById('register-form');
    if (regForm) regForm.addEventListener('submit', handleRegisterSubmit);

    // Password toggles
    const toggle = document.getElementById('login-password-toggle');
    if (toggle) toggle.addEventListener('click', () => togglePassword('login'));

    const regToggle = document.getElementById('reg-password-toggle');
    if (regToggle) regToggle.addEventListener('click', () => togglePassword('register'));

    // Demo cards
    const demoCards = document.querySelectorAll('.login-demo-card');
    demoCards.forEach(card => {
      card.addEventListener('click', () => fillDemoCredentials(card.dataset.role));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          fillDemoCredentials(card.dataset.role);
        }
      });
    });

    // Clear field errors on input
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    if (emailInput) emailInput.addEventListener('input', () => clearFieldError('email'));
    if (passwordInput) passwordInput.addEventListener('input', () => clearFieldError('password'));

    const regName = document.getElementById('reg-name');
    const regEmail = document.getElementById('reg-email');
    const regPassword = document.getElementById('reg-password');
    const regConfirm = document.getElementById('reg-confirm-password');

    if (regName) regName.addEventListener('input', () => clearFieldError('reg-name'));
    if (regEmail) regEmail.addEventListener('input', () => clearFieldError('reg-email'));
    if (regPassword) regPassword.addEventListener('input', () => clearFieldError('reg-password'));
    if (regConfirm) regConfirm.addEventListener('input', () => clearFieldError('reg-confirm-password'));

    // Forgot password
    const forgotLink = document.getElementById('login-forgot');
    if (forgotLink) {
      forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        showMessage('error', 'Use demo credentials or register a new instant self-service account.');
      });
    }
  }

  /* ── Switch Auth Mode (Sign In vs Register) ── */
  function switchAuthMode(mode) {
    currentAuthMode = mode;

    // Update Mode Tabs
    document.querySelectorAll('.login-mode-tab').forEach(tab => {
      const isActive = tab.dataset.mode === mode;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive);
    });

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const demoSection = document.getElementById('login-demo-section');

    if (mode === 'register') {
      loginForm.style.display = 'none';
      registerForm.style.display = 'flex';
      demoSection.style.display = 'none';
    } else {
      loginForm.style.display = 'flex';
      registerForm.style.display = 'none';
      demoSection.style.display = 'block';
    }

    updateTitles();
    hideMessages();
    clearAllFieldErrors();
  }

  /* ── Switch Role Tab ── */
  function switchRole(role) {
    currentRole = role;

    // Update Role Tabs
    document.querySelectorAll('.login-role-tab').forEach(tab => {
      const isActive = tab.dataset.role === role;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive);
    });

    // Update role extra options in registration form
    const labelExtra = document.getElementById('label-reg-role-extra');
    const iconExtra = document.getElementById('icon-reg-role-extra');
    const selectExtra = document.getElementById('reg-role-extra');
    const regBtnText = document.getElementById('reg-btn-text');

    if (role === 'trainer') {
      if (labelExtra) labelExtra.innerHTML = `Primary Coaching Specialization <span class="required">*</span>`;
      if (iconExtra) iconExtra.innerHTML = LoginIcons.shield;
      if (selectExtra) {
        selectExtra.innerHTML = `
          <option value="Strength & Conditioning">Strength & Conditioning</option>
          <option value="HIIT & Athletic Fat Loss">HIIT & Athletic Fat Loss</option>
          <option value="Yoga, Posture & Mobility">Yoga, Posture & Mobility</option>
          <option value="Sports Nutrition & Body Recomposition">Sports Nutrition & Body Recomposition</option>
          <option value="Functional Rehabilitation">Functional Rehabilitation</option>
        `;
      }
      if (regBtnText) regBtnText.textContent = 'Register as Certified Coach';
    } else {
      if (labelExtra) labelExtra.innerHTML = `Primary Fitness Goal <span class="required">*</span>`;
      if (iconExtra) iconExtra.innerHTML = LoginIcons.target;
      if (selectExtra) {
        selectExtra.innerHTML = `
          <option value="Fat Loss & Muscle Toning">Fat Loss & Muscle Toning</option>
          <option value="Strength & Muscle Hypertrophy">Strength & Muscle Hypertrophy</option>
          <option value="Posture, Mobility & Core Reset">Posture, Mobility & Core Reset</option>
          <option value="Athletic Conditioning & Endurance">Athletic Conditioning & Endurance</option>
          <option value="General Health & Longevity">General Health & Longevity</option>
        `;
      }
      if (regBtnText) regBtnText.textContent = 'Create Member Account';
    }

    updateTitles();
    hideMessages();
    clearAllFieldErrors();
  }

  /* ── Update Header Titles ── */
  function updateTitles() {
    const titles = {
      login: {
        user: { title: 'Welcome back', subtitle: 'Sign in to your member account to continue' },
        trainer: { title: 'Coach Portal', subtitle: 'Access your professional coaching dashboard' },
      },
      register: {
        user: { title: 'Join FitTrack', subtitle: 'Create your self-service member account in seconds' },
        trainer: { title: 'Coach Registration', subtitle: 'Create your professional trainer profile and start coaching' }
      }
    };

    const cardTitle = document.getElementById('login-card-title');
    const cardSubtitle = document.getElementById('login-card-subtitle');

    if (cardTitle && cardSubtitle) {
      cardTitle.style.opacity = '0';
      cardSubtitle.style.opacity = '0';
      cardTitle.style.transform = 'translateY(-4px)';

      setTimeout(() => {
        const config = titles[currentAuthMode][currentRole];
        cardTitle.textContent = config.title;
        cardSubtitle.textContent = config.subtitle;
        cardTitle.style.opacity = '1';
        cardSubtitle.style.opacity = '1';
        cardTitle.style.transform = 'translateY(0)';
      }, 120);

      cardTitle.style.transition = 'all 0.2s ease';
      cardSubtitle.style.transition = 'all 0.2s ease';
    }
  }

  /* ── Toggle Password Visibility ── */
  function togglePassword(formType) {
    if (formType === 'register') {
      regPasswordVisible = !regPasswordVisible;
      const input = document.getElementById('reg-password');
      const toggle = document.getElementById('reg-password-toggle');
      if (input) input.type = regPasswordVisible ? 'text' : 'password';
      if (toggle) toggle.innerHTML = regPasswordVisible ? LoginIcons.eyeOff : LoginIcons.eye;
    } else {
      passwordVisible = !passwordVisible;
      const input = document.getElementById('login-password');
      const toggle = document.getElementById('login-password-toggle');
      if (input) input.type = passwordVisible ? 'text' : 'password';
      if (toggle) toggle.innerHTML = passwordVisible ? LoginIcons.eyeOff : LoginIcons.eye;
    }
  }

  /* ── Fill Demo Credentials ── */
  function fillDemoCredentials(role) {
    const cred = demoCredentials[role];
    if (!cred) return;

    if (currentAuthMode !== 'login') {
      switchAuthMode('login');
    }

    switchRole(role);

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');

    emailInput.value = '';
    passwordInput.value = '';

    typeInto(emailInput, cred.email, 0, () => {
      typeInto(passwordInput, cred.password, 0, () => {
        showMessage('success', `Demo credentials loaded for ${cred.name}. Logging in...`);
        setTimeout(() => {
          handleLogin(cred.email, cred.password);
        }, 800);
      });
    });
  }

  /* ── Typing Animation ── */
  function typeInto(input, text, index, callback) {
    if (index < text.length) {
      input.value += text[index];
      input.dispatchEvent(new Event('input'));
      setTimeout(() => typeInto(input, text, index + 1, callback), 20);
    } else {
      if (callback) callback();
    }
  }

  /* ── Sign In Submission ── */
  function handleLoginSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    let valid = true;

    if (!email || !isValidEmail(email)) {
      showFieldError('email', !email ? 'Email address is required' : 'Please enter a valid email address');
      valid = false;
    }

    if (!password) {
      showFieldError('password', 'Password is required');
      valid = false;
    } else if (password.length < 6) {
      showFieldError('password', 'Password must be at least 6 characters');
      valid = false;
    }

    if (!valid) {
      showMessage('error', 'Please correct the highlighted fields.');
      return;
    }

    hideMessages();
    handleLogin(email, password);
  }

  /* ── Registration Submission ── */
  function handleRegisterSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    const roleExtra = document.getElementById('reg-role-extra').value;
    const terms = document.getElementById('reg-terms').checked;

    let valid = true;

    if (!name) {
      showFieldError('reg-name', 'Full name is required');
      valid = false;
    }

    if (!email || !isValidEmail(email)) {
      showFieldError('reg-email', !email ? 'Email address is required' : 'Please enter a valid email address');
      valid = false;
    }

    if (!password || password.length < 6) {
      showFieldError('reg-password', 'Password must be at least 6 characters');
      valid = false;
    }

    if (password !== confirmPassword) {
      showFieldError('reg-confirm-password', 'Passwords do not match');
      valid = false;
    }

    if (!terms) {
      showMessage('error', 'Please accept the Terms & Conditions to register.');
      return;
    }

    if (!valid) {
      showMessage('error', 'Please correct the highlighted fields and try again.');
      return;
    }

    const btn = document.getElementById('reg-submit-btn');
    btn.classList.add('loading');

    // Instant registration and activation
    setTimeout(() => {
      btn.classList.remove('loading');

      const isTrainer = currentRole === 'trainer';
      const redirectPage = isTrainer ? 'trainer-dashboard.html' : 'user-dashboard.html';

      // Save user session
      try {
        sessionStorage.setItem('fittrack_user', JSON.stringify({
          name: name,
          email: email,
          role: currentRole,
          roleExtra: roleExtra,
          loggedIn: true,
          registeredAt: new Date().toISOString()
        }));
      } catch (err) {
        // continue
      }

      showMessage('success', `🎉 Account created! Welcome, ${name}! Launching your ${isTrainer ? 'Coach' : 'Member'} portal...`);

      setTimeout(() => {
        window.location.href = redirectPage;
      }, 1200);

    }, 1000);
  }

  /* ── Login Logic ── */
  function handleLogin(email, password) {
    const btn = document.getElementById('login-submit-btn');
    btn.classList.add('loading');

    setTimeout(() => {
      btn.classList.remove('loading');

      const cred = demoCredentials[currentRole];

      // Support demo credentials or any validly formatted credentials
      const isDemo = email.toLowerCase() === cred.email.toLowerCase() && password === cred.password;
      const isValidRegistered = isValidEmail(email) && password.length >= 6;

      if (isDemo || isValidRegistered) {
        const userName = isDemo ? cred.name : (email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()));
        
        showMessage('success', `Welcome, ${userName}! Redirecting to your dashboard...`);

        try {
          sessionStorage.setItem('fittrack_user', JSON.stringify({
            name: userName,
            email: email,
            role: currentRole,
            loggedIn: true,
            loginTime: new Date().toISOString(),
          }));
        } catch (e) {
          // ignore
        }

        setTimeout(() => {
          window.location.href = cred.redirect;
        }, 1200);
      } else {
        showMessage('error', 'Invalid email or password. Please check your credentials or click Quick Demo Login below.');

        const card = document.querySelector('.login-card');
        if (card) {
          card.style.animation = 'none';
          card.offsetHeight;
          card.style.animation = 'cardShake 0.5s ease';
          setTimeout(() => { card.style.animation = ''; }, 500);
        }
      }
    }, 1000);
  }

  /* ── Validation Helpers ── */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showFieldError(field, message) {
    const fieldEl = document.getElementById(`field-${field}`);
    const errorEl = document.getElementById(`${field}-error`) || (fieldEl ? fieldEl.querySelector('.field-error') : null);
    if (fieldEl) fieldEl.classList.add('error');
    if (errorEl) errorEl.textContent = message;
  }

  function clearFieldError(field) {
    const fieldEl = document.getElementById(`field-${field}`);
    if (fieldEl) fieldEl.classList.remove('error');
  }

  function clearAllFieldErrors() {
    document.querySelectorAll('.login-field').forEach(f => f.classList.remove('error'));
  }

  function showMessage(type, message) {
    hideMessages();
    const el = document.getElementById(`login-${type}`);
    const textEl = document.getElementById(`login-${type}-text`);
    if (textEl) textEl.textContent = message;
    if (el) el.classList.add('visible');
  }

  function hideMessages() {
    const err = document.getElementById('login-error');
    const succ = document.getElementById('login-success');
    if (err) err.classList.remove('visible');
    if (succ) succ.classList.remove('visible');
  }

  /* ── Add shake animation to head ── */
  function injectShakeAnimation() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes cardShake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
      }
    `;
    document.head.appendChild(style);
  }

  /* ── Initialize ── */
  function init() {
    injectShakeAnimation();
    render();
  }

  return { init };

})();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', LoginApp.init);
