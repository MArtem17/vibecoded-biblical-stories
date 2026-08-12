#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# ============================================================================
# Озвучка для энциклопедий на каркасе core/kit (ElevenLabs).
# Универсальный: читает config.js (KIT_CONFIG) + content.js (KIT_CONTENT) любой
# kit-колоды и генерит банк клипов ведущего. Тексты берутся из самих данных —
# ничего править в скрипте не нужно.
#
#   python3 core/kit/gen_voice.py decks/telo-cheloveka          # имена/темы/вопросы/похвалы/уровни
#   python3 core/kit/gen_voice.py decks/telo-cheloveka --facts  # + озвучить факты (для аудио-режима)
#   python3 core/kit/gen_voice.py decks/telo-cheloveka name_serdce ok_1   # только эти ключи
#
# Ключ — ТОЛЬКО из окружения (в файлы/git не писать):
#   ELEVENLABS_API_KEY=<ключ>   или   XI_API_KEY=<ключ>   или   ELEVEN_KEY=/путь/к/файлу
#
# Выход: <deck>/voice/*.mp3 + <deck>/voice/manifest.js (window.KIT_VOICE=[...]).
# Голос по умолчанию — Marina (русский, стандарт платформы); можно переопределить
# в config.js полем voiceId (и lang для языка синтеза).
#
# Нужны: node (для чтения JS-данных), curl, ffmpeg (детокс вдохов).
# После генерации — контроль Whisper (openai whisper-1), как в geography-пайплайне.
# ============================================================================
import json, os, re, subprocess, sys, time, shutil

if len(sys.argv) < 2 or sys.argv[1].startswith("-"):
    raise SystemExit("использование: gen_voice.py <deck-dir> [--facts] [ключи…]")
DECK = os.path.abspath(sys.argv[1].rstrip("/"))
ARGS = sys.argv[2:]
WITH_FACTS = "--facts" in ARGS
ONLY = set(a for a in ARGS if not a.startswith("--"))

VOICEDIR = os.path.join(DECK, "voice"); os.makedirs(VOICEDIR, exist_ok=True)

# --- ключ строго из окружения ------------------------------------------------
_kf = os.environ.get("ELEVEN_KEY", "")
KEY = (open(_kf).read().strip() if _kf and os.path.exists(_kf)
       else os.environ.get("ELEVENLABS_API_KEY", os.environ.get("XI_API_KEY", "")).strip())
if not KEY:
    raise SystemExit("нет ключа: задай ELEVENLABS_API_KEY / XI_API_KEY / ELEVEN_KEY в окружении")

# --- читаем KIT_CONFIG / KIT_CONTENT из JS через node ------------------------
def read_js(path, varname):
    js = ("const window={}; const fs=require('fs');"
          "eval(fs.readFileSync(%r,'utf8'));"
          "process.stdout.write(JSON.stringify(window.%s||null));" % (path, varname))
    out = subprocess.check_output(["node", "-e", js], text=True)
    return json.loads(out)

CFG = read_js(os.path.join(DECK, "config.js"), "KIT_CONFIG") or {}
CONTENT = read_js(os.path.join(DECK, "content.js"), "KIT_CONTENT") or {}
ITEMS = CONTENT.get("items", [])
GROUPS = CFG.get("groups", [])
RANKS = CFG.get("ranks", [])
VOICE_ID = CFG.get("voiceId", "ymDCYd8puC7gYjxIamPt")   # Marina по умолчанию
LANG = CFG.get("lang", "ru")
LONG_MODEL = "eleven_v3"
SHORT_MODEL = "eleven_multilingual_v2"                   # короткие фразы стабильнее на v2
print("колода:", os.path.basename(DECK), "| предметов:", len(ITEMS), "| тем:", len(GROUPS),
      "| голос:", VOICE_ID, "| язык:", LANG)

# --- собираем реплики (тексты — из данных) -----------------------------------
def clean(s): return re.sub(r"\s+", " ", str(s or "").strip())
PHRASES = {}
# названия предметов и тем (для вопросов «Как называется?» / «К какой теме?»)
for it in ITEMS:
    if it.get("name"): PHRASES["name_" + it["id"]] = clean(it["name"]) + "."
for g in GROUPS:
    if g.get("name"): PHRASES["group_" + g["id"]] = clean(g["name"]) + "."
