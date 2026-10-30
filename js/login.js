/* ============================================
   FitTrack – Login, Registration & OTP Page Logic
   Handles: Sign In, Sign Up with OTP verification,
            Forgot Password, Reset Password.
   ============================================ */

const LoginApp = (() => {

  /* ── SVG Icons ── */
  const Icons = {
    logo:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    mail:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    lock:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    phone:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8 8.91a16 16 0 0 0 6.09 6.09l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    user:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    trainer:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5h11"/><path d="M6.5 17.5h11"/><path d="M12 2v4"/><path d="M12 18v4"/><rect x="4" y="6" width="4" height="12" rx="1"/><rect x="16" y="6" width="4" height="12" rx="1"/></svg>`,
    eye:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    eyeOff:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
    arrowRight:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
    arrowLeft:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
    alertCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    checkCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    chevronRight:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
    shield:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    target:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
    sparkles:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
    key:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
    refresh:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
  };

  /* ── Demo Credentials ── */
  const demoCredentials = {
    user:    { email: 'ishwari.nikam@email.com',  password: 'User@123',    name: 'Ishwari Nikam',    role: 'user',    redirect: 'user-dashboard.html' },
    trainer: { email: 'arjun.mehta@fittrack.com', password: 'Trainer@123', name: 'Coach Arjun Mehta', role: 'trainer', redirect: 'trainer-dashboard.html' },
  };

  /* ── State ── */
  let currentMode = 'login';    // 'login' | 'register' | 'otp' | 'forgot' | 'reset'
  let currentRole = 'user';
  let pendingEmail = '';         // Email waiting for OTP verification
  let otpCooldownTimer = null;
  let otpCountdownEl   = null;
  let passwordVisible  = { login: false, reg: false, reg2: false, reset: false, reset2: false };

  /* ═══════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════ */
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
            <div class="login-logo" id="login-logo">${Icons.logo}</div>
            <h1 class="login-brand-name">Fit<span>Track</span></h1>
            <p class="login-brand-tagline">Your personal fitness journey starts here</p>
          </div>

          <!-- Card -->
          <div class="login-card" id="login-card">
            <div class="login-card-inner">

              <!-- Auth Mode Tabs (only shown on login/register) -->
              <div class="login-mode-tabs" id="login-mode-tabs" role="tablist">
                <button class="login-mode-tab active" data-mode="login" role="tab" id="tab-mode-login">Sign In</button>
                <button class="login-mode-tab" data-mode="register" role="tab" id="tab-mode-register">Create Account</button>
              </div>

              <!-- Role Tabs -->
              <div class="login-role-tabs" id="login-role-tabs" role="tablist">
                <button class="login-role-tab active" data-role="user" role="tab" id="tab-user">
                  <span class="tab-icon">${Icons.user}</span>
                  <span class="tab-label">Member</span>
                </button>
                <button class="login-role-tab" data-role="trainer" role="tab" id="tab-trainer">
                  <span class="tab-icon">${Icons.trainer}</span>
                  <span class="tab-label">Coach / Trainer</span>
                </button>
              </div>

              <!-- Card Title -->
              <h2 class="login-card-title" id="login-card-title">Welcome back</h2>
              <p class="login-card-subtitle" id="login-card-subtitle">Sign in to your member account to continue</p>

              <!-- Alert Banners -->
              <div class="login-alert login-alert--error" id="login-error" role="alert">
                ${Icons.alertCircle}
                <span id="login-error-text"></span>
              </div>
              <div class="login-alert login-alert--success" id="login-success" role="status">
                ${Icons.checkCircle}
                <span id="login-success-text"></span>
              </div>

              <!-- ── 1. SIGN IN FORM ── -->
              <form class="login-form" id="login-form" novalidate autocomplete="on">
                <div class="login-field" id="field-email">
                  <label for="login-email">Email Address <span class="required">*</span></label>
                  <div class="login-input-wrapper">
                    <span class="login-input-icon">${Icons.mail}</span>
                    <input type="email" id="login-email" class="login-input" placeholder="Enter your email" required autocomplete="email"/>
                  </div>
                  <span class="field-error" id="email-error">Please enter a valid email address</span>
                </div>

                <div class="login-field" id="field-password">
                  <label for="login-password">Password <span class="required">*</span></label>
                  <div class="login-input-wrapper">
                    <span class="login-input-icon">${Icons.lock}</span>
                    <input type="password" id="login-password" class="login-input" placeholder="Enter your password" required autocomplete="current-password"/>
                    <button type="button" class="login-password-toggle" id="login-password-toggle" aria-label="Toggle password visibility">${Icons.eye}</button>
                  </div>
                  <span class="field-error" id="password-error">Password is required</span>
                </div>

                <div class="login-extras">
                  <label class="login-remember">
                    <input type="checkbox" id="login-remember"/>
                    <span>Remember me</span>
                  </label>
                  <a href="#" class="login-forgot" id="login-forgot">Forgot password?</a>
                </div>

                <button type="submit" class="login-submit-btn" id="login-submit-btn">
                  <span class="btn-text">Sign In</span>
                  ${Icons.arrowRight}
                  <span class="login-spinner"></span>
                </button>

                <div class="login-switch-prompt">
                  Don't have an account?
                  <button type="button" class="login-switch-link" id="link-to-register">Register now</button>
                </div>
              </form>

              <!-- ── 2. REGISTRATION FORM ── -->
              <form class="login-form" id="register-form" novalidate autocomplete="on" style="display:none;">

                <div class="login-field" id="field-reg-name">
                  <label for="reg-name">Full Name <span class="required">*</span></label>
                  <div class="login-input-wrapper">
                    <span class="login-input-icon">${Icons.user}</span>
                    <input type="text" id="reg-name" class="login-input" placeholder="e.g. Ishwari Nikam" required autocomplete="name"/>
                  </div>
                  <span class="field-error" id="reg-name-error">Full name is required (letters, spaces, hyphens only)</span>
                </div>

                <div class="login-field" id="field-reg-email">
                  <label for="reg-email">Email Address <span class="required">*</span></label>
                  <div class="login-input-wrapper">
                    <span class="login-input-icon">${Icons.mail}</span>
                    <input type="email" id="reg-email" class="login-input" placeholder="e.g. ishwari@example.com" required autocomplete="email"/>
                  </div>
                  <span class="field-error" id="reg-email-error">Please enter a valid email address</span>
                </div>

                <div class="login-field" id="field-reg-phone">
                  <label for="reg-phone">Mobile Number <span class="required">*</span></label>
                  <div class="login-input-wrapper">
                    <span class="login-input-icon">${Icons.phone}</span>
                    <input type="tel" id="reg-phone" class="login-input" placeholder="+91 98765 43210" required autocomplete="tel"/>
                  </div>
                  <span class="field-error" id="reg-phone-error">Enter a valid mobile number (7–15 digits)</span>
                </div>

                <!-- Password Strength Meter -->
                <div class="login-field" id="field-reg-password">
                  <label for="reg-password">Password <span class="required">*</span></label>
                  <div class="login-input-wrapper">
                    <span class="login-input-icon">${Icons.lock}</span>
                    <input type="password" id="reg-password" class="login-input" placeholder="Min 8 chars, A-Z, a-z, 0-9" required autocomplete="new-password"/>
                    <button type="button" class="login-password-toggle" id="reg-password-toggle" aria-label="Toggle password visibility">${Icons.eye}</button>
                  </div>
                  <div class="password-strength" id="password-strength">
                    <div class="strength-bars">
                      <div class="strength-bar" id="bar-1"></div>
                      <div class="strength-bar" id="bar-2"></div>
                      <div class="strength-bar" id="bar-3"></div>
                      <div class="strength-bar" id="bar-4"></div>
                    </div>
                    <span class="strength-label" id="strength-label">Enter a password</span>
                  </div>
                  <span class="field-error" id="reg-password-error">Min 8 chars with uppercase, lowercase, and number</span>
                </div>

                <div class="login-field" id="field-reg-confirm-password">
                  <label for="reg-confirm-password">Confirm Password <span class="required">*</span></label>
                  <div class="login-input-wrapper">
                    <span class="login-input-icon">${Icons.lock}</span>
                    <input type="password" id="reg-confirm-password" class="login-input" placeholder="Re-enter your password" required autocomplete="new-password"/>
                    <button type="button" class="login-password-toggle" id="reg-confirm-toggle" aria-label="Toggle confirm password visibility">${Icons.eye}</button>
                  </div>
                  <span class="field-error" id="reg-confirm-error">Passwords must match</span>
                </div>

                <div class="login-field" id="field-reg-role-extra">
                  <label for="reg-role-extra" id="label-reg-role-extra">Primary Fitness Goal <span class="required">*</span></label>
                  <div class="login-input-wrapper">
                    <span class="login-input-icon" id="icon-reg-role-extra">${Icons.target}</span>
                    <select id="reg-role-extra" class="login-select" required>
                      <option value="Fat Loss &amp; Muscle Toning">Fat Loss &amp; Muscle Toning</option>
                      <option value="Strength &amp; Muscle Hypertrophy">Strength &amp; Muscle Hypertrophy</option>
                      <option value="Posture, Mobility &amp; Core Reset">Posture, Mobility &amp; Core Reset</option>
                      <option value="Athletic Conditioning &amp; Endurance">Athletic Conditioning &amp; Endurance</option>
                      <option value="General Health &amp; Longevity">General Health &amp; Longevity</option>
                    </select>
                  </div>
                </div>

                <div class="login-extras">
                  <label class="login-remember" id="field-reg-terms">
                    <input type="checkbox" id="reg-terms" checked/>
                    <span>I agree to FitTrack's <a href="#" onclick="return false;" style="color:var(--color-primary);text-decoration:underline;">Terms &amp; Privacy</a></span>
                  </label>
                </div>

                <button type="submit" class="login-submit-btn" id="reg-submit-btn">
                  <span class="btn-text" id="reg-btn-text">Create Member Account</span>
                  ${Icons.sparkles}
                  <span class="login-spinner"></span>
                </button>

                <div class="login-switch-prompt">
                  Already have an account?
                  <button type="button" class="login-switch-link" id="link-to-login">Sign in here</button>
                </div>
              </form>

              <!-- ── 3. OTP VERIFICATION FORM ── -->
              <div class="login-form otp-section" id="otp-section" style="display:none;">
                <div class="otp-email-badge" id="otp-email-badge">
                  ${Icons.mail}
                  <span id="otp-email-display">your@email.com</span>
                </div>

                <p class="otp-instruction">Enter the 6-digit code sent to your email address. The code expires in <strong>5 minutes</strong>.</p>

                <div class="otp-input-group" id="otp-input-group">
                  <input type="text" class="otp-digit" id="otp-0" maxlength="1" pattern="\d" inputmode="numeric" autocomplete="one-time-code" aria-label="OTP digit 1"/>
                  <input type="text" class="otp-digit" id="otp-1" maxlength="1" pattern="\d" inputmode="numeric" aria-label="OTP digit 2"/>
                  <input type="text" class="otp-digit" id="otp-2" maxlength="1" pattern="\d" inputmode="numeric" aria-label="OTP digit 3"/>
                  <input type="text" class="otp-digit" id="otp-3" maxlength="1" pattern="\d" inputmode="numeric" aria-label="OTP digit 4"/>
                  <input type="text" class="otp-digit" id="otp-4" maxlength="1" pattern="\d" inputmode="numeric" aria-label="OTP digit 5"/>
                  <input type="text" class="otp-digit" id="otp-5" maxlength="1" pattern="\d" inputmode="numeric" aria-label="OTP digit 6"/>
                </div>

                <button type="button" class="login-submit-btn" id="otp-verify-btn">
                  <span class="btn-text">Verify Email</span>
                  ${Icons.checkCircle}
                  <span class="login-spinner"></span>
                </button>

                <div class="otp-resend-row">
                  <button type="button" class="otp-resend-btn" id="otp-resend-btn" disabled>
                    ${Icons.refresh} Resend OTP
                  </button>
                  <span class="otp-countdown" id="otp-countdown"></span>
                </div>

                <div class="login-switch-prompt">
                  <button type="button" class="login-switch-link" id="otp-back-btn">${Icons.arrowLeft} Back to Register</button>
                </div>
              </div>

              <!-- ── 4. FORGOT PASSWORD FORM ── -->
              <form class="login-form" id="forgot-form" novalidate style="display:none;">
                <p class="otp-instruction">Enter your registered email address. We'll send you a reset OTP.</p>

                <div class="login-field" id="field-forgot-email">
                  <label for="forgot-email">Email Address <span class="required">*</span></label>
                  <div class="login-input-wrapper">
                    <span class="login-input-icon">${Icons.mail}</span>
                    <input type="email" id="forgot-email" class="login-input" placeholder="Enter your registered email" required autocomplete="email"/>
                  </div>
                  <span class="field-error" id="forgot-email-error">Please enter a valid email address</span>
                </div>

                <button type="submit" class="login-submit-btn" id="forgot-submit-btn">
                  <span class="btn-text">Send Reset OTP</span>
                  ${Icons.key}
                  <span class="login-spinner"></span>
                </button>

                <div class="login-switch-prompt">
                  <button type="button" class="login-switch-link" id="forgot-back-btn">${Icons.arrowLeft} Back to Sign In</button>
                </div>
              </form>

              <!-- ── 5. RESET PASSWORD FORM ── -->
              <form class="login-form" id="reset-form" novalidate style="display:none;">
                <div class="otp-email-badge" id="reset-email-badge">
                  ${Icons.mail}
                  <span id="reset-email-display">your@email.com</span>
                </div>

                <div class="login-field">
                  <label>Reset OTP <span class="required">*</span></label>
                  <div class="otp-input-group" id="reset-otp-group">
                    <input type="text" class="otp-digit" id="reset-otp-0" maxlength="1" pattern="\d" inputmode="numeric" autocomplete="one-time-code" aria-label="OTP digit 1"/>
                    <input type="text" class="otp-digit" id="reset-otp-1" maxlength="1" pattern="\d" inputmode="numeric" aria-label="OTP digit 2"/>
                    <input type="text" class="otp-digit" id="reset-otp-2" maxlength="1" pattern="\d" inputmode="numeric" aria-label="OTP digit 3"/>
                    <input type="text" class="otp-digit" id="reset-otp-3" maxlength="1" pattern="\d" inputmode="numeric" aria-label="OTP digit 4"/>
                    <input type="text" class="otp-digit" id="reset-otp-4" maxlength="1" pattern="\d" inputmode="numeric" aria-label="OTP digit 5"/>
                    <input type="text" class="otp-digit" id="reset-otp-5" maxlength="1" pattern="\d" inputmode="numeric" aria-label="OTP digit 6"/>
                  </div>
                </div>

                <div class="login-field" id="field-reset-password">
                  <label for="reset-password">New Password <span class="required">*</span></label>
                  <div class="login-input-wrapper">
                    <span class="login-input-icon">${Icons.lock}</span>
                    <input type="password" id="reset-password" class="login-input" placeholder="Min 8 chars, A-Z, a-z, 0-9" required autocomplete="new-password"/>
                    <button type="button" class="login-password-toggle" id="reset-password-toggle" aria-label="Toggle password visibility">${Icons.eye}</button>
                  </div>
                  <span class="field-error" id="reset-password-error">Min 8 chars with uppercase, lowercase, and number</span>
                </div>

                <div class="login-field" id="field-reset-confirm-password">
                  <label for="reset-confirm-password">Confirm New Password <span class="required">*</span></label>
                  <div class="login-input-wrapper">
                    <span class="login-input-icon">${Icons.lock}</span>
                    <input type="password" id="reset-confirm-password" class="login-input" placeholder="Re-enter new password" required autocomplete="new-password"/>
                    <button type="button" class="login-password-toggle" id="reset-confirm-toggle" aria-label="Toggle confirm password visibility">${Icons.eye}</button>
                  </div>
                  <span class="field-error" id="reset-confirm-error">Passwords must match</span>
                </div>

                <button type="submit" class="login-submit-btn" id="reset-submit-btn">
                  <span class="btn-text">Reset Password</span>
                  ${Icons.checkCircle}
                  <span class="login-spinner"></span>
                </button>

                <div class="otp-resend-row">
                  <button type="button" class="otp-resend-btn" id="reset-resend-btn" disabled>
                    ${Icons.refresh} Resend OTP
                  </button>
                  <span class="otp-countdown" id="reset-countdown"></span>
                </div>

                <div class="login-switch-prompt">
                  <button type="button" class="login-switch-link" id="reset-back-btn">${Icons.arrowLeft} Back to Sign In</button>
                </div>
              </form>

              <!-- Demo Section (only on login) -->
              <div class="login-demo-section" id="login-demo-section">
                <div class="login-divider"><span>Quick Demo Login</span></div>
                <div class="login-demo-cards">
                  <div class="login-demo-card" data-role="user" id="demo-user" tabindex="0" role="button" aria-label="Login as demo user Ishwari Nikam">
                    <div class="login-demo-card-avatar role-user">IN</div>
                    <div class="login-demo-card-info">
                      <div class="login-demo-card-role">Member — Ishwari Nikam</div>
                      <div class="login-demo-card-email">ishwari.nikam@email.com</div>
                    </div>
                    <div class="login-demo-card-arrow">${Icons.chevronRight}</div>
                  </div>
                  <div class="login-demo-card" data-role="trainer" id="demo-trainer" tabindex="0" role="button" aria-label="Login as demo trainer Coach Arjun">
                    <div class="login-demo-card-avatar role-trainer">AM</div>
                    <div class="login-demo-card-info">
                      <div class="login-demo-card-role">Trainer — Coach Arjun Mehta</div>
                      <div class="login-demo-card-email">arjun.mehta@fittrack.com</div>
                    </div>
                    <div class="login-demo-card-arrow">${Icons.chevronRight}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div class="login-footer">
            <p>&copy; 2026 FitTrack. All rights reserved.</p>
          </div>

        </div>
      </div>
    `;

    bindEvents();
    injectShakeAnimation();
  }

  /* ═══════════════════════════════════════════════════
     EVENT BINDING
  ═══════════════════════════════════════════════════ */
  function bindEvents() {
    // Mode tabs
    document.querySelectorAll('.login-mode-tab').forEach(t => t.addEventListener('click', () => switchMode(t.dataset.mode)));

    // Role tabs
    document.querySelectorAll('.login-role-tab').forEach(t => t.addEventListener('click', () => switchRole(t.dataset.role)));

    // Switch links
    on('link-to-register', 'click', () => switchMode('register'));
    on('link-to-login',    'click', () => switchMode('login'));
    on('otp-back-btn',     'click', () => switchMode('register'));
    on('forgot-back-btn',  'click', () => switchMode('login'));
    on('reset-back-btn',   'click', () => switchMode('login'));

    // Forms
    on('login-form',    'submit', handleLoginSubmit);
    on('register-form', 'submit', handleRegisterSubmit);
    on('forgot-form',   'submit', handleForgotSubmit);
    on('reset-form',    'submit', handleResetSubmit);

    // Password toggles
    on('login-password-toggle',   'click', () => togglePwd('login',  'login-password'));
    on('reg-password-toggle',     'click', () => togglePwd('reg',    'reg-password'));
    on('reg-confirm-toggle',      'click', () => togglePwd('reg2',   'reg-confirm-password'));
    on('reset-password-toggle',   'click', () => togglePwd('reset',  'reset-password'));
    on('reset-confirm-toggle',    'click', () => togglePwd('reset2', 'reset-confirm-password'));

    // Forgot password link
    on('login-forgot', 'click', (e) => { e.preventDefault(); switchMode('forgot'); });

    // Demo cards
    document.querySelectorAll('.login-demo-card').forEach(c => {
      c.addEventListener('click', () => fillDemo(c.dataset.role));
      c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fillDemo(c.dataset.role); } });
    });

    // Clear field errors on input
    ['login-email',    'login-password',
     'reg-name',       'reg-email',       'reg-phone', 'reg-password', 'reg-confirm-password',
     'forgot-email',   'reset-password',  'reset-confirm-password'
    ].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => clearFieldError(id.replace('login-', '').replace('reg-', 'reg-').replace('forgot-', 'forgot-').replace('reset-', 'reset-')));
    });

    // Password strength meter
    const regPwd = document.getElementById('reg-password');
    if (regPwd) regPwd.addEventListener('input', () => updateStrengthMeter(regPwd.value));

    // OTP inputs
    setupOtpInputs('otp');
    setupOtpInputs('reset-otp');

    // Verify OTP button
    on('otp-verify-btn',  'click', handleVerifyOtp);
    on('otp-resend-btn',  'click', () => resendOtp('verify'));
    on('reset-resend-btn','click', () => resendOtp('reset'));
  }

  /* ═══════════════════════════════════════════════════
     MODE & ROLE SWITCHING
  ═══════════════════════════════════════════════════ */
  function switchMode(mode) {
    currentMode = mode;

    const isAuthMode  = (mode === 'login' || mode === 'register');
    const isOtpMode   = (mode === 'otp');
    const isForgot    = (mode === 'forgot');
    const isReset     = (mode === 'reset');

    // Tab visibility
    setDisplay('login-mode-tabs',  isAuthMode ? 'flex' : 'none');
    setDisplay('login-role-tabs',  isAuthMode ? 'flex' : 'none');
    setDisplay('login-demo-section', mode === 'login' ? 'block' : 'none');

    // Form visibility
    setDisplay('login-form',    mode === 'login'    ? 'flex' : 'none');
    setDisplay('register-form', mode === 'register' ? 'flex' : 'none');
    setDisplay('otp-section',   isOtpMode           ? 'flex' : 'none');
    setDisplay('forgot-form',   isForgot            ? 'flex' : 'none');
    setDisplay('reset-form',    isReset             ? 'flex' : 'none');

    // Tab states
    document.querySelectorAll('.login-mode-tab').forEach(t => {
      const active = t.dataset.mode === mode;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', active);
    });

    updateTitles();
    hideAlerts();
    clearAllErrors();
  }

  function switchRole(role) {
    currentRole = role;

    document.querySelectorAll('.login-role-tab').forEach(t => {
      const active = t.dataset.role === role;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', active);
    });

    updateRoleExtraField(role);
    updateTitles();
    hideAlerts();
  }

  function updateTitles() {
    const titles = {
      login:    { user: ['Welcome back', 'Sign in to your member account'],          trainer: ['Coach Portal', 'Access your professional coaching dashboard'] },
      register: { user: ['Join FitTrack', 'Create your member account in seconds'],  trainer: ['Coach Registration', 'Create your professional trainer profile'] },
      otp:      { user: ['Check Your Email', 'Enter the 6-digit verification code'], trainer: ['Check Your Email', 'Enter the 6-digit verification code'] },
      forgot:   { user: ['Forgot Password?', 'We\'ll send you a reset OTP'],          trainer: ['Forgot Password?', 'We\'ll send you a reset OTP'] },
      reset:    { user: ['Reset Password', 'Enter the OTP and choose a new password'], trainer: ['Reset Password', 'Enter the OTP and choose a new password'] },
    };

    const t = titles[currentMode]?.[currentRole] || ['FitTrack', ''];
    const titleEl    = document.getElementById('login-card-title');
    const subtitleEl = document.getElementById('login-card-subtitle');

    if (titleEl && subtitleEl) {
      titleEl.style.opacity    = '0';
      subtitleEl.style.opacity = '0';
      setTimeout(() => {
        titleEl.textContent    = t[0];
        subtitleEl.textContent = t[1];
        titleEl.style.opacity    = '1';
        subtitleEl.style.opacity = '1';
      }, 120);
      titleEl.style.transition    = 'opacity 0.2s ease';
      subtitleEl.style.transition = 'opacity 0.2s ease';
    }
  }

  function updateRoleExtraField(role) {
    const label  = document.getElementById('label-reg-role-extra');
    const icon   = document.getElementById('icon-reg-role-extra');
    const select = document.getElementById('reg-role-extra');
    const btn    = document.getElementById('reg-btn-text');

    if (role === 'trainer') {
      if (label)  label.innerHTML  = `Primary Coaching Specialization <span class="required">*</span>`;
      if (icon)   icon.innerHTML   = Icons.shield;
      if (select) select.innerHTML = `
        <option value="Strength &amp; Conditioning">Strength &amp; Conditioning</option>
        <option value="HIIT &amp; Athletic Fat Loss">HIIT &amp; Athletic Fat Loss</option>
        <option value="Yoga, Posture &amp; Mobility">Yoga, Posture &amp; Mobility</option>
        <option value="Sports Nutrition &amp; Body Recomposition">Sports Nutrition &amp; Body Recomposition</option>
        <option value="Functional Rehabilitation">Functional Rehabilitation</option>
      `;
      if (btn)    btn.textContent  = 'Register as Certified Coach';
    } else {
      if (label)  label.innerHTML  = `Primary Fitness Goal <span class="required">*</span>`;
      if (icon)   icon.innerHTML   = Icons.target;
      if (select) select.innerHTML = `
        <option value="Fat Loss &amp; Muscle Toning">Fat Loss &amp; Muscle Toning</option>
        <option value="Strength &amp; Muscle Hypertrophy">Strength &amp; Muscle Hypertrophy</option>
        <option value="Posture, Mobility &amp; Core Reset">Posture, Mobility &amp; Core Reset</option>
        <option value="Athletic Conditioning &amp; Endurance">Athletic Conditioning &amp; Endurance</option>
        <option value="General Health &amp; Longevity">General Health &amp; Longevity</option>
      `;
      if (btn)    btn.textContent  = 'Create Member Account';
    }
  }

  /* ═══════════════════════════════════════════════════
     OTP INPUT SETUP
  ═══════════════════════════════════════════════════ */
  function setupOtpInputs(prefix) {
    for (let i = 0; i < 6; i++) {
      const input = document.getElementById(`${prefix}-${i}`);
      if (!input) continue;

      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\D/g, '');
        e.target.value = val ? val[val.length - 1] : '';
        if (val && i < 5) document.getElementById(`${prefix}-${i + 1}`)?.focus();
        autoVerifyIfComplete(prefix);
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && i > 0) {
          document.getElementById(`${prefix}-${i - 1}`)?.focus();
        }
        if (e.key === 'ArrowLeft'  && i > 0) document.getElementById(`${prefix}-${i - 1}`)?.focus();
        if (e.key === 'ArrowRight' && i < 5) document.getElementById(`${prefix}-${i + 1}`)?.focus();
      });

      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
        [...pasted.slice(0, 6)].forEach((ch, idx) => {
          const el = document.getElementById(`${prefix}-${idx}`);
          if (el) el.value = ch;
        });
        const last = Math.min(pasted.length - 1, 5);
        document.getElementById(`${prefix}-${last}`)?.focus();
        autoVerifyIfComplete(prefix);
      });
    }
  }

  function getOtpValue(prefix) {
    return Array.from({ length: 6 }, (_, i) => document.getElementById(`${prefix}-${i}`)?.value || '').join('');
  }

  function clearOtpInputs(prefix) {
    for (let i = 0; i < 6; i++) {
      const el = document.getElementById(`${prefix}-${i}`);
      if (el) el.value = '';
    }
    document.getElementById(`${prefix}-0`)?.focus();
  }

  function autoVerifyIfComplete(prefix) {
    if (prefix === 'otp' && getOtpValue('otp').length === 6) {
      setTimeout(handleVerifyOtp, 300);
    }
  }

  /* ═══════════════════════════════════════════════════
     FORM HANDLERS
  ═══════════════════════════════════════════════════ */
  async function handleLoginSubmit(e) {
    e.preventDefault();
    const email    = val('login-email').toLowerCase();
    const password = val('login-password');

    let valid = true;
    if (!email || !isEmail(email)) { showFieldError('email', !email ? 'Email is required' : 'Enter a valid email'); valid = false; }
    if (!password)                 { showFieldError('password', 'Password is required'); valid = false; }

    if (!valid) { showAlert('error', 'Please fix the highlighted fields.'); return; }

    hideAlerts();
    await handleLogin(email, password);
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    const name     = val('reg-name');
    const email    = val('reg-email').toLowerCase();
    const phone    = val('reg-phone');
    const password = val('reg-password');
    const confirm  = val('reg-confirm-password');
    const terms    = document.getElementById('reg-terms')?.checked;
    const roleExtra = document.getElementById('reg-role-extra')?.value;

    let valid = true;

    if (!name || name.length < 2)             { showFieldError('reg-name',             'Full name must be at least 2 characters'); valid = false; }
    if (!email || !isEmail(email))            { showFieldError('reg-email',            'Enter a valid email address'); valid = false; }
    if (!validatePhone(phone))                { showFieldError('reg-phone',            'Enter a valid mobile number (7–15 digits)'); valid = false; }
    if (!validatePassword(password))          { showFieldError('reg-password',         'Min 8 chars with uppercase, lowercase, and number'); valid = false; }
    if (password !== confirm)                 { showFieldError('reg-confirm-password', 'Passwords do not match'); valid = false; }
    if (!terms)                               { showAlert('error', 'Please accept the Terms & Conditions.'); return; }

    if (!valid) { showAlert('error', 'Please fix the highlighted fields.'); return; }

    const btn = document.getElementById('reg-submit-btn');
    btn.classList.add('loading');
    hideAlerts();

    try {
      const res = await apiFetch('api/auth/register.php', {
        full_name:        name,
        email:            email,
        phone:            phone,
        password:         password,
        confirm_password: confirm,
        role:             currentRole,
        role_extra:       roleExtra
      });

      btn.classList.remove('loading');

      if (res.success) {
        pendingEmail = email;
        showAlert('success', `Account created! We've sent a verification code to ${email}`);
        setTimeout(() => {
          showOtpScreen(email, 'verify', res.data?.cooldown || 60);
        }, 800);
      } else {
        // If email already exists and unverified, go directly to OTP
        if (res.data?.action === 'resend_otp') {
          pendingEmail = email;
          showAlert('success', 'Unverified account found. A new OTP has been sent.');
          setTimeout(() => showOtpScreen(email, 'verify', 60), 800);
        } else {
          showAlert('error', res.message || 'Registration failed.');
        }
      }
    } catch (err) {
      btn.classList.remove('loading');
      showAlert('error', 'Cannot connect to server. Please ensure XAMPP is running.');
    }
  }

  async function handleVerifyOtp() {
    const otp = getOtpValue('otp');
    if (otp.length < 6) {
      shakeCard();
      showAlert('error', 'Please enter all 6 digits of the OTP.');
      return;
    }

    const btn = document.getElementById('otp-verify-btn');
    btn.classList.add('loading');
    hideAlerts();

    try {
      const res = await apiFetch('api/auth/verify-otp.php', { email: pendingEmail, otp });
      btn.classList.remove('loading');

      if (res.success) {
        clearOtpTimer();
        showAlert('success', '✅ Email verified! Redirecting to your dashboard...');
        // Store session info in sessionStorage for dashboard JS
        try {
          sessionStorage.setItem('fittrack_user', JSON.stringify({
            id:       res.data?.user?.user_id,
            name:     res.data?.user?.full_name,
            email:    res.data?.user?.email,
            role:     res.data?.user?.role,
            loggedIn: true,
          }));
        } catch (_) {}
        setTimeout(() => { window.location.href = res.data?.redirect || 'user-dashboard.html'; }, 1200);
      } else {
        clearOtpInputs('otp');
        shakeCard();
        showAlert('error', res.message || 'Incorrect OTP. Please try again.');
      }
    } catch (err) {
      btn.classList.remove('loading');
      showAlert('error', 'Network error. Please check XAMPP is running.');
    }
  }

  async function handleForgotSubmit(e) {
    e.preventDefault();
    const email = val('forgot-email').toLowerCase();

    if (!email || !isEmail(email)) {
      showFieldError('forgot-email', 'Enter a valid email address');
      return;
    }

    const btn = document.getElementById('forgot-submit-btn');
    btn.classList.add('loading');
    hideAlerts();

    try {
      const res = await apiFetch('api/auth/forgot-password.php', { email });
      btn.classList.remove('loading');

      // Always show success (server protects against enumeration)
      showAlert('success', res.message || 'If an account exists, a reset OTP has been sent.');
      pendingEmail = email;
      setTimeout(() => showResetScreen(email, res.data?.cooldown || 60), 1200);
    } catch (err) {
      btn.classList.remove('loading');
      showAlert('error', 'Network error. Please ensure XAMPP is running.');
    }
  }

  async function handleResetSubmit(e) {
    e.preventDefault();
    const otp     = getOtpValue('reset-otp');
    const newPwd  = val('reset-password');
    const confirm = val('reset-confirm-password');

    let valid = true;
    if (otp.length < 6)              { showAlert('error', 'Please enter all 6 OTP digits.'); valid = false; }
    if (!validatePassword(newPwd))   { showFieldError('reset-password',         'Min 8 chars with uppercase, lowercase, and number'); valid = false; }
    if (newPwd !== confirm)          { showFieldError('reset-confirm-password', 'Passwords do not match'); valid = false; }

    if (!valid) return;

    const btn = document.getElementById('reset-submit-btn');
    btn.classList.add('loading');
    hideAlerts();

    try {
      const res = await apiFetch('api/auth/reset-password.php', {
        email:            pendingEmail,
        otp,
        new_password:     newPwd,
        confirm_password: confirm
      });
      btn.classList.remove('loading');

      if (res.success) {
        clearOtpTimer();
        showAlert('success', '🎉 Password reset successfully! Please sign in with your new password.');
        setTimeout(() => switchMode('login'), 2000);
      } else {
        clearOtpInputs('reset-otp');
        shakeCard();
        showAlert('error', res.message || 'Invalid or expired OTP.');
      }
    } catch (err) {
      btn.classList.remove('loading');
      showAlert('error', 'Network error. Please ensure XAMPP is running.');
    }
  }

  /* ═══════════════════════════════════════════════════
     LOGIN LOGIC
  ═══════════════════════════════════════════════════ */
  async function handleLogin(email, password) {
    const btn = document.getElementById('login-submit-btn');
    if (btn) btn.classList.add('loading');

    try {
      const res = await apiFetch('api/auth/login.php', { email, password, role: currentRole });
      if (btn) btn.classList.remove('loading');

      if (res.success) {
        const user = res.data?.user || {};
        showAlert('success', `Welcome back, ${user.full_name || 'User'}! Redirecting...`);

        try {
          sessionStorage.setItem('fittrack_user', JSON.stringify({
            id:       user.user_id,
            name:     user.full_name,
            email:    user.email,
            role:     user.role,
            loggedIn: true,
            loginTime: new Date().toISOString()
          }));
        } catch (_) {}

        setTimeout(() => { window.location.href = res.data?.redirect || 'user-dashboard.html'; }, 1000);
      } else {
        if (btn) btn.classList.remove('loading');
        shakeCard();

        // If unverified email, offer to go to OTP
        if (res.data?.action === 'resend_otp') {
          showAlert('error', res.message + ' Click here to verify.');
          pendingEmail = email;
          setTimeout(() => showOtpScreen(email, 'verify', 60), 1500);
        } else {
          showAlert('error', res.message || 'Invalid email or password.');
        }
      }
    } catch (err) {
      if (btn) btn.classList.remove('loading');
      // Demo offline fallback
      const cred = Object.values(demoCredentials).find(c => c.email === email && c.password === password);
      if (cred) {
        try { sessionStorage.setItem('fittrack_user', JSON.stringify({ ...cred, loggedIn: true })); } catch (_) {}
        showAlert('success', `Welcome, ${cred.name}! (Offline mode)`);
        setTimeout(() => { window.location.href = cred.redirect; }, 1000);
      } else {
        showAlert('error', 'Cannot connect to server. Please ensure XAMPP Apache & MySQL are running.');
      }
    }
  }

  /* ═══════════════════════════════════════════════════
     OTP SCREEN HELPERS
  ═══════════════════════════════════════════════════ */
  function showOtpScreen(email, type, cooldown) {
    const emailBadge = document.getElementById('otp-email-display');
    if (emailBadge) emailBadge.textContent = email;
    switchMode('otp');
    clearOtpInputs('otp');
    startOtpCountdown(cooldown, 'otp-countdown', 'otp-resend-btn');
    setTimeout(() => document.getElementById('otp-0')?.focus(), 200);
  }

  function showResetScreen(email, cooldown) {
    const emailBadge = document.getElementById('reset-email-display');
    if (emailBadge) emailBadge.textContent = email;
    switchMode('reset');
    clearOtpInputs('reset-otp');
    startOtpCountdown(cooldown, 'reset-countdown', 'reset-resend-btn');
    setTimeout(() => document.getElementById('reset-otp-0')?.focus(), 200);
  }

  async function resendOtp(type) {
    const endpoint = type === 'reset' ? 'api/auth/forgot-password.php' : 'api/auth/send-otp.php';
    const resendBtn  = document.getElementById(type === 'reset' ? 'reset-resend-btn' : 'otp-resend-btn');
    const countdown  = document.getElementById(type === 'reset' ? 'reset-countdown' : 'otp-countdown');

    hideAlerts();
    if (resendBtn) resendBtn.disabled = true;

    try {
      const res = await apiFetch(endpoint, { email: pendingEmail });
      if (res.success || res.message) {
        showAlert('success', 'OTP resent! Check your email.');
        startOtpCountdown(res.data?.cooldown || 60, countdown?.id, resendBtn?.id);
      } else {
        showAlert('error', res.message || 'Failed to resend OTP.');
        if (resendBtn) resendBtn.disabled = false;
      }
    } catch (_) {
      showAlert('error', 'Network error. Please try again.');
      if (resendBtn) resendBtn.disabled = false;
    }
  }

  function startOtpCountdown(seconds, countdownId, btnId) {
    clearOtpTimer();
    let remaining = seconds;

    const update = () => {
      const el  = typeof countdownId === 'string' ? document.getElementById(countdownId) : countdownId;
      const btn = typeof btnId === 'string'        ? document.getElementById(btnId)       : btnId;
      if (el)  el.textContent  = remaining > 0 ? `(${remaining}s)` : '';
      if (btn) btn.disabled    = remaining > 0;
    };

    update();
    otpCooldownTimer = setInterval(() => {
      remaining--;
      update();
      if (remaining <= 0) clearOtpTimer();
    }, 1000);
  }

  function clearOtpTimer() {
    if (otpCooldownTimer) { clearInterval(otpCooldownTimer); otpCooldownTimer = null; }
  }

  /* ═══════════════════════════════════════════════════
     DEMO AUTOFILL
  ═══════════════════════════════════════════════════ */
  function fillDemo(role) {
    const cred = demoCredentials[role];
    if (!cred) return;
    switchMode('login');
    switchRole(role);

    const emailInput = document.getElementById('login-email');
    const pwdInput   = document.getElementById('login-password');
    emailInput.value = '';
    pwdInput.value   = '';

    typeInto(emailInput, cred.email, 0, () => {
      typeInto(pwdInput, cred.password, 0, () => {
        showAlert('success', `Demo credentials for ${cred.name} loaded. Signing in...`);
        setTimeout(() => handleLogin(cred.email, cred.password), 600);
      });
    });
  }

  function typeInto(input, text, i, cb) {
    if (i < text.length) {
      input.value += text[i];
      input.dispatchEvent(new Event('input'));
      setTimeout(() => typeInto(input, text, i + 1, cb), 20);
    } else if (cb) cb();
  }

  /* ═══════════════════════════════════════════════════
     PASSWORD STRENGTH METER
  ═══════════════════════════════════════════════════ */
  function updateStrengthMeter(pwd) {
    let score = 0;
    if (pwd.length >= 8)  score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd))    score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['', '#ef4444', '#f59e0b', '#10b981', '#059669', '#047857'];

    const labelEl = document.getElementById('strength-label');
    if (labelEl) {
      labelEl.textContent = pwd.length === 0 ? 'Enter a password' : (labels[score] || 'Weak');
      labelEl.style.color = colors[score] || '#adb5bd';
    }

    for (let i = 1; i <= 4; i++) {
      const bar = document.getElementById(`bar-${i}`);
      if (bar) {
        bar.style.background = i <= score ? (colors[Math.min(score, 4)] || '#e9ecef') : '#e9ecef';
      }
    }
  }

  /* ═══════════════════════════════════════════════════
     UTILITIES
  ═══════════════════════════════════════════════════ */
  function togglePwd(key, inputId) {
    passwordVisible[key] = !passwordVisible[key];
    const input  = document.getElementById(inputId);
    const toggle = document.querySelector(`#${inputId}`.replace('#', '#').split('-').map((_, i, a) => i < a.length - 1 ? a[i] : 'toggle').join('-') + '-btn') ||
                   document.querySelector(`[id$="${key === 'login' ? 'login-password-toggle' : key + '-password-toggle'}"]`);
    if (input) input.type = passwordVisible[key] ? 'text' : 'password';

    // Find the toggle button for this field
    const btn = input?.parentElement.querySelector('.login-password-toggle');
    if (btn) btn.innerHTML = passwordVisible[key] ? Icons.eyeOff : Icons.eye;
  }

  function validatePassword(pwd) {
    return pwd.length >= 8 && /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) && /\d/.test(pwd);
  }

  function validatePhone(phone) {
    const clean = phone.replace(/[\s\-\(\)\+]/g, '');
    return /^\d{7,15}$/.test(clean);
  }

  function isEmail(str) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  }

  function val(id) {
    return (document.getElementById(id)?.value || '').trim();
  }

  function on(id, evt, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(evt, fn);
  }

  function setDisplay(id, val) {
    const el = document.getElementById(id);
    if (el) el.style.display = val;
  }

  function showFieldError(fieldSuffix, msg) {
    // Map field id to field container id
    const fieldMap = {
      'email':              'field-email',
      'password':           'field-password',
      'reg-name':           'field-reg-name',
      'reg-email':          'field-reg-email',
      'reg-phone':          'field-reg-phone',
      'reg-password':       'field-reg-password',
      'reg-confirm-password': 'field-reg-confirm-password',
      'forgot-email':       'field-forgot-email',
      'reset-password':     'field-reset-password',
      'reset-confirm-password': 'field-reset-confirm-password',
    };

    const fieldEl = document.getElementById(fieldMap[fieldSuffix]);
    const errorEl = document.getElementById(`${fieldSuffix}-error`);

    if (fieldEl) fieldEl.classList.add('error');
    if (errorEl) errorEl.textContent = msg;
  }

  function clearFieldError(fieldSuffix) {
    const fieldMap = {
      'email':              'field-email',
      'password':           'field-password',
      'reg-name':           'field-reg-name',
      'reg-email':          'field-reg-email',
      'reg-phone':          'field-reg-phone',
      'reg-password':       'field-reg-password',
      'confirm-password':   'field-reg-confirm-password',
      'forgot-email':       'field-forgot-email',
      'reset-password':     'field-reset-password',
      'reset-confirm-password': 'field-reset-confirm-password',
    };
    const fieldEl = document.getElementById(fieldMap[fieldSuffix]);
    if (fieldEl) fieldEl.classList.remove('error');
  }

  function clearAllErrors() {
    document.querySelectorAll('.login-field.error').forEach(f => f.classList.remove('error'));
  }

  function showAlert(type, msg) {
    hideAlerts();
    const el     = document.getElementById(`login-${type}`);
    const textEl = document.getElementById(`login-${type}-text`);
    if (textEl) textEl.textContent = msg;
    if (el)     el.classList.add('visible');
  }

  function hideAlerts() {
    ['login-error', 'login-success'].forEach(id => document.getElementById(id)?.classList.remove('visible'));
  }

  function shakeCard() {
    const card = document.querySelector('.login-card');
    if (!card) return;
    card.style.animation = 'none';
    card.offsetHeight;
    card.style.animation = 'cardShake 0.5s ease';
    setTimeout(() => { card.style.animation = ''; }, 500);
  }

  function injectShakeAnimation() {
    const s = document.createElement('style');
    s.textContent = `
      @keyframes cardShake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80%      { transform: translateX(5px); }
      }
    `;
    document.head.appendChild(s);
  }

  /* API fetch wrapper */
  async function apiFetch(url, body) {
    const res = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body)
    });
    return res.json();
  }

  /* ═══════════════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════════════ */
  function init() {
    render();
  }

  return { init };

})();

document.addEventListener('DOMContentLoaded', LoginApp.init);
