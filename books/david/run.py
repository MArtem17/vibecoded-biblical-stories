"""
Запуск всего автоматического конвейера одной командой.

Ручной гейт (выбор эталона) делается ОТДЕЛЬНО заранее:
    python pipeline/gen_anchor.py    → выбрать → mv _anchor_N.png _anchor.png

Потом:
    python run.py            # картинки → QA → перевод → озвучка → сборка
    python run.py --no-tts   # без озвучки (быстрый визуальный прогон)
    python run.py --build    # только пересобрать book_data.js

Нужны переменные окружения: OPENAI_API_KEY, ANTHROPIC_API_KEY, ELEVENLABS_API_KEY.
"""

import sys
import runpy
from pathlib import Path

PIPE = Path(__file__).resolve().parent / "pipeline"

# Шаги пайплайна делают `import common`. При прямом запуске
# (python pipeline/gen_anchor.py) Python сам кладёт pipeline/ в sys.path,
# а runpy.run_path для файла — нет. Добавляем вручную, иначе run.py падает
# на первом же шаге с ModuleNotFoundError: No module named 'common'.
if str(PIPE) not in sys.path:
    sys.path.insert(0, str(PIPE))


def run(module):
    print(f"\n=== {module} ===")
    # runpy.run_path не чистит sys.argv, поэтому шаги, читающие sys.argv[1:]
    # (gen_images — номера страниц, tts — языки), иначе наследуют флаги самого
    # run.py (например --no-tts) и падают. Подменяем argv на «только имя скрипта».
    saved_argv = sys.argv
    sys.argv = [str(PIPE / module)]
    try:
        runpy.run_path(str(PIPE / module), run_name="__main__")
    finally:
        sys.argv = saved_argv


def main():
    args = set(sys.argv[1:])

    if "--build" in args:
        run("build_manifest.py")
        return

    run("gen_images.py")
    run("qa_vision.py")
    run("translate.py")
    if "--no-tts" not in args:
        run("tts.py")
    run("build_manifest.py")
    print("\nГотово. Открой reader.html.")


if __name__ == "__main__":
    main()
