import { AudioTrack, Series, Artist, CategoryInfo } from '@/types/audio';

/**
 * SHRUTI CANONICAL AUDIO CATALOG
 *
 * Every entry corresponds to an object that exists in the Supabase Storage
 * bucket `audio/` (verified by HTTP HEAD against the public object URL).
 *
 * Durations are the decoded media durations reported by the file container
 * (ffprobe `format=duration`, rounded to whole seconds) — never estimated from
 * file size and an assumed bitrate. At runtime the player replaces these with
 * the browser's own `loadedmetadata`/`durationchange` value.
 */

// 1. OSHO - KRISHNA SMRITI (17 Verified Parts in Storage)
const krishnaParts = [
  { num: 1, p: '01', dur: 4200 },
  { num: 2, p: '02', dur: 6952 },
  { num: 3, p: '03', dur: 4164 },
  { num: 4, p: '04', dur: 5504 },
  { num: 5, p: '05', dur: 3281 },
  { num: 9, p: '09', dur: 4164 },
  { num: 11, p: '11', dur: 4707 },
  { num: 12, p: '12', dur: 5387 },
  { num: 13, p: '13', dur: 5110 },
  { num: 14, p: '14', dur: 6809 },
  { num: 15, p: '15', dur: 4838 },
  { num: 17, p: '17', dur: 3619 },
  { num: 18, p: '18', dur: 5917 },
  { num: 19, p: '19', dur: 4377 },
  { num: 20, p: '20', dur: 6811 },
  { num: 21, p: '21', dur: 3773 },
  { num: 22, p: '22', dur: 4869 },
];

const krishnaTracks: AudioTrack[] = krishnaParts.map(({ num, p, dur }) => ({
  id: `krishna-smriti-${p}`,
  title: `Krishna Smriti - Part ${p}`,
  subtitle: `Discourse ${num}`,
  slug: `krishna-smriti-${p}`,
  artistId: 'osho',
  artistName: 'Osho',
  seriesId: 'krishna-smriti',
  seriesName: 'Krishna Smriti',
  trackNumber: num,
  duration: dur,
  audioUrl: `osho/krishna-smriti/OSHO-Krishna_Smriti_${p}.mp3`,
  coverImage: '/covers/krishna-smriti.svg',
  category: 'Discourses',
  tags: ['Krishna', 'Gita', 'Discourses', 'Philosophy', 'Hindi'],
  description: `Osho's revolutionary commentary on Krishna - Part ${p}.`,
  isDownloadable: true,
  published: true,
  releaseDate: '1970-10-01',
  language: 'Hindi',
  playCount: 1240 - num * 15,
}));

// 2. OSHO - EK OMKAR SATNAM (20 Verified Parts in Storage)
const ekOmkarDurations = [
  6135, 5100, 5199, 5557, 4662, 5142, 4535, 4215, 4911, 4713,
  6506, 4935, 4315, 4855, 4841, 4921, 5463, 6053, 5364, 5958,
];

const ekOmkarTracks: AudioTrack[] = Array.from({ length: 20 }, (_, i) => {
  const num = i + 1;
  const p = num.toString().padStart(2, '0');
  return {
    id: `ek-omkar-satnam-${p}`,
    title: `Ek Omkar Satnam - Part ${p}`,
    subtitle: `Discourse ${num}`,
    slug: `ek-omkar-satnam-${p}`,
    artistId: 'osho',
    artistName: 'Osho',
    seriesId: 'ek-omkar-satnam',
    seriesName: 'Ek Omkar Satnam',
    trackNumber: num,
    duration: ekOmkarDurations[i],
    audioUrl: `osho/OSHO-Ek_Omkar_Satnam/OSHO-Ek_Omkar_Satnam_${p}.mp3`,
    coverImage: '/covers/ek-omkar-satnam.svg',
    category: 'Philosophy',
    tags: ['Nanak', 'Japji', 'Sufi', 'Devotion', 'Hindi'],
    description: `Discourses on Japji Sahib of Guru Nanak - Part ${p}.`,
    isDownloadable: true,
    published: true,
    releaseDate: '1972-01-01',
    language: 'Hindi',
    playCount: 980 - i * 10,
  };
});

