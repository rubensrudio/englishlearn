# EnglishLearn

Aplicacao simples para cadastrar palavras em ingles e suas traducoes em portugues, com backend em Java e frontend em Angular.

## Backend (Spring Boot + SQLite)

1) Abra um terminal na pasta `backend`.
2) Execute:

```
mvn spring-boot:run
```

A API sobe em `http://localhost:8080`.

## Frontend (Angular)

1) Abra um terminal na pasta `frontend`.
2) Execute:

```
npm install
npm start
```

O frontend sobe em `http://localhost:4200`.

## AI Service (Python + LLM local)

1) Certifique-se de ter uma IA local rodando em `http://127.0.0.1:1234/v1/chat/completions`.
2) Opcional: configure `LLM_URL` e `LLM_MODEL`.
3) Abra um terminal na raiz do projeto e execute:

```
pip install -r requirements.txt
uvicorn ai_service:app --reload --port 8000
```

O backend chama o endpoint `http://localhost:8000/classify` para obter a classe gramatical.

## Endpoints

- `GET /words` lista todas as palavras
- `POST /words` cria uma palavra (retorna 409 se ja existir)
- `PUT /words/{id}` atualiza uma palavra
- `DELETE /words/{id}` exclui uma palavra
