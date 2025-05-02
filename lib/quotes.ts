const motivationalQuotes = [
  "Focus on being productive instead of busy.",
  "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
  "You don't have to be great to start, but you have to start to be great.",
  "Don't count the days, make the days count.",
  "The only way to do great work is to love what you do.",
  "Your focus determines your reality.",
  "Small progress is still progress.",
  "The best way to predict the future is to create it.",
  "It always seems impossible until it's done.",
  "The secret of getting ahead is getting started.",
  "Don't wait for inspiration. It comes while working.",
  "Productivity is never an accident. It is always the result of a commitment to excellence.",
  "You miss 100% of the shots you don't take.",
  "The most effective way to do it, is to do it.",
  "Action is the foundational key to all success.",
  "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.",
  "Your time is limited, don't waste it living someone else's life.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The difference between ordinary and extraordinary is that little extra.",
]

export function getMotivationalQuote(): string {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length)
  return motivationalQuotes[randomIndex]
}
