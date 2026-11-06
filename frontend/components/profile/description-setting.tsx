"use client";

import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { NotebookPen, Save } from "lucide-react";
import { SettingsSection, saveButtonClass } from "@/frontend/components/settings/settings-section";
import { StatusMessage } from "@/frontend/components/settings/status-message";
import { Textarea } from "@/frontend/components/ui/textarea";
import { AUDIT_KEY } from "@/frontend/hooks/use-audit";
import { CURRENT_USER_KEY, type CurrentUser } from "@/frontend/hooks/use-current-user";
import { useStatus } from "@/frontend/hooks/use-status";
import { useTranslation } from "@/frontend/hooks/use-translation";
import { saveUser } from "@/frontend/lib/user-api";

const MAX_LENGTH = 300;

export function DescriptionSetting({ user }: { user: CurrentUser }) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [value, setValue] = useState(user.description);
  const [status, setStatus] = useStatus(); // mesajul verde dispare după 3 secunde
  const [saving, setSaving] = useState(false);

  const unchanged = value.trim() === user.description;

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    const result = await saveUser("/api/profile", { description: value.trim() });
    if (result.user) {
      queryClient.setQueryData(CURRENT_USER_KEY, result.user);
      queryClient.invalidateQueries({ queryKey: AUDIT_KEY }); // notificările se reîncarcă
      setValue(result.user.description);
      setStatus({ type: "success", text: t.profile.descriptionSaved });
    } else {
      setStatus({ type: "error", text: t.errors[result.errorCode] });
    }
    setSaving(false);
  }

  return (
    <SettingsSection
      icon={NotebookPen}
      title={t.profile.descriptionTitle}
      description={t.profile.descriptionDescription}
    >
      <form onSubmit={handleSave} className="flex flex-col gap-3">
        <Textarea
          aria-label={t.profile.descriptionLabel}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setStatus(null);
          }}
          maxLength={MAX_LENGTH} // browserul nu lasă să se scrie mai mult
          rows={4}
          placeholder={t.profile.descriptionPlaceholder}
          className="resize-none"
        />
        <div className="flex items-center justify-between gap-3">
          {/* Contorul de caractere */}
          <span className="text-xs text-muted-foreground">
            {value.length}/{MAX_LENGTH}
          </span>
          <button type="submit" disabled={saving || unchanged} className={saveButtonClass}>
            <Save className="size-4" />
            {saving ? t.common.saving : t.common.save}
          </button>
        </div>
      </form>
      <StatusMessage status={status} />
    </SettingsSection>
  );
}
