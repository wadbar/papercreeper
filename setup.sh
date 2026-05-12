#!/bin/bash

# PaperCreeper Auto-Installer & Optimizer
echo "💎 Iniciando Setup do PaperCreeper AI..."

# 1. Preparar o sistema (Removido sudo para não pedir senha)
echo "📦 Atualizando dependências do sistema..."
if ! command -v git &> /dev/null; then
    echo "⚠️ Git não instalado. Instale o Git manualmente se precisar de atualizações."
fi

if command -v pip &> /dev/null; then
    pip install distro --quiet
fi

# 2. Preparar variáveis de ambiente
if [ ! -f ".env" ]; then
    echo "📝 Preparando ambiente (.env)..."
    if [ ! -z "$GEMINI_API_KEY" ]; then
        echo "VITE_GEMINI_API_KEY=$GEMINI_API_KEY" > .env
        echo "GEMINI_API_KEY=$GEMINI_API_KEY" >> .env
        echo "✅ Configuração automática via variável de sistema concluída!"
    elif [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Arquivo .env criado a partir do exemplo. Edite-o se necessário."
    else
        echo "VITE_GEMINI_API_KEY=" > .env
        echo "GEMINI_API_KEY=" >> .env
        echo "📝 Arquivo .env vazio criado."
    fi
else
    echo "ℹ️ Arquivo .env já existe, pulando criação."
fi

# 3. Instalar dependências do Node
echo "📦 Verificando dependências..."

# 4. Verificar Java (JRE 17+ é necessário para Minecraft moderno)
if [ ! -d "bin/java_runtime" ] && ! command -v java &> /dev/null; then
    echo "☕ Java não encontrado. Baixando JRE 21 otimizado..."
    mkdir -p bin/java_runtime
    curl -L "https://github.com/adoptium/temurin21-binaries/releases/download/jdk-21.0.6%2B7/OpenJDK21U-jre_x64_linux_hotspot_21.0.6_7.tar.gz" -o jre.tar.gz
    tar -xzf jre.tar.gz -C bin/java_runtime --strip-components=1
    rm jre.tar.gz
    echo "✅ Java instalado localmente em ./bin/java_runtime"
else
    echo "✅ Ambiente Java pronto."
fi

echo "🚀 Setup concluído! Use 'npm run dev' para iniciar."

# 5. Configurar aliases (staper e stoper)
BASHRC="$HOME/.bashrc"
if [ -f "$BASHRC" ]; then
    echo "⚙️ Configurando atalhos 'staper' e 'stoper' no .bashrc..."
    # Remove old aliases if exist
    sed -i '/alias staper/d' "$BASHRC"
    sed -i '/alias stoper/d' "$BASHRC"
    
    # Grava o diretório real e absoluto no alias para evitar bugs com * ou ~
    CURRENT_DIR=$(pwd)
    echo "alias staper='cd \"$CURRENT_DIR\" && npm run dev'" >> "$BASHRC"
    echo "alias stoper='pkill -f \"tsx server.ts\"'" >> "$BASHRC"
    
    echo "✅ Atalhos configurados!"
    echo ""
    echo "⚠️ IMPORTANTE: Para ativar os atalhos AGORA, digite:"
    echo "👉 source ~/.bashrc"
    echo ""
    echo "✨ Depois de ativado, você poderá usar de qualquer lugar:"
    echo "  - staper: Abre a pasta e inicia o painel"
    echo "  - stoper: Para o painel rodando em segundo plano"
fi
