// utils/enhancers/actionVerbs.ts
// ============================================
// 🔥 STRONG ACTION VERBS DATABASE
// ============================================

export const ACTION_VERBS = {
  // ===== LEADERSHIP & MANAGEMENT =====
  leadership: [
    'led',
    'spearheaded',
    'directed',
    'orchestrated',
    'headed',
    'managed',
    'supervised',
    'guided',
    'mentored',
    'coached',
    'empowered',
    'motivated'
  ],

  // ===== ACHIEVEMENT & RESULTS =====
  achievement: [
    'achieved',
    'delivered',
    'executed',
    'accomplished',
    'completed',
    'attained',
    'secured',
    'generated',
    'produced',
    'realized'
  ],

  // ===== IMPROVEMENT & OPTIMIZATION =====
  improvement: [
    'optimized',
    'enhanced',
    'improved',
    'streamlined',
    'upgraded',
    'refined',
    'simplified',
    'accelerated',
    'maximized',
    'boosted'
  ],

  // ===== CREATION & DEVELOPMENT =====
  creation: [
    'built',
    'created',
    'developed',
    'designed',
    'engineered',
    'architected',
    'constructed',
    'established',
    'founded',
    'launched'
  ],

  // ===== COLLABORATION & COMMUNICATION =====
  collaboration: [
    'collaborated',
    'partnered',
    'coordinated',
    'aligned',
    'facilitated',
    'communicated',
    'negotiated',
    'presented',
    'advocated',
    'represented'
  ],

  // ===== ANALYSIS & STRATEGY =====
  analysis: [
    'analyzed',
    'evaluated',
    'assessed',
    'examined',
    'reviewed',
    'diagnosed',
    'investigated',
    'researched',
    'forecasted',
    'strategized'
  ],

  // ===== IMPLEMENTATION & EXECUTION =====
  implementation: [
    'implemented',
    'executed',
    'deployed',
    'integrated',
    'installed',
    'configured',
    'rolled out',
    'operationalized',
    'institutionalized'
  ]
};

// ============================================
// ✅ GET RANDOM ACTION VERB BY CATEGORY
// ============================================
export const getRandomVerb = (category: keyof typeof ACTION_VERBS): string => {
  const verbs = ACTION_VERBS[category];
  return verbs[Math.floor(Math.random() * verbs.length)];
};

// ============================================
// ✅ GET ALL ACTION VERBS (Flat Array)
// ============================================
export const getAllActionVerbs = (): string[] => {
  return Object.values(ACTION_VERBS).flat();
};

// ============================================
// ✅ CHECK IF WORD IS ACTION VERB
// ============================================
export const isActionVerb = (word: string): boolean => {
  const allVerbs = getAllActionVerbs();
  return allVerbs.includes(word.toLowerCase());
};

// ============================================
// ✅ SUGGEST STRONGER VERB
// ============================================
export const suggestStrongerVerb = (weakVerb: string): string | null => {
  const weakToStrong: Record<string, string> = {
    'help': 'support',
    'use': 'utilize',
    'make': 'create',
    'do': 'accomplish',
    'get': 'obtain',
    'give': 'provide',
    'take': 'assume',
    'see': 'recognize',
    'think': 'believe',
    'know': 'understand',
    'want': 'desire',
    'need': 'require',
    'try': 'strive',
    'work': 'contribute',
    'learn': 'master',
    'grow': 'develop',
    'improve': 'enhance',
    'lead': 'guide',
    'manage': 'orchestrate',
    'build': 'construct',
    'create': 'innovate',
    'design': 'craft',
    'develop': 'engineer',
    'implement': 'execute',
    'solve': 'resolve',
    'fix': 'rectify',
    'change': 'transform',
    'move': 'transition',
    'start': 'initiate',
    'finish': 'complete',
    'continue': 'persist',
    'stop': 'cease',
    'plan': 'strategize',
    'organize': 'coordinate',
    'communicate': 'convey'
  };

  return weakToStrong[weakVerb.toLowerCase()] || null;
};