"use client";

import React, { useState } from "react";
import { ForwardRefEditor } from "../component/MdxEditor";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
  headingsPlugin,
  imagePlugin,
  InsertImage,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  quotePlugin,
  ShowSandpackInfo,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";
import { imageUploadHandler } from "./helper";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

export default function Home() {
  const [markdownState, setMarkdownState] = useState("");
  const ref = React.useRef(null);

  const markdown = `
# Hello world
* Item 1
* Item 2
* Item 3
  * nested item
1. Item 1
2. Item 2

Hello [world](https://virtuoso.dev/)
`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 pt-10">
      <div>
        Document:{" "}
        <a href="https://mdxeditor.dev/" target="_blank">
          https://mdxeditor.dev/
        </a>
      </div>
      <div className="flex gap-4">
        <button
          className="px-4 py-2 text-white bg-blue-500 rounded-md"
          onClick={() =>
            ref.current?.insertMarkdown("* new markdown to insert")
          }
        >
          Insert Text
        </button>
        <button
          className="px-4 py-2 text-white bg-blue-500 rounded-md"
          onClick={() => setMarkdownState(ref.current?.getMarkdown())}
        >
          Get markdown
        </button>
      </div>
      <div className="overflow-hidden border border-gray-300 rounded-md max-w-[1200px] w-full min-h-[500px]">
        <ForwardRefEditor
          ref={ref}
          markdown={markdown}
          contentEditableClassName="w-full h-[500px] overflow-y-scroll "
          plugins={[
            toolbarPlugin({
              toolbarContents: () => (
                <>
                  <UndoRedo />
                  <BlockTypeSelect />
                  <BoldItalicUnderlineToggles />
                  <ListsToggle />
                  <CodeToggle />
                  <CreateLink />
                  <InsertImage />
                  <DiffSourceToggleWrapper></DiffSourceToggleWrapper>
                </>
              ),
            }),
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            markdownShortcutPlugin(),
            diffSourcePlugin({
              diffMarkdown: markdown,
              viewMode: "rich-text",
            }),

            linkPlugin(),
            linkDialogPlugin({
              linkAutocompleteSuggestions: [
                "https://virtuoso.dev",
                "https://mdxeditor.dev",
              ],
            }),
            imagePlugin({
              imageUploadHandler,
              imageAutocompleteSuggestions: [
                "https://picsum.photos/200/300",
                "https://picsum.photos/200",
              ],
            }),
          ]}
        />
      </div>
      {markdownState ? (
        <div className="flex flex-col gap-4 mb-10">
          <h1>Markdown result</h1>
          <pre className="p-4 text-black bg-gray-100 rounded-md">
            {markdownState}
          </pre>
          <h1>Markdown preview</h1>
          <div className="p-4 mb-10 border border-gray-300 rounded-md">
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
              {markdownState}
            </ReactMarkdown>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
