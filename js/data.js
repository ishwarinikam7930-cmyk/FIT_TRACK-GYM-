/* ============================================
   FitTrack – Mock / Demo Data Store
   Comprehensive data structures supporting:
   1) USER DASHBOARD (11 Features)
   2) TRAINER DASHBOARD (10 Features)
   3) MULTI-ROLE SWITCHING & AUTH
   ============================================ */

const FitTrackData = {

  /* ══════════════════════════════════════════════
     USER DATA & FEATURES
     ══════════════════════════════════════════════ */

  /* ── 1. Current User Profile ── */
  currentUser: {
    id: 'user_001',
    name: 'Member',
    fullName: 'FitTrack Member',
    email: 'member@fittrack.com',
    phone: '+91 98765 43210',
    age: 24,
    gender: 'Female',
    city: 'Mumbai, India',
    role: 'user',
    avatarInitials: 'FT',
    subscription: 'pro',
    joinedDate: '2026-08-15',
    
    // Biometrics & Fitness
    height: 168, // cm
    weight: 64.5, // kg
    targetWeight: 58.0, // kg
    bodyFat: 22.4, // %
    targetBodyFat: 18.0, // %
    fitnessLevel: 'Intermediate',
    primaryGoal: 'Fat Loss & Muscle Toning',
    activityLevel: 'Moderate (4-5 days/wk)',
    
    // Health & Preferences
    dietaryPreference: 'High Protein / Vegetarian (Eggs OK)',
    allergies: 'Peanuts (Mild)',
    medicalHistory: 'None. Previous mild ankle sprain in 2024 (fully recovered).',
    emergencyContact: 'Rajesh Nikam (Father) - +91 98220 11223',
  },

  /* ── 2. Defined Goals & Milestones ── */
  activeGoal: {
    title: 'Lose 6.5 kg & Tone Upper Body',
    goalType: 'Weight Loss & Muscle Definition',
    startWeight: 68.0,
    currentWeight: 64.5,
    targetWeight: 58.0,
    targetCalories: 2100,
    targetWater: '3.5 L / day',
    targetWorkoutsPerWeek: 5,
    startDate: '2026-08-15',
    targetDate: '2026-10-30',
    totalDays: 76,
    daysElapsed: 42,
    progressPercentage: 54,
    milestones: [
      { id: 'm1', title: 'Break below 66 kg threshold', target: '66.0 kg', completed: true, date: '2026-08-30' },
      { id: 'm2', title: 'Achieve 15 continuous workout days streak', target: '15 workouts', completed: true, date: '2026-09-08' },
      { id: 'm3', title: 'Reach 63.5 kg intermediate target', target: '63.5 kg', completed: false, date: 'Target: Oct 5' },
      { id: 'm4', title: 'Hit 20% body fat & bench press 40kg', target: '20% Body Fat', completed: false, date: 'Target: Oct 20' },
      { id: 'm5', title: 'Final Target: 58 kg and sculpted core', target: '58.0 kg', completed: false, date: 'Target: Oct 30' }
    ]
  },

  /* ── 3. Active Trainer & Directory ── */
  activeTrainer: {
    id: 'trainer_001',
    name: 'Coach Arjun Mehta',
    shortName: 'Arjun M.',
    specialization: 'Strength & Conditioning',
    experience: '8+ years',
    rating: 4.9,
    reviewsCount: 128,
    activeClients: 34,
    avatarInitials: 'AM',
    plan: 'Pro Coaching Plan',
    ratePerSession: '$45',
    bio: 'Former national athlete and certified NSCA-CSCS trainer specializing in progressive hypertrophy, body recomposition, and functional strength.',
    tags: ['Strength', 'Fat Loss', 'Powerlifting', 'Posture Correction'],
    certifications: ['NSCA-CSCS', 'ISSA Certified Master Trainer', 'ACE Nutrition Specialist']
  },

  trainersList: [
    {
      id: 'trainer_001',
      name: 'Coach Arjun Mehta',
      title: 'Head Strength & Conditioning Coach',
      specialization: 'Strength & Conditioning',
      category: 'strength',
      experience: '8+ years',
      rating: 4.9,
      reviewsCount: 128,
      activeClients: 34,
      avatarInitials: 'AM',
      avatarBg: '#059669',
      isAssigned: true,
      bio: 'Former national athlete specializing in progressive hypertrophy, body recomposition, and functional strength.',
      tags: ['Strength', 'Hypertrophy', 'Form Check', 'Powerlifting'],
      programmes: [
        {
          id: 'prog_am_1m',
          trainerId: 'trainer_001',
          trainerName: 'Coach Arjun Mehta',
          title: '1-Month Strength & Hypertrophy Foundation',
          category: 'Strength & Conditioning',
          duration: '1 Month',
          durationMonths: 1,
          price: 1999,
          workoutFeatures: '4-Day Split (Push/Pull/Legs/Upper), Exercise Video Form Analysis',
          dietGuidance: 'High-Protein Macro Breakdown & Nutrition Guidance',
          personalization: 'Weekly Volume & Load Adjustments',
          benefits: ['Direct Trainer Messaging', 'Personalized Workout Plan', 'Custom Diet Targets'],
          description: 'A 1-month structured hypertrophy foundation programme designed to build lean muscle mass with progressive overload.'
        },
        {
          id: 'prog_am_3m',
          trainerId: 'trainer_001',
          trainerName: 'Coach Arjun Mehta',
          title: '3-Month Complete Athletic Transformation',
          category: 'Strength & Conditioning',
          duration: '3 Months',
          durationMonths: 3,
          price: 4999,
          workoutFeatures: '5-Day Periodized Hypertrophy & Kinetic Power Split',
          dietGuidance: 'Full Macro Cycling & Meal Plan with Bi-weekly Adjustments',
          personalization: 'Bi-weekly Strength & Body Composition Audits',
          benefits: ['Priority Chat Support', 'Video Form Corrections', 'Full Nutrition Blueprint', 'Milestone Assessments'],
          description: 'Comprehensive 12-week athletic transformation focusing on heavy compound movements, mobility, and metabolic conditioning.'
        },
        {
          id: 'prog_am_6m',
          trainerId: 'trainer_001',
          trainerName: 'Coach Arjun Mehta',
          title: '6-Month Elite Body Recomposition Masterclass',
          category: 'Strength & Conditioning',
          duration: '6 Months',
          durationMonths: 6,
          price: 8999,
          workoutFeatures: '3-Phase Periodization: Base, Peak Strength, Cut & Define',
          dietGuidance: 'Custom Competition-Grade Diet Revisions & Supplement Guide',
          personalization: 'Monthly Biometrics Review & Continuous Progression Mapping',
          benefits: ['Unlimited Messaging Access', 'Personalized Routine & Diet', 'Plateau-Busting Strategies', 'Progress Logs Audit'],
          description: 'A 6-month transformational journey for serious lifters seeking significant muscle gain, fat loss, and strength PRs.'
        }
      ]
    },
    {
      id: 'trainer_002',
      name: 'Dr. Priya Sharma',
      title: 'Holistic Fitness & Yoga Specialist',
      specialization: 'Yoga & Mobility',
      category: 'yoga',
      experience: '6+ years',
      rating: 5.0,
      reviewsCount: 94,
      activeClients: 28,
      avatarInitials: 'PS',
      avatarBg: '#7C3AED',
      isAssigned: false,
      bio: 'Physiotherapist & 500-hour RYT yoga instructor focusing on core alignment, flexibility, breathing, and joint rehabilitation.',
      tags: ['Yoga', 'Flexibility', 'Posture', 'Rehab'],
      programmes: [
        {
          id: 'prog_ps_1m',
          trainerId: 'trainer_002',
          trainerName: 'Dr. Priya Sharma',
          title: '1-Month Posture & Spine Decompression Reset',
          category: 'Yoga & Mobility',
          duration: '1 Month',
          durationMonths: 1,
          price: 1799,
          workoutFeatures: 'Daily 25-Min Restorative Yoga & Spine Mobility Routines',
          dietGuidance: 'Anti-Inflammatory Hydration & Clean Eating Guide',
          personalization: 'Ergonomic Desk Posture Audit',
          benefits: ['Daily Guided Video Sequences', 'Direct Posture Feedback', 'Stress & Breathwork Modules'],
          description: 'Designed for desk workers and individuals suffering from lower back stiffness and rounded shoulders.'
        },
        {
          id: 'prog_ps_3m',
          trainerId: 'trainer_002',
          trainerName: 'Dr. Priya Sharma',
          title: '3-Month Deep Mobility & Functional Flexibility',
          category: 'Yoga & Mobility',
          duration: '3 Months',
          durationMonths: 3,
          price: 4499,
          workoutFeatures: 'Hatha-Vinyasa Flow, Hip Openers, Hamstring Lengthening',
          dietGuidance: 'Gut Health & Micronutrient Optimization Plan',
          personalization: 'Functional Movement Screen (FMS) Progress Check',
          benefits: ['Full Mobility Routines', 'Joint Pain Relief Protocols', 'Monthly Flexibility Testing'],
          description: 'Unlock full joint range of motion, deep core stability, and athletic mobility across a 3-month curriculum.'
        }
      ]
    },
    {
      id: 'trainer_003',
      name: 'Marcus Vance',
      title: 'HIIT & Fat Loss Specialist',
      specialization: 'HIIT & Endurance',
      category: 'hiit',
      experience: '7+ years',
      rating: 4.8,
      reviewsCount: 112,
      activeClients: 42,
      avatarInitials: 'MV',
      avatarBg: '#EA580C',
      isAssigned: false,
      bio: 'High-intensity athletic conditioning expert, kettlebell master, and metabolic conditioning coach for rapid fat loss.',
      tags: ['HIIT', 'Fat Loss', 'Kettlebell', 'Cardio'],
      programmes: [
        {
          id: 'prog_mv_1m',
          trainerId: 'trainer_003',
          trainerName: 'Marcus Vance',
          title: '1-Month Kettlebell & High-Intensity Fat Shred',
          category: 'HIIT & Fat Loss',
          duration: '1 Month',
          durationMonths: 1,
          price: 2199,
          workoutFeatures: 'Tabata & EMOM High-Density Circuits (35 Mins)',
          dietGuidance: 'Calorie Deficit Calculator & Quick Prep Meal Guide',
          personalization: 'Weekly Heart-Rate & Cardio Capacity Tracking',
          benefits: ['Explosive Fat Burning Plans', 'Equipment-Free Alternatives', 'Trainer Chat Support'],
          description: 'Accelerate fat burning and functional conditioning with scientifically programmed high-intensity intervals.'
        },
        {
          id: 'prog_mv_3m',
          trainerId: 'trainer_003',
          trainerName: 'Marcus Vance',
          title: '3-Month Extreme Metabolic Reconditioning',
          category: 'HIIT & Fat Loss',
          duration: '3 Months',
          durationMonths: 3,
          price: 5499,
          workoutFeatures: 'Progressive Athletic Conditioning, Plyometrics & Core Power',
          dietGuidance: 'Carb-Cycling Blueprint for Lean Definition',
          personalization: 'Bi-Weekly Body Composition & VO2 Max Assessments',
          benefits: ['Advanced Metabolic Protocols', 'Full Meal Plans', 'Fat Loss Habit Coaching'],
          description: '12-week comprehensive metabolic acceleration to shed body fat while preserving lean muscle tissue.'
        }
      ]
    },
    {
      id: 'trainer_004',
      name: 'Elena Rostova',
      title: 'Sports Nutritionist & Body Sculptor',
      specialization: 'Nutrition & Toning',
      category: 'nutrition',
      experience: '9+ years',
      rating: 4.95,
      reviewsCount: 156,
      activeClients: 38,
      avatarInitials: 'ER',
      avatarBg: '#0284C7',
      isAssigned: false,
      bio: 'Certified sports dietitian (CISSN) and body sculpting coach providing precision macro planning and contest preparation.',
      tags: ['Diet Plans', 'Macro Counting', 'Toning', 'Muscle Gain'],
      programmes: [
        {
          id: 'prog_er_1m',
          trainerId: 'trainer_004',
          trainerName: 'Elena Rostova',
          title: '1-Month Precision Nutrition & Body Tone Kickstart',
          category: 'Nutrition & Toning',
          duration: '1 Month',
          durationMonths: 1,
          price: 2499,
          workoutFeatures: 'Full-Body Resistance Band & Dumbbell Toning Splits',
          dietGuidance: 'Meal-by-Meal Calorie & Macro Prescriptions with Grocery Lists',
          personalization: 'Weekly Food Diary Audits & Craving Management',
          benefits: ['Customized Daily Meal Plans', 'Dietary Substitution Lists', 'Direct Dietitian Messaging'],
          description: 'Eliminate nutrition guesswork with bespoke meal plans designed for lean muscular definition and steady fat loss.'
        },
        {
          id: 'prog_er_3m',
          trainerId: 'trainer_004',
          trainerName: 'Elena Rostova',
          title: '3-Month Complete Body Recomposition & Metabolism Reset',
          category: 'Nutrition & Toning',
          duration: '3 Months',
          durationMonths: 3,
          price: 5999,
          workoutFeatures: 'Progressive Hypertrophy & Silhouette Sculpting Routine',
          dietGuidance: 'Metabolic Adaptation & Reverse Dieting Protocols',
          personalization: 'Bi-Weekly Macro Revisions Based on Body Fat Metrics',
          benefits: ['Full Meal-by-Meal Plan', 'Supplement Guidelines', 'Priority WhatsApp/Chat Support'],
          description: 'Transform your body composition sustainably with tailored nutrition periodization and targeted strength training.'
        }
      ]
    }
  ],

  /* ── 4. Active Programme (User Selected Trainer Programme) ── */
  activePlan: {
    programmeId: 'prog_am_3m',
    name: '3-Month Complete Athletic Transformation',
    trainerName: 'Coach Arjun Mehta',
    trainerId: 'trainer_001',
    trainerSpecialization: 'Strength & Conditioning',
    category: 'Strength & Conditioning',
    duration: '3 Months',
    durationMonths: 3,
    price: 4999,
    formattedPrice: '₹4,999',
    paymentStatus: 'Paid',
    status: 'Active',
    startDate: '2026-09-01',
    endDate: '2026-11-30',
    daysRemaining: 31,
    workoutCompletion: 75,
    totalWorkouts: 48,
    completedWorkouts: 36,
    workoutFeatures: '5-Day Periodized Hypertrophy & Kinetic Power Split',
    dietGuidance: 'Full Macro Cycling & Meal Plan with Bi-weekly Adjustments',
    description: 'Comprehensive 12-week athletic transformation focusing on heavy compound movements, mobility, and metabolic conditioning.'
  },

  plansList: [
    {
      id: 'plan_basic',
      name: 'Basic Access',
      tier: 'basic',
      priceMonthly: 29,
      priceYearly: 290,
      badge: 'Starter',
      description: 'Ideal for self-motivated fitness enthusiasts who want essential gym logging & standard routines.',
      features: [
        { text: 'Full Gym Floor & Equipment Access', included: true },
        { text: 'Standard Workout & Diet Templates', included: true },
        { text: 'Basic Progress Tracking Log', included: true },
        { text: 'FitTrack Community Access', included: true },
        { text: 'Dedicated 1-on-1 Assigned Trainer', included: false },
        { text: 'Customized Weekly Meal Guidance', included: false },
        { text: 'Live Video Coaching Sessions', included: false },
        { text: 'Direct Trainer Chat Support', included: false }
      ]
    },
    {
      id: 'plan_pro',
      name: 'Pro Coaching',
      tier: 'pro',
      priceMonthly: 59,
      priceYearly: 590,
      badge: 'Most Popular',
      isCurrent: true,
      description: 'Our most comprehensive plan with dedicated 1-on-1 trainer guidance, personalized diets & video sessions.',
      features: [
        { text: 'Full Gym Floor & Equipment Access', included: true },
        { text: 'Personalized Daily Workout Routines', included: true },
        { text: 'Custom Macro & Calorie Meal Plans', included: true },
        { text: 'Dedicated 1-on-1 Personal Trainer', included: true },
        { text: '2 Live 1-on-1 Video Sessions / Month', included: true },
        { text: 'Direct Unlimited Trainer Chat', included: true },
        { text: 'Advanced Body Composition Charts', included: true },
        { text: 'Bi-weekly Form & Plan Adjustments', included: true }
      ]
    },
    {
      id: 'plan_elite',
      name: 'Elite Athlete',
      tier: 'elite',
      priceMonthly: 99,
      priceYearly: 990,
      badge: 'VIP Ultimate',
      description: 'The pinnacle of personalized coaching with weekly live sessions, priority coach access & gear perks.',
      features: [
        { text: 'All Pro Coaching Features Included', included: true },
        { text: 'Unlimited 1-on-1 Video Coaching Sessions', included: true },
        { text: 'Priority 1-Hour Coach Chat Response', included: true },
        { text: 'Daily Custom Macro & Supplement Blueprint', included: true },
        { text: 'Monthly In-Body 3D Composition Scan', included: true },
        { text: 'VIP Locker Room & Spa Access', included: true },
        { text: 'Complimentary FitTrack Apparel & Shaker', included: true },
        { text: 'Access to Elite Masterclasses', included: true }
      ]
    }
  ],

  /* ── 5. Assigned Activities ── */
  assignedActivities: {
    workoutDays: [
      {
        day: 'Monday',
        title: 'Push Day (Chest, Shoulders & Triceps)',
        status: 'Completed',
        duration: '50 min',
        exercisesCount: 6,
        trainerTip: 'Keep your elbows tucked at 45 degrees during the bench press to protect the rotator cuffs.'
      },
      {
        day: 'Tuesday',
        title: 'Pull Day (Back, Lats & Biceps)',
        status: 'Completed',
        duration: '55 min',
        exercisesCount: 6,
        trainerTip: 'Engage your lats first before pulling the barbell on bent-over rows.'
      },
      {
        day: 'Wednesday',
        title: 'Legs & Core Power',
        status: 'In Progress',
        isToday: true,
        duration: '60 min',
        exercisesCount: 6,
        trainerTip: 'Focus on full depth on squats. Drive through your heels.'
      },
      {
        day: 'Thursday',
        title: 'Active Recovery & Mobility',
        status: 'Upcoming',
        duration: '35 min',
        exercisesCount: 4,
        trainerTip: 'Take time foam rolling your IT bands and hamstrings before tomorrow.'
      },
      {
        day: 'Friday',
        title: 'HIIT Conditioning & Core Burner',
        status: 'Upcoming',
        duration: '40 min',
        exercisesCount: 5,
        trainerTip: 'Keep heart rate in zone 4 during the intervals.'
      }
    ]
  },

  /* ── Today's Workout ── */
  todaysWorkout: {
    id: 'workout_016',
    title: 'Legs & Core Power',
    subtitle: 'Day 16 — Quadriceps, Hamstrings & Core Focus',
    date: 'Wednesday, September 24, 2026',
    totalExercises: 6,
    completedExercises: 3,
    estimatedDuration: '55 min',
    status: 'in_progress',
    exercises: [
      { id: 'ex_1', name: 'Barbell Back Squats', sets: 4, reps: '8-10', weight: '50 kg', rest: '90 sec', completed: true },
      { id: 'ex_2', name: 'Romanian Deadlifts (RDL)', sets: 4, reps: '10-12', weight: '40 kg', rest: '90 sec', completed: true },
      { id: 'ex_3', name: 'Bulgarian Split Squats', sets: 3, reps: '10 each leg', weight: '12 kg DBs', rest: '60 sec', completed: true },
      { id: 'ex_4', name: 'Leg Press Machine', sets: 3, reps: '12-15', weight: '90 kg', rest: '60 sec', completed: false },
      { id: 'ex_5', name: 'Hanging Leg Raises', sets: 3, reps: '15 reps', weight: 'Bodyweight', rest: '45 sec', completed: false },
      { id: 'ex_6', name: 'Plank with Shoulder Taps', sets: 3, reps: '45 sec hold', weight: 'Bodyweight', rest: '45 sec', completed: false },
    ],
  },

  /* ── Diet Plan ── */
  dietPlan: {
    date: 'September 24, 2026',
    totalCalories: '~2,150 kcal',
    macros: { protein: '135g', carbs: '210g', fats: '60g', fiber: '32g' },
    meals: [
      {
        type: 'Breakfast',
        emoji: '🌅',
        time: '7:30 AM',
        calories: '480 kcal',
        items: [
          'Rolled oats (60g) with almond milk, chia seeds & sliced banana',
          '3 boiled egg whites + 1 whole egg',
          'Unsweetened green tea with lemon',
        ],
        trainerNote: 'High complex carbs + clean protein to kickstart metabolism and glycogen stores.',
      },
      {
        type: 'Lunch',
        emoji: '☀️',
        time: '1:00 PM',
        calories: '650 kcal',
        items: [
          'Grilled cottage cheese / Paneer (150g) or chicken breast',
          'Steamed brown rice (1 cup) with turmeric',
          'Yellow lentil dal (1 bowl)',
          'Crunchy mixed green salad with olive oil dressing',
        ],
        trainerNote: 'Post-workout fuel! Ensure you drink at least 500ml water along with lunch.',
      },
      {
        type: 'Snack / Pre-Workout',
        emoji: '🥤',
        time: '4:30 PM',
        calories: '380 kcal',
        items: [
          'Whey / Plant protein isolate shake with 200ml cold water',
          'A handful of unsalted almonds & walnuts (25g)',
          '1 small green apple',
        ],
        trainerNote: 'Have this 45-60 minutes before training to maintain steady energy levels.',
      },
      {
        type: 'Dinner',
        emoji: '🌙',
        time: '8:00 PM',
        calories: '520 kcal',
        items: [
          'Tofu or paneer stir-fry with broccoli, bell peppers & zucchini',
          '2 multigrain whole wheat rotis',
          'Cucumber & mint raita (low-fat yogurt)',
        ],
        trainerNote: 'Low carb, easily digestible dinner to aid deep sleep and nighttime muscle synthesis.',
      },
    ],
  },

  /* ── Sessions ── */
  upcomingSessions: [
    {
      id: 'session_001',
      trainerName: 'Coach Arjun Mehta',
      trainerInitials: 'AM',
      date: 'September 26, 2026',
      day: 'Saturday',
      time: '6:00 PM – 7:00 PM',
      type: '1-on-1 Video Coaching',
      status: 'confirmed',
      topic: 'Squat Form Analysis & Calorie Re-assessment',
      meetingLink: 'https://meet.fittrack.com/session-am-001'
    },
    {
      id: 'session_002',
      trainerName: 'Coach Arjun Mehta',
      trainerInitials: 'AM',
      date: 'October 3, 2026',
      day: 'Saturday',
      time: '6:00 PM – 7:00 PM',
      type: '1-on-1 Video Coaching',
      status: 'upcoming',
      topic: 'Month 2 Workout Progression & Deload Week Strategy',
      meetingLink: 'https://meet.fittrack.com/session-am-002'
    },
  ],

  pastSessions: [
    {
      id: 'session_past_1',
      trainerName: 'Coach Arjun Mehta',
      trainerInitials: 'AM',
      date: 'September 12, 2026',
      type: 'Initial Goal Alignment & Fitness Baseline',
      status: 'completed',
      trainerFeedback: 'Ishwari displayed great mobility and motivation. Set baseline target to 58kg with progressive strength overload.'
    },
    {
      id: 'session_past_2',
      trainerName: 'Coach Arjun Mehta',
      trainerInitials: 'AM',
      date: 'August 28, 2026',
      type: 'Diet & Nutrition Blueprint Walkthrough',
      status: 'completed',
      trainerFeedback: 'Reviewed macros and meal timing. Adjusted protein intake to 135g daily.'
    }
  ],

  /* ── Progress Data ── */
  progressData: {
    currentWeight: 64.5,
    startWeight: 68.0,
    targetWeight: 58.0,
    currentBodyFat: 22.4,
    startBodyFat: 26.5,
    weightLogs: [
      { date: 'Aug 15', weight: 68.0, bodyFat: 26.5, workouts: 4, notes: 'Baseline measurement at start of plan' },
      { date: 'Aug 22', weight: 67.2, bodyFat: 25.8, workouts: 5, notes: 'Felt strong, sticking to breakfast plan' },
      { date: 'Aug 29', weight: 66.4, bodyFat: 25.0, workouts: 5, notes: 'Broke below 67kg mark! Increased water intake' },
      { date: 'Sep 05', weight: 65.7, bodyFat: 24.1, workouts: 4, notes: 'Solid bench press improvements' },
      { date: 'Sep 12', weight: 65.1, bodyFat: 23.2, workouts: 5, notes: 'Great recovery week, feeling energetic' },
      { date: 'Sep 19', weight: 64.7, bodyFat: 22.8, workouts: 5, notes: 'Leg day numbers moving up consistently' },
      { date: 'Sep 24', weight: 64.5, bodyFat: 22.4, workouts: 3, notes: 'Down 3.5 kg total! Core definition visible' }
    ],
    chartData: [68.0, 67.2, 66.4, 65.7, 65.1, 64.7, 64.5],
    chartLabels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'Current'],
    recentHistory: [
      { date: 'Sep 24', text: 'Completed Legs & Core workout (3/6 exercises so far)', type: 'workout' },
      { date: 'Sep 23', text: 'Logged daily weight: 64.5 kg (down 0.2 kg from weekend)', type: 'weight' },
      { date: 'Sep 22', text: 'Completed Pull Day workout — 6/6 exercises finished', type: 'workout' },
      { date: 'Sep 21', text: 'Completed Push Day workout — Hit 45kg bench press', type: 'workout' },
      { date: 'Sep 20', text: 'Rest day — 30 min stretching and yoga session logged', type: 'rest' },
    ],
  },

  /* ── Chat Messages (User side) ── */
  chatMessages: [
    { id: 'msg_1', sender: 'trainer', senderName: 'Coach Arjun', time: 'Sep 22, 10:15 AM', text: 'Hey Ishwari! How did Monday’s Push session feel? Any tightness in your shoulders?', avatar: 'AM', read: true },
    { id: 'msg_2', sender: 'user', senderName: 'Ishwari', time: 'Sep 22, 10:30 AM', text: 'Hey Coach! Push session was great. The 45-degree bench press angle really took the pressure off my shoulder. Hit 45kg for 8 reps!', avatar: 'IN', read: true },
    { id: 'msg_3', sender: 'trainer', senderName: 'Coach Arjun', time: 'Sep 22, 10:35 AM', text: 'Superb milestone! 🔥 Today is Legs & Core. Don’t skip Bulgarian split squats, they make a massive difference in quad balance. Let me know how it goes!', avatar: 'AM', read: true },
    { id: 'msg_4', sender: 'user', senderName: 'Ishwari', time: 'Sep 23, 7:15 PM', text: 'Will do! Also, I logged my weight this morning — 64.5kg. Progressing steadily towards the 58kg goal.', avatar: 'IN', read: true },
    { id: 'msg_5', sender: 'trainer', senderName: 'Coach Arjun', time: 'Sep 23, 7:30 PM', text: 'Outstanding consistency! 3.5kg down with zero muscle loss. We will review your squat video in our Saturday 6 PM video session.', avatar: 'AM', read: false }
  ],

  /* ── Trainer Reviews ── */
  trainerReviews: [
    {
      id: 'rev_1',
      trainerId: 'trainer_001',
      trainerName: 'Coach Arjun Mehta',
      authorName: 'Ishwari Nikam',
      authorInitials: 'IN',
      rating: 5,
      date: 'September 15, 2026',
      tag: 'Form & Hypertrophy',
      comment: 'Coach Arjun is phenomenal! His form corrections completely eliminated my shoulder pain, and the customized workout progression pushed me to achieve personal bests every week.'
    },
    {
      id: 'rev_2',
      trainerId: 'trainer_001',
      trainerName: 'Coach Arjun Mehta',
      authorName: 'Rohan Deshmukh',
      authorInitials: 'RD',
      rating: 5,
      date: 'September 10, 2026',
      tag: 'Strength & Conditioning',
      comment: 'Best trainer I have had. Very analytical with macro breakdowns and always responds promptly to chat questions. Highly recommend the Pro plan!'
    },
    {
      id: 'rev_3',
      trainerId: 'trainer_002',
      trainerName: 'Dr. Priya Sharma',
      authorName: 'Ananya Verma',
      authorInitials: 'AV',
      rating: 5,
      date: 'September 08, 2026',
      tag: 'Yoga & Flexibility',
      comment: 'Dr. Priya helped me recover from chronic back stiffness with her tailored mobility routines. My flexibility has doubled in 6 weeks.'
    },
    {
      id: 'rev_4',
      trainerId: 'trainer_003',
      trainerName: 'Marcus Vance',
      authorName: 'Vikram Seth',
      authorInitials: 'VS',
      rating: 5,
      date: 'September 01, 2026',
      tag: 'Fat Loss & HIIT',
      comment: 'Insane energy and workouts! Dropped 8 kg in 2 months with Marcus’s HIIT circuits and metabolic conditioning.'
    }
  ],

  /* ── 12. User System Notifications ── */
  notifications: [
    {
      id: 'notif_001',
      type: 'workout',
      title: 'Workout Scheduled Today',
      message: 'Legs & Core Power routine is queued for today. 6 exercises ready.',
      text: 'Legs & Core Power routine is queued for today. 6 exercises ready.',
      time: '2 hours ago',
      read: false,
      actionView: 'activities'
    },
    {
      id: 'notif_002',
      type: 'session',
      title: 'Session Reminder',
      message: '1-on-1 Video Coaching Session with Coach Arjun Mehta Today at 6:00 PM.',
      text: '1-on-1 Video Coaching Session with Coach Arjun Mehta Today at 6:00 PM.',
      time: '4 hours ago',
      read: false,
      actionView: 'sessions'
    },
    {
      id: 'notif_003',
      type: 'plan',
      title: 'Diet Plan Updated',
      message: 'Coach Arjun adjusted your daily protein goal to 135g with rest-day adjustments.',
      text: 'Coach Arjun adjusted your daily protein goal to 135g with rest-day adjustments.',
      time: '1 day ago',
      read: true,
      actionView: 'activities'
    },
    {
      id: 'notif_004',
      type: 'message',
      title: 'New Message from Coach Arjun',
      message: '"Great job on yesterday\'s squats! Form was solid."',
      text: '"Great job on yesterday\'s squats! Form was solid."',
      time: '2 days ago',
      read: true,
      actionView: 'messages'
    }
  ],

  /* ══════════════════════════════════════════════
     TRAINER DATA & ALL 14 TRAINER FEATURES
     ══════════════════════════════════════════════ */

  /* ── 1. Trainer Profile & Qualifications ── */
  trainerProfile: {
    id: 'trainer_001',
    name: 'Coach',
    fullName: 'FitTrack Coach',
    email: 'coach@fittrack.com',
    phone: '+91 98111 22334',
    city: 'Mumbai, India',
    avatarInitials: 'TC',
    title: 'Senior Fitness & Performance Coach',
    experienceYears: 8,
    ratePerHour: 45,
    rating: 4.8,
    reviewsCount: 142,
    activeClientsCount: 24,
    publishedPlansCount: 6,
    upcomingSessionsCount: 5,
    pendingActivitiesCount: 12,
    unreadMessagesCount: 8,
    verifiedStatus: 'Verified & Certified by FitTrack Pro',
    verificationBadge: 'Verified Master Coach',
    trainingStyle: 'Functional Hypertrophy, Scientific Periodization & High-Adherence Habit Coaching',
    availableTimings: 'Mon – Sat: 07:00 AM – 08:00 PM IST',
    bio: 'Certified strength & sports conditioning specialist with 8+ years coaching 400+ clients to transformative strength, fat loss, and athletic mobility without burnout.',
    specialties: ['Strength & Hypertrophy', 'Body Recomposition', 'Biomechanics & Form Audits', 'Sports Nutrition Planning', 'Injury Prevention'],
    qualifications: [
      { id: 'q1', name: 'NSCA Certified Strength & Conditioning Specialist (CSCS)', issuer: 'NSCA USA', year: '2019', status: 'Verified', documentUrl: 'certificate_nsca_cscs.pdf' },
      { id: 'q2', name: 'Master Personal Trainer Diploma', issuer: 'ISSA International', year: '2018', status: 'Verified', documentUrl: 'certificate_issa_master.pdf' },
      { id: 'q3', name: 'Advanced Clinical Sports Nutrition Specialist', issuer: 'ACE Fitness', year: '2021', status: 'Verified', documentUrl: 'certificate_ace_nutrition.pdf' },
      { id: 'q4', name: 'Functional Movement Screen (FMS Level 2)', issuer: 'FMS Global', year: '2023', status: 'Verified', documentUrl: 'certificate_fms_level2.pdf' },
      { id: 'q5', name: 'CPR / AED & First Aid Emergency Lifesaver', issuer: 'Red Cross', year: '2025', status: 'Verified', documentUrl: 'certificate_redcross_cpr.pdf' },
      { id: 'q6', name: 'B.Sc. Exercise & Sports Science', issuer: 'Mumbai University', year: '2017', status: 'Verified', documentUrl: 'degree_bsc_sports.pdf' }
    ]
  },

  /* ── 2. Trainer Availability Schedule ── */
  trainerAvailability: {
    timezone: 'Asia/Kolkata (GMT+5:30)',
    sessionDuration: '60 minutes',
    breakTime: '15 minutes buffer',
    maxSessionsPerDay: 8,
    maxClientsCapacity: 30,
    currentClientsCount: 24,
    days: [
      { day: 'Monday', enabled: true, start: '07:00 AM', end: '08:00 PM', slots: ['07:00 AM', '09:00 AM', '11:30 AM', '04:00 PM', '06:00 PM', '07:00 PM'] },
      { day: 'Tuesday', enabled: true, start: '07:00 AM', end: '08:00 PM', slots: ['07:00 AM', '09:00 AM', '11:30 AM', '04:00 PM', '06:00 PM', '07:00 PM'] },
      { day: 'Wednesday', enabled: true, start: '07:00 AM', end: '08:00 PM', slots: ['07:00 AM', '09:00 AM', '11:30 AM', '04:00 PM', '06:00 PM', '07:00 PM'] },
      { day: 'Thursday', enabled: true, start: '07:00 AM', end: '08:00 PM', slots: ['07:00 AM', '09:00 AM', '11:30 AM', '04:00 PM', '06:00 PM', '07:00 PM'] },
      { day: 'Friday', enabled: true, start: '07:00 AM', end: '08:00 PM', slots: ['07:00 AM', '09:00 AM', '11:30 AM', '04:00 PM', '06:00 PM', '07:00 PM'] },
      { day: 'Saturday', enabled: true, start: '08:00 AM', end: '06:00 PM', slots: ['08:00 AM', '10:00 AM', '02:00 PM', '04:00 PM', '05:00 PM'] },
      { day: 'Sunday', enabled: false, start: 'Closed (Rest & Recovery)', end: 'Closed', slots: [] }
    ]
  },

  /* ── 3. Trainer Published Duration-Based Programmes ── */
  trainerPublishedPlans: [
    {
      id: 'tp_001',
      title: '1-Month Strength & Hypertrophy Foundation',
      category: 'Strength & Conditioning',
      price: 1999,
      formattedPrice: '₹1,999',
      duration: '1 Month',
      durationMonths: 1,
      enrolledCount: 14,
      status: 'Published',
      publishedDate: 'Sep 01, 2026',
      rating: 4.95,
      workoutFeatures: '4-Day Split (Push/Pull/Legs/Upper), Exercise Video Form Analysis',
      dietGuidance: 'High-Protein Macro Breakdown & Nutrition Guidance',
      personalization: 'Weekly Volume & Load Adjustments',
      benefits: ['Direct Trainer Messaging', 'Personalized Workout Plan', 'Custom Diet Targets'],
      description: 'A 1-month structured hypertrophy foundation programme designed to build lean muscle mass with progressive overload.'
    },
    {
      id: 'tp_002',
      title: '3-Month Complete Athletic Transformation',
      category: 'Strength & Conditioning',
      price: 4999,
      formattedPrice: '₹4,999',
      duration: '3 Months',
      durationMonths: 3,
      enrolledCount: 6,
      status: 'Published',
      publishedDate: 'Aug 15, 2026',
      rating: 4.9,
      workoutFeatures: '5-Day Periodized Hypertrophy & Kinetic Power Split',
      dietGuidance: 'Full Macro Cycling & Meal Plan with Bi-weekly Adjustments',
      personalization: 'Bi-weekly Strength & Body Composition Audits',
      benefits: ['Priority Chat Support', 'Video Form Corrections', 'Full Nutrition Blueprint', 'Milestone Assessments'],
      description: 'Comprehensive 12-week athletic transformation focusing on heavy compound movements, mobility, and metabolic conditioning.'
    },
    {
      id: 'tp_003',
      title: '6-Month Elite Body Recomposition Masterclass',
      category: 'Strength & Conditioning',
      price: 8999,
      formattedPrice: '₹8,999',
      duration: '6 Months',
      durationMonths: 6,
      enrolledCount: 4,
      status: 'Published',
      publishedDate: 'Aug 20, 2026',
      rating: 5.0,
      workoutFeatures: '3-Phase Periodization: Base, Peak Strength, Cut & Define',
      dietGuidance: 'Custom Competition-Grade Diet Revisions & Supplement Guide',
      personalization: 'Monthly Biometrics Review & Continuous Progression Mapping',
      benefits: ['Unlimited Messaging Access', 'Personalized Routine & Diet', 'Plateau-Busting Strategies', 'Progress Logs Audit'],
      description: 'A 6-month transformational journey for serious lifters seeking significant muscle gain, fat loss, and strength PRs.'
    },
    {
      id: 'tp_004',
      title: '12-Month Total Fitness & Longevity Protocol',
      category: 'General Fitness',
      price: 14999,
      formattedPrice: '₹14,999',
      duration: '12 Months',
      durationMonths: 12,
      enrolledCount: 2,
      status: 'Published',
      publishedDate: 'Sep 22, 2026',
      rating: 4.85,
      workoutFeatures: 'Year-Round Progressive Periodization with Deload Cycles',
      dietGuidance: 'Sustainable Long-Term Nutritional Lifestyle Coaching',
      personalization: 'Quarterly Body Recomposition & Performance Goal Setting',
      benefits: ['Full 365-Day Dedicated Coaching', 'VIP WhatsApp Access', 'Comprehensive Diet Strategy', 'Form Audits Anytime'],
      description: 'Complete 1-year transformation and lifestyle mastery to build lasting habits, strength, and health.'
    }
  ],

  /* ── 4. Active Clients Roster (24 Total Enrolled) ── */
  activeClients: [
    {
      id: 'client_001',
      name: 'Aarav Sharma',
      initials: 'AS',
      avatarBg: '#2563EB',
      plan: 'Pro Coaching Plan',
      goal: 'Weight Management & Muscle Tone',
      goalCategory: 'weight',
      currentWeight: '74.2 kg (Started 79.5 kg)',
      targetWeight: '70.0 kg',
      workoutCompletion: 82,
      dietAdherence: 76,
      sessionAttendance: 90,
      overallProgress: 81,
      lastActivity: 'Today, 08:30 AM (Logged 45 min Cardio)',
      nextSession: 'Thu, Sep 24 · 05:00 PM',
      status: 'Active',
      statusClass: 'emerald',
      email: 'aarav.sharma@example.com',
      phone: '+91 98201 12345',
      joinDate: '15 Jan 2026'
    },
    {
      id: 'client_002',
      name: 'Ishwari Nikam',
      initials: 'IN',
      avatarBg: '#059669',
      plan: 'Pro Coaching Plan',
      goal: 'Lose 6.5kg & Upper Body Definition',
      goalCategory: 'weight',
      currentWeight: '64.5 kg (Started 68.0 kg)',
      targetWeight: '58.0 kg',
      workoutCompletion: 92,
      dietAdherence: 88,
      sessionAttendance: 100,
      overallProgress: 88,
      lastActivity: 'Today, 10:15 AM (Logged Legs & Core)',
      nextSession: 'Sat, Sep 26 · 06:00 PM',
      status: 'Active',
      statusClass: 'emerald',
      email: 'ishwari.nikam@email.com',
      phone: '+91 98333 44556',
      joinDate: '01 Feb 2026'
    },
    {
      id: 'client_003',
      name: 'Priya Patel',
      initials: 'PP',
      avatarBg: '#7C3AED',
      plan: 'Elite Athlete Plan',
      goal: 'Half-Marathon & Core Endurance',
      goalCategory: 'endurance',
      currentWeight: '56.0 kg (Started 58.5 kg)',
      targetWeight: '54.0 kg',
      workoutCompletion: 96,
      dietAdherence: 94,
      sessionAttendance: 100,
      overallProgress: 95,
      lastActivity: 'Yesterday (Completed 10k Tempo Run)',
      nextSession: 'Fri, Sep 25 · 08:00 AM',
      status: 'Active',
      statusClass: 'emerald',
      email: 'priya.patel@example.com',
      phone: '+91 98111 55667',
      joinDate: '10 Nov 2025'
    },
    {
      id: 'client_004',
      name: 'Rohan Verma',
      initials: 'RV',
      avatarBg: '#D97706',
      plan: 'Pro Coaching Plan',
      goal: 'Hypertrophy & 100kg Bench Press',
      goalCategory: 'hypertrophy',
      currentWeight: '81.4 kg (Started 76.0 kg)',
      targetWeight: '85.0 kg Lean',
      workoutCompletion: 88,
      dietAdherence: 82,
      sessionAttendance: 85,
      overallProgress: 86,
      lastActivity: 'Yesterday (Logged Heavy Push Day)',
      nextSession: 'Fri, Sep 25 · 06:00 PM',
      status: 'Active',
      statusClass: 'emerald',
      email: 'rohan.verma@example.com',
      phone: '+91 98450 66778',
      joinDate: '20 Dec 2025'
    },
    {
      id: 'client_005',
      name: 'Vikram Seth',
      initials: 'VS',
      avatarBg: '#EA580C',
      plan: 'Pro Coaching Plan',
      goal: 'Fat Loss (Target -10kg)',
      goalCategory: 'weight',
      currentWeight: '88.5 kg (Started 94.0 kg)',
      targetWeight: '84.0 kg',
      workoutCompletion: 68,
      dietAdherence: 70,
      sessionAttendance: 75,
      overallProgress: 71,
      lastActivity: '3 days ago (Logged Travel Workout)',
      nextSession: 'Mon, Sep 28 · 07:00 PM',
      status: 'Active',
      statusClass: 'emerald',
      email: 'vikram.seth@example.com',
      phone: '+91 98670 77889',
      joinDate: '05 Mar 2026'
    },
    {
      id: 'client_006',
      name: 'Ananya Deshmukh',
      initials: 'AD',
      avatarBg: '#0891B2',
      plan: 'Starter Access',
      goal: 'Postural Rehabilitation & Mobility',
      goalCategory: 'endurance',
      currentWeight: '61.0 kg',
      targetWeight: '59.0 kg',
      workoutCompletion: 74,
      dietAdherence: 80,
      sessionAttendance: 80,
      overallProgress: 78,
      lastActivity: '2 days ago (Logged Spine Mobility)',
      nextSession: 'Sat, Sep 26 · 10:00 AM',
      status: 'Active',
      statusClass: 'emerald',
      email: 'ananya.d@example.com',
      phone: '+91 98765 88990',
      joinDate: '12 Feb 2026'
    },
    {
      id: 'client_007',
      name: 'Sameer Joshi',
      initials: 'SJ',
      avatarBg: '#4F46E5',
      plan: 'Elite Athlete Plan',
      goal: 'Triathlon Preparation & VO2 Max',
      goalCategory: 'endurance',
      currentWeight: '72.0 kg (Started 70.5 kg)',
      targetWeight: '70.5 kg',
      workoutCompletion: 94,
      dietAdherence: 90,
      sessionAttendance: 95,
      overallProgress: 92,
      lastActivity: 'Today, 07:00 AM (Logged 25km Cycle)',
      nextSession: 'Tue, Sep 29 · 06:30 AM',
      status: 'Active',
      statusClass: 'emerald',
      email: 'sameer.j@example.com',
      phone: '+91 98123 45678',
      joinDate: '18 Jan 2026'
    },
    {
      id: 'client_008',
      name: 'Meera Nair',
      initials: 'MN',
      avatarBg: '#DB2777',
      plan: 'Pro Coaching Plan',
      goal: 'Postpartum Core & Pelvic Strength',
      goalCategory: 'endurance',
      currentWeight: '66.2 kg (Started 68.0 kg)',
      targetWeight: '60.0 kg',
      workoutCompletion: 85,
      dietAdherence: 84,
      sessionAttendance: 90,
      overallProgress: 84,
      lastActivity: 'Yesterday (Logged Diastasis Core Protocol)',
      nextSession: 'Wed, Sep 30 · 11:00 AM',
      status: 'Active',
      statusClass: 'emerald',
      email: 'meera.nair@example.com',
      phone: '+91 98234 56789',
      joinDate: '01 Mar 2026'
    },
    {
      id: 'client_009',
      name: 'Kabir Mehta',
      initials: 'KM',
      avatarBg: '#0D9488',
      plan: 'Pro Coaching Plan',
      goal: 'Athletic Conditioning & Vertical Jump',
      goalCategory: 'hypertrophy',
      currentWeight: '77.8 kg',
      targetWeight: '78.0 kg Athletic',
      workoutCompletion: 80,
      dietAdherence: 75,
      sessionAttendance: 85,
      overallProgress: 79,
      lastActivity: 'Today, 11:00 AM (Logged Plyometrics)',
      nextSession: 'Thu, Oct 01 · 04:00 PM',
      status: 'Active',
      statusClass: 'emerald',
      email: 'kabir.m@example.com',
      phone: '+91 98345 67890',
      joinDate: '10 Feb 2026'
    },
    {
      id: 'client_010',
      name: 'Neha Sen',
      initials: 'NS',
      avatarBg: '#9333EA',
      plan: 'Starter Access',
      goal: 'Flexibility & Stress Relief Yoga',
      goalCategory: 'endurance',
      currentWeight: '58.0 kg',
      targetWeight: '55.0 kg',
      workoutCompletion: 70,
      dietAdherence: 65,
      sessionAttendance: 75,
      overallProgress: 68,
      lastActivity: '4 days ago (Logged Vinyasa Flow)',
      nextSession: 'Fri, Oct 02 · 09:00 AM',
      status: 'Active',
      statusClass: 'emerald',
      email: 'neha.sen@example.com',
      phone: '+91 98456 78901',
      joinDate: '25 Feb 2026'
    },
    {
      id: 'client_011',
      name: 'Aditya Rao',
      initials: 'AR',
      avatarBg: '#16A34A',
      plan: 'Elite Athlete Plan',
      goal: 'Marathon Sub-3hr Conditioning',
      goalCategory: 'endurance',
      currentWeight: '68.0 kg',
      targetWeight: '67.0 kg',
      workoutCompletion: 98,
      dietAdherence: 92,
      sessionAttendance: 100,
      overallProgress: 96,
      lastActivity: 'Today, 06:00 AM (Completed 16k Interval Run)',
      nextSession: 'Sat, Oct 03 · 07:00 AM',
      status: 'Active',
      statusClass: 'emerald',
      email: 'aditya.rao@example.com',
      phone: '+91 98567 89012',
      joinDate: '05 Jan 2026'
    },
    {
      id: 'client_012',
      name: 'Tanya Kapoor',
      initials: 'TK',
      avatarBg: '#C026D3',
      plan: 'Pro Coaching Plan',
      goal: 'Glute Hypertrophy & Waist Tapering',
      goalCategory: 'hypertrophy',
      currentWeight: '62.4 kg (Started 64.0 kg)',
      targetWeight: '59.0 kg',
      workoutCompletion: 86,
      dietAdherence: 82,
      sessionAttendance: 90,
      overallProgress: 85,
      lastActivity: 'Yesterday (Logged Lower Body & Hip Thrusts)',
      nextSession: 'Mon, Oct 05 · 05:30 PM',
      status: 'Active',
      statusClass: 'emerald',
      email: 'tanya.k@example.com',
      phone: '+91 98678 90123',
      joinDate: '14 Feb 2026'
    },
    {
      id: 'client_013',
      name: 'Siddharth Gupta',
      initials: 'SG',
      avatarBg: '#2563EB',
      plan: 'Pro Coaching Plan',
      goal: 'Lean Bulk & Shoulder Symmetry',
      goalCategory: 'hypertrophy',
      currentWeight: '79.0 kg (Started 75.0 kg)',
      targetWeight: '83.0 kg',
      workoutCompletion: 78,
      dietAdherence: 80,
      sessionAttendance: 80,
      overallProgress: 79,
      lastActivity: '2 days ago (Logged Lateral Raises & OHP)',
      nextSession: 'Tue, Oct 06 · 06:00 PM',
      status: 'Active',
      statusClass: 'emerald',
      email: 'sid.gupta@example.com',
      phone: '+91 98789 01234',
      joinDate: '02 Feb 2026'
    },
    {
      id: 'client_014',
      name: 'Pooja Hegde',
      initials: 'PH',
      avatarBg: '#E11D48',
      plan: 'Starter Access',
      goal: 'Beginner Dumbbell Home Workouts',
      goalCategory: 'weight',
      currentWeight: '69.5 kg',
      targetWeight: '63.0 kg',
      workoutCompletion: 72,
      dietAdherence: 68,
      sessionAttendance: 70,
      overallProgress: 70,
      lastActivity: '3 days ago (Logged Full Body Circuit)',
      nextSession: 'Wed, Oct 07 · 05:00 PM',
      status: 'Active',
      statusClass: 'emerald',
      email: 'pooja.h@example.com',
      phone: '+91 98890 12345',
      joinDate: '28 Feb 2026'
    },
    {
      id: 'client_015',
      name: 'Devendra Yadav',
      initials: 'DY',
      avatarBg: '#65A30D',
      plan: 'Elite Athlete Plan',
      goal: 'Olympic Weightlifting Snatch / C&J',
      goalCategory: 'hypertrophy',
      currentWeight: '85.0 kg',
      targetWeight: '85.0 kg',
      workoutCompletion: 90,
      dietAdherence: 88,
      sessionAttendance: 95,
      overallProgress: 91,
      lastActivity: 'Today, 09:30 AM (Logged Snatch Complex)',
      nextSession: 'Thu, Oct 08 · 07:00 PM',
      status: 'Active',
      statusClass: 'emerald',
      email: 'dev.yadav@example.com',
      phone: '+91 98901 23456',
      joinDate: '10 Jan 2026'
    },
    {
      id: 'client_016',
      name: 'Sunita Chawla',
      initials: 'SC',
      avatarBg: '#0284C7',
      plan: 'Pro Coaching Plan',
      goal: 'Metabolic Health & Glucose Balance',
      goalCategory: 'weight',
      currentWeight: '76.2 kg (Started 80.0 kg)',
      targetWeight: '68.0 kg',
      workoutCompletion: 84,
      dietAdherence: 85,
      sessionAttendance: 90,
      overallProgress: 84,
      lastActivity: 'Yesterday (Logged 40 min Low Impact Walk)',
      nextSession: 'Fri, Oct 09 · 10:30 AM',
      status: 'Active',
      statusClass: 'emerald',
      email: 'sunita.c@example.com',
      phone: '+91 98012 34567',
      joinDate: '16 Jan 2026'
    },
    {
      id: 'client_017',
      name: 'Nikhil Bajaj',
      initials: 'NB',
      avatarBg: '#4B5563',
      plan: 'Pro Coaching Plan',
      goal: 'Desk Deconditioning & Core Activation',
      goalCategory: 'endurance',
      currentWeight: '83.0 kg',
      targetWeight: '76.0 kg',
      workoutCompletion: 62,
      dietAdherence: 60,
      sessionAttendance: 65,
      overallProgress: 61,
      lastActivity: '5 days ago (Logged Desk Stretches)',
      nextSession: 'Sat, Oct 10 · 04:00 PM',
      status: 'Active',
      statusClass: 'emerald',
      email: 'nikhil.b@example.com',
      phone: '+91 98123 98765',
      joinDate: '20 Feb 2026'
    },
    {
      id: 'client_018',
      name: 'Ritu Singhania',
      initials: 'RS',
      avatarBg: '#059669',
      plan: 'Pro Coaching Plan',
      goal: 'Functional Strength & Kettlebell Flow',
      goalCategory: 'hypertrophy',
      currentWeight: '57.5 kg (Started 60.0 kg)',
      targetWeight: '55.0 kg',
      workoutCompletion: 88,
      dietAdherence: 84,
      sessionAttendance: 90,
      overallProgress: 86,
      lastActivity: 'Today, 08:00 AM (Logged 16kg Kettlebell Swings)',
      nextSession: 'Mon, Oct 12 · 06:00 PM',
      status: 'Active',
      statusClass: 'emerald',
      email: 'ritu.s@example.com',
      phone: '+91 98234 87654',
      joinDate: '11 Feb 2026'
    },
    {
      id: 'client_019',
      name: 'Aryan Kulkarni',
      initials: 'AK',
      avatarBg: '#F59E0B',
      plan: 'Starter Access',
      goal: 'Teen Athletic Agility & Speed',
      goalCategory: 'endurance',
      currentWeight: '65.0 kg',
      targetWeight: '68.0 kg',
      workoutCompletion: 0,
      dietAdherence: 0,
      sessionAttendance: 0,
      overallProgress: 10,
      lastActivity: 'Registration pending confirmation',
      nextSession: 'Consultation Awaited',
      status: 'Pending',
      statusClass: 'amber',
      email: 'aryan.k@example.com',
      phone: '+91 98345 76543',
      joinDate: '26 Sep 2026'
    },
    {
      id: 'client_020',
      name: 'Divya Menon',
      initials: 'DM',
      avatarBg: '#F59E0B',
      plan: 'Pro Coaching Plan',
      goal: 'Bridal Fitness & Body Toning',
      goalCategory: 'weight',
      currentWeight: '59.0 kg',
      targetWeight: '54.0 kg',
      workoutCompletion: 0,
      dietAdherence: 0,
      sessionAttendance: 0,
      overallProgress: 5,
      lastActivity: 'Intake form submitted',
      nextSession: 'Onboarding Call · Sep 29',
      status: 'Pending',
      statusClass: 'amber',
      email: 'divya.m@example.com',
      phone: '+91 98456 65432',
      joinDate: '25 Sep 2026'
    },
    {
      id: 'client_021',
      name: 'Gaurav Bhatia',
      initials: 'GB',
      avatarBg: '#F59E0B',
      plan: 'Elite Athlete Plan',
      goal: 'Football Pre-Season Conditioning',
      goalCategory: 'hypertrophy',
      currentWeight: '73.0 kg',
      targetWeight: '75.0 kg',
      workoutCompletion: 0,
      dietAdherence: 0,
      sessionAttendance: 0,
      overallProgress: 8,
      lastActivity: 'Payment verified',
      nextSession: 'Initial Assessment · Sep 30',
      status: 'Pending',
      statusClass: 'amber',
      email: 'gaurav.b@example.com',
      phone: '+91 98567 54321',
      joinDate: '24 Sep 2026'
    },
    {
      id: 'client_022',
      name: 'Natasha Roy',
      initials: 'NR',
      avatarBg: '#F59E0B',
      plan: 'Starter Access',
      goal: 'Post-Knee ACL Surgery Rehab',
      goalCategory: 'endurance',
      currentWeight: '63.0 kg',
      targetWeight: '62.0 kg',
      workoutCompletion: 0,
      dietAdherence: 0,
      sessionAttendance: 0,
      overallProgress: 15,
      lastActivity: 'Medical clearance uploaded',
      nextSession: 'Physio Review · Oct 01',
      status: 'Pending',
      statusClass: 'amber',
      email: 'natasha.r@example.com',
      phone: '+91 98678 43210',
      joinDate: '23 Sep 2026'
    },
    {
      id: 'client_023',
      name: 'Kunal Khanna',
      initials: 'KK',
      avatarBg: '#6B7280',
      plan: 'Pro Coaching Plan',
      goal: 'Muscle Gain (Paused for Work Travel)',
      goalCategory: 'hypertrophy',
      currentWeight: '80.0 kg',
      targetWeight: '82.0 kg',
      workoutCompletion: 45,
      dietAdherence: 50,
      sessionAttendance: 40,
      overallProgress: 48,
      lastActivity: '2 weeks ago (Logged Hotel Workout)',
      nextSession: 'Membership Paused',
      status: 'Inactive',
      statusClass: 'gray',
      email: 'kunal.k@example.com',
      phone: '+91 98789 32109',
      joinDate: '01 Nov 2025'
    },
    {
      id: 'client_024',
      name: 'Shreya Bansal',
      initials: 'SB',
      avatarBg: '#6B7280',
      plan: 'Starter Access',
      goal: 'Posture & Mobility (Renewal Pending)',
      goalCategory: 'endurance',
      currentWeight: '55.0 kg',
      targetWeight: '53.0 kg',
      workoutCompletion: 52,
      dietAdherence: 55,
      sessionAttendance: 50,
      overallProgress: 53,
      lastActivity: '3 weeks ago (Logged Yoga Flow)',
      nextSession: 'Subscription Expired',
      status: 'Inactive',
      statusClass: 'gray',
      email: 'shreya.b@example.com',
      phone: '+91 98890 21098',
      joinDate: '15 Oct 2025'
    }
  ],

  /* ── 5. Assigned Activities Log ── */
  assignedActivitiesList: [
    {
      id: 'act_001',
      clientName: 'Aarav Sharma',
      activityName: 'Full Body Push & High-Density HIIT',
      type: 'Strength Training',
      date: 'Today, Sep 24, 2026',
      time: '07:00 AM',
      duration: '50 min',
      frequency: '4x per week',
      instructions: 'Keep heart rate in zone 4. Focus on controlled eccentric tempo on dumbbell presses.',
      status: 'In Progress',
      completion: 60
    },
    {
      id: 'act_002',
      clientName: 'Ishwari Nikam',
      activityName: 'Legs & Core Power (Squats + RDLs)',
      type: 'Workout',
      date: 'Today, Sep 24, 2026',
      time: '06:00 PM',
      duration: '55 min',
      frequency: '5x per week',
      instructions: '4 sets of Barbell Back Squats at 50kg, Bulgarian split squats with 12kg dumbbells.',
      status: 'In Progress',
      completion: 50
    },
    {
      id: 'act_003',
      clientName: 'Priya Patel',
      activityName: '12km Aerobic Zone 2 Base Run',
      type: 'Cardio',
      date: 'Tomorrow, Sep 25, 2026',
      time: '06:30 AM',
      duration: '65 min',
      frequency: '3x per week',
      instructions: 'Maintain nasal breathing at 135-145 bpm. Hydrate with electrolytes every 20 min.',
      status: 'Pending',
      completion: 0
    },
    {
      id: 'act_004',
      clientName: 'Rohan Verma',
      activityName: 'High Protein Macro Blueprint (2,800 kcal)',
      type: 'Diet',
      date: 'Daily Schedule',
      time: 'All Day',
      duration: 'Continuous',
      frequency: 'Daily',
      instructions: 'Target 180g protein, 340g carbs, 75g healthy fats. Consume 4L water daily.',
      status: 'Completed Today',
      completion: 100
    },
    {
      id: 'act_005',
      clientName: 'Vikram Seth',
      activityName: 'Hotel Room Bodyweight & Mobility Circuit',
      type: 'Recovery',
      date: 'Sep 23, 2026',
      time: '08:00 PM',
      duration: '30 min',
      frequency: '3x per week',
      instructions: 'Perform 4 rounds of push-ups, air squats, lunges, and 2-min hip openers.',
      status: 'Completed',
      completion: 100
    }
  ],

  /* ── 6. Client Progress Reviews & Feedback ── */
  clientProgressReviews: [
    {
      id: 'rev_cli_1',
      clientName: 'Aarav Sharma',
      clientInitials: 'AS',
      date: 'Sep 24, 2026',
      weightChange: '-5.3 kg Total',
      compliance: '82% adherence',
      loggedEntry: 'Logged morning cardio and push routine. Completed 3 of 4 planned sets.',
      coachStatus: 'Reviewed & Approved',
      coachNote: 'Excellent dedication Aarav! Increase protein intake by 15g to accelerate recovery.'
    },
    {
      id: 'rev_cli_2',
      clientName: 'Ishwari Nikam',
      clientInitials: 'IN',
      date: 'Sep 24, 2026',
      weightChange: '-3.5 kg Total',
      compliance: '92% adherence',
      loggedEntry: 'Legs & Core finished (3/6 sets). Squat form video submitted for review.',
      coachStatus: 'Reviewed & Approved',
      coachNote: 'Great knee tracking and bar path! Advised adding 2.5kg to back squat next week.'
    },
    {
      id: 'rev_cli_3',
      clientName: 'Rohan Verma',
      clientInitials: 'RV',
      date: 'Sep 23, 2026',
      weightChange: '+5.4 kg Lean Muscle',
      compliance: '88% adherence',
      loggedEntry: 'Hit 95kg bench press for 4 reps. Left tricep feeling slightly fatigued.',
      coachStatus: 'Reviewed & Approved',
      coachNote: 'Adjusted rest time to 120s between heavy working sets and prescribed extra foam rolling.'
    },
    {
      id: 'rev_cli_4',
      clientName: 'Vikram Seth',
      clientInitials: 'VS',
      date: 'Sep 20, 2026',
      weightChange: '-5.5 kg Total',
      compliance: '68% adherence',
      loggedEntry: 'Missed Friday HIIT session due to work travel. Logged hotel room mobility.',
      coachStatus: 'Action Required',
      coachNote: 'Sent 20-min hotel room bodyweight conditioning routine to keep momentum.'
    }
  ],

  /* ── 7. Trainer Scheduled Sessions ── */
  trainerSessions: [
    {
      id: 'ts_001',
      clientName: 'Aarav Sharma',
      clientInitials: 'AS',
      date: 'Thursday, Sep 24, 2026',
      time: '05:00 PM – 06:00 PM',
      type: '1-on-1 Video Coaching',
      duration: '60 min',
      topic: 'Nutritional Calorie Adjustment & Deadlift Biomechanics',
      category: 'today',
      status: 'Confirmed',
      meetingLink: 'https://meet.fittrack.com/session-rm-001'
    },
    {
      id: 'ts_002',
      clientName: 'Priya Patel',
      clientInitials: 'PP',
      date: 'Friday, Sep 25, 2026',
      time: '08:00 AM – 09:00 AM',
      type: 'Running Gait & Biomechanics Audit',
      duration: '60 min',
      topic: 'Cadence Analysis & Post-Run Foam Rolling Protocol',
      category: 'upcoming',
      status: 'Confirmed',
      meetingLink: 'https://meet.fittrack.com/session-rm-002'
    },
    {
      id: 'ts_003',
      clientName: 'Rohan Verma',
      clientInitials: 'RV',
      date: 'Friday, Sep 25, 2026',
      time: '06:00 PM – 07:00 PM',
      type: 'Hypertrophy Periodization',
      duration: '60 min',
      topic: 'Chest & Shoulder Progressive Overload Plan',
      category: 'upcoming',
      status: 'Confirmed',
      meetingLink: 'https://meet.fittrack.com/session-rm-003'
    },
    {
      id: 'ts_004',
      clientName: 'Ishwari Nikam',
      clientInitials: 'IN',
      date: 'Saturday, Sep 26, 2026',
      time: '06:00 PM – 07:00 PM',
      type: '1-on-1 Video Coaching',
      duration: '60 min',
      topic: 'Squat Form Video Analysis & Month 2 Progression',
      category: 'upcoming',
      status: 'Confirmed',
      meetingLink: 'https://meet.fittrack.com/session-rm-004'
    },
    {
      id: 'ts_005',
      clientName: 'Ananya Deshmukh',
      clientInitials: 'AD',
      date: 'Saturday, Sep 26, 2026',
      time: '10:00 AM – 11:00 AM',
      type: 'Postural Assessment & Spine Mobility',
      duration: '60 min',
      topic: 'Desk Worker Ergonomics & Cervical Spine Exercises',
      category: 'upcoming',
      status: 'Confirmed',
      meetingLink: 'https://meet.fittrack.com/session-rm-005'
    },
    {
      id: 'ts_past_1',
      clientName: 'Vikram Seth',
      clientInitials: 'VS',
      date: 'Sep 18, 2026',
      time: '07:00 PM – 08:00 PM',
      type: 'Diet & Caloric Deficit Review',
      duration: '60 min',
      topic: 'Travel Diet Blueprint & Restaurant Guidance',
      category: 'completed',
      status: 'Completed',
      meetingLink: 'https://meet.fittrack.com/session-rm-past1'
    },
    {
      id: 'ts_canc_1',
      clientName: 'Karan Mehra',
      clientInitials: 'KM',
      date: 'Sep 15, 2026',
      time: '04:00 PM – 05:00 PM',
      type: '1-on-1 Fitness Assessment',
      duration: '60 min',
      topic: 'Client requested reschedule due to dental surgery',
      category: 'cancelled',
      status: 'Cancelled by Client',
      meetingLink: '#'
    }
  ],

  /* ── 8. Client Relationship Management (CRM) ── */
  clientCRM: [
    {
      clientId: 'client_001',
      clientName: 'Aarav Sharma',
      clientInitials: 'AS',
      plan: 'Pro Coaching',
      membershipStatus: 'Active (Renews in 18 days)',
      notes: 'Very communicative and motivated. Target is weight management. Likes morning cardio challenges.',
      lastContact: 'Today via Chat',
      tags: ['Consistent', 'Weight Loss', 'Renewal Likely']
    },
    {
      clientId: 'client_002',
      clientName: 'Ishwari Nikam',
      clientInitials: 'IN',
      plan: 'Pro Coaching',
      membershipStatus: 'Active (Renews in 14 days)',
      notes: 'Punctual and follows progressive overload strictly. Form is improving rapidly. Evening video call preference.',
      lastContact: 'Today via Chat',
      tags: ['High Compliance', 'Target on Track', 'Top Performer']
    },
    {
      clientId: 'client_003',
      clientName: 'Priya Patel',
      clientInitials: 'PP',
      plan: 'Elite Athlete',
      membershipStatus: 'Active (Annual VIP Plan)',
      notes: 'Competitive runner preparing for half marathon. Needs recovery monitoring and hydration reminders.',
      lastContact: 'Yesterday',
      tags: ['VIP Elite', 'Marathon', 'Long Term']
    },
    {
      clientId: 'client_004',
      clientName: 'Rohan Verma',
      clientInitials: 'RV',
      plan: 'Pro Coaching',
      membershipStatus: 'Active (Renews in 22 days)',
      notes: 'Hypertrophy target. Bench press goal 100kg. Watch left elbow tendonitis.',
      lastContact: 'Yesterday',
      tags: ['Strength Focus', 'Heavy Lifter']
    }
  ],

  /* ── 8. Session Recordings Catalog ── */
  sessionRecordings: [],

  saveSessionRecording(recording) {
    if (!this.sessionRecordings) this.sessionRecordings = [];
    this.sessionRecordings.unshift(recording);
    const session = this.trainerSessions.find(s => s.id === recording.sessionId);
    if (session) {
      session.recording = recording;
    }
  },

  getSessionRecording(sessionId) {
    return (this.sessionRecordings || []).find(r => r.sessionId === sessionId);
  },

  /* ── 9. Trainer Notifications ── */
  trainerNotifications: [
    {
      id: 't_notif_001',
      type: 'client',
      title: 'New Client Assigned',
      message: 'Aarav Sharma enrolled in your Pro Coaching Plan (30-Day Blueprint).',
      time: '1 hour ago',
      read: false,
      actionView: 'trainer_clients'
    },
    {
      id: 't_notif_002',
      type: 'plan_live',
      title: 'Plan Published Live',
      message: 'Your plan "Corporate Executive Desk Rehab" is now published live to all members!',
      time: '3 hours ago',
      read: false,
      actionView: 'trainer_plans'
    },
    {
      id: 't_notif_003',
      type: 'session',
      title: 'Session Reminder',
      message: '1-on-1 Video Session with Aarav Sharma starting Today at 05:00 PM.',
      time: '4 hours ago',
      read: false,
      actionView: 'trainer_schedule_sessions'
    },
    {
      id: 't_notif_004',
      type: 'activity',
      title: 'Client Activity Update',
      message: 'Ishwari Nikam completed 3 of 6 exercises in Legs & Core Power routine.',
      time: '5 hours ago',
      read: false,
      actionView: 'trainer_review_progress'
    },
    {
      id: 't_notif_005',
      type: 'message',
      title: 'New Client Message',
      message: 'Rohan Verma: "Coach, hit 95kg on bench press today! Sent video for review."',
      time: 'Yesterday',
      read: true,
      actionView: 'trainer_messages'
    },
    {
      id: 't_notif_006',
      type: 'review',
      title: 'New Verified 5★ Review',
      message: 'Ishwari Nikam posted a 5-star rating: "Coach Rahul is phenomenal..."',
      time: '2 days ago',
      read: true,
      actionView: 'trainer_reviews'
    },
    {
      id: 't_notif_007',
      type: 'qualification',
      title: 'Qualification Active',
      message: 'Your ISSA Master Trainer credential is fully active and verified on your public profile.',
      time: '3 days ago',
      read: true,
      actionView: 'trainer_qualifications'
    }
  ],

  /* ── 10. Trainer Messages Database ── */
  trainerChatThreads: [
    {
      clientId: 'client_001',
      clientName: 'Aarav Sharma',
      initials: 'AS',
      avatarBg: '#2563EB',
      status: 'online',
      unreadCount: 2,
      lastMessage: 'Looking forward to our 5 PM video call today!',
      lastTime: '10:30 AM',
      messages: [
        { id: 'tm_1', sender: 'trainer', text: 'Hey Aarav, great job logging your 45-min morning cardio session!', time: '09:00 AM', read: true },
        { id: 'tm_2', sender: 'client', text: 'Thanks Coach Rahul! Felt energetic throughout. Added 15 min of core work too.', time: '09:15 AM', read: false },
        { id: 'tm_3', sender: 'trainer', text: 'Awesome! In our 5 PM video call today, we will audit your deadlift form and adjust calorie intake.', time: '10:00 AM', read: true },
        { id: 'tm_4', sender: 'client', text: 'Looking forward to our 5 PM video call today!', time: '10:30 AM', read: false }
      ]
    },
    {
      clientId: 'client_002',
      clientName: 'Ishwari Nikam',
      initials: 'IN',
      avatarBg: '#059669',
      status: 'online',
      unreadCount: 1,
      lastMessage: 'Logged my weight: 64.5kg, progressing steadily towards 58kg!',
      lastTime: 'Yesterday',
      messages: [
        { id: 'tm_5', sender: 'trainer', text: 'Hey Ishwari! How did the Bulgarian split squats feel in yesterday’s leg split?', time: 'Yesterday', read: true },
        { id: 'tm_6', sender: 'client', text: 'Felt challenging but solid! Logged my weight: 64.5kg, progressing steadily towards 58kg!', time: 'Yesterday', read: false },
        { id: 'tm_7', sender: 'trainer', text: 'Outstanding consistency! 3.5kg down with zero muscle loss. See you Saturday at 6 PM!', time: 'Yesterday', read: true }
      ]
    },
    {
      clientId: 'client_004',
      clientName: 'Rohan Verma',
      initials: 'RV',
      avatarBg: '#D97706',
      status: 'offline',
      unreadCount: 1,
      lastMessage: 'Coach, hit 95kg on bench press today! Sent video for review.',
      lastTime: 'Yesterday',
      messages: [
        { id: 'tm_8', sender: 'client', text: 'Coach, hit 95kg on bench press today! Sent video for review.', time: 'Yesterday', read: false },
        { id: 'tm_9', sender: 'trainer', text: 'Watched the clip — bar path was textbook! Let us attempt 97.5kg on Friday.', time: 'Yesterday', read: true }
      ]
    }
  ],

  /* ── Sidebar Navigation Items for User (Dedicated User Dashboard) ── */
  sidebarNav: [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', active: true },
    { id: 'profile', label: 'My Profile', icon: 'profile' },
    { id: 'goal', label: 'My Goal', icon: 'goal' },
    { id: 'trainers', label: 'Find Trainers', icon: 'trainers' },
    { id: 'my_plan', label: 'My Plan', icon: 'purchase' },
    { id: 'activities', label: 'Activities', icon: 'activities' },
    { id: 'sessions', label: 'Sessions', icon: 'sessions' },
    { id: 'progress', label: 'Progress', icon: 'progress' },
    { id: 'messages', label: 'Messages', icon: 'messages', badge: 1 },
    { id: 'reviews', label: 'Reviews', icon: 'reviews' },
    { id: 'notifications', label: 'Notifications', icon: 'bell', badge: 2 },
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'logout', label: 'Logout', icon: 'logout' },
  ],

  /* ── Sidebar Navigation Items for Trainer (Dedicated Trainer Dashboard) ── */
  trainerSidebarNav: [
    { id: 'trainer_dashboard', label: 'Dashboard', icon: 'dashboard', active: true },
    { id: 'trainer_public_profile', label: 'My Profile', icon: 'profile' },
    { id: 'trainer_qualifications', label: 'Qualifications', icon: 'shield' },
    { id: 'trainer_availability', label: 'Availability', icon: 'clock' },
    { id: 'trainer_plans', label: 'My Plans', icon: 'plans' },
    { id: 'trainer_clients', label: 'Clients', icon: 'trainers', badge: 24 },
    { id: 'trainer_assign_activities', label: 'Activities', icon: 'activities', badge: 12 },
    { id: 'trainer_schedule_sessions', label: 'Sessions', icon: 'sessions', badge: 5 },
    { id: 'trainer_review_progress', label: 'Client Progress', icon: 'progress' },
    { id: 'trainer_messages', label: 'Messages', icon: 'messages', badge: 4 },
    { id: 'trainer_reviews', label: 'Reviews', icon: 'reviews' },
    { id: 'trainer_notifications', label: 'Notifications', icon: 'bell', badge: 2 },
    { id: 'trainer_settings', label: 'Settings', icon: 'settings' },
    { id: 'logout', label: 'Logout', icon: 'logout' }
  ],

  /* ── Storage & Unread Calculation Engine ── */
  initStorage() {
    try {
      const storedChat = localStorage.getItem('fittrack_chat_messages');
      if (storedChat) {
        this.chatMessages = JSON.parse(storedChat);
      }
      const storedTrainerThreads = localStorage.getItem('fittrack_trainer_threads');
      if (storedTrainerThreads) {
        this.trainerChatThreads = JSON.parse(storedTrainerThreads);
      }
      const storedUserNotifs = localStorage.getItem('fittrack_user_notifications');
      if (storedUserNotifs) {
        this.notifications = JSON.parse(storedUserNotifs);
      }
      const storedTrainerNotifs = localStorage.getItem('fittrack_trainer_notifications');
      if (storedTrainerNotifs) {
        this.trainerNotifications = JSON.parse(storedTrainerNotifs);
      }
      const storedSessions = localStorage.getItem('fittrack_trainer_sessions');
      if (storedSessions) {
        try {
          const parsed = JSON.parse(storedSessions);
          if (Array.isArray(parsed)) {
            this.trainerSessions = parsed;
          } else if (parsed && Array.isArray(parsed.value)) {
            this.trainerSessions = parsed.value;
          } else if (parsed && Array.isArray(parsed.sessions)) {
            this.trainerSessions = parsed.sessions;
          }
        } catch (e) {
          console.warn('Error parsing stored sessions:', e);
        }
      }
      const storedRecordings = localStorage.getItem('fittrack_session_recordings');
      if (storedRecordings) {
        try {
          const parsed = JSON.parse(storedRecordings);
          if (Array.isArray(parsed)) this.sessionRecordings = parsed;
        } catch (e) {}
      }
      const storedViewed = localStorage.getItem('fittrack_viewed_sections');
      if (storedViewed) {
        try {
          this.viewedSections = JSON.parse(storedViewed) || {};
        } catch (e) {
          this.viewedSections = {};
        }
      } else {
        this.viewedSections = {};
      }
      const storedGoal = localStorage.getItem('fittrack_active_goal');
      if (storedGoal) {
        try {
          const parsedGoal = JSON.parse(storedGoal);
          if (parsedGoal && typeof parsedGoal === 'object') {
            this.activeGoal = { ...this.activeGoal, ...parsedGoal };
          }
        } catch (e) {
          console.warn('Error parsing stored goal:', e);
        }
      }
    } catch (e) {
      console.warn('Storage unavailable or error loading state:', e);
    }
    this.syncNavBadges();
  },

  saveToStorage() {
    try {
      localStorage.setItem('fittrack_chat_messages', JSON.stringify(this.chatMessages || []));
      localStorage.setItem('fittrack_trainer_threads', JSON.stringify(this.trainerChatThreads || []));
      localStorage.setItem('fittrack_user_notifications', JSON.stringify(this.notifications || []));
      localStorage.setItem('fittrack_trainer_notifications', JSON.stringify(this.trainerNotifications || []));
      localStorage.setItem('fittrack_trainer_sessions', JSON.stringify(this.trainerSessions || []));
      localStorage.setItem('fittrack_session_recordings', JSON.stringify(this.sessionRecordings || []));
      localStorage.setItem('fittrack_viewed_sections', JSON.stringify(this.viewedSections || {}));
      localStorage.setItem('fittrack_active_goal', JSON.stringify(this.activeGoal || {}));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
  },

  markSectionAsViewed(sectionId, role = 'user') {
    if (!this.viewedSections) this.viewedSections = {};
    if (!sectionId) return;

    const keys = [sectionId];
    if (sectionId === 'sessions' || sectionId === 'trainer_schedule_sessions') {
      keys.push('sessions', 'trainer_schedule_sessions');
    } else if (sectionId === 'activities' || sectionId === 'trainer_assign_activities') {
      keys.push('activities', 'trainer_assign_activities');
    } else if (sectionId === 'clients' || sectionId === 'trainer_clients') {
      keys.push('clients', 'trainer_clients');
    } else if (sectionId === 'notifications' || sectionId === 'trainer_notifications') {
      keys.push('notifications', 'trainer_notifications');
    } else if (sectionId === 'messages' || sectionId === 'trainer_messages') {
      keys.push('messages', 'trainer_messages');
    }

    let changed = false;
    keys.forEach(k => {
      if (!this.viewedSections[k]) {
        this.viewedSections[k] = true;
        changed = true;
      }
    });

    if (changed) {
      this.syncNavBadges();
      this.saveToStorage();
    }
  },

  getUserUnreadMessagesCount() {
    if (!Array.isArray(this.chatMessages)) return 0;
    return this.chatMessages.filter(m => m.sender !== 'user' && m.read === false).length;
  },

  getUserUnreadNotificationsCount() {
    if (!Array.isArray(this.notifications)) return 0;
    return this.notifications.filter(n => !n.read).length;
  },

  getTrainerUnreadMessagesCount() {
    if (!Array.isArray(this.trainerChatThreads)) return 0;
    return this.trainerChatThreads.reduce((total, thread) => {
      const count = thread.messages ? thread.messages.filter(m => m.sender === 'client' && m.read === false).length : (thread.unreadCount || 0);
      return total + count;
    }, 0);
  },

  getTrainerUnreadNotificationsCount() {
    if (!Array.isArray(this.trainerNotifications)) return 0;
    return this.trainerNotifications.filter(n => !n.read).length;
  },

  syncNavBadges() {
    if (!Array.isArray(this.trainerSessions)) {
      this.trainerSessions = (this.trainerSessions && Array.isArray(this.trainerSessions.value)) ? this.trainerSessions.value : [];
    }

    if (!this.viewedSections) this.viewedSections = {};

    const userMsgCount = this.getUserUnreadMessagesCount();
    const userNotifCount = this.getUserUnreadNotificationsCount();
    const trainerMsgCount = this.getTrainerUnreadMessagesCount();
    const trainerNotifCount = this.getTrainerUnreadNotificationsCount();

    if (Array.isArray(this.sidebarNav)) {
      const userMsgNav = this.sidebarNav.find(n => n.id === 'messages');
      if (userMsgNav) userMsgNav.badge = (!this.viewedSections['messages'] && userMsgCount > 0) ? userMsgCount : null;

      const userNotifNav = this.sidebarNav.find(n => n.id === 'notifications');
      if (userNotifNav) userNotifNav.badge = (!this.viewedSections['notifications'] && userNotifCount > 0) ? userNotifCount : null;

      const userSessionsNav = this.sidebarNav.find(n => n.id === 'sessions');
      if (userSessionsNav) {
        userSessionsNav.badge = !this.viewedSections['sessions'] ? userSessionsNav.badge : null;
      }
      const userActivitiesNav = this.sidebarNav.find(n => n.id === 'activities');
      if (userActivitiesNav) {
        userActivitiesNav.badge = !this.viewedSections['activities'] ? userActivitiesNav.badge : null;
      }
    }

    if (Array.isArray(this.trainerSidebarNav)) {
      const trainerMsgNav = this.trainerSidebarNav.find(n => n.id === 'trainer_messages');
      if (trainerMsgNav) trainerMsgNav.badge = (!this.viewedSections['trainer_messages'] && trainerMsgCount > 0) ? trainerMsgCount : null;

      const trainerNotifNav = this.trainerSidebarNav.find(n => n.id === 'trainer_notifications');
      if (trainerNotifNav) trainerNotifNav.badge = (!this.viewedSections['trainer_notifications'] && trainerNotifCount > 0) ? trainerNotifCount : null;

      const trainerClientsNav = this.trainerSidebarNav.find(n => n.id === 'trainer_clients');
      if (trainerClientsNav) {
        trainerClientsNav.badge = !this.viewedSections['trainer_clients'] ? (Array.isArray(this.activeClients) ? this.activeClients.length : null) : null;
      }

      const trainerActivitiesNav = this.trainerSidebarNav.find(n => n.id === 'trainer_assign_activities');
      if (trainerActivitiesNav) {
        trainerActivitiesNav.badge = !this.viewedSections['trainer_assign_activities'] ? (trainerActivitiesNav.badge || 12) : null;
      }

      // Dynamic badge calculation for upcoming & active sessions
      const trainerUpcomingSessionsCount = this.trainerSessions.filter(s => s && s.status !== 'Completed' && s.status !== 'Cancelled by Client' && s.category !== 'completed' && s.category !== 'cancelled').length;
      const trainerSessionsNav = this.trainerSidebarNav.find(n => n.id === 'trainer_schedule_sessions');
      if (trainerSessionsNav) {
        trainerSessionsNav.badge = (!this.viewedSections['trainer_schedule_sessions'] && trainerUpcomingSessionsCount > 0) ? trainerUpcomingSessionsCount : null;
      }

      if (this.trainer) {
        this.trainer.activeClientsCount = Array.isArray(this.activeClients) ? this.activeClients.length : 0;
        this.trainer.upcomingSessionsCount = trainerUpcomingSessionsCount;
      }

      if (this.trainerProfile) {
        this.trainerProfile.unreadMessagesCount = trainerMsgCount;
      }
    }
  },

  completeTrainerSession(sessionId) {
    const session = this.trainerSessions.find(s => s.id === sessionId);
    if (session) {
      session.status = 'Completed';
      session.category = 'completed';
      this.syncNavBadges();
      this.saveToStorage();
      return session;
    }
    return null;
  },

  addTrainerSession(sessionData) {
    this.trainerSessions.unshift(sessionData);
    this.syncNavBadges();
    this.saveToStorage();
    return sessionData;
  },

  markUserMessageAsRead(msgId) {
    const msg = this.chatMessages.find(m => m.id === msgId);
    if (msg && !msg.read) {
      msg.read = true;
      this.syncNavBadges();
      this.saveToStorage();
      return true;
    }
    return false;
  },

  markAllUserMessagesAsRead() {
    let changed = false;
    this.chatMessages.forEach(m => {
      if (m.sender !== 'user' && !m.read) {
        m.read = true;
        changed = true;
      }
    });
    if (changed) {
      this.syncNavBadges();
      this.saveToStorage();
    }
    return changed;
  },

  markTrainerThreadMessagesAsRead(clientId) {
    const thread = this.trainerChatThreads.find(t => t.clientId === clientId);
    if (!thread) return false;
    let changed = false;
    if (thread.messages) {
      thread.messages.forEach(m => {
        if (m.sender === 'client' && !m.read) {
          m.read = true;
          changed = true;
        }
      });
    }
    if (thread.unreadCount !== 0) {
      thread.unreadCount = 0;
      changed = true;
    }
    if (changed) {
      this.syncNavBadges();
      this.saveToStorage();
    }
    return changed;
  },

  markAllTrainerMessagesAsRead() {
    let changed = false;
    if (Array.isArray(this.trainerChatThreads)) {
      this.trainerChatThreads.forEach(thread => {
        if (thread.messages) {
          thread.messages.forEach(m => {
            if (m.sender === 'client' && !m.read) {
              m.read = true;
              changed = true;
            }
          });
        }
        if (thread.unreadCount !== 0) {
          thread.unreadCount = 0;
          changed = true;
        }
      });
    }
    if (changed) {
      this.syncNavBadges();
      this.saveToStorage();
    }
    return changed;
  },

  markNotificationAsRead(notifId, isTrainer = false) {
    const list = isTrainer ? this.trainerNotifications : this.notifications;
    const n = list.find(x => x.id === notifId);
    if (n && !n.read) {
      n.read = true;
      this.syncNavBadges();
      this.saveToStorage();
      return true;
    }
    return false;
  },

  markAllNotificationsAsRead(isTrainer = false) {
    const list = isTrainer ? this.trainerNotifications : this.notifications;
    list.forEach(n => { n.read = true; });
    this.syncNavBadges();
    this.saveToStorage();
  }
};

