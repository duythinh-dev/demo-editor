"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import isHotkey, { isKeyHotkey } from "is-hotkey";
import { Editable, withReact, Slate, ReactEditor } from "slate-react";
import { Editor, Transforms, createEditor, Range } from "slate";
import { withHistory } from "slate-history";
import { withHashtags } from "./utils/withHashtags";
import { insertMention, withMentions } from "./utils/withMentions";
import { withEmbeds } from "./utils/withEmbeds";
import { withInLines } from "./utils/withInLines";
import { withImages } from "./utils/withImages";
import { CHARACTERS, HOTKEYS } from "./constants";
import { Element } from "./components/Elements";
import { Leaf } from "./components/Leaf";
import { Portal } from "./element";
import { toggleMark } from "./utils";
import Toolbar from "./components/Toolbar";
import { withEmoji } from "./utils/withEmoji";

const RichTextExample = ({ onChange, initialValue }) => {
  const ref = useRef();
  const reverse = useRef(false);

  const [search, setSearch] = useState("");
  const [target, setTarget] = useState();
  const [index, setIndex] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const editor = useMemo(
    () =>
      withEmoji(
        withHashtags(
          withMentions(
            withEmbeds(
              withInLines(withHistory(withReact(withImages(createEditor()))))
            )
          )
        )
      ),
    []
  );
  const renderElement = useCallback(
    (props) => <Element {...props} editor={editor} reverse={reverse} />,
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

  return (
    <Slate
      editor={editor}
      initialValue={initialValue}
      onChange={(value) => {
        onChange(value);
        const { selection } = editor;

        if (selection && Range.isCollapsed(selection)) {
          const [start] = Range.edges(selection);
          const wordBefore = Editor.before(editor, start, { unit: "word" });
          const before = wordBefore && Editor.before(editor, wordBefore);
          const beforeRange = before && Editor.range(editor, before, start);
          const beforeText = beforeRange && Editor.string(editor, beforeRange);
          const beforeMentionMatch = beforeText && beforeText.match(/^@(\w+)$/);
          const after = Editor.after(editor, start);
          const afterRange = Editor.range(editor, start, after);
          const afterText = Editor.string(editor, afterRange);
          const afterMatch = afterText.match(/^(\s|$)/);

          if (beforeMentionMatch && afterMatch) {
            setTarget(beforeRange);
            setSearch(beforeMentionMatch[1]);
            setIndex(0);
            return;
          }
        }

        setTarget(null);
      }}
    >
      <Toolbar
        editor={editor}
        handleClick={handleClick}
        handleClose={handleClose}
      />
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
        onKeyDownCapture={(e) => {
          reverse.current = e.key === "ArrowLeft";
        }}
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

export default RichTextExample;
