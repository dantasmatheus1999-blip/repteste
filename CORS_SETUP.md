# Configuração de CORS para Firebase Storage

O upload de imagens do ComfyUI para o Firebase Storage está sendo bloqueado pelo navegador devido à política de CORS (Cross-Origin Resource Sharing).

Para corrigir isso, você deve aplicar a configuração de CORS no seu bucket do Firebase Storage.

## 1. Arquivo `cors.json`

Certifique-se de que o arquivo `cors.json` na raiz do projeto contenha o seguinte:

```json
[
  {
    "origin": [
      "https://ais-dev-br6k76cewsgtdl7c4lu2j7-136005633681.us-west1.run.app"
    ],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
    "maxAgeSeconds": 3600
  }
]
```

## 2. Aplicar a configuração

Abra o seu terminal (onde você tem o Google Cloud SDK instalado) e execute o seguinte comando:

```bash
gsutil cors set cors.json gs://gen-lang-client-0150741197.firebasestorage.app
```

## Por que isso é necessário?

O navegador bloqueia requisições de um domínio (o app) para outro (o storage do Google) a menos que o servidor de destino (o bucket) explicitamente autorize a origem do app. Sem essa configuração, o upload falha com o erro `net::ERR_FAILED` ou `blocked by CORS policy`.
