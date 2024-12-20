import { Transforms } from "slate";

export const insertEmoji = (editor, emoji) => {
  Transforms.insertNodes(editor, [
    {
      type: "emoji",
      emoji,
      children: [{ text: "" }],
    },
  ]);
};

export const insertImage = (editor, url) => {
  const text = { text: "" };
  const image = { type: "image", url, children: [text] };
  Transforms.insertNodes(editor, image);
  Transforms.insertNodes(editor, {
    type: "paragraph",
    children: [{ text: "" }],
  });
};

export const insertVideo = (editor, url) => {
  const text = { text: "" };
  const video = { type: "video", url, children: [text] };
  Transforms.insertNodes(editor, video);
  Transforms.insertNodes(editor, {
    type: "paragraph",
    children: [{ text: "" }],
  });
};
