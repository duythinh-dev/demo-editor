"use client";

import { Button, Icon, Portal, Toolbar } from "../component/slate";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import isHotkey, { isKeyHotkey } from "is-hotkey";
import {
  Editable,
  withReact,
  useSlate,
  Slate,
  useSlateStatic,
  ReactEditor,
  useSelected,
  useFocused,
} from "slate-react";
import isUrl from "is-url";
// import icons
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import CodeIcon from "@mui/icons-material/Code";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import BackupIcon from "@mui/icons-material/Backup";
import InsertLinkIcon from "@mui/icons-material/InsertLink";
import AddLinkIcon from "@mui/icons-material/AddLink";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import CloseIcon from "@mui/icons-material/Close";
import {
  Editor,
  Transforms,
  createEditor,
  Element as SlateElement,
  Range,
} from "slate";
import { withHistory } from "slate-history";
import Image from "next/image";
import { css } from "@emotion/css";
import { Dialog, DialogContent, DialogTitle, TextField } from "@mui/material";
import { renderJSONToHTML } from "./helper";
import { CHARACTERS } from "../component/slate/constant";
import { IS_MAC } from "../component/utils/environment";

const allowedSchemes = ["http:", "https:"];

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
};
const LIST_TYPES = ["numbered-list", "bulleted-list"];
const TEXT_ALIGN_TYPES = ["left", "center", "right", "justify"];
const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? "align" : "type"
  );
  const isList = LIST_TYPES.includes(format);
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  });
  let newProperties;
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      type: isActive ? "paragraph" : isList ? "list-item" : format,
    };
  }
  Transforms.setNodes(editor, newProperties);
  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};
const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};
const isBlockActive = (editor, format, blockType = "type") => {
  const { selection } = editor;
  if (!selection) return false;
  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType] === format,
    })
  );
  return !!match;
};
const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};
const ImageRender = ({ attributes, children, element, editor }) => {
  const path = ReactEditor.findPath(editor, element);
  const selected = useSelected();
  const focused = useFocused();
  return (
    <div {...attributes}>
      {children}
      <div
        contentEditable={false}
        className={css`
          position: relative;
        `}
      >
        <Image
          src={element.url}
          width={100}
          height={100}
          className={css`
            display: block;
            max-width: 100%;
            max-height: 20em;
            box-shadow: ${selected && focused ? "0 0 0 3px #B4D5FF" : "none"};
          `}
          alt="image"
        />
        <Button
          active
          onClick={() => Transforms.removeNodes(editor, { at: path })}
          className={css`
            display: "inline";
            position: absolute;
            top: 0.5em;
            left: 0.5em;
            background-color: white;
          `}
        >
          <CloseIcon />
        </Button>
      </div>
    </div>
  );
};

const ButtonLink = ({ format, icon }) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const editor = useSlate();
  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Insert Link</DialogTitle>
        <DialogContent>
          <TextField
            label="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button
            onClick={() => {
              setOpen(false);
              toggleBlock(editor, format, url);
            }}
          >
            Insert
          </Button>
        </DialogContent>
      </Dialog>

      <Button
        active={isBlockActive(editor, format)}
        onClick={() => setOpen(true)}
      >
        <Icon>{icon}</Icon>
      </Button>
    </>
  );
};

const VideoElement = ({ attributes, children, element }) => {
  const editor = useSlateStatic();
  const { url } = element;
  const safeUrl = useMemo(() => {
    let parsedUrl = null;
    try {
      parsedUrl = new URL(url);
      // eslint-disable-next-line no-empty
    } catch {}
    if (parsedUrl && allowedSchemes.includes(parsedUrl.protocol)) {
      return parsedUrl.href;
    }
    return "about:blank";
  }, [url]);

  const UrlInput = ({ url, onChange }) => {
    const [value, setValue] = React.useState(url);
    return (
      <input
        value={value}
        onClick={(e) => e.stopPropagation()}
        style={{
          marginTop: "5px",
          boxSizing: "border-box",
        }}
        onChange={(e) => {
          const newUrl = e.target.value;
          setValue(newUrl);
          onChange(newUrl);
        }}
      />
    );
  };

  return (
    <div {...attributes}>
      <div contentEditable={false}>
        <div
          style={{
            padding: "75% 0 0 0",
            position: "relative",
          }}
        >
          <iframe
            src={`${safeUrl}?title=0&byline=0&portrait=0`}
            frameBorder="0"
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              width: "100%",
              height: "100%",
            }}
          />
        </div>
        <UrlInput
          url={url}
          onChange={(val) => {
            const path = ReactEditor.findPath(editor, element);
            const newProperties = {
              url: val,
            };
            Transforms.setNodes(editor, newProperties, {
              at: path,
            });
          }}
        />
      </div>
      {children}
    </div>
  );
};

