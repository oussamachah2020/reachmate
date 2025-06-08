import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signUpUser } from "@/loaders/auth";
import { toast } from "sonner";
import SignUpPage from "@/app/(auth)/sign-up/page";
import { Gender } from "@prisma/client";

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
  it("submits the form with valid data", async () => {
    const mockSignUpUser = signUpUser as jest.Mock;

    render(<SignUpPage />);

    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const genderSelectTrigger = screen.getByLabelText(/gender/i);

    const termsCheckbox = screen.getByLabelText(/i agree to the/i);
    const submitButton = screen.getByRole("button", {
      name: /create account/i,
    });

    await userEvent.type(firstNameInput, "John");
    await userEvent.type(lastNameInput, "Doe");
    await userEvent.type(emailInput, "john.doe@example.com");
    await userEvent.type(passwordInput, "Test@1234");

    await userEvent.click(genderSelectTrigger);
    const maleOption = screen.getByText("Male");
    fireEvent.change(screen.getByLabelText(/gender/i), {
      target: { value: Gender.MALE },
    });

    await userEvent.click(termsCheckbox);

    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignUpUser).toHaveBeenCalledWith({
        email: "john.doe@example.com",
        password: "test@1234",
        firstName: "John",
        lastName: "Doe",
        gender: Gender.MALE,
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
      expect(screen.getByText(/gender is required/i)).toBeInTheDocument();
      expect(screen.getByText(/terms of service/i)).toBeInTheDocument();
    });
  });
});
