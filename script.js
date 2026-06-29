const STORAGE_KEY = 'paper_game_web_v1';
const APP_TITLE = '抽小纸条小游戏';
const DEFAULT_GAME = {
  roundOrder: [],
  rounds: {}
};

const state = {
  screen: 'main',
  notice: '',
  currentRoundName: '',
  currentNickname: '',
  pendingRoundName: '',
  pendingRoundExists: false,
  pendingDrawResult: null,
  historyRoundName: ''
};

let gameData = loadGameData();
const app = document.getElementById('app');

function init() {
  bindEvents();
  render();
}

function bindEvents() {
  app.addEventListener('click', handleClick);
  app.addEventListener('submit', handleSubmit);
}

function handleClick(event) {
  const target = event.target.closest('[data-action]');
  if (!target || !app.contains(target)) {
    return;
  }

  const action = target.dataset.action;
  const roundName = target.dataset.round || '';

  if (action === 'main-new-round') {
    goToNewRoundPrompt();
    return;
  }

  if (action === 'main-continue-round') {
    goToContinueRoundList();
    return;
  }

  if (action === 'main-history-round') {
    goToHistoryRoundList();
    return;
  }

  if (action === 'main-exit') {
    state.notice = '';
    state.screen = 'exit';
    render();
    return;
  }

  if (action === 'new-round-confirm-y') {
    createRoundAndEnter(state.pendingRoundName);
    return;
  }

  if (action === 'new-round-confirm-n') {
    goToMainMenu();
    return;
  }

  if (action === 'continue-round-select') {
    enterRound(roundName);
    return;
  }

  if (action === 'history-round-select') {
    state.historyRoundName = roundName;
    state.notice = '';
    state.screen = 'roundHistory';
    render();
    return;
  }

  if (action === 'round-input-papers') {
    goToInputPapers();
    return;
  }

  if (action === 'round-view-my-papers') {
    goToViewMyPapers();
    return;
  }

  if (action === 'round-delete-paper') {
    goToDeletePaper();
    return;
  }

  if (action === 'round-change-nickname') {
    goToNicknamePrompt();
    return;
  }

  if (action === 'round-start-draw') {
    goToDrawPrompt();
    return;
  }

  if (action === 'round-back-main') {
    goToMainMenu();
    return;
  }

  if (action === 'papers-back-round') {
    goToRoundMenu();
    return;
  }

  if (action === 'papers-submit') {
    submitPaperContent();
    return;
  }

  if (action === 'my-papers-back-round') {
    goToRoundMenu();
    return;
  }

  if (action === 'delete-back-round') {
    goToRoundMenu();
    return;
  }

  if (action === 'delete-submit') {
    submitDeletePaper();
    return;
  }

  if (action === 'nickname-back-round') {
    goToRoundMenu();
    return;
  }

  if (action === 'nickname-submit') {
    submitNicknameChange();
    return;
  }

  if (action === 'draw-back-round') {
    goToRoundMenu();
    return;
  }

  if (action === 'draw-submit') {
    submitDrawCount();
    return;
  }

  if (action === 'draw-show-authors') {
    showDrawAuthors();
    return;
  }

  if (action === 'draw-back-round-after-authors') {
    goToRoundMenu();
    return;
  }

  if (action === 'history-back-main') {
    goToMainMenu();
    return;
  }

  if (action === 'round-history-back-list') {
    goToHistoryRoundList();
    return;
  }
}

function handleSubmit(event) {
  const form = event.target.closest('form[data-form]');
  if (!form || !app.contains(form)) {
    return;
  }

  event.preventDefault();

  const formName = form.dataset.form;
  if (formName === 'new-round') {
    submitNewRound();
    return;
  }

  if (formName === 'nickname') {
    submitNicknameChange();
    return;
  }

  if (formName === 'papers') {
    submitPaperContent();
    return;
  }

  if (formName === 'delete-paper') {
    submitDeletePaper();
    return;
  }

  if (formName === 'draw-count') {
    submitDrawCount();
    return;
  }
}

function render() {
  app.innerHTML = renderScreen();
  focusFirstInput();
}

