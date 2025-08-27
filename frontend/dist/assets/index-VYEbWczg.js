const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/register-mkfnDkAG.js","assets/users-BHhFmrZ9.js","assets/ui-BDQzTN5a.js","assets/login-xIBFUEtN.js","assets/A2F-CUNc8p4k.js","assets/A2F-BluurmMj.js","assets/profile-Dx_s4TG-.js"])))=>i.map(i=>d[i]);
(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&a(s)}).observe(document,{childList:!0,subtree:!0});function r(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function a(n){if(n.ep)return;n.ep=!0;const o=r(n);fetch(n.href,o)}})();const L="modulepreload",S=function(e){return"/"+e},v={},l=function(t,r,a){let n=Promise.resolve();if(r&&r.length>0){let s=function(c){return Promise.all(c.map(d=>Promise.resolve(d).then(u=>({status:"fulfilled",value:u}),u=>({status:"rejected",reason:u}))))};document.getElementsByTagName("link");const i=document.querySelector("meta[property=csp-nonce]"),f=(i==null?void 0:i.nonce)||(i==null?void 0:i.getAttribute("nonce"));n=s(r.map(c=>{if(c=S(c),c in v)return;v[c]=!0;const d=c.endsWith(".css"),u=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${u}`))return;const g=document.createElement("link");if(g.rel=d?"stylesheet":L,d||(g.as="script"),g.crossOrigin="",g.href=c,f&&g.setAttribute("nonce",f),document.head.appendChild(g),d)return new Promise((_,E)=>{g.addEventListener("load",_),g.addEventListener("error",()=>E(new Error(`Unable to preload CSS for ${c}`)))})}))}function o(s){const i=new Event("vite:preloadError",{cancelable:!0});if(i.payload=s,window.dispatchEvent(i),!i.defaultPrevented)throw s}return n.then(s=>{for(const i of s||[])i.status==="rejected"&&o(i.reason);return t().catch(o)})};function m(){try{return JSON.parse(localStorage.getItem("user")||"null")}catch{return null}}function q(e){localStorage.setItem("user",JSON.stringify(e)),window.dispatchEvent(new CustomEvent("auth:changed",{detail:e}))}function O(){localStorage.removeItem("user"),window.dispatchEvent(new CustomEvent("auth:changed",{detail:null}))}const h={"Content-Type":"application/json"};async function w(e,t){const r=await fetch(e,t),a=await r.json().catch(()=>({}));if(!r.ok)throw new Error((a==null?void 0:a.error)||r.statusText||"Request error");return a}async function C(e,t){const r=await fetch("/auth/login",{method:"POST",headers:h,body:JSON.stringify({email:e,password:t})}),a=await r.json().catch(()=>({}));if(!r.ok||!(a!=null&&a.userId))throw new Error((a==null?void 0:a.error)||r.statusText||"Login error");return{userId:String(a.userId)}}async function k(e,t){const r=await w("/auth/register",{method:"POST",headers:h,body:JSON.stringify({email:e,password:t})});if(!(r!=null&&r.userId))throw new Error("Auth error: userId manquant");return String(r.userId)}async function V(e){try{await w(`/auth/delete/${encodeURIComponent(e)}`,{method:"DELETE",headers:h})}catch{}}async function j(){const e=m();let t=await fetch("/users/logout",{method:"POST",headers:h,credentials:"include"});if(!t.ok&&(e!=null&&e.userId)&&(t=await fetch("/users/logout",{method:"POST",headers:h,credentials:"include",body:JSON.stringify({userId:e.userId})})),!t.ok){const r=await t.text().catch(()=>"");console.warn("Logout non OK:",t.status,r)}O()}function A(e){const t=document.createElement("nav");t.className="container-page my-4",t.setAttribute("role","navigation"),t.innerHTML=`
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
  `,t.addEventListener("click",n=>{const o=n.target.closest("a[data-route]");o&&(n.preventDefault(),e(o.dataset.route||"/"))});const r=()=>{const n=location.hash.replace(/^#/,"")||"/";t.querySelectorAll("a[data-route]").forEach(o=>{const s=o.dataset.route===n||n==="/"&&o.dataset.route==="/accueil";o.classList.toggle("bg-gray-100",s)})};window.addEventListener("hashchange",r);const a=async()=>{const n=t.querySelector("#nav-right"),o=m();if(!o){n.innerHTML=`
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
      `;return}const s=P(o.avatarUrl);n.innerHTML=`
      <button type="button" id="btn-profile"
        class="flex items-center gap-2 rounded-xl px-3 py-1.5 hover:bg-gray-100 focus:outline-none
               focus-visible:ring-2 focus-visible:ring-blue-500/60 transition">
        <img id="btn-profile-img" src="${s}" alt="" class="h-8 w-8 rounded-lg ring-1 ring-black/5 object-cover">
        <span class="text-sm font-medium">${T(o.username)}</span>
        <svg viewBox="0 0 20 20" class="h-4 w-4" aria-hidden="true"><path d="M5 7l5 5 5-5" fill="currentColor"/></svg>
      </button>
    `;const i=n.querySelector("#btn-profile-img");i.addEventListener("error",()=>{i.src="/avatar/default.png"},{once:!0});const f=n.querySelector("#btn-profile"),{attachProfileMenu:c}=await l(async()=>{const{attachProfileMenu:u}=await import("./profileMenu-BRgDgSvC.js");return{attachProfileMenu:u}},[]),{open:d}=c(f,m(),{onLogoutSuccess:()=>{a(),r()}});f.addEventListener("click",u=>{u.preventDefault(),d()})};return window.addEventListener("auth:changed",a),a(),r(),t}function P(e){if(!e)return"/avatar/default.png";const t=e.trim();if(/^(https?:|data:|blob:)/i.test(t))return t;const r=t.replace(/^\/+/,"");return r==="default.png"?"/avatar/default.png":r.startsWith("avatar/")||r.includes("/")?"/"+r:"/avatar/"+r}function T(e){return e.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}function I(){const e=document.createElement("div");return e.className="bg-black text-gray-200 border-t border-white/10",e.innerHTML=`
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
  `,e}const b={"/":()=>l(()=>import("./accueil-4hn6jxne.js"),[]),"/accueil":()=>l(()=>import("./accueil-4hn6jxne.js"),[]),"/inscription":()=>l(()=>import("./register-mkfnDkAG.js"),__vite__mapDeps([0,1,2])),"/connexion":()=>l(()=>import("./login-xIBFUEtN.js"),__vite__mapDeps([3,4,2])),"/a2f":()=>l(()=>import("./A2F-BluurmMj.js"),__vite__mapDeps([5,4,2])),"/profil":()=>l(()=>import("./profile-Dx_s4TG-.js"),__vite__mapDeps([6,1])),"/friends":()=>l(()=>import("./friends-BQ5hV5Nm.js"),[]),"/statistiques":()=>l(()=>import("./statistiques-BzrUhutz.js"),[]),"/pong":()=>l(()=>import("./pong-CWRGOfx8.js"),[]),"/teams":()=>l(()=>import("./teams-DzTRKbXm.js"),[])};let p;function y(){return(window.location.hash||"#/").replace(/^#/,"")||"/"}function R(e){e.startsWith("#")?window.location.hash=e:window.location.hash=`#${e}`}async function x(e){const r=await(b[e]??b["/"])();p.innerHTML="",r.default(p)}function D(e){p=e.mount,window.addEventListener("hashchange",()=>{const t=y();x(t)}),x(y())}function N(){const e=document.getElementById("app");e.innerHTML="";const t=document.createElement("header"),r=document.createElement("main"),a=document.createElement("footer");t.className="border-b bg-white",r.className="flex-1 py-8",a.className="border-t bg-white",t.appendChild(A(n=>R(n))),a.appendChild(I()),e.append(t,r,a),D({mount:r})}N();export{C as a,k as c,V as d,m as g,j as l,R as n,q as s};
