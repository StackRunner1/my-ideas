import { useAppSelector } from "@/store/hooks";

export default function Dashboard() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Total Ideas</h3>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">In Progress</h3>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Completed</h3>
            <p className="text-3xl font-bold">0</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-8">
          Welcome! You are{" "}
          {isAuthenticated ? "authenticated" : "not authenticated"}.
        </p>
      </div>
    </div>
  );
}
