export const getStatusColorClass = (status: string) => {
  switch (status) {
    case 'completed':
    case 'read':
    case 'finished':
      return 'text-[#4ade80] bg-[#143324] border-[#1e593a]'
    case 'watching':
    case 'reading':
      return 'text-[#2dd4bf] bg-[#0f2e2b] border-[#134e4a]'
    case 'paused':
    case 'on-hold':
      return 'text-[#fbbf24] bg-[#3b2c12] border-[#78350f]'
    case 'dropped':
      return 'text-[#f87171] bg-[#3b1818] border-[#7f1d1d]'
    case 'planning':
    case 'wishlist':
    case 'want-to-read':
      return 'text-[#a5b4fc] bg-[#1e1b4b] border-[#3730a3]'
    case 'rewatching':
    case 'rereading':
      return 'text-[#ff7b68] bg-[#3b1c18] border-[#991b1b]'
    default:
      return 'text-content-muted bg-[#191b20] border-[#2e323c]'
  }
}

export const getStatusDotClass = (status: string) => {
  switch (status) {
    case 'completed':
    case 'read':
    case 'finished':
      return 'bg-[#38a169]'
    case 'watching':
    case 'reading':
      return 'bg-[#0d9488]'
    case 'paused':
    case 'on-hold':
      return 'bg-[#e5a83b]'
    case 'dropped':
      return 'bg-[#e53e3e]'
    case 'planning':
    case 'wishlist':
    case 'want-to-read':
      return 'bg-[#5c67f2]'
    case 'rewatching':
    case 'rereading':
      return 'bg-[#e05a47]'
    default:
      return 'bg-content-muted'
  }
}
