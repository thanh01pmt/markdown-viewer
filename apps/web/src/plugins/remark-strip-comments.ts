import { visit, SKIP } from 'unist-util-visit';
import type { Root } from 'mdast';
import type { Plugin } from 'unified';

export const remarkStripComments: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'html', (node: any, index, parent: any) => {
      if (node.value && node.value.startsWith('<!--') && node.value.endsWith('-->')) {
        parent.children.splice(index, 1);
        return [SKIP, index];
      }
    });
  };
};

