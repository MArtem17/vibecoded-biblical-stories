/* Ворота «Родителям»: пример на умножение перед взрослым разделом.
 *
 * Третья вынесенная деталь после goto и stats. Признак тот же: у
 * «Изобретариума» и «Мирового искусства» этот код побайтово одинаков, вплоть
 * до имён элементов; у «Кругосветки» тот же генератор примера, отличается
 * только то, что происходит ПОСЛЕ верного ответа.
 *
 * Поэтому модуль знает ровно про пример и проверку. Что открывать за
 * воротами — дело колоды: одна рисует статистику, другая ещё и настройки,
 * третья помнит пройденные ворота до конца сеанса.
 *
 * Это не защита, а порог: пример отсекает ребёнка, который не считает в уме,
 * и не притворяется взломостойким — ответ лежит в той же вкладке.
 *
 *   GATE.arm({q:$("gQ"), input:$("gIn"), button:$("gGo"), err:$("gErr"),
 *             errText:T("gate_err")}, openParentBody);
 *   GATE.renew();   // новый пример, когда ворота открывают заново
 */
(function (w) {
  "use strict";

  var state = null;

  function draw() {
    if (!state) return;
    var a = 3 + Math.floor(Math.random() * 7),
        b = 3 + Math.floor(Math.random() * 7);
    state.answer = a * b;
    if (state.q) state.q.textContent = a + " × " + b + " = ?";
    if (state.input) state.input.value = "";
    if (state.err) state.err.textContent = "";
  }

  function check() {
    if (!state) return;
    if (+state.input.value === state.answer) {
      if (state.onPass) state.onPass();
    } else {
      /* Неверный ответ меняет пример: иначе подобрать его перебором можно
         молча, не выходя из экрана. */
      if (state.err) state.err.textContent = state.errText || "";
      var e = state.err;
      draw();
      if (e) e.textContent = state.errText || "";
    }
  }

  function arm(els, onPass) {
    if (!els || !els.input || !els.button) return;
    state = {
      q: els.q, input: els.input, button: els.button, err: els.err,
      errText: els.errText, onPass: onPass, answer: 0
    };
    els.button.addEventListener("click", check);
    /* Ввод с клавиатуры: на десктопе родитель жмёт Enter, а не кнопку. */
    els.input.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") { ev.preventDefault(); check(); }
    });
    draw();
  }

  w.GATE = { arm: arm, renew: draw };
})(window);
