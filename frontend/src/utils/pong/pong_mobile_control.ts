const mobile_controls: (container: HTMLElement) => void = (container) => {
	container.innerHTML = `  
	    <div id="mobile_controls">
      <button id="btn-up" class="text-3xl p-4 bg-blue-500 text-white rounded-full shadow">⬆️</button>
      <button id="btn-down" class="text-3xl p-4 bg-blue-500 text-white rounded-full shadow">⬇️</button>
    </div>
	`;
};

export default mobile_controls;