'use client';
import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import type { User } from '@/lib/types';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { Modal } from './ui/modal';
import { Button } from './ui/button';
import { Avatar } from './ui/avatar';
import { useToast } from './ui/toast';

export function EditProfileModal({ open, onClose, profile, onSaved }: {
  open: boolean;
  onClose: () => void;
  profile: User;
  onSaved: (u: Partial<User>) => void;
}) {
  const toast = useToast();
  const updateUser = useAuth((s) => s.updateUser);
  const fileRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const pickAvatar = async (f: File | null) => {
    if (!f) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', f);
      const { data } = await api.post('/upload?folder=avatars', fd);
      setAvatarUrl(data.url);
      toast('Avatar uploaded', 'success');
    } catch (e) {
      toast(apiError(e, 'Avatar upload failed'), 'error');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload: any = { displayName: displayName.trim(), bio: bio.trim() };
      if (avatarUrl) payload.avatarUrl = avatarUrl;
      const { data } = await api.patch('/users/me', payload);
      updateUser(data);
      onSaved(data);
      toast('Profile updated', 'success');
      onClose();
    } catch (e) {
      toast(apiError(e, 'Could not save your profile'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit profile">
      <div className="flex justify-center">
        <button onClick={() => fileRef.current?.click()} className="group relative" aria-label="Change avatar">
          <Avatar src={avatarUrl} name={displayName || profile.username} size="xl" ring />
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="h-6 w-6 text-white" />
          </span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pickAvatar(e.target.files?.[0] || null)} />
      </div>
      {uploading && <p className="mt-2 text-center text-xs text-[var(--muted)]">Uploading avatar…</p>}

      <label className="mt-5 block">
        <span className="mb-1.5 block text-sm font-medium">Display name</span>
        <input value={displayName} maxLength={60} onChange={(e) => setDisplayName(e.target.value)} className="input" />
      </label>
      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-medium">Bio</span>
        <textarea value={bio} maxLength={200} rows={3} onChange={(e) => setBio(e.target.value)} className="input !h-auto resize-none py-3" />
      </label>

      <Button variant="gradient" size="lg" className="mt-5 w-full" loading={saving || uploading} onClick={save}>
        Save changes
      </Button>
    </Modal>
  );
}
