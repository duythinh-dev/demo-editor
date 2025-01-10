import Quill from "quill";
import React, { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
export const isWhitespace = (str) => {
  console.log("str", str);
  if (!str || typeof str !== "string") return false;
  return str.trim() === "";
};
// Editor is an uncontrolled React component
const Editor = forwardRef(
  ({ readOnly, defaultValue, onTextChange, onSelectionChange }, ref) => {
    const containerRef = useRef(null);
    const defaultValueRef = useRef(defaultValue);
    const onTextChangeRef = useRef(onTextChange);
    const onSelectionChangeRef = useRef(onSelectionChange);

    useLayoutEffect(() => {
      onTextChangeRef.current = onTextChange;
      onSelectionChangeRef.current = onSelectionChange;
    });

    useEffect(() => {
      ref.current?.enable(!readOnly);
    }, [ref, readOnly]);

    useEffect(() => {
      const container = containerRef.current;
      const editorContainer = container.appendChild(
        container.ownerDocument.createElement("div")
      );
      const quill = new Quill(editorContainer, {
        theme: "snow",
      });

      ref.current = quill;

      if (defaultValueRef.current) {
        quill.setContents(defaultValueRef.current);
      }

      quill.on(Quill.events.TEXT_CHANGE, (delta, oldDelta, source) => {
        const regex = /https?:\/\/[^\s]+(?:\s+[^\s]+)*$/;
        if (
          delta.ops.length === 2 &&
          delta.ops[0].retain &&
          isWhitespace(delta.ops[1].insert)
        ) {
          const endRetain = delta.ops[0].retain;
          const text = quill.getText().substr(0, endRetain);
          const match = text.match(regex);
          console.log("/ext", match);

          if (match !== null) {
            const url = match[0];

            let ops = [];
            if (endRetain > url.length) {
              ops.push({ retain: endRetain - url.length });
            }

            ops = ops.concat([
              { delete: url.length },
              { insert: url, attributes: { link: url } },
            ]);

            quill.updateContents({
              ops: ops,
            });
          }
        }
        onTextChangeRef.current?.(delta, oldDelta, source);
      });

      quill.on(Quill.events.SELECTION_CHANGE, (...args) => {
        onSelectionChangeRef.current?.(...args);
      });

      return () => {
        ref.current = null;
        container.innerHTML = "";
      };
    }, [ref]);

    return <div ref={containerRef}></div>;
  }
);

Editor.displayName = "Editor";

export default Editor;
