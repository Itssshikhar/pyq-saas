declare module "next/dist/server/app-render/entry-base" {
    interface PageProps {
      params: Promise<any>;
    }
}