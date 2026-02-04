import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginClient from './LoginClient'

const signInWithOAuth = vi.fn(async () => ({ data: null, error: null }))

vi.mock('@/lib/supabase/browser', () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth,
    },
  }),
}))

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('next=%2Ftemplates%2Fabc'),
}))

it('calls Supabase signInWithOAuth with google provider and callback redirect', async () => {
  const user = userEvent.setup()

  // jsdom default is about:blank; provide origin for redirectTo
  Object.defineProperty(window, 'location', {
    value: { origin: 'http://localhost:3000' },
    writable: true,
  })

  render(<LoginClient />)

  await user.click(screen.getByRole('button', { name: /continue with google/i }))

  expect(signInWithOAuth).toHaveBeenCalledTimes(1)
  expect(signInWithOAuth).toHaveBeenCalledWith({
    provider: 'google',
    options: {
      redirectTo:
        'http://localhost:3000/auth/callback?next=%2Ftemplates%2Fabc',
    },
  })
})
