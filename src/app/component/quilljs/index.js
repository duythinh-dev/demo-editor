"use client";

import React, { useRef, useState } from "react";
import Editor from "./Editor";
import "quill/dist/quill.snow.css";

import Quill from "quill/core";

import Toolbar from "quill/modules/toolbar";
import Snow from "quill/themes/snow";

import Bold from "quill/formats/bold";
import Italic from "quill/formats/italic";
import Header from "quill/formats/header";
import Link from "quill/formats/link";
import "./Custom/highlight";
import PlainListItem from "../reactQuilljs/Custom/bold";
import Image from "quill/formats/image";
export default function Quilljs() {
  const quillRef = useRef();
  Quill.register({
    "modules/toolbar": Toolbar,
    "themes/snow": Snow,
    "formats/bold": Bold,
    "formats/italic": Italic,
    "formats/header": Header,
    "formats/link": Link,
    "formats/list": PlainListItem,
    "formats/image": Image,
  });
  const Delta = Quill.import("delta");

  const [range, setRange] = useState();
  const [lastChange, setLastChange] = useState();
  const [readOnly, setReadOnly] = useState(false);

  return (
    <div>
      <Editor
        ref={quillRef}
        readOnly={readOnly}
        defaultValue={new Delta()
          .insert("Hello")
          .insert("\n", { header: 1 })
          .insert("Some ")
          .insert("initial", { bold: true })
          .insert(" ")
          .insert("content", { underline: true })
          .insert("\n")}
        onSelectionChange={setRange}
        onTextChange={setLastChange}
      />
      <div className="flex border border-gray-300 rounded-md">
        <label>
          Read Only:{" "}
          <input
            type="checkbox"
            value={readOnly}
            onChange={(e) => setReadOnly(e.target.checked)}
          />
        </label>
        <button
          className="ml-auto"
          type="button"
          onClick={() => {
            alert(quillRef.current?.getLength());
          }}
        >
          Get Content Length
        </button>
      </div>
      <div className="my-2">
        <div className="text-sm text-gray-500 uppercase">Current Range:</div>
        {range ? JSON.stringify(range) : "Empty"}
      </div>
      <div className="my-2">
        <div className="text-sm text-gray-500 uppercase">Last Change:</div>
        {lastChange ? JSON.stringify(lastChange.ops) : "Empty"}
      </div>
    </div>
  );
}
