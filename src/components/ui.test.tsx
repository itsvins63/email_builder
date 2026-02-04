import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CardButton, PrimaryButton, SecondaryButton } from './ui'

it('CardButton renders title and calls onClick', async () => {
  const user = userEvent.setup()
  const onClick = vi.fn()
  render(
    <CardButton
      title="Insert"
      icon={<span aria-label="icon">+</span>}
      onClick={onClick}
    />,
  )

  expect(screen.getByText('Insert')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /insert/i }))
  expect(onClick).toHaveBeenCalledTimes(1)
})

it('PrimaryButton merges className and respects disabled', () => {
  render(
    <PrimaryButton disabled className="my-extra">
      Save
    </PrimaryButton>,
  )
  const btn = screen.getByRole('button', { name: 'Save' })
  expect(btn).toBeDisabled()
  expect(btn).toHaveClass('my-extra')
})

it('SecondaryButton renders children', () => {
  render(<SecondaryButton>Cancel</SecondaryButton>)
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
})
