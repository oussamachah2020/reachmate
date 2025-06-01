"use client";

import type React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold } from "@tiptap/extension-bold";
import { Italic } from "@tiptap/extension-italic";
import { Underline } from "@tiptap/extension-underline";
import { BulletList, OrderedList, ListItem } from "@tiptap/extension-list";
import { Table } from "@tiptap/extension-table";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { Heading } from "@tiptap/extension-heading";
import { CodeBlock } from "@tiptap/extension-code-block";
import { Blockquote } from "@tiptap/extension-blockquote";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import { TextAlign } from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Highlight } from "@tiptap/extension-highlight";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { FontSize } from "tiptap-extension-font-size";
import { Extension } from "@tiptap/core";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListIcon,
  ListOrderedIcon,
  ImageIcon,
  LinkIcon,
  QuoteIcon,
  CodeIcon,
  TableIcon,
  MinusIcon,
  PaletteIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  AlignJustifyIcon,
  TagIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { toast } from "sonner";
import { Badge } from "./badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect } from "react";

type Props = {
  value: string;
  htmlContent?: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
  variables?: Array<{ name: string; value: string }>;
};

// Define template variables
const defaultVariables = [
  { name: "First Name", value: "[First Name]" },
  { name: "Last Name", value: "[Last Name]" },
  { name: "Company", value: "[Company]" },
  { name: "Email", value: "[Email]" },
  { name: "Phone", value: "[Phone]" },
  { name: "Date", value: "[Date]" },
  { name: "Address", value: "[Address]" },
  { name: "Custom Field", value: "[Custom Field]" },
];

// Create a custom extension for template variables
const TemplateVariable = Extension.create({
  name: "templateVariable",
  //@ts-ignore
  addCommands() {
    return {
      insertVariable:
        (variableText: any) =>
        ({ commands }: { commands: any }) => {
          return commands.insertContent(
            `<span class="bg-primary/10 text-primary px-1 py-0.5 rounded" data-type="variable">${variableText}</span>`
          );
        },
    };
  },
});

// Extend the TextStyle extension to include fontSize
const CustomTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: "16px",
        parseHTML: (element) => element.style.fontSize || "16px",
        renderHTML: (attributes) => {
          if (!attributes.fontSize) return {};
          return { style: `font-size: ${attributes.fontSize}` };
        },
      },
    };
  },
});