// 3. OSHO - MAHAVEER VANI (20 Verified Parts in Storage)
const mahaveerDurations = [
  4823, 5817, 4641, 5194, 4616, 5092, 5043, 4931, 4557, 5355,
  4768, 4901, 4404, 5170, 5258, 5047, 4774, 4884, 4715, 4318,
];

const mahaveerTracks: AudioTrack[] = Array.from({ length: 20 }, (_, i) => {
  const num = i + 1;
  const p = num.toString().padStart(2, '0');
  return {
    id: `mahaveer-vani-${p}`,
    title: `Mahaveer Vani - Part ${p}`,
    subtitle: `Discourse ${num}`,
    slug: `mahaveer-vani-${p}`,
    artistId: 'osho',
    artistName: 'Osho',
    seriesId: 'mahaveer-vani',
    seriesName: 'Mahaveer Vani',
    trackNumber: num,
    duration: mahaveerDurations[i],
    audioUrl: `osho/OSHO-Mahaveer_Vani/OSHO-Mahaveer_Vani_${p}.mp3`,
    coverImage: '/covers/mahaveer-vani.svg',
    category: 'Philosophy',
    tags: ['Mahavira', 'Jainism', 'Awareness', 'Silence', 'Hindi'],
    description: `Commentary on Bhagwan Mahavira's timeless vision of awareness and non-violence - Part ${p}.`,
    isDownloadable: true,
    published: true,
    releaseDate: '1974-05-01',
    language: 'Hindi',
    playCount: 850 - i * 8,
  };
});

// 4. OSHO - MARE HE JOGI MARO (3 Verified Parts in Storage)
const mareHeJogiDurations = [7052, 6537, 6606];

const mareHeJogiTracks: AudioTrack[] = Array.from({ length: 3 }, (_, i) => {
  const num = i + 1;
  const p = num.toString().padStart(2, '0');
  return {
    id: `mare-he-jogi-maro-${p}`,
    title: `Mare He Jogi Maro - Part ${p}`,
    subtitle: `Discourse ${num}`,
    slug: `mare-he-jogi-maro-${p}`,
    artistId: 'osho',
    artistName: 'Osho',
    seriesId: 'mare-he-jogi-maro',
    seriesName: 'Mare He Jogi Maro',
    trackNumber: num,
    duration: mareHeJogiDurations[i],
    audioUrl: `osho/OSHO-Mare_He_Jogi_Maro/OSHO-Mare_He_Jogi_Maro_${p}.mp3`,
    coverImage: '/covers/mare-he-jogi-maro.svg',
    category: 'Discourses',
    tags: ['Gorakh', 'Nath', 'Yoga', 'Mysticism', 'Hindi'],
    description: `Discourses on Gorakhnath: The path of inner death and rebirth - Part ${p}.`,
    isDownloadable: true,
    published: true,
    releaseDate: '1978-02-01',
    language: 'Hindi',
    playCount: 650 - i * 12,
  };
});

// 5. OSHO - NIRVAN UPANISHAD (4 Verified Parts in Storage)
const nirvanDurations = [5939, 4792, 4603, 3815];