function focusFirstInput() {
  const input = app.querySelector('input, textarea');
  if (input) {
    input.focus();
    if (typeof input.select === 'function') {
      input.select();
    }
  }
}

function renderScreen() {
  switch (state.screen) {
    case 'main':
      return renderMainMenu();
    case 'newRoundPrompt':
      return renderNewRoundPrompt();
    case 'newRoundConfirm':
      return renderNewRoundConfirm();
    case 'nicknamePrompt':
      return renderNicknamePrompt();
    case 'continueList':
      return renderContinueList();
    case 'historyList':
      return renderHistoryList();
    case 'roundMenu':
      return renderRoundMenu();
    case 'inputPapers':
      return renderInputPapers();
    case 'viewMyPapers':
      return renderViewMyPapers();
    case 'deletePaper':
      return renderDeletePaper();
    case 'drawPrompt':
      return renderDrawPrompt();
    case 'drawContent':
      return renderDrawContent();
    case 'drawAuthors':
      return renderDrawAuthors();
    case 'roundHistory':
      return renderRoundHistory();
    case 'exit':
      return renderExitScreen();
    default:
      return renderMainMenu();
  }
}

function frame(bodyText, controlsHtml = '') {
  const noticeHtml = state.notice ? `<pre class="notice">${escapeHtml(state.notice)}</pre>` : '';
  return `
    <div class="screen">
      ${noticeHtml}
      <pre class="console">${escapeHtml(bodyText)}</pre>
      ${controlsHtml ? `<div class="controls">${controlsHtml}</div>` : ''}
    </div>
  `;
}

function menuButton(label, action, roundName = '') {
  const roundAttr = roundName ? ` data-round="${escapeHtml(roundName)}"` : '';
  return `<button type="button" data-action="${escapeHtml(action)}"${roundAttr}>${escapeHtml(label)}</button>`;
}

function renderMainMenu() {
  const body = [
    '========================',
    APP_TITLE,
    '========================',
    '',
    '请选择：'
  ].join('\n');

  const controls = `
    <div class="button-row">
      ${menuButton('1 新建回合', 'main-new-round')}
      ${menuButton('2 继续已有回合', 'main-continue-round')}
      ${menuButton('3 查看历史回合', 'main-history-round')}
      ${menuButton('4 退出', 'main-exit')}
    </div>
  `;

  return frame(body, controls);
}

function renderNewRoundPrompt() {
  const body = [
    '========================',
    '新建回合',
    '========================',
    '',
    '请输入回合名称:'
  ].join('\n');

  const controls = `
    <form class="form-row" data-form="new-round">
      <label>
        回合名称：
        <input name="roundName" type="text" autocomplete="off" />
      </label>
      <div class="inline-row">
        <button type="submit">确定</button>
        <button type="button" data-action="history-back-main">返回主菜单</button>
      </div>
    </form>
  `;

  return frame(body, controls);
}

function renderNewRoundConfirm() {
  const body = [
    '========================',
    '新建回合',
    '========================',
    '',
    '该回合已存在。',
    '',
    '是否接着奏乐，接着舞？'
  ].join('\n');

  const controls = `
    <div class="button-row">
      ${menuButton('Y', 'new-round-confirm-y')}
      ${menuButton('N', 'new-round-confirm-n')}
    </div>
  `;

  return frame(body, controls);
}

function renderNicknamePrompt() {
  const body = [
    '========================',
    '输入昵称',
    '========================',
    '',
    '说出汝名，吓吾一跳！请输入昵称：',
    ''
  ].join('\n');

  const controls = `
    <form class="form-row" data-form="nickname">
      <label>
        昵称：
        <input name="nickname" type="text" autocomplete="off" value="${escapeHtml(state.currentNickname || '')}" />
      </label>
      <div class="inline-row">
        <button type="submit">确定</button>
        <button type="button" data-action="nickname-back-round">返回主菜单</button>
      </div>
    </form>
  `;

  return frame(body, controls);
}

