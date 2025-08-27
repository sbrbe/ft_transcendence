import{n as f,l as L}from"./index-CRZkJy2F.js";function A(i,r,n={}){const o=document.createElement("div");o.className=["fixed inset-0 z-40","bg-black/20 backdrop-blur-[2px]","opacity-0 pointer-events-none transition-opacity"].join(" ");const e=document.createElement("div");e.className=["fixed z-50 w-[22rem] max-w-[92vw] outline-none","rounded-2xl border border-white/60","bg-white/80 backdrop-blur-xl","shadow-2xl ring-1 ring-black/5","scale-95 opacity-0 pointer-events-none","transition duration-150 ease-out"].join(" "),e.setAttribute("role","menu"),e.setAttribute("tabindex","-1");const u=w(r.avatarUrl);e.innerHTML=`
    <style>
      /* Petite anim d’apparition */
      .pm-enter { transform: scale(0.98); opacity: 0; }
      .pm-enter-active { transform: scale(1); opacity: 1; }
      .pm-leave { transform: scale(1); opacity: 1; }
      .pm-leave-active { transform: scale(0.98); opacity: 0; }

      /* Joli séparateur central avec gradient */
      .pm-sep { height: 1px; background-image: linear-gradient(90deg, rgba(0,0,0,0), rgba(0,0,0,0.12), rgba(0,0,0,0)); }

      /* Labels de section */
      .pm-label { font-size: 0.72rem; letter-spacing: .08em; text-transform: uppercase; }
    </style>

    <!-- Header / identité -->
    <div class="p-4 rounded-t-2xl bg-gradient-to-br from-white/80 to-gray-50/80">
      <div class="flex items-center gap-3">
        <img id="pm-avatar" src="${u}" alt="Avatar"
             class="h-12 w-12 rounded-xl ring-1 ring-black/10 object-cover">
        <div class="min-w-0">
          <div class="font-semibold text-gray-900 truncate">${y(r.username)}</div>
          <div class="text-sm text-gray-600 truncate">${y(r.email??"")}</div>
        </div>
      </div>
    </div>

    <div class="pm-sep"></div>

    <!-- Section : Navigation principale -->
    <div class="p-2">
      <div class="px-2 py-1 pm-label text-gray-500">Navigation</div>


<!--NAVBAR PROFILE MENU  -->
      <a href="#/profil" data-route="/profil" role="menuitem" data-mi
         class="block px-3 py-2 mt-1 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none">
        Voir le profil
      </a>

      <a href="#/statistiques" data-route="/statistiques" role="menuitem" data-mi
         class="block px-3 py-2 mt-1 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none">
        statistiques --> [A Faire]
      </a>

      <a href="#/friends" data-route="/friends" role="menuitem" data-mi
         class="block px-3 py-2 mt-1 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none">
        Amis --> [A Faire]
      </a>

      <a href="#/pong" data-route="/pong" role="menuitem" data-mi
         class="block px-3 py-2 mt-1 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none">
        Pong [A Faire]
      </a>
      <a href="#/....." data-route="/..." role="menuitem" data-mi
         class="block px-3 py-2 mt-1 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none">
        Autre ....
      </a>
      <a href="#/....." data-route="/..." role="menuitem" data-mi
         class="block px-3 py-2 mt-1 rounded-lg text-sm text-gray-800 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none">
        Autre ....
      </a>
    </div>

    <div class="pm-sep"></div>

    <!-- Section : Compte -->
    <div class="p-2">
      <div class="px-2 py-1 pm-label text-gray-500">ft_transcendence V1.0.0</div>
      <button id="logoutBtn" role="menuitem" data-mi
        class="w-full px-3 py-2 mt-1 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 transition">
        Déconnexion
      </button>
    </div>
  `,document.body.appendChild(o),document.body.appendChild(e);const p=e.querySelector("#pm-avatar");p.addEventListener("error",()=>{p.src="/avatar/default.png"},{once:!0});function b(){m(i,e),o.classList.remove("pointer-events-none","opacity-0"),o.classList.add("opacity-100"),e.classList.remove("pointer-events-none"),e.classList.add("pm-enter-active"),e.classList.remove("pm-leave","pm-leave-active"),e.classList.add("pm-enter"),requestAnimationFrame(()=>{e.classList.remove("pm-enter"),e.classList.add("opacity-100","scale-100")}),(e.querySelector("[data-mi]")??e).focus()}function c(){o.classList.add("opacity-0"),o.classList.remove("opacity-100"),e.classList.add("pm-leave-active"),e.classList.remove("pm-enter","pm-enter-active"),setTimeout(()=>{o.classList.add("pointer-events-none"),e.classList.add("pointer-events-none"),e.classList.remove("opacity-100","scale-100")},120)}o.addEventListener("click",c),window.addEventListener("resize",()=>{e.classList.contains("pointer-events-none")||m(i,e)}),window.addEventListener("scroll",()=>{e.classList.contains("pointer-events-none")||m(i,e)},!0),document.addEventListener("keydown",t=>{e.classList.contains("pointer-events-none")||(t.key==="Escape"&&(t.preventDefault(),c(),i.focus()),t.key==="Tab"&&h(t),(t.key==="ArrowDown"||t.key==="ArrowUp")&&(x(t.key==="ArrowDown"),t.preventDefault()))}),e.addEventListener("click",t=>{const a=t.target.closest("a[data-route]");if(!a)return;t.preventDefault();const s=a.dataset.route||"/";c(),f(s)});const l=e.querySelector("#logoutBtn");return l.addEventListener("click",async()=>{var t;try{l.disabled=!0,l.classList.add("opacity-70","cursor-wait"),await L(),c(),(t=n.onLogoutSuccess)==null||t.call(n),f("/accueil")}catch(a){alert(`Erreur de déconnexion : ${(a==null?void 0:a.message)||"inconnue"}`)}finally{l.disabled=!1,l.classList.remove("opacity-70","cursor-wait")}}),{open:b,close:c,destroy:()=>{o.remove(),e.remove()}};function v(){return Array.from(e.querySelectorAll("[data-mi]"))}function x(t){const a=v();if(!a.length)return;const s=a.indexOf(document.activeElement),d=s<0?0:t?(s+1)%a.length:(s-1+a.length)%a.length;a[d].focus()}function h(t){const a=v();if(!a.length)return;const s=a[0],d=a[a.length-1],g=document.activeElement;t.shiftKey&&g===s?(t.preventDefault(),d.focus()):!t.shiftKey&&g===d&&(t.preventDefault(),s.focus())}}function m(i,r){const n=i.getBoundingClientRect(),e=n.bottom+8,u=Math.max(8,window.innerWidth-n.right);r.style.top=`${Math.min(e,window.innerHeight-16)}px`,r.style.right=`${u}px`}function w(i){if(!i)return"/avatar/default.png";const r=i.trim();if(/^(https?:|data:|blob:)/i.test(r))return r;const n=r.replace(/^\/+/,"");return n==="default.png"?"/avatar/default.png":n.startsWith("avatar/")||n.includes("/")?"/"+n:"/avatar/"+n}function y(i){return i.replace(/[&<>"']/g,r=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[r])}export{A as attachProfileMenu};
