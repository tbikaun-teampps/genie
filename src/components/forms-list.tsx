import { useAuth } from "@/lib/auth-context";
import { allForms } from "@/forms";
import type { FormDefinition } from "@/types/forms";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogOut, Wand } from "lucide-react";

interface FormsListProps {
  onSelectForm: (form: FormDefinition) => void;
}

export function FormsList({ onSelectForm }: FormsListProps) {
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <div className="flex items-center gap-1">
                <Wand className="h-4 w-4" />
                <h1 className="text-xl font-semibold text-gray-900">Genie</h1>
              </div>
              <p className="text-sm text-gray-600">Welcome, {user?.email}</p>
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Available Forms
          </h2>
          <p className="text-gray-600">Select a form to fill out below.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {allForms.map((form) => (
            <Card
              key={form.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onSelectForm(form)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{form.title}</CardTitle>
                <CardDescription>{form.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">
                  {form.id === "marketing-request" ? "10 fields" : `${form.fields.length} field${form.fields.length !== 1 ? "s" : ""}`}
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={() => onSelectForm(form)}
                >
                  Fill Out Form
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
