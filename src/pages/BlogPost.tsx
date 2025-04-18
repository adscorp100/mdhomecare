import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import "./BlogPost.css"; // Import custom CSS for blog formatting

// Define the full BlogPost interface
interface BlogPost {
  title: string;
  slug: string;
  date: string;
  description: string;
  content: string;
  image?: string;
  readTime: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (slug) {
      // Fetch the specific blog post
      fetch(`/data/blog/${slug}.json`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Blog post not found');
          }
          return response.json();
        })
        .then(data => {
          setPost(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading blog post:', error);
          setError(true);
          setLoading(false);
        });
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p>Loading blog post...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <Button variant="ghost" asChild>
              <Link to="/blog" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Blog post not found</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link to="/blog" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
        </div>
        <article>
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
            <div className="flex gap-4 text-gray-600">
              <span>{post.date}</span>
              <span>{post.readTime}</span>
            </div>
          </header>
          {post.image && (
            <div className="mb-8">
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
          )}
          <div 
            className="prose prose-lg max-w-none" 
            dangerouslySetInnerHTML={{ __html: post.content }}
          ></div>
        </article>
      </div>
    </div>
  );
};

export default BlogPost;