function renderContinueList() {
  const rounds = getRoundNames();
  if (!rounds.length) {
    state.notice = '没有已有的回合，请先新建回合';
    return renderMainMenu();
  }

  const body = [
    '========================',
    '继续已有回合',
    '========================',
    '',
    '已有回合：',
    ''
  ].concat(rounds.map((name, index) => `${index + 1}. ${name}`)).join('\n');

  const buttons = rounds.map((roundName, index) => menuButton(`${index + 1}. ${roundName}`, 'continue-round-select', roundName)).join('\n');
  const controls = `<div class="round-list">${buttons}</div><div class="small-gap">${menuButton('返回主菜单', 'round-back-main')}</div>`;
  return frame(body, controls);
}

function renderHistoryList() {
  const rounds = getRoundNames();
  if (!rounds.length) {
    state.notice = '没有历史回合';
    return renderMainMenu();
  }

  const body = [
    '========================',
    '查看历史回合',
    '========================',
    '',
    '历史回合：',
    ''
  ].concat(rounds.map((name, index) => `${index + 1}. ${name}`)).join('\n');

  const buttons = rounds.map((roundName, index) => menuButton(`${index + 1}. ${roundName}`, 'history-round-select', roundName)).join('\n');
  const controls = `<div class="history-list">${buttons}</div><div class="small-gap">${menuButton('返回主菜单', 'history-back-main')}</div>`;
  return frame(body, controls);
}

function renderRoundMenu() {
  const body = [
    '================',
    `当前玩家：${state.currentNickname}`,
    `当前回合：${state.currentRoundName}`,
    '================',
    ''].join('\n');

  const controls = `
    <div class="button-row">
      ${menuButton('1 输入纸条', 'round-input-papers')}
      ${menuButton('2 查看自己的纸条', 'round-view-my-papers')}
      ${menuButton('3 删除自己的纸条', 'round-delete-paper')}
      ${menuButton('4 更换玩家', 'round-change-nickname')}
      ${menuButton('5 开始抽选', 'round-start-draw')}
      ${menuButton('6 返回主菜单', 'round-back-main')}
    </div>
  `;

  return frame(body, controls);
}

function renderInputPapers() {
  const body = [
    '请输入纸条。',
    '多个纸条请使用换行分隔。',
    '',
    '例如：',
    '',
    '骄兵必败,败兵必哀,哀兵必胜,胜兵必骄',
    '',
    '如需返回上级菜单直接输入回车即可。'
  ].join('\n');

  const controls = `
    <form class="form-row" data-form="papers">
      <label>
        请输入纸条：
        <textarea name="paperContent" autocomplete="off"></textarea>
      </label>
      <div class="inline-row">
        <button type="submit">确定</button>
        <button type="button" data-action="papers-back-round">返回上一级</button>
      </div>
    </form>
  `;

  return frame(body, controls);
}

function renderViewMyPapers() {
  const papers = getMyPapers();
  let body;

  if (!papers.length) {
    body = [
      '我读完一卷烧一卷，全部读完则全部烧尽，',
      '因此书房无书，徒有四壁。',
      '你还没有输入纸条'
    ].join('\n');
  } else {
    const header = ['编号', '内容'].join('    ');
    const rows = papers.map((paper) => [paper.id, paper.content].join('    '));
    body = [
      '========================',
      '你的纸条个个有情有义:',
      '========================',
      '',
      header,
      '-'.repeat(40),
      ...rows
    ].join('\n');
  }

  const controls = `<div class="button-row">${menuButton('返回', 'my-papers-back-round')}</div>`;
  return frame(body, controls);
}

function renderDeletePaper() {
  const papers = getMyPapers();
  let listText;

  if (!papers.length) {
    listText = '你还没有输入纸条，无法删除，竟然不许！';
  } else {
    listText = ['你的纸条个个有情有义:'].concat(papers.map((paper) => `${paper.id}. ${paper.content}`)).join('\n');
  }

  const body = [
    '========================',
    '删除纸条',
    '========================',
    '',
    listText,
    '',
    '请输入要删除的纸条编号：'
  ].join('\n');

  const controls = `
    <form class="form-row" data-form="delete-paper">
      <label>
        编号：
        <input name="paperId" type="number" inputmode="numeric" autocomplete="off" />
      </label>
      <div class="inline-row">
        <button type="submit">删除</button>
        <button type="button" data-action="delete-back-round">返回上一级</button>
      </div>
    </form>
  `;

  return frame(body, controls);
}

