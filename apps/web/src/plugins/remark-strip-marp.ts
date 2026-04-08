import { SKIP } from 'unist-util-visit';
import type { Root } from 'mdast';
import type { Plugin } from 'unified';

export const remarkStripMarp: Plugin<[], Root> = () => {
  return (tree) => {
    // We are looking for a sequence at the start of the file:
    // thematicBreak, then some nodes, then thematicBreak.
    // If somewhere in those nodes there is text that mentions "marp:", we rip out the whole block.
    
    // First, check if the first node is a thematicBreak
    if (tree.children.length === 0 || tree.children[0].type !== 'thematicBreak') {
      return;
    }

    // Find the next thematicBreak
    let nextBreakIndex = -1;
    for (let i = 1; i < tree.children.length; i++) {
      if (tree.children[i].type === 'thematicBreak') {
        nextBreakIndex = i;
        break;
      }
    }

    if (nextBreakIndex === -1) {
      return; // No closing thematic break found
    }

    // Check if any of the text within this block indicates it's Marp frontmatter
    let isMarp = false;
    for (let i = 1; i < nextBreakIndex; i++) {
      const node = tree.children[i] as any;
      // Convert node to string to check for 'marp:'
      const text = JSON.stringify(node);
      if (text.includes('"marp:"') || text.includes('marp: true')) {
        isMarp = true;
        break;
      }
    }

    if (isMarp) {
      // Remove all elements from 0 to nextBreakIndex (inclusive)
      tree.children.splice(0, nextBreakIndex + 1);
    }
  };
};
