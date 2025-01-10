import React, { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// Import các thành phần từ Quill
const Quill = ReactQuill.Quill;

// 1. Custom Inline Blot (Emphasis Format)
let Inline = Quill.import("blots/inline");
class EmphBlot extends Inline {
  static create(value) {
    let node = super.create();
    node.setAttribute("style", "font-size:150%; color: purple");
    node.setAttribute("src", value?.url || "");
    return node;
  }

  static value(node) {
    return {
      alt: node.getAttribute("alt"),
      url: node.getAttribute("src"),
    };
  }
}

EmphBlot.blotName = "em";
EmphBlot.tagName = "em";
EmphBlot.className = "custom-em";
Quill.register("formats/em", EmphBlot);

// 2. Custom Embed Blot (HR Tag)
let Embed = Quill.import("blots/block/embed");
class HrBlot extends Embed {
  static create(value) {
    let node = super.create(value);
    return node;
  }
}

HrBlot.blotName = "hr";
HrBlot.tagName = "hr";
Quill.register("formats/hr", HrBlot);

// 3. Editor Component
const Editor = ({ placeholder }) => {
  const [editorHtml, setEditorHtml] = useState("");
  const reactQuillRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (
      reactQuillRef.current &&
      typeof reactQuillRef.current.getEditor === "function"
    ) {
      quillRef.current = reactQuillRef.current.getEditor();
      console.log("Quill Editor Registered:", quillRef.current);
    }
  }, []);

  // Apply Emphasis Format
  const handleClickFormat = () => {
    if (quillRef.current) {
      const range = quillRef.current.getSelection();
      if (range) {
        quillRef.current.format("em", true);
      }
    }
  };

  // Insert HR
  const handleClickEmbed = () => {
    if (quillRef.current) {
      const range = quillRef.current.getSelection();
      if (range) {
        quillRef.current.insertEmbed(range.index, "hr", null);
      }
    }
  };

  return (
    <div>
      <ReactQuill
        ref={reactQuillRef}
        theme="snow"
        value={editorHtml}
        onChange={setEditorHtml}
        modules={{ toolbar: [] }}
        formats={["em", "hr"]}
        placeholder={placeholder}
      />
      <button onClick={handleClickFormat} className="border border-gray-300">
        Apply Emphasis Format
      </button>
      <button onClick={handleClickEmbed} className="border border-gray-300">
        Insert Hr Format
      </button>
    </div>
  );
};

// 4. Render the Editor Component
const App = () => (
  <div>
    <Editor placeholder="No standard formats are enabled..." />
    <p>
      <small>
        See also{" "}
        <a href="https://quilljs.com/guides/cloning-medium-with-parchment">
          Quill Documentation
        </a>
      </small>
    </p>
  </div>
);

export default App;
