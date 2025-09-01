import{g as U,s as I,n as B}from"./index-VYEbWczg.js";import{u as P}from"./users-BHhFmrZ9.js";const k={"Content-Type":"application/json"};async function S(l,e){const s=await fetch(l,e),t=await s.json().catch(()=>({}));if(!s.ok)throw new Error((t==null?void 0:t.error)||s.statusText||"Request error");return t}async function T(l,e){const s=Object.fromEntries(Object.entries({userId:l,firstName:e.firstName??"",lastName:e.lastName??"",username:e.username??"",avatarPath:e.avatarPath??""}).filter(([,t])=>t!==""));return S(`/users/${encodeURIComponent(l)}`,{method:"PUT",headers:k,body:JSON.stringify(s)})}async function q(l,e){return S(`/auth/email/${encodeURIComponent(l)}`,{method:"PUT",headers:k,body:JSON.stringify({email:e})})}async function M(l,e,s){const t=await fetch(`/auth/password/${encodeURIComponent(l)}`,{method:"POST",headers:k,body:JSON.stringify({oldPassword:e,newPassword:s})});if(t.status===204)return;const d=await t.json().catch(()=>({}));if(!t.ok)throw new Error((d==null?void 0:d.error)||t.statusText||"Password update error")}function O(l){const{grid:e,previewImg:s,urlInput:t,applyUrlBtn:d,messageEl:b,initialValue:r,avatars:x,debounceMs:m=250,fallback:n="/avatar/default.png"}=l,o=(c="",a)=>{b&&(b.textContent=c,b.className=`text-sm ${a==="success"?"text-green-600":a==="error"?"text-red-600":""}`)};function i(c){if(!c)return"";const a=c.trim();if(!a)return"";if(/^(https?:|data:|blob:)/i.test(a))return a;const u=a.replace(/^\/+/,"");return u.startsWith("avatar/")||u.includes("/")?"/"+u:"/avatar/"+u}function w(c){s.src=c;const a=()=>{s.src=n,s.removeEventListener("error",a)};s.addEventListener("error",a,{once:!0})}function v(c){const a=i(c);e.querySelectorAll("button[data-avatar]").forEach(u=>{const g=i(u.dataset.avatar||"")===a;u.setAttribute("aria-pressed",String(g));const f=u.querySelector("span");f&&(f.classList.toggle("ring-2",g),f.classList.toggle("ring-blue-600",g),g||f.classList.remove("ring-2","ring-blue-600"))})}let p=null;function E(c){p&&window.clearTimeout(p),p=window.setTimeout(async()=>{try{await j(c),o("✅ Avatar mis à jour","success")}catch(a){o(`❌ ${(a==null?void 0:a.message)||"Échec mise à jour avatar"}`,"error")}},m)}async function j(c){const a=U();if(!a)throw new Error("Session expirée");const u=await P(a.userId,{avatarPath:c}),g={...a,avatarPath:u.avatarPath};I(g),window.dispatchEvent(new CustomEvent("auth:changed",{detail:g}))}function A(c){var C;const a=c.target,u=a==null?void 0:a.closest("button[data-avatar]"),g=(u==null?void 0:u.dataset.avatar)||((C=a==null?void 0:a.getAttribute)==null?void 0:C.call(a,"data-avatar"))||"";if(!g)return;c.preventDefault();const f=i(g);t.value=f,w(f),v(f),E(f)}function L(){const c=t.value.trim();if(!c)return;const a=i(c);v("__none__"),w(a),E(a)}const N=i(r)||n;return t.value=N,w(N),x.includes(N)&&v(N),e.addEventListener("click",A),d.addEventListener("click",L),{setValue(c,{save:a=!1}={}){const u=i(c)||n;t.value=u,w(u),v(u),a&&E(u)},destroy(){e.removeEventListener("click",A),d.removeEventListener("click",L),p&&window.clearTimeout(p)}}}const $=["/avatar/default.png","/avatar/avatar1.png","/avatar/avatar2.png","/avatar/avatar3.png","/avatar/avatar4.png","/avatar/avatar5.png"],D=l=>{const e=U();if(!e){B("/connexion");return}const s=R(e.avatarPath)||$[0];l.innerHTML=`
    <div class="container-page my-10 grid gap-6 lg:grid-cols-3">
      <!-- Identité (aperçu) -->
      <section class="rounded-2xl border bg-white shadow-sm p-6 h-max">
        <h2 class="text-sm uppercase tracking-wider text-gray-500 mb-4">Identité</h2>
        <div class="flex items-center gap-4">
          <img id="pp-avatar" src="${y(s)}" alt="Avatar"
               class="h-16 w-16 rounded-xl ring-1 ring-black/10 object-cover">
          <div class="min-w-0">
            <div id="pp-username" class="font-semibold text-xl truncate">${h(e.username)}</div>
            <div id="pp-email" class="text-sm text-gray-600 truncate">${h(e.email||"")}</div>
          </div>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <div class="text-gray-500">Prénom</div>
            <div id="pp-firstName" class="font-medium">${h(e.firstName||"")}</div>
          </div>
          <div>
            <div class="text-gray-500">Nom</div>
            <div id="pp-lastName" class="font-medium">${h(e.lastName||"")}</div>
          </div>
        </div>
      </section>

      <!-- Colonne droite : formulaires -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Informations de base -->
        <section class="rounded-2xl border bg-white shadow-sm p-6">
          <h2 class="text-sm uppercase tracking-wider text-gray-500 mb-4">Informations de base</h2>
          <form id="profile-form" class="space-y-5" novalidate>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label class="block">
                <span class="text-sm text-gray-700">Prénom</span>
                <input id="pf-firstName" type="text"
                  class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value="${y(e.firstName||"")}">
              </label>
              <label class="block">
                <span class="text-sm text-gray-700">Nom</span>
                <input id="pf-lastName" type="text"
                  class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value="${y(e.lastName||"")}">
              </label>
            </div>

            <label class="block">
              <span class="text-sm text-gray-700">Nom d'utilisateur</span>
              <input id="pf-username" type="text"
                class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                value="${y(e.username)}">
            </label>

            <label class="block">
              <span class="text-sm text-gray-700">Email</span>
              <input id="pf-email" type="email"
                class="mt-1 w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                value="${y(e.email||"")}">
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
            ${$.map(n=>`
              <button type="button"
                      class="group relative rounded-xl overflow-hidden ring-1 ring-black/10 hover:ring-blue-300 focus:outline-none"
                      data-avatar="${n}" aria-pressed="${n===s?"true":"false"}">
                <img src="${n}" alt="" class="h-16 w-16 object-cover" data-avatar="${n}">
                <span class="pointer-events-none absolute inset-0 rounded-xl ${n===s?"ring-2 ring-blue-600":""}"></span>
              </button>
            `).join("")}
          </div>

          <div class="mt-3 flex items-center gap-3">
            <input id="pf-avatarPath" type="url" placeholder="Ou URL personnalisée (https://...)"
              class="flex-1 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              value="${y(s)}">
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
  `;const t=n=>{const o=l.querySelector(n);if(!o)throw new Error(`Élément introuvable: ${n}`);return o},d=(n,o="",i)=>{n.textContent=o,n.className=`text-sm ${i==="success"?"text-green-600":i==="error"?"text-red-600":""}`},b=(n,o,i)=>{n.disabled=o,n.classList.toggle("opacity-70",o),n.classList.toggle("cursor-not-allowed",o),i&&o&&(n.textContent=i)},r={firstName:t("#pf-firstName"),lastName:t("#pf-lastName"),email:t("#pf-email"),username:t("#pf-username"),saveBtn:t("#pf-save"),cancelBtn:t("#pf-cancel"),msg:t("#pf-msg"),card:{avatar:t("#pp-avatar"),username:t("#pp-username"),email:t("#pp-email"),firstName:t("#pp-firstName"),lastName:t("#pp-lastName")}},x={grid:t("#avatar-grid"),urlInput:t("#pf-avatarPath"),applyUrlBtn:t("#btn-apply-url"),msg:t("#av-msg")},m={old:t("#pf-oldpwd"),n1:t("#pf-newpwd"),n2:t("#pf-newpwd2"),saveBtn:t("#pwd-save"),msg:t("#pwd-msg")};r.card.avatar.addEventListener("error",()=>{r.card.avatar.src="/avatar/default.png"},{once:!0}),O({grid:x.grid,previewImg:r.card.avatar,urlInput:x.urlInput,applyUrlBtn:x.applyUrlBtn,messageEl:x.msg,initialValue:s,avatars:$,debounceMs:250,fallback:"/avatar/default.png"}),r.cancelBtn.addEventListener("click",()=>{r.firstName.value=e.firstName||"",r.lastName.value=e.lastName||"",r.username.value=e.username||"",r.email.value=e.email||"",d(r.msg)}),t("#profile-form").addEventListener("submit",async n=>{n.preventDefault();const o={firstName:r.firstName.value.trim(),lastName:r.lastName.value.trim(),email:r.email.value.trim(),username:r.username.value.trim()};b(r.saveBtn,!0,"Enregistrement…"),d(r.msg);try{const i=await T(e.userId,{firstName:o.firstName,lastName:o.lastName,username:o.username}),w=await q(e.userId,o.email),v=U()||e,p={userId:e.userId,firstName:i.firstName,lastName:i.lastName,username:i.username,email:w.email,avatarPath:v.avatarPath};I(p),window.dispatchEvent(new CustomEvent("auth:changed",{detail:p})),r.card.username.textContent=p.username||"",r.card.email.textContent=p.email||"",r.card.firstName.textContent=p.firstName||"",r.card.lastName.textContent=p.lastName||"",d(r.msg,"✅ Modifications enregistrées","success")}catch(i){d(r.msg,`❌ ${(i==null?void 0:i.message)||"Erreur lors de la mise à jour"}`,"error")}finally{b(r.saveBtn,!1)}}),t("#pwd-form").addEventListener("submit",async n=>{n.preventDefault(),d(m.msg);const o=m.old.value.trim(),i=m.n1.value.trim(),w=m.n2.value.trim();if(!o||!i)return d(m.msg,"❌ Champs requis.","error");if(i!==w)return d(m.msg,"❌ Les mots de passe ne correspondent pas.","error");b(m.saveBtn,!0,"Mise à jour…");try{await M(e.userId,o,i),d(m.msg,"✅ Mot de passe modifié avec succès !","success"),m.old.value="",m.n1.value="",m.n2.value=""}catch(v){d(m.msg,`❌ ${(v==null?void 0:v.message)||"Erreur lors du changement de mot de passe"}`,"error")}finally{b(m.saveBtn,!1)}})};function R(l){if(!l)return"";const e=l.trim();if(!e)return"";if(/^(https?:|data:|blob:)/i.test(e))return e;const s=e.replace(/^\/+/,"");return s.startsWith("avatar/")||s.includes("/")?"/"+s:"/avatar/"+s}function h(l){return l.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e])}function y(l){return h(l).replace(/"/g,"&quot;")}export{D as default};
