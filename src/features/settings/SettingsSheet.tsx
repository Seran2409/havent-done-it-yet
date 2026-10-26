import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useStore } from '../../data/AppStore';
import { exportFileName, pickJson, saveJson } from '../../data/files';
import { normalizeImport } from '../../data/schema';
import { MAX_GOAL } from '../../game/rules';
import type { AppData, Language, ThemePref } from '../../game/types';
import { useTheme } from '../../theme/ThemeProvider';
import { SheetHead, useSheet, useToast } from '../../ui/overlays';
import { Button, Card, Field, IconButton, Segmented, Stepper, Switch } from '../../ui/primitives';
import { T } from '../../ui/Text';
import { Input } from '../todos/sheets';

/** "07:30" ± minutes, wrapping around midnight. */
function shiftTime(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = (((h * 60 + m + minutes) % 1440) + 1440) % 1440;
  return String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
}

export function SettingsSheet({ close }: { close: () => void }) {
  const { t } = useTranslation();
  const { c } = useTheme();
  const { settings, today, actions } = useStore();
  const toast = useToast();
  const sheet = useSheet();
  const [name, setName] = useState(settings.name);
  const [paste, setPaste] = useState('');

  const saveName = () => {
    const n = name.trim().slice(0, 40);
    if (n !== settings.name) actions.saveSettings({ name: n });
  };

  const doExport = async () => {
    try {
      await saveJson(exportFileName(today), JSON.stringify(actions.exportData(), null, 2));
      toast(t('toast.exported'));
    } catch {
      toast(t('toast.saveError'), 'warn');
    }
  };

  const askImport = (text: string) => {
    let parsed: AppData;
    try {
      parsed = normalizeImport(text);
    } catch {
      toast(t('toast.importError'), 'warn');
      return;
    }
    sheet.open(
      (cl) => (
        <View>
          <SheetHead title={t('settings.importTitle')} onClose={cl} />
          <View style={{ gap: 8, marginBottom: 16 }}>
            <T muted>{t('settings.importText')}</T>
            <T muted>
              {t('settings.importText2', {
                todos: Object.keys(parsed.todos).length,
                routines: Object.keys(parsed.routines).length,
                days: Object.keys(parsed.days).length,
              })}
            </T>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            <Button kind="ghost" label={t('common.cancel')} onPress={cl} style={{ flexGrow: 1, flexBasis: 140 }} />
            <Button
              label={t('settings.importConfirm')}
              style={{ flexGrow: 1, flexBasis: 140 }}
              onPress={async () => {
                try {
                  await actions.importData(parsed);
                  toast(t('toast.imported'));
                } catch {
                  toast(t('toast.saveError'), 'warn');
                }
                cl();
              }}
            />
          </View>
        </View>
      ),
      t('settings.importTitle'),
    );
  };

  const doPick = async () => {
    try {
      const text = await pickJson();
      if (text != null) askImport(text);
    } catch {
      toast(t('toast.importError'), 'warn');
    }
  };

  const mailOn = settings.mail.enabled;
  const mailTime = settings.mail.time || '07:30';
  const setTime = (time: string) => actions.saveSettings({ mail: { ...settings.mail, time } });

  return (
    <View>
      <SheetHead
        title={t('settings.title')}
        onClose={() => {
          saveName();
          close();
        }}
      />
      <View style={{ gap: 18 }}>
        <Field label={t('settings.name')}>
          <Input value={name} onChangeText={setName} onBlur={saveName} onSubmitEditing={saveName} maxLength={40} placeholder={t('settings.namePlaceholder')} autoComplete="given-name" accessibilityLabel={t('settings.name')} />
        </Field>
        <Field label={t('settings.language')}>
          <Segmented<Language>
            label={t('settings.language')}
            value={settings.language}
            onChange={(v) => actions.saveSettings({ language: v })}
            options={[
              { key: 'system', label: t('settings.langSystem') },
              { key: 'de', label: t('settings.langDe') },
              { key: 'en', label: t('settings.langEn') },
            ]}
          />
        </Field>
        <Field label={t('settings.theme')}>
          <Segmented<ThemePref>
            label={t('settings.theme')}
            value={settings.theme ?? 'system'}
            onChange={(v) => actions.saveSettings({ theme: v })}
            options={[
              { key: 'system', label: t('settings.themeSystem') },
              { key: 'light', label: t('settings.themeLight') },
              { key: 'dark', label: t('settings.themeDark') },
            ]}
          />
        </Field>
        <Field label={t('settings.goal')}>
          <Card pad={12}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <T v="bold">{t('settings.goalValue', { count: settings.dailyGoal })}</T>
              <Stepper value={settings.dailyGoal} max={MAX_GOAL} onChange={actions.setGoal} decLabel={t('common.less')} incLabel={t('common.more')} />
            </View>
          </Card>
        </Field>
        <Field label={t('settings.notifications')}>
          <View style={{ gap: 8 }}>
            <Switch on={mailOn} onToggle={() => actions.saveSettings({ mail: { ...settings.mail, enabled: !mailOn } })} title={t('settings.mail')} text={t('settings.mailText')} />
            {mailOn ? (
              <Card pad={12}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <T v="bold">{t('settings.mailTime')}</T>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <IconButton icon="minus" label={t('common.less')} size={32} color={c.ink} onPress={() => setTime(shiftTime(mailTime, -30))} />
                    <T v="monoBold" style={{ minWidth: 52, textAlign: 'center', fontSize: 15 }}>
                      {mailTime}
                    </T>
                    <IconButton icon="plus" label={t('common.more')} size={32} color={c.ink} onPress={() => setTime(shiftTime(mailTime, 30))} />
                  </View>
                </View>
              </Card>
            ) : null}
            <T v="tiny" muted>
              {t('settings.mailSoon')}
            </T>
            <Switch on={false} disabled onToggle={() => {}} title={t('settings.push')} text={t('settings.pushText') + ' ' + t('settings.pushSoon')} />
          </View>
        </Field>
        <Field label={t('settings.data')}>
          <View style={{ gap: 10 }}>
            <T v="small" muted>
              {t('settings.localNote')}
            </T>
            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              <Button kind="ghost" small icon="download" label={t('settings.export')} onPress={doExport} style={{ flexGrow: 1, flexBasis: 140 }} />
              <Button kind="ghost" small icon="upload" label={t('settings.import')} onPress={doPick} style={{ flexGrow: 1, flexBasis: 140 }} />
            </View>
            <Input
              value={paste}
              onChangeText={setPaste}
              multiline
              placeholder={t('settings.pastePlaceholder')}
              accessibilityLabel={t('settings.pastePlaceholder')}
              style={{ height: 84, paddingTop: 12, textAlignVertical: 'top', fontSize: 14 }}
            />
            {paste.trim() ? <Button small kind="ghost" label={t('settings.check')} onPress={() => askImport(paste)} style={{ alignSelf: 'flex-start' }} /> : null}
          </View>
        </Field>
      </View>
    </View>
  );
}
