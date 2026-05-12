/// <reference types="vite/client" />

export const askAI = async (
  prompt: string, 
  context?: string, 
  serverId?: string,
  provider?: string,
  endpoint?: string,
  history?: any[],
  modelName?: string,
  apiKeys?: string[],
  options?: any,
  onChunk?: (text: string) => void
) => {
  try {
    if (onChunk) {
      const response = await fetch("/api/ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, context, serverId, provider, endpoint, history, modelName, apiKeys, options })
      });

      if (!response.ok) {
        throw new Error(`Erro no servidor: ${response.status}`);
      }

      if (!response.body) throw new Error("Sem body na resposta");
      
      const contentType = response.headers.get("content-type");
      let fullText = "";
      if (contentType && contentType.includes("application/json")) {
         const data = await response.json();
         if (data.error) {
            fullText = "❌ Erro: " + data.error;
            onChunk(fullText);
            return data;
         }
         fullText = data.text || "";
         onChunk(fullText);
         return data;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let buffer = "";
      
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
             if (line.trim().startsWith("data: ")) {
                const dataStr = line.trim().substring(6).trim();
                if (dataStr === "[DONE]") continue;
                try {
                   const data = JSON.parse(dataStr);
                   if (data.error) { const errText = typeof data.error === 'string' ? data.error : JSON.stringify(data.error); fullText += '\n❌ Erro: ' + errText; onChunk(fullText); break; }
                   const content = data.choices ? (data.choices[0].delta?.content || "") : "";
                   if (content) {
                      fullText += content;
                      onChunk(fullText);
                   }
                } catch(e) {}
             }
          }
        }
      }
      
      let call = null;

      const actionRegex = /\[ACTION:\s*({[\s\S]+?})\s*]/i;
      const actionMatch = fullText.match(actionRegex);
      if (actionMatch) {
         try {
            let jsonStr = actionMatch[1].trim();
            jsonStr = jsonStr.replace(/```json/gi, "").replace(/```/g, "").trim();
            call = JSON.parse(jsonStr);
            fullText = fullText.replace(actionMatch[0], "").trim();
         } catch(e) {}
      }

      if (!call) {
         const pesquisarMatch = fullText.match(/<call:PESQUISAR>(.*?)<\/call>/i);
         if (pesquisarMatch) {
            call = { name: "searchInternet", args: { query: pesquisarMatch[1].trim() } };
            fullText = fullText.replace(pesquisarMatch[0], "").trim();
         } else {
            const consultarMatch = fullText.match(/<call:CONSULTAR>(.*?)<\/call>/i);
            if (consultarMatch) {
               call = { name: "readMemory", args: { query: consultarMatch[1].trim() } };
               fullText = fullText.replace(consultarMatch[0], "").trim();
            } else {
               const genericCallMatch = fullText.match(/<call:([A-Za-z0-9_]+)>(.*?)<\/call>/s);
               if (genericCallMatch) {
                   call = { name: genericCallMatch[1].trim(), args: { command: genericCallMatch[2].trim() } };
                   fullText = fullText.replace(genericCallMatch[0], "").trim();
               }
            }
         }
      }
      
      return { text: fullText, call };
    }

    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, context, serverId, provider, endpoint, history, modelName, apiKeys, options })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ error: "Erro no servidor" }));
      throw new Error(errData.error || "Servidor de IA inacessível");
    }

    const result = await response.json();
    return { text: result.text, call: result.call };
  } catch (error: any) {
    console.error("AI Bridge Error:", error);
    return { 
      text: `Erro ao conectar com a IA: ${error.message}. 
             Dica: Certifique-se de que a Chave de API está configurada na aba de Configurações! 🔌` 
    };
  }
};
