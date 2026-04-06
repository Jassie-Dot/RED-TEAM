from __future__ import annotations

import io
import re
import uuid
from collections import Counter
from datetime import datetime
from typing import Iterable

import pdfplumber
from dateutil import parser as date_parser
from docx import Document

from models import EducationEntry, ExperienceEntry, ParsedResume

HEADING_MAP = {
    "summary": {"summary", "profile", "professional summary", "about"},
    "skills": {"skills", "technical skills", "core competencies", "tools", "tech stack"},
    "experience": {
        "experience",
        "work experience",
        "professional experience",
        "employment history",
        "career history",
    },
    "education": {"education", "academic background", "qualifications"},
    "projects": {"projects", "key projects", "selected projects"},
    "certifications": {"certifications", "licenses", "awards"},
}

SKILL_LIBRARY = [
    "Python",
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "FastAPI",
    "Django",
    "Flask",
    "SQL",
    "PostgreSQL",
    "MongoDB",
    "AWS",
    "Azure",
    "Docker",
    "Kubernetes",
    "Terraform",
    "GraphQL",
    "REST",
    "Tailwind CSS",
    "Framer Motion",
    "Machine Learning",
    "NLP",
    "LLM",
    "Cybersecurity",
    "SIEM",
    "SOC",
    "Splunk",
    "Linux",
    "CI/CD",
    "Git",
    "Pandas",
    "NumPy",
    "Java",
    "C++",
]

DATE_RANGE_RE = re.compile(
    r"(?P<start>(?:[A-Za-z]{3,9}\s+\d{4})|\d{4})\s*(?:-|to)\s*(?P<end>Present|Current|Now|(?:[A-Za-z]{3,9}\s+\d{4})|\d{4})",
    re.IGNORECASE,
)
EMAIL_RE = re.compile(r"[\w.\-+]+@[\w\-]+\.[\w.\-]+")
PHONE_RE = re.compile(r"(\+?\d[\d\s().-]{8,}\d)")


def parse_resume_file(filename: str, content: bytes) -> ParsedResume:
    text = extract_text(filename, content)
    text = normalize_text(text)
    lines = [line.strip() for line in text.splitlines()]
    lines = [line for line in lines if line]
    sections = extract_sections(lines)
    name = extract_name(lines)
    email = extract_contact(EMAIL_RE, text)
    phone = extract_contact(PHONE_RE, text)
    summary = sections.get("summary") or infer_summary(lines)
    skills = extract_skills(sections, text)
    experience = extract_experience(sections.get("experience", ""))
    education = extract_education(sections.get("education", ""))
    certifications = extract_list_items(sections.get("certifications", ""))

    return ParsedResume(
        resume_id=str(uuid.uuid4()),
        candidate_name=name,
        email=email,
        phone=phone,
        summary=summary,
        skills=skills,
        experience=experience,
        education=education,
        certifications=certifications,
        raw_sections=sections,
        raw_text=text,
    )


def extract_text(filename: str, content: bytes) -> str:
    extension = filename.lower().split(".")[-1]
    if extension == "pdf":
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            pages = [page.extract_text() or "" for page in pdf.pages]
        return "\n".join(pages)
    if extension == "docx":
        document = Document(io.BytesIO(content))
        return "\n".join(paragraph.text for paragraph in document.paragraphs)
    raise ValueError("Unsupported file format. Please upload a PDF or DOCX resume.")


def normalize_text(text: str) -> str:
    text = (
        text.replace("\r", "\n")
        .replace("\t", " ")
        .replace("\u2013", "-")
        .replace("\u2014", "-")
        .replace("\u2022", "\n- ")
    )
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ ]{2,}", " ", text)
    return text.strip()


def extract_sections(lines: list[str]) -> dict[str, str]:
    sections: dict[str, list[str]] = {}
    current = "header"
    sections[current] = []
    for line in lines:
        normalized = re.sub(r"[^a-z ]", "", line.lower()).strip()
        heading = match_heading(normalized)
        if heading:
            current = heading
            sections.setdefault(current, [])
            continue
        sections.setdefault(current, []).append(line)
    return {key: "\n".join(value).strip() for key, value in sections.items() if value}


def match_heading(normalized_line: str) -> str | None:
    for canonical, variants in HEADING_MAP.items():
        if normalized_line in variants:
            return canonical
    return None


def extract_name(lines: list[str]) -> str:
    for line in lines[:5]:
        if EMAIL_RE.search(line) or PHONE_RE.search(line):
            continue
        if 1 < len(line.split()) <= 5 and re.fullmatch(r"[A-Za-z .'-]+", line):
            return line.strip()
    return "Candidate"


def infer_summary(lines: list[str]) -> str | None:
    candidate_lines = []
    for line in lines[1:8]:
        if EMAIL_RE.search(line) or PHONE_RE.search(line):
            continue
        if len(line.split()) > 5:
            candidate_lines.append(line)
    return " ".join(candidate_lines[:2]) if candidate_lines else None


def extract_contact(pattern: re.Pattern[str], text: str) -> str | None:
    match = pattern.search(text)
    return match.group(0).strip() if match else None


