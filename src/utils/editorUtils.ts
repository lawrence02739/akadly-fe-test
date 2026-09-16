export type SlateNode = {
  type?: string;
  text?: string;
  children?: SlateNode[];

  // Marks
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;

  color?: string;
  backgroundColor?: string;
  fontSize?: string;
  fontFamily?: string;
};

export function slateToHTML(nodes: SlateNode[]): string {
  const escapeHTML = (str: string = '') =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function renderText(node: SlateNode): string {
    let text = escapeHTML(node.text || '');

    const styles: string[] = [];

    if (node.bold) styles.push('font-weight:bold');
    if (node.italic) styles.push('font-style:italic');

    const decorations: string[] = [];
    if (node.underline) decorations.push('underline');
    if (node.strikethrough) decorations.push('line-through');

    if (decorations.length) {
      styles.push(`text-decoration:${decorations.join(' ')}`);
    }

    if (node.color) styles.push(`color:${node.color}`);
    if (node.backgroundColor) styles.push(`background-color:${node.backgroundColor}`);
    if (node.fontSize) styles.push(`font-size:${node.fontSize}`);
    if (node.fontFamily) styles.push(`font-family:${node.fontFamily}`);

    if (node.code) {
      text = `<code>${text}</code>`;
    }

    if (styles.length) {
      return `<span style="${styles.join(';')}">${text}</span>`;
    }

    return text;
  }

  function render(node: SlateNode): string {
    // Leaf node
    if (node.text !== undefined) {
      return renderText(node);
    }

    const children = (node.children || []).map(render).join('');

    switch (node.type) {
      case 'paragraph':
        return `<p>${children}</p>`;

      case 'bulleted-list':
        return `<ul>${children}</ul>`;

      case 'numbered-list':
        return `<ol>${children}</ol>`;

      case 'list-item':
        return `<li>${children}</li>`;

      case 'blockquote':
        return `<blockquote>${children}</blockquote>`;

      case 'heading-one':
        return `<h1>${children}</h1>`;

      case 'heading-two':
        return `<h2>${children}</h2>`;

      case 'heading-three':
        return `<h3>${children}</h3>`;

      default:
        return children;
    }
  }

  return nodes.map(render).join('');
}

export function htmlToSlate(html: string): SlateNode[] {
  if (!html) return [{ type: 'paragraph', children: [{ text: '' }] }];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  function deserialize(el: ChildNode): SlateNode | SlateNode[] | null {
    if (el.nodeType === 3) {
      // TEXT_NODE
      return { text: el.textContent || '' };
    } else if (el.nodeType !== 1) {
      // ELEMENT_NODE
      return null;
    }
    const node = el as HTMLElement;
    let children = Array.from(node.childNodes)
      .map(deserialize)
      .flat()
      .filter(Boolean) as SlateNode[];

    if (children.length === 0) children = [{ text: '' }];

    switch (node.nodeName.toLowerCase()) {
      case 'p':
        return { type: 'paragraph', children };
      case 'ul':
        return { type: 'bulleted-list', children };
      case 'ol':
        return { type: 'numbered-list', children };
      case 'li':
        return { type: 'list-item', children };
      case 'blockquote':
        return { type: 'blockquote', children };
      case 'h1':
        return { type: 'heading-one', children };
      case 'h2':
        return { type: 'heading-two', children };
      case 'h3':
        return { type: 'heading-three', children };
      case 'span':
        return children.map((child) => {
          const newChild = { ...child };
          if (node.style.fontWeight === 'bold') newChild.bold = true;
          if (node.style.fontStyle === 'italic') newChild.italic = true;
          if (node.style.textDecoration.includes('underline')) newChild.underline = true;
          if (node.style.textDecoration.includes('line-through')) newChild.strikethrough = true;
          if (node.style.color) newChild.color = node.style.color;
          if (node.style.backgroundColor) newChild.backgroundColor = node.style.backgroundColor;
          if (node.style.fontSize) newChild.fontSize = node.style.fontSize;
          if (node.style.fontFamily) newChild.fontFamily = node.style.fontFamily;
          return newChild;
        });
      case 'code':
        return children.map((child) => ({ ...child, code: true }));
      default:
        return children;
    }
  }

  const nodes = Array.from(doc.body.childNodes)
    .map(deserialize)
    .flat()
    .filter(Boolean) as SlateNode[];

  return nodes.length > 0 ? nodes : [{ type: 'paragraph', children: [{ text: '' }] }];
}

export function parseEditorData(data: string | null | undefined): SlateNode[] {
  if (!data) return [{ type: 'paragraph', children: [{ text: '' }] }];

  // Try parsing as JSON first (backward compatibility)
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (e) {
    // If it's not JSON, it must be HTML (or raw text)
  }

  return htmlToSlate(data);
}

export const getDefaultEditorValue = (): any[] => [{ type: 'paragraph', children: [{ text: '' }] }];

export const parseEditorValue = (val: any): any[] => {
  if (Array.isArray(val) && val.length > 0) return val;
  if (typeof val === 'string' && val.trim() !== '') {
    return parseEditorData(val);
  }
  return getDefaultEditorValue();
};
