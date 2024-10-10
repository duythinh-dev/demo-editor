function renderNode(node) {
  if (node.text) {
    // Nếu node có thuộc tính `text`, nó là một đoạn văn bản, thêm các kiểu định dạng nếu có
    let text = node.text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
  const alignStyle = node.align ? ` style="text-align: ${node.align};"` : "";
  // Xử lý các loại node khác nhau
  switch (node.type) {
    case "paragraph":
      return `<p${alignStyle}>${node.children.map(renderNode).join("")}</p>`;
    case "link":
      const url = node.url;
      return `<a href="${url}">${node.children.map(renderNode).join("")}</a>`;
    case "heading-two":
      return `<h2${alignStyle}>${node.children.map(renderNode).join("")}</h2>`;
    case "heading-one":
      return `<h1${alignStyle}>${node.children.map(renderNode).join("")}</h1>`;
    case "bulleted-list":
      return `<ul${alignStyle}>${node.children.map(renderNode).join("")}</ul>`;
    case "numbered-list":
      return `<ol${alignStyle}>${node.children.map(renderNode).join("")}</ol>`;
    case "list-item":
      return `<li${alignStyle}>${node.children.map(renderNode).join("")}</li>`;
    case "block-quote":
      return `<blockquote ${alignStyle}  >${node.children
        .map(renderNode)
        .join("")}</blockquote>`;
    default:
      return node.children ? node.children.map(renderNode).join("") : ""; // Render node con
  }
}

// Hàm để render toàn bộ document JSON thành HTML
export function renderJSONToHTML(json) {
  return json.map(renderNode).join("");
}
