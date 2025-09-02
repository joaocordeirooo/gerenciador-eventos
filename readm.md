# Gerenciador de Eventos

Projeto desenvolvido em **Node.js** com **Express** e conexão com **PostgreSQL**.  
O banco de dados pode ser iniciado facilmente usando **Docker**, com um backup (`backup.sql`) incluído para carregar todos os dados existentes.

---

## 📁 Estrutura do Projeto

gerenciador-eventos/
│
├─ docker-compose.yml
├─ backup.sql
├─ .env.example
├─ package.json
├─ package-lock.json
├─ index.js
└─ /config - arquivos de configuração
|_ /src - arquivos do backend e do front 

- `docker-compose.yml` → configura o container PostgreSQL com o backup.  
- `backup.sql` → dump do banco com todas as tabelas e dados.  
- `.env.example` → variáveis de ambiente para conexão com o banco.  

---

## ⚙️ Configuração do Ambiente

### 1. Clonar o projeto

```bash
git clone <>
cd gerenciador-eventos

//arquivo .env já está no projeto 


### Subir o banco de dados com Docker

- Abra o Docker Desktop e certifique-se de que ele está rodando.

- No terminal (PowerShell ou CMD), execute:

- !--- docker-compose up -d


depois no terminal
npm install

e ai´:
node index.js