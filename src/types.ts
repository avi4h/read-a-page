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
  fontSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fontFamily: 'serif' | 'sans';
  textAlign: 'justify' | 'left' | 'center';
  pageWidth: 'narrow' | 'medium' | 'wide';
}

export type View = 'reading' | 'bookshelf' | 'search' | 'covers' | 'about' | 'notfound' | 'admin';