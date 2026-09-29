/* ============================================================
   GCSE Music Theory Quest — app.js  (Part 1: core + dashboard)
   State management, navigation shell, XP/streak/badges, Home view.
   ============================================================ */

let STATE = loadState();
let QUIZ_BANK = [...QUIZ_BANK_1, ...QUIZ_BANK_2];
QUIZ_BANK.forEach(question => {
  question.examBoard = question.examBoard || 'general';
  question.subtopic = question.subtopic || question.topic;
  question.questionType = question.questionType || question.type || 'mcq';
  if (question.answer === undefined) {
    if (question.options && Number.isInteger(question.answerIndex)) question.answer = question.options[question.answerIndex];
    else if (question.type === 'order') question.answer = question.items.join(' -> ');
    else if (question.type === 'match') question.answer = question.pairs.map(pair => `${pair.term} = ${pair.def}`).join('; ');
  }
});
let CURRENT_VIEW = 'home';
let CURRENT_TOPIC = null;
let toastTimer = null;

/* Account / login lives in js/auth.js (email + username + password). */

/* ---------- Persistence-aware mutators ---------- */

function persist() { saveState(STATE); }

function ensureTopicStat(topicId) {
  if (!STATE.topicStats[topicId]) STATE.topicStats[topicId] = { attempts: 0, correct: 0 };
  return STATE.topicStats[topicId];
}

function todayXpAdd(amount) {
  const d = todayStr();
  STATE.xpLog[d] = (STATE.xpLog[d] || 0) + amount;
}

function addXp(amount, reason) {
  STATE.xp += amount;
  todayXpAdd(amount);
  const info = nextLevelInfo(STATE.xp);
  showToast(`+${amount} XP${reason ? ' · ' + reason : ''}`, 'xp');
  persist();
  return info;
}

function touchDailyStreak() {
  const today = todayStr();
  if (STATE.lastActiveDate === today) return;
  if (STATE.lastActiveDate) {
    const gap = daysBetween(STATE.lastActiveDate, today);
    if (gap === 1) STATE.streakCurrent += 1;
    else if (gap > 1) STATE.streakCurrent = 1;
  } else {
    STATE.streakCurrent = 1;
  }
  STATE.streakBest = Math.max(STATE.streakBest, STATE.streakCurrent);
  STATE.lastActiveDate = today;
  persist();
}

function recordAnswer(question, wasCorrect, chosenText) {
  STATE.questionsAnswered += 1;
  ensureTopicStat(question.topic).attempts += 1;
  if (wasCorrect) {
    STATE.questionsCorrect += 1;
    ensureTopicStat(question.topic).correct += 1;
    STATE.correctStreak += 1;
    STATE.correctStreakBest = Math.max(STATE.correctStreakBest, STATE.correctStreak);
    addXp(10 + question.difficulty * 2, 'correct answer');
  } else {
    STATE.correctStreak = 0;
    addXp(2, 'attempt');
    STATE.mistakes.unshift({
      qid: question.id, topic: question.topic, question: question.prompt,
      yourAnswer: chosenText, correctAnswer: question.answer || (question.options ? question.options[question.answerIndex] : (question.correctText || '')),
      explanation: question.explanation, ts: Date.now()
    });
    STATE.mistakes = STATE.mistakes.slice(0, 200);
  }
  checkBadgesAndNotify();
  persist();
}

function markTopicComplete(topicId) {
  STATE.completedTopics = STATE.completedTopics || [];
  if (!STATE.completedTopics.includes(topicId)) {
    STATE.completedTopics.push(topicId);
    addXp(25, 'lesson complete');
  }
  persist();
}

function checkBadgesAndNotify(ctx) {
  BADGES.forEach(b => {
    if (STATE.badges.includes(b.id)) return;
    try {
      if (b.check(STATE, ctx)) {
        STATE.badges.push(b.id);
        showToast(`${b.icon} Badge unlocked: ${b.name}`, 'badge');
      }
    } catch (e) { /* ignore malformed check */ }
  });
  persist();
}

/* ---------- Toast ---------- */

function showToast(msg, kind = 'info') {
  let box = document.getElementById('toast-box');
  if (!box) {
    box = el('div', { id: 'toast-box', class: 'toast-box' });
    document.body.appendChild(box);
  }
  const t = el('div', { class: `toast toast-${kind}` }, msg);
  box.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2600);
}

/* ---------- Navigation shell ---------- */

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'learn', label: 'Learn', icon: '🎓' },
  { id: 'quiz', label: 'Quiz', icon: '❓' },
  { id: 'flashcards', label: 'Flashcards', icon: '🗂️' },
  { id: 'listening', label: 'Listening Lab', icon: '👂' },
  { id: 'mock', label: 'Mock Exam', icon: '📝' },
  { id: 'progress', label: 'Progress', icon: '📊' },
  { id: 'settings', label: 'Settings', icon: '⚙️' }
];

function applySettingsToDom() {
  document.documentElement.classList.toggle('dark', !!STATE.settings.darkMode);
  document.documentElement.classList.toggle('reduced-motion', !!STATE.settings.reducedMotion);
  AudioLab.setEnabled(!!STATE.settings.sound);
}

function buildShell() {
  document.body.innerHTML = '';
  document.body.className = '';
  applySettingsToDom();

  const header = el('header', { class: 'app-header' }, [
    el('div', { class: 'brand' }, [el('span', { class: 'brand-icon' }, '🎼'), el('span', {}, 'Perfect 9th')]),
    el('div', { class: 'header-stats' }, [
      currentUsername() ? el('button', { class: 'header-user', type: 'button', title: 'Account & settings', onclick: () => navigate('settings') }, [
        avatarSvg(getAccountAvatarConfig(), 28), el('span', { class: 'header-user-name' }, `Hi, ${currentUsername()}!`)
      ]) : null,
      el('div', { class: 'chip xp-chip' }, [el('span', {}, '⭐'), el('span', { id: 'hdr-xp' }, String(STATE.xp))]),
      el('div', { class: 'chip streak-chip' }, [el('span', {}, '🔥'), el('span', { id: 'hdr-streak' }, String(STATE.streakCurrent))])
    ])
  ]);

  const nav = el('nav', { class: 'side-nav', id: 'side-nav' });
  NAV_ITEMS.forEach(item => {
    const btn = el('button', {
      class: 'nav-item' + (item.id === CURRENT_VIEW ? ' active' : ''),
      onclick: () => navigate(item.id)
    }, [el('span', { class: 'nav-icon' }, item.icon), el('span', { class: 'nav-label' }, item.label)]);
    btn.dataset.nav = item.id;
    nav.appendChild(btn);
  });

  const main = el('main', { class: 'app-main', id: 'app-root' });

  const bottomNav = el('nav', { class: 'bottom-nav', id: 'bottom-nav' });
  NAV_ITEMS.slice(0, 5).forEach(item => {
    const btn = el('button', {
      class: 'bottom-nav-item' + (item.id === CURRENT_VIEW ? ' active' : ''),
      onclick: () => navigate(item.id)
    }, [el('span', { class: 'nav-icon' }, item.icon), el('span', { class: 'nav-label-sm' }, item.label)]);
    btn.dataset.nav = item.id;
    bottomNav.appendChild(btn);
  });

  const layout = el('div', { class: 'app-layout' }, [nav, main]);
  document.body.appendChild(header);
  document.body.appendChild(layout);
  document.body.appendChild(bottomNav);
}

function refreshHeaderStats() {
  const xpEl = document.getElementById('hdr-xp');
  const stEl = document.getElementById('hdr-streak');
  if (xpEl) xpEl.textContent = String(STATE.xp);
  if (stEl) stEl.textContent = String(STATE.streakCurrent);
  document.querySelectorAll('[data-nav]').forEach(b => b.classList.toggle('active', b.dataset.nav === CURRENT_VIEW));
}

function navigate(viewId, payload) {
  CURRENT_VIEW = viewId;
  CURRENT_TOPIC = payload && payload.topicId ? payload.topicId : null;
  window.scrollTo(0, 0);
  render();
  refreshHeaderStats();
}

function render() {
  const root = document.getElementById('app-root');
  root.innerHTML = '';
  root.className = 'app-main view-' + CURRENT_VIEW;
  switch (CURRENT_VIEW) {
    case 'home': return renderHome(root);
    case 'learn': return CURRENT_TOPIC ? renderTopicDetail(root, CURRENT_TOPIC) : renderLearnList(root);
    case 'quiz': return renderQuizSetup(root);
    case 'trainer': return renderNotationTrainer(root);
    case 'quiz-run': return renderQuizRunner(root);
    case 'flashcards': return renderFlashcards(root);
    case 'listening': return renderListeningLab(root);
    case 'mock': return renderMockSetup(root);
    case 'progress': return renderProgress(root);
    case 'settings': return renderSettings(root);
    case 'mistakes': return renderMistakeBank(root);
    case 'daily': return renderDailyChallenge(root);
    case 'study': return renderStudyMode(root);
    default: return renderHome(root);
  }
}

/* ---------- Home dashboard ---------- */

function progressBar(pct, extraClass = '') {
  return el('div', { class: 'progress-track ' + extraClass }, [
    el('div', { class: 'progress-fill', style: `width:${clamp(pct, 0, 100)}%` })
  ]);
}

function statCard(icon, label, value) {
  return el('div', { class: 'stat-card' }, [
    el('div', { class: 'stat-icon' }, icon),
    el('div', {}, [el('div', { class: 'stat-value' }, String(value)), el('div', { class: 'stat-label' }, label)])
  ]);
}

function pickRecommendedTopic() {
  const notStarted = TOPICS.find(t => !STATE.topicStats[t.id] || STATE.topicStats[t.id].attempts === 0);
  if (notStarted) return notStarted;
  let weakest = null, weakestAcc = 2;
  TOPICS.forEach(t => {
    const s = STATE.topicStats[t.id];
    if (s && s.attempts >= 3) {
      const acc = s.correct / s.attempts;
      if (acc < weakestAcc) { weakestAcc = acc; weakest = t; }
    }
  });
  return weakest || TOPICS[0];
}

