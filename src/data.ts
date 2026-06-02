import { MatchSession, UserProfile, Sport } from './types';

export const SPORTS: Sport[] = ['Badminton', 'Table Tennis', 'Football', 'Pickleball'];

export const AVATARS = [
  {
    id: 'chloe',
    name: 'Chloe J.',
    role: 'Female Pro Athlete',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAn2UimgReKuea7oCpD8paET1T1Gb3SkvHX0iXHxyeUQjtjE7xhC5ozMcXTq3LzsHYd2957cyjcflierHlK2535ucnyaIpxtwaiZhgf86W58lT9K69mkbOxBMm3k95oOawCLrR6ozf4rgs41U9AZdzIBkd7qg1DG8DabSdU6k7cokhBIJlenPOXj4KjRmgLXRVy9j8kse01o6Fx9quJDVCbwlf_UjH0MrD0UKASobLl2fLRZrCiZb8xqvnUKmBCAsKuVF1YGLWtra99'
  },
  {
    id: 'alex',
    name: 'Alex M.',
    role: 'Determined Male Athlete',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMyYz0O7EuM9TyYXZK_xNaT1lv1pt8rI8vmBBaxON6uQK6uPxcSQaf2xH0-yssLgJSmAFKNo56x-s7h3CuLO8WXntPb5fy2K-DxfiE2uSxAV5K7FAUBn59yGzSxsF4v_KtwT6Gnnn0s63hXUTIQwPnV9yEdHr4KKUdAxTsBP6qqohFx_F3qlZBkLlw5-ORAIzs5SU1xyGlvUg204c1c8Djstr5iX0O4x2G6JPCil4sk2z23Fmqvk8pUDXvUwStHXxhB9EHAgr_7Xe2'
  },
  {
    id: 'sarah',
    name: 'Sarah K.',
    role: 'University Student Athlete',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjk6Y_BH6mVoBHQWHqxGHBh1RPJnDJmS9dviAkzVki6mmKJAPVMvrs2X6YVci4U7MNLCjyjnqHHnaa-3zc7jxUHQXIrUb_0sP5GNJIUEykCzwQJAJPLR09dhFYVCd2wX_fQ-hJpNkJ7tVi8h3_gCe0dVhF_E7McGNgRziY8AijyRu8NFGSCjE4Qz8Q5d8enGp20Ti5lxJrKHLA3n2o8z-aGFL4XGDAQOVoLVooDMoLjjD-wkGJHI0mYMASba5D5Gy4_dH16gzxn90c'
  },
  {
    id: 'marcus',
    name: 'Marcus L.',
    role: 'Glowing Male Athlete',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6a2u0bS3MOnt38pWj_TijtXoXdbJdU94awd95q5kz5F-eLDnqsATdiH4C9VS_87UFerSOGLiN8PhCin9-kCMSQom7fFQcXrqVgnek7NcVUG2wLTzpfKQ3qssI_zZhSSHKkMtmAJ_T6TfaUHBbf8lKrdPGIRy-m1lgTvQMhPEbHj4u8fKFvaQeB5TDpkpa0NRKwqZ82OEq41wIoNyCrvSxvaUNHbYRUvPymj_DijBeqqHkebMO7EZB9bch3kcM7IDfs9SRcQonnGlb'
  },
  {
    id: 'jamie',
    name: 'Jamie T.',
    role: 'Focused Competitor',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4-K68b9_H9EJUib3C9aoDJKSa6EiSvVE7tYgayLCTLLP7evrQ0HPXVDpliESn5YQQKBB1CBy-SvldJ2dTZG7q7oJ7CHzBRPkV33eDLfrBmcKi22r68pB5dWdm_oBnVfHDbz7aX4psNvbCkfmridlQtmiz25PycFc28fO7uum-rt37zP6tkAkCOxYoUdY1aLafPlahd8lRiRpI63I3jb6ceO9IK4Uw6e24cWtQtaZsqOIM0PAfqLid3-s-e_Pl0tMnKnq3KSvdtwkB'
  },
  {
    id: 'elena',
    name: 'Elena R.',
    role: 'Elite Female Player',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDw77O5UCkSd6JPVBTvh9Fs7ZaZBYolotw4bH2reRoRv14ixVj0gsD4Q9dNqjt0FVTX9uxdMNclgZYDnm-5jThb5j_MQOamVIwGiWC-r7GPIJCSH_EFd7tAN78mx69KyMvEDJTSOlAznIxwGa3edO0MiAoycn3XjWb-Mbu6Qsno2PokKClXrEsysSJEKfgRGsa4Xe_V5JhIJg4_tupaS-NDvpuwZcuEK_7NlYa8cAwVNUMziiaQri7WYf6lfbuB_5PplcCu_4jQv4mO'
  }
];

