import { redirect } from 'next/navigation'

export default function TemplateIdPage({ params }: { params: { id: string } }) {
  redirect(`/templates/${params.id}/edit`)
}
