import{g as L,s as M,u as P,b as T,n as V}from"./index-CRZkJy2F.js";import{u as j}from"./users-BHhFmrZ9.js";function _(e){const{grid:a,previewImg:s,urlInput:t,applyUrlBtn:c,messageEl:n,initialValue:o,avatars:h,debounceMs:u=250,fallback:N="/avatar/default.png"}=e,k=(l="",r)=>{n&&(n.textContent=l,n.className=`text-sm ${r==="success"?"text-green-600":r==="error"?"text-red-600":""}`)};function p(l){if(!l)return"";const r=l.trim();if(!r)return"";if(/^(https?:|data:|blob:)/i.test(r))return r;const i=r.replace(/^\/+/,"");return i.startsWith("avatar/")||i.includes("/")?"/"+i:"/avatar/"+i}function x(l){s.src=l;const r=()=>{s.src=N,s.removeEventListener("error",r)};s.addEventListener("error",r,{once:!0})}function w(l){const r=p(l);a.querySelectorAll("button[data-avatar]").forEach(i=>{const d=p(i.dataset.avatar||"")===r;i.setAttribute("aria-pressed",String(d));const m=i.querySelector("span");m&&(m.classList.toggle("ring-2",d),m.classList.toggle("ring-blue-600",d),d||m.classList.remove("ring-2","ring-blue-600"))})}let v=null;function $(l){v&&window.clearTimeout(v),v=window.setTimeout(async()=>{try{await q(l),k("✅ Avatar mis à jour","success")}catch(r){k(`❌ ${(r==null?void 0:r.message)||"Échec mise à jour avatar"}`,"error")}},u)}async function q(l){const r=L();if(!r)throw new Error("Session expirée");const i=await j(r.userId,{avatarUrl:l}),d={...r,avatarUrl:i.avatarUrl};M(d),window.dispatchEvent(new CustomEvent("auth:changed",{detail:d}))}function A(l){var U;const r=l.target,i=r==null?void 0:r.closest("button[data-avatar]"),d=(i==null?void 0:i.dataset.avatar)||((U=r==null?void 0:r.getAttribute)==null?void 0:U.call(r,"data-avatar"))||"";if(!d)return;l.preventDefault();const m=p(d);t.value=m,x(m),w(m),$(m)}function C(){const l=t.value.trim();if(!l)return;const r=p(l);w("__none__"),x(r),$(r)}const y=p(o)||N;return t.value=y,x(y),h.includes(y)&&w(y),a.addEventListener("click",A),c.addEventListener("click",C),{setValue(l,{save:r=!1}={}){const i=p(l)||N;t.value=i,x(i),w(i),r&&$(i)},destroy(){a.removeEventListener("click",A),c.removeEventListener("click",C),v&&window.clearTimeout(v)}}}function D(e){const a={firstName:e.user.firstName||"",lastName:e.user.lastName||"",username:e.user.username||"",email:e.user.email||""},s=()=>{e.firstName.value=a.firstName,e.lastName.value=a.lastName,e.username.value=a.username,e.email.value=a.email,E(e.msgEl)},t=async c=>{c.preventDefault(),E(e.msgEl),B(e.saveBtn,!0,"Enregistrement…");try{const n=await j(e.user.userId,{firstName:e.firstName.value.trim(),lastName:e.lastName.value.trim(),username:e.username.value.trim()}),o=await P(e.user.userId,e.email.value.trim()),h=L()||e.user,u={userId:e.user.userId,firstName:n.firstName,lastName:n.lastName,username:n.username,email:o.email,avatarUrl:h.avatarUrl};M(u),window.dispatchEvent(new CustomEvent("auth:changed",{detail:u})),e.card.usernameEl.textContent=u.username||"",e.card.emailEl.textContent=u.email||"",e.card.firstNameEl.textContent=u.firstName||"",e.card.lastNameEl.textContent=u.lastName||"",a.firstName=u.firstName||"",a.lastName=u.lastName||"",a.username=u.username||"",a.email=u.email||"",E(e.msgEl,"✅ Modifications enregistrées","success")}catch(n){E(e.msgEl,`❌ ${(n==null?void 0:n.message)||"Erreur lors de la mise à jour"}`,"error")}finally{B(e.saveBtn,!1)}};return e.cancelBtn.addEventListener("click",s),e.formEl.addEventListener("submit",t),{destroy(){e.cancelBtn.removeEventListener("click",s),e.formEl.removeEventListener("submit",t)}}}function E(e,a="",s){e.textContent=a,e.className=`text-sm ${s==="success"?"text-green-600":s==="error"?"text-red-600":""}`}function B(e,a,s){e.disabled=a,e.classList.toggle("opacity-70",a),e.classList.toggle("cursor-not-allowed",a),s&&a&&(e.textContent=s)}function G(e){const a=async s=>{s.preventDefault(),g(e.msgEl);const t=e.oldInput.value.trim(),c=e.newInput.value.trim(),n=e.newInput2.value.trim();if(!t||!c)return g(e.msgEl,"❌ Champs requis.","error");if(c!==n)return g(e.msgEl,"❌ Les mots de passe ne correspondent pas.","error");S(e.saveBtn,!0,"Mise à jour…");try{await T(e.userId,t,c),g(e.msgEl,"✅ Mot de passe modifié avec succès !","success"),e.oldInput.value="",e.newInput.value="",e.newInput2.value=""}catch(o){g(e.msgEl,`❌ ${(o==null?void 0:o.message)||"Erreur lors du changement de mot de passe"}`,"error")}finally{S(e.saveBtn,!1)}};return e.formEl.addEventListener("submit",a),{destroy(){e.formEl.removeEventListener("submit",a)}}}function g(e,a="",s){e.textContent=a,e.className=`text-sm ${s==="success"?"text-green-600":s==="error"?"text-red-600":""}`}function S(e,a,s){e.disabled=a,e.classList.toggle("opacity-70",a),e.classList.toggle("cursor-not-allowed",a),s&&a&&(e.textContent=s)}function H(e,a="avatar"){if(!e)return"";const s=e.trim();if(!s)return"";if(/^(https?:|data:|blob:)/i.test(s))return s;const t=s.replace(/^\/+/,"");return t.startsWith(`${a}/`)||t.includes("/")?"/"+t:`/${a}/${t}`}function b(e){return e.replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a])}function f(e){return b(e).replace(/"/g,"&quot;")}const I=["/avatar/default.png","/avatar/avatar1.png","/avatar/avatar2.png","/avatar/avatar3.png","/avatar/avatar4.png","/avatar/avatar5.png","/avatar/avatar6.png","/avatar/avatar7.png","/avatar/avatar8.png","/avatar/avatar9.png","/avatar/avatar10.png","/avatar/avatar11.png","/avatar/avatar12.png","/avatar/avatar13.png","/avatar/avatar14.png"],R=e=>{const a=L();if(!a){V("/connexion");return}const s=H(a.avatarUrl)||I[0];e.innerHTML=`
    <div class="container-page my-10 grid gap-6 lg:grid-cols-3">
      <!-- Carte identité -->
      <section class="rounded-2xl border bg-white shadow-sm p-6 h-max">
        <h2 class="text-sm uppercase tracking-wider text-gray-500 mb-4">Identité</h2>
        <div class="flex items-center gap-4">
          <img id="pp-avatar" src="${f(s)}" alt="Avatar"
               class="h-16 w-16 rounded-xl ring-1 ring-black/10 object-cover">
          <div class="min-w-0">
            <div id="pp-username" class="font-semibold text-xl truncate">${b(a.username)}</div>
            <div id="pp-email" class="text-sm text-gray-600 truncate">${b(a.email||"")}</div>
          </div>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <div class="text-gray-500">Prénom</div>
            <div id="pp-firstName" class="font-medium">${b(a.firstName||"")}</div>
          </div>
          <div>
            <div class="text-gray-500">Nom</div>
            <div id="pp-lastName" class="font-medium">${b(a.lastName||"")}</div>
          </div>
        </div>
      </section>

      <div class="lg:col-span-2 space-y-6">
        <!-- Infos de base -->
        <section class="rounded-2xl border bg-white shadow-sm p-6">
          <h2 class="text-sm uppercase tracking-wider text-gray-500 mb-4">Informations de base</h2>
          <form id="profile-form" class="space-y-5" novalidate>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label class="block">
                <span class="text-sm text-gray-700">Prénom</span>
                <input id="pf-firstName" type="text"
                  class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value="${f(a.firstName||"")}">
              </label>
              <label class="block">
                <span class="text-sm text-gray-700">Nom</span>
                <input id="pf-lastName" type="text"
                  class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value="${f(a.lastName||"")}">
              </label>
            </div>

            <label class="block">
              <span class="text-sm text-gray-700">Nom d'utilisateur</span>
              <input id="pf-username" type="text"
                class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                value="${f(a.username)}">
            </label>

            <label class="block">
              <span class="text-sm text-gray-700">Email</span>
              <input id="pf-email" type="email"
                class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                value="${f(a.email||"")}">
            </label>

            <div class="flex items-center justify-between gap-4">
              <p id="pf-msg" class="text-sm min-h-5" aria-live="polite"></p>
              <div class="flex items-center gap-3">
                <button id="pf-cancel" type="button"
                  class="px-4 py-2 rounded-lg border hover:bg-gray-50">Annuler</button>
                <button id="pf-save" type="submit"
                  class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Enregistrer</button>
              </div>
            </div>
          </form>
        </section>

        <!-- Avatar -->
        <section class="rounded-2xl border bg-white shadow-sm p-6">
          <h2 class="text-sm uppercase tracking-wider text-gray-500 mb-2">Avatar</h2>
          <p class="text-xs text-gray-500 mb-3">Les changements d’avatar sont enregistrés automatiquement.</p>

          <div class="grid grid-cols-3 sm:grid-cols-6 gap-3" id="avatar-grid">
            ${I.map(n=>`
              <button type="button"
                      class="group relative rounded-xl overflow-hidden ring-1 ring-black/10 hover:ring-blue-300 focus:outline-none"
                      data-avatar="${n}" aria-pressed="${n===s?"true":"false"}">
                <img src="${n}" alt="" class="h-16 w-16 object-cover" data-avatar="${n}">
                <span class="pointer-events-none absolute inset-0 rounded-xl ${n===s?"ring-2 ring-blue-600":""}"></span>
              </button>
            `).join("")}
          </div>

          <div class="mt-3 flex items-center gap-3">
            <button id="btn-apply-url" type="button"
              class="px-3 py-2 rounded-lg border hover:bg-gray-50">Appliquer</button>
          </div>

          <p id="av-msg" class="text-sm min-h-5 mt-2" aria-live="polite"></p>
        </section>

        <!-- Sécurité -->
        <section class="rounded-2xl border bg-white shadow-sm p-6">
          <h2 class="text-sm uppercase tracking-wider text-gray-500 mb-4">Sécurité</h2>
          <form id="pwd-form" class="space-y-4" novalidate>
            <label class="block">
              <span class="text-sm text-gray-700">Mot de passe actuel</span>
              <input id="pf-oldpwd" type="password"
                class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500">
            </label>
            <label class="block">
              <span class="text-sm text-gray-700">Nouveau mot de passe</span>
              <input id="pf-newpwd" type="password"
                class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500">
            </label>
            <label class="block">
              <span class="text-sm text-gray-700">Confirmer le nouveau mot de passe</span>
              <input id="pf-newpwd2" type="password"
                class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500">
            </label>

            <div class="flex items-center justify-between gap-4">
              <p id="pwd-msg" class="text-sm min-h-5" aria-live="polite"></p>
              <button id="pwd-save" type="submit"
                class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Changer</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  `;const t=n=>{const o=e.querySelector(n);if(!o)throw new Error(`Élément introuvable: ${n}`);return o},c={avatar:t("#pp-avatar"),username:t("#pp-username"),email:t("#pp-email"),first:t("#pp-firstName"),last:t("#pp-lastName")};c.avatar.addEventListener("error",()=>{c.avatar.src="/avatar/default.png"},{once:!0}),_({grid:t("#avatar-grid"),previewImg:c.avatar,urlInput:t("#pf-avatarUrl"),applyUrlBtn:t("#btn-apply-url"),messageEl:t("#av-msg"),initialValue:s,avatars:I,debounceMs:250,fallback:"/avatar/default.png"}),D({user:a,formEl:t("#profile-form"),saveBtn:t("#pf-save"),cancelBtn:t("#pf-cancel"),msgEl:t("#pf-msg"),firstName:t("#pf-firstName"),lastName:t("#pf-lastName"),username:t("#pf-username"),email:t("#pf-email"),card:{usernameEl:c.username,emailEl:c.email,firstNameEl:c.first,lastNameEl:c.last}}),G({userId:a.userId,formEl:t("#pwd-form"),oldInput:t("#pf-oldpwd"),newInput:t("#pf-newpwd"),newInput2:t("#pf-newpwd2"),saveBtn:t("#pwd-save"),msgEl:t("#pwd-msg")})};export{R as default};
