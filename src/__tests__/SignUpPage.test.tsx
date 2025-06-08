import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signUpUser } from "@/loaders/auth";
import { toast } from "sonner";
import SignUpPage from "@/app/(auth)/sign-up/page";

jest.mock("@/loaders/auth", () => ({
  signUpUser: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("SignUpPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("submits the form with valid data", async () => {
    (signUpUser as jest.Mock).mockResolvedValue({ success: true });
    const user = userEvent.setup();

    render(<SignUpPage />);

    await user.type(screen.getByLabelText(/first name/i), "John");
    await user.type(screen.getByLabelText(/last name/i), "Doe");
    await user.type(
      screen.getByLabelText(/email address/i),
      "john.doe@example.com"
    );
    await user.type(screen.getByLabelText(/password/i), "Test@1234");

    const termsCheckbox = screen.getByRole("checkbox");
    await user.click(termsCheckbox);

    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(signUpUser).toHaveBeenCalledWith({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "Test@1234",
      });
      expect(toast.success).toHaveBeenCalledWith(
        "Account created successfully !"
      );
    });
  });

  it("shows validation messages on invalid form", async () => {
    render(<SignUpPage />);
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/terms of service/i)).toBeInTheDocument();
    });
  });
});
