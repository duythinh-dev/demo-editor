import Quill from "quill/core";

let Inline = Quill.import("blots/inline");

class HighlightBlot extends Inline {
  static create(value) {
    let node = super.create();
    node.style.backgroundColor = value || "yellow"; // Mặc định màu nền là vàng
    return node;
  }

  static formats(node) {
    return node.style.backgroundColor;
  }
}

HighlightBlot.blotName = "custom-highlight";
HighlightBlot.tagName = "span";
HighlightBlot.className = "custom-highlight";

Quill.register(HighlightBlot, true);
