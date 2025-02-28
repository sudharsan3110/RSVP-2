'use client';
import { Toggle } from '@/components/ui/toggle';
import { type Editor as EditorType } from '@tiptap/react';
import clsx from 'clsx';
import {
  Bold,
  Heading1,
  Heading2,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  TextQuote as Quote,
  Strikethrough,
} from 'lucide-react';
import { useState } from 'react';

const Editor = ({ editor }: { editor: EditorType | null }) => {
  const [url, setUrl] = useState('');

  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-x-3 border-b py-2">
      {/* Bold */}
      <Toggle
        size="sm"
        pressed={editor.isActive('bold')}
        className={clsx(
          'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
          editor.isActive('bold') ? 'bg-primary text-primary-foreground' : ''
        )}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Toggle>

      {/* Italic */}
      <Toggle
        size="sm"
        pressed={editor.isActive('italic')}
        className={clsx(
          'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
          editor.isActive('italic') ? 'bg-primary text-primary-foreground' : ''
        )}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Toggle>

      {/* Strikethrough */}
      <Toggle
        size="sm"
        pressed={editor.isActive('strike')}
        className={clsx(
          'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
          editor.isActive('strikethrough') ? 'bg-primary text-primary-foreground' : ''
        )}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </Toggle>

      {/* Heading 2 */}
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 2 })}
        className={clsx(
          'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
          editor.isActive('h2') ? 'bg-primary text-primary-foreground' : ''
        )}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading1 className="h-4 w-4" />
      </Toggle>

      {/* Heading 3 */}
      <Toggle
        size="sm"
        pressed={editor.isActive('heading', { level: 3 })}
        className={clsx(
          'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
          editor.isActive('h3') ? 'bg-primary text-primary-foreground' : ''
        )}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading2 className="h-4 w-4" />
      </Toggle>

      {/* Unordered List */}
      <Toggle
        size="sm"
        pressed={editor.isActive('bulletList')}
        className={clsx(
          'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
          editor.isActive('ul') ? 'bg-primary text-primary-foreground' : ''
        )}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Toggle>

      {/* Ordered List */}
      <Toggle
        size="sm"
        pressed={editor.isActive('orderedList')}
        className={clsx(
          'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
          editor.isActive('ol') ? 'bg-primary text-primary-foreground' : ''
        )}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>

      {/* Blockquote */}
      <Toggle
        size="sm"
        pressed={editor.isActive('blockquote')}
        className={clsx(
          'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
          editor.isActive('blockquote') ? 'bg-primary text-primary-foreground' : ''
        )}
        onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-4 w-4" />
      </Toggle>

      {/* Horizontal Rule */}
      <Toggle
        size="sm"
        pressed={editor.isActive('horizontalRule')}
        className={clsx(
          'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
          editor.isActive('horizontalRule') ? 'bg-primary text-primary-foreground' : ''
        )}
        onPressedChange={() => editor.commands.setHorizontalRule()}
      >
        <Minus className="h-4 w-4" />
      </Toggle>

      {/* Link */}
      <Toggle
        size="sm"
        pressed={editor.isActive('link')}
        className={clsx(
          'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
          editor.isActive('link') ? 'bg-primary text-primary-foreground' : ''
        )}
        onPressedChange={() => {
          let inputUrl = prompt('Enter the URL', url) || '';
          if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
            inputUrl = `https://${inputUrl}`;
          }
          editor.commands.setLink({ href: inputUrl });
        }}
      >
        <LinkIcon className="h-4 w-4" />
      </Toggle>

      {/* Image */}
      {/* <Toggle
        size="sm"
        pressed={editor.isActive('image')}
        className={clsx(
          'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
          editor.isActive('image') ? 'bg-primary text-primary-foreground' : ''
        )}
        onPressedChange={() =>
          editor.commands.setImage({ src: prompt('Enter the URL', url) || '' })
        }
      >
        <ImageIcon className="h-4 w-4" />
      </Toggle> */}

      {/* Youtube */}
      {/* <Toggle
        size="sm"
        pressed={editor.isActive('youtube')}
        className={clsx(
          'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
          editor.isActive('youtube') ? 'bg-primary text-primary-foreground' : ''
        )}
        onPressedChange={() =>
          editor.commands.setYoutubeVideo({
            src: prompt('Enter the URL', url) || '',
          })
        }
      >
        <YoutubeIcon className="h-4 w-4" />
      </Toggle> */}
    </div>
  );
};

export default Editor;
