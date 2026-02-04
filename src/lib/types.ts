export type Template = {
  id: string
  owner_id: string
  name: string
  current_design_json: any
  current_html: string | null
  created_at: string
  updated_at: string
}

export type TemplateShare = {
  template_id: string
  shared_with: string
  role: 'viewer' | 'editor'
  created_at: string
}

export type Profile = {
  id: string
  email: string
  created_at: string
}
