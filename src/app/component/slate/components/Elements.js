import React, { useMemo } from "react";
import {
  useSelected,
  useFocused,
  useSlateStatic,
  ReactEditor,
} from "slate-react";
import Image from "next/image";
import { css } from "@emotion/css";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { allowedSchemes } from "../constants";
import { IS_MAC } from "../../utils/environment";
import { Transforms } from "slate";
import { Emoji } from "./Emoji";

export const Element = ({ attributes, children, element, editor, reverse }) => {
  const style = { textAlign: element.align };
  switch (element.type) {
    case "image":
      return (
        <ImageRender {...attributes} element={element} editor={editor}>
          {children}
        </ImageRender>
      );
    case "video":
      return (
        <VideoElement {...attributes} element={element} editor={editor}>
          {children}
        </VideoElement>
      );
    case "mention":
      return (
        <Mention {...attributes} element={element} editor={editor}>
          {children}
        </Mention>
      );
    case "emoji":
      return (
        <Emoji
          {...attributes}
          {...{
            element,
            editor,
            style,
            reverse,
          }}
        >
          {children}
        </Emoji>
      );
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
        <IconButton
          active
          onClick={() => Transforms.removeNodes(editor, { at: path })}
          className={css`
            position: absolute;
            top: 0.5em;
            left: 0.5em;
            background-color: white;
          `}
          size="small"
          sx={{}}
        >
          <CloseIcon />
        </IconButton>
      </div>
    </div>
  );
};

const VideoElement = ({ attributes, children, element }) => {
  const editor = useSlateStatic();
  const { url } = element;
  const path = ReactEditor.findPath(editor, element);
  const safeUrl = useMemo(() => {
    if (url.startsWith("data:video/")) {
      // Handle base64 video URLs directly
      return url;
    }
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
      <div
        contentEditable={false}
        className={css`
          position: relative;
        `}
      >
        <IconButton
          active
          onClick={() => Transforms.removeNodes(editor, { at: path })}
          className={css`
            position: absolute;
            top: 0.5em;
            right: 0.5em;
            background-color: white;
            z-index: 1000;
          `}
          size="small"
        >
          <CloseIcon />
        </IconButton>
        {url.startsWith("data:video/") ? (
          <video
            controls
            src={safeUrl}
            style={{
              width: "100%",
              height: "auto",
            }}
          />
        ) : (
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
        )}
        {url.startsWith("data:video/") ? (
          ""
        ) : (
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
        )}
      </div>
      {children}
    </div>
  );
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
