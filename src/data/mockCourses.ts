export interface Course {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  coverUrl: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  stats: {
    users: number;
    rating: number;
  };
  price: number;
}

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'UI/UX Design Masterclass: Complete Figma Blueprint',
    description: 'Master modern UI/UX workflows in 10 weeks. Go from zero to professional.',
    tags: ['Design', 'Figma'],
    status: 'PUBLISHED',
    coverUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=600&auto=format&fit=crop',
    author: {
      name: 'Elena Rostova',
      role: 'Senior Product Designer',
      avatar: 'https://i.pravatar.cc/150?u=1'
    },
    stats: { users: 1250, rating: 4.8 },
    price: 149
  },
  {
    id: '2',
    title: 'React.js Fundamentals: Build Production Ready Apps',
    description: 'Deep dive into component lifecycle, state models, hooks, performance tools.',
    tags: ['React', 'Code'],
    status: 'DRAFT',
    coverUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop',
    author: {
      name: 'Akif Ansari',
      role: 'Lead Developer',
      avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
    },
    stats: { users: 340, rating: 4.6 },
    price: 0
  },
  {
    id: '3',
    title: 'Advanced TailwindCSS Techniques for Web Apps',
    description: 'Unlock complete custom configurations, bespoke responsive performance filters.',
    tags: ['CSS', 'Frontend'],
    status: 'ARCHIVED',
    coverUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop',
    author: {
      name: 'Marc Spencer',
      role: 'Systems Architect',
      avatar: 'https://i.pravatar.cc/150?u=3'
    },
    stats: { users: 920, rating: 4.9 },
    price: 49
  },
  {
    id: '4',
    title: 'Node.js Mastery: Build Scalable Applications',
    description: 'Learn to create robust Node.js applications with real-world examples and best practices.',
    tags: ['JavaScript', 'Backend'],
    status: 'PUBLISHED',
    coverUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop',
    author: {
      name: 'Sophie Kim',
      role: 'Full Stack Developer',
      avatar: 'https://i.pravatar.cc/150?u=4'
    },
    stats: { users: 500, rating: 4.7 },
    price: 99
  }
];
