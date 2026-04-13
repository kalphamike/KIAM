import { Link } from "react-router-dom";

export default function AdminLoginButton() {
  return (
    <div className="mt-4 flex justify-center">
      <Link
        to="/admin"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Admin Login
      </Link>
    </div>
  );
}