function renderDrawPrompt() {
  const undrawnCount = getUndrawnPapers().length;
  let body;

  if (!undrawnCount) {
    body = [
      '没有未抽取的纸条，自刎归天！'
    ].join('\n');
    const controls = `<div class="button-row">${menuButton('返回', 'draw-back-round')}</div>`;
    return frame(body, controls);
  }

  body = [
    `当前还有 ${undrawnCount} 条未抽取的纸条`,
    '',
    '请输入抽取数量：',
    '',
    '如需返回上级菜单直接输入回车即可。'
  ].join('\n');

  const controls = `
    <form class="form-row" data-form="draw-count">
      <label>
        抽取数量：
        <input name="drawCount" type="number" inputmode="numeric" autocomplete="off" min="1" />
      </label>
      <div class="inline-row">
        <button type="submit">开始抽选</button>
        <button type="button" data-action="draw-back-round">返回上一级</button>
      </div>
    </form>
  `;

  return frame(body, controls);
}

function renderDrawContent() {
  const selected = state.pendingDrawResult ? state.pendingDrawResult.selected : [];
  const rows = selected.map((paper, index) => `${index + 1}. ${paper.content}`);
  const body = [
    '==================',
    '本轮抽取结果',
    '==================',
    '',
    ...(rows.length ? rows : ['（没有抽到任何纸条）']),
    '',
    '=================='
  ].join('\n');

  const controls = `
    <div class="button-row">
      ${menuButton('公布这东吴到底是姓孙还是姓周...', 'draw-show-authors')}
    </div>
  `;

  return frame(body, controls);
}

function renderDrawAuthors() {
  const selected = state.pendingDrawResult ? state.pendingDrawResult.selected : [];
  const rows = selected.map((paper, index) => `${index + 1}. ${paper.content} —— ${paper.nickname}`);
  const body = [
    '==================',
    '在下一者为主公悲伤，二者给主公道喜：',
    '==================',
    '',
    '本轮作者公布',
    '',
    ...(rows.length ? rows : ['（没有抽到任何纸条）']),
    '',
    '=================='
  ].join('\n');

  const controls = `<div class="button-row">${menuButton('接着奏乐，接着舞！（返回菜单）', 'draw-back-round-after-authors')}</div>`;
  return frame(body, controls);
}

function renderRoundHistory() {
  const round = getRoundData(state.historyRoundName);
  const papers = round.papers;
  const total = papers.length;
  const drawn = papers.filter((paper) => paper.drawn === 'True').length;
  const undrawn = total - drawn;

  const paperHeader = ['编号', '内容', '作者', '已抽', '抽取顺序'].join('    ');
  const paperRows = papers.length
    ? papers.map((paper) => [
        paper.id,
        paper.content,
        paper.nickname,
        paper.drawn === 'True' ? '是' : '否',
        paper.draw_order || '-'
      ].join('    '))
    : ['（暂无纸条）'];

  const historyHeader = ['round_name', 'draw_time', 'seed', 'draw_count', 'actual_count'].join('    ');
  const drawHistoryRows = round.draw_history.length
    ? round.draw_history.map((item) => [
        item.round_name,
        item.draw_time,
        item.seed,
        String(item.draw_count),
        String(item.actual_count)
      ].join('    '))
    : ['（暂无抽选历史）'];

  const body = [
    '================================================================================',
    `回合: ${state.historyRoundName}`,
    '================================================================================',
    `总纸条数: ${total}`,
    `已抽数量: ${drawn}`,
    `未抽数量: ${undrawn}`,
    '================================================================================',
    paperHeader,
    '-'.repeat(80),
    ...paperRows,
    '================================================================================',
    '抽选历史',
    '--------------------------------------------------------------------------------',
    historyHeader,
    '-'.repeat(80),
    ...drawHistoryRows,
    '================================================================================'
  ].join('\n');

  const controls = `<div class="button-row">${menuButton('返回', 'round-history-back-list')}</div>`;
  return frame(body, controls);
}

