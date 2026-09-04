import { NextResponse } from 'next/server';

const AI_MODELS = [
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
  "nvidia/nemotron-3.5-lightning:free",
  "z-ai/glm-5.2:free",
  "liquid/lfm-2.5-2.6b:free"
];

export async function POST(req) {
  try {
    const { messages, country, category, platform, audience_age } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Message vide." }, { status: 400 });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: "Clé API manquante" }, { status: 500 });
    }

    // 🔥 Zeno's New Cool Personality (System Prompt)
    const systemPrompt = {
      role: "system",
      content: `Tu es Zeno, le co-pilote IA de la plateforme Crono. Tu as une personnalité super cool, amicale, directe et très intelligente (un peu comme un pote expert en tech et réseaux sociaux). 
      Tu n'es pas un robot ennuyeux. Tu parles en français de manière naturelle, motivante et décontractée, mais tu restes très professionnel dans tes conseils.
      L'utilisateur veut faire exploser ses vues sur ${platform || 'les réseaux sociaux'}.
      Son audience cible : ${country || 'Maroc'} (${audience_age || '18-34'} ans), Catégorie : ${category || 'Lifestyle'}.
      Réponds à ses messages comme un vrai assistant conversationnel. Donne-lui des idées de génie, des légendes virales et des hashtags percutants.`
    };

    // Pura chat history AI ko bhejo taaki wo pichli baatein yaad rakhe
    const apiMessages = [systemPrompt, ...messages];

    let aiText = null;
    let successfulModel = null;
    let lastError = null;

    for (const model of AI_MODELS) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Crono SaaS"
          },
          body: JSON.stringify({
            model: model,
            messages: apiMessages
          })
        });

        const data = await response.json();

        if (!response.ok) {
          lastError = data.error?.message || "Erreur API";
          continue;
        }

        if (!data.choices || !data.choices[0]?.message?.content) {
          continue; 
        }

        aiText = data.choices[0].message.content;
        successfulModel = model;
        break; 

      } catch (err) {
        console.error(`⚠️ Failed ${model}:`, err.message);
      }
    }

    if (!aiText) {
      return NextResponse.json({ error: lastError || "Tous les modèles sont occupés." }, { status: 500 });
    }

    console.log(`✅ Zeno a répondu via: ${successfulModel}`);
    return NextResponse.json({ text: aiText });

  } catch (error) {
    console.error("❌ Serveur Erreur:", error);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}