function renderHome(root) {
  touchDailyStreak();
  const info = nextLevelInfo(STATE.xp);
  const accuracy = STATE.questionsAnswered ? Math.round((STATE.questionsCorrect / STATE.questionsAnswered) * 100) : 0;
  const masteredCount = TOPICS.filter(t => ['secure', 'mastered'].includes(masteryOf(STATE, t.id).key)).length;
  const rec = pickRecommendedTopic();
  const dailyDone = STATE.dailyChallenge.date === todayStr() && STATE.dailyChallenge.completed;
  const recentMistakes = STATE.mistakes.slice(0, 3);

  root.appendChild(el('section', { class: 'hero-card' }, [
    el('div', { class: 'hero-text' }, [
      el('div', { class: 'hero-eyebrow' }, `Level ${info.current.level} · ${info.current.name}`),
      el('h1', {}, currentUsername() ? `Hi, ${currentUsername()}! 👋` : 'Keep the music theory momentum going.'),
      el('p', {}, info.next
        ? `${info.remaining} XP to reach Level ${info.next.level}: ${info.next.name}.`
        : 'You\u2019ve reached the top level — Theory Master!'),
      progressBar(info.pct, 'hero-progress'),
      el('button', { class: 'btn btn-primary btn-lg', onclick: () => navigate('learn', { topicId: rec.id }) }, 'Continue Learning →')
    ]),
    el('div', { class: 'hero-side' }, [
      el('div', { class: 'streak-badge' }, [el('div', { class: 'streak-flame' }, '🔥'), el('div', { class: 'streak-num' }, String(STATE.streakCurrent)), el('div', { class: 'streak-label' }, 'day streak')])
    ])
  ]));

  root.appendChild(el('section', { class: 'stat-grid' }, [
    statCard('⭐', 'Total XP', STATE.xp),
    statCard('❓', 'Questions answered', STATE.questionsAnswered),
    statCard('✅', 'Correct answers', STATE.questionsCorrect),
    statCard('🎯', 'Accuracy', accuracy + '%'),
    statCard('🧠', 'Topics secure+', `${masteredCount}/${TOPICS.length}`),
    statCard('🏅', 'Badges earned', `${STATE.badges.length}/${BADGES.length}`)
  ]));

  const cards = el('section', { class: 'card-grid' });

  cards.appendChild(el('div', { class: 'panel-card' }, [
    el('h3', {}, '🎯 Recommended next topic'),
    el('p', {}, rec.blurb),
    el('button', { class: 'btn btn-secondary', onclick: () => navigate('learn', { topicId: rec.id }) }, `Open ${rec.title} ${rec.icon}`)
  ]));

  cards.appendChild(el('div', { class: 'panel-card' }, [
    el('h3', {}, '📅 Daily Challenge'),
    el('p', {}, dailyDone ? `Completed today — score ${STATE.dailyChallenge.score}/5. Come back tomorrow!` : '5 quick questions from across your topics. +50 XP.'),
    el('button', { class: 'btn ' + (dailyDone ? 'btn-secondary' : 'btn-primary'), onclick: () => navigate('daily') }, dailyDone ? 'Review' : 'Start Daily Challenge')
  ]));

  cards.appendChild(el('div', { class: 'panel-card' }, [
    el('h3', {}, '📌 Recent mistakes'),
    recentMistakes.length
      ? el('ul', { class: 'mini-list' }, recentMistakes.map(m => el('li', {}, `${TOPIC_BY_ID[m.topic]?.icon || ''} ${m.question}`)))
      : el('p', {}, 'No mistakes logged yet — nice work, or you haven\u2019t started quizzing yet!'),
    el('button', { class: 'btn btn-secondary', onclick: () => navigate('mistakes') }, 'Open Mistake Bank')
  ]));

  const recent = (STATE.recentTopics || []).map(id => TOPIC_BY_ID[id]).filter(Boolean).slice(0, 4);
  cards.appendChild(el('div', { class: 'panel-card' }, [
    el('h3', {}, '🕘 Recently studied'),
    recent.length
      ? el('div', { class: 'recent-topics' }, recent.map(t => el('button', { class: 'mastery-chip', type: 'button', onclick: () => navigate('learn', { topicId: t.id }) }, [el('span', {}, t.icon), el('span', { class: 'mastery-chip-title' }, t.title)])))
      : el('p', {}, 'Topics you open will show up here so you can jump straight back in.')
  ]));

  cards.appendChild(el('div', { class: 'panel-card' }, [
    el('h3', {}, '⏱️ Study Mode'),
    el('p', {}, 'A focused session mixing lessons, flashcards and quiz questions.'),
    el('button', { class: 'btn btn-secondary', onclick: () => navigate('study') }, 'Start a session')
  ]));

  root.appendChild(cards);

  root.appendChild(el('section', { class: 'panel-card' }, [
    el('h3', {}, '🗺️ Topic mastery overview'),
    el('div', { class: 'mastery-grid' }, TOPICS.map(t => {
      const m = masteryOf(STATE, t.id);
      return el('button', { class: 'mastery-chip', onclick: () => navigate('learn', { topicId: t.id }) }, [
        el('span', {}, t.icon), el('span', { class: 'mastery-chip-title' }, t.title), el('span', { class: 'mastery-icon' }, m.icon)
      ]);
    }))
  ]));

  const boardCard = el('section', { class: 'panel-card exam-board-card' }, [
    el('h3', {}, '🎓 Exam board focus'),
    el('p', {}, 'Layer exam-board-specific terminology and areas of study on top of your general theory revision.'),
    el('div', { class: 'board-buttons' }, ['general', 'aqa', 'eduqas'].map(b => el('button', {
      class: 'btn ' + (STATE.examBoard === b ? 'btn-primary' : 'btn-secondary'),
      onclick: () => { STATE.examBoard = b; persist(); render(); }
    }, b === 'general' ? 'General GCSE' : EXAM_BOARDS[b].name)))
  ]);
  if (STATE.examBoard !== 'general') {
    const info2 = EXAM_BOARDS[STATE.examBoard];
    boardCard.appendChild(el('div', { class: 'board-detail' }, [
      el('p', { class: 'board-note' }, `⚠️ ${info2.note}`),
      el('div', { class: 'aos-grid' }, info2.areasOfStudy.map(a => el('div', { class: 'aos-item' }, [el('strong', {}, a.title), el('p', {}, a.desc)])))
    ]));
  }
  root.appendChild(boardCard);
}

/* ============================================================
   app.js (Part 2): Learn — topic list + topic detail
   ============================================================ */

function renderLearnList(root) {
  root.appendChild(el('h1', { class: 'page-title' }, '🎓 Learn'));
  root.appendChild(el('p', { class: 'page-sub' }, 'Work through each topic: Learn → Example → Practice → Quiz. Your mastery updates as you go.'));

  root.appendChild(el('div', { class: 'topic-list' }, TOPICS.map(t => {
    const m = masteryOf(STATE, t.id);
    const stat = STATE.topicStats[t.id];
    const acc = stat && stat.attempts ? Math.round((stat.correct / stat.attempts) * 100) : null;
    return el('button', { class: 'topic-row', onclick: () => navigate('learn', { topicId: t.id }) }, [
      el('div', { class: 'topic-row-icon' }, t.icon),
      el('div', { class: 'topic-row-main' }, [
        el('div', { class: 'topic-row-title' }, t.title),
        el('div', { class: 'topic-row-blurb' }, t.blurb)
      ]),
      el('div', { class: 'topic-row-mastery' }, [
        el('span', { class: 'mastery-icon-lg' }, m.icon),
        el('span', { class: 'mastery-label' }, m.label),
        acc !== null ? el('span', { class: 'mastery-acc' }, acc + '% acc') : null
      ])
    ]);
  })));
}

const TOPIC_TABS = ['learn', 'example', 'practice', 'quiz'];

function renderTopicDetail(root, topicId) {
  const topic = TOPIC_BY_ID[topicId];
  if (!topic) return renderLearnList(root);
  const extension = typeof THEORY_EXTENSIONS !== 'undefined' ? (THEORY_EXTENSIONS[topicId] || {}) : {};
  const learnHtml = topic.learn + (extension.learn || '');
  const examplesHtml = topic.examples + (extension.examples || '');
  const activeTab = renderTopicDetail._tab && renderTopicDetail._topic === topicId ? renderTopicDetail._tab : 'learn';
  if (renderTopicDetail._topic !== topicId || !(STATE.recentTopics && STATE.recentTopics[0] === topicId)) {
    STATE.recentTopics = [topicId, ...(STATE.recentTopics || []).filter(t => t !== topicId)].slice(0, 6);
    persist();
  }
  renderTopicDetail._topic = topicId;

  root.appendChild(el('button', { class: 'btn-link back-link', onclick: () => navigate('learn') }, '← All topics'));
  root.appendChild(el('div', { class: 'topic-header' }, [
    el('div', { class: 'topic-header-icon' }, topic.icon),
    el('div', {}, [el('h1', { class: 'page-title' }, topic.title), el('p', { class: 'page-sub' }, topic.blurb)])
  ]));

  if (STATE.examBoard !== 'general') {
    const boardInfo = EXAM_BOARDS[STATE.examBoard];
    const relevant = boardInfo.focusTerms.filter(term => learnHtml.toLowerCase().includes(term.toLowerCase()) || topic.title.toLowerCase().includes(term.toLowerCase()));
    root.appendChild(el('div', { class: 'board-flag' }, [
      el('strong', {}, `${boardInfo.name} focus: `),
      relevant.length ? `commonly referenced terms here include ${relevant.join(', ')}.` : 'this topic is general GCSE theory — check your exam board\u2019s set works for specific examples.'
    ]));
  }

  const tabBar = el('div', { class: 'tab-bar' }, TOPIC_TABS.map(tab => el('button', {
    class: 'tab-btn' + (tab === activeTab ? ' active' : ''),
    onclick: () => { renderTopicDetail._tab = tab; render(); }
  }, tab.charAt(0).toUpperCase() + tab.slice(1))));
  root.appendChild(tabBar);

  const panel = el('div', { class: 'panel-card tab-panel' });
  root.appendChild(panel);

  if (activeTab === 'learn') {
    panel.appendChild(el('div', { class: 'lesson-html', html: learnHtml }));
    renderConfusablesFor(panel, topic.id);
    panel.appendChild(el('button', { class: 'btn btn-primary', onclick: () => { markTopicComplete(topic.id); renderTopicDetail._tab = 'example'; render(); } }, 'Mark learned — see examples →'));
    injectTopicVisuals(panel, topic.id);
  } else if (activeTab === 'example') {
    panel.appendChild(el('div', { class: 'lesson-html', html: examplesHtml }));
    injectTopicVisuals(panel, topic.id);
    panel.appendChild(el('button', { class: 'btn btn-secondary', onclick: () => { renderTopicDetail._tab = 'practice'; render(); } }, 'Try practice questions →'));
  } else if (activeTab === 'practice') {
    renderPracticePanel(panel, topic);
  } else if (activeTab === 'quiz') {
    panel.appendChild(el('p', {}, `Take a quiz on ${topic.title} to build your mastery.`));
    panel.appendChild(el('div', { class: 'difficulty-picker' }, [1, 2, 3, 4, 5].map(d => el('button', {
      class: 'diff-btn', onclick: () => startQuiz({ topicIds: [topic.id], maxDifficulty: d, count: 8, source: 'topic' })
    }, `Up to ${difficultyStarsShort(d)}`))));
    panel.appendChild(el('button', { class: 'btn btn-primary', onclick: () => startQuiz({ topicIds: [topic.id], count: 8, source: 'topic' }) }, `Quick quiz — all difficulties (8 Qs)`));
  }
}

function difficultyStarsShort(d) { return '⭐'.repeat(d); }

function renderConfusablesFor(panel, topicId) {
  const relevant = CONFUSABLE_PAIRS.filter(p => panel.innerHTML.includes(p.a.split(' ')[0]) || panel.innerHTML.includes(p.b.split(' ')[0]));
  if (!relevant.length) return;
  const box = el('div', { class: 'confusables' }, [el('h4', {}, '🔀 Commonly confused')]);
  relevant.slice(0, 3).forEach(p => box.appendChild(el('div', { class: 'confusable-item' }, [el('strong', {}, `${p.a} vs ${p.b}: `), p.note])));
  panel.appendChild(box);
}

/* Practice mini-exercises per topic (a handful of guided questions before the full quiz) */
function renderPracticePanel(panel, topic) {
  const practiceQs = QUIZ_BANK.filter(q => q.topic === topic.id && q.difficulty <= 2).slice(0, 3);
  if (!practiceQs.length) {
    panel.appendChild(el('p', {}, 'No guided practice items yet for this topic — head straight to the quiz!'));
    return;
  }
  panel.appendChild(el('p', {}, 'Quick untimed practice — take your time, mistakes here don\u2019t affect your streak.'));
  const container = el('div', { class: 'practice-list' });
  panel.appendChild(container);
  practiceQs.forEach((q, i) => {
    const box = el('div', { class: 'practice-item' });
    container.appendChild(box);
    renderPracticeQuestion(box, q);
  });
}

