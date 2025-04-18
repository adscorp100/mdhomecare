
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import blogPosts from "../data/blogPosts.json";

const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_');
};

const BlogPost = () => {
  const { title } = useParams();
  const post = blogPosts.find((post) => createSlug(post.title) === title);

  if (!post) {
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
          <div className="prose prose-lg max-w-none">
            <p>{post.description}</p>
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogPost;
