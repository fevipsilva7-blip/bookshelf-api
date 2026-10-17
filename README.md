# Bookshelf API

API REST para gerenciar uma estante de livros, feita com **TypeScript**, **Express** e **PostgreSQL**. Inclui uma interface web simples para usar a API direto no navegador.

> status: concluído
> stack: TypeScript + Node.js + Express + PostgreSQL (pg) + Docker

## Funcionalidades

- CRUD completo de livros (título, autor, páginas, status e nota)
- Filtro por status e busca por título/autor
- Busca de livros na [Open Library](https://openlibrary.org/developers/api) (API pública, sem chave) com capa, autor, ano e páginas, e botão para adicionar o resultado à estante, que é exibida como uma grade visual de capas
- Endpoint de estatísticas (total por status, páginas lidas, nota média)
- Validação de entrada com mensagens de erro claras
- Constraints no banco (`CHECK`) para status e nota
- Health check que confirma a conexão com o banco
- Interface web em `public/index.html`

## Como rodar

Pré-requisitos: Node.js 20+ e Docker.

```bash
# 1. instalar dependências
npm install

# 2. configurar variáveis de ambiente
cp .env.example .env

# 3. subir o PostgreSQL
docker compose up -d

# 4. criar a tabela
npm run db:init

# 5. rodar em modo desenvolvimento
npm run dev
```

Abra `http://localhost:3000` para usar a interface ou consuma a API diretamente.

### Build de produção

```bash
npm run build
npm start
```

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Verifica API e banco |
| GET | `/search?q=texto` | Busca livros na Open Library |
| GET | `/books` | Lista livros (`?status=lendo&q=texto`) |
| GET | `/books/stats` | Estatísticas da estante |
| GET | `/books/:id` | Busca um livro |
| POST | `/books` | Cria um livro |
| PATCH | `/books/:id` | Atualiza campos de um livro |
| DELETE | `/books/:id` | Remove um livro |

Status válidos: `quero_ler`, `lendo`, `lido`. Nota: inteiro de 1 a 5.

### Exemplo

```bash
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Clean Code","author":"Robert C. Martin","pages":464,"status":"lendo"}'
```

## Estrutura

```
bookshelf-api/
├── schema.sql           # definição da tabela e índice
├── docker-compose.yml   # PostgreSQL local
├── public/index.html    # interface web
└── src/
    ├── index.ts         # servidor Express
    ├── db.ts            # pool de conexão
    ├── openLibrary.ts   # cliente da API da Open Library
    ├── initDb.ts        # aplica o schema.sql
    ├── types.ts         # tipos do domínio
    ├── validation.ts    # validação de entrada
    └── routes/
        ├── books.ts     # rotas de livros
        └── search.ts    # rota de busca externa
```

## Próximos passos

- Testes automatizados (Vitest + Supertest)
- Paginação na listagem
- Deploy da API e do banco (Render, Railway ou Neon)

## Licença

MIT
