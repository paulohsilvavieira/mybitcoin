import { Fragment } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';

export interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastAccessAt: string;
}

interface SessionRowProps {
  session: ActiveSession;
  onRevoke: (id: string) => void;
}

function SessionRow({ session, onRevoke }: SessionRowProps) {
  return (
    <View className="flex-row items-center justify-between gap-3 py-3">
      <View className="min-w-0 flex-1">
        <Text className="font-sans-medium">{session.device}</Text>
        <Text className="text-sm text-muted-foreground">
          {session.location} · último acesso em {new Date(session.lastAccessAt).toLocaleDateString('pt-BR')}
        </Text>
      </View>
      <Button variant="outline" size="sm" className="h-11 shrink-0" onPress={() => onRevoke(session.id)}>
        <Text>Revogar</Text>
      </Button>
    </View>
  );
}

export interface SecuritySectionProps {
  twoFactorEnabled: boolean;
  onTwoFactorChange: (enabled: boolean) => void;
  sessions: ActiveSession[];
  onRevokeSession: (id: string) => void;
}

/**
 * Card de segurança — porte de `components/profile/security-section.tsx`
 * do `../mybitcoin-front`: 2FA + sessões ativas. Dados via props
 * (mock/preview, sem integração real ainda).
 */
export function SecuritySection({
  twoFactorEnabled,
  onTwoFactorChange,
  sessions,
  onRevokeSession,
}: SecuritySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Segurança</CardTitle>
      </CardHeader>
      <CardContent className="gap-4">
        <View className="flex-row items-center justify-between gap-3">
          <View className="min-w-0 flex-1">
            <Label>Autenticação em duas etapas</Label>
            <Text className="text-sm text-muted-foreground">{twoFactorEnabled ? 'Ativado' : 'Desativado'}</Text>
          </View>
          <Switch
            value={twoFactorEnabled}
            onValueChange={onTwoFactorChange}
            accessibilityLabel="Autenticação em duas etapas"
          />
        </View>

        <Separator />

        <View>
          <Text className="mb-1 font-sans-medium">Sessões ativas</Text>
          {sessions.length === 0 ? (
            <Text className="py-3 text-sm text-muted-foreground">Nenhuma sessão ativa.</Text>
          ) : (
            <View>
              {sessions.map((session, index) => (
                <Fragment key={session.id}>
                  {index > 0 && <Separator />}
                  <SessionRow session={session} onRevoke={onRevokeSession} />
                </Fragment>
              ))}
            </View>
          )}
        </View>
      </CardContent>
    </Card>
  );
}