function renderPracticeQuestion(box, q) {
  box.innerHTML = '';
  box.appendChild(el('p', { class: 'practice-prompt' }, q.prompt));
  const visualHost = el('div', { class: 'visual-host' });
  box.appendChild(visualHost);
  renderQuestionVisual(visualHost, q);
  if (q.type === 'typing') {
    renderTypingQuestionUI(box, q, () => {});
    return;
  }
  if (q.type === 'order') {
    renderOrderQuestionUI(box, q, () => {});
    return;
  }
  if (q.type === 'match') {
    renderMatchQuestionUI(box, q, () => {});
    return;
  }
  const optWrap = el('div', { class: 'option-grid' });
  box.appendChild(optWrap);
  (q.options || []).forEach((opt, idx) => {
    const b = el('button', { class: 'option-btn', onclick: () => {
      const correct = idx === q.answerIndex;
      Array.from(optWrap.children).forEach((c, ci) => {
        if (ci === q.answerIndex) c.classList.add('correct');
        else if (ci === idx) c.classList.add('incorrect');
        c.disabled = true;
      });
      box.appendChild(el('div', { class: 'explanation-box ' + (correct ? 'good' : 'bad') }, [
        el('strong', {}, correct ? '✅ Correct! ' : '❌ Not quite. '), q.explanation
      ]));
    } }, opt);
    optWrap.appendChild(b);
  });
}

/* Visuals injected into lesson/example panels for specific topics */
/* Replace <span class="ng" data-ng="crotchet"> placeholders in lesson HTML with vector icons (no music font needed). */
function hydrateGlyphs(root) {
  root.querySelectorAll('[data-ng]').forEach(sp => {
    sp.textContent = '';
    sp.appendChild(noteIcon(sp.getAttribute('data-ng')));
  });
}

function injectTopicVisuals(panel, topicId) {
  hydrateGlyphs(panel);
  if (topicId === 'notation') {
    const host = panel.querySelector('#notation-example-staff');
    if (host) host.appendChild(drawStaff({ clef: 'treble', notes: [{ pitch: 'C4', label: 'Middle C (treble)' }] }));
    const altoHost = panel.querySelector('#notation-alto-example');
    if (altoHost) altoHost.appendChild(drawStaff({ clef: 'alto', notes: [{ pitch: 'C4', label: 'C4 on the middle line' }] }));
    const rhythmHost = panel.querySelector('#notation-rhythm-example');
    if (rhythmHost) rhythmHost.appendChild(drawRhythmStrip([
      { type: 'dotted-crotchet', label: '1½ beats' },
      { type: 'quaver', label: '½ beat' },
      { type: 'triplet', label: '3 in 2' }
    ]));
    // the same pitch, three clefs
    const clefHost = panel.querySelector('#notation-clef-gallery');
    if (clefHost) {
      const wrap = el('div', { class: 'interval-compare' });
      wrap.appendChild(drawStaff({ clef: 'treble', notes: [{ pitch: 'E4', label: 'E4' }, { pitch: 'G4', label: 'G4' }, { pitch: 'C5', label: 'C5' }], caption: 'Treble clef: bottom line is E4' }));
      wrap.appendChild(drawStaff({ clef: 'bass', notes: [{ pitch: 'G2', label: 'G2' }, { pitch: 'B2', label: 'B2' }, { pitch: 'E3', label: 'E3' }], caption: 'Bass clef: bottom line is G2' }));
      wrap.appendChild(drawStaff({ clef: 'alto', notes: [{ pitch: 'F3', label: 'F3' }, { pitch: 'A3', label: 'A3' }, { pitch: 'D4', label: 'D4' }], caption: 'Alto clef: middle line is C4' }));
      clefHost.appendChild(wrap);
    }
    const middleC = panel.querySelector('#notation-middlec-gallery');
    if (middleC) {
      const wrap = el('div', { class: 'interval-compare' });
      wrap.appendChild(drawStaff({ clef: 'treble', notes: [{ pitch: 'C4', label: 'first ledger line below' }], caption: 'Middle C in treble clef' }));
      wrap.appendChild(drawStaff({ clef: 'bass', notes: [{ pitch: 'C4', label: 'first ledger line above' }], caption: 'Middle C in bass clef' }));
      wrap.appendChild(drawStaff({ clef: 'alto', notes: [{ pitch: 'C4', label: 'middle line' }], caption: 'Middle C in alto clef' }));
      middleC.appendChild(wrap);
    }
    const ksHost = panel.querySelector('#notation-keysig-gallery');
    if (ksHost) {
      const wrap = el('div', { class: 'interval-compare' });
      [['treble', 'D'], ['bass', 'D'], ['alto', 'D'], ['treble', 'Eb'], ['bass', 'Eb'], ['alto', 'Eb']].forEach(([clef, key]) => {
        wrap.appendChild(drawStaff({ clef, keySignature: key, notes: [], width: 220, caption: `${prettyName(key)} major in ${clef} clef` }));
      });
      ksHost.appendChild(wrap);
    }
    const trainerHost = panel.querySelector('#notation-trainer');
    if (trainerHost) trainerHost.appendChild(buildNotationTrainer());
  }
  if (topicId === 'rhythm') {
    const host = panel.querySelector('#rhythm-example-strip');
    if (host) {
      host.appendChild(drawRhythmStrip([
        { type: 'dotted-quaver', label: 'Hap-' }, { type: 'semiquaver', label: '-py' }, { type: 'barline' },
        { type: 'crotchet', label: 'birth-' }, { type: 'crotchet', label: '-day' }, { type: 'crotchet', label: 'to' }, { type: 'barline' },
        { type: 'dotted-minim', label: 'you' }
      ], { timeSignature: '3/4', endBarline: 'final' }));
      host.appendChild(el('p', { class: 'caption-row' }, '“Happy Birthday” in 3/4: the two pick-up notes “Hap-py” are the anacrusis, and the first strong beat lands on “birth-”.'));
    }
  }
  if (topicId === 'scales') {
    const host = panel.querySelector('#scales-circle-of-fifths');
    if (host) host.appendChild(buildCircleOfFifths());
  }
  if (topicId === 'intervals') {
    const host = panel.querySelector('#intervals-example-staff');
    if (host) {
      const wrap = el('div', { class: 'interval-compare' });
      wrap.appendChild(drawStaff({ clef: 'treble', notes: ['C4', 'E4'], caption: 'Major 3rd' }));
      wrap.appendChild(drawStaff({ clef: 'treble', notes: ['C4', 'Eb4'], caption: 'Minor 3rd' }));
      host.appendChild(wrap);
    }
  }
  if (topicId === 'chords') {
    const host = panel.querySelector('#chords-example-staff');
    if (host) {
      const wrap = el('div', { class: 'interval-compare' });
      wrap.appendChild(drawStaff({ clef: 'treble', chordNotes: ['G4', 'B4', 'D5'] }));
      wrap.appendChild(drawStaff({ clef: 'treble', chordNotes: ['C4', 'E4', 'G4'] }));
      host.appendChild(wrap);
      host.appendChild(el('p', { class: 'caption-row' }, 'G major (V) → C major (I): a perfect cadence.'));
      host.appendChild(el('button', { class: 'btn btn-secondary', onclick: () => AudioLab.playCadence([['G4', 'B4', 'D5'], ['C4', 'E4', 'G4']]) }, '▶ Play cadence'));
    }
  }
  if (topicId === 'form') {
    const host = panel.querySelector('#form-example-diagram');
    if (host) {
      ['AB (Binary)', 'ABA (Ternary)', 'ABACA (Rondo)'].forEach(label => {
        const letters = label.split(' ')[0].split('');
        const row = el('div', { class: 'form-diagram-row' }, [
          el('span', { class: 'form-diagram-label' }, label),
          el('div', { class: 'form-blocks' }, letters.map(letter => el('span', { class: 'form-block form-block-' + letter }, letter)))
        ]);
        host.appendChild(row);
      });
    }
  }
}

/* ---------- Circle of Fifths widget ---------- */

function buildCircleOfFifths() {
  const wrap = el('div', { class: 'cof-wrap' });
  const size = 320, r = 130, cx = size / 2, cy = size / 2;
  const svg = svgEl('svg', { viewBox: `0 0 ${size} ${size}`, class: 'cof-svg' });
  svg.appendChild(svgEl('circle', { cx, cy, r: r + 24, class: 'cof-ring' }));
  CIRCLE_OF_FIFTHS.forEach(k => {
    const rad = (k.angle - 90) * Math.PI / 180;
    const x = cx + r * Math.cos(rad), y = cy + r * Math.sin(rad);
    const g = svgEl('g', { class: 'cof-key', 'data-key': k.key, transform: `translate(${x},${y})` });
    g.appendChild(svgEl('circle', { r: 26, class: 'cof-key-circle' }));
    const t1 = svgEl('text', { class: 'cof-key-text', 'text-anchor': 'middle', dy: -2 }); t1.textContent = k.key;
    const t2 = svgEl('text', { class: 'cof-key-sub', 'text-anchor': 'middle', dy: 14 }); t2.textContent = k.minor;
    g.appendChild(t1); g.appendChild(t2);
    g.addEventListener('click', () => showCofDetail(detailBox, k));
    svg.appendChild(g);
  });
  wrap.appendChild(svg);
  const detailBox = el('div', { class: 'cof-detail' }, 'Click a key to see its details.');
  wrap.appendChild(detailBox);
  return wrap;
}

function showCofDetail(box, k) {
  box.innerHTML = '';
  const tonics = k.tonics || [k.key.split('/')[0]];
  const minors = k.minors || [];
  tonics.forEach((tonic, i) => {
    const ks = keySigFor(tonic);
    const sigText = ks.count === 0 ? 'no sharps or flats' : `${ks.count} ${ks.type}${ks.count > 1 ? 's' : ''}`;
    const notes = spellScale(tonic, MAJOR_SCALE_STEPS.slice(0, 7));
    const pitches = ascendingPitches(notes.concat([notes[0]]), 4);
    const block = el('div', { class: 'cof-block' });
    block.appendChild(el('h4', {}, `${prettyName(tonic)} major${minors[i] ? ' / ' + prettyName(minors[i]) + ' minor' : ''}`));
    block.appendChild(el('p', {}, `Key signature: ${sigText}`));
    block.appendChild(drawStaff({ clef: 'treble', keySignature: ks.count ? ks : null, notes: pitches, caption: `${prettyName(tonic)} major scale with its key signature` }));
    block.appendChild(el('p', {}, `Scale: ${notes.map(prettyName).join(' – ')}`));
    block.appendChild(el('p', {}, `Tonic: ${prettyName(notes[0])} · Subdominant: ${prettyName(notes[3])} · Dominant: ${prettyName(notes[4])}`));
    block.appendChild(el('button', { class: 'btn btn-secondary', onclick: () => AudioLab.playScale(pitches) }, '▶ Play scale'));
    box.appendChild(block);
  });
}

/* ============================================================
   app.js (Part 3): Quiz engine — setup, runner, visuals, grading
   ============================================================ */

let QUIZ_SESSION = null;

