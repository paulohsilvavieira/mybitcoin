import { type ReactNode, useState } from 'react'
import { Info } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle, type AlertVariant } from '@/components/ui/alert'
import { Avatar } from '@/components/ui/avatar'
import { Badge, badgeVariantClasses } from '@/components/ui/badge'
import { Button, type ButtonSize, buttonVariantClasses } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogCloseButton,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'

const BUTTON_VARIANTS = Object.keys(buttonVariantClasses) as (keyof typeof buttonVariantClasses)[]
const BUTTON_SIZES: ButtonSize[] = ['xs', 'sm', 'default', 'lg']
const BADGE_VARIANTS = Object.keys(badgeVariantClasses) as (keyof typeof badgeVariantClasses)[]
const ALERT_VARIANTS: AlertVariant[] = ['default', 'destructive']

function Example({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}

function ButtonsExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Button</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {BUTTON_VARIANTS.map((variant) => (
          <Example key={variant} label={variant}>
            {BUTTON_SIZES.map((size) => (
              <Button key={size} variant={variant} size={size}>
                {size}
              </Button>
            ))}
          </Example>
        ))}
      </CardContent>
    </Card>
  )
}

function BadgesExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Badge</CardTitle>
      </CardHeader>
      <CardContent>
        <Example label="variantes">
          {BADGE_VARIANTS.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </Example>
      </CardContent>
    </Card>
  )
}

function CardExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Container padrão usado nos exemplos desta página.
      </CardContent>
    </Card>
  )
}

function InputExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Input + Label</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor="gallery-input-ok">Nome completo</FieldLabel>
          <Input id="gallery-input-ok" placeholder="Ana Beatriz" />
        </Field>
        <Field data-invalid>
          <FieldLabel htmlFor="gallery-input-error">E-mail</FieldLabel>
          <Input id="gallery-input-error" aria-invalid defaultValue="ana@" />
          <FieldError>Informe um e-mail válido</FieldError>
        </Field>
      </CardContent>
    </Card>
  )
}

function AlertsExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {ALERT_VARIANTS.map((variant) => (
          <Alert key={variant} variant={variant}>
            <Info />
            <AlertTitle>{variant === 'default' ? 'Aviso' : 'Erro'}</AlertTitle>
            <AlertDescription>
              {variant === 'default'
                ? 'Mensagem informativa padrão.'
                : 'Algo deu errado ao processar a solicitação.'}
            </AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  )
}

function SkeletonExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skeleton</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="size-10 rounded-full" />
      </CardContent>
    </Card>
  )
}

function TabsExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tabs</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="one">
          <TabsList>
            <TabsTrigger value="one">Um</TabsTrigger>
            <TabsTrigger value="two">Dois</TabsTrigger>
            <TabsTrigger value="three">Três</TabsTrigger>
          </TabsList>
          <TabsContent value="one" className="pt-2 text-muted-foreground">
            Conteúdo da aba um.
          </TabsContent>
          <TabsContent value="two" className="pt-2 text-muted-foreground">
            Conteúdo da aba dois.
          </TabsContent>
          <TabsContent value="three" className="pt-2 text-muted-foreground">
            Conteúdo da aba três.
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function SwitchExample() {
  const [checked, setChecked] = useState(true)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Switch</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Example label="ligado/desligado">
          <Switch checked={checked} onCheckedChange={setChecked} />
          <Switch checked={false} />
        </Example>
      </CardContent>
    </Card>
  )
}

function AvatarExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Avatar</CardTitle>
      </CardHeader>
      <CardContent>
        <Example label="imagem / iniciais">
          <Avatar src="https://i.pravatar.cc/80?img=5" alt="Foto de perfil" />
          <Avatar name="Ana Beatriz" />
          <Avatar name="Carlos Eduardo Silva" />
        </Example>
      </CardContent>
    </Card>
  )
}

function DialogExample() {
  const [open, setOpen] = useState(false)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dialog</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={() => setOpen(true)}>Abrir diálogo</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogCloseButton onOpenChange={setOpen} />
          <DialogHeader>
            <DialogTitle>Confirmar ação</DialogTitle>
            <DialogDescription>Este é um diálogo de exemplo do storybook.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setOpen(false)}>Confirmar</Button>
          </DialogFooter>
        </Dialog>
      </CardContent>
    </Card>
  )
}

const TABLE_ROWS = [
  { name: 'Ana Beatriz', role: 'Administradora', status: 'Ativo' },
  { name: 'Carlos Eduardo', role: 'Suporte', status: 'Ativo' },
  { name: 'Maria Fernanda', role: 'Financeiro', status: 'Suspenso' },
]

function TableExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Table</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TABLE_ROWS.map((row) => (
              <TableRow key={row.name}>
                <TableCell>{row.name}</TableCell>
                <TableCell className="text-muted-foreground">{row.role}</TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function ToastExample() {
  const { toast } = useToast()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Toast</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button onClick={() => toast({ title: 'Salvo com sucesso', variant: 'success' })}>
          Disparar sucesso
        </Button>
        <Button
          variant="outline"
          onClick={() => toast({ title: 'Não foi possível salvar', variant: 'destructive' })}
        >
          Disparar erro
        </Button>
      </CardContent>
    </Card>
  )
}

/** Grid de exemplos dos primitivos de UI (`src/components/ui/`), com todas
 * as variantes lado a lado — usado só pela `component-gallery-page`. */
export function PrimitivesSection() {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-lg font-semibold">Primitivos</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <ButtonsExample />
        <BadgesExample />
        <CardExample />
        <InputExample />
        <AlertsExample />
        <SkeletonExample />
        <TabsExample />
        <SwitchExample />
        <AvatarExample />
        <DialogExample />
        <TableExample />
        <ToastExample />
      </div>
    </section>
  )
}
