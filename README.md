# Vision API Frontend

Frontend Angular para análise de imagens usando a Google Vision API.

![Sistema Vision API Frontend](src/assets/image.png)

## 📸 Screenshot do Sistema

## 🚀 Funcionalidades

- **Upload de Imagens**: Suporte para JPG, PNG, GIF e BMP
- **📷 Captura por Câmera**: Tire fotos diretamente do app
- **🔄 Câmera Dupla**: Alternância entre câmera frontal e traseira
- **📱 PWA (Progressive Web App)**: Instale o app no seu dispositivo
- **🌐 Funcionamento Offline**: Cache inteligente para uso sem internet
- **🔔 Notificações Push**: Receba alertas de status e atualizações
- **11 Tipos de Detecção**:
  - Detecção de Rosto (emoções, pose, qualidade)
  - Detecção de Lugares Famosos
  - Detecção de Logos
  - Rótulos Gerais
  - Detecção de Texto (OCR)
  - Texto de Documentos
  - Análise de Segurança
  - Propriedades da Imagem
  - Localização de Objetos
  - Sugestões de Recorte
  - Detecção Web

## 🛠️ Tecnologias

- **Angular 20** com standalone components
- **TypeScript** com tipagem estrita
- **Google Vision API** para análise de imagens
- **CSS Variables** para design system
- **Responsive Design** mobile-first
- **📱 PWA Support** com service worker
- **📷 MediaDevices API** para acesso à câmera
- **🔧 Service Worker** para cache offline

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Google Cloud Platform account
- Vision API habilitada
- API Key válida

## 🔧 Instalação

1. **Clone o repositório**:
```bash
git clone <repository-url>
cd vision-api-frontend
```

2. **Instale as dependências**:
```bash
npm install
```

3. **Configure as variáveis de ambiente**:
   - Copie `src/environments/environment.ts` para `src/environments/environment.prod.ts`
   - Atualize a API key em ambos os arquivos

4. **Execute o projeto**:
```bash
npm start
```

## ⚙️ Configuração

### Variáveis de Ambiente

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'https://vision.googleapis.com/v1/images:annotate',
  apiKey: 'SUA_API_KEY_AQUI'
};
```

### Google Cloud Vision API

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um projeto ou selecione um existente
3. Habilite a Vision API
4. Crie uma API Key
5. Configure restrições de segurança (recomendado)

## 🚀 Uso

### 📱 Como PWA
1. **Acesse a aplicação** em `http://localhost:4200`
2. **Clique em "Instalar"** na barra lateral para instalar o app
3. **Use o app** como um aplicativo nativo do seu dispositivo

### 📷 Captura por Câmera
1. **Clique em "Usar Câmera"** para ativar a câmera
2. **Posicione o objeto** na tela da câmera
3. **Clique no botão de captura** (📸) para tirar a foto
4. **Use os controles** para alternar entre câmeras ou fechar

### 🖼️ Upload de Arquivo
1. **Faça upload de uma imagem** clicando na área de upload
2. **Selecione os tipos de detecção** desejados
3. **Clique em "Analisar Imagem"**
4. **Visualize os resultados** organizados por categoria


## 📱 Responsividade e PWA

- **Mobile-first** design
- **Sidebar colapsável** em telas pequenas
- **Grid adaptativo** para diferentes tamanhos de tela
- **Touch-friendly** para dispositivos móveis
- **📱 Instalação PWA** em dispositivos móveis e desktop
- **🌐 Funcionamento offline** com cache inteligente
- **🔔 Notificações push** para atualizações e status
- **📷 Acesso à câmera** nativo do dispositivo

## 🔒 Segurança

- **Validação de arquivos** (tipo e tamanho)
- **API Key** em variáveis de ambiente
- **Tratamento de erros** robusto
- **Validação de entrada** em todos os campos

## 🧪 Testes

```bash
# Executar testes unitários
npm test

# Executar testes com coverage
npm run test:coverage
```

## 📦 Build

```bash
# Build de desenvolvimento
npm run build

# Build de produção
npm run build -- --configuration production
```

## 🐛 Troubleshooting

### Erro de API Key
- Verifique se a API Key está configurada corretamente
- Confirme se a Vision API está habilitada
- Verifique as restrições de segurança da API Key

### Erro de CORS
- A API do Google não tem problemas de CORS
- Verifique se a URL da API está correta

### Arquivo muito grande
- Limite máximo: 10MB
- Use compressão de imagem se necessário

## 📄 Licença

Este projeto está sob a licença MIT.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Consulte a [documentação da Google Vision API](https://cloud.google.com/vision/docs)
