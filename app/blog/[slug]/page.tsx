import { db } from '../../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  createdAt: any;
  coverImage?: string;
}

type Props = {
  params: Promise<{ slug: string }>;
};

// 1. Dynamic Metadata & OpenGraph Tags (2026 Best Practices for SEO & Social Sharing)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const q = query(collection(db, 'blogs'), where('slug', '==', slug));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const post = querySnapshot.docs[0].data() as BlogPost;
      const description = post.excerpt || post.content.substring(0, 160) + '...';
      const imageUrl = post.coverImage || 'https://mohsinshahzad.vercel.app/og-default.png';

      return {
        title: `${post.title} — Muhammad.ai Blog`,
        description: description,
        openGraph: {
          title: post.title,
          description: description,
          url: `https://mohsinshahzad.vercel.app/blog/${slug}`,
          siteName: 'Muhammad.ai Portfolio & Blog',
          images: [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ],
          type: 'article',
        },
        twitter: {
          card: 'summary_large_image',
          title: post.title,
          description: description,
          images: [imageUrl],
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  return {
    title: 'Article Not Found | Muhammad.ai',
    description: 'The requested article could not be found.',
  };
}

// 2. Fetch Blog Post Data on Server
async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const q = query(collection(db, 'blogs'), where('slug', '==', slug));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...(docSnap.data() as Omit<BlogPost, 'id'>) };
    }
  } catch (error) {
    console.error('Error fetching blog post:', error);
  }
  return null;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="text-2xl font-bold text-gray-900 tracking-tight">
              Muhammad<span className="text-blue-600">.ai</span>
            </Link>
            <Link href="/blog" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              ← Back to Blog
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <div className="mb-8">
          {post.createdAt && (
            <p className="text-sm text-blue-600 font-semibold mb-2">
              {new Date(
                post.createdAt?.seconds ? post.createdAt.seconds * 1000 : post.createdAt
              ).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          )}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
            {post.title}
          </h1>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Cloudinary Cover Image Preview */}
          {post.coverImage && (
            <div className="mb-10 overflow-hidden rounded-2xl border border-gray-100 shadow-sm bg-gray-50">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-auto object-cover max-h-[450px]"
              />
            </div>
          )}
        </div>

        <hr className="border-gray-100 mb-10" />

        {/* Article Body */}
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6 whitespace-pre-wrap">
          {post.content}
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 flex items-center justify-between">
          <Link href="/blog" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            ← Explore More Articles
          </Link>
          <Link href="/" className="text-gray-500 hover:text-gray-900 font-medium text-sm">
            Visit Portfolio Home →
          </Link>
        </div>
      </main>
    </div>
  );
}