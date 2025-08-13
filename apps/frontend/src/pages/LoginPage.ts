import { authAPI } from "../api/auth";
import { BaseComponent } from "../components/BaseComponent";
import { Toast } from "../components/Toast";
import { navigateToView, ViewType } from "../utils/navigation";

export class LoginPage extends BaseComponent {
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
          <p class="text-muted-foreground text-base sm:text-lg">
            Classic Pong • Modern Experience
          </p>
        </div>

        <div class="card">
          <div class="card-header text-center">
            <h2 class="card-title">
              Welcome Back
            </h2>
            <p class="card-description">
              Sign in to continue your gaming journey
            </p>
          </div>

          <div class="card-content">
            <form id="login-form" class="space-y-6">
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
                  class="input"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                id="login-btn"
                class="btn btn-primary w-full font-bold text-lg ${
                  this.isLoading ? "opacity-50" : ""
                }"
                ${this.isLoading ? "disabled" : ""}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rocket-icon lucide-rocket size-4 mt-px mr-3"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
                ${this.isLoading ? "Signing In..." : "Sign In"}
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
                    New to Pongenmoinsbien?
                  </p>
                  <button
                    id="register-link"
                    class="btn btn-success font-semibold"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles-icon lucide-sparkles size-4 mt-px mr-3"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>
                    Create Account
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
    const form = this.element.querySelector("#login-form") as HTMLFormElement;
    const registerLink = this.element.querySelector(
      "#register-link"
    ) as HTMLButtonElement;

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      await this.handleLogin();
    });

    registerLink?.addEventListener("click", () => {
      navigateToView(ViewType.REGISTER);
    });
  }

  private async handleLogin(): Promise<void> {
    if (this.isLoading) return;

    const form = this.element.querySelector("#login-form") as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      Toast.error("Please fill in all fields");
      return;
    }

    this.setLoading(true);

    try {
      const response = await authAPI.login({ email, password });

      if (response.requiresTwoFactor) {
        sessionStorage.setItem("twoFactorUserId", response.userId.toString());
        sessionStorage.setItem("twoFactorEmail", email);

        Toast.info("Verification code sent to your email");

        navigateToView(ViewType.TWO_FACTOR);
      } else {
        Toast.success("Login successful!");
        navigateToView(ViewType.DASHBOARD);
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";

      if (errorMessage.includes("email not verified")) {
        if (error && (error as any).requiresEmailVerification) {
          const errorData = error as any;
          if (errorData.email) {
            sessionStorage.setItem("verificationEmail", errorData.email);
            Toast.info(
              errorData.message ||
                "A verification code has been sent to your email"
            );
            navigateToView(ViewType.VERIFY_EMAIL_CODE);
            return;
          }
        }
        sessionStorage.setItem("verificationEmail", email);
        Toast.info("Please verify your email with the 6-digit code");
        navigateToView(ViewType.VERIFY_EMAIL_CODE);
      } else {
        Toast.error(errorMessage);
      }
    } finally {
      this.setLoading(false);
    }
  }

  private setLoading(loading: boolean): void {
    this.isLoading = loading;

    const submitBtn = this.element.querySelector(
      "#login-btn"
    ) as HTMLButtonElement;
    const emailInput = this.element.querySelector("#email") as HTMLInputElement;
    const passwordInput = this.element.querySelector(
      "#password"
    ) as HTMLInputElement;

    if (submitBtn) {
      submitBtn.disabled = loading;
      submitBtn.textContent = loading ? "Signing In..." : "🚀 Sign In";

      if (loading) {
        submitBtn.classList.add("opacity-50");
      } else {
        submitBtn.classList.remove("opacity-50");
      }
    }

    if (emailInput) emailInput.disabled = loading;
    if (passwordInput) passwordInput.disabled = loading;
  }
}

export async function createLoginPage(): Promise<HTMLElement> {
  const page = new LoginPage();
  return page.render();
}
