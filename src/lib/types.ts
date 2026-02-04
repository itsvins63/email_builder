export type Template = {
  id: string
  owner_id: string
  name: string
  current_design_json: unknown | null
  current_html: string | null
  created_at: string
  updated_at: string
}

export type TemplateShareRole = 'viewer' | 'editor'

export type TemplateShare = {
  template_id: string
  shared_with: string
  role: TemplateShareRole
  created_at: string
}

export type Profile = {
  id: string
  email: string
  created_at: string
}

export type TemplateVersion = {
  id: string
  template_id: string
  version: number
  saved_by: string
  design_json: unknown | null
  html: string | null
  created_at: string
}
