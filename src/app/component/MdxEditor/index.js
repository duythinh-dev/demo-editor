"use client";

import dynamic from "next/dynamic";
import { forwardRef } from "react";
const Editor = dynamic(() => import("./InitializedMDXEditor"), {
  ssr: false,
});

export const ForwardRefEditor = forwardRef((props, ref) => (
  <Editor {...props} editorRef={ref} />
));

ForwardRefEditor.displayName = "ForwardRefEditor";
