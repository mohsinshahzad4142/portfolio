import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // مثال کے طور پر: اگر کوئی پرانا index.html کھولے تو وہ نئے ہوم پیج پر 301 ری ڈائریکٹ ہو جائے
      {
        source: '/index.html',
        destination: '/',
        permanent: true, // یہ 301 پرمیننٹ ری ڈائریکٹ ہے جو SEO کے لیے بہترین ہے
      },
      // اگر آپ کا کوئی پرانا سیکشن لنک یا پیج ہو، اسے یہاں ایڈ کر سکتے ہیں:
      // {
      //   source: '/old-about-page',
      //   destination: '/',
      //   permanent: true,
      // },
    ];
  },
};

export default nextConfig;