import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">Project Initialized</h1>
      <p className="text-lg text-muted-foreground mb-8">
        This is a Next.js project with Tailwind CSS and shadcn/ui.
      </p>
      <Button>Click me</Button>
    </main>
  );
}
