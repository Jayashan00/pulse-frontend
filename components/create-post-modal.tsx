'use client';
import { useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { api, apiError } from '@/lib/api';
import type { Post } from '@/lib/types';
import { Modal } from './ui/modal';
import { Button } from './ui/button';
import { useToast } from './ui/toast';

export function CreatePostModal({ open, onClose, onCreated }: {
  open: boolean;
  onClose: () => void;
  onCreated: (post: Post) => void;
}) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickFile = (f: File | null) => {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const submit = async () => {
    if (!caption.trim()) return toast('Write a caption first', 'error');
    setLoading(true);
    try {
      let mediaUrl: string | undefined;
      let mediaType: string | undefined;
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        const { data } = await api.post('/upload?folder=posts', fd);
        mediaUrl = data.url;
        mediaType = data.mediaType;
      }
      const { data: post } = await api.post('/posts', { caption: caption.trim(), mediaUrl, mediaType });
      toast('Posted! 🎉', 'success');
      onCreated(post);
      setCaption(''); pickFile(null);
      onClose();
    } catch (e) {
      toast(apiError(e, 'Could not publish your post'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New post">
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        maxLength={500}
        rows={4}
        placeholder="What's happening?"
        className="input !h-auto w-full resize-none py-3"
      />
      <p className="mt-1 text-right text-xs text-[var(--muted)]">{caption.length}/500</p>

      {preview ? (
        <div className="relative mt-3 overflow-hidden rounded-xl border border-[var(--border)]">
          {file?.type.startsWith('video') ? (
            <video src={preview} className="max-h-64 w-full object-contain" controls />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview" className="max-h-64 w-full object-contain" />
          )}
          <button
            onClick={() => pickFile(null)}
            aria-label="Remove media"
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] py-8 text-sm text-[var(--muted)] transition-colors hover:border-primary hover:text-primary"
        >
          <ImagePlus className="h-5 w-5" />
          Add a photo, GIF or short clip
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
        hidden
        onChange={(e) => pickFile(e.target.files?.[0] || null)}
      />

      <Button variant="gradient" size="lg" className="mt-4 w-full" loading={loading} onClick={submit}>
        {loading ? 'Publishing…' : 'Publish'}
      </Button>
    </Modal>
  );
}
