import { getSavedUser, setLoggedInUser, setStatusMessage } from "../utils/ui";
import type { AppUser } from "../utils/interface";
import { uploadAvatar } from "../api/avatar";

export type UploadAvatarOptions = {
  button: HTMLButtonElement;
  fileInput: HTMLInputElement;
  messageEl: HTMLElement;
  previewImg: HTMLImageElement;
  grid: HTMLElement;
};


export function initUploadAvatar(opts: UploadAvatarOptions) 
{
  const { button, fileInput, messageEl, previewImg, grid } = opts;

  const user = getSavedUser<AppUser>();
  if (!user) 
    return;

  button.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) 
        return;

    const allowed = new Set(["image/png", "image/jpeg", "image/webp"]);
    if (!allowed.has(file.type)) 
    {
      setStatusMessage(messageEl, "❌ Format non supporté (PNG/JPEG/WEBP uniquement)", "error");
      fileInput.value = "";
      return;
    }

    setStatusMessage(messageEl, "⏳ Upload en cours…");

    try {
      const { avatarUrl } = await uploadAvatar(user.userId, file);

      const merged: AppUser = { ...user, avatarPath: avatarUrl };
      setLoggedInUser(merged);
      window.dispatchEvent(new CustomEvent("auth:changed", { detail: merged }));

      previewImg.src = avatarUrl;

      if (!grid.querySelector(`[data-avatar="${avatarUrl}"]`)) 
      {
        grid.insertAdjacentHTML(
          "afterbegin",
          `<button type="button"
             class="group relative rounded-xl overflow-hidden ring-1 ring-black/10 hover:ring-blue-300"
             data-avatar="${avatarUrl}" aria-pressed="true">
             <img src="${avatarUrl}" alt="Uploaded avatar" class="h-16 w-16 object-cover">
             <span class="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-blue-600"></span>
           </button>`
        );
      }

      grid.querySelectorAll<HTMLButtonElement>("button[data-avatar]").forEach((btn) => {
        const isSel = btn.getAttribute("data-avatar") === avatarUrl;
        btn.setAttribute("aria-pressed", String(isSel));
        const ring = btn.querySelector("span");
        if (ring) 
        {
          ring.classList.toggle("ring-2", isSel);
          ring.classList.toggle("ring-blue-600", isSel);
          if (!isSel) 
            ring.classList.remove("ring-2", "ring-blue-600");
        }
      });

      setStatusMessage(messageEl, "✅ Avatar uploadé et appliqué", "success");
    } catch (err: any) {
      setStatusMessage(messageEl, `❌ ${err?.message || "Erreur lors de l’upload"}`, "error");
    } finally {
      fileInput.value = "";
    }
  });
}