const nirvanTracks: AudioTrack[] = Array.from({ length: 4 }, (_, i) => {
  const num = i + 1;
  const p = num.toString().padStart(2, '0');
  return {
    id: `nirvan-upanishad-${p}`,
    title: `Nirvan Upanishad - Part ${p}`,
    subtitle: `Discourse ${num}`,
    slug: `nirvan-upanishad-${p}`,
    artistId: 'osho',
    artistName: 'Osho',
    seriesId: 'nirvan-upanishad',
    seriesName: 'Nirvan Upanishad',
    trackNumber: num,
    duration: nirvanDurations[i],
    audioUrl: `osho/OSHO-Nirvan_Upanishad/OSHO-Nirvan_Upanishad_${p}.mp3`,
    coverImage: '/covers/nirvan-upanishad.svg',
    category: 'Upanishads',
    tags: ['Upanishads', 'Vedanta', 'Enlightenment', 'Hindi'],
    description: `Insights into Nirvan Upanishad: The Cessation of Mind - Part ${p}.`,
    isDownloadable: true,
    published: true,
    releaseDate: '1973-11-01',
    language: 'Hindi',
    playCount: 720 - i * 10,
  };
});

// 6. OSHO - ADHYATAM UPANISHAD (3 Verified Parts in Storage)
const adhyatamDurations = [6978, 5584, 5802];

const adhyatamTracks: AudioTrack[] = Array.from({ length: 3 }, (_, i) => {
  const num = i + 1;
  const p = num.toString().padStart(2, '0');
  return {
    id: `adhyatam-upanishad-${p}`,
    title: `Adhyatam Upanishad - Part ${p}`,
    subtitle: `Discourse ${num}`,
    slug: `adhyatam-upanishad-${p}`,
    artistId: 'osho',
    artistName: 'Osho',
    seriesId: 'adhyatam-upanishad',
    seriesName: 'Adhyatam Upanishad',
    trackNumber: num,
    duration: adhyatamDurations[i],
    audioUrl: `osho/OSHO-Adhyatam_Upanishad/OSHO-Adhyatam_Upanishad_${p}.mp3`,
    coverImage: '/covers/adhyatam-upanishad.svg',
    category: 'Upanishads',
    tags: ['Upanishads', 'Vedanta', 'Inner Inquiry', 'Hindi'],
    description: `Commentary on the Adhyatam Upanishad: Exploring the inner dimension of consciousness - Part ${p}.`,
    isDownloadable: true,
    published: true,
    releaseDate: '1973-12-01',
    language: 'Hindi',
    playCount: 540 - i * 10,
  };
});

// 7. OSHO - ASAMBHAV KRANTI (10 Verified Parts in Storage)
const asambhavDurations = [3915, 4744, 3579, 4546, 4585, 3669, 3939, 4611, 3422, 3846];

const asambhavTracks: AudioTrack[] = Array.from({ length: 10 }, (_, i) => {
  const num = i + 1;
  const p = num.toString().padStart(2, '0');
  return {
    id: `asambhav-kranti-${p}`,
    title: `Asambhav Kranti - Part ${p}`,
    subtitle: `Discourse ${num}`,
    slug: `asambhav-kranti-${p}`,
    artistId: 'osho',
    artistName: 'Osho',
    seriesId: 'asambhav-kranti',
    seriesName: 'Asambhav Kranti',
    trackNumber: num,
    duration: asambhavDurations[i],
    audioUrl: `osho/OSHO-Asambhav_Kranti/OSHO-Asambhav_Kranti_${p}.mp3`,
    coverImage: '/covers/asambhav-kranti.svg',
    category: 'Discourses',
    tags: ['Revolution', 'Transformation', 'Discourses', 'Hindi'],
    description: `Discourses on the revolutionary mutation of the mind and awakening - Part ${p}.`,
    isDownloadable: true,
    published: true,
    releaseDate: '1971-08-01',
    language: 'Hindi',
    playCount: 680 - i * 8,
  };
});

// 8. OSHO - ISHAVASHYA UPANISHAD (3 Verified Parts in Storage)
const ishavashyaDurations = [4902, 3817, 3932];

