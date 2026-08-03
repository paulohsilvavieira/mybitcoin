import { type ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        // gcTime padrão (não 0): cada teste cria seu próprio QueryClient, então
        // não há vazamento entre testes. gcTime: 0 colide com setQueryData em
        // componentes sem nenhum useQuery observando a chave (ex: um mutation-only
        // como o LoginForm) — o React Query descarta a entrada assim que ela é
        // escrita, por falta de observador, antes da asserção rodar.
      },
    },
  })
}

interface AllProvidersProps {
  children: ReactNode
  queryClient: QueryClient
}

function AllProviders({ children, queryClient }: AllProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )
}

function renderWithProviders(
  ui: ReactNode,
  options?: Omit<RenderOptions, 'wrapper'> & { queryClient?: QueryClient },
) {
  const queryClient = options?.queryClient ?? createTestQueryClient()
  const result = render(ui, {
    ...options,
    wrapper: (props: { children: ReactNode }) => (
      <AllProviders queryClient={queryClient} {...props} />
    ),
  })
  return { ...result, queryClient }
}

export { renderWithProviders, createTestQueryClient }
