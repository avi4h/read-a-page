export interface BookPage {
  id: string;
  title: string;
  author: string;
  pageContent: string[];
  coverImageUrl: string;
  amazonBookUrl: string;
  submittedBy: string;
}

export interface ReadingSettings {
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  fontFamily: 'serif' | 'sans';
  textAlign: 'justify' | 'left';
  maxWidth: '2xl' | '3xl' | '4xl';
}

export type View = 'reading' | 'bookshelf' | 'search' | 'covers' | 'about';