function renderExitScreen() {
  const body = [
    '那就容我天意爷告老还乡了。你走了，我们吃什么？'
  ].join('\n');
  return frame(body);
}

function goToMainMenu() {
  state.screen = 'main';
  state.notice = '';
  state.currentRoundName = '';
  state.currentNickname = '';
  state.pendingRoundName = '';
  state.pendingRoundExists = false;
  state.pendingDrawResult = null;
  state.historyRoundName = '';
  render();
}

function goToNewRoundPrompt() {
  state.screen = 'newRoundPrompt';
  state.notice = '';
  state.pendingRoundName = '';
  state.pendingRoundExists = false;
  render();
}

function goToContinueRoundList() {
  state.screen = 'continueList';
  state.notice = '';
  render();
}

function goToHistoryRoundList() {
  state.screen = 'historyList';
  state.notice = '';
  render();
}

function goToNicknamePrompt() {
  state.screen = 'nicknamePrompt';
  state.notice = '';
  render();
}

function goToRoundMenu(message = '') {
  state.screen = 'roundMenu';
  state.notice = message;
  state.pendingDrawResult = null;
  render();
}

function goToInputPapers() {
  state.screen = 'inputPapers';
  state.notice = '';
  render();
}

function goToViewMyPapers() {
  state.screen = 'viewMyPapers';
  state.notice = '';
  render();
}

function goToDeletePaper() {
  state.screen = 'deletePaper';
  state.notice = '';
  render();
}

function goToDrawPrompt() {
  state.screen = 'drawPrompt';
  state.notice = '';
  render();
}

function goToDrawContent(result) {
  state.pendingDrawResult = result;
  state.screen = 'drawContent';
  state.notice = '';
  render();
}

function showDrawAuthors() {
  state.screen = 'drawAuthors';
  state.notice = '';
  render();
}

function createRoundAndEnter(roundName) {
  const created = createRound(roundName);
  if (created) {
    state.notice = `回合 '${roundName}' 已创建/打开`;
  } else {
    state.notice = `回合 '${roundName}' 已创建/打开`;
  }
  state.pendingRoundName = '';
  state.pendingRoundExists = false;
  state.currentRoundName = roundName;
  state.currentNickname = '';
  state.screen = 'nicknamePrompt';
  render();
}

function enterRound(roundName) {
  if (!roundName) {
    return;
  }
  state.currentRoundName = roundName;
  state.currentNickname = '';
  state.notice = '';
  state.screen = 'nicknamePrompt';
  render();
}

function submitNewRound() {
  const form = app.querySelector('form[data-form="new-round"]');
  if (!form) {
    return;
  }
  const input = form.elements.roundName;
  const roundName = input.value.trim();
  if (!roundName) {
    goToMainMenu();
    return;
  }

  state.pendingRoundName = roundName;
  if (hasRound(roundName)) {
    state.pendingRoundExists = true;
    state.screen = 'newRoundConfirm';
    state.notice = '';
    render();
    return;
  }

  createRoundAndEnter(roundName);
}

function submitNicknameChange() {
  const form = app.querySelector('form[data-form="nickname"]');
  if (!form) {
    return;
  }
  const input = form.elements.nickname;
  const nickname = input.value.trim();
  if (!nickname) {
    goToRoundMenu();
    return;
  }

  state.currentNickname = nickname;
  goToRoundMenu();
}

function submitPaperContent() {
  const form = app.querySelector('form[data-form="papers"]');
  if (!form) {
    return;
  }
  const input = form.elements.paperContent;
  const raw = input.value.trim();
  if (!raw) {
    goToRoundMenu();
    return;
  }

  const contents = raw
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean);
  if (!contents.length) {
    goToRoundMenu();
    return;
  }

  const count = addPapersToCurrentRound(contents);
  goToRoundMenu(`成功添加 ${count} 条纸条，当浮一大白！`);
}

