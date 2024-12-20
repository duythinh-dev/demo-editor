"use client";

import React from "react";

// import {
//   FormatBoldIcon,
//   FormatItalicIcon,
//   FormatUnderlinedIcon,
//   CodeIcon,
//   LooksOneIcon,
//   LooksTwoIcon,
//   FormatQuoteIcon,
//   FormatListNumberedIcon,
//   FormatListBulletedIcon,
//   FormatAlignLeftIcon,
//   FormatAlignCenterIcon,
//   FormatAlignRightIcon,
//   FormatAlignJustifyIcon,
//   SentimentSatisfiedAltIcon,
// } from "@mui/icons-material";
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

import { Toolbar as SlateToolbar } from "../element";
import {
  AddLinkButton,
  BlockButton,
  ButtonUpload,
  ButtonUploadVideo,
  EmojiButton,
  MarkButton,
  RemoveLinkButton,
} from "./Buttons";

const Toolbar = ({ editor }) => {
  return (
    <>
      <SlateToolbar>
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
        <EmojiButton editor={editor} />
        <ButtonUpload editor={editor} />
        <ButtonUploadVideo editor={editor} />
        <AddLinkButton />
        <RemoveLinkButton />
      </SlateToolbar>
    </>
  );
};

export default Toolbar;
