const Home: (container: HTMLElement) => void = (container) => {
	container.innerHTML = `
<div class="container-page my-12">
			<section class="grid gap-10 md:grid-cols-2 items-center">

<!-- Colonne gauche : titre + texte + CTA -->
				<div class="space-y-5">
					<h1 class="text-4xl md:text-5xl font-extrabold leading-tight">
						Pong - Join the game !
					</h1>

					<p class="text-gray-600 max-w-prose">
					Sharpen your reflexes and challenge your friends. 
					Simple gameplay, fast matches. 
					Right in your browser.
					</p>

					<div>
						<a href="#/pong" data-route="/pong"
							 class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3
											text-white font-medium shadow hover:bg-blue-700 active:bg-blue-800
											focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 transition">
							Play now
						</a>
					</div>
				</div>

<!-- Colonne droite : image -->
			<div class="relative flex justify-center md:justify-end">
				<div class="w-[360px] md:w-[440px] overflow-hidden rounded-2xl border shadow-sm">
					<img src="/site/pong.gif" alt="Aperçu du jeu Pong"
							class="w-full h-auto object-cover">
				</div>
			</div>
			</section>

	
		</div>
	`;
};

export default Home;
