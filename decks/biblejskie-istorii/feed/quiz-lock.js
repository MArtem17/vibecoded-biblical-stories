/* Замок «не листать вперёд без ответа» — только колода.
   Как у птиц: перехват на capture режет вперёд для карточки
   с el._quizLock, пока нет el._answered. Назад не трогаем.
   Повторный заход: «Уже отвечено · свайп ↑ дальше» (quiz-done.js). */
(function () {
  "use strict";
  var NOSWIPE = "button,.opt,.opts,.otile,.olist,.tfb,.tfbtns,.ctile,.cgrid,.coltile,.colgrid,.cattile";
  var y0 = null;

  function card() {
    return document.querySelector("#feed > .card");
  }
  function locked() {
    var el = card();
    return !!(el && el._quizLock && !el._answered);
  }
  function wiggle() {
    var el = card();
    if (!el) return;
    el.classList.remove("wiggle");
    void el.offsetWidth;
    el.classList.add("wiggle");
    setTimeout(function () {
      if (el.parentNode) el.classList.remove("wiggle");
    }, 480);
  }
  function blockForward(e) {
    if (!locked()) return false;
    if (e && e.stopImmediatePropagation) e.stopImmediatePropagation();
    if (e && e.preventDefault && e.cancelable) e.preventDefault();
    wiggle();
    return true;
  }

  window.addEventListener("wheel", function (e) {
    if (Math.abs(e.deltaY) < 20) return;
    if (e.deltaY > 0) blockForward(e);
  }, true);

  window.addEventListener("keydown", function (e) {
    if (e.key === " " && e.target && e.target.closest && e.target.closest("button,input,textarea,select")) return;
    if (e.key === "ArrowDown" || e.key === " ") blockForward(e);
  }, true);

  var feed = document.getElementById("feed");
  if (feed) {
    feed.addEventListener("touchstart", function (e) {
      if (e.target.closest && e.target.closest(NOSWIPE)) { y0 = null; return; }
      y0 = e.touches[0] ? e.touches[0].clientY : null;
    }, { capture: true, passive: true });
    feed.addEventListener("touchend", function (e) {
      if (y0 == null) return;
      var y = e.changedTouches[0] && e.changedTouches[0].clientY;
      var dy = (y != null ? y : y0) - y0;
      y0 = null;
      if (dy < -50) blockForward(e);
    }, { capture: true });
  }

  var hint = document.getElementById("fGoHint");
  if (hint) {
    hint.addEventListener("click", function (e) {
      if (!locked()) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      wiggle();
    }, true);
  }
})();
