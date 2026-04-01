import { useState, useCallback } from 'react';

interface CopyButtonProps {
  text: string;
  label?: string;
}

export function CopyButton({ text, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text if clipboard API fails
    }
  }, [text]);

  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={handleCopy}
      aria-label={copied ? 'Copied to clipboard' : `${label} to clipboard`}
      style={{ padding: '6px 12px', minHeight: '36px', fontSize: '0.75rem' }}
    >
      {copied ? '\u2713 Copied' : label}
    </button>
  );
}
