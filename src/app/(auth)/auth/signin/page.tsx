import { SignInForm } from "@/modules/auth-page";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-linear-to-br from-background to-muted">
      <SignInForm />
    </div>
  );
}
