"use client";

import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  directivesPlugin,
  codeMirrorPlugin,
  linkDialogPlugin,
  diffSourcePlugin,
  linkPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

export default function InitializedMDXEditor({ editorRef, ...props }) {
  return <MDXEditor plugins={[headingsPlugin()]} {...props} ref={editorRef} />;
}
