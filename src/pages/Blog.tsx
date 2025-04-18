
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";

const blogPosts = [
  {
    title: "Understanding Home Healthcare Options",
    date: "2025-04-15",
    description: "A comprehensive guide to different types of home healthcare services available for your loved ones.",
    readTime: "5 min read",
  },
  {
    title: "The Benefits of Personal Care Services",
    date: "2025-04-10",
    description: "Discover how personal care services can improve quality of life for seniors and those with disabilities.",
    readTime: "4 min read",
  },
  {
    title: "Choosing the Right Caregiver",
    date: "2025-04-05",
    description: "Important factors to consider when selecting a caregiver for your family member.",
    readTime: "6 min read",
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Blog</h1>
          <p className="text-xl text-gray-600">Latest insights and updates from MD Homecare</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Card key={post.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{post.title}</CardTitle>
                <CardDescription>
                  <div className="flex justify-between text-sm">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{post.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
