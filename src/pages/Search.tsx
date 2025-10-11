import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Loader2, Sparkles } from "lucide-react";
import { MatchCard } from "@/components/search/MatchCard";
import { useToast } from "@/hooks/use-toast";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Enter a search query",
        description: "Describe who you're looking for in natural language",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setSearchParams({ q: query });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to search",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('ai-match', {
        body: { query, userId: user.id }
      });

      if (error) throw error;

      setMatches(data.matches || []);
      
      if (data.matches?.length === 0) {
        toast({
          title: "No matches found",
          description: "Try adjusting your search criteria",
        });
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch();
    }
  }, []);

  const categorizedMatches = {
    perfect: matches.filter(m => m.score >= 90),
    strong: matches.filter(m => m.score >= 70 && m.score < 90),
    potential: matches.filter(m => m.score >= 50 && m.score < 70)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 p-8">
      <div className="container mx-auto max-w-6xl space-y-8">
        {/* Search Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-6 w-6" />
            <h1 className="text-3xl font-bold">AI-Powered Search</h1>
          </div>
          <p className="text-muted-foreground">
            Describe who you're looking for in natural language and let AI find the perfect matches
          </p>

          {/* Search Bar */}
          <div className="flex gap-2">
            <Input
              placeholder='e.g. "Find me a technical cofounder who loves sustainable tech and has backend experience"'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SearchIcon className="h-4 w-4" />
              )}
              <span className="ml-2">Search</span>
            </Button>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">AI is analyzing profiles...</p>
          </div>
        ) : matches.length > 0 ? (
          <div className="space-y-8">
            {/* Perfect Matches */}
            {categorizedMatches.perfect.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <span className="text-emerald-500">✨</span>
                  Perfect Matches ({categorizedMatches.perfect.length})
                </h2>
                <div className="space-y-4">
                  {categorizedMatches.perfect.map((match) => (
                    <MatchCard key={match.profile_id} match={match} />
                  ))}
                </div>
              </div>
            )}

            {/* Strong Matches */}
            {categorizedMatches.strong.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <span className="text-primary">⭐</span>
                  Strong Matches ({categorizedMatches.strong.length})
                </h2>
                <div className="space-y-4">
                  {categorizedMatches.strong.map((match) => (
                    <MatchCard key={match.profile_id} match={match} />
                  ))}
                </div>
              </div>
            )}

            {/* Potential Matches */}
            {categorizedMatches.potential.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <span className="text-accent">💡</span>
                  Potential Matches ({categorizedMatches.potential.length})
                </h2>
                <div className="space-y-4">
                  {categorizedMatches.potential.map((match) => (
                    <MatchCard key={match.profile_id} match={match} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : initialQuery ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-xl text-muted-foreground">No matches found for "{initialQuery}"</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Search;