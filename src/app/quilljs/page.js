"use client";

import React, { useState } from "react";
import Quilljs from "../component/quilljs";
import ReactQuilljs from "../component/reactQuilljs";
export default function Page() {
  const [value, setValue] = useState("");
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
        <Quilljs />
        <ReactQuilljs />
      </div>
    </div>
  );
}
