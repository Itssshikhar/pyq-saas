declare module 'next/types' {
    type PageProps = {
      params: { [key: string]: string }
      searchParams?: { [key: string]: string | string[] | undefined }
    }
  }