function questionMatchesBoard(question, board) {
  if (!board) return true;
  if (board === 'general') return question.examBoard === 'general' || question.examBoard === 'core' || (Array.isArray(question.examBoard) && question.examBoard.includes('general'));
  return question.examBoard === board || (Array.isArray(question.examBoard) && question.examBoard.includes(board));
}

function startQuiz({ topicIds = null, maxDifficulty = null, minDifficulty = null, count = 10, mode = 'practice', timeLimitSec = null, examBoard = null, questions: directQuestions = null }) {
  let questions;
  if (directQuestions) {
    questions = shuffle(directQuestions).slice(0, Math.min(count || directQuestions.length, directQuestions.length));
  } else {
    let pool = QUIZ_BANK.filter(q => (!topicIds || topicIds.includes(q.topic)) && questionMatchesBoard(q, examBoard));
    if (maxDifficulty) pool = pool.filter(q => q.difficulty <= maxDifficulty);
    if (minDifficulty) pool = pool.filter(q => q.difficulty >= minDifficulty);
    if (mode === 'practice' && STATE.settings.difficulty && STATE.settings.difficulty !== 'mixed') {
      const map = { easy: 1, medium: 2, hard: 3, gcse: 4, challenge: 5 };
      const d = map[STATE.settings.difficulty];
      if (d) { const filtered = pool.filter(q => q.difficulty === d); if (filtered.length >= 4) pool = filtered; }
    }
    pool = shuffle(pool);
    if (mode === 'mock') pool = pool.sort((a, b) => a.difficulty - b.difficulty);
    questions = pool.slice(0, Math.min(count, pool.length));
  }
  if (!questions.length) {
    showToast('No questions match those settings yet — try a wider difficulty or another topic.', 'info');
    return;
  }
  QUIZ_SESSION = {
    questions, index: 0, correctCount: 0, answers: [], mode, timeLimitSec,
    remaining: timeLimitSec, timerId: null, finished: false
  };
  if (timeLimitSec) {
    QUIZ_SESSION.timerId = setInterval(() => {
      if (!QUIZ_SESSION) return;
      QUIZ_SESSION.remaining -= 1;
      const timerEl = document.getElementById('quiz-timer');
      if (timerEl) timerEl.textContent = formatTimer(QUIZ_SESSION.remaining);
      if (QUIZ_SESSION.remaining <= 0) { clearInterval(QUIZ_SESSION.timerId); finishQuiz(true); }
    }, 1000);
  }
  navigate('quiz-run');
}

function formatTimer(sec) {
  const s = Math.max(0, sec);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function renderQuizRunner(root) {
  if (!QUIZ_SESSION) { navigate('quiz'); return; }
  if (QUIZ_SESSION.index >= QUIZ_SESSION.questions.length || QUIZ_SESSION.finished) {
    return renderQuizResults(root);
  }
  const q = QUIZ_SESSION.questions[QUIZ_SESSION.index];
  const pct = Math.round((QUIZ_SESSION.index / QUIZ_SESSION.questions.length) * 100);

  const topBar = el('div', { class: 'quiz-topbar' }, [
    el('button', { class: 'btn-link', onclick: () => confirmQuitQuiz() }, '✕ Exit'),
    el('div', { class: 'quiz-progress-text' }, `Question ${QUIZ_SESSION.index + 1} / ${QUIZ_SESSION.questions.length}`),
    QUIZ_SESSION.timeLimitSec ? el('div', { class: 'quiz-timer', id: 'quiz-timer' }, formatTimer(QUIZ_SESSION.remaining)) : el('div', {}, '')
  ]);
  root.appendChild(topBar);
  root.appendChild(progressBar(pct, 'quiz-progress-bar'));

  const card = el('div', { class: 'panel-card quiz-card' });
  root.appendChild(card);

  card.appendChild(el('div', { class: 'quiz-meta-row' }, [
    el('span', { class: 'topic-chip' }, `${TOPIC_BY_ID[q.topic]?.icon || '🎵'} ${TOPIC_BY_ID[q.topic]?.title || q.topic}`),
    el('span', { class: 'diff-chip' }, difficultyStarsShort(q.difficulty) + ' ' + DIFFICULTY_LABELS[q.difficulty])
  ]));
  card.appendChild(el('h2', { class: 'quiz-prompt' }, q.prompt));

  const visualHost = el('div', { class: 'visual-host' });
  card.appendChild(visualHost);
  renderQuestionVisual(visualHost, q);

  const bodyHost = el('div', { class: 'quiz-body' });
  card.appendChild(bodyHost);

  if (q.type === 'typing') {
    renderTypingQuestionUI(bodyHost, q, (isCorrect, chosenText) => submitQuizAnswer(q, isCorrect, chosenText));
  } else if (q.type === 'order') {
    renderOrderQuestionUI(bodyHost, q, (isCorrect, chosenText) => submitQuizAnswer(q, isCorrect, chosenText));
  } else if (q.type === 'match') {
    renderMatchQuestionUI(bodyHost, q, (isCorrect, chosenText) => submitQuizAnswer(q, isCorrect, chosenText));
  } else {
    renderOptionQuestionUI(bodyHost, q, (isCorrect, chosenText) => submitQuizAnswer(q, isCorrect, chosenText));
  }
}

function confirmQuitQuiz() {
  if (confirm('Exit this quiz? Your progress on this session will be lost.')) {
    if (QUIZ_SESSION && QUIZ_SESSION.timerId) clearInterval(QUIZ_SESSION.timerId);
    QUIZ_SESSION = null;
    navigate('quiz');
  }
}

/* ---------- Visual rendering for questions ---------- */

/* every sounding pitch in a staff visual, in order (rests and barlines are skipped) */
function pitchesOfVisual(v) {
  if (v.chordNotes) return v.chordNotes.slice();
  const out = [];
  (v.notes || []).forEach(n => {
    if (typeof n === 'string') out.push(n);
    else if (n.chord) out.push(...n.chord);
    else if (n.pitch && !n.rest) out.push(n.pitch);
  });
  return out;
}

function soundOffNotice() {
  if (typeof AudioLab !== 'undefined' && !AudioLab.isEnabled()) { showToast('Sound is switched off — turn it on in Settings to hear this.', 'info'); return true; }
  return false;
}

function renderQuestionVisual(host, q) {
  host.innerHTML = '';
  if (!q.visual) {
    if (q.type === 'form' && q.pattern) {
      host.appendChild(el('div', { class: 'form-blocks form-blocks-lg' }, q.pattern.map(letter => el('span', { class: 'form-block form-block-' + letter }, letter))));
    }
    return;
  }
  const v = q.visual;
  if (v.kind === 'staff') {
    const { kind, action, ...staffOpts } = v;
    host.appendChild(drawStaff({ ...staffOpts, clef: v.clef || 'treble' }));
    if (v.silent) return;
    host.appendChild(el('button', { class: 'btn btn-secondary btn-sm', onclick: () => {
      if (soundOffNotice()) return;
      if (v.chordNotes) AudioLab.playChord(v.chordNotes);
      else if (v.harmonic) AudioLab.playChord(pitchesOfVisual(v));
      else AudioLab.playSequence(pitchesOfVisual(v), 0.55);
    } }, '▶ Play'));
  } else if (v.kind === 'rhythm') {
    host.appendChild(drawRhythmStrip(v.values, { timeSignature: v.timeSignature, endBarline: v.endBarline }));
    if (v.pattern) host.appendChild(el('button', { class: 'btn btn-secondary btn-sm', onclick: () => { if (!soundOffNotice()) AudioLab.playRhythm(v.pattern, v.bpm || 90, v.countIn || 0); } }, '▶ Play rhythm'));
  } else if (v.kind === 'audio') {
    host.appendChild(el('div', { class: 'audio-visual' }, [
      el('span', { class: 'audio-icon' }, '🔊'),
      el('span', {}, v.hint || 'Press play — listen carefully, you can replay as many times as you like.')
    ]));
    host.appendChild(el('button', { class: 'btn btn-primary btn-sm', onclick: () => playAudioVisual(v) }, '▶ Play sound'));
  }
}

function playAudioVisual(v) {
  if (soundOffNotice()) return;
  if (v.action === 'chord') AudioLab.playChord(v.notes);
  else if (v.action === 'interval') AudioLab.playInterval(v.notes[0], v.notes[1], v.mode || 'melodic');
  else if (v.action === 'scale') AudioLab.playScale(v.notes);
  else if (v.action === 'cadence') AudioLab.playCadence(v.chords);
  else if (v.action === 'melody') AudioLab.playSequence(v.notes, v.gap || 0.5, { duration: (v.gap || 0.5) * 0.92 });
  else if (v.action === 'rhythm') AudioLab.playRhythm(v.pattern, v.bpm || 90, v.countIn || 0);
}

/* ---------- Standard option (mcq / truefalse / texture / instrument / chord / interval / notation) ---------- */

function renderOptionQuestionUI(bodyHost, q, onDone) {
  const grid = el('div', { class: 'option-grid' });
  bodyHost.appendChild(grid);
  let answered = false;
  (q.options || []).forEach((opt, idx) => {
    const btn = el('button', { class: 'option-btn', onclick: () => {
      if (answered) return;
      answered = true;
      const correct = idx === q.answerIndex;
      Array.from(grid.children).forEach((c, ci) => {
        c.disabled = true;
        if (ci === q.answerIndex) c.classList.add('correct');
        else if (ci === idx) c.classList.add('incorrect');
      });
      showExplanation(bodyHost, correct, `Correct answer: ${q.answer || q.options[q.answerIndex]}. ${q.explanation}`);
      appendContinueButton(bodyHost, () => onDone(correct, opt));
    } }, opt);
    grid.appendChild(btn);
  });
}

function normaliseTypedAnswer(value) {
  return String(value).trim().toLowerCase().replace(/[\u2013\u2014]/g, '-').replace(/[^a-z0-9#♯♭+\- ]/g, '').replace(/\s+/g, ' ');
}

function renderTypingQuestionUI(bodyHost, q, onDone) {
  const form = el('form', { class: 'typing-answer-form', onsubmit: event => {
    event.preventDefault();
    const input = form.querySelector('input');
    const typed = input.value.trim();
    if (!typed) return;
    const accepted = [q.answer, ...(q.acceptedAnswers || [])].map(normaliseTypedAnswer);
    const correct = accepted.includes(normaliseTypedAnswer(typed));
    input.disabled = true;
    showExplanation(bodyHost, correct, `Correct answer: ${q.answer}. ${q.explanation}`);
    appendContinueButton(bodyHost, () => onDone(correct, typed));
  } }, [
    el('input', { class: 'typing-answer-input', type: 'text', autocomplete: 'off', placeholder: 'Type your answer', 'aria-label': 'Your answer' }),
    el('button', { class: 'btn btn-primary', type: 'submit' }, 'Submit answer')
  ]);
  bodyHost.appendChild(form);
}

function showExplanation(host, correct, text) {
  host.appendChild(el('div', { class: 'explanation-box ' + (correct ? 'good' : 'bad') }, [
    el('strong', {}, correct ? '✅ Correct! ' : '❌ Not quite. '), text
  ]));
}

function appendContinueButton(host, cb) {
  host.appendChild(el('button', { class: 'btn btn-primary continue-btn', onclick: cb }, 'Continue →'));
}

/* ---------- Order (drag-and-drop) question UI ---------- */

function renderOrderQuestionUI(bodyHost, q, onDone) {
  const shuffled = shuffle(q.items);
  const list = el('div', { class: 'sortable-list' });
  shuffled.forEach(item => {
    list.appendChild(el('div', { class: 'sortable-item', 'data-value': item }, [
      el('span', { class: 'drag-handle' }, '⠿'), el('span', {}, item)
    ]));
  });
  bodyHost.appendChild(el('p', { class: 'hint-text' }, 'Drag the items into order, then check your answer.'));
  bodyHost.appendChild(list);
  makeSortable(list);
  bodyHost.appendChild(el('button', { class: 'btn btn-primary', onclick: () => {
    const order = Array.from(list.children).map(c => c.dataset.value);
    const correct = JSON.stringify(order) === JSON.stringify(q.items);
    Array.from(list.children).forEach(c => c.classList.add(correct ? 'order-correct' : 'order-incorrect'));
    showExplanation(bodyHost, correct, q.explanation + (correct ? '' : ` Correct order: ${q.items.join(' → ')}.`));
    appendContinueButton(bodyHost, () => onDone(correct, order.join(' → ')));
  } }, 'Check order'));
}

function makeSortable(listEl) {
  let dragEl = null;
  Array.from(listEl.children).forEach(item => {
    item.style.touchAction = 'none';
    item.addEventListener('pointerdown', e => {
      dragEl = item;
      item.classList.add('dragging');
      try { item.setPointerCapture(e.pointerId); } catch (err) {}
    });
    item.addEventListener('pointermove', e => {
      if (dragEl !== item) return;
      const after = getDragAfterElement(listEl, e.clientY);
      if (after == null) listEl.appendChild(item);
      else listEl.insertBefore(item, after);
    });
    const stop = () => { if (dragEl === item) { item.classList.remove('dragging'); dragEl = null; } };
    item.addEventListener('pointerup', stop);
    item.addEventListener('pointercancel', stop);
  });
}

function getDragAfterElement(container, y) {
  const els = [...container.querySelectorAll('.sortable-item:not(.dragging)')];
  return els.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) return { offset, element: child };
    return closest;
  }, { offset: -Infinity, element: null }).element;
}