const Element = ({ attributes, children, element, editor }) => {
  const style = { textAlign: element.align };
  switch (element.type) {
    case "image":
      return <ImageRender {...attributes} element={element} editor={editor} />;
    case "video":
      return <VideoElement {...attributes} element={element} editor={editor} />;
    case "mention":
      return <Mention {...attributes} element={element} editor={editor} />;
    case "block-quote":
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      );
    case "bulleted-list":
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      );
    case "heading-one":
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      );
    case "list-item":
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      );
    case "numbered-list":
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      );
    case "link":
      return (
        <a {...attributes} href={element.url}>
          {children}
        </a>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
};
const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  if (leaf.code) {
    children = <code>{children}</code>;
  }
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }
  return <span {...attributes}>{children}</span>;
};
const BlockButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(format) ? "align" : "type"
      )}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const insertImage = (editor, url) => {
  const text = { text: "" };
  const image = { type: "image", url, children: [text] };
  Transforms.insertNodes(editor, image);
  Transforms.insertNodes(editor, {
    type: "paragraph",
    children: [{ text: "" }],
  });
};

const ButtonUpload = ({ editor }) => {
  console.log(editor);
  const onChange = (event) => {
    event.preventDefault();
    for (const file of event.target.files) {
      const reader = new FileReader();
      const [mime] = file.type.split("/");
      if (mime !== "image") continue;

      reader.onload = (e) => {
        const src = e.target.result;
        insertImage(editor, src);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = null;
  };
  return (
    <Button>
      <label htmlFor="file-input" className=" image-icon">
        <BackupIcon fontSize="medium" />
      </label>

      <input
        id="file-input"
        accept="image/*"
        type="file"
        hidden
        onChange={onChange}
      />
    </Button>
  );
};
const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  );
};

const withMentions = (editor) => {
  const { isInline, isVoid, markableVoid } = editor;
  editor.isInline = (element) => {
    return element.type === "mention" ? true : isInline(element);
  };
  editor.isVoid = (element) => {
    return element.type === "mention" ? true : isVoid(element);
  };
  editor.markableVoid = (element) => {
    return element.type === "mention" || markableVoid(element);
  };
  return editor;
};
const insertMention = (editor, character) => {
  const mention = {
    type: "mention",
    character,
    children: [{ text: "" }],
  };
  Transforms.insertNodes(editor, mention);
  Transforms.move(editor);
};

const Mention = ({ attributes, children, element }) => {
  const selected = useSelected();
  const focused = useFocused();
  const style = {
    padding: "3px 3px 2px",
    margin: "0 1px",
    verticalAlign: "baseline",
    display: "inline-block",
    borderRadius: "4px",
    backgroundColor: "#eee",
    fontSize: "0.9em",
    boxShadow: selected && focused ? "0 0 0 2px #B4D5FF" : "none",
  };
  // See if our empty text child has any styling marks applied and apply those
  if (element.children[0].bold) {
    style.fontWeight = "bold";
  }
  if (element.children[0].italic) {
    style.fontStyle = "italic";
  }
  return (
    <span
      {...attributes}
      contentEditable={false}
      data-cy={`mention-${element.character.replace(" ", "-")}`}
      style={style}
    >
      {/* Prevent Chromium from interrupting IME when moving the cursor */}
      {/* 1. span + inline-block 2. div + contenteditable=false */}
      <div contentEditable={false}>
        {IS_MAC ? (
          // Mac OS IME https://github.com/ianstormtaylor/slate/issues/3490
          <>
            {children}@{element.character}
          </>
        ) : (
          // Others like Android https://github.com/ianstormtaylor/slate/pull/5360
          <>
            @{element.character}
            {children}
          </>
        )}
      </div>
    </span>
  );
};

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
  {
    type: "video",
    url: "https://player.vimeo.com/video/26689853",
    children: [{ text: "" }],
  },
];

