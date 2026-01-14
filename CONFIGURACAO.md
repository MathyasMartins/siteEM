# 🎯 Guia Completo de Configuração - Site Romântico

Este documento fornece instruções passo a passo para configurar o Supabase, Cloudinary e publicar o site no GitHub Pages.

---

## 📋 Índice

1. [Configuração do Supabase](#configuração-do-supabase)
2. [Configuração do Cloudinary](#configuração-do-cloudinary)
3. [Configuração do Projeto](#configuração-do-projeto)
4. [Publicação no GitHub Pages](#publicação-no-github-pages)
5. [Exemplos de Chamadas REST](#exemplos-de-chamadas-rest)
6. [Troubleshooting](#troubleshooting)

---

## 🗄️ Configuração do Supabase

### Passo 1: Criar um Projeto no Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com)
2. Clique em **"New Project"**
3. Preencha os dados:
   - **Project name**: `site-romantico` (ou o nome que desejar)
   - **Database password**: Crie uma senha forte
   - **Region**: Escolha a região mais próxima
4. Clique em **"Create new project"** e aguarde a criação (pode levar alguns minutos)

### Passo 2: Executar o Schema SQL

1. No painel do Supabase, clique em **"SQL Editor"** no menu lateral
2. Clique em **"New Query"**
3. Abra o arquivo `SUPABASE_SCHEMA.sql` deste projeto
4. Copie todo o conteúdo e cole na janela de query
5. Clique em **"Run"** para executar
6. Verifique se todas as tabelas foram criadas em **"Table Editor"**

### Passo 3: Obter as Credenciais

1. Clique em **"Settings"** no menu lateral
2. Clique em **"API"**
3. Copie os seguintes valores:
   - **Project URL**: `https://seu-projeto.supabase.co`
   - **anon public key**: Sua chave pública

**Salve esses valores com segurança. Você precisará deles no próximo passo.**

### Passo 4: Ativar Row Level Security (RLS)

1. Vá para **"Authentication"** → **"Policies"**
2. Verifique se todas as políticas foram criadas corretamente (elas já devem estar ativas após executar o SQL)
3. Para cada tabela, confirme que há políticas de **SELECT**, **INSERT**, **UPDATE** e **DELETE**

---

## ☁️ Configuração do Cloudinary

### Passo 1: Criar uma Conta no Cloudinary

1. Acesse [https://cloudinary.com](https://cloudinary.com)
2. Clique em **"Sign Up"** e crie uma conta gratuita
3. Confirme seu email

### Passo 2: Obter as Credenciais

1. No painel do Cloudinary, vá para **"Settings"** → **"Upload"**
2. Procure por **"Upload presets"** e clique em **"Add upload preset"**
3. Preencha os dados:
   - **Name**: `site-romantico-unsigned` (ou o nome que desejar)
   - **Unsigned**: Marque como **ON** (importante para unsigned upload)
   - **Folder**: `site-romantico/fotos` (opcional, para organizar)
4. Clique em **"Save"**

### Passo 3: Copiar Credenciais

1. Volte para **"Dashboard"** (página inicial)
2. Copie o **Cloud Name** (algo como `dxxxxxxxxxxx`)
3. Copie o **Upload Preset** que você criou (`site-romantico-unsigned`)

**Salve esses valores com segurança.**

---

## ⚙️ Configuração do Projeto

### Passo 1: Abrir o Arquivo `script.js`

Abra o arquivo `script.js` na raiz do projeto e procure pela seção de configuração (primeiras linhas):

```javascript
// ============================================================================
// CONFIGURAÇÃO - EDITE AQUI COM SEUS VALORES
// ============================================================================

const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-publica-aqui';

const CLOUDINARY_CLOUD_NAME = 'seu-cloud-name';
const CLOUDINARY_UPLOAD_PRESET = 'site-romantico-unsigned';
```

### Passo 2: Substituir os Valores

1. Substitua `https://seu-projeto.supabase.co` pela URL do seu projeto Supabase
2. Substitua `sua-chave-publica-aqui` pela chave pública do Supabase
3. Substitua `seu-cloud-name` pelo Cloud Name do Cloudinary
4. Mantenha o `CLOUDINARY_UPLOAD_PRESET` como você configurou

### Passo 3: Salvar o Arquivo

Salve o arquivo `script.js` após fazer as alterações.

---

## 🚀 Publicação no GitHub Pages

### Passo 1: Criar um Repositório no GitHub

1. Acesse [https://github.com/new](https://github.com/new)
2. Preencha os dados:
   - **Repository name**: `site-romantico` (ou o nome que desejar)
   - **Description**: "Site romântico para o nosso casal"
   - **Public**: Marque como público (necessário para GitHub Pages)
3. Clique em **"Create repository"**

### Passo 2: Enviar os Arquivos

#### Opção A: Usando Git (Recomendado)

```bash
# Clone o repositório vazio
git clone https://github.com/MathyasMartins/siteEM.git
cd siteEM

# Copie todos os arquivos do projeto para esta pasta
# (index.html, galeria.html, admin.html, surpresa.html, style.css, script.js, manifest.json, sw.js)

# Adicione os arquivos
git add .

# Faça o commit
git commit -m "Versão inicial do site romântico"

# Envie para o GitHub
git push -u origin main
```

#### Opção B: Usando a Interface Web do GitHub

1. No repositório do GitHub, clique em **"Add file"** → **"Upload files"**
2. Arraste todos os arquivos do projeto para a área de upload
3. Clique em **"Commit changes"**

### Passo 3: Ativar GitHub Pages

1. Vá para **"Settings"** do repositório
2. Clique em **"Pages"** no menu lateral
3. Em **"Source"**, selecione:
   - **Branch**: `main`
   - **Folder**: `/ (root)`
4. Clique em **"Save"**
5. Aguarde alguns minutos. O GitHub Pages gerará uma URL como `https://seu-usuario.github.io/site-romantico`

### Passo 4: Acessar o Site

Acesse a URL gerada pelo GitHub Pages e seu site estará ao vivo!

---

## 📡 Exemplos de Chamadas REST

### 1. Buscar Configurações

```javascript
const fetchConfig = async () => {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/config?id=eq.1`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  const data = await response.json();
  return data[0];
};
```

### 2. Atualizar Configurações

```javascript
const updateConfig = async (updates) => {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/config?id=eq.1`,
    {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    }
  );
  return await response.json();
};
```

### 3. Buscar Recadinhos Aprovados

```javascript
const fetchRecadinhos = async () => {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/recadinhos?aprovado=eq.true&order=criado_em.desc`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return await response.json();
};
```

### 4. Inserir um Novo Recadinho

```javascript
const insertRecadinho = async (autor, mensagem) => {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/recadinhos`,
    {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        autor: autor,
        mensagem: mensagem,
        aprovado: false
      })
    }
  );
  return await response.json();
};
```

### 5. Buscar Fotos

```javascript
const fetchFotos = async () => {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/fotos?order=criado_em.desc`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return await response.json();
};
```

### 6. Deletar um Recadinho

```javascript
const deleteRecadinho = async (id) => {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/recadinhos?id=eq.${id}`,
    {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return await response.json();
};
```

### 7. Buscar Agenda

```javascript
const fetchAgenda = async () => {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/agenda?order=data.asc`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return await response.json();
};
```

---

## 🔐 Segurança e Boas Práticas

### ⚠️ Importante: Chaves Públicas vs Privadas

- **Chave Pública (anon key)**: Pode ser exposta no frontend (está em `script.js`)
- **Chave Privada (service_role key)**: NUNCA exponha no frontend

### ✅ Boas Práticas

1. **RLS (Row Level Security)**: Já está ativado no schema SQL. Isso garante que apenas dados aprovados sejam acessíveis publicamente.
2. **Validação de Dados**: O frontend valida dados antes de enviar ao Supabase.
3. **CORS**: Supabase já permite requisições do GitHub Pages por padrão.

---

## 🐛 Troubleshooting

### Problema: "CORS error" ao tentar acessar Supabase

**Solução:**
1. Vá para **Settings** → **API** no Supabase
2. Procure por **"CORS"** e adicione a URL do seu site:
   - Se usar GitHub Pages: `https://seu-usuario.github.io`
   - Se usar localhost: `http://localhost:3000`

### Problema: Fotos não aparecem no slideshow

**Verificar:**
1. Confirme que as fotos foram enviadas para o Cloudinary
2. Verifique se a tabela `fotos` contém as URLs corretas
3. Abra o console do navegador (F12) e procure por erros de CORS

### Problema: Recadinhos não aparecem

**Verificar:**
1. Confirme que os recadinhos foram marcados como `aprovado = true` na tabela `recadinhos`
2. Verifique se a política de RLS está correta para leitura pública

### Problema: Senha de admin não funciona

**Solução:**
1. Abra o console do navegador (F12)
2. Vá para **Application** → **Local Storage**
3. Procure por `admin_password_hash` e delete
4. Recarregue a página e defina uma nova senha

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique o console do navegador (F12) para mensagens de erro
2. Verifique os logs do Supabase em **"Logs"** → **"API Logs"**
3. Consulte a documentação oficial:
   - Supabase: https://supabase.com/docs
   - Cloudinary: https://cloudinary.com/documentation
   - GitHub Pages: https://docs.github.com/en/pages

---

**Parabéns! Seu site romântico está pronto! ❤️**
