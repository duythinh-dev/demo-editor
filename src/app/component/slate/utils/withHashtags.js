import { Text } from "slate";
import { Transforms } from "slate";

export const withHashtags = (editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    // Chỉ xử lý các nút văn bản
    if (!Text.isText(node)) {
      return normalizeNode(entry);
    }

    // Lấy nội dung văn bản hiện tại
    const text = node.text;

    // Tìm tất cả các hashtag trong văn bản
    const matches = Array.from(text.matchAll(/#\w+/g));

    // Nếu không có hashtag hoặc nút đã được định dạng đúng, tiếp tục chuẩn hóa
    if (matches.length === 0) {
      // Xóa định dạng hashtag nếu không có hashtag
      if (node.hashtag) {
        Transforms.setNodes(editor, { hashtag: false }, { at: path });
      }
      return normalizeNode(entry);
    }

    // Xử lý từng kết quả khớp, bắt đầu từ kết quả cuối cùng để tránh vấn đề về độ lệch
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      const start = match.index;
      const end = start + match[0].length;

      // Tách văn bản và áp dụng định dạng hashtag chỉ cho phần hashtag
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