/* ---------- Match (terms to definitions) question UI ---------- */

function renderMatchQuestionUI(bodyHost, q, onDone) {
  const terms = shuffle(q.pairs.map(p => p.term));
  const defs = shuffle(q.pairs.map(p => p.def));
  let selectedTerm = null, matchedCount = 0, mistakesMade = false;
  const wrap = el('div', { class: 'match-wrap' });
  const termCol = el('div', { class: 'match-col' });
  const defCol = el('div', { class: 'match-col' });
  wrap.appendChild(termCol); wrap.appendChild(defCol);
  bodyHost.appendChild(el('p', { class: 'hint-text' }, 'Tap a term, then tap its matching definition.'));
  bodyHost.appendChild(wrap);

  const termBtns = terms.map(term => {
    const b = el('button', { class: 'match-chip', onclick: () => {
      if (b.classList.contains('matched')) return;
      Array.from(termCol.children).forEach(c => c.classList.remove('selected'));
      selectedTerm = term;
      b.classList.add('selected');
    } }, term);
    termCol.appendChild(b);
    return b;
  });
  defs.forEach(def => {
    const b = el('button', { class: 'match-chip', onclick: () => {
      if (b.classList.contains('matched') || !selectedTerm) return;
      const correctPair = q.pairs.find(p => p.term === selectedTerm);
      const termBtn = termBtns.find(tb => tb.textContent === selectedTerm);
      if (correctPair.def === def) {
        b.classList.add('matched'); termBtn.classList.add('matched', 'selected-none');
        termBtn.classList.remove('selected');
        matchedCount++;
        selectedTerm = null;
        if (matchedCount === q.pairs.length) {
          const answerText = q.answer || q.pairs.map(pair => `${pair.term} = ${pair.def}`).join('; ');
          showExplanation(bodyHost, !mistakesMade, `Correct matches: ${answerText}. ${q.explanation}`);
          appendContinueButton(bodyHost, () => onDone(!mistakesMade, 'matched all pairs'));
        }
      } else {
        mistakesMade = true;
        b.classList.add('shake'); termBtn.classList.add('shake');
        setTimeout(() => { b.classList.remove('shake'); termBtn.classList.remove('shake'); termBtn.classList.remove('selected'); }, 400);
        selectedTerm = null;
      }
    } }, def);
    defCol.appendChild(b);
  });
}

/* ---------- Submitting an answer within a running quiz session ---------- */

function submitQuizAnswer(q, isCorrect, chosenText) {
  recordAnswer(q, isCorrect, chosenText);
  QUIZ_SESSION.answers.push({ q, isCorrect, chosenText });
  if (isCorrect) QUIZ_SESSION.correctCount++;
  QUIZ_SESSION.index++;
  render();
}

function finishQuiz(timedOut) {
  QUIZ_SESSION.finished = true;
  if (QUIZ_SESSION.timerId) clearInterval(QUIZ_SESSION.timerId);
  render();
}

function renderQuizResults(root) {
  const s = QUIZ_SESSION;
  const total = s.questions.length;
  const correct = s.correctCount;
  const pct = total ? Math.round((correct / total) * 100) : 0;

  root.appendChild(el('div', { class: 'panel-card results-card' }, [
    el('h1', {}, pct >= 80 ? '🌟 Excellent work!' : pct >= 50 ? '👍 Good effort!' : '💪 Keep practising!'),
    el('div', { class: 'results-score' }, `${correct} / ${total}`),
    el('div', { class: 'results-pct' }, `${pct}%`),
    progressBar(pct),
    el('p', { class: 'results-summary' }, `Correct: ${correct} · Incorrect: ${total - correct}`)
  ]));

  const byTopic = {};
  s.answers.forEach(a => {
    byTopic[a.q.topic] = byTopic[a.q.topic] || { correct: 0, total: 0 };
    byTopic[a.q.topic].total++;
    if (a.isCorrect) byTopic[a.q.topic].correct++;
  });
  const breakdown = el('div', { class: 'panel-card' }, [el('h3', {}, 'Topic breakdown')]);
  Object.entries(byTopic).forEach(([topicId, v]) => {
    const p = Math.round((v.correct / v.total) * 100);
    breakdown.appendChild(el('div', { class: 'breakdown-row' }, [
      el('span', {}, `${TOPIC_BY_ID[topicId]?.icon || ''} ${TOPIC_BY_ID[topicId]?.title || topicId}`),
      el('span', {}, `${v.correct}/${v.total}`),
      progressBar(p, 'breakdown-bar')
    ]));
  });
  root.appendChild(breakdown);

  const weakTopics = Object.entries(byTopic)
    .filter(([, value]) => value.correct / value.total < 0.7)
    .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total));
  root.appendChild(el('div', { class: 'panel-card' }, [
    el('h3', {}, weakTopics.length ? '📚 Revision recommendations' : '✅ No weak topics in this quiz'),
    weakTopics.length
      ? el('ul', { class: 'mini-list' }, weakTopics.slice(0, 3).map(([topicId, value]) => el('li', {}, `${TOPIC_BY_ID[topicId]?.title || topicId}: ${value.correct}/${value.total} — revise this topic.`)))
      : el('p', {}, 'You reached at least 70% in every topic tested. Try a harder mode next.')
  ]));

  const wrong = s.answers.filter(a => !a.isCorrect);
  if (wrong.length) {
    const mistakesCard = el('div', { class: 'panel-card' }, [el('h3', {}, 'Questions to revisit')]);
    wrong.forEach(a => {
      mistakesCard.appendChild(el('div', { class: 'mistake-item' }, [
        el('p', { class: 'mistake-q' }, a.q.prompt),
        el('p', { class: 'mistake-you' }, `Your answer: ${a.chosenText}`),
        el('p', { class: 'mistake-correct' }, `Correct answer: ${a.q.answer || (a.q.options ? a.q.options[a.q.answerIndex] : '')}`),
        el('p', { class: 'mistake-explain' }, a.q.explanation)
      ]));
    });
    root.appendChild(mistakesCard);
  }

  if (s.mode === 'mock') {
    STATE.mockExamHistory.unshift({ date: todayStr(), score: correct, total, pct, breakdown: byTopic });
    persist();
    checkBadgesAndNotify();
    const weakest = Object.entries(byTopic).sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))[0];
    if (weakest) {
      root.appendChild(el('div', { class: 'panel-card' }, [
        el('h3', {}, '📚 Recommended revision'),
        el('p', {}, `Focus next on ${TOPIC_BY_ID[weakest[0]]?.title || weakest[0]} — that\u2019s where you lost the most marks.`),
        el('button', { class: 'btn btn-primary', onclick: () => navigate('learn', { topicId: weakest[0] }) }, 'Revise this topic')
      ]));
    }
  }
  if (s.mode === 'daily') {
    STATE.dailyChallenge = { date: todayStr(), completed: true, score: correct };
    addXp(50, 'daily challenge');
    persist();
  }

  root.appendChild(el('div', { class: 'result-actions' }, [
    el('button', { class: 'btn btn-secondary', onclick: () => { QUIZ_SESSION = null; navigate(s.mode === 'mock' ? 'mock' : 'quiz'); } }, 'Back'),
    el('button', { class: 'btn btn-primary', onclick: () => { QUIZ_SESSION = null; navigate('home'); } }, 'Home')
  ]));
}

/* ---------- Quiz setup screen ---------- */

