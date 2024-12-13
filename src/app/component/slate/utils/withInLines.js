import isUrl from "is-url";
import { wrapLink } from "./linkUtils";

export const withInLines = (editor) => {
  const { insertData, insertText, isInline, isElementReadOnly, isSelectable } =
    editor;
  editor.isInline = (element) =>
    ["link", "button", "badge", "emoji"].includes(element.type) ||
    isInline(element);
  editor.isElementReadOnly = (element) =>
    element.type === "badge" || isElementReadOnly(element);
  editor.isSelectable = (element) =>
    element.type !== "badge" && isSelectable(element);
  editor.insertText = (text) => {
    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertText(text);
    }
  };
  editor.insertData = (data) => {
    const text = data.getData("text/plain");
    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertData(data);
    }
  };
  return editor;
};