const ishavashyaTracks: AudioTrack[] = Array.from({ length: 3 }, (_, i) => {
  const num = i + 1;
  const p = num.toString().padStart(2, '0');
  return {
    id: `ishavashya-upanishad-${p}`,
    title: `Ishavashya Upanishad - Part ${p}`,
    subtitle: `Discourse ${num}`,
    slug: `ishavashya-upanishad-${p}`,
    artistId: 'osho',
    artistName: 'Osho',
    seriesId: 'ishavashya-upanishad',
    seriesName: 'Ishavashya Upanishad',
    trackNumber: num,
    duration: ishavashyaDurations[i],
    audioUrl: `osho/OSHO-Ishavashya_Upanishad/OSHO-Ishavashya_Upanishad_${p}.mp3`,
    coverImage: '/covers/ishavashya-upanishad.svg',
    category: 'Upanishads',
    tags: ['Upanishads', 'Isha', 'Vedanta', 'Divine Wholeness', 'Hindi'],
    description: `Commentaries on the foundational Ishavashya Upanishad - Part ${p}.`,
    isDownloadable: true,
    published: true,
    releaseDate: '1971-04-01',
    language: 'Hindi',
    playCount: 620 - i * 10,
  };
});

// 9. OSHO - KAIVALYA UPANISHAD (3 Verified Parts in Storage)
const kaivalyaDurations = [5980, 6773, 6345];

const kaivalyaTracks: AudioTrack[] = Array.from({ length: 3 }, (_, i) => {
  const num = i + 1;
  const p = num.toString().padStart(2, '0');
  return {
    id: `kaivalya-upanishad-${p}`,
    title: `Kaivalya Upanishad - Part ${p}`,
    subtitle: `Discourse ${num}`,
    slug: `kaivalya-upanishad-${p}`,
    artistId: 'osho',
    artistName: 'Osho',
    seriesId: 'kaivalya-upanishad',
    seriesName: 'Kaivalya Upanishad',
    trackNumber: num,
    duration: kaivalyaDurations[i],
    audioUrl: `osho/OSHO-Kaivalya_Upanishad/OSHO-Kaivalya_Upanishad_${p}.mp3`,
    coverImage: '/covers/kaivalya-upanishad.svg',
    category: 'Upanishads',
    tags: ['Upanishads', 'Kaivalya', 'Aloneness', 'Liberation', 'Hindi'],
    description: `Discourses on Kaivalya: The Supreme state of transcendental aloneness - Part ${p}.`,
    isDownloadable: true,
    published: true,
    releaseDate: '1972-06-01',
    language: 'Hindi',
    playCount: 510 - i * 10,
  };
});

// 10. OSHO - BHAJ GOVINDAM (10 Verified Parts in Storage)
const bhajGovindamDurations = [6252, 5661, 4868, 4883, 4165, 5038, 4253, 5228, 4814, 4488];

const bhajGovindamTracks: AudioTrack[] = Array.from({ length: 10 }, (_, i) => {
  const num = i + 1;
  const p = num.toString().padStart(2, '0');
  return {
    id: `bhaj-govindam-${p}`,
    title: `Bhaj Govindam - Part ${p}`,
    subtitle: `Discourse ${num}`,
    slug: `bhaj-govindam-${p}`,
    artistId: 'osho',
    artistName: 'Osho',
    seriesId: 'bhaj-govindam',
    seriesName: 'Bhaj Govindam',
    trackNumber: num,
    duration: bhajGovindamDurations[i],
    audioUrl: `osho/OSHO-Bhaj Govindam/OSHO-Bhaj_Govindam_${p}.mp3`,
    coverImage: '/covers/bhaj-govindam.svg',
    category: 'Discourses',
    tags: ['Bhaj Govindam', 'Adi Shankara', 'Devotion', 'Wisdom', 'Hindi'],
    description: `Discourses on Adi Shankaracharya's Bhaj Govindam: Song of Devotion and Awakening - Part ${p}.`,
    isDownloadable: true,
    published: true,
    releaseDate: '1974-03-01',
    language: 'Hindi',
    playCount: 790 - i * 12,
  };
});

