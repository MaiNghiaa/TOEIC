/* Engine trắc nghiệm: chọn → hiện đáp án → khóa, kèm giải thích */
(function () {
  function letterFromSpan(span) {
    var t = span.textContent.trim();
    var m = t.match(/^([A-G])\b/i);
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

    var status = li.querySelector('.quiz-status');
    if (status) status.textContent = isCorrect ? 'Trả lời đúng' : 'Trả lời sai';

    li.querySelectorAll('.option').forEach(function (opt) {
      var L = opt.dataset.letter;
      opt.classList.remove('correct', 'wrong');
      if (correctLetters.indexOf(L) >= 0) opt.classList.add('correct');
      else if (L === selectedLetter) opt.classList.add('wrong');
    });

    lockItem(li);

    var panel = li.querySelector('.explain-panel');
    if (panel && li.dataset.explain) panel.classList.add('open');
  }

  function buildOptions(li, correctLetters, name) {
    var optionsDiv = li.querySelector('.options');
    if (!optionsDiv) return;
    var spans = optionsDiv.querySelectorAll(':scope > span');
    optionsDiv.innerHTML = '';

    spans.forEach(function (span) {
      var letter = letterFromSpan(span);
      if (!letter) return;
      var label = document.createElement('label');
      label.className = 'option';
      label.dataset.letter = letter;
      var input = document.createElement('input');
      input.type = 'radio';
      input.name = name;
      input.value = letter;
      var text = document.createElement('span');
      text.innerHTML = span.innerHTML;
      label.appendChild(input);
      label.appendChild(text);
      input.addEventListener('change', function () {
        if (input.checked) revealAnswer(li, correctLetters, letter);
      });
      optionsDiv.appendChild(label);
    });
  }

  function setupQuizItem(li, qIndex, blockId) {
    var correctLetters = getCorrectLetters(li);
    if (!correctLetters.length) return;

    var status = document.createElement('div');
    status.className = 'quiz-status';
    status.textContent = 'Bài tập chưa làm';
    li.insertBefore(status, li.firstChild);

    buildOptions(li, correctLetters, blockId + '-q' + (qIndex + 1));

    if (li.dataset.explain) {
      var wrap = document.createElement('div');
      wrap.className = 'explain-wrap';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-explain';
      btn.textContent = '▾ Xem giải thích';
      var panel = document.createElement('div');
      panel.className = 'explain-panel';
      panel.innerHTML = li.dataset.explain;
      btn.addEventListener('click', function () {
        panel.classList.toggle('open');
        btn.textContent = panel.classList.contains('open') ? '▴ Ẩn giải thích' : '▾ Xem giải thích';
      });
      wrap.appendChild(btn);
      wrap.appendChild(panel);
      li.appendChild(wrap);
    }
  }

  function revealAllInBlock(block) {
    block.querySelectorAll('.quiz-item').forEach(function (li) {
      var list = getCorrectLetters(li);
      var correct = list[0];
      if (!correct) return;
      var input = li.querySelector('.option[data-letter="' + correct + '"] input');
      if (input) {
        input.checked = true;
        revealAnswer(li, list, correct, { force: true });
      }
    });
  }

  function resetBlock(block) {
    block.querySelectorAll('.quiz-item').forEach(function (li) {
      li.classList.remove('answered', 'correct-item', 'wrong-item');
      li.querySelectorAll('.option').forEach(function (o) {
        o.classList.remove('correct', 'wrong');
        var inp = o.querySelector('input');
        if (inp) {
          inp.checked = false;
          inp.disabled = false;
        }
      });
      var status = li.querySelector('.quiz-status');
      if (status) status.textContent = 'Bài tập chưa làm';
      var panel = li.querySelector('.explain-panel');
      if (panel) panel.classList.remove('open');
      var btn = li.querySelector('.btn-explain');
      if (btn) btn.textContent = '▾ Xem giải thích';
    });
  }

  document.querySelectorAll('.quiz-block').forEach(function (block, blockIndex) {
    var blockId = 'quiz-' + (blockIndex + 1);
    block.querySelectorAll('.quiz-item').forEach(function (li, i) {
      setupQuizItem(li, i, blockId);
    });

    var toolbar = document.createElement('div');
    toolbar.className = 'exercise-toolbar';
    var btnReveal = document.createElement('button');
    btnReveal.type = 'button';
    btnReveal.className = 'btn-reveal';
    btnReveal.textContent = 'Hiện tất cả đáp án';
    btnReveal.addEventListener('click', function () { revealAllInBlock(block); });
    var btnReset = document.createElement('button');
    btnReset.type = 'button';
    btnReset.className = 'btn-reset';
    btnReset.textContent = 'Làm lại';
    btnReset.addEventListener('click', function () { resetBlock(block); });
    toolbar.appendChild(btnReveal);
    toolbar.appendChild(btnReset);
    var ol = block.querySelector('ol.quiz-list');
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