function submitDeletePaper() {
  const form = app.querySelector('form[data-form="delete-paper"]');
  if (!form) {
    return;
  }
  const input = form.elements.paperId;
  const raw = input.value.trim();
  if (!raw) {
    goToRoundMenu();
    return;
  }

  const paperId = Number(raw);
  if (!Number.isInteger(paperId) || paperId <= 0) {
    state.notice = '请输入有效的数字';
    render();
    return;
  }

  const deleted = deletePaperFromCurrentRound(paperId);
  if (deleted) {
    goToRoundMenu('删除成功，只当是陈宫从来就没有这些！');
    render();
    return;
  }

  state.notice = '删除失败，可能是编号不存在或不是你的纸条。生死不明，那就是死了！';
  render();
}

function submitDrawCount() {
  const form = app.querySelector('form[data-form="draw-count"]');
  if (!form) {
    return;
  }
  const input = form.elements.drawCount;
  const raw = input.value.trim();
  if (!raw) {
    goToRoundMenu();
    return;
  }

  const drawCount = Number(raw);
  if (!Number.isInteger(drawCount) || drawCount < 1) {
    state.notice = '请输入有效的数字，或直接回车返回上一级';
    render();
    return;
  }

  const result = drawPapersFromCurrentRound(drawCount);
  if (!result.actualCount) {
    state.notice = '抽取失败，败兵必哀，哀兵必胜！';
    render();
    return;
  }

  goToDrawContent(result);
}

function addPapersToCurrentRound(contents) {
  const round = getRoundData(state.currentRoundName);
  const nextId = getNextPaperId(round.papers);
  let added = 0;

  contents.forEach((content) => {
    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }

    round.papers.push({
      id: String(nextId + added),
      nickname: state.currentNickname,
      content: trimmed,
      drawn: 'False',
      draw_order: ''
    });
    added += 1;
  });

  saveGameData();
  return added;
}

function deletePaperFromCurrentRound(paperId) {
  const round = getRoundData(state.currentRoundName);
  const index = round.papers.findIndex((paper) => paper.id === String(paperId) && paper.nickname === state.currentNickname);
  if (index === -1) {
    return false;
  }

  round.papers.splice(index, 1);
  saveGameData();
  return true;
}

function drawPapersFromCurrentRound(drawCount) {
  const round = getRoundData(state.currentRoundName);
  const undrawn = round.papers.filter((paper) => paper.drawn === 'False');
  const actualCount = Math.min(drawCount, undrawn.length);

  if (!actualCount) {
    return { selected: [], seed: '', drawCount, actualCount: 0 };
  }

  const seed = createSeed();
  const selected = sampleWithSeed(undrawn, actualCount, seed);
  const maxOrder = round.papers.reduce((max, paper) => {
    const value = Number.parseInt(paper.draw_order, 10);
    return Number.isFinite(value) && value > max ? value : max;
  }, 0);

  selected.forEach((paper, index) => {
    const target = round.papers.find((item) => item.id === paper.id);
    if (target) {
      target.drawn = 'True';
      target.draw_order = String(maxOrder + index + 1);
    }
  });

  round.draw_history.push({
    round_name: state.currentRoundName,
    draw_time: formatDateTime(new Date()),
    seed,
    draw_count: drawCount,
    actual_count: actualCount
  });

  saveGameData();
  return { selected, seed, drawCount, actualCount };
}

function getMyPapers() {
  const round = getRoundData(state.currentRoundName);
  return round.papers.filter((paper) => paper.nickname === state.currentNickname);
}

function getUndrawnPapers() {
  const round = getRoundData(state.currentRoundName);
  return round.papers.filter((paper) => paper.drawn === 'False');
}

function getRoundNames() {
  return gameData.roundOrder.filter((name) => gameData.rounds[name]);
}

function hasRound(roundName) {
  return Boolean(gameData.rounds[roundName]);
}

function createRound(roundName) {
  if (!roundName) {
    return false;
  }
  if (!gameData.rounds[roundName]) {
    gameData.rounds[roundName] = makeEmptyRound(roundName);
    if (!gameData.roundOrder.includes(roundName)) {
      gameData.roundOrder.push(roundName);
    }
    saveGameData();
    return true;
  }
  if (!gameData.roundOrder.includes(roundName)) {
    gameData.roundOrder.push(roundName);
    saveGameData();
  }
  return false;
}

