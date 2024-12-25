"use client";

import React, { useState } from "react";
import { renderJSONToHTML } from "./helper";
import RichTextExample from "../component/slate";
const initialValue = [
  {
    type: "paragraph",
    children: [
      { text: "This is editable " },
      { text: "rich", bold: true },
      { text: " text, " },
      { text: "much", italic: true },
      { text: " better than a " },
      { text: "<div></div> ! !" },
    ],
  },
  {
    type: "tag",
    children: [{ text: "tag" }],
  },
  {
    type: "paragraph",
    children: [
      {
        text: "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: "bold", bold: true },
      {
        text: ", or add a semantically rendered block quote in the middle of the page, like this:",
      },
    ],
  },
  {
    type: "block-quote",
    children: [{ text: "A wise quote." }],
  },
  {
    type: "paragraph",
    align: "center",
    children: [{ text: "Try it out for yourself!" }],
  },
];
export default function Page() {
  const [value, setValue] = useState(initialValue);
  const handleChange = (value) => {
    setValue(value);
  };

  return (
    <div className="max-w-3xl py-4 m-auto">
      <h1 className="text-2xl font-bold">Slate Editor</h1>
      <p className="text-sm text-gray-500">
        Doc: <a href="https://docs.slatejs.org/">https://docs.slatejs.org/</a>
      </p>
      <span className="text-xl font-bold text-gray-500">Editor:</span>
      <div className="p-4 mt-4 border border-gray-300 rounded-md">
        <RichTextExample onChange={handleChange} initialValue={value} />
      </div>
      <div className="mt-4">
        <span className="text-xl font-bold text-gray-500 ">Review output:</span>
        <div className="p-4 mt-4 bg-gray-100 rounded-md">
          <pre>{JSON.stringify(value, null, 2)}</pre>
        </div>
      </div>
      <div className="mt-4">
        <div className="text-xl font-bold text-gray-500">Render as MDX:</div>
        <div className="p-4 mt-4 bg-gray-100 rounded-md">
          <div dangerouslySetInnerHTML={{ __html: renderJSONToHTML(value) }} />
        </div>
      </div>
    </div>
  );
}
