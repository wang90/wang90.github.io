/*
 * Emotional browser reading for Xin Qiji poems.
 */
(function () {
  'use strict';

  var synth = window.speechSynthesis;
  var chineseVoice = null;
  var activeButton = null;
  var currentUtterance = null;

  function pickVoice() {
    if (synth === null || synth === undefined) return null;
    var voices = synth.getVoices() || [];
    var fallback = null;
    var i;

    for (i = 0; i < voices.length; i += 1) {
      var lang = (voices[i].lang || '').toLowerCase();
      var name = (voices[i].name || '').toLowerCase();
      if (lang.slice(0, 2) !== 'zh') continue;
      if (fallback === null) fallback = voices[i];
      if (name.indexOf('ting') >= 0 || name.indexOf('mei') >= 0 || name.indexOf('xiaoxiao') >= 0) {
        return voices[i];
      }
    }

    return fallback;
  }

  function resetButton() {
    if (activeButton === null) return;
    activeButton.classList.remove('is-reading');
    activeButton.textContent = '朗读';
    activeButton = null;
  }

  function setReading(button) {
    if (activeButton === button) {
      activeButton.classList.add('is-reading');
      activeButton.textContent = '停止';
      return;
    }

    if (activeButton) {
      activeButton.classList.remove('is-reading');
      activeButton.textContent = '朗读';
    }

    activeButton = button;
    activeButton.classList.add('is-reading');
    activeButton.textContent = '停止';
  }

  function finishUtterance(utterance) {
    if (currentUtterance === utterance) {
      currentUtterance = null;
      resetButton();
    }
  }

  function read(button) {
    var targetId = button.getAttribute('data-target');
    var target = document.querySelector('#' + targetId);
    if (target === null) return;

    if (synth.speaking && activeButton === button) {
      synth.cancel();
      currentUtterance = null;
      resetButton();
      return;
    }

    if (synth.speaking) {
      synth.cancel();
      currentUtterance = null;
    }

    var text = (target.innerText || target.textContent || '').replace(/\s+/g, '');
    if (text.length === 0) return;

    var utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.82;
    utterance.pitch = 1.06;
    utterance.volume = 1;

    if (chineseVoice === null) chineseVoice = pickVoice();
    if (chineseVoice) utterance.voice = chineseVoice;

    currentUtterance = utterance;
    utterance.onend = function () {
      finishUtterance(utterance);
    };
    utterance.onerror = function () {
      finishUtterance(utterance);
    };

    setReading(button);
    synth.speak(utterance);
  }

  function init() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.poet-read'));
    if (buttons.length === 0) return;

    if (synth === null || synth === undefined) {
      for (var i = 0; i < buttons.length; i += 1) {
        buttons[i].disabled = true;
        buttons[i].textContent = '不支持朗读';
      }
      return;
    }

    chineseVoice = pickVoice();
    synth.onvoiceschanged = function () {
      chineseVoice = pickVoice();
    };

    for (var n = 0; n < buttons.length; n += 1) {
      buttons[n].addEventListener('click', function () {
        read(this);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
