import { z } from 'zod/v4'

export const loginSchema = z.object({
  email: z.email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

export type LoginFormData = z.infer<typeof loginSchema>
