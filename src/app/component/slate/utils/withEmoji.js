export const withEmoji = (editor) => {
  const { isVoid } = editor;
  editor.isVoid = (element) =>
    element.type === "emoji" ? true : isVoid(element);
  return editor;
};