# тексты вопросов (из config или дефолт)
PHRASES["q_name"]  = clean(CFG.get("q_name", "Как это называется?"))
PHRASES["q_group"] = clean(CFG.get("groupQuestion", "К какой теме это относится?"))
if CFG.get("q_which"): PHRASES["q_which"] = clean(CFG["q_which"])
# похвалы / реакции / урок / финал
PHRASES.update({
    "ok_1": "Верно!", "ok_2": "Точно!", "ok_3": "Молодец!", "ok_4": "Отлично!",
    "no_1": "Не совсем.", "learn_1": "Знакомься!", "fin_1": "Отлично сыграно! Молодец!",
})
# уровни
for i, r in enumerate(RANKS):
    nm = clean(r[1] if len(r) > 1 else "")
    if nm: PHRASES["rank_%d" % (i + 1)] = "Поздравляю! Твой уровень теперь — %s!" % nm
# факты (по флагу — для будущего аудио-режима «Слушать»)
if WITH_FACTS:
    for it in ITEMS:
        if it.get("fact"): PHRASES["fact_" + it["id"]] = clean(it["fact"])

def model_for(text): return SHORT_MODEL if len(text.split()) <= 3 else LONG_MODEL

def detox(path):
    """Срезать вдохи по краям клипа (как в geography-пайплайне)."""
    if not shutil.which("ffmpeg"):
        print("  (ffmpeg не найден — вдохи не срезаны)"); return
    tmp = path + ".trim.mp3"
    r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", path, "-af",
        "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.10,"
        "areverse,silenceremove=start_periods=1:start_threshold=-38dB:start_silence=0.10,areverse,"
        "apad=pad_dur=0.12", "-ar", "44100", "-b:a", "128k", tmp], capture_output=True)
    if r.returncode == 0 and os.path.exists(tmp) and os.path.getsize(tmp) > 1000: os.replace(tmp, path)
    else:
        try: os.remove(tmp)
        except OSError: pass

def tts(text, path):
    req = {"text": text, "model_id": model_for(text),
           "voice_settings": {"stability": 0.6, "similarity_boost": 0.75, "style": 0.0, "use_speaker_boost": True}}
    tf = os.path.join(VOICEDIR, "_tts.json"); open(tf, "w", encoding="utf-8").write(json.dumps(req, ensure_ascii=False))
    for _ in range(3):
        r = subprocess.run(["curl", "-sS", "--max-time", "120",
            "https://api.elevenlabs.io/v1/text-to-speech/%s?output_format=mp3_44100_128" % VOICE_ID,
            "-H", "xi-api-key: " + KEY, "-H", "Content-Type: application/json", "-d", "@" + tf, "-o", path],
            capture_output=True, text=True)
        if r.returncode == 0 and os.path.exists(path) and os.path.getsize(path) > 2000:
            if open(path, "rb").read(2) not in (b"{", b"[", b'{"'):
                return True
            print("  err:", open(path, encoding="utf-8", errors="replace").read()[:160]); os.remove(path)
        time.sleep(2)
    return False

todo = [k for k in PHRASES if (not ONLY or k in ONLY) and not os.path.exists(os.path.join(VOICEDIR, k + ".mp3"))]
print("клипов к генерации:", len(todo), "из", len(PHRASES))
fail = []
for k in sorted(todo):
    p = os.path.join(VOICEDIR, k + ".mp3")
    ok = tts(PHRASES[k], p)
    if ok: detox(p)
    print(("  ok  " if ok else "  FAIL ") + k + "  «" + PHRASES[k][:44] + "»")
    if not ok: fail.append(k)

try: os.remove(os.path.join(VOICEDIR, "_tts.json"))
except OSError: pass

have = sorted(f[:-4] for f in os.listdir(VOICEDIR) if f.endswith(".mp3"))
open(os.path.join(VOICEDIR, "manifest.js"), "w", encoding="utf-8").write(
    "window.KIT_VOICE=" + json.dumps(have, ensure_ascii=False) + ";\n")
tot = sum(os.path.getsize(os.path.join(VOICEDIR, f)) for f in os.listdir(VOICEDIR) if f.endswith(".mp3"))
print("\nв банке:", len(have), "клипов,", round(tot / 1024), "КБ | manifest.js обновлён")
if fail: print("НЕ СГЕНЕРИРОВАНО:", " ".join(fail))
print("Подключи в index.html колоды:  <script src=\"voice/manifest.js\"></script>  (перед kit.js)")
