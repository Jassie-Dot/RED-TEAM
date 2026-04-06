from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from pathlib import Path
from threading import RLock

from models import ParsedResume, ResumeAnalysis

logger = logging.getLogger(__name__)


@dataclass
class ResumeRecord:
    parsed_resume: ParsedResume
    analysis: ResumeAnalysis | None = None


@dataclass
class PersistentResumeStore:
    data_path: Path = field(
        default_factory=lambda: Path(__file__).resolve().parents[1] / "data" / "store.json"
    )
    _records: dict[str, ResumeRecord] = field(default_factory=dict, init=False)
    _lock: RLock = field(default_factory=RLock, init=False)

    def __post_init__(self) -> None:
        self._load()

    def save_resume(self, parsed_resume: ParsedResume) -> None:
        with self._lock:
            self._records[parsed_resume.resume_id] = ResumeRecord(parsed_resume=parsed_resume)
            self._persist()

    def get_resume(self, resume_id: str) -> ParsedResume | None:
        with self._lock:
            record = self._records.get(resume_id)
            return record.parsed_resume if record else None

    def save_analysis(self, analysis: ResumeAnalysis) -> None:
        with self._lock:
            record = self._records.get(analysis.resume_id)
            if record is None:
                logger.warning("Skipping analysis persistence for unknown resume_id=%s", analysis.resume_id)
                return

            record.analysis = analysis
            self._persist()

    def get_analysis(self, resume_id: str) -> ResumeAnalysis | None:
        with self._lock:
            record = self._records.get(resume_id)
            return record.analysis if record else None

    def _load(self) -> None:
        self.data_path.parent.mkdir(parents=True, exist_ok=True)
        if not self.data_path.exists():
            return

        try:
            payload = json.loads(self.data_path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError) as exc:
            logger.warning("Unable to read persisted Vigil-AI store: %s", exc)
            return

        if not isinstance(payload, dict):
            logger.warning("Persisted Vigil-AI store was not an object. Starting with an empty store.")
            return

        restored: dict[str, ResumeRecord] = {}
        for resume_id, raw_record in payload.items():
            if not isinstance(raw_record, dict):
                continue

            raw_resume = raw_record.get("parsed_resume")
            if not raw_resume:
                continue

            try:
                parsed_resume = ParsedResume.model_validate(raw_resume)
                analysis = raw_record.get("analysis")
                restored[resume_id] = ResumeRecord(
                    parsed_resume=parsed_resume,
                    analysis=ResumeAnalysis.model_validate(analysis) if analysis else None,
                )
            except Exception as exc:  # pragma: no cover - defensive hydration guard
                logger.warning("Skipping invalid persisted record for %s: %s", resume_id, exc)

        self._records = restored

    def _persist(self) -> None:
        payload = {
            resume_id: {
                "parsed_resume": record.parsed_resume.model_dump(mode="json"),
                "analysis": record.analysis.model_dump(mode="json") if record.analysis else None,
            }
            for resume_id, record in self._records.items()
        }

        temp_path = self.data_path.with_suffix(".tmp")
        try:
            temp_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
            temp_path.replace(self.data_path)
        except OSError as exc:  # pragma: no cover - defensive persistence guard
            logger.warning("Unable to persist Vigil-AI store: %s", exc)


store = PersistentResumeStore()
