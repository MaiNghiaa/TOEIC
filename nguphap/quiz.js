(function () {
  function letterFromSpan(span) {
    const t = span.textContent.trim();
    const m = t.match(/^([A-D])\b/i);
    return m ? m[1].toUpperCase() : null;
  }

  function getCorrectLetters(li) {
    return (li.dataset.answer || '').toUpperCase().split(/[,|]/).map(function (s) {
      return s.trim();
    }).filter(Boolean);
  }

  function lockItem(li) {
    li.querySelectorAll('.option input').forEach(function (inp) {
      inp.disabled = true;
    });
  }

  function revealAnswer(li, correctLetters, selectedLetter, opts) {
    opts = opts || {};
    if (li.classList.contains('answered') && !opts.force) return;
    if (!Array.isArray(correctLetters)) correctLetters = [correctLetters];

    li.classList.add('answered');
    li.classList.remove('correct-item', 'wrong-item');
    var isCorrect = correctLetters.indexOf(selectedLetter) >= 0;
    if (isCorrect) li.classList.add('correct-item');
    else li.classList.add('wrong-item');

    const status = li.querySelector('.quiz-status');
    if (status) {
      status.textContent = isCorrect ? 'Trả lời đúng' : 'Trả lời sai';
    }

    const hint = li.querySelector('.answer-hint');
    if (hint) {
      hint.style.display = 'inline-block';
      hint.textContent = 'Đáp án đúng: ' + correctLetters.join(' / ');
    }

    li.querySelectorAll('.option').forEach(function (opt) {
      const L = opt.dataset.letter;
      opt.classList.remove('correct', 'wrong');
      if (correctLetters.indexOf(L) >= 0) opt.classList.add('correct');
      else if (L === selectedLetter) opt.classList.add('wrong');
    });

    lockItem(li);

    const panel = li.querySelector('.explain-panel');
    if (panel && li.dataset.explain) panel.classList.add('open');
  }

  function buildOptions(li, correctLetters, name) {
    const optionsDiv = li.querySelector('.options');
    if (!optionsDiv) return;
    const spans = optionsDiv.querySelectorAll(':scope > span');
    optionsDiv.innerHTML = '';

    spans.forEach(function (span) {
      const letter = letterFromSpan(span);
      if (!letter) return;
      const label = document.createElement('label');
      label.className = 'option';
      label.dataset.letter = letter;
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = name;
      input.value = letter;
      const text = document.createElement('span');
      text.innerHTML = span.innerHTML;
      label.appendChild(input);
      label.appendChild(text);
      input.addEventListener('change', function () {
        if (input.checked) revealAnswer(li, correctLetters, letter);
      });
      optionsDiv.appendChild(label);
    });
  }

  function setupToeicQuestion(li, qIndex, correctLetter, blockId) {
    var letters = correctLetter ? [correctLetter] : [];
    buildOptions(li, letters, blockId + '-q' + (qIndex + 1));
    const hint = document.createElement('div');
    hint.className = 'answer-hint';
    hint.style.display = 'none';
    hint.textContent = 'Đáp án đúng: ' + correctLetter;
    li.appendChild(hint);
  }

  function parseAnswerGrids() {
    const keys = [];
    document.querySelectorAll('.answer-block .answer-grid').forEach(function (grid) {
      const part = [];
      grid.querySelectorAll('div').forEach(function (cell) {
        const m = cell.textContent.trim().match(/(\d+)\.\s*([A-D])/i);
        if (m) part[parseInt(m[1], 10) - 1] = m[2].toUpperCase();
      });
      keys.push(part);
    });
    return keys;
  }

  function revealAllInBlock(block, answers, selector) {
    block.querySelectorAll(selector).forEach(function (li, i) {
      var correctList = answers ? [answers[i]] : getCorrectLetters(li);
      var correct = correctList[0];
      if (!correct) return;
      const input = li.querySelector('.option[data-letter="' + correct + '"] input');
      if (input) {
        input.checked = true;
        revealAnswer(li, correctList, correct, { force: true });
      }
    });
  }

  function resetBlock(block, selector) {
    block.querySelectorAll(selector).forEach(function (li) {
      li.classList.remove('answered', 'correct-item', 'wrong-item');
      li.querySelectorAll('.option').forEach(function (o) {
        o.classList.remove('correct', 'wrong');
        const inp = o.querySelector('input');
        if (inp) {
          inp.checked = false;
          inp.disabled = false;
        }
      });
      const hint = li.querySelector('.answer-hint');
      if (hint) hint.style.display = 'none';
      const status = li.querySelector('.quiz-status');
      if (status) status.textContent = 'Bài tập chưa làm';
      const panel = li.querySelector('.explain-panel');
      if (panel) panel.classList.remove('open');
      const btn = li.querySelector('.btn-explain');
      if (btn) btn.textContent = '▾ Xem giải thích';
    });
  }

const answerKeys = parseAnswerGrids();
  document.querySelectorAll('.exercise-block').forEach(function (block, blockIndex) {
    const answers = answerKeys[blockIndex] || [];
    const blockId = 'toeic-' + (blockIndex + 1);
    block.querySelectorAll('ol.questions > li').forEach(function (li, i) {
      setupToeicQuestion(li, i, answers[i], blockId);
    });
    const toolbar = document.createElement('div');
    toolbar.className = 'exercise-toolbar';
    const btnReveal = document.createElement('button');
    btnReveal.type = 'button';
    btnReveal.className = 'btn-reveal';
    btnReveal.textContent = 'Hiện tất cả đáp án';
    btnReveal.addEventListener('click', function () {
      revealAllInBlock(block, answers, 'ol.questions > li');
    });
    const btnReset = document.createElement('button');
    btnReset.type = 'button';
    btnReset.className = 'btn-reset';
    btnReset.textContent = 'Làm lại';
    btnReset.addEventListener('click', function () {
      resetBlock(block, 'ol.questions > li');
    });
    toolbar.appendChild(btnReveal);
    toolbar.appendChild(btnReset);
    const ol = block.querySelector('ol.questions');
    if (ol) block.insertBefore(toolbar, ol);
  });

  var scrollBtn = document.getElementById('scrollTop');
  if (scrollBtn) {
    window.addEventListener('scroll', function () {
      scrollBtn.classList.toggle('visible', window.scrollY > 400);
    });
    scrollBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
