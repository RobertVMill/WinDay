type ActivityCategory = {
  [key: string]: string[];
};

export const activities: ActivityCategory = {
  first_thing: [
    'Dance Meditation',
    'Nature Sound Meditation',
    'Walking Meditation',
    'Gratitude Meditation',
    'Candlelight Meditation'
  ],
  early_morning: [
    'Morning Yoga Flow',
    'Beach Run',
    'Park HIIT Session',
    'Swimming',
    'Rock Climbing',
    'Trail Running',
    'Dance Workout'
  ],
  morning: [
    'Write a Short Story',
    'Learn a Magic Trick',
    'Practice Guitar',
    'Draw Something',
    'Photography Walk',
    'Write Poetry',
    'Learn a New Language'
  ],
  mid_morning: [
    'Work on Personal Project',
    'Learn to Code Something Fun',
    'Build Something',
    'Design Something Creative',
    'Start a Fun Side Project',
    'Learn 3D Modeling',
    'Create Digital Art'
  ],
  lunch: [
    'Picnic in the Park',
    'Try a New Restaurant',
    'Cook Something Exotic',
    'Food Truck Adventure',
    'Rooftop Lunch',
    'Beach Lunch',
    'Garden Lunch'
  ],
  afternoon: [
    'Visit a Museum',
    'Go to an Art Gallery',
    'Take a Workshop',
    'Join a Class',
    'Learn Something New',
    'Visit a Library',
    'Explore a New Place'
  ],
  evening: [
    'Board Game Night',
    'Movie Marathon',
    'Stargazing',
    'Game Development',
    'Learn an Instrument',
    'Paint Something',
    'Write Music'
  ],
  night: [
    'Watch a Documentary',
    'Read a Fantasy Book',
    'Listen to a Podcast',
    'Plan Next Adventure',
    'Virtual Reality Games',
    'Watch Comedy Shows',
    'Play Video Games'
  ],
  journal: [
    'Creative Writing',
    'Dream Journaling',
    'Art Journaling',
    'Future Vision Board',
    'Memory Collection',
    'Idea Brainstorming',
    'Adventure Planning'
  ]
};

export function getRandomActivity(phase: string): string {
  const options = activities[phase] || [];
  if (options.length === 0) return 'Relax';
  
  const randomIndex = Math.floor(Math.random() * options.length);
  return options[randomIndex];
}

export function generateRandomDay(): { [key: string]: string } {
  const phases = Object.keys(activities);
  const randomDay: { [key: string]: string } = {};
  
  phases.forEach(phase => {
    randomDay[phase] = getRandomActivity(phase);
  });
  
  return randomDay;
}
