"use client";

import { useEditProfile } from "./useEditProfile";
import { EditProfileView } from "./EditProfileView";

export default function EditProfilePage() {
  const props = useEditProfile();
  return <EditProfileView {...props} />;
}