function renderQuizSetup(root) {
  root.appendChild(el('h1', { class: 'page-title' }, '❓ Quiz'));
  root.appendChild(el('p', { class: 'page-sub' }, 'Practise a large question bank: multiple choice, notation, intervals, chords, matching, drag-and-drop and more.'));
  root.appendChild(el('div', { class: 'panel-card trainer-promo' }, [
    el('h3', {}, '🎼 Notation Trainer'),
    el('p', {}, 'Unlimited practice reading treble, bass and alto clef: note names, clefs, key signatures, intervals and note values — with instant explanations.'),
    el('button', { class: 'btn btn-secondary', onclick: () => navigate('trainer') }, 'Open the trainer →')
  ]));

  let selectedTopics = new Set();
  let selectedDiff = 'mixed';
  let selectedCount = 10;
  let selectedBoard = null;
  let selectedPresetTopics = null;

  const modeGrid = el('div', { class: 'select-grid' });
  [
    ['mixed', 'Mixed quiz', null, null],
    ['theory', 'Music theory quiz', TOPICS.filter(topic => topic.id !== 'listening').map(topic => topic.id), null],
    ['notation-mode', 'Notation quiz', ['notation'], null],
    ['listening-mode', 'Listening quiz', ['listening'], null],
    ['aqa-mode', 'AQA quiz', null, 'aqa'],
    ['eduqas-mode', 'Eduqas quiz', null, 'eduqas']
  ].forEach(([id, label, topics, board]) => {
    const chip = el('button', { class: 'select-chip' + (id === 'mixed' ? ' active' : ''), onclick: () => {
      selectedBoard = board;
      selectedPresetTopics = topics;
      Array.from(modeGrid.children).forEach(button => button.classList.remove('active'));
      chip.classList.add('active');
    } }, label);
    modeGrid.appendChild(chip);
  });

  const countGrid = el('div', { class: 'select-grid' });
  [[10, '10 questions'], [20, '20 questions'], [50, '50 questions']].forEach(([count, label], index) => {
    const chip = el('button', { class: 'select-chip' + (index === 0 ? ' active' : ''), onclick: () => {
      selectedCount = count;
      Array.from(countGrid.children).forEach(button => button.classList.remove('active'));
      chip.classList.add('active');
    } }, label);
    countGrid.appendChild(chip);
  });

  const topicGrid = el('div', { class: 'select-grid' });
  TOPICS.forEach(t => {
    const chip = el('button', { class: 'select-chip', onclick: () => {
      selectedPresetTopics = null;
      selectedBoard = null;
      if (selectedTopics.has(t.id)) { selectedTopics.delete(t.id); chip.classList.remove('active'); }
      else { selectedTopics.add(t.id); chip.classList.add('active'); }
    } }, `${t.icon} ${t.title}`);
    topicGrid.appendChild(chip);
  });

  const diffGrid = el('div', { class: 'select-grid' });
  [['mixed', 'Mixed'], [1, '⭐ Easy'], [2, '⭐⭐ Medium'], [3, '⭐⭐⭐ Hard'], [4, '⭐⭐⭐⭐ GCSE Exam'], [5, '⭐⭐⭐⭐⭐ Challenge']].forEach(([val, label]) => {
    const chip = el('button', { class: 'select-chip' + (val === 'mixed' ? ' active' : ''), onclick: () => {
      selectedDiff = val;
      Array.from(diffGrid.children).forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    } }, label);
    diffGrid.appendChild(chip);
  });

  root.appendChild(el('div', { class: 'panel-card' }, [
    el('h3', {}, 'Quiz mode'),
    modeGrid,
    el('h3', { class: 'mt' }, 'Quiz length'),
    countGrid,
    el('h3', {}, 'Choose topics (leave blank for all)'),
    topicGrid,
    el('h3', { class: 'mt' }, 'Difficulty'),
    diffGrid,
    el('button', { class: 'btn btn-primary btn-lg mt', onclick: () => {
      const topicIds = selectedTopics.size ? Array.from(selectedTopics) : selectedPresetTopics;
      startQuiz({ topicIds, examBoard: selectedBoard, maxDifficulty: selectedDiff === 'mixed' ? null : selectedDiff, minDifficulty: selectedDiff === 'mixed' ? null : selectedDiff, count: selectedCount, mode: 'practice' });
    } }, 'Start selected quiz →')
  ]));

  root.appendChild(el('div', { class: 'panel-card' }, [
    el('h3', {}, '🔁 Retry your mistakes'),
    el('p', {}, `You have ${STATE.mistakes.length} logged mistake${STATE.mistakes.length === 1 ? '' : 's'}.`),
    el('button', { class: 'btn btn-secondary', disabled: !STATE.mistakes.length, onclick: () => navigate('mistakes') }, 'Open Mistake Bank')
  ]));
}

/* ============================================================
   app.js (Part 4): Flashcards, Listening Lab, Mock Exam,
   Progress, Settings, Mistake Bank, Daily Challenge, Study Mode
   ============================================================ */

/* ---------- Flashcards ---------- */

const FC_UI = { topic: 'all', board: 'all', difficulty: 'all', status: 'all', index: 0, flipped: false, rank: null };

function currentDeck() {
  const filtered = FLASHCARDS.filter(card => {
    const status = STATE.flashcardStatus[card.id] || 'unseen';
    const boardMatch = FC_UI.board === 'all' || card.examBoard === FC_UI.board || (Array.isArray(card.examBoard) && card.examBoard.includes(FC_UI.board));
    const topicMatch = FC_UI.topic === 'all' || card.topic === FC_UI.topic;
    const difficultyMatch = FC_UI.difficulty === 'all' || card.difficulty === Number(FC_UI.difficulty);
    const statusMatch = FC_UI.status === 'all' || status === FC_UI.status;
    return boardMatch && topicMatch && difficultyMatch && statusMatch;
  });
  if (FC_UI.rank) filtered.sort((a, b) => (FC_UI.rank[a.id] ?? 0) - (FC_UI.rank[b.id] ?? 0));
  return filtered;
}

/* a small visual (staff / rhythm) that can appear on either face of a flashcard */
function buildCardVisual(v) {
  if (!v) return null;
  if (v.kind === 'rhythm') return el('div', { class: 'flashcard-visual' }, [drawRhythmStrip(v.values, { timeSignature: v.timeSignature, width: 300 })]);
  const { kind, ...staffOpts } = v;
  return el('div', { class: 'flashcard-visual' }, [drawStaff({ width: 300, ...staffOpts, clef: v.clef || 'treble' })]);
}

function shuffleFlashcards() {
  FC_UI.rank = {};
  FLASHCARDS.forEach(c => { FC_UI.rank[c.id] = Math.random(); });
  FC_UI.index = 0; FC_UI.flipped = false;
}

function setFlashcardFilter(key, value) {
  FC_UI[key] = value;
  FC_UI.index = 0;
  FC_UI.flipped = false;
  render();
}

function flashcardFilterChip(label, key, value) {
  return el('button', {
    class: 'select-chip' + (FC_UI[key] === value ? ' active' : ''),
    onclick: () => setFlashcardFilter(key, value)
  }, label);
}

function renderFlashcards(root) {
  root.appendChild(el('h1', { class: 'page-title' }, '🗂️ Flashcards'));
  const knownCount = FLASHCARDS.filter(card => STATE.flashcardStatus[card.id] === 'known').length;
  const difficultCount = FLASHCARDS.filter(card => STATE.flashcardStatus[card.id] === 'difficult').length;
  root.appendChild(el('p', { class: 'page-sub' }, `${FLASHCARDS.length} cards · ${knownCount} known · ${difficultCount} to retry`));

  root.appendChild(el('div', { class: 'flashcard-filter-panel panel-card' }, [
    el('h3', {}, 'Topic'),
    el('div', { class: 'select-grid' }, [flashcardFilterChip('All topics', 'topic', 'all'), ...TOPICS.map(t => flashcardFilterChip(`${t.icon} ${t.title}`, 'topic', t.id))]),
    el('h3', { class: 'mt' }, 'Exam board'),
    el('div', { class: 'select-grid' }, [
      flashcardFilterChip('All boards', 'board', 'all'), flashcardFilterChip('General theory', 'board', 'general'),
      flashcardFilterChip('AQA', 'board', 'aqa'), flashcardFilterChip('Eduqas', 'board', 'eduqas')
    ]),
    el('h3', { class: 'mt' }, 'Difficulty'),
    el('div', { class: 'select-grid' }, [
      flashcardFilterChip('All levels', 'difficulty', 'all'), flashcardFilterChip('Foundation', 'difficulty', 1),
      flashcardFilterChip('Core', 'difficulty', 2), flashcardFilterChip('Challenge', 'difficulty', 3)
    ]),
    el('h3', { class: 'mt' }, 'Review status'),
    el('div', { class: 'select-grid' }, [
      flashcardFilterChip('All cards', 'status', 'all'), flashcardFilterChip('Unseen', 'status', 'unseen'),
      flashcardFilterChip('Known', 'status', 'known'), flashcardFilterChip('Retry difficult', 'status', 'difficult')
    ])
  ]));

  const deck = currentDeck();
  if (!deck.length) {
    root.appendChild(el('div', { class: 'panel-card' }, el('p', {}, 'No cards in this deck yet.')));
    return;
  }
  FC_UI.index = clamp(FC_UI.index, 0, deck.length - 1);
  const card = deck[FC_UI.index];
  const status = STATE.flashcardStatus[card.id];

  const hasVisual = !!(card.visual || card.backVisual);
  const cardEl = el('div', { class: 'flashcard' + (hasVisual ? ' has-visual' : '') + (FC_UI.flipped ? ' flipped' : ''), tabindex: '0', role: 'button', 'aria-label': 'Flashcard — press Enter or Space to flip', onclick: () => { FC_UI.flipped = !FC_UI.flipped; cardEl.classList.toggle('flipped', FC_UI.flipped); }, onkeydown: ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); FC_UI.flipped = !FC_UI.flipped; cardEl.classList.toggle('flipped', FC_UI.flipped); } } }, [
    el('div', { class: 'flashcard-inner' }, [
      el('div', { class: 'flashcard-face flashcard-front' }, [
        el('span', { class: 'flashcard-topic' }, TOPIC_BY_ID[card.topic]?.icon || '🎵'),
        buildCardVisual(card.visual),
        el('div', { class: 'flashcard-term' }, card.term)
      ]),
      el('div', { class: 'flashcard-face flashcard-back' }, [buildCardVisual(card.backVisual), el('div', { class: 'flashcard-def' }, card.definition)])
    ])
  ]);
  root.appendChild(el('div', { class: 'flashcard-stage' }, [
    el('div', { class: 'flashcard-counter' }, `${FC_UI.index + 1} / ${deck.length}${status ? ' · ' + (status === 'difficult' ? '⚠️ Marked difficult' : '✅ Known') : ''}`),
    cardEl,
    el('p', { class: 'hint-text' }, 'Tap the card to flip it.')
  ]));

  root.appendChild(el('div', { class: 'flashcard-controls' }, [
    el('button', { class: 'btn btn-secondary', onclick: () => { FC_UI.index = (FC_UI.index - 1 + deck.length) % deck.length; FC_UI.flipped = false; render(); } }, '← Previous'),
    el('button', { class: 'btn btn-danger', onclick: () => { STATE.flashcardStatus[card.id] = 'difficult'; persist(); FC_UI.index = (FC_UI.index + 1) % deck.length; FC_UI.flipped = false; render(); } }, '⚠️ Difficult'),
    el('button', { class: 'btn btn-success', onclick: () => { STATE.flashcardStatus[card.id] = 'known'; persist(); FC_UI.index = (FC_UI.index + 1) % deck.length; FC_UI.flipped = false; render(); } }, '✅ Known'),
    el('button', { class: 'btn btn-secondary', onclick: () => { FC_UI.index = (FC_UI.index + 1) % deck.length; FC_UI.flipped = false; render(); } }, 'Next →'),
    el('button', { class: 'btn btn-secondary', onclick: () => { shuffleFlashcards(); render(); } }, '🔀 Shuffle deck'),
    FC_UI.rank ? el('button', { class: 'btn btn-secondary', onclick: () => { FC_UI.rank = null; FC_UI.index = 0; FC_UI.flipped = false; render(); } }, '↩ Original order') : null
  ]));
}

/* ---------- Listening Lab ---------- */