const RichTextEditor = ({
  value,
  htmlContent,
  onChange,
  variables = defaultVariables,
}: Props) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      BulletList,
      OrderedList,
      ListItem,
      Table.configure({ resizable: true }),
      TableRow,
      FontSize,
      TableHeader,
      TableCell,
      Image.configure({ inline: true, allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
      CodeBlock,
      Blockquote,
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      CustomTextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TemplateVariable, // Add our custom extension
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Function to handle color selection
  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const color = event.target.value;
    editor?.chain().focus().setColor(color).run();
  };

  // Function to handle font size selection
  const handleFontSizeChange = (fontSize: string) => {
    editor?.chain().focus().setFontSize(fontSize).run();
  };

  // Function to insert a template variable
  const insertVariable = (variableText: string) => {
    editor?.chain().focus().insertContent(variableText).run();
  };

  useEffect(() => {
    if (editor && htmlContent) {
      editor.commands.setContent(htmlContent, false); // false = do not emit transaction
    }
  }, [htmlContent, editor]);

  if (!editor) return null;

  return (
    <div className="border rounded-md p-2 w-full">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        <Select defaultValue="16px" onValueChange={handleFontSizeChange}>
          <SelectTrigger className="w-[85px] h-8">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12px">12px</SelectItem>
            <SelectItem value="14px">14px</SelectItem>
            <SelectItem value="16px">16px</SelectItem>
            <SelectItem value="18px">18px</SelectItem>
            <SelectItem value="20px">20px</SelectItem>
            <SelectItem value="24px">24px</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-1 items-center">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1 rounded ${
              editor.isActive("bold") ? "bg-gray-200 dark:bg-gray-100/50" : ""
            }`}
          >
            <BoldIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1 rounded ${
              editor.isActive("italic") ? "bg-gray-200" : ""
            }`}
          >
            <ItalicIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1 rounded ${
              editor.isActive("underline") ? "bg-gray-200" : ""
            }`}
          >
            <UnderlineIcon size={16} />
          </button>
        </div>

        <div className="flex gap-1 items-center">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1 rounded ${
              editor.isActive("bulletList") ? "bg-gray-200" : ""
            }`}
          >
            <ListIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1 rounded ${
              editor.isActive("orderedList") ? "bg-gray-200" : ""
            }`}
          >
            <ListOrderedIcon size={16} />
          </button>
        </div>

        <div className="flex gap-1 items-center">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`p-1 rounded ${
              editor.isActive({ textAlign: "left" }) ? "bg-gray-200" : ""
            }`}
          >
            <AlignLeftIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`p-1 rounded ${
              editor.isActive({ textAlign: "center" }) ? "bg-gray-200" : ""
            }`}
          >
            <AlignCenterIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`p-1 rounded ${
              editor.isActive({ textAlign: "right" }) ? "bg-gray-200" : ""
            }`}
          >
            <AlignRightIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={`p-1 rounded ${
              editor.isActive({ textAlign: "justify" }) ? "bg-gray-200" : ""
            }`}
          >
            <AlignJustifyIcon size={16} />
          </button>
        </div>

        {/* Color Picker */}
        <label htmlFor="color-picker" className="cursor-pointer p-1 rounded">
          <PaletteIcon size={16} />
          <input
            id="color-picker"
            type="color"
            className="sr-only"
            onChange={handleColorChange}
          />
        </label>

        <div className="flex gap-1 items-center">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1 rounded ${
              editor.isActive("blockquote") ? "bg-gray-200" : ""
            }`}
          >
            <QuoteIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1 rounded ${
              editor.isActive("codeBlock") ? "bg-gray-200" : ""
            }`}
          >
            <CodeIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-1 rounded"
          >
            <MinusIcon size={16} />
          </button>
        </div>

        <div className="flex gap-1 items-center">
          <button
            type="button"
            onClick={() => {
              const rows = Number.parseInt(
                prompt("Enter number of rows") || "0",
                10
              );
              const cols = Number.parseInt(
                prompt("Enter number of columns") || "0",
                10
              );

              if (rows > 0 && cols > 0) {
                editor.chain().focus().insertTable({ rows, cols }).run();
              } else {
                toast("Please enter valid numbers for rows and columns.");
              }
            }}
            className="p-1 rounded"
          >
            <TableIcon size={16} />
          </button>

          <button
            type="button"
            onClick={() => {
              const url = prompt("Enter image URL");
              if (url) editor.chain().focus().setImage({ src: url }).run();
            }}
            className="p-1 rounded"
          >
            <ImageIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              const url = prompt("Enter link URL");
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }}
            className={`p-1 rounded ${
              editor.isActive("link") ? "bg-gray-200" : ""
            }`}
          >
            <LinkIcon size={16} />
          </button>
        </div>

        {/* Template Variables */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="p-1 rounded flex items-center gap-1 ml-auto"
            >
              <TagIcon size={16} />
              <span className="text-sm">Variables</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Template Variables</h3>
              <div className="flex flex-wrap gap-2">
                {variables.map((variable) => (
                  <Badge
                    key={variable.value}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10"
                    onClick={() => insertVariable(variable.value)}
                  >
                    {variable.name}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Click to insert a variable into your template
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <EditorContent
        editor={editor}
        className="tiptap outline-none focus:border-none p-2 w-full min-h-[200px]"
      />
    </div>
  );
};

export default RichTextEditor;
