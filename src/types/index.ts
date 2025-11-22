// Common type definitions

export interface Creator {
  id: string
  name: string
  platform: 'youtube' | 'instagram' | 'tiktok' | 'twitter'
  followers: number
  engagementRate: number
}

export interface Metric {
  id: string
  creatorId: string
  views: number
  likes: number
  comments: number
  shares: number
  date: string
}

export interface Attribution {
  id: string
  creatorId: string
  contentId: string
  conversions: number
  revenue: number
  date: string
}
