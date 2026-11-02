"use client";

import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Save, UserPen } from "lucide-react";
import { SettingsSection, saveButtonClass } from "@/frontend/components/settings/settings-section";
import { StatusMessage } from "@/frontend/components/settings/status-message";
import { Input } from "@/frontend/components/ui/input";
import { CURRENT_USER_KEY, type CurrentUser } from "@/frontend/hooks/use-current-user";
import { useStatus } from "@/frontend/hooks/use-status";
import { useTranslation } from "@/frontend/hooks/use-translation";
import { saveUser } from "@/frontend/lib/user-api";

export function UsernameSetting({ user }: { user: CurrentUser }) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [value, setValue] = useState(user.username);
  const [status, setStatus] = useStatus(); // mesajul verde dispare după 3 secunde
  const [saving, setSaving] = useState(false);

  const unchanged = value.trim() === user.username;

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    const result = await saveUser("/api/profile", { username: value.trim() });
    if (result.user) {
      // Actualizăm datele ținute minte → numele se schimbă imediat și în sidebar
      queryClient.setQueryData(CURRENT_USER_KEY, result.user);
      setValue(result.user.username);
      setStatus({ type: "success", text: t.profile.usernameChanged });
    } else {
      setStatus({ type: "error", text: t.errors[result.errorCode] });
    }
    setSaving(false);
  }

  return (
    <SettingsSection icon={UserPen} title={t.profile.usernameTitle} description={t.profile.usernameDescription}>
      <form onSubmit={handleSave} className="flex flex-col gap-3 sm:flex-row">
        <Input
          aria-label={t.profile.usernameLabel}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setStatus(null); // mesajul vechi dispare când utilizatorul scrie din nou
          }}
          minLength={3}
          maxLength={30}
          required
          className="h-10 flex-1"
        />
        <button type="submit" disabled={saving || unchanged} className={saveButtonClass}>
          <Save className="size-4" />
          {saving ? t.common.saving : t.common.save}
        </button>
      </form>
      <StatusMessage status={status} />
    </SettingsSection>
  );
}