function getRoundData(roundName) {
  if (!roundName) {
    return makeEmptyRound('');
  }
  if (!gameData.rounds[roundName]) {
    gameData.rounds[roundName] = makeEmptyRound(roundName);
    if (!gameData.roundOrder.includes(roundName)) {
      gameData.roundOrder.push(roundName);
    }
    saveGameData();
  }
  return gameData.rounds[roundName];
}

function makeEmptyRound(roundName) {
  return {
    round_name: roundName,
    papers: [],
    draw_history: []
  };
}

function getNextPaperId(papers) {
  if (!papers.length) {
    return 1;
  }
  return papers.reduce((max, paper) => {
    const value = Number.parseInt(paper.id, 10);
    return Number.isFinite(value) && value > max ? value : max;
  }, 0) + 1;
}

function loadGameData() {
  const fallback = cloneDefaultGame();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw);
    return normalizeGameData(parsed);
  } catch (error) {
    return fallback;
  }
}

function saveGameData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameData));
  } catch (error) {
    state.notice = '浏览器本地存储不可用，当前数据可能无法持久保存';
    render();
  }
}

function normalizeGameData(rawData) {
  const data = cloneDefaultGame();

  if (rawData && typeof rawData === 'object') {
    if (Array.isArray(rawData.roundOrder)) {
      data.roundOrder = rawData.roundOrder.map((value) => String(value));
    }

    if (rawData.rounds && typeof rawData.rounds === 'object') {
      Object.keys(rawData.rounds).forEach((roundName) => {
        data.rounds[String(roundName)] = normalizeRound(String(roundName), rawData.rounds[roundName]);
      });
    }
  }

  data.roundOrder.forEach((roundName) => {
    if (!data.rounds[roundName]) {
      data.rounds[roundName] = makeEmptyRound(roundName);
    }
  });

  Object.keys(data.rounds).forEach((roundName) => {
    if (!data.roundOrder.includes(roundName)) {
      data.roundOrder.push(roundName);
    }
  });

  return data;
}

function normalizeRound(roundName, rawRound) {
  const round = makeEmptyRound(roundName);

  if (rawRound && typeof rawRound === 'object') {
    if (Array.isArray(rawRound.papers)) {
      round.papers = rawRound.papers.map(normalizePaper).filter(Boolean);
    }
    if (Array.isArray(rawRound.draw_history)) {
      round.draw_history = rawRound.draw_history.map(normalizeDrawHistory).filter(Boolean);
    }
  }

  return round;
}

function normalizePaper(rawPaper) {
  if (!rawPaper || typeof rawPaper !== 'object') {
    return null;
  }

  return {
    id: String(rawPaper.id ?? ''),
    nickname: String(rawPaper.nickname ?? ''),
    content: String(rawPaper.content ?? ''),
    drawn: normalizeDrawn(rawPaper.drawn),
    draw_order: rawPaper.draw_order === null || rawPaper.draw_order === undefined ? '' : String(rawPaper.draw_order)
  };
}

function normalizeDrawn(value) {
  if (value === true || value === 'True') {
    return 'True';
  }
  return 'False';
}

function normalizeDrawHistory(rawItem) {
  if (!rawItem || typeof rawItem !== 'object') {
    return null;
  }

  return {
    round_name: String(rawItem.round_name ?? ''),
    draw_time: String(rawItem.draw_time ?? ''),
    seed: String(rawItem.seed ?? ''),
    draw_count: Number(rawItem.draw_count ?? 0),
    actual_count: Number(rawItem.actual_count ?? 0)
  };
}

function cloneDefaultGame() {
  return {
    roundOrder: [],
    rounds: {}
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createSeed() {
  const randomPart = Math.floor(Math.random() * 1e9);
  return `${Date.now()}-${randomPart}`;
}

function formatDateTime(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function hashSeed(seedText) {
  let hash = 2166136261;
  for (let index = 0; index < seedText.length; index += 1) {
    hash ^= seedText.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  let value = seed >>> 0;
  return function next() {
    value += 0x6D2B79F5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleWithSeed(items, count, seedText) {
  const result = items.slice();
  const random = mulberry32(hashSeed(seedText));

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result.slice(0, count);
}

document.addEventListener('DOMContentLoaded', init);
