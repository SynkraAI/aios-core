<!--
  Traducción: ES
  Original: /docs/en/installation/macos.md
  Última sincronización: 2026-01-26
-->

# Guía de Instalación de Synkra AIOS para macOS

> 🌐 [EN](../../installation/macos.md) | [PT](../../pt/installation/macos.md) | **ES**

---

## Requisitos Previos

### 1. Node.js (v20 o superior)

Instale Node.js usando uno de estos métodos:

**Opción A: Usando Homebrew (Recomendado)**

```bash
# Instalar Homebrew si aún no está instalado
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Node.js
brew install node
```

**Opción B: Usando el instalador oficial**
Descargue desde [nodejs.org](https://nodejs.org/)

**Opción C: Usando Node Version Manager (nvm)**

```bash
# Instalar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Instalar Node.js
nvm install 20
nvm use 20
```

### 2. GitHub CLI

Instale GitHub CLI para colaboración en equipo:

**Usando Homebrew (Recomendado)**

```bash
brew install gh
```

**Usando MacPorts**

```bash
sudo port install gh
```

**Usando el instalador oficial**
Descargue desde [cli.github.com](https://cli.github.com/)

## Instalación

### Instalación Rápida

1. Abra Terminal
2. Navegue a su directorio de proyecto:

   ```bash
   cd ~/path/to/your/project
   ```

3. Ejecute el instalador:
   ```bash
   npx github:SynkraAI/aios-core install
   ```

### Qué Hace el Instalador

El instalador automáticamente:

- Detecta macOS y aplica configuraciones específicas de la plataforma
- Crea los directorios necesarios con los permisos adecuados
- Configura las rutas del IDE para ubicaciones de macOS:
  - Cursor: `~/Library/Application Support/Cursor/`
  - Claude: `~/.claude/`
- Configura scripts de shell con terminaciones de línea Unix
- Maneja sistemas de archivos sensibles a mayúsculas correctamente

## Configuración Específica por IDE

### Cursor

1. Las reglas del IDE se instalan en `.cursor/rules/`
2. Atajo de teclado: `Cmd+L` para abrir el chat
3. Use `@agent-name` para activar agentes

### Claude Code

1. Los comandos se instalan en `.claude/commands/AIOS/`
2. Use `/agent-name` para activar agentes


2. Use `@agent-name` para activar agentes

## Solución de Problemas

### Problemas de Permisos

Si encuentra errores de permisos:

```bash
# Corregir permisos de npm
sudo chown -R $(whoami) ~/.npm

# Corregir permisos del proyecto
sudo chown -R $(whoami) .aios-core
```

### Autenticación de GitHub CLI

Después de instalar GitHub CLI:

```bash
# Autenticarse con GitHub
gh auth login

# Elija el método de autenticación (navegador web recomendado)
```

### Problemas de Rutas

Si los comandos no se encuentran:

```bash
# Agregar a ~/.zshrc o ~/.bash_profile
export PATH="/usr/local/bin:$PATH"

# Recargar la configuración del shell
source ~/.zshrc  # o source ~/.bash_profile
```

### Sensibilidad a Mayúsculas

Los sistemas de archivos de macOS pueden ser insensibles a mayúsculas por defecto. Si experimenta problemas:

1. Verifique su sistema de archivos:

   ```bash
   diskutil info / | grep "File System"
   ```

2. Synkra AIOS maneja automáticamente tanto sistemas de archivos sensibles como insensibles a mayúsculas

## Actualización

Para actualizar una instalación existente:

```bash
npx github:SynkraAI/aios-core install
```

El actualizador:

- Detectará su instalación existente
- Hará una copia de seguridad de cualquier personalización
- Actualizará solo los archivos modificados
- Preservará sus configuraciones

## Próximos Pasos

1. Configure su IDE (vea la configuración específica por IDE arriba)
2. Ejecute `*help` en su agente de IA para ver los comandos disponibles
3. Comience con la [Guía del Usuario](../../guides/user-guide.md)
4. Únase a nuestra [Comunidad de Discord](https://discord.gg/gk8jAdXWmj) para obtener ayuda

## Requisitos del Sistema

- macOS 10.15 (Catalina) o posterior
- 4GB de RAM mínimo (8GB recomendado)
- 500MB de espacio libre en disco
- Conexión a internet para paquetes npm

## Recursos Adicionales

- [README Principal](../../README.md)
- [Guía del Usuario](../../guides/user-guide.md)
- [Guía de Solución de Problemas](../../troubleshooting.md)
- [Comunidad de Discord](https://discord.gg/gk8jAdXWmj)
