import { useState } from "react";
import { AuthProvider } from "./lib/auth-context";
import { ProtectedRoute } from "./components/protected-route";
import { FormsList } from "./components/forms-list";
import { MarketingRequestForm } from "./components/marketing-request-form";
import type { FormDefinition } from "./lib/forms";

function App() {
  const [selectedForm, setSelectedForm] = useState<FormDefinition | null>(null);

  const handleSelectForm = (form: FormDefinition) => {
    setSelectedForm(form);
  };

  const handleBackToForms = () => {
    setSelectedForm(null);
  };

  const renderForm = () => {
    if (!selectedForm) return null;
    
    // Route to specific form components
    switch (selectedForm.id) {
      case "marketing-request":
        return <MarketingRequestForm onBack={handleBackToForms} />;
      default:
        return <div>Form not found</div>;
    }
  };

  return (
    <AuthProvider>
      <ProtectedRoute>
        {selectedForm ? (
          renderForm()
        ) : (
          <FormsList onSelectForm={handleSelectForm} />
        )}
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
