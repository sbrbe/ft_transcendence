export function q<T extends HTMLElement>(root: ParentNode, selector: string): T 
{
	const el = root.querySelector<T>(selector);
	if (!el) throw new Error(`Element not found: ${selector}`);
	return el;
}


export function getInputValue(root: ParentNode, selector: string) 
{
	return (root.querySelector<HTMLInputElement>(selector)?.value || '').trim();
}
