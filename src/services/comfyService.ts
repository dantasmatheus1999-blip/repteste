import { GoogleGenAI } from "@google/genai";

const COMFY_ENDPOINT = '/api/comfy-proxy';

// Inicialização do Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const ComfyService = {
  /**
   * Traduz e enriquece uma descrição em português para um prompt em inglês otimizado para RPG.
   */
  async translateAndEnrichPrompt(description: string): Promise<string> {
    try {
      const systemPrompt = `
        Você é um especialista em RPG de fantasia e engenharia de prompts para IA de geração de imagem.
        Sua tarefa é transformar uma descrição de personagem em português em um prompt em inglês limpo e padronizado.
        
        Regras:
        1. Use apenas palavras-chave claras separadas por vírgula.
        2. Mantenha um estilo "fantasy RPG character" consistente.
        3. Evite frases longas, explicações ou introduções.
        4. PROIBIDO usar os termos: "masterpiece", "best quality", "8k", "hyper-detailed", "photorealistic", "intricate details", "sharp focus".
        5. Sempre inclua os termos: "fantasy RPG character", "full body", "cinematic lighting", "clean background".
        6. Foque em: raça, classe, vestimenta, equipamentos e pose.
        
        Exemplo: "dual-wielding warrior with two swords, fantasy RPG character, full body, cinematic lighting, clean background"
        
        Descrição em português: "${description}"
        Prompt em inglês:
      `;

      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: systemPrompt,
      });

      const enrichedPrompt = response.text?.trim() || "";
      
      console.log("Prompt original (PT):", description);
      console.log("Prompt enriquecido (EN):", enrichedPrompt);
      
      return enrichedPrompt;
    } catch (error) {
      console.error("Erro ao enriquecer prompt com Gemini:", error);
      // Fallback para um prompt básico e limpo se o Gemini falhar
      return `${description}, fantasy RPG character, full body, cinematic lighting, clean background`;
    }
  },

  /**
   * Busca a lista de LoRAs disponíveis no servidor ComfyUI.
   */
  async getLoras(): Promise<string[]> {
    try {
      const response = await fetch(`${COMFY_ENDPOINT}/object_info/LoraLoader`);
      if (!response.ok) return [];
      
      const data = await response.json();
      // O ComfyUI retorna a lista de loras no campo 'lora_name' do input
      const loraNames = data?.LoraLoader?.input?.required?.lora_name?.[0] || [];
      return loraNames;
    } catch (error) {
      console.error("Erro ao buscar LoRAs:", error);
      return [];
    }
  },

  async generateImage(
    promptText: string, 
    loraName?: string, 
    loraWeight: number = 1.0,
    onProgress?: (status: string) => void
  ): Promise<string> {
    // Workflow mínimo "coringa" - Padrão do ComfyUI
    const workflow: any = {
      "prompt": {
        "3": {
          "inputs": {
            "seed": Math.floor(Math.random() * 1000000),
            "steps": 20,
            "cfg": 8,
            "sampler_name": "euler",
            "scheduler": "normal",
            "denoise": 1,
            "model": loraName ? ["10", 0] : ["4", 0],
            "positive": ["6", 0],
            "negative": ["7", 0],
            "latent_image": ["5", 0]
          },
          "class_type": "KSampler"
        },
        "4": {
          "inputs": {
            "ckpt_name": "realisticFantasy_v10.safetensors"
          },
          "class_type": "CheckpointLoaderSimple"
        },
        "5": {
          "inputs": {
            "width": 512,
            "height": 512,
            "batch_size": 1
          },
          "class_type": "EmptyLatentImage"
        },
        "6": {
          "inputs": {
            "text": promptText,
            "clip": loraName ? ["10", 1] : ["4", 1]
          },
          "class_type": "CLIPTextEncode"
        },
        "7": {
          "inputs": {
            "text": "blurry, low quality, distorted, text, watermark",
            "clip": loraName ? ["10", 1] : ["4", 1]
          },
          "class_type": "CLIPTextEncode"
        },
        "8": {
          "inputs": {
            "samples": ["3", 0],
            "vae": ["4", 2]
          },
          "class_type": "VAEDecode"
        },
        "9": {
          "inputs": {
            "filename_prefix": "MythosNPC",
            "images": ["8", 0]
          },
          "class_type": "SaveImage"
        }
      }
    };

    // Injetar LoRA se fornecido
    if (loraName) {
      workflow.prompt["10"] = {
        "inputs": {
          "lora_name": loraName,
          "strength_model": loraWeight,
          "strength_clip": loraWeight,
          "model": ["4", 0],
          "clip": ["4", 1]
        },
        "class_type": "LoraLoader"
      };
    }

    try {
      console.log("Iniciando conexão com ComfyUI...");
      onProgress?.("Enviando prompt...");
      
      const payload = {
        "prompt": workflow.prompt,
        "client_id": "mythos_companion"
      };

      const response = await fetch(`${COMFY_ENDPOINT}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ComfyUI Error] Status: ${response.status}`, errorText);
        throw new Error(`Erro no servidor ComfyUI: ${response.status}`);
      }

      const data = await response.json();
      
      // Verificar erros de validação do ComfyUI (mesmo com status 200)
      if (data.error) {
        console.error("[ComfyUI API Error]", data.error);
        throw new Error(`Erro na API ComfyUI: ${data.error.message || 'Erro desconhecido'}`);
      }

      if (data.node_errors && Object.keys(data.node_errors).length > 0) {
        console.error("[ComfyUI Node Errors]", data.node_errors);
        const firstError = Object.values(data.node_errors)[0] as any;
        throw new Error(`Erro de validação no ComfyUI: ${firstError.errors?.[0]?.message || 'Verifique o workflow'}`);
      }

      const prompt_id = data.prompt_id;
      const initial_queue_number = data.number;
      console.log(`Prompt aceito! ID: ${prompt_id}. Posição na fila: ${initial_queue_number}. Aguardando processamento...`);
      onProgress?.(`Na fila (Posição: ${initial_queue_number})`);

      // Polling simplificado e persistente
      let attempts = 0;
      const maxAttempts = 400; // Aumentado para ~10 minutos (útil se a fila estiver grande)
      
      while (attempts < maxAttempts) {
        try {
          // Verificar status da fila global para dar feedback melhor
          if (attempts % 10 === 0) {
            const queueRes = await fetch(`${COMFY_ENDPOINT}/queue`);
            if (queueRes.ok) {
              const queueData = await queueRes.json();
              const pending = queueData.queue_pending || [];
              const running = queueData.queue_running || [];
              
              const pos = pending.findIndex((item: any) => item[1] === prompt_id);
              const isRunning = running.some((item: any) => item[1] === prompt_id);
              
              if (isRunning) {
                onProgress?.("Processando imagem...");
              } else if (pos !== -1) {
                onProgress?.(`Na fila (Posição: ${pos + 1})`);
              }
            }
          }

          const historyRes = await fetch(`${COMFY_ENDPOINT}/history/${prompt_id}`);
          if (historyRes.ok) {
            const history = await historyRes.json();

            if (history && history[prompt_id]) {
              const promptData = history[prompt_id];
              
              if (promptData.status && promptData.status.status_str === "error") {
                console.error("Erro na execução do ComfyUI:", promptData.status.messages);
                throw new Error("O ComfyUI encontrou um erro ao processar a imagem.");
              }

              onProgress?.("Finalizando...");
              console.log("Geração concluída no ComfyUI! Analisando resultados...");
              
              const outputs = promptData.outputs;
              if (outputs) {
                for (const nodeId in outputs) {
                  const nodeOutput = outputs[nodeId];
                  if (nodeOutput.images && nodeOutput.images.length > 0) {
                    const img = nodeOutput.images[0];
                    const finalUrl = `${COMFY_ENDPOINT}/view?filename=${encodeURIComponent(img.filename)}&subfolder=${encodeURIComponent(img.subfolder || '')}&type=${encodeURIComponent(img.type || 'output')}`;
                    return finalUrl;
                  }
                }
              }
              throw new Error("Geração concluída sem saída de imagem.");
            }
          }
        } catch (pollError) {
          if (pollError instanceof Error && pollError.message.includes("ComfyUI encontrou um erro")) {
            throw pollError;
          }
          console.error("[Polling Error]:", pollError);
        }

        await new Promise(r => setTimeout(r, 1500)); 
        attempts++;
      }

      throw new Error("O tempo de espera para a geração da imagem expirou devido à fila longa.");
    } catch (error) {
      console.error("Erro na integração ComfyUI:", error);
      throw error;
    }
  }
};
