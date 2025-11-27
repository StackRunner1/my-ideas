export default function Ideas() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold">My Ideas</h1>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            New Idea
          </button>
        </div>
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          <p>No ideas yet. Click "New Idea" to get started!</p>
        </div>
      </div>
    </div>
  );
}
