export interface Sahub {
  author?: string
  authorUsername?: string
  description: string
  deprecated?: boolean
  fileExtension?: string
  operatingSystem?: string
  repositoryId?: number
  repositoryName?: string
  repositoryPath?: string
  link?: string
  tags: string[]
  content?: string
  lineStart?: number
}

export interface StackOverflowQuestion {
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

export interface User {
  id: number | null
  username: string
  name: string
  avatar: string
}

export interface Repository {
  id: number
  name: string
  alreadySelected: boolean
}