const withImages = (editor) => {
  const { insertData, isVoid } = editor;
  editor.isVoid = (element) => {
    return element.type === "image" ? true : isVoid(element);
  };
  editor.insertData = (data) => {
    const text = data.getData("text/plain");
    const { files } = data;
    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader();
        const [mime] = file.type.split("/");
        if (mime === "image") {
          reader.addEventListener("load", () => {
            const url = reader.result;
            insertImage(editor, url);
          });
          reader.readAsDataURL(file);
        }
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, text);
    } else {
      insertData(data);
    }
  };
  return editor;
};

const unwrapLink = (editor) => {
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link",
  });
};

const isLinkActive = (editor) => {
  const [link] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link",
  });
  return !!link;
};

const wrapLink = (editor, url) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }
  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link = {
    type: "link",
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };
  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: "end" });
  }
};

const withEmbeds = (editor) => {
  const { isVoid } = editor;
  editor.isVoid = (element) =>
    element.type === "video" ? true : isVoid(element);
  return editor;
};

const withInLines = (editor) => {
  const { insertData, insertText, isInline, isElementReadOnly, isSelectable } =
    editor;
  editor.isInline = (element) =>
    ["link", "button", "badge"].includes(element.type) || isInline(element);
  editor.isElementReadOnly = (element) =>
    element.type === "badge" || isElementReadOnly(element);
  editor.isSelectable = (element) =>
    element.type !== "badge" && isSelectable(element);
  editor.insertText = (text) => {
    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertText(text);
    }
  };
  editor.insertData = (data) => {
    const text = data.getData("text/plain");
    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertData(data);
    }
  };
  return editor;
};

const insertLink = (editor, url) => {
  if (editor.selection) {
    wrapLink(editor, url);
  }
};

const AddLinkButton = () => {
  const editor = useSlate();
  return (
    <Button
      active={isLinkActive(editor)}
      onMouseDown={(event) => {
        event.preventDefault();
        const url = window.prompt("Enter the URL of the link:");
        if (!url) return;
        insertLink(editor, url);
      }}
    >
      <AddLinkIcon />
    </Button>
  );
};

const RemoveLinkButton = () => {
  const editor = useSlate();
  return (
    <Button
      active={isLinkActive(editor)}
      onMouseDown={(event) => {
        if (isLinkActive(editor)) {
          unwrapLink(editor);
        }
      }}
    >
      <LinkOffIcon />
    </Button>
  );
};

const ToggleEditableButtonButton = () => {
  const editor = useSlate();
  return (
    <Button
      active
      onMouseDown={(event) => {
        event.preventDefault();
        if (isButtonActive(editor)) {
          unwrapButton(editor);
        } else {
          insertButton(editor);
        }
      }}
    >
      <Icon>smart_button</Icon>
    </Button>
  );
};