export const DEFAULT_USER: UserProfile = {
  id: 'user_chloe',
  name: 'Chloe J.',
  avatar: AVATARS[0].url,
  skillLevel: 'intermediate',
  about: '',
  sportsPlayed: [],
  matchPreferences: '',
  sportingHistory: '',
  industry: ''
};

export const INITIAL_SESSIONS: MatchSession[] = [
  {
    id: 'session_1',
    date: '2024-10-24',
    timeStart: '18:00',
    timeEnd: '20:00',
    venue: 'Ethos Sport – Imperial College',
    address: 'Princes Gardens, London SW7 2AZ',
    sport: 'Badminton',
    location: { lat: 51.4988, lng: -0.1765, name: 'Ethos Sport – Imperial College', address: 'Princes Gardens, London SW7 2AZ' },
    skillLevel: 'intermediate',
    matchType: 'doubles',
    gender: 'open',
    maxPlayers: 4,
    host: {
      id: 'marcus',
      name: 'Marcus L.',
      avatar: AVATARS[3].url
    },
    playersJoined: [
      { id: 'marcus', name: 'Marcus L.', avatar: AVATARS[3].url },
      { id: 'sarah', name: 'Sarah K.', avatar: AVATARS[2].url }
    ],
    hostNote: 'Just booked Court 3 at Ethos. Friendly intermediate game. Bring a racket, and let\'s smash some high-speed shots!'
  },
  {
    id: 'session_2',
    date: '2024-10-25',
    timeStart: '20:30',
    timeEnd: '22:30',
    venue: 'Queen Mother Sports Centre',
    address: '223 Vauxhall Bridge Rd, London SW1V 1EL',
    sport: 'Badminton',
    location: { lat: 51.4931, lng: -0.1412, name: 'Queen Mother Sports Centre', address: '223 Vauxhall Bridge Rd, London SW1V 1EL' },
    skillLevel: 'beginner',
    matchType: 'singles',
    gender: 'open',
    maxPlayers: 2,
    host: {
      id: 'jamie',
      name: 'Jamie T.',
      avatar: AVATARS[4].url
    },
    playersJoined: [
      { id: 'jamie', name: 'Jamie T.', avatar: AVATARS[4].url }
    ],
    hostNote: 'Looking for a casual singles duel at Queen Mother. I\'m relatively new but know the basic rules. Let\'s have some fun!'
  },
  {
    id: 'session_3',
    date: '2024-10-26',
    timeStart: '19:00',
    timeEnd: '21:00',
    venue: 'Westway Sports & Fitness Centre',
    address: '1 Crowthorne Rd, London W10 6RP',
    sport: 'Badminton',
    location: { lat: 51.5180, lng: -0.2183, name: 'Westway Sports & Fitness Centre', address: '1 Crowthorne Rd, London W10 6RP' },
    skillLevel: 'pro',
    matchType: 'doubles',
    gender: 'male',
    maxPlayers: 4,
    host: {
      id: 'alex',
      name: 'Alex M.',
      avatar: AVATARS[1].url
    },
    playersJoined: [
      { id: 'alex', name: 'Alex M.', avatar: AVATARS[1].url },
      { id: 'marcus', name: 'Marcus L.', avatar: AVATARS[3].url },
      { id: 'sarah', name: 'Sarah K.', avatar: AVATARS[2].url },
      { id: 'chloe', name: 'Chloe J.', avatar: AVATARS[0].url }
    ],
    hostNote: 'Fast-paced, hard-hitting, competitive pro level doubles at Westway. Strict score counting!'
  },
  {
    id: 'session_4',
    date: '2024-10-27',
    timeStart: '18:00',
    timeEnd: '19:30',
    venue: 'Chelsea Sports Centre',
    address: 'Chelsea Manor St, London SW3 5PL',
    sport: 'Badminton',
    location: { lat: 51.4837, lng: -0.1742, name: 'Chelsea Sports Centre', address: 'Chelsea Manor St, London SW3 5PL' },
    skillLevel: 'intermediate',
    matchType: 'doubles',
    gender: 'open',
    maxPlayers: 4,
    host: {
      id: 'alex',
      name: 'Alex M.',
      avatar: AVATARS[1].url
    },
    playersJoined: [
      { id: 'alex', name: 'Alex M.', avatar: AVATARS[1].url },
      { id: 'sarah', name: 'Sarah K.', avatar: AVATARS[2].url },
      { id: 'jamie', name: 'Jamie T.', avatar: AVATARS[4].url }
    ],
    hostNote: 'Looking for a 4th at Chelsea Sports Centre. Intermediate-to-advanced level. Bring your own racket, shuttlecocks provided!'
  }
];
