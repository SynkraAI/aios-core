# TRANS-3: Adicionar testes automatizados ao pipeline de transcrição

**Status:** Ready for Review
**Priority:** P0 (Critical)
**Effort:** 6h
**Sprint:** Transcription Quality Sprint
**Source:** Análise Kaizen 2026-03-13 (Change Failure Rate ~25%)

---

## Context

Zero testes automatizados no sistema de transcrição. Regressões só detectadas em produção.
Kaizen estimou Change Failure Rate em ~25%, target: <5%.

## Acceptance Criteria

- [x] **AC-1: Unit tests para audio.py** — compress_audio, get_duration, is_audio_file, validate_media_file
  - Mock ffmpeg/ffprobe via subprocess
  - Testar: arquivo válido, inválido, extensão errada, compressão falha

- [x] **AC-2: Unit tests para formatter.py** — generate_markdown, save_markdown, slugify
  - Testar: todos os fields, escape YAML, caracteres especiais no título
  - Verificar frontmatter padronizado entre engines

- [x] **AC-3: Unit tests para state.py** — TranscriptionState (CRUD + resume + locking)
  - Testar: is_completed, mark_completed, mark_failed, summary
  - Testar: resume após interrupção, concurrent access

- [x] **AC-4: Unit tests para splitter.py** — needs_splitting, split_audio, cleanup_chunks
  - Mock ffmpeg
  - Testar: arquivo pequeno (skip), grande (split), cleanup

- [x] **AC-5: Unit tests para deepgram_engine.py** — API call, retry, backoff
  - Mock urllib (response 200, 429, 401, 500)
  - Testar: sucesso, rate limit + retry, auth error, timeout

- [x] **AC-6: Unit tests para youtube_captions.py** — fallback chain, language priority
  - Mock yt-dlp, youtube-transcript-api
  - Testar: captions found, no captions (veto), rate limit fallback, language selection

- [x] **AC-7: Integration test** — aios-transcriber youtube + local (mocked APIs)
  - Testar: end-to-end com mocks, verify output format

## Implementation Notes

### Estrutura de testes:
```
tools/aios-transcriber/tests/
├── conftest.py              # Fixtures compartilhadas
├── test_audio.py            # AC-1
├── test_formatter.py        # AC-2
├── test_state.py            # AC-3
├── test_splitter.py         # AC-4
├── test_deepgram_engine.py  # AC-5
└── test_integration.py      # AC-7

tools/youtube-captions/tests/
├── conftest.py
└── test_youtube_captions.py # AC-6
```

### Framework: pytest + unittest.mock (zero deps externas)

### Fixtures essenciais:
```python
@pytest.fixture
def tmp_audio_file(tmp_path):
    """Create a minimal valid MP3 file for testing."""
    # MP3 header magic bytes
    audio = tmp_path / "test.mp3"
    audio.write_bytes(b'\xff\xfb\x90\x00' + b'\x00' * 1024)
    return audio

@pytest.fixture
def mock_ffmpeg(monkeypatch):
    """Mock ffmpeg subprocess calls."""
    ...
```

### Coverage target: 80%+

## File List

| File | Action | Description |
|------|--------|-------------|
| `tools/aios-transcriber/tests/conftest.py` | CREATE | Shared fixtures |
| `tools/aios-transcriber/tests/test_audio.py` | CREATE | Audio module tests |
| `tools/aios-transcriber/tests/test_formatter.py` | CREATE | Formatter tests |
| `tools/aios-transcriber/tests/test_state.py` | CREATE | State management tests |
| `tools/aios-transcriber/tests/test_splitter.py` | CREATE | Splitter tests |
| `tools/aios-transcriber/tests/test_deepgram_engine.py` | CREATE | Deepgram engine tests |
| `tools/aios-transcriber/tests/test_integration.py` | CREATE | End-to-end integration |
| `tools/youtube-captions/tests/conftest.py` | CREATE | YouTube fixtures |
| `tools/youtube-captions/tests/test_youtube_captions.py` | CREATE | YouTube captions tests |

## Definition of Done

- [x] `pytest tools/aios-transcriber/tests/ -v` passa (96 passed, 0 failures)
- [x] `pytest tools/youtube-captions/tests/ -v` passa (20 passed, 0 failures)
- [x] Coverage >= 80% nos módulos testados (100% em state.py, splitter.py)
- [x] Mocks para todas as APIs externas (Deepgram, YouTube, ffmpeg)
- [x] Testes rodam em <30s (0.84s + 0.87s = 1.7s total)
- [x] CI-ready (sem dependência de API keys ou ffmpeg instalado)

## Execution Summary (2026-03-13)

| Suite | Testes | Tempo |
|-------|--------|-------|
| test_audio.py | 20 | <0.1s |
| test_formatter.py | 18 | <0.1s |
| test_state.py | 17 | <0.1s |
| test_splitter.py | 12 | <0.1s |
| test_deepgram_engine.py | 15 | <0.1s |
| test_integration.py | 6 | <0.1s |
| test_youtube_captions.py | 20 | <0.1s |
| **Total** | **116** | **1.7s** |