def extract_skills(sections: dict[str, str], full_text: str) -> list[str]:
    skill_candidates: list[str] = []
    skill_section = sections.get("skills", "")
    skill_candidates.extend(extract_list_items(skill_section))
    normalized_text = full_text.lower()
    for skill in SKILL_LIBRARY:
        if skill.lower() in normalized_text:
            skill_candidates.append(skill)
    deduped = []
    seen = set()
    for item in skill_candidates:
        cleaned = item.strip(" -|,").strip()
        if not cleaned:
            continue
        title_case = cleaned if any(char.isupper() for char in cleaned) else cleaned.title()
        if title_case.lower() not in seen:
            seen.add(title_case.lower())
            deduped.append(title_case)
    return deduped[:15]


def extract_list_items(text: str) -> list[str]:
    if not text:
        return []
    chunks = re.split(r"[\n,|/]+", text)
    return [chunk.strip() for chunk in chunks if chunk.strip()]


def extract_experience(text: str) -> list[ExperienceEntry]:
    if not text:
        return []
    blocks = split_blocks(text)
    entries: list[ExperienceEntry] = []
    for block in blocks:
        lines = [line.strip("- ").strip() for line in block if line.strip()]
        if not lines:
            continue
        date_line = next((line for line in lines if DATE_RANGE_RE.search(line)), None)
        role = lines[0]
        organization = None
        if len(lines) > 1 and lines[1] != date_line:
            organization = lines[1]
        if date_line and role == date_line and len(lines) > 1:
            role = lines[1]
            organization = lines[2] if len(lines) > 2 and lines[2] != date_line else organization
        start_date, end_date, duration = parse_dates(date_line) if date_line else (None, None, 0)
        highlights = [line for line in lines[2:] if line != date_line][:4]
        entries.append(
            ExperienceEntry(
                role=role,
                organization=organization,
                start_date=start_date,
                end_date=end_date,
                duration_months=duration,
                highlights=highlights,
            )
        )
    return entries


def extract_education(text: str) -> list[EducationEntry]:
    if not text:
        return []
    blocks = split_blocks(text)
    entries: list[EducationEntry] = []
    for block in blocks:
        lines = [line.strip("- ").strip() for line in block if line.strip()]
        if not lines:
            continue
        degree = lines[0]
        institution = lines[1] if len(lines) > 1 else None
        date_line = next((line for line in lines if DATE_RANGE_RE.search(line) or re.search(r"\b(19|20)\d{2}\b", line)), None)
        graduation_date = date_line
        details = [line for line in lines[2:] if line != date_line]
        entries.append(
            EducationEntry(
                degree=degree,
                institution=institution,
                graduation_date=graduation_date,
                details=details,
            )
        )
    return entries


def split_blocks(text: str) -> list[list[str]]:
    blocks: list[list[str]] = []
    current: list[str] = []
    for line in text.splitlines():
        if line.strip():
            current.append(line)
            continue
        if current:
            blocks.append(current)
            current = []
    if current:
        blocks.append(current)
    if len(blocks) <= 1:
        lines = [line for line in text.splitlines() if line.strip()]
        blocks = _split_by_date_markers(lines)
    return blocks


def _split_by_date_markers(lines: list[str]) -> list[list[str]]:
    blocks: list[list[str]] = []
    current: list[str] = []
    for line in lines:
        if current and DATE_RANGE_RE.search(line):
            blocks.append(current)
            current = [line]
            continue
        current.append(line)
    if current:
        blocks.append(current)
    return blocks


def parse_dates(date_line: str | None) -> tuple[str | None, str | None, int]:
    if not date_line:
        return None, None, 0
    match = DATE_RANGE_RE.search(date_line)
    if not match:
        year_matches = re.findall(r"\b(?:19|20)\d{2}\b", date_line)
        if len(year_matches) >= 2:
            return year_matches[0], year_matches[1], max((int(year_matches[1]) - int(year_matches[0])) * 12, 0)
        return None, None, 0
    start_raw = match.group("start")
    end_raw = match.group("end")
    start_date = safe_parse_date(start_raw)
    end_date = datetime.utcnow() if end_raw.lower() in {"present", "current", "now"} else safe_parse_date(end_raw)
    if not start_date or not end_date:
        return start_raw, end_raw, 0
    duration = max((end_date.year - start_date.year) * 12 + (end_date.month - start_date.month), 0)
    return start_date.strftime("%b %Y"), (end_date.strftime("%b %Y") if end_raw.lower() not in {"present", "current", "now"} else "Present"), duration


def safe_parse_date(value: str) -> datetime | None:
    try:
        if re.fullmatch(r"\d{4}", value.strip()):
            return datetime(int(value), 1, 1)
        return date_parser.parse(value, default=datetime(2000, 1, 1))
    except (ValueError, OverflowError):
        return None


def keyword_density(text: str, keywords: Iterable[str]) -> Counter[str]:
    lowered = text.lower()
    counts = Counter()
    for keyword in keywords:
        counts[keyword] = lowered.count(keyword.lower())
    return counts
