# 📱 Guia de Instalação PWA - Vision API Frontend

## O que é PWA?

PWA (Progressive Web App) é uma tecnologia que permite que aplicações web funcionem como aplicativos nativos, oferecendo:

- ✅ **Instalação** no dispositivo
- 🌐 **Funcionamento offline**
- 🔔 **Notificações push**
- 📱 **Experiência nativa**

## 🚀 Como Instalar

### 📱 Dispositivos Móveis

#### Android (Chrome)
1. Abra o app no Chrome
2. Toque no menu (⋮) no canto superior direito
3. Selecione "Adicionar à tela inicial"
4. Confirme a instalação
5. O app aparecerá na tela inicial

#### iOS (Safari)
1. Abra o app no Safari
2. Toque no botão de compartilhar (📤)
3. Selecione "Adicionar à Tela de Início"
4. Confirme a instalação
5. O app aparecerá na tela inicial

### 💻 Desktop

#### Chrome/Edge
1. Abra o app no navegador
2. Clique no ícone de instalação (📱) na barra de endereços
3. Clique em "Instalar"
4. O app será instalado como aplicativo

#### Firefox
1. Abra o app no Firefox
2. Clique no ícone de instalação na barra de endereços
3. Clique em "Instalar"
4. O app será instalado como aplicativo

## 🔧 Funcionalidades PWA

### 📷 Câmera
- **Acesso nativo** à câmera do dispositivo
- **Alternância** entre câmera frontal e traseira
- **Captura de fotos** para análise

### 🌐 Offline
- **Cache inteligente** de recursos
- **Funcionamento** sem internet
- **Sincronização** quando online

### 🔔 Notificações
- **Status de conexão** (online/offline)
- **Atualizações** do app
- **Alertas** de sistema

## 🛠️ Desenvolvimento

### Service Worker
- **Registro automático** no main.ts
- **Cache estratégico** para performance
- **Atualizações** automáticas

### Manifest
- **Configuração PWA** completa
- **Ícones** em múltiplos tamanhos
- **Tema** e cores personalizadas

### Câmera
- **MediaDevices API** para acesso à câmera
- **Controles nativos** de captura
- **Tratamento de erros** robusto

## 📋 Verificação de Instalação

### Status PWA
- ✅ **Instalado**: App funcionando como PWA
- 📱 **Instalar**: Botão disponível para instalação
- 🌐 **Online/Offline**: Status de conexão visível

### Funcionalidades
- 📷 **Câmera**: Acesso à câmera do dispositivo
- 🔄 **Cache**: Recursos carregados offline
- 🔔 **Notificações**: Sistema de alertas ativo

## 🐛 Troubleshooting

### Câmera não funciona
- Verifique **permissões** do navegador
- Confirme se o **HTTPS** está ativo
- Teste em **dispositivo físico** (não emulador)

### PWA não instala
- Verifique se o **service worker** está registrado
- Confirme se o **manifest.json** está acessível
- Teste em **navegador compatível** (Chrome, Edge, Firefox)

### Cache não funciona
- Verifique se o **service worker** está ativo
- Confirme se os **assets** estão sendo servidos
- Teste o **modo offline** do DevTools

## 🔗 Recursos Úteis

- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev - PWA](https://web.dev/progressive-web-apps/)
- [Chrome DevTools - PWA](https://developer.chrome.com/docs/devtools/progressive-web-apps/)

## 📞 Suporte

Para problemas com PWA ou câmera:
- Abra uma issue no GitHub
- Consulte os logs do console
- Teste em diferentes dispositivos/navegadores
