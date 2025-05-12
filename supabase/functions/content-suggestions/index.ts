import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.1.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { platform, kpi, topic } = await req.json();

    // Initialize OpenAI-compatible model
    const model = new Supabase.ai.Session('gte-small');

    // Generate trend suggestions
    const trendPrompt = `Generate 5 trending topics for ${platform} content related to ${topic} that would help achieve ${kpi} KPI. Format as JSON array.`;
    const trends = await model.run(trendPrompt);

    // Generate caption suggestions
    const captionPrompt = `Write 3 engaging captions for ${platform} about ${topic} optimized for ${kpi}. Include relevant hashtags. Format as JSON array.`;
    const captions = await model.run(captionPrompt);

    // Generate content strategy
    const strategyPrompt = `Provide content strategy recommendations for ${platform} to achieve ${kpi} in the ${topic} niche. Include posting frequency, best times, and content types. Format as JSON object.`;
    const strategy = await model.run(strategyPrompt);

    return new Response(
      JSON.stringify({
        trends: JSON.parse(trends),
        captions: JSON.parse(captions),
        strategy: JSON.parse(strategy)
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});