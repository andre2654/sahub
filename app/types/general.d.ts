export interface Sahub {
  author?: string
  description: string
  deprecated?: boolean
  fileExtension?: string
  operatingSystem?: string
  link?: string
  tags: string[]
  content?: string
  lineStart?: number
}

export interface stackOverflowQuestion {
  tags: string[]
  owner: {
    account_id: number
    reputation: number
    user_id: number
    user_type: string
    profile_image: string
    display_name: string
    link: string
  },
  post_state: string
  is_answered: boolean
  view_count: number
  answer_count: number
  score: number
  last_activity_date: number
  creation_date: number
  last_edit_date: number
  question_id: number
  content_license: string
  link: string
  title: string
}