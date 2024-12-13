import React from "react";
import { useSlate } from "slate-react";
import { isBlockActive, isMarkActive, toggleBlock, toggleMark } from "../utils";
import BackupIcon from "@mui/icons-material/Backup";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import AddLinkIcon from "@mui/icons-material/AddLink";
import { insertLink, isLinkActive, unwrapLink } from "../utils/linkUtils";
import { Button, Icon } from "../element";
import { insertEmoji, insertImage } from "../utils/insertElement";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

export const BlockButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      {icon}
    </Button>
  );
};

export const MarkButton = ({ format, icon }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      {icon}
    </Button>
  );
};
export const ButtonUpload = ({ editor }) => {
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

export const RemoveLinkButton = () => {
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

export const AddLinkButton = () => {
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

export const ToggleEditableButtonButton = () => {
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

export const EmojiButton = ({ editor }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleClick} size="small">
        <SentimentSatisfiedAltIcon />
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Picker
          data={data}
          onEmojiSelect={(emoji) => insertEmoji(editor, emoji)}
        />
      </Popover>
    </>
  );
};