const RichTextExample = ({ onChange }) => {
  const ref = useRef();
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState();
  const [index, setIndex] = useState(0);

  const editor = useMemo(
    () =>
      withMentions(
        withEmbeds(
          withInLines(withHistory(withReact(withImages(createEditor()))))
        )
      ),
    []
  );
  const renderElement = useCallback(
    (props) => <Element {...props} editor={editor} />,
    []
  );
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  const chars = CHARACTERS.filter((c) =>
    c.toLowerCase().startsWith(search.toLowerCase())
  ).slice(0, 10);
  const onKeyDown = useCallback(
    (event) => {
      if (target && chars.length > 0) {
        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            const prevIndex = index >= chars.length - 1 ? 0 : index + 1;
            setIndex(prevIndex);
            break;
          case "ArrowUp":
            event.preventDefault();
            const nextIndex = index <= 0 ? chars.length - 1 : index - 1;
            setIndex(nextIndex);
            break;
          case "Tab":
          case "Enter":
            event.preventDefault();
            Transforms.select(editor, target);
            insertMention(editor, chars[index]);
            setTarget(null);
            break;
          case "Escape":
            event.preventDefault();
            setTarget(null);
            break;
        }
      }
    },
    [chars, editor, index, target]
  );

  useEffect(() => {
    if (target && chars.length > 0) {
      const el = ref.current;
      const domRange = ReactEditor.toDOMRange(editor, target);
      const rect = domRange.getBoundingClientRect();
      el.style.top = `${rect.top + window.pageYOffset + 24}px`;
      el.style.left = `${rect.left + window.pageXOffset}px`;
    }
  }, [chars.length, editor, index, search, target]);
  // how to get the value of the editor - when onChange is triggered

  return (
    <Slate
      editor={editor}
      initialValue={initialValue}
      onChange={(e) => {
        onChange(e);
        const { selection } = editor;
        if (selection && Range.isCollapsed(selection)) {
          const [start] = Range.edges(selection);
          const wordBefore = Editor.before(editor, start, { unit: "word" });
          const before = wordBefore && Editor.before(editor, wordBefore);
          const beforeRange = before && Editor.range(editor, before, start);
          const beforeText = beforeRange && Editor.string(editor, beforeRange);
          const beforeMatch = beforeText && beforeText.match(/^@(\w+)$/);
          const after = Editor.after(editor, start);
          const afterRange = Editor.range(editor, start, after);
          const afterText = Editor.string(editor, afterRange);
          const afterMatch = afterText.match(/^(\s|$)/);
          if (beforeMatch && afterMatch) {
            setTarget(beforeRange);
            setSearch(beforeMatch[1]);
            setIndex(0);
            return;
          }
        }
        setTarget(null);
      }}
    >
      <Toolbar>
        <MarkButton format="bold" icon={<FormatBoldIcon />} />
        <MarkButton format="italic" icon={<FormatItalicIcon />} />
        <MarkButton format="underline" icon={<FormatUnderlinedIcon />} />
        <MarkButton format="code" icon={<CodeIcon />} />
        <BlockButton format="heading-one" icon={<LooksOneIcon />} />
        <BlockButton format="heading-two" icon={<LooksTwoIcon />} />
        <BlockButton format="block-quote" icon={<FormatQuoteIcon />} />
        <BlockButton format="numbered-list" icon={<FormatListNumberedIcon />} />
        <BlockButton format="bulleted-list" icon={<FormatListBulletedIcon />} />
        <BlockButton format="left" icon={<FormatAlignLeftIcon />} />
        <BlockButton format="center" icon={<FormatAlignCenterIcon />} />
        <BlockButton format="right" icon={<FormatAlignRightIcon />} />
        <BlockButton format="justify" icon={<FormatAlignJustifyIcon />} />
        <ButtonUpload editor={editor} />
        <AddLinkButton />
        <RemoveLinkButton />
        {/* <ToggleEditableButtonButton /> */}
        {/* <ButtonLink format="link" icon={<InsertLinkIcon />} /> */}
      </Toolbar>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
        onKeyDown={(event) => {
          onKeyDown(event);
          const { selection } = editor;
          for (const hotkey in HOTKEYS) {
            if (isHotkey(hotkey, event)) {
              event.preventDefault();
              const mark = HOTKEYS[hotkey];
              toggleMark(editor, mark);
            }
          }
          if (selection && Range.isCollapsed(selection)) {
            const { nativeEvent } = event;
            if (isKeyHotkey("left", nativeEvent)) {
              event.preventDefault();
              Transforms.move(editor, { unit: "offset", reverse: true });
              return;
            }
            if (isKeyHotkey("right", nativeEvent)) {
              event.preventDefault();
              Transforms.move(editor, { unit: "offset" });
              return;
            }
          }
        }}
      />
      {target && chars.length > 0 && (
        <Portal>
          <div
            ref={ref}
            style={{
              top: "-9999px",
              left: "-9999px",
              position: "absolute",
              zIndex: 1,
              padding: "3px",
              background: "white",
              borderRadius: "4px",
              boxShadow: "0 1px 5px rgba(0,0,0,.2)",
            }}
            data-cy="mentions-portal"
          >
            {chars.map((char, i) => (
              <div
                key={char}
                onClick={() => {
                  Transforms.select(editor, target);
                  insertMention(editor, char);
                  setTarget(null);
                }}
                style={{
                  padding: "1px 3px",
                  borderRadius: "3px",
                  cursor: "pointer",
                  background: i === index ? "#B4D5FF" : "transparent",
                }}
              >
                {char}
              </div>
            ))}
          </div>
        </Portal>
      )}
    </Slate>
  );
};

export default function Page() {
  const [value, setValue] = useState(initialValue);
  const handleChange = (value) => {
    setValue(value);
  };

  console.log(renderJSONToHTML(value));
  return (
    <div className="max-w-3xl py-4 m-auto">
      <h1 className="text-2xl font-bold">Slate Editor</h1>
      <p className="text-sm text-gray-500">
        Doc: <a href="https://docs.slatejs.org/">https://docs.slatejs.org/</a>
      </p>
      <span className="text-xl font-bold text-gray-500">Editor:</span>
      <div className="p-4 mt-4 border border-gray-300 rounded-md">
        <RichTextExample onChange={handleChange} />
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
