import ListItem from "quill/formats/list";

class PlainListItem extends ListItem {
  formatAt(index, length, name, value) {
    console.log(name, value);
    if (name === "list") {
      // Allow changing or removing list format
      super.formatAt(name, value);
    }
    // Otherwise ignore
  }
}

export default PlainListItem;
