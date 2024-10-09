function renderNode(node) {
  if (node.text) {
    // Nếu node có thuộc tính `text`, nó là một đoạn văn bản, thêm các kiểu định dạng nếu có
    let text = node.text;
    if (node.bold) {
      text = `<strong>${text}</strong>`;
    }
    if (node.italic) {
      text = `<em>${text}</em>`;
    }
    if (node.code) {
      text = `<code>${text}</code>`;
    }
    return text;
  }

  // Xử lý các loại node khác nhau
  switch (node.type) {
    case "paragraph":
      return `<p>${node.children.map(renderNode).join("")}</p>`;
    case "link":
      const url = node.url;
      return `<a href="${url}">${node.children.map(renderNode).join("")}</a>`;
    case "block-quote":
      return `<blockquote>${node.children
        .map(renderNode)
        .join("")}</blockquote>`;
    default:
      return node.children.map(renderNode).join(""); // Render node con
  }
}

// Hàm để render toàn bộ document JSON thành HTML
export function renderJSONToHTML(json) {
  return json.map(renderNode).join("");
}
