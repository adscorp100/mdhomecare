import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import useDocumentTitle from "@/hooks/useDocumentTitle";

// Define the BlogPost interface
interface BlogPost {
  title: string;
  slug: string;
  date: string;
  description: string;
  image?: string;
  readTime: string;
}

const Blog = () => {
  useDocumentTitle('Blog');
  
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the blog post index
    fetch('/data/blog/posts.json')
      .then(response => response.json())
      .then(data => {
        setBlogPosts(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading blog posts:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p>Loading blog posts...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Blog</h1>
          <p className="text-xl text-gray-600">Latest insights and updates from MD Homecare</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`}>
              <Card className="hover:shadow-lg transition-shadow h-full">
                {post.image && (
                  <div className="w-full h-48 overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <CardDescription className="flex justify-between text-sm">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{post.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Blog;