// ALL VERIFIED SPOKEN TRACKS (93 Real MP3 Tracks)
export const SEED_TRACKS: AudioTrack[] = [
  ...krishnaTracks,
  ...ekOmkarTracks,
  ...mahaveerTracks,
  ...mareHeJogiTracks,
  ...nirvanTracks,
  ...adhyatamTracks,
  ...asambhavTracks,
  ...ishavashyaTracks,
  ...kaivalyaTracks,
  ...bhajGovindamTracks,
];

// ALL 12 REAL SERIES IN SHRUTI ARCHIVE
export const SEED_SERIES: Series[] = [
  {
    id: 'krishna-smriti',
    title: 'Krishna Smriti',
    subtitle: '17 Discourse Recordings',
    slug: 'krishna-smriti',
    artistId: 'osho',
    artistName: 'Osho',
    description:
      'Spontaneous discourses exploring the multidimensionality of Krishna — dancer, warrior, lover, statesman, and the ultimate celebration of life without guilt.',
    coverImage: '/covers/krishna-smriti.svg',
    totalTracks: 17,
    totalDuration: krishnaParts.reduce((acc, cur) => acc + cur.dur, 0),
    trackIds: krishnaTracks.map((t) => t.id),
    category: 'Discourses',
    tags: ['Krishna', 'Gita', 'Discourses', 'Philosophy', 'Hindi'],
    releaseDate: '1970-10-01',
    published: true,
  },
  {
    id: 'ek-omkar-satnam',
    title: 'Ek Omkar Satnam',
    subtitle: '20 Discourse Recordings',
    slug: 'ek-omkar-satnam',
    artistId: 'osho',
    artistName: 'Osho',
    description:
      'Exposition of Japji Sahib by Guru Nanak, presenting devotion and surrender as the pinnacle of human awakening.',
    coverImage: '/covers/ek-omkar-satnam.svg',
    totalTracks: 20,
    totalDuration: ekOmkarDurations.reduce((acc, cur) => acc + cur, 0),
    trackIds: ekOmkarTracks.map((t) => t.id),
    category: 'Philosophy',
    tags: ['Nanak', 'Japji', 'Sufi', 'Devotion', 'Hindi'],
    releaseDate: '1972-01-01',
    published: true,
  },
  {
    id: 'mahaveer-vani',
    title: 'Mahaveer Vani',
    subtitle: '20 Discourse Recordings',
    slug: 'mahaveer-vani',
    artistId: 'osho',
    artistName: 'Osho',
    description:
      'A deep and fearless commentary on the message of Bhagwan Mahavira, illuminating the science of consciousness, austerities, and unconditional non-violence.',
    coverImage: '/covers/mahaveer-vani.svg',
    totalTracks: 20,
    totalDuration: mahaveerDurations.reduce((acc, cur) => acc + cur, 0),
    trackIds: mahaveerTracks.map((t) => t.id),
    category: 'Philosophy',
    tags: ['Mahavira', 'Jainism', 'Awareness', 'Silence', 'Hindi'],
    releaseDate: '1974-05-01',
    published: true,
  },
  {
    id: 'bhaj-govindam',
    title: 'Bhaj Govindam',
    subtitle: '10 Discourse Recordings',
    slug: 'bhaj-govindam',
    artistId: 'osho',
    artistName: 'Osho',
    description:
      'Discourses on Adi Shankaracharya’s Bhaj Govindam — a fierce, compassionate wake-up call dismantling worldly illusions with intense devotion and clarity.',
    coverImage: '/covers/bhaj-govindam.svg',
    totalTracks: 10,
    totalDuration: bhajGovindamDurations.reduce((acc, cur) => acc + cur, 0),
    trackIds: bhajGovindamTracks.map((t) => t.id),
    category: 'Discourses',
    tags: ['Bhaj Govindam', 'Adi Shankara', 'Devotion', 'Wisdom', 'Hindi'],
    releaseDate: '1974-03-01',
    published: true,
  },
  {
    id: 'mare-he-jogi-maro',
    title: 'Mare He Jogi Maro',
    subtitle: '3 Discourse Recordings',
    slug: 'mare-he-jogi-maro',
    artistId: 'osho',
    artistName: 'Osho',
    description:
      'Discourses on Gorakhnath: An exploration into the esoteric mystery of dying into meditation to be reborn into the eternal.',
    coverImage: '/covers/mare-he-jogi-maro.svg',
    totalTracks: 3,
    totalDuration: mareHeJogiDurations.reduce((acc, cur) => acc + cur, 0),
    trackIds: mareHeJogiTracks.map((t) => t.id),
    category: 'Discourses',
    tags: ['Gorakh', 'Nath', 'Yoga', 'Mysticism', 'Hindi'],
    releaseDate: '1978-02-01',
    published: true,
  },
  {
    id: 'nirvan-upanishad',
    title: 'Nirvan Upanishad',
    subtitle: '4 Discourse Recordings',
    slug: 'nirvan-upanishad',
    artistId: 'osho',
    artistName: 'Osho',
    description:
      'Deep luminous insights into the ancient Vedic wisdom of liberation, transcendental silence, and cosmic unity.',
    coverImage: '/covers/nirvan-upanishad.svg',
    totalTracks: 4,
    totalDuration: nirvanDurations.reduce((acc, cur) => acc + cur, 0),
    trackIds: nirvanTracks.map((t) => t.id),
    category: 'Upanishads',
    tags: ['Upanishads', 'Vedanta', 'Enlightenment', 'Hindi'],
    releaseDate: '1973-11-01',
    published: true,
  },
  {
    id: 'adhyatam-upanishad',
    title: 'Adhyatam Upanishad',
    subtitle: '3 Discourse Recordings',
    slug: 'adhyatam-upanishad',
    artistId: 'osho',
    artistName: 'Osho',
    description:
      'Profound commentary on the Adhyatam Upanishad, exploring the inner spiritual dimension of self-inquiry and the dissolution of duality.',
    coverImage: '/covers/adhyatam-upanishad.svg',
    totalTracks: 3,
    totalDuration: adhyatamDurations.reduce((acc, cur) => acc + cur, 0),
    trackIds: adhyatamTracks.map((t) => t.id),
    category: 'Upanishads',
    tags: ['Upanishads', 'Vedanta', 'Inner Inquiry', 'Hindi'],
    releaseDate: '1973-12-01',
    published: true,
  },
  {
    id: 'asambhav-kranti',
    title: 'Asambhav Kranti',
    subtitle: '10 Discourse Recordings',
    slug: 'asambhav-kranti',
    artistId: 'osho',
    artistName: 'Osho',
    description:
      'The impossible revolution: discourses on breaking conditioned thought patterns and bringing about a radical mutation in human consciousness.',
    coverImage: '/covers/asambhav-kranti.svg',
    totalTracks: 10,
    totalDuration: asambhavDurations.reduce((acc, cur) => acc + cur, 0),
    trackIds: asambhavTracks.map((t) => t.id),
    category: 'Discourses',
    tags: ['Revolution', 'Transformation', 'Discourses', 'Hindi'],
    releaseDate: '1971-08-01',
    published: true,
  },
  {
    id: 'ishavashya-upanishad',
    title: 'Ishavashya Upanishad',
    subtitle: '3 Discourse Recordings',
    slug: 'ishavashya-upanishad',
    artistId: 'osho',
    artistName: 'Osho',
    description:
      'Commentaries on the opening jewel of the Upanishads — Ishavashya: the realization that the entire cosmos is permeated with the sacred divine whole.',
    coverImage: '/covers/ishavashya-upanishad.svg',
    totalTracks: 3,
    totalDuration: ishavashyaDurations.reduce((acc, cur) => acc + cur, 0),
    trackIds: ishavashyaTracks.map((t) => t.id),
    category: 'Upanishads',
    tags: ['Upanishads', 'Isha', 'Vedanta', 'Divine Wholeness', 'Hindi'],
    releaseDate: '1971-04-01',
    published: true,
  },
  {
    id: 'kaivalya-upanishad',
    title: 'Kaivalya Upanishad',
    subtitle: '3 Discourse Recordings',
    slug: 'kaivalya-upanishad',
    artistId: 'osho',
    artistName: 'Osho',
    description:
      'A deep exposition of Kaivalya — the supreme state of spiritual aloneness, transcendence of worldly bondage, and merging into pure existence.',
    coverImage: '/covers/kaivalya-upanishad.svg',
    totalTracks: 3,
    totalDuration: kaivalyaDurations.reduce((acc, cur) => acc + cur, 0),
    trackIds: kaivalyaTracks.map((t) => t.id),
    category: 'Upanishads',
    tags: ['Upanishads', 'Kaivalya', 'Aloneness', 'Liberation', 'Hindi'],
    releaseDate: '1972-06-01',
    published: true,
  },
  {
    id: 'sarvasar-upanishad',
    title: 'Sarvasar Upanishad',
    subtitle: 'Upanishadic Commentary',
    slug: 'sarvasar-upanishad',
    artistId: 'osho',
    artistName: 'Osho',
    description:
      'Commentaries on the Sarvasar Upanishad — extracting the core essence of Upanishadic revelation on the nature of Brahman, Atman, and illusion.',
    coverImage: '/covers/sarvasar-upanishad.svg',
    totalTracks: 0,
    totalDuration: 0,
    trackIds: [],
    category: 'Upanishads',
    tags: ['Upanishads', 'Vedanta', 'Brahman', 'Essence', 'Hindi'],
    releaseDate: '1973-05-01',
    published: true,
  },
  {
    id: 'ashtavakra-geeta',
    title: 'Ashtavakra Geeta',
    subtitle: 'The Ultimate Freedom',
    slug: 'ashtavakra-geeta',
    artistId: 'osho',
    artistName: 'Osho',
    description:
      'The highest flight of non-dual awareness: direct dialogue on instant enlightenment, freedom from bondage, and pure witnessing consciousness.',
    coverImage: '/covers/ashtavakra-geeta.svg',
    totalTracks: 0,
    totalDuration: 0,
    trackIds: [],
    category: 'Discourses',
    tags: ['Ashtavakra', 'Advaita', 'Non-Duality', 'Freedom', 'Hindi'],
    releaseDate: '1976-09-01',
    published: true,
  },
];

