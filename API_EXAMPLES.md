# 📡 Exemplos de Chamadas REST - Supabase API

Este documento fornece exemplos de como usar a API REST do Supabase diretamente, sem usar as classes JavaScript fornecidas.

## 🔑 Configuração Básica

Todas as requisições devem incluir os headers:

```javascript
headers: {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
}
```

## 📊 Tabela: config

### Buscar Configurações

```javascript
// GET
fetch(`${SUPABASE_URL}/rest/v1/config?id=eq.1`, {
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  }
})
.then(res => res.json())
.then(data => console.log(data[0]));

// Resposta:
// {
//   "id": 1,
//   "nome_casal": "João e Maria",
//   "inicio_relacionamento": "2020-01-15",
//   "ultima_vez_vistos": "2024-12-20",
//   "proximo_encontro": "2024-12-25",
//   "modo_noturno": false,
//   "created_at": "2024-01-01T10:00:00+00:00",
//   "updated_at": "2024-12-20T15:30:00+00:00"
// }
```

### Atualizar Configurações

```javascript
// PATCH
fetch(`${SUPABASE_URL}/rest/v1/config?id=eq.1`, {
  method: 'PATCH',
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nome_casal: "João e Maria",
    proximo_encontro: "2024-12-25"
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

## 💌 Tabela: recadinhos

### Buscar Recadinhos Aprovados

```javascript
// GET
fetch(`${SUPABASE_URL}/rest/v1/recadinhos?aprovado=eq.true&order=criado_em.desc`, {
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  }
})
.then(res => res.json())
.then(data => console.log(data));

// Resposta:
// [
//   {
//     "id": 1,
//     "autor": "Amor",
//     "mensagem": "Você é o amor da minha vida!",
//     "criado_em": "2024-12-20T10:00:00+00:00",
//     "aprovado": true
//   },
//   ...
// ]
```

### Buscar Todos os Recadinhos (Incluindo Pendentes)

```javascript
// GET
fetch(`${SUPABASE_URL}/rest/v1/recadinhos?order=criado_em.desc`, {
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

### Inserir um Novo Recadinho

```javascript
// POST
fetch(`${SUPABASE_URL}/rest/v1/recadinhos`, {
  method: 'POST',
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    autor: "Amor",
    mensagem: "Você é o amor da minha vida!",
    aprovado: false
  })
})
.then(res => res.json())
.then(data => console.log(data));

// Resposta:
// {
//   "id": 2,
//   "autor": "Amor",
//   "mensagem": "Você é o amor da minha vida!",
//   "criado_em": "2024-12-20T15:30:00+00:00",
//   "aprovado": false
// }
```

### Atualizar um Recadinho

```javascript
// PATCH
fetch(`${SUPABASE_URL}/rest/v1/recadinhos?id=eq.2`, {
  method: 'PATCH',
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    aprovado: true
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

### Deletar um Recadinho

```javascript
// DELETE
fetch(`${SUPABASE_URL}/rest/v1/recadinhos?id=eq.2`, {
  method: 'DELETE',
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

## 📸 Tabela: fotos

### Buscar Todas as Fotos

```javascript
// GET
fetch(`${SUPABASE_URL}/rest/v1/fotos?order=criado_em.desc`, {
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  }
})
.then(res => res.json())
.then(data => console.log(data));

// Resposta:
// [
//   {
//     "id": 1,
//     "url": "https://res.cloudinary.com/...",
//     "criado_em": "2024-12-20T10:00:00+00:00"
//   },
//   ...
// ]
```

### Inserir uma Nova Foto

```javascript
// POST
fetch(`${SUPABASE_URL}/rest/v1/fotos`, {
  method: 'POST',
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: "https://res.cloudinary.com/..."
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

### Deletar uma Foto

```javascript
// DELETE
fetch(`${SUPABASE_URL}/rest/v1/fotos?id=eq.1`, {
  method: 'DELETE',
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

## 🗓️ Tabela: agenda

### Buscar Todos os Eventos

```javascript
// GET
fetch(`${SUPABASE_URL}/rest/v1/agenda?order=data.asc`, {
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  }
})
.then(res => res.json())
.then(data => console.log(data));

// Resposta:
// [
//   {
//     "id": 1,
//     "titulo": "Aniversário",
//     "data": "2024-12-25",
//     "mensagem": "Feliz aniversário, meu amor!",
//     "criado_em": "2024-12-20T10:00:00+00:00"
//   },
//   ...
// ]
```

### Buscar Eventos de uma Data Específica

```javascript
// GET
fetch(`${SUPABASE_URL}/rest/v1/agenda?data=eq.2024-12-25`, {
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

### Inserir um Novo Evento

```javascript
// POST
fetch(`${SUPABASE_URL}/rest/v1/agenda`, {
  method: 'POST',
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    titulo: "Aniversário",
    data: "2024-12-25",
    mensagem: "Feliz aniversário, meu amor!"
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

### Deletar um Evento

```javascript
// DELETE
fetch(`${SUPABASE_URL}/rest/v1/agenda?id=eq.1`, {
  method: 'DELETE',
  headers: {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

## ☁️ Upload para Cloudinary

### Upload de Imagem

```javascript
const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData
    }
  );

  const data = await response.json();
  return data.secure_url; // URL da imagem
};
```

## 🔍 Filtros e Operadores

### Operadores de Comparação

- `eq` - igual
- `neq` - não igual
- `gt` - maior que
- `gte` - maior ou igual
- `lt` - menor que
- `lte` - menor ou igual
- `like` - contém (case-insensitive)
- `ilike` - contém (case-sensitive)
- `in` - em lista

### Exemplos

```javascript
// Recadinhos do autor "Eu"
fetch(`${SUPABASE_URL}/rest/v1/recadinhos?autor=eq.Eu`, ...)

// Recadinhos criados após uma data
fetch(`${SUPABASE_URL}/rest/v1/recadinhos?criado_em=gt.2024-12-20`, ...)

// Recadinhos que contêm "amor"
fetch(`${SUPABASE_URL}/rest/v1/recadinhos?mensagem=like.amor`, ...)

// Múltiplos filtros (AND)
fetch(`${SUPABASE_URL}/rest/v1/recadinhos?aprovado=eq.true&autor=eq.Amor`, ...)
```

### Ordenação

```javascript
// Ordenar por data (decrescente)
fetch(`${SUPABASE_URL}/rest/v1/recadinhos?order=criado_em.desc`, ...)

// Ordenar por múltiplos campos
fetch(`${SUPABASE_URL}/rest/v1/recadinhos?order=autor.asc,criado_em.desc`, ...)
```

### Paginação

```javascript
// Pegar 10 primeiros registros
fetch(`${SUPABASE_URL}/rest/v1/recadinhos?limit=10`, ...)

// Pular 10 registros
fetch(`${SUPABASE_URL}/rest/v1/recadinhos?offset=10`, ...)

// Paginação: página 2 com 10 itens por página
fetch(`${SUPABASE_URL}/rest/v1/recadinhos?limit=10&offset=10`, ...)
```

## 📚 Documentação Oficial

Para mais informações sobre a API REST do Supabase, consulte:
- [Supabase REST API Docs](https://supabase.com/docs/guides/api)
- [PostgREST Documentation](https://postgrest.org/en/stable/)

---

**Dica**: Use as classes JavaScript fornecidas em `script.js` para simplificar o uso da API!
