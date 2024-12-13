import { useSelected } from "slate-react";
import { Transforms } from "slate";
import Image from "next/image";
import React from "react";

export const Emoji = (props) => {
  const { editor, reverse } = props;
  const selected = useSelected();

  React.useEffect(() => {
    const selection = editor.selection;
    if (selected && selection?.anchor.path.length === 3) {
      Transforms.move(editor, {
        unit: "offset",
        reverse: reverse.current,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  return (
    <span
      {...props.attributes}
      style={{ display: "inline-block" }}
      contentEditable={false}
    >
      {props.children}
      <Image
        height={16}
        alt="emoji"
        width={16}
        src={`https://cdn.jsdelivr.net/npm/emoji-datasource-apple@14.0.0/img/apple/64/${props.element.emoji.unified}.png`}
      />
    </span>
  );
};
