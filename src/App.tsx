import { useState } from "react";
import { AuthProvider } from "./lib/auth-context";
import { ProtectedRoute } from "./components/protected-route";
import { FormsList } from "./components/forms-list";
import { DynamicForm } from "./components/dynamic-form";
import type { FormDefinition } from "./lib/forms";

function App() {
  const [selectedForm, setSelectedForm] = useState<FormDefinition | null>(null);

  const handleSelectForm = (form: FormDefinition) => {
    setSelectedForm(form);
  };

  const handleBackToForms = () => {
    setSelectedForm(null);
  };

  return (
    <AuthProvider>
      <ProtectedRoute>
        {selectedForm ? (
          <DynamicForm form={selectedForm} onBack={handleBackToForms} />
        ) : (
          <FormsList onSelectForm={handleSelectForm} />
        )}
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
