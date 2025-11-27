export default function About() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About MyIdeas</h1>
        <div className="prose prose-slate max-w-none">
          <p className="text-lg mb-4">
            MyIdeas is a learning platform demonstrating modern authentication
            patterns with Supabase, React, and TypeScript.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Features</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Secure authentication with httpOnly cookies</li>
            <li>Automatic token refresh</li>
            <li>Protected routes and layouts</li>
            <li>Type-safe routing with path constants</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