function renderListeningLab(root) {
  root.appendChild(el('h1', { class: 'page-title' }, '👂 Listening Lab'));
  root.appendChild(el('p', { class: 'page-sub' }, 'Train your ear using the Web Audio synth — then test yourself with real listening-style questions.'));

  const grid = el('div', { class: 'listening-grid' });

  grid.appendChild(labCard('Single note', 'Play middle C.', () => AudioLab.playNote('C4', { duration: 1 })));
  grid.appendChild(labCard('Major triad', 'C major (C-E-G).', () => AudioLab.playChord(['C4', 'E4', 'G4'])));
  grid.appendChild(labCard('Minor triad', 'C minor (C-E♭-G).', () => AudioLab.playChord(['C4', 'Eb4', 'G4'])));
  grid.appendChild(labCard('Perfect 5th', 'C up to G, played melodically.', () => AudioLab.playInterval('C4', 'G4')));
  grid.appendChild(labCard('Major 3rd vs minor 3rd', 'C-E then C-E♭ — listen for the difference.', () => {
    AudioLab.playInterval('C4', 'E4', 'harmonic');
    setTimeout(() => AudioLab.playInterval('C4', 'Eb4', 'harmonic'), 1400);
  }));
  grid.appendChild(labCard('Major scale', 'C major ascending.', () => AudioLab.playScale(['C4','D4','E4','F4','G4','A4','B4','C5'])));
  grid.appendChild(labCard('Natural minor scale', 'A natural minor ascending.', () => AudioLab.playScale(['A4','B4','C5','D5','E5','F5','G5','A5'])));
  grid.appendChild(labCard('Perfect cadence', 'V–I in C major.', () => AudioLab.playCadence([['G4','B4','D5'],['C4','E4','G4']])));
  grid.appendChild(labCard('Plagal cadence', 'IV–I ("Amen") in C major.', () => AudioLab.playCadence([['F4','A4','C5'],['C4','E4','G4']])));
  grid.appendChild(labCard('Imperfect cadence', 'I–V in C major (unfinished).', () => AudioLab.playCadence([['C4','E4','G4'],['G4','B4','D5']])));
  grid.appendChild(labCard('Simple rhythm click', 'Four steady clicks at 100bpm.', () => AudioLab.playRhythm([1,1,1,1], 100)));
  grid.appendChild(labCard('Syncopated rhythm', 'Short-long-short pattern.', () => AudioLab.playRhythm([0.5,1,0.5,1,0.5,0.5], 100)));

  root.appendChild(grid);

  root.appendChild(el('div', { class: 'panel-card' }, [
    el('h3', {}, '🎧 Ready to test yourself?'),
    el('p', {}, 'Take a Listening Lab quiz — identify major/minor, intervals, scales and cadences by ear.'),
    el('button', { class: 'btn btn-primary btn-lg', onclick: () => startQuiz({ topicIds: ['listening'], count: 10, mode: 'practice' }) }, 'Start Listening Quiz →')
  ]));
}

function labCard(title, desc, onPlay) {
  return el('div', { class: 'lab-card' }, [
    el('h4', {}, title), el('p', {}, desc),
    el('button', { class: 'btn btn-secondary', onclick: onPlay }, '▶ Play')
  ]);
}

/* ---------- Mock Exam ---------- */

function renderMockSetup(root) {
  root.appendChild(el('h1', { class: 'page-title' }, '📝 Mock Exam'));
  root.appendChild(el('p', { class: 'page-sub' }, 'A timed, mixed-topic exam that gets progressively harder — just like the real thing. Answers are hidden until you submit each question.'));

  root.appendChild(el('div', { class: 'panel-card' }, [
    el('h3', {}, 'Choose a mock exam length'),
    el('div', { class: 'select-grid' }, [
      ['Short', 10, 8 * 60], ['Standard', 20, 15 * 60], ['Full', 30, 22 * 60]
    ].map(([label, qCount, secs]) => el('button', { class: 'btn btn-primary', onclick: () => startQuiz({ mode: 'mock', count: qCount, timeLimitSec: secs, topicIds: null }) }, `${label} — ${qCount} Qs (~${Math.round(secs / 60)} min)`)))
  ]));

  if (STATE.mockExamHistory.length) {
    const hist = el('div', { class: 'panel-card' }, [el('h3', {}, 'Past mock exams')]);
    STATE.mockExamHistory.slice(0, 8).forEach(m => {
      hist.appendChild(el('div', { class: 'breakdown-row' }, [
        el('span', {}, m.date), el('span', {}, `${m.score}/${m.total}`), progressBar(m.pct, 'breakdown-bar')
      ]));
    });
    root.appendChild(hist);
  }
}

/* ---------- Progress ---------- */

function renderProgress(root) {
  root.appendChild(el('h1', { class: 'page-title' }, '📊 Progress'));
  const accuracy = STATE.questionsAnswered ? Math.round((STATE.questionsCorrect / STATE.questionsAnswered) * 100) : 0;

  root.appendChild(el('section', { class: 'stat-grid' }, [
    statCard('❓', 'Answered', STATE.questionsAnswered),
    statCard('🎯', 'Accuracy', accuracy + '%'),
    statCard('🔥', 'Best streak', STATE.correctStreakBest),
    statCard('📅', 'Best daily streak', STATE.streakBest)
  ]));

  const masteryCard = el('div', { class: 'panel-card' }, [el('h3', {}, 'Topic mastery')]);
  TOPICS.forEach(t => {
    const stat = STATE.topicStats[t.id];
    const pct = stat && stat.attempts ? Math.round((stat.correct / stat.attempts) * 100) : 0;
    const m = masteryOf(STATE, t.id);
    masteryCard.appendChild(el('div', { class: 'breakdown-row' }, [
      el('span', {}, `${t.icon} ${t.title}`),
      el('span', { class: 'mastery-icon' }, m.icon),
      el('span', {}, stat ? `${stat.correct}/${stat.attempts}` : '—'),
      progressBar(pct, 'breakdown-bar')
    ]));
  });
  root.appendChild(masteryCard);

  const sorted = TOPICS.map(t => {
    const stat = STATE.topicStats[t.id];
    const acc = stat && stat.attempts >= 3 ? stat.correct / stat.attempts : null;
    return { t, acc };
  }).filter(x => x.acc !== null).sort((a, b) => b.acc - a.acc);
  if (sorted.length) {
    const strongWeak = el('div', { class: 'card-grid' });
    strongWeak.appendChild(el('div', { class: 'panel-card' }, [
      el('h3', {}, '💪 Strongest topics'),
      el('ul', { class: 'mini-list' }, sorted.slice(0, 3).map(x => el('li', {}, `${x.t.icon} ${x.t.title} — ${Math.round(x.acc * 100)}%`)))
    ]));
    strongWeak.appendChild(el('div', { class: 'panel-card' }, [
      el('h3', {}, '📌 Needs work'),
      el('ul', { class: 'mini-list' }, sorted.slice(-3).reverse().map(x => el('li', {}, `${x.t.icon} ${x.t.title} — ${Math.round(x.acc * 100)}%`)))
    ]));
    root.appendChild(strongWeak);
  }

  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    last7.push({ key, xp: STATE.xpLog[key] || 0, label: d.toLocaleDateString(undefined, { weekday: 'short' }) });
  }
  const maxXp = Math.max(1, ...last7.map(d => d.xp));
  root.appendChild(el('div', { class: 'panel-card' }, [
    el('h3', {}, 'XP earned — last 7 days'),
    el('div', { class: 'xp-chart' }, last7.map(d => el('div', { class: 'xp-bar-col' }, [
      el('div', { class: 'xp-bar', style: `height:${Math.max(4, (d.xp / maxXp) * 100)}px` }),
      el('div', { class: 'xp-bar-label' }, d.label),
      el('div', { class: 'xp-bar-value' }, String(d.xp))
    ])))
  ]));

  root.appendChild(el('div', { class: 'panel-card' }, [
    el('h3', {}, '🏅 Badges'),
    el('div', { class: 'badge-grid' }, BADGES.map(b => {
      const earned = STATE.badges.includes(b.id);
      return el('div', { class: 'badge-item' + (earned ? ' earned' : '') }, [
        el('div', { class: 'badge-icon' }, b.icon), el('div', { class: 'badge-name' }, b.name), el('div', { class: 'badge-desc' }, b.desc)
      ]);
    }))
  ]));
}

/* ---------- Settings ---------- */

function buildAccountPanel() {
  const acct = getAuthAccount() || {};
  const msg = el('p', { class: 'auth-message', role: 'status', 'aria-live': 'polite' }, '');
  msg.style.display = 'none';
  const say = (t, k) => { msg.textContent = t; msg.className = 'auth-message ' + (k || 'error'); msg.style.display = t ? '' : 'none'; };
  const mk = (id, ph, ac) => el('input', { id, type: 'password', placeholder: ph, autocomplete: ac, class: 'settings-input' });
  const cur = mk('acct-current', 'Current password', 'current-password');
  const nw = mk('acct-new', 'New password (8+ characters)', 'new-password');
  const nw2 = mk('acct-new2', 'Confirm new password', 'new-password');
  const form = el('form', { class: 'account-form', novalidate: 'novalidate' }, [
    el('h4', {}, 'Change password'),
    cur, nw, nw2, msg,
    el('button', { class: 'btn btn-secondary', type: 'submit' }, 'Update password')
  ]);
  form.addEventListener('submit', async ev => {
    ev.preventDefault();
    if (!(await verifyPassword(getAuthAccount(), cur.value))) return say('Your current password is not right.');
    const err = validatePassword(nw.value, acct.username, acct.email) || (nw.value !== nw2.value ? 'The two new passwords do not match.' : '');
    if (err) return say(err);
    await setAccountPassword(nw.value);
    cur.value = nw.value = nw2.value = '';
    say('Password updated.', 'success');
  });

  const avatarHost = el('div', {}, [avatarSvg(getAccountAvatarConfig(), 64)]);
  const editorHost = el('div', { class: 'avatar-editor-host' });
  const changeAvatarBtn = el('button', {
    class: 'btn btn-secondary btn-sm', type: 'button',
    onclick: () => {
      if (editorHost.childElementCount) { editorHost.innerHTML = ''; return; }
      const { node: pickerNode, getConfig } = buildAvatarPicker(getAccountAvatarConfig());
      const saveBtn = el('button', {
        class: 'btn btn-primary btn-sm', type: 'button', onclick: () => {
          saveAuthAccount({ ...getAuthAccount(), avatar: getConfig() });
          avatarHost.innerHTML = ''; avatarHost.appendChild(avatarSvg(getAccountAvatarConfig(), 64));
          editorHost.innerHTML = '';
        }
      }, 'Save avatar');
      editorHost.appendChild(el('div', { class: 'wi-avatar-picker settings-avatar-picker' }, [pickerNode, saveBtn]));
    }
  }, '🎨 Change avatar');

  return el('div', { class: 'panel-card account-card' }, [
    el('h3', {}, '👤 Your account'),
    el('div', { class: 'account-head' }, [
      avatarHost,
      el('div', {}, [el('div', { class: 'account-name' }, acct.username || 'Musician'), el('div', { class: 'account-email' }, acct.email || '')]),
      changeAvatarBtn
    ]),
    editorHost,
    form,
    el('div', { class: 'account-actions' }, [
      el('button', { class: 'btn btn-secondary', type: 'button', onclick: () => logout() }, 'Log out'),
      el('button', {
        class: 'btn btn-secondary', type: 'button',
        onclick: () => { if (typeof WelcomeIntro !== 'undefined') WelcomeIntro.play({ replay: true, onDone: () => initApp() }); }
      }, '🎬 Replay welcome intro')

    ])
  ]);
}

