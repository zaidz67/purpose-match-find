import { useSearchParams } from "react-router-dom";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold">Search Results</h1>
        <p className="text-muted-foreground mt-2">
          Searching for: "{query}"
        </p>
      </div>
    </div>
  );
};

export default Search;