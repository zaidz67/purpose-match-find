import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, userId } = await req.json();
    console.log('AI Match request:', { query, userId });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch all searchable profiles with their data
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        *,
        ikigai_responses(*),
        skills(*),
        portfolio_items(*)
      `)
      .eq('is_searchable', true)
      .neq('id', userId);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    console.log(`Found ${profiles?.length || 0} searchable profiles`);

    // Format profiles for AI analysis
    const profilesContext = profiles?.map(p => ({
      id: p.id,
      name: p.full_name,
      bio: p.bio,
      location: p.location,
      intent: p.current_intent,
      availability: p.availability,
      background: p.professional_background,
      ikigai: p.ikigai_responses?.[0] || {},
      skills: p.skills?.map((s: any) => `${s.skill_name} (${s.proficiency})`).join(', '),
      portfolio_count: p.portfolio_items?.length || 0
    })) || [];

    // Use Lovable AI to analyze matches
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an intelligent matching assistant for a professional networking platform based on Ikigai philosophy. 
            Analyze user profiles and match them based on:
            - Skills and expertise alignment
            - Ikigai responses (what they love, what they're good at, what world needs, what they can be paid for)
            - Professional background and intent
            - Career aspirations and purpose
            
            Return a JSON array of matches with scores (0-100) and explanations. Each match should have:
            - profile_id: the profile ID
            - score: match score 0-100
            - explanation: 2-3 sentences explaining why they match
            - top_attributes: array of 3 key matching points
            
            Sort by score descending. Only include matches with score >= 50.`
          },
          {
            role: "user",
            content: `Search query: "${query}"\n\nAvailable profiles:\n${JSON.stringify(profilesContext, null, 2)}`
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = JSON.parse(aiData.choices[0].message.content);
    console.log('AI analysis complete:', aiContent);

    // Enrich matches with full profile data
    const matches = aiContent.matches?.map((match: any) => {
      const profile = profiles?.find(p => p.id === match.profile_id);
      return {
        ...match,
        profile: {
          id: profile?.id,
          full_name: profile?.full_name,
          avatar_url: profile?.avatar_url,
          bio: profile?.bio,
          location: profile?.location,
          current_intent: profile?.current_intent,
          availability: profile?.availability,
          skills: profile?.skills?.slice(0, 3)
        }
      };
    }) || [];

    return new Response(
      JSON.stringify({ matches }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-match function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
