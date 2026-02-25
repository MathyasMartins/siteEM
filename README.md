# 💕 Site Romântico - Nosso Amor

Um site romântico e responsivo criado em **HTML, CSS e JavaScript puro**, utilizando **Supabase** para gerenciamento de dados e **Cloudinary** para armazenamento de imagens. Perfeito para celebrar o amor de um casal com funcionalidades como slideshow de fotos, recadinhos, contadores de tempo e muito mais!

## ✨ Características Principais

- **📱 Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **🎨 Design Elegante**: Interface minimalista com tema claro/escuro
- **📸 Slideshow de Fotos**: Exibição automática de fotos com efeito fade
- **🖼️ Galeria Interativa**: Grid de fotos com lightbox em tela cheia
- **⏱️ Contadores de Tempo**: Mostra quanto tempo estão juntos, sem se ver e até o próximo encontro
- **💌 Recadinhos**: Mural de mensagens do casal com aprovação
- **🗓️ Agenda**: Datas especiais com mensagens personalizadas
- **🎁 Tela Surpresa**: Mensagem romântica com animações
- **🔐 Administração**: Painel completo para gerenciar todo o conteúdo
- **💾 Backup**: Exportar e importar dados em JSON
- **🌙 Modo Noturno**: Tema escuro para conforto visual
- **📱 PWA**: Funciona como aplicativo instalável no celular
- **🚀 Hospedagem Gratuita**: Compatível com GitHub Pages

## 📋 Requisitos

- Uma conta no **Supabase** (gratuita)
- Uma conta no **Cloudinary** (gratuita)
- Uma conta no **GitHub** (gratuita)
- Um navegador moderno (Chrome, Firefox, Safari, Edge)

## 🚀 Início Rápido

### 1. Configurar Supabase

1. Acesse [https://app.supabase.com](https://app.supabase.com) e crie um novo projeto
2. Vá para **SQL Editor** e execute o arquivo `SUPABASE_SCHEMA.sql`
3. Copie a **Project URL** e a **anon public key** em **Settings → API**

### 2. Configurar Cloudinary

1. Acesse [https://cloudinary.com](https://cloudinary.com) e crie uma conta
2. Vá para **Settings → Upload** e crie um novo **Upload Preset** com **Unsigned** ativado
3. Copie o **Cloud Name** e o **Upload Preset**

### 3. Configurar o Projeto

1. Abra o arquivo `script.js`
2. Procure pela seção **CONFIGURAÇÃO** (primeiras linhas)
3. Substitua os valores:
   ```javascript
   const SUPABASE_URL = 'https://seu-projeto.supabase.co';
   const SUPABASE_ANON_KEY = 'sua-chave-publica-aqui';
   const CLOUDINARY_CLOUD_NAME = 'seu-cloud-name';
   const CLOUDINARY_UPLOAD_PRESET = 'site-romantico-unsigned';
   ```

### 4. Publicar no GitHub Pages

1. Crie um repositório no GitHub chamado `site-romantico`
2. Envie todos os arquivos para o repositório
3. Vá para **Settings → Pages** e ative GitHub Pages
4. Acesse a URL gerada (ex: `https://seu-usuario.github.io/site-romantico`)

## 📂 Estrutura de Arquivos

```
site-romantico/
├── index.html              # Página principal
├── galeria.html            # Página de galeria
├── admin.html              # Painel de administração
├── surpresa.html           # Página de surpresa
├── style.css               # Estilos globais
├── script.js               # Lógica central (Supabase, Cloudinary, etc)
├── manifest.json           # Configuração PWA
├── sw.js                   # Service Worker para PWA
├── CONFIGURACAO.md         # Guia de configuração detalhado
├── SUPABASE_SCHEMA.sql     # Schema SQL do Supabase
├── README.md               # Este arquivo
└── pages/
    ├── index.js            # Lógica da página inicial
    ├── galeria.js          # Lógica da galeria
    ├── admin.js            # Lógica da administração
    └── surpresa.js         # Lógica da surpresa
```

## 🎯 Guia de Uso

### Página Inicial (index.html)

- **Contadores**: Exibem tempo juntos, tempo sem se ver e dias até o próximo encontro
- **Slideshow**: Fotos mudam automaticamente a cada 5 segundos
- **Recadinhos**: Mural com mensagens aprovadas
- **Formulário**: Deixe um recadinho que será enviado para aprovação

### Galeria (galeria.html)

- **Grid de Fotos**: Todas as fotos em um layout responsivo
- **Lightbox**: Clique em uma foto para visualizar em tela cheia
- **Navegação**: Use as setas ou teclado (← →) para navegar

### Administração (admin.html)

**Login**: Na primeira vez, defina uma senha. Depois, use para fazer login.

**Configurações**:
- Nome do casal
- Data de início do relacionamento
- Última vez que se viram
- Próximo encontro

**Fotos**:
- Upload de fotos para o Cloudinary
- Listagem e remoção de fotos

**Recadinhos**:
- Aprovar recadinhos pendentes
- Adicionar recadinhos próprios
- Deletar recadinhos

**Agenda**:
- Adicionar datas especiais
- Adicionar mensagens personalizadas
- Deletar eventos

**Backup**:
- Exportar todos os dados em JSON
- Importar dados de um backup anterior

### Página de Surpresa (surpresa.html)

- Exibe uma mensagem romântica personalizada
- Mostra mensagem especial se for uma data da agenda
- Animações com confete e corações flutuantes

## 🔐 Segurança

- **Senha de Admin**: Hash simples armazenado no localStorage (não é seguro para produção)
- **RLS (Row Level Security)**: Ativado no Supabase para proteger dados
- **Chave Pública**: A chave do Supabase é pública (conforme design)
- **CORS**: Supabase permite requisições do GitHub Pages por padrão

## 🌙 Tema Noturno

- Clique no ícone 🌙 no header para alternar entre tema claro e escuro
- A preferência é salva no localStorage
- Todos os componentes são responsivos ao tema

## 📱 PWA (Progressive Web App)

- Instale como aplicativo no seu celular
- Funciona offline (com cache de arquivos)
- Atalhos rápidos para Galeria e Admin

## 🛠️ Troubleshooting

### "CORS error" ao acessar Supabase

1. Vá para **Settings → API** no Supabase
2. Procure por **CORS** e adicione sua URL do GitHub Pages

### Fotos não aparecem

1. Verifique se as fotos foram enviadas para o Cloudinary
2. Confirme que a tabela `fotos` tem as URLs corretas
3. Abra o console (F12) e procure por erros

### Recadinhos não aparecem

1. Confirme que foram marcados como `aprovado = true`
2. Verifique as políticas de RLS

### Senha não funciona

1. Abra o console (F12)
2. Vá para **Application → Local Storage**
3. Delete `admin_password_hash`
4. Recarregue e defina uma nova senha

## 📞 Suporte

Se encontrar problemas:

1. Verifique o console do navegador (F12) para mensagens de erro
2. Verifique os logs do Supabase em **Logs → API Logs**
3. Consulte a documentação oficial:
   - [Supabase Docs](https://supabase.com/docs)
   - [Cloudinary Docs](https://cloudinary.com/documentation)
   - [GitHub Pages Docs](https://docs.github.com/en/pages)

## 📝 Licença

Este projeto é de código aberto e pode ser usado livremente para fins pessoais.

## 💝 Créditos

Feito com ❤️ para celebrar o amor.

---

**Aproveite seu site romântico! 💕**
