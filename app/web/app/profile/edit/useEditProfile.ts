import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDelayedAction } from "@/app/hooks/useDelayedAction";

export interface EditProfileForm {
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
}

export function useEditProfile() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EditProfileForm>({
    fullName: "Jonathan Doe",
    email: "jonathan.doe@email.com",
    phone: "+66 81 234 5678",
    nationality: "Thai",
    passportNumber: "AA123456",
    passportExpiry: "2030-12-31",
  });

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