// SPEAKER
export const SEED_ARTISTS: Artist[] = [
  {
    id: 'osho',
    name: 'Osho',
    slug: 'osho',
    role: 'Enlightened Mystic & Master',
    bio: 'Osho is an Indian mystic and spiritual teacher whose spoken discourses cover a wide range of Eastern and Western spiritual traditions, Upanishads, Gita, Sufism, Tantra, and Zen.',
    image: '/covers/default-cover.svg',
    trackCount: 93,
    seriesCount: 12,
    tags: ['Discourses', 'Philosophy', 'Upanishads'],
  },
];

// REAL CATEGORIES
export const SEED_CATEGORIES: CategoryInfo[] = [
  {
    id: 'discourses',
    title: 'Discourses',
    description: 'Spoken talks and commentaries on spiritual classics.',
    coverImage: '/covers/krishna-smriti.svg',
    count: 40,
  },
  {
    id: 'philosophy',
    title: 'Philosophy',
    description: 'Teachings of Mahavira, Guru Nanak, and Eastern masters.',
    coverImage: '/covers/ek-omkar-satnam.svg',
    count: 40,
  },
  {
    id: 'upanishads',
    title: 'Upanishads',
    description: 'Commentaries on ancient Vedic wisdom and liberation.',
    coverImage: '/covers/nirvan-upanishad.svg',
    count: 13,
  },
];
