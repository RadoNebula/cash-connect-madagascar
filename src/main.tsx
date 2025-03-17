
import { createRoot } from 'react-dom/client'
import { AuthProvider } from "./context/AuthContext";
import { TransactionProvider } from "./context/TransactionContext";
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <TransactionProvider>
      <App />
    </TransactionProvider>
  </AuthProvider>
);
