import { Node, mergeAttributes } from "@tiptap/core";

// Atom block chip marking where a requirement was captured from this section.
// Rendered statically (no node view) and persisted inside the section HTML.
const RequirementBlock = Node.create({
  name: "requirementBlock",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      code: { default: "" },
      title: { default: "" },
      reqType: { default: "FR" }
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-requirement-block]",
        getAttrs: (element) => ({
          code: element.getAttribute("data-code") || "",
          title: element.getAttribute("data-title") || "",
          reqType: element.getAttribute("data-req-type") || "FR"
        })
      }
    ];
  },

  renderHTML({ node }) {
    return [
      "div",
      mergeAttributes({
        "data-requirement-block": "true",
        "data-code": node.attrs.code,
        "data-title": node.attrs.title,
        "data-req-type": node.attrs.reqType,
        class: "devdoc-requirement-block"
      }),
      ["span", { class: "devdoc-requirement-block-code" }, node.attrs.code],
      ["span", { class: "devdoc-requirement-block-title" }, node.attrs.title],
      ["span", { class: "devdoc-requirement-block-type" }, node.attrs.reqType]
    ];
  }
});

export default RequirementBlock;
