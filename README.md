# EnglishLearn

A simple app to register English words and their Portuguese translations, with a Java backend and an Angular frontend.

## Backend (Spring Boot + SQLite)

1) Open a terminal in the `backend` folder.
2) Run:

```
mvn spring-boot:run
```

The API runs at `http://localhost:8080`.

## Frontend (Angular)

1) Open a terminal in the `frontend` folder.
2) Run:

```
npm install
npm start
```

The frontend runs at `http://localhost:4200`.

## AI Service (Python + LLM local)

1) Make sure you have a local AI model running at `http://127.0.0.1:1234/v1/chat/completions`.
2) Optional: configure `LLM_URL` and `LLM_MODEL`.
3) Open a terminal in the project root and create/activate the virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

4) Install dependencies and start the service:

```
pip install -r requirements.txt
python -m uvicorn ai_service:app --reload --port 8000
```

If you prefer, without activating the virtual environment:

```powershell
{path}/EnglishLearn/.venv/Scripts/python.exe -m uvicorn ai_service:app --reload --port 8000
```

Do not use `uvicorn .\\ai_service.py:app ...` (file path). The correct format is `module:variable`, in this case `ai_service:app`.

The backend calls `http://localhost:8000/classify` to get the part of speech.

## Endpoints

- `GET /words` lists all words
- `POST /words` creates a word (returns 409 if it already exists)
- `PUT /words/{id}` updates a word
- `DELETE /words/{id}` deletes a word
