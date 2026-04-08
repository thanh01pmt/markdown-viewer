/**
 * Rehype plugin to transform HTML into Reveal.js slide structure
 * 
 * This plugin:
 * - Converts H1 headers into horizontal slides (top-level sections)
 * - Converts H2 headers into vertical slides (nested sections)
 * - Ignores horizontal rules (hr tags) for slide separation
 */

import type { Element, ElementContent, Root, RootContent } from 'hast';
import type { Plugin } from 'unified';

export const rehypeSlides: Plugin<[], Root> = () => (tree, file) => {
	// Get file path from VFile
	const filePath = file.history[0] || file.path || '';
	
	// Only process files from the slides collection
	if (!filePath.includes('/slides/') && !filePath.includes('\\slides\\')) {
		return;
	}

	const newChildren: RootContent[] = [];
	let currentSlide: ElementContent[] = [];

	for (const node of tree.children) {
		if (node.type === 'element' && node.tagName === 'hr') {
			// When we hit an HR, close the current slide and start a new one
			if (currentSlide.length > 0) {
				newChildren.push({
					type: 'element',
					tagName: 'section',
					properties: {},
					children: currentSlide
				});
				currentSlide = [];
			}
			continue;
		}

		// Add non-hr elements and other nodes (text, comment) to the current slide
		currentSlide.push(node as ElementContent);
	}

	// Add the last slide if it has content
	if (currentSlide.length > 0) {
		newChildren.push({
			type: 'element',
			tagName: 'section',
			properties: {},
			children: currentSlide
		});
	}

	tree.children = newChildren;
};
