import Quill from "quill";

let Inline = Quill.import("blots/inline");

class HighlightBlot extends Inline {
  static create(value) {
    let node = super.create();
    console.log(node);
    node.style.backgroundColor = value || "yellow"; // Mặc định màu nền là vàng
    return node;
  }

  static formats(node) {
    console.log("formats", node);
    return node.style.backgroundColor;
  }
}

HighlightBlot.blotName = "highlight";
HighlightBlot.tagName = "span";
HighlightBlot.className = "highlight";

Quill.register(HighlightBlot, true);