/* Initialize Storage on Data load */
FitTrackData.initStorage();

/* ── FitTrack API Layer (Simulation / Mock client + Server Backend Sync) ── */
const FitTrackAPI = {
  async fetchSessions() {
    try {
      const res = await fetch('/api/sessions');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.sessions) && data.sessions.length > 0) {
          FitTrackData.trainerSessions = data.sessions;
          FitTrackData.saveToStorage();
          FitTrackData.syncNavBadges();
          return { success: true, sessions: data.sessions };
        }
      }
    } catch (e) {
      console.warn('API fetchSessions offline or failed:', e);
    }
    return { success: true, sessions: FitTrackData.trainerSessions };
  },

  async startSession(sessionId) {
    const session = FitTrackData.trainerSessions.find(s => s.id === sessionId);
    if (session && session.status === 'Completed') {
      return { success: false, error: 'Session has already ended and is marked completed.' };
    }
    try {
      const res = await fetch('/api/sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      } else {
        const data = await res.json().catch(() => ({}));
        return { success: false, error: data.error || 'Session cannot be started.' };
      }
    } catch (e) {
      // Fallback for standalone/offline runs
      return { success: true };
    }
  },

  async completeSession(sessionId) {
    try {
      const res = await fetch('/api/sessions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      if (res.ok) {
        const data = await res.json();
        FitTrackData.completeTrainerSession(sessionId);
        return { success: true, data };
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to update session on server');
      }
    } catch (e) {
      console.warn('Server sync failed, applying local state persistence:', e);
      // Fallback update local state & localStorage
      const updated = FitTrackData.completeTrainerSession(sessionId);
      if (updated) {
        return { success: true, localOnly: true };
      }
      return { success: false, error: e.message };
    }
  },

  async bookSession(sessionData) {
    try {
      const res = await fetch('/api/sessions/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });
      if (res.ok) {
        FitTrackData.addTrainerSession(sessionData);
        return { success: true };
      }
    } catch (e) {
      console.warn('Book session API offline:', e);
    }
    FitTrackData.addTrainerSession(sessionData);
    return { success: true };
  },

  async markMessageRead(msgId) {
    try {
      await new Promise(resolve => setTimeout(resolve, 20));
      const updated = FitTrackData.markUserMessageAsRead(msgId);
      return { success: true, updated };
    } catch (error) {
      console.error('API Error marking message as read:', error);
      return { success: false, error: error.message };
    }
  },

  async markAllMessagesRead() {
    try {
      await new Promise(resolve => setTimeout(resolve, 20));
      const updated = FitTrackData.markAllUserMessagesAsRead();
      return { success: true, updated };
    } catch (error) {
      console.error('API Error marking all messages as read:', error);
      return { success: false, error: error.message };
    }
  }
};


/* -- Sync Mock Data with Actual Authenticated Session User -- */
FitTrackData.syncWithSessionUser = function() {
  try {
    const raw = sessionStorage.getItem('fittrack_user');
    if (!raw) return;
    const u = JSON.parse(raw);
    if (!u || !u.name) return;
    const parts = u.name.trim().split(' ').filter(Boolean);
    const first = parts[0] || u.name;
    const initials = parts.map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'FT';

    if (u.role === 'trainer') {
      if (FitTrackData.trainerProfile) {
        FitTrackData.trainerProfile.fullName = u.name;
        FitTrackData.trainerProfile.name = first.replace(/^Coach\s+/i, '');
        FitTrackData.trainerProfile.email = u.email || FitTrackData.trainerProfile.email;
        FitTrackData.trainerProfile.avatarInitials = initials;
      }
    } else {
      if (FitTrackData.currentUser) {
        FitTrackData.currentUser.fullName = u.name;
        FitTrackData.currentUser.name = first;
        FitTrackData.currentUser.email = u.email || FitTrackData.currentUser.email;
        FitTrackData.currentUser.avatarInitials = initials;
      }
    }
  } catch (e) {}
};

try { FitTrackData.syncWithSessionUser(); } catch (e) {}
