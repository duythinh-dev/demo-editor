import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import { isWhitespace } from "../quilljs/Editor";
import ImageUploader from "quill-image-uploader";

import "quill-image-uploader/dist/quill.imageUploader.min.css";
import axios from "axios";

// 1. Custom Inline Blot (Emphasis Format)
let Inline = Quill.import("blots/inline");
class EmphBlot extends Inline {
  static tagName = ["EM", "nor"];
  static create(value) {
    let node = super.create();
    node.setAttribute("style", "font-size:150%; ");
    node.setAttribute("src", value?.url || "");
    return node;
  }

  static value(node) {
    return {
      alt: node.getAttribute("alt"),
      url: node.getAttribute("src"),
    };
  }

  optimize(context) {
    super.optimize(context);
  }
}

EmphBlot.blotName = "em";
EmphBlot.tagName = "em";
EmphBlot.className = "custom-em";
Quill.register("formats/em", EmphBlot);

/*
 * Custom "star" icon for the toolbar using an Octicon
 */
const CustomButton = () => <span className="octicon octicon-star">★</span>;

/*
 * Event handler to be attached using Quill toolbar module
 */
const insertStar = function () {
  const cursorPosition = this.quill.getSelection().index;
  this.quill.insertText(cursorPosition, "★");
  this.quill.setSelection(cursorPosition + 1);
};

/*
 * Custom toolbar component including insertStar button and dropdowns
 */
const CustomToolbar = ({ handleClickHighlight }) => (
  <div id="toolbar">
    <select className="ql-header" defaultValue="">
      <option value="1"></option>
      <option value="2"></option>
      <option value=""></option>
    </select>
    <button className="ql-bold"></button>
    <button className="ql-italic"></button>
    <select className="ql-color">
      <option value="red"></option>
      <option value="green"></option>
      <option value="blue"></option>
      <option value="orange"></option>
      <option value="violet"></option>
      <option value="#d0d1d2"></option>
      <option value=""></option>
    </select>
    <select className="ql-background">
      <option value="red"></option>
      <option value="green"></option>
      <option value="blue"></option>
      <option value="orange"></option>
      <option value="violet"></option>
      <option value="#d0d1d2"></option>
      <option value=""></option>
    </select>
    <button className="ql-em">Ém</button>
    <button className="ql-image"></button>
    <button className="ql-video"></button>
    <button className="ql-link"></button>
    <button className="ql-insertStar">
      <CustomButton />
    </button>
    <button onClick={handleClickHighlight}>Highlight</button>
  </div>
);

Quill.register("modules/imageUploader", ImageUploader);

const modules = {
  toolbar: "#toolbar",
  imageUploader: {
    upload: async (file) => {
      const fileReader = new FileReader();
      const apiKey = "6d207e02198a847aa98d0a2a901485a5"; // API Key của bạn
      const apiURL =
        "https://freeimage.host/api/1/upload?key=6d207e02198a847aa98d0a2a901485a5";
      // Chuẩn bị dữ liệu cần gửi

      // Lấy URL từ response
      // console.log("imageUrl", imageUrl);
      return new Promise((resolve, reject) => {
        fileReader.addEventListener(
          "load",
          async () => {
            let base64ImageSrc = fileReader.result;
            console.log("base64ImageSrc", base64ImageSrc);

            const formData = new FormData();
            // formData.append("key", apiKey); // Thêm API Key
            formData.append("action", "upload"); // Hành động là upload
            formData.append("source", base64ImageSrc); // File cần upload
            console.log("Form Data:", formData.get("source"));
            try {
              // Gửi yêu cầu POST
              const response = await axios.post(apiURL, formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              });

              // Kiểm tra phản hồi từ API
              if (response.data.status_code === 200) {
                console.log("Image URL:", response.data.image.url);
                //  response.data.image.url; // Trả về URL hình ảnh
              } else {
                console.error("Upload failed:", response.data);
                throw new Error(
                  response.data.error.message || "Upload failed."
                );
              }
            } catch (error) {
              console.error("Error uploading image:", error);
              // throw error;
            }
            setTimeout(() => {
              // Return a image src for form editor
              resolve(base64ImageSrc);
              //reject('Issue uploading file');
            }, 1500);
          },
          false
        );

        if (file) {
          fileReader.readAsDataURL(file);
        } else {
          reject("No file selected");
        }
      });
    },
  },
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "video",
  "color",
  "background",
  "em",
];
/*
 * Editor component
 */
