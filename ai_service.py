from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import re
import unicodedata
import requests

app = FastAPI()

ALLOWED_TAGS = {
    "noun",
    "verb",
    "adjective",
    "adverb",
    "pronoun",
    "preposition",
    "conjunction",
    "interjection",
    "determiner",
    "numeral",
    "auxiliary",
    "other",
    "unknown",
}

TAG_ALIASES = {
    "substantivo": "noun",
    "nome": "noun",
    "verbo": "verb",
    "adjetivo": "adjective",
    "adverbio": "adverb",
    "pronome": "pronoun",
    "preposicao": "preposition",
    "conjuncao": "conjunction",
    "interjeicao": "interjection",
    "determinante": "determiner",
    "artigo": "determiner",
    "numeral": "numeral",
    "auxiliar": "auxiliary",
}

SYSTEM_PROMPT = (
    "You classify a single English word into parts of speech. "
    "Return a comma-separated list using only these tags: "
    "noun, verb, adjective, adverb, pronoun, preposition, conjunction, "
    "interjection, determiner, numeral, auxiliary, other, unknown. "
    "If multiple apply, return multiple tags. Return only the list."
)


class ClassifyRequest(BaseModel):
    word: str


class ClassifyResponse(BaseModel):
    partsOfSpeech: str


def get_llm_url() -> str:
    return os.getenv("LLM_URL", "http://127.0.0.1:1234/v1/chat/completions")


def get_max_tokens() -> int:
    raw_value = os.getenv("LLM_MAX_TOKENS", "-1")
    try:
        return int(raw_value)
    except ValueError:
        return -1


def strip_accents(text: str) -> str:
    normalized = unicodedata.normalize("NFKD", text)
    return "".join(char for char in normalized if not unicodedata.combining(char))


def normalize_tags(text: str) -> str:
    cleaned = strip_accents(text.replace(";", ",")).strip().lower()
    parts = [item.strip() for item in re.split(r"[,/|\n]", cleaned) if item.strip()]
    tags: list[str] = []

    for part in parts:
        if part in ALLOWED_TAGS and part not in tags:
            tags.append(part)
            continue
        alias = TAG_ALIASES.get(part)
        if alias and alias not in tags:
            tags.append(alias)

    if not tags:
        words = re.findall(r"[a-z]+", cleaned)
        for word in words:
            alias = TAG_ALIASES.get(word)
            if alias and alias not in tags:
                tags.append(alias)
        if not tags:
            return "unknown"

    return ", ".join(tags)


@app.post("/classify", response_model=ClassifyResponse)
async def classify(request: ClassifyRequest) -> ClassifyResponse:
    if not request.word or not request.word.strip():
        raise HTTPException(status_code=400, detail="word is required")

    model = os.getenv("LLM_MODEL", "local-model")
    llm_url = get_llm_url()

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Word: {request.word}"},
        ],
        "temperature": 0,
        "max_tokens": get_max_tokens(),
        "stream": False,
    }

    try:
        response = requests.post(llm_url, json=payload, timeout=20)
        response.raise_for_status()
    except requests.RequestException as exc:
        detail = getattr(exc.response, "text", str(exc)) if hasattr(exc, "response") else str(exc)
        raise HTTPException(status_code=502, detail=f"LLM error: {detail}")

    data = response.json()
    content = (
        data.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "unknown")
    )
    parts_of_speech = normalize_tags(content)
    return ClassifyResponse(partsOfSpeech=parts_of_speech)
