"""Batch download runner - same session, no token re-auth between courses."""

import sys
import logging
from pathlib import Path

from hotmart_downloader.config import load_settings
from hotmart_downloader.http_client import HttpClient
from hotmart_downloader.auth import authenticate
from hotmart_downloader.api import HotmartAPI
from hotmart_downloader.downloader import DownloaderRegistry
from hotmart_downloader.video_resolver import VideoResolver
from hotmart_downloader import console as ui
from hotmart_downloader.logging_config import setup_logging

# Courses to download: (subdomain, product_id, name, mode)
# mode: "subs_mat" = subtitles + materials, "mat_only" = materials only
COURSES = [
    # BATCH 3 - Pending courses (batch 2 stopped after WhatsApp 10x 401 errors)
    # Completed in batch 2: Stories 10x, Pronto para vender, Seu produto pronto,
    #   Tráfego Pronto, Fórmula de Lançamento
    # WhatsApp 10x: retry (aulas 3-7 failed with timeout/401, skips existing)
    ("blackfridayinfinita", "4594934", "WhatsApp 10x", "subs_mat"),
    ("blackfridayinfinita", "4594931", "Crescimento 10x", "subs_mat"),
    ("blackfridayinfinita", "4644115", "Mentalidade Black", "subs_mat"),
    ("blackfridayinfinita", "4653362", "Filosofia Ladeira", "subs_mat"),
    ("blackfridayinfinita", "4594928", "Conversão 10x", "subs_mat"),
    ("blackfridayinfinita", "4594911", "Light Copy", "subs_mat"),
    ("blackfridayinfinita", "4594939", "Venda Todo Santo Dia", "subs_mat"),
    ("blackfridayinfinita", "4594936", "SuperAds", "subs_mat"),
    ("mamaefalei", "474169", "A Batalha do Sucesso", "subs_mat"),
    ("superleiturarapida", "1411374", "Super Leitura Rápida", "subs_mat"),
    ("superleituras", "1092366", "Areté - Destravando a Excelência", "subs_mat"),
]

OUTPUT_DIR = Path("/Users/luizfosc/Dropbox/Downloads/Cursos")


def main():
    setup_logging(log_file=Path("batch-download.log"), debug=True)
    logger = logging.getLogger(__name__)

    settings = load_settings()
    client = HttpClient(max_retries=settings.max_retries, timeout=settings.timeout)

    results = {"ok": [], "fail": [], "skip": []}

    with client:
        token = authenticate(client, settings)
        client.set_auth_token(token)
        api = HotmartAPI(client)
        registry = DownloaderRegistry(client)

        # Single VideoResolver for all courses (reuses browser)
        with VideoResolver(settings) as resolver:
            for i, (subdomain, pid, name, mode) in enumerate(COURSES, 1):
                print(f"\n{'='*60}")
                print(f"[{i}/{len(COURSES)}] {name}")
                print(f"  subdomain={subdomain}  pid={pid}  mode={mode}")
                print(f"{'='*60}")

                try:
                    course = api.get_course_navigation(subdomain, product_id=pid)
                    total = sum(len(m.lessons) for m in course.modules)

                    is_mat_only = mode == "mat_only"
                    is_subs = mode == "subs_mat"

                    # Import the internal download function
                    from hotmart_downloader.cli import _execute_download

                    _execute_download(
                        api=api,
                        course=course,
                        registry=registry,
                        resolver=resolver,
                        output_dir=OUTPUT_DIR,
                        quality=settings.quality,
                        download_subs=is_subs,
                        audio_only=False,
                        subtitles_only=is_subs,
                        materials_only=is_mat_only,
                        download_materials=True,
                    )
                    results["ok"].append(name)

                except Exception as e:
                    logger.error("FAILED: %s - %s", name, e)
                    print(f"  ERROR: {e}")
                    results["fail"].append((name, str(e)))

    # Summary
    print(f"\n{'='*60}")
    print("BATCH COMPLETE")
    print(f"{'='*60}")
    print(f"  OK:     {len(results['ok'])}")
    print(f"  FAILED: {len(results['fail'])}")
    for name, err in results["fail"]:
        print(f"    - {name}: {err}")


if __name__ == "__main__":
    main()