const Editor = ({ placeholder }) => {
  const [editorHtml, setEditorHtml] = useState("");
  const [range, setRange] = useState();
  const [lastChange, setLastChange] = useState();

  const reactQuillRef = useRef(null);
  const quillRef = useRef(null);

  const refCt = useRef(null);

  // Quill modules configuration

  useEffect(() => {
    if (
      reactQuillRef.current &&
      typeof reactQuillRef.current.getEditor === "function"
    ) {
      quillRef.current = reactQuillRef.current.getEditor();
      console.log("Quill Editor Registered:", quillRef.current);
    }
  }, []);

  useEffect(() => {
    if (reactQuillRef.current) {
      console.log("reactQuillRef.current", Quill.getModule);
      const quill = reactQuillRef.current.editor;
      // console.log("quill", quill);
      console.log("quill.getContents", quill.getContents());
      quill.on(Quill.events.TEXT_CHANGE, (delta, oldDelta, source) => {
        // const regex = /https?:\/\/[^\s]+/;

        // console.log("delta", delta.ops);
        // if (
        //   delta.ops.length === 2 &&
        //   delta.ops[0].retain &&
        //   isWhitespace(delta.ops[1].insert) &&
        //   !delta.ops?.[2]?.delete
        // ) {
        //   const endRetain = delta.ops[0].retain;
        //   const text = quill.getText().substr(0, endRetain);
        //   const match = text.match(regex);
        //   console.log("/ext", match);

        //   if (match !== null) {
        //     const url = match[0];

        //     let ops = [];
        //     if (endRetain > url.length) {
        //       ops.push({ retain: endRetain - url.length });
        //     }

        //     ops = ops.concat([
        //       { delete: url.length },
        //       { insert: url, attributes: { link: url } },
        //     ]);

        //     quill.updateContents({
        //       ops: ops,
        //     });
        //   }
        // }
        setLastChange(delta);
      });

      quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
        setRange(...args);
      });
      quill.on(Quill.events.EDITOR_CHANGE, (...args) => {
        console.log("args", args);
        // setRange(...args);
      });
    }
  }, []);

  // Apply Emphasis Format
  const handleClickFormat = () => {
    if (quillRef.current) {
      const range = quillRef.current.getSelection();
      const index = range?.index;
      console.log("range", range);
      const format = quillRef.current.getFormat();
      console.log("format", format, quillRef.current);
      if (range) {
        if (format?.em) {
          console.log("removeFormat", index);
          quillRef.current.format("em", false);
          quillRef.current.format("color", "black");
          quillRef.current.off();
        } else {
          quillRef.current.format("em", true);
        }
      }
    }
  };

  return (
    <div className="text-editor">
      <CustomToolbar handleClickHighlight={handleClickFormat} />
      {/* <ReactQuill
        value={editorHtml}
        onChange={setEditorHtml}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        theme="snow"
      /> */}
      <ReactQuill
        theme="snow"
        ref={reactQuillRef}
        formats={formats}
        modules={modules}
        onChange={setEditorHtml}
        value={editorHtml}
      />
      <div className="my-2">
        <div className="text-sm text-gray-500 uppercase">Current Range:</div>
        {range ? JSON.stringify(range) : "Empty"}
      </div>
      <div className="my-2">
        <div className="text-sm text-gray-500 uppercase">Last Change:</div>
        {lastChange ? JSON.stringify(lastChange) : "Empty"}
      </div>

      <div className="my-2">
        <div className="text-sm text-gray-500 uppercase">Editor HTML:</div>
        {editorHtml}
      </div>
    </div>
  );
};

/*
 * Render component
 */
const App = () => {
  return <Editor placeholder="Write something or insert a star ★" />;
};

export default App;
