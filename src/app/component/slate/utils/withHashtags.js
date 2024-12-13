import { Text } from "slate";
import { Transforms } from "slate";

export const withHashtags = (editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    // Only process text nodes
    if (!Text.isText(node)) {
      return normalizeNode(entry);
    }

    // Get the current text content
    const text = node.text;

    // Find all hashtags in the text
    const matches = Array.from(text.matchAll(/#\w+/g));

    // If no hashtags or the node is already properly formatted, continue normalization
    if (matches.length === 0) {
      // Clear hashtag formatting if there's no hashtag
      if (node.hashtag) {
        Transforms.setNodes(editor, { hashtag: false }, { at: path });
      }
      return normalizeNode(entry);
    }

    // Process each match, starting from the last one to avoid offset issues
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      const start = match.index;
      const end = start + match[0].length;

      // Split the text and apply hashtag formatting only to the hashtag part
      Transforms.splitNodes(editor, {
        at: { path, offset: end },
        match: Text.isText,
      });
      Transforms.splitNodes(editor, {
        at: { path, offset: start },
        match: Text.isText,
      });

      Transforms.setNodes(
        editor,
        { hashtag: true },
        {
          at: {
            anchor: { path, offset: start },
            focus: { path, offset: end },
          },
          match: Text.isText,
        }
      );
    }

    normalizeNode(entry);
  };

  return editor;
};
