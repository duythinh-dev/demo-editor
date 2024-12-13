export const Leaf = ({ attributes, children, leaf }) => {
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
  if (leaf.hashtag) {
    children = (
      <code
        style={{
          color: "#2563eb",
          fontWeight: "bold",
          backgroundColor: "#e3ecff",
          padding: "2px 4px",
          borderRadius: "4px",
        }}
      >
        {children}
      </code>
    );
  }
  return <span {...attributes}>{children}</span>;
};
