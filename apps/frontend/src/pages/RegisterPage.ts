import { authAPI } from "../api/auth";
import { BaseComponent } from "../components/BaseComponent";
import { Toast } from "../components/Toast";
import { navigateToView, ViewType } from "../utils/navigation";

export class RegisterPage extends BaseComponent {
  private isLoading = false;

  constructor() {
    super(
      "div",
      "min-h-screen bg-background flex items-center justify-center p-4"
    );
  }

  protected init(): void {
    this.renderPage();
    this.setupEventListeners();
  }

  private renderPage(): void {
    this.element.innerHTML = `
      <div class="w-full max-w-md mx-auto">
        <div class="text-center mb-8">
          <a href='/' class="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Pongenmoinsbien
          </a>
        </div>

        <div class="card">
          <div class="card-header text-center">
            <h2 class="card-title">
              Create Account
            </h2>
          </div>

          <div class="card-content">
            <form id="register-form" class="space-y-6">
              <div>
                <label for="email" class="label block mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  class="input"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label for="password" class="label block mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  minlength="6"
                  maxlength="24"
                  class="input"
                  placeholder="Create a secure password"
                />
              </div>

              <div>
                <label for="confirmPassword" class="label block mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  minlength="6"
                  maxlength="24"
                  class="input"
                  placeholder="Confirm your password"
                />
              </div>

              <div class="card bg-muted">
                <div class="card-content">
                  <h4 class="text-sm font-semibold text-foreground mb-3 flex flex-row">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock-icon lucide-lock size-4 mr-1 mt-px"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Password Requirements
                  </h4>
                  <ul class="text-sm text-muted-foreground space-y-2">
                    <li class="flex items-center">
                      At least 6 characters long
                    </li>
                    <li class="flex items-center">
                      Must match confirmation
                    </li>
                  </ul>
                </div>
              </div>

              <button
                type="submit"
                id="register-btn"
                class="btn btn-primary w-full font-bold text-lg ${
                  this.isLoading ? "opacity-50" : ""
                }"
                ${this.isLoading ? "disabled" : ""}
              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rocket-icon lucide-rocket size-4 mt-px mr-3"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
                ${this.isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          </div>

          <div class="card-footer">
            <div class="w-full">
              <div class="relative my-6">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-border"></div>
                </div>
                <div class="relative flex justify-center text-xs uppercase">
                  <span class="bg-background px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <div class="card bg-muted text-center">
                <div class="card-content">
                  <p class="text-muted-foreground mb-3">
                    Already have an account?
                  </p>
                  <button
                    id="login-link"
                    class="btn btn-secondary font-semibold"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-in-icon lucide-log-in size-4 mr-3 mt-px"><path d="m10 17 5-5-5-5"/><path d="M15 12H3"/><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/></svg>
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-8">
          <p class="text-muted-foreground text-sm">
            © 2025 Pongenmoinsbien • Built by mazeghou, nopareti, chbouthe
          </p>
        </div>
      </div>
    `;
  }

  private setupEventListeners(): void {
    const form = this.element.querySelector(
      "#register-form"
    ) as HTMLFormElement;
    const loginLink = this.element.querySelector(
      "#login-link"
    ) as HTMLButtonElement;

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.handleRegister();
    });

    loginLink?.addEventListener("click", () => {
      navigateToView(ViewType.LOGIN);
    });
  }

  private async handleRegister(): Promise<void> {
    if (this.isLoading) return;

    const form = this.element.querySelector(
      "#register-form"
    ) as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!email || !password || !confirmPassword) {
      Toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      Toast.error("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      Toast.error("Passwords do not match");
      return;
    }

    this.setLoading(true);

    try {
      const response = await authAPI.register({ email, password });

      Toast.success(
        response.message ||
          "Registration successful! You may now log in."
      );
      navigateToView(ViewType.LOGIN);
    } catch (error) {
      console.log("Registration error:", error);
      // @ts-expect-error error is string
      Toast.error(`Registration failed. ${error.message}`);
    } finally {
      this.setLoading(false);
    }
  }

  private setLoading(loading: boolean): void {
    this.isLoading = loading;

    const submitBtn = this.element.querySelector(
      "#register-btn"
    ) as HTMLButtonElement;
    const inputs = this.element.querySelectorAll(
      "input"
    ) as NodeListOf<HTMLInputElement>;

    if (submitBtn) {
      submitBtn.disabled = loading;
      submitBtn.textContent = loading
        ? "Creating Account..."
        : "Create Account";

      if (loading) {
        submitBtn.classList.add("opacity-50");
      } else {
        submitBtn.classList.remove("opacity-50");
      }
    }

    inputs.forEach((input) => {
      input.disabled = loading;
    });
  }
}

export async function createRegisterPage(): Promise<HTMLElement> {
  const page = new RegisterPage();
  return page.render();
}
