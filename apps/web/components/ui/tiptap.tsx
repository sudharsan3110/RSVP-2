'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Editor from './tiptap-editor';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import Strike from '@tiptap/extension-strike';
import Italic from '@tiptap/extension-italic';
import LinkExtension from '@tiptap/extension-link';
import CharacterCount from '@tiptap/extension-character-count';
import Blockquote from '@tiptap/extension-blockquote';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { useState } from 'react';

const Tiptap = ({
  description,
  onChange,
  limit,
}: {
  description: string;
  onChange: (richtext: string, plaintext: string) => void;
  limit: number;
}) => {
  const [editorInFocus, setEditorInFocus] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Heading.configure({
        levels: [1, 2, 3, 4],
      }),
      BulletList,
      OrderedList,
      Strike,
      Italic,
      LinkExtension.configure({
        openOnClick: true,
        linkOnPaste: true,
        autolink: true,
        defaultProtocol: 'https',
        protocols: ['ftp', 'mailto'],
        HTMLAttributes: {
          class: 'cursor-pointer',
        },
      }),
      CharacterCount.configure({
        limit,
      }),
      Blockquote.configure(),
      HorizontalRule.configure(),
    ],
    content: description,
    onUpdate({ editor }) {
      onChange(editor.getHTML(), editor.getText().replace(/[\n\r\t]/g, ''));
    },
    editorProps: {
      attributes: {
        class:
          'prose max-w-none mt-2 p-2 prose-headings:text-white prose-strong:text-white prose-em:text-white prose-a:text-white prose-p:text-white [&_p]:w-full prose-headings:my-2 prose-ul:my-2 prose-ol:my-2 prose-hr:my-2 min-h-40 border rounded-md text-white border-none focus:outline-none',
      },
    },
  });

  if (!editor) return null;

  return (
    <div
      className={`rounded-lg border bg-[#141415] p-2 ${editorInFocus ? 'outline outline-2 outline-primary' : ''}`}
      onFocus={() => setEditorInFocus(true)}
      onBlur={() => setEditorInFocus(false)}
    >
      <Editor editor={editor} />
      <EditorContent editor={editor} />
      <p className="text-right text-xs text-secondary">
        {editor.storage.characterCount.characters()} / {limit} characters
      </p>
    </div>
  );
};

export default Tiptap;
