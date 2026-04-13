const memeFiles = import.meta.glob('../assets/memes/*', { eager: true })

function getMemesByType(type) {
  return Object.entries(memeFiles)
    .filter(([path]) => {
      const filename = path.split('/').pop().toLowerCase()
      return filename.startsWith(type)
    })
    .map(([, module]) => module.default)
}

export function getRandomMeme(type) {
  const memes = getMemesByType(type)
  if (memes.length === 0) return null
  return memes[Math.floor(Math.random() * memes.length)]
}
