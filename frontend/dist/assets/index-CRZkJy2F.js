const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/register-HJNeK9Z0.js","assets/users-BHhFmrZ9.js","assets/ui-BDQzTN5a.js","assets/login-Dll0C2Kn.js","assets/A2F-CUNc8p4k.js","assets/A2F-cZ2B3HTB.js","assets/profile-C9llj0FG.js"])))=>i.map(i=>d[i]);
(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))o(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const i of a.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&o(i)}).observe(document,{childList:!0,subtree:!0});function r(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(n){if(n.ep)return;n.ep=!0;const a=r(n);fetch(n.href,a)}})();const L="modulepreload",S=function(e){return"/"+e},v={},u=function(t,r,o){let n=Promise.resolve();if(r&&r.length>0){let i=function(c){return Promise.all(c.map(d=>Promise.resolve(d).then(l=>({status:"fulfilled",value:l}),l=>({status:"rejected",reason:l}))))};document.getElementsByTagName("link");const s=document.querySelector("meta[property=csp-nonce]"),h=(s==null?void 0:s.nonce)||(s==null?void 0:s.getAttribute("nonce"));n=i(r.map(c=>{if(c=S(c),c in v)return;v[c]=!0;const d=c.endsWith(".css"),l=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${l}`))return;const f=document.createElement("link");if(f.rel=d?"stylesheet":L,d||(f.as="script"),f.crossOrigin="",f.href=c,h&&f.setAttribute("nonce",h),document.head.appendChild(f),d)return new Promise((E,_)=>{f.addEventListener("load",E),f.addEventListener("error",()=>_(new Error(`Unable to preload CSS for ${c}`)))})}))}function a(i){const s=new Event("vite:preloadError",{cancelable:!0});if(s.payload=i,window.dispatchEvent(s),!s.defaultPrevented)throw i}return n.then(i=>{for(const s of i||[])s.status==="rejected"&&a(s.reason);return t().catch(a)})};function m(){try{return JSON.parse(localStorage.getItem("user")||"null")}catch{return null}}function q(e){localStorage.setItem("user",JSON.stringify(e)),window.dispatchEvent(new CustomEvent("auth:changed",{detail:e}))}function O(){localStorage.removeItem("user"),window.dispatchEvent(new CustomEvent("auth:changed",{detail:null}))}const g={"Content-Type":"application/json"};async function x(e,t){const r=await fetch(e,t),o=await r.json().catch(()=>({}));if(!r.ok)throw new Error((o==null?void 0:o.error)||r.statusText||"Request error");return o}async function C(e,t){const r=await fetch("/auth/login",{method:"POST",headers:g,body:JSON.stringify({email:e,password:t})}),o=await r.json().catch(()=>({}));if(!r.ok||!(o!=null&&o.userId))throw new Error((o==null?void 0:o.error)||r.statusText||"Login error");return{userId:String(o.userId)}}async function k(e,t){const r=await x("/auth/register",{method:"POST",headers:g,body:JSON.stringify({email:e,password:t})});if(!(r!=null&&r.userId))throw new Error("Auth error: userId manquant");return String(r.userId)}async function U(e){try{await x(`/auth/delete/${encodeURIComponent(e)}`,{method:"DELETE",headers:g})}catch{}}async function j(e,t){const r=await fetch(`/auth/email/${encodeURIComponent(e)}`,{method:"PUT",headers:g,body:JSON.stringify({email:t})}),o=await r.json().catch(()=>({}));if(!r.ok)throw new Error((o==null?void 0:o.error)||r.statusText||"Request error");return o}async function V(e,t,r){const o=await fetch(`/auth/password/${encodeURIComponent(e)}`,{method:"POST",headers:g,body:JSON.stringify({oldPassword:t,newPassword:r})});if(o.status===204)return;const n=await o.json().catch(()=>({}));if(!o.ok)throw new Error((n==null?void 0:n.error)||o.statusText||"Password update error")}async function $(){const e=m();let t=await fetch("/users/logout",{method:"POST",headers:g,credentials:"include"});if(!t.ok&&(e!=null&&e.userId)&&(t=await fetch("/users/logout",{method:"POST",headers:g,credentials:"include",body:JSON.stringify({userId:e.userId})})),!t.ok){const r=await t.text().catch(()=>"");console.warn("Logout non OK:",t.status,r)}O()}function P(e){const t=document.createElement("nav");t.className="container-page my-4",t.setAttribute("role","navigation"),t.innerHTML=`
    <div class="flex items-center justify-between rounded-2xl border shadow-sm
                bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50 px-4 py-3">
      <!-- Gauche: logo + marque + liens -->
      <div class="flex items-center gap-4">
        <!-- Marque -->
        <a href="#/accueil" data-route="/accueil"
           class="flex items-center gap-3 select-none"
           aria-label="Aller à l'accueil (Ft_transcendence)">
          <img src="/site/logo.png" alt="Logo" class="h-9 w-9 rounded-xl ring-1 ring-black/5 object-cover">
          <span class="text-base md:text-lg font-semibold tracking-tight">Ft_transcendence</span>
        </a>

        <!-- Liens principaux -->
        <div class="hidden sm:flex items-center gap-1" aria-label="Navigation principale">
          <a href="#/pong" data-route="/pong" data-nav
             class="text-sm font-medium text-gray-700 hover:text-gray-900
                    px-3 py-1.5 rounded-xl hover:bg-gray-100 active:bg-gray-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 transition">
            Pong
          </a>

          <a href="#/teams" data-route="/teams" data-nav
             class="text-sm font-medium text-gray-700 hover:text-gray-900
                    px-3 py-1.5 rounded-xl hover:bg-gray-100 active:bg-gray-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 transition">
            Teams
          </a>

          <a href="#/" data-route="/" data-nav
             class="text-sm font-medium text-gray-700 hover:text-gray-900
                    px-3 py-1.5 rounded-xl hover:bg-gray-100 active:bg-gray-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 transition">
            Autre1
          </a>

          <a href="#/" data-route="/" data-nav
             class="text-sm font-medium text-gray-700 hover:text-gray-900
                    px-3 py-1.5 rounded-xl hover:bg-gray-100 active:bg-gray-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 transition">
            Autre2
          </a>

        </div>
      </div>

      <!-- Droite -->
      <div id="nav-right" class="flex items-center gap-2 sm:gap-3"></div>
    </div>
  `,t.addEventListener("click",n=>{const a=n.target.closest("a[data-route]");a&&(n.preventDefault(),e(a.dataset.route||"/"))});const r=()=>{const n=location.hash.replace(/^#/,"")||"/";t.querySelectorAll("a[data-route]").forEach(a=>{const i=a.dataset.route===n||n==="/"&&a.dataset.route==="/accueil";a.classList.toggle("bg-gray-100",i)})};window.addEventListener("hashchange",r);const o=async()=>{const n=t.querySelector("#nav-right"),a=m();if(!a){n.innerHTML=`
        <a href="#/connexion" data-route="/connexion"
           class="text-sm font-medium text-gray-700 hover:text-gray-900
                  px-3 py-1.5 rounded-xl hover:bg-gray-100 active:bg-gray-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 transition">
          Connexion
        </a>
        <a href="#/inscription" data-route="/inscription"
           class="text-sm font-medium text-gray-700 hover:text-gray-900
                  px-3 py-1.5 rounded-xl hover:bg-gray-100 active:bg-gray-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 transition">
          S'enregistrer
        </a>
      `;return}const i=T(a.avatarUrl);n.innerHTML=`
      <button type="button" id="btn-profile"
        class="flex items-center gap-2 rounded-xl px-3 py-1.5 hover:bg-gray-100 focus:outline-none
               focus-visible:ring-2 focus-visible:ring-blue-500/60 transition">
        <img id="btn-profile-img" src="${i}" alt="" class="h-8 w-8 rounded-lg ring-1 ring-black/5 object-cover">
        <span class="text-sm font-medium">${A(a.username)}</span>
        <svg viewBox="0 0 20 20" class="h-4 w-4" aria-hidden="true"><path d="M5 7l5 5 5-5" fill="currentColor"/></svg>
      </button>
    `;const s=n.querySelector("#btn-profile-img");s.addEventListener("error",()=>{s.src="/avatar/default.png"},{once:!0});const h=n.querySelector("#btn-profile"),{attachProfileMenu:c}=await u(async()=>{const{attachProfileMenu:l}=await import("./profileMenu-CdilDh3M.js");return{attachProfileMenu:l}},[]),{open:d}=c(h,m(),{onLogoutSuccess:()=>{o(),r()}});h.addEventListener("click",l=>{l.preventDefault(),d()})};return window.addEventListener("auth:changed",o),o(),r(),t}function T(e){if(!e)return"/avatar/default.png";const t=e.trim();if(/^(https?:|data:|blob:)/i.test(t))return t;const r=t.replace(/^\/+/,"");return r==="default.png"?"/avatar/default.png":r.startsWith("avatar/")||r.includes("/")?"/"+r:"/avatar/"+r}function A(e){return e.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function I(){const e=document.createElement("div");return e.className="bg-black text-gray-200 border-t border-white/10",e.innerHTML=`
    <div class="container-page py-8">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <img src="/site/logo.png" alt="Logo" class="h-7 w-7 rounded-lg ring-1 ring-white/10">
          <span class="text-sm text-gray-400">© ${new Date().getFullYear()} Ft_transcendence</span>
        </div>

        <nav class="flex items-center gap-6" aria-label="Liens de pied de page">
          <a href="#/accueil" class="text-sm hover:text-white transition">Accueil</a>
          <a href="#/connexion" class="text-sm hover:text-white transition">Connexion</a>
          <a href="#/inscription" class="text-sm hover:text-white transition">S'enregistrer</a>
        </nav>
      </div>
    </div>
  `,e}const y={"/":()=>u(()=>import("./accueil-4hn6jxne.js"),[]),"/accueil":()=>u(()=>import("./accueil-4hn6jxne.js"),[]),"/inscription":()=>u(()=>import("./register-HJNeK9Z0.js"),__vite__mapDeps([0,1,2])),"/connexion":()=>u(()=>import("./login-Dll0C2Kn.js"),__vite__mapDeps([3,4,2])),"/a2f":()=>u(()=>import("./A2F-cZ2B3HTB.js"),__vite__mapDeps([5,4,2])),"/profil":()=>u(()=>import("./profile-C9llj0FG.js"),__vite__mapDeps([6,1])),"/friends":()=>u(()=>import("./friends-BQ5hV5Nm.js"),[]),"/statistiques":()=>u(()=>import("./statistiques-BzrUhutz.js"),[]),"/pong":()=>u(()=>import("./pong-CWRGOfx8.js"),[]),"/teams":()=>u(()=>import("./teams-DzTRKbXm.js"),[])};let p;function b(){return(window.location.hash||"#/").replace(/^#/,"")||"/"}function R(e){e.startsWith("#")?window.location.hash=e:window.location.hash=`#${e}`}async function w(e){const r=await(y[e]??y["/"])();p.innerHTML="",r.default(p)}function N(e){p=e.mount,window.addEventListener("hashchange",()=>{const t=b();w(t)}),w(b())}function D(){const e=document.getElementById("app");e.innerHTML="";const t=document.createElement("header"),r=document.createElement("main"),o=document.createElement("footer");t.className="border-b bg-white",r.className="flex-1 py-8",o.className="border-t bg-white",t.appendChild(P(n=>R(n))),o.appendChild(I()),e.append(t,r,o),N({mount:r})}D();export{C as a,V as b,k as c,U as d,m as g,$ as l,R as n,q as s,j as u};
