const friends: (container: HTMLElement) => void = (container) => {
  container.innerHTML = `
    <div class="container-page my-10">
      <div class="mx-auto max-w-lg rounded-2xl border shadow-sm bg-white/70 backdrop-blur px-8 py-10 text-center">
        <div class="text-3xl font-bold">Page Friends [A faire]</div>
      </div>
    </div>
  `;
};

export default friends;
