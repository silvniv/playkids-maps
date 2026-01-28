# PlayKids.Maps (MVP)

App Expo + React Native + Supabase para encontrar e avaliar locais infantis em Campo Grande, MS.

## 1) Requisitos
- Node 20.19+ (conforme package.json)
- Expo CLI (via `npx expo`)
- Conta no Supabase

## 2) Configurar Supabase
1. Crie um projeto no Supabase
2. No SQL Editor, rode: `supabase/schema.sql`
3. Pegue `Project URL` e `anon key` em Settings > API

## 3) Configurar variáveis
Copie `.env.example` para `.env` e preencha:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Depois, recarregue o Expo Go por completo (ou rode `npx expo start --clear` se necessário).

## 4) Rodar o app

```bash
cd playkids-maps
npm install
npx expo start
```

Abra no Android/iOS (Expo Go) ou emulador.

## Observações
- Auth: para criar lugares/reviews/favorites/reports você precisa estar autenticado no Supabase.
  Para MVP rápido, habilite Email/OTP no Supabase e implemente tela de login na próxima iteração.

## 5) Modo offline com SQLite (fallback sem Supabase)

Este projeto agora suporta um modo offline para demonstração/onboarding,
usando um banco local SQLite como referência quando as variáveis do Supabase
não estiverem configuradas.

**Como funciona**

- Se `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` **não** estiverem definidos
  no `.env`, o app entra em **modo offline**.
- Em modo offline:
  - A lista de locais (places) vem do banco `offline.db` (SQLite) com alguns registros de exemplo.
  - Favoritos são salvos localmente no dispositivo (AsyncStorage) e vinculados aos locais do SQLite.
  - Avaliações (reviews) e relatos de problema (reports) ficam desativados (será exibido erro se tentar usar).

**Dependência**

Certifique-se de instalar o pacote do SQLite:

```bash
npx expo install expo-sqlite
```

(O `package.json` já inclui `expo-sqlite`, mas o `expo install` garante a versão compatível.)

**Rodando em modo offline**

1. Não preencha as variáveis de Supabase no `.env` (ou remova-as).
2. Instale dependências normalmente:

   ```bash
   npm install
   npx expo install expo-sqlite
   ```

3. Inicie o app:

   ```bash
   npx expo start
   ```

4. O app irá:
   - Criar (se necessário) o arquivo `offline.db`.
   - Criar a tabela `places` e popular com alguns locais de exemplo.
   - Utilizar esse banco como fonte de dados para mapa/lista de locais.

Para voltar ao modo online, basta configurar `EXPO_PUBLIC_SUPABASE_URL`
e `EXPO_PUBLIC_SUPABASE_ANON_KEY` no `.env` e reiniciar o app.
