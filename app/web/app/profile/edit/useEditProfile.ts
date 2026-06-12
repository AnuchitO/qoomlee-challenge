import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDelayedAction } from "@/app/hooks/useDelayedAction";
import { getProfile, type ProfileData } from "@/lib/profile/mock";

export type EditProfileForm = ProfileData;

export function useEditProfile() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EditProfileForm>(getProfile());

  const schedule = useDelayedAction();

  const set =
    (k: keyof EditProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    schedule(() => {
      setSaving(false);
      router.back();
    }, 800);
  }

  return { form, set, saving, handleSave };
}
