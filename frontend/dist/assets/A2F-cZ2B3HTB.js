import{s as u,n as f}from"./index-CRZkJy2F.js";import{g as m,v as g,f as p,c as v}from"./A2F-CUNc8p4k.js";import{s as o,c as x,l}from"./ui-BDQzTN5a.js";const w=t=>{const i=m()||"";t.innerHTML=`
    <div class="container-page my-10">
      <div class="mx-auto max-w-md rounded-2xl border shadow-sm bg-white px-6 py-8">
        <h2 class="text-2xl font-semibold text-center text-gray-800">Vérification 2FA</h2>

        <form id="a2f-form" class="mt-6 space-y-4" novalidate>
          <label class="block">
            <span class="text-sm text-gray-700">Code à 6 chiffres</span>
            <input id="code_2fa" inputmode="numeric" pattern="\\d{6}" maxlength="6" required
              class="mt-1 w-full border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest text-xl"
              placeholder="••••••">
          </label>

          <button id="verifyBtn" type="submit"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg transition">
            Vérifier
          </button>

          <p id="formMsg" class="text-sm min-h-5" aria-live="polite"></p>
        </form>
      </div>
    </div>
  `;const c=t.querySelector("#a2f-form"),r=t.querySelector("#code_2fa"),s=t.querySelector("#formMsg"),a=t.querySelector("#verifyBtn");i||o(s,"Session expirée. Veuillez vous reconnecter.","error"),setTimeout(()=>r.focus(),0),r.addEventListener("input",()=>{r.value=r.value.replace(/\D/g,"").slice(0,6)}),c.addEventListener("submit",async d=>{d.preventDefault(),x(s),i||o(s,"Session expirée. Veuillez vous reconnecter.","error");const n=r.value.trim();if(n.length!==6)return o(s,"Veuillez entrer un code à 6 chiffres.","error");l(a,!0,"Vérification…");try{await g(i,n);const e=await p(i);u(e),window.dispatchEvent(new CustomEvent("auth:changed",{detail:e})),v(),f("/accueil")}catch(e){o(s,(e==null?void 0:e.message)||"Vérification échouée","error")}finally{l(a,!1)}})};export{w as default};
