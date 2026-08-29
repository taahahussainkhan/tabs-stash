export interface CommentData {
  public_id?: string
  timestamp: number
  duration?: number
  text: string
}

export interface UpdateCommentPayload {
  content: string
  timestamp?: number
  chapter_or_episode?: string | null
  is_spoiler?: boolean
}
