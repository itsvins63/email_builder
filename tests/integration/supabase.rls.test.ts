import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'

async function authedClient(
  url: string,
  anonKey: string,
  email: string,
  password: string,
): Promise<SupabaseClient> {
  const client = createClient(url, anonKey)
  const { error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw error
  return client
}

describe('Supabase RLS: templates + shares', () => {
  const url = process.env.SUPABASE_URL
  const anonKey = process.env.SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !anonKey || !serviceKey) {
    it.skip('set SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY to run', () => {})
    return
  }

  const admin = createClient(url, serviceKey)

  const ownerEmail = `owner_${randomUUID()}@example.com`
  const viewerEmail = `viewer_${randomUUID()}@example.com`
  const ownerPassword = 'Passw0rd!Passw0rd!'
  const viewerPassword = 'Passw0rd!Passw0rd!'

  let ownerId: string
  let viewerId: string
  let templateId: string

  beforeAll(async () => {
    const o = await admin.auth.admin.createUser({
      email: ownerEmail,
      password: ownerPassword,
      email_confirm: true,
    })
    if (o.error) throw o.error
    ownerId = o.data.user!.id

    const v = await admin.auth.admin.createUser({
      email: viewerEmail,
      password: viewerPassword,
      email_confirm: true,
    })
    if (v.error) throw v.error
    viewerId = v.data.user!.id
  })

  afterAll(async () => {
    // Best-effort cleanup
    if (templateId) {
      await admin.from('templates').delete().eq('id', templateId)
    }
    if (ownerId) await admin.auth.admin.deleteUser(ownerId)
    if (viewerId) await admin.auth.admin.deleteUser(viewerId)
  })

  it('viewer can read shared templates but cannot update unless editor', async () => {
    const owner = await authedClient(url, anonKey, ownerEmail, ownerPassword)

    const ins = await owner
      .from('templates')
      .insert({ owner_id: ownerId, name: 'Hello', current_html: '<p>Hi</p>' })
      .select('id')
      .single()
    if (ins.error) throw ins.error
    templateId = ins.data.id

    // Share as viewer
    const shareViewer = await owner
      .from('template_shares')
      .insert({ template_id: templateId, shared_with: viewerId, role: 'viewer' })
    if (shareViewer.error) throw shareViewer.error

    const viewer = await authedClient(url, anonKey, viewerEmail, viewerPassword)

    const canSee = await viewer.from('templates').select('id,name').eq('id', templateId)
    if (canSee.error) throw canSee.error
    expect(canSee.data).toHaveLength(1)

    const cannotUpdate = await viewer
      .from('templates')
      .update({ name: 'Nope' })
      .eq('id', templateId)
    expect(cannotUpdate.error).toBeTruthy()

    // Promote to editor
    const promote = await owner
      .from('template_shares')
      .update({ role: 'editor' })
      .eq('template_id', templateId)
      .eq('shared_with', viewerId)
    if (promote.error) throw promote.error

    const canUpdate = await viewer
      .from('templates')
      .update({ name: 'Yep' })
      .eq('id', templateId)
      .select('name')
      .single()
    if (canUpdate.error) throw canUpdate.error
    expect(canUpdate.data.name).toBe('Yep')
  })
})
