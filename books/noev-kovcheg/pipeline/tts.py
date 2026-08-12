"""
ШАГ 6 — озвучка по языкам (ElevenLabs) + обрезка тишины (ffmpeg).

По умолчанию ОДИН мультиязычный голос на все языки (single_voice_all_languages),
чтобы «диктор» был один во всех изданиях. Можно задать свой голос на язык через
config.tts.voice_by_language (например, Marina v3 на ru).

Озвучка делается на КАЖДЫЙ язык (это и текст, и аудио форкаются), картинки общие.

Требует: pip install elevenlabs, установленный ffmpeg в системе.

  export ELEVENLABS_API_KEY=...
  python pipeline/tts.py
  python pipeline/tts.py en        # только английский
"""

import sys
import json
import subprocess
import tempfile
from pathlib import Path
from elevenlabs.client import ElevenLabs

from common import CONFIG, BOOK, ROOT, page_audio_path

el = ElevenLabs()
TTS = CONFIG["tts"]


def voice_for(lang):
    if not TTS["single_voice_all_languages"]:
        v = TTS["voice_by_language"].get(lang)
        if v:
            return v
    return TTS["voice_by_language"].get(lang, TTS["default_voice_id"])


def trim_silence(in_bytes):
    """Обрезать тишину в начале/конце через ffmpeg silenceremove."""
    if not TTS.get("trim_silence"):
        return in_bytes
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as fin, \
         tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as fout:
        fin.write(in_bytes); fin.flush()
        cmd = [
            "ffmpeg", "-y", "-i", fin.name,
            "-af",
            "silenceremove=start_periods=1:start_silence=0.1:start_threshold=-50dB:"
            "stop_periods=1:stop_silence=0.3:stop_threshold=-50dB",
            fout.name,
        ]
        r = subprocess.run(cmd, capture_output=True)
        if r.returncode != 0:
            print("    ffmpeg предупреждение, оставляю без обрезки")
            return in_bytes
        return Path(fout.name).read_bytes()


def synth(text, voice_id):
    audio = el.text_to_speech.convert(
        voice_id=voice_id,
        model_id=TTS["model_id"],
        text=text,
        output_format=TTS["output_format"],
    )
    return b"".join(audio)  # SDK отдаёт генератор байтов


def main(langs=None):
    langs = langs or CONFIG["languages"]
    trans_dir = ROOT / "translations"

    for lang in langs:
        tfile = trans_dir / f"{lang}.json"
        if not tfile.exists():
            print(f"  [{lang}] нет перевода ({tfile.name}) — сначала translate.py")
            continue
        texts = json.loads(tfile.read_text(encoding="utf-8"))
        vid = voice_for(lang)
        print(f"  [{lang}] голос {vid} — {len(texts)} страниц")
        for i, text in enumerate(texts, start=1):
            raw = synth(text, vid)
            clean = trim_silence(raw)
            out = ROOT / page_audio_path(lang, i)
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_bytes(clean)
            print(f"    стр.{i:>2} → {out.relative_to(ROOT)}")

    print("Готово. Дальше — сборка: python pipeline/build_manifest.py")


if __name__ == "__main__":
    main(sys.argv[1:] or None)