function renderSettings(root) {
  root.appendChild(el('h1', { class: 'page-title' }, '⚙️ Settings'));
  root.appendChild(buildAccountPanel());

  root.appendChild(el('div', { class: 'panel-card' }, [
    el('h3', {}, 'Exam board'),
    el('div', { class: 'select-grid' }, ['general', 'aqa', 'eduqas'].map(b => el('button', {
      class: 'select-chip' + (STATE.examBoard === b ? ' active' : ''),
      onclick: () => { STATE.examBoard = b; persist(); render(); }
    }, b === 'general' ? 'General GCSE' : EXAM_BOARDS[b].name)))
  ]));

  root.appendChild(el('div', { class: 'panel-card' }, [
    el('h3', {}, 'Preferences'),
    settingsToggle('🔊 Sound effects', STATE.settings.sound, v => { STATE.settings.sound = v; AudioLab.setEnabled(v); persist(); }),
    settingsToggle('🌙 Dark mode', STATE.settings.darkMode, v => { STATE.settings.darkMode = v; applySettingsToDom(); persist(); }),
    settingsToggle('🎞️ Reduced animations', STATE.settings.reducedMotion, v => { STATE.settings.reducedMotion = v; applySettingsToDom(); persist(); })
  ]));

  root.appendChild(el('div', { class: 'panel-card' }, [
    el('h3', {}, 'Default question difficulty'),
    el('div', { class: 'select-grid' }, [['mixed', 'Mixed'], ['easy', '⭐ Easy'], ['medium', '⭐⭐ Medium'], ['hard', '⭐⭐⭐ Hard'], ['gcse', '⭐⭐⭐⭐ GCSE'], ['challenge', '⭐⭐⭐⭐⭐ Challenge']].map(([val, label]) =>
      el('button', { class: 'select-chip' + (STATE.settings.difficulty === val ? ' active' : ''), onclick: () => { STATE.settings.difficulty = val; persist(); render(); } }, label)
    ))
  ]));

  root.appendChild(el('div', { class: 'panel-card danger-zone' }, [
    el('h3', {}, '⚠️ Reset progress'),
    el('p', {}, 'This permanently deletes all XP, streaks, mastery, flashcard status and mistake history stored in this browser.'),
    el('button', { class: 'btn btn-danger', onclick: () => {
      if (confirm('Are you sure? This cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY);
        STATE = loadState();
        showToast('Progress reset.', 'info');
        navigate('home');
      }
    } }, 'Reset all progress')
  ]));
}

function settingsToggle(label, value, onChange) {
  const row = el('div', { class: 'toggle-row' });
  const sw = el('button', { class: 'switch' + (value ? ' on' : ''), onclick: () => { const nv = !sw.classList.contains('on'); sw.classList.toggle('on', nv); onChange(nv); } }, el('span', { class: 'switch-knob' }));
  row.appendChild(el('span', {}, label));
  row.appendChild(sw);
  return row;
}

/* ---------- Mistake Bank ---------- */

function renderMistakeBank(root) {
  root.appendChild(el('h1', { class: 'page-title' }, '📌 Mistake Bank'));
  root.appendChild(el('p', { class: 'page-sub' }, 'Every question you\u2019ve gotten wrong, with explanations — retry them any time.'));

  if (!STATE.mistakes.length) {
    root.appendChild(el('div', { class: 'panel-card' }, el('p', {}, 'No mistakes logged yet.')));
    return;
  }

  const qids = [...new Set(STATE.mistakes.map(m => m.qid))];
  const matched = qids.map(id => QUIZ_BANK.find(q => q.id === id)).filter(Boolean);
  root.appendChild(el('div', { class: 'panel-card' }, [
    el('button', { class: 'btn btn-primary btn-lg', disabled: !matched.length, onclick: () => startQuiz({ questions: matched, count: matched.length, mode: 'practice' }) }, `🔁 Retry all (${matched.length}) →`)
  ]));

  const list = el('div', { class: 'panel-card' });
  STATE.mistakes.slice(0, 50).forEach(m => {
    list.appendChild(el('div', { class: 'mistake-item' }, [
      el('p', { class: 'mistake-q' }, `${TOPIC_BY_ID[m.topic]?.icon || ''} ${m.question}`),
      el('p', { class: 'mistake-you' }, `Your answer: ${m.yourAnswer}`),
      el('p', { class: 'mistake-correct' }, `Correct answer: ${m.correctAnswer}`),
      el('p', { class: 'mistake-explain' }, m.explanation)
    ]));
  });
  root.appendChild(list);
}

/* ---------- Daily Challenge ---------- */

function renderDailyChallenge(root) {
  root.appendChild(el('h1', { class: 'page-title' }, '📅 Daily Challenge'));
  const done = STATE.dailyChallenge.date === todayStr() && STATE.dailyChallenge.completed;
  if (done) {
    root.appendChild(el('div', { class: 'panel-card' }, [
      el('h3', {}, `✅ Completed today — ${STATE.dailyChallenge.score}/5`),
      el('p', {}, 'Come back tomorrow for a new set of 5 questions.'),
      el('button', { class: 'btn btn-secondary', onclick: () => navigate('home') }, 'Back home')
    ]));
    return;
  }
  root.appendChild(el('div', { class: 'panel-card' }, [
    el('h3', {}, 'Today\u2019s Challenge'),
    el('p', {}, '5 questions from across your topics. +50 XP on completion.'),
    el('button', { class: 'btn btn-primary btn-lg', onclick: () => startQuiz({ topicIds: null, count: 5, mode: 'daily' }) }, 'Start →')
  ]));
}

/* ---------- Study Mode ---------- */

const STUDY_UI = { active: false, queue: [], pos: 0, endsAt: null, sessionXpStart: 0 };

function renderStudyMode(root) {
  if (!STUDY_UI.active) {
    root.appendChild(el('h1', { class: 'page-title' }, '⏱️ Study Mode'));
    root.appendChild(el('p', { class: 'page-sub' }, 'A focused session mixing lesson snippets, flashcards, quiz questions and mistakes.'));
    root.appendChild(el('div', { class: 'panel-card' }, [
      el('div', { class: 'select-grid' }, [['10 min', 10], ['20 min', 20], ['30 min', 30], ['Free study', 0]].map(([label, mins]) =>
        el('button', { class: 'btn btn-primary', onclick: () => beginStudySession(mins) }, label)
      ))
    ]));
    return;
  }
  renderStudyActivity(root);
}

function beginStudySession(minutes) {
  const itemCount = minutes ? Math.max(4, Math.round(minutes * 0.8)) : 12;
  const queue = [];
  for (let i = 0; i < itemCount; i++) {
    const roll = Math.random();
    if (roll < 0.3) queue.push({ kind: 'lesson', topic: shuffle(TOPICS)[0] });
    else if (roll < 0.55) queue.push({ kind: 'flashcard', card: shuffle(FLASHCARDS)[0] });
    else if (roll < 0.85) queue.push({ kind: 'quiz', q: shuffle(QUIZ_BANK)[0] });
    else if (STATE.mistakes.length) queue.push({ kind: 'mistake', m: shuffle(STATE.mistakes)[0] });
    else queue.push({ kind: 'quiz', q: shuffle(QUIZ_BANK)[0] });
  }
  STUDY_UI.active = true;
  STUDY_UI.queue = queue;
  STUDY_UI.pos = 0;
  STUDY_UI.endsAt = minutes ? Date.now() + minutes * 60000 : null;
  STUDY_UI.sessionXpStart = STATE.xp;
  render();
}

function endStudySession(root) {
  const earned = STATE.xp - STUDY_UI.sessionXpStart;
  STUDY_UI.active = false;
  root.innerHTML = '';
  root.appendChild(el('div', { class: 'panel-card results-card' }, [
    el('h1', {}, '✅ Session complete'),
    el('p', {}, `You earned ${earned} XP this session.`),
    el('button', { class: 'btn btn-primary', onclick: () => navigate('home') }, 'Back home')
  ]));
}

function renderStudyActivity(root) {
  if (STUDY_UI.endsAt && Date.now() > STUDY_UI.endsAt) return endStudySession(root);
  if (STUDY_UI.pos >= STUDY_UI.queue.length) return endStudySession(root);

  const item = STUDY_UI.queue[STUDY_UI.pos];
  const topBar = el('div', { class: 'quiz-topbar' }, [
    el('button', { class: 'btn-link', onclick: () => { STUDY_UI.active = false; navigate('home'); } }, '✕ End session'),
    el('div', { class: 'quiz-progress-text' }, `Item ${STUDY_UI.pos + 1} / ${STUDY_UI.queue.length}`)
  ]);
  root.appendChild(topBar);
  root.appendChild(progressBar(Math.round((STUDY_UI.pos / STUDY_UI.queue.length) * 100)));

  const card = el('div', { class: 'panel-card quiz-card' });
  root.appendChild(card);

  if (item.kind === 'lesson') {
    card.appendChild(el('span', { class: 'topic-chip' }, `${item.topic.icon} ${item.topic.title}`));
    const intro = item.topic.learn.split('</p>')[0] + '</p>';
    card.appendChild(el('div', { class: 'lesson-html', html: intro }));
    card.appendChild(el('button', { class: 'btn btn-primary continue-btn', onclick: () => { STUDY_UI.pos++; render(); } }, 'Continue →'));
  } else if (item.kind === 'flashcard') {
    let flipped = false;
    const cardEl = el('div', { class: 'flashcard', onclick: () => { flipped = !flipped; cardEl.classList.toggle('flipped', flipped); } }, [
      el('div', { class: 'flashcard-inner' }, [
        el('div', { class: 'flashcard-face flashcard-front' }, [el('span', { class: 'flashcard-topic' }, TOPIC_BY_ID[item.card.topic]?.icon || '🎵'), el('div', { class: 'flashcard-term' }, item.card.term)]),
        el('div', { class: 'flashcard-face flashcard-back' }, [el('div', { class: 'flashcard-def' }, item.card.definition)])
      ])
    ]);
    card.appendChild(el('div', { class: 'flashcard-stage' }, [cardEl, el('p', { class: 'hint-text' }, 'Tap to flip.')]));
    card.appendChild(el('button', { class: 'btn btn-primary continue-btn', onclick: () => { STUDY_UI.pos++; render(); } }, 'Continue →'));
  } else if (item.kind === 'quiz') {
    const q = item.q;
    card.appendChild(el('span', { class: 'topic-chip' }, `${TOPIC_BY_ID[q.topic]?.icon || ''} ${TOPIC_BY_ID[q.topic]?.title || ''}`));
    card.appendChild(el('h2', { class: 'quiz-prompt' }, q.prompt));
    const visualHost = el('div', { class: 'visual-host' });
    card.appendChild(visualHost);
    renderQuestionVisual(visualHost, q);
    const bodyHost = el('div', { class: 'quiz-body' });
    card.appendChild(bodyHost);
    if (q.type === 'typing') renderTypingQuestionUI(bodyHost, q, (c, txt) => { recordAnswer(q, c, txt); STUDY_UI.pos++; render(); });
    else if (q.type === 'order') renderOrderQuestionUI(bodyHost, q, (c, txt) => { recordAnswer(q, c, txt); STUDY_UI.pos++; render(); });
    else if (q.type === 'match') renderMatchQuestionUI(bodyHost, q, (c, txt) => { recordAnswer(q, c, txt); STUDY_UI.pos++; render(); });
    else renderOptionQuestionUI(bodyHost, q, (c, txt) => { recordAnswer(q, c, txt); STUDY_UI.pos++; render(); });
  } else if (item.kind === 'mistake') {
    card.appendChild(el('span', { class: 'topic-chip' }, `${TOPIC_BY_ID[item.m.topic]?.icon || ''} Revisiting a mistake`));
    card.appendChild(el('p', { class: 'mistake-q' }, item.m.question));
    card.appendChild(el('p', { class: 'mistake-correct' }, `Correct answer: ${item.m.correctAnswer}`));
    card.appendChild(el('p', { class: 'mistake-explain' }, item.m.explanation));
    card.appendChild(el('button', { class: 'btn btn-primary continue-btn', onclick: () => { STUDY_UI.pos++; render(); } }, 'Got it →'));
  }
}

/* ============================================================
   App init
   ============================================================ */

function initApp() {
  buildShell();
  touchDailyStreak();
  render();
  refreshHeaderStats();
}

document.addEventListener('DOMContentLoaded', () => {
  const account = getAuthAccount();
  // a refresh inside the same tab keeps you logged in; a fresh visit asks for your password
  if (account && account.hash && account.username && hasSession()) initApp();
  else showAuthScreen();
});
