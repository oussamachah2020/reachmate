import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignInPage from "@/app/(auth)/sign-in/page";
import { toast } from "sonner";
import { signInUser } from "@/loaders/auth";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: jest.fn(),
  }),
}));

jest.mock("@/loaders/auth", () => ({
  signInUser: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("SignInPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the form inputs", () => {
    render(<SignInPage />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it("shows validation errors when fields are empty", async () => {
    render(<SignInPage />);

    // Get form elements
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.click(submitButton);

    await waitFor(
      () => {
        expect(screen.getByText("Email is required")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    await waitFor(
      () => {
        expect(screen.getByText("Password is required")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it("submits the form and calls the signInUser", async () => {
    (signInUser as jest.Mock).mockResolvedValue({ success: true });

    render(<SignInPage />);

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(signInUser).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });

      expect(toast.success).toHaveBeenCalledWith(
        "Welcome! Let's get you back on track."
      );
    });
  });

  it("shows error toast on failed response", async () => {
    (signInUser as jest.Mock).mockResolvedValue({
      success: false,
      data: "Invalid credentials",
    });

    render(<SignInPage />);

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
    });
  });

  it("shows generic error on signInUser throw", async () => {
    (signInUser as jest.Mock).mockRejectedValue(new Error("Network error"));

    render(<SignInPage />);

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong, try again !"
      );
    });
  });

  it("toggles password visibility", () => {
    render(<SignInPage />);

    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByRole("button", { name: "" });

    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");

    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("shows loading state during form submission", async () => {
    let resolvePromise: (value: any) => void;
    const controlledPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (signInUser as jest.Mock).mockReturnValue(controlledPromise);

    render(<SignInPage />);

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText("Signing in...")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();

    resolvePromise!({ success: true });

    await waitFor(() => {
      expect(screen.getByText("Sign in")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in/i })
      ).not.toBeDisabled();
    });
  });
});
