import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from "react";
import "./BlogPost.css"; // Import custom CSS for blog formatting
import useDocumentTitle from "@/hooks/useDocumentTitle";

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

// Define heading structure for TOC
interface TocHeading {
  id: string;
  text: string;
  level: number;
}

const TableOfContents = ({ headings }: { headings: TocHeading[] }) => {
  if (headings.length === 0) return null;
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (!element) return;
    
    window.scrollTo({
      top: element.offsetTop - 20,
      behavior: 'smooth'
    });
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 5H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M3 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M3 19H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <h2 className="text-base font-semibold">Table of Contents</h2>
      </div>
      <ul className="space-y-1.5">
        {headings.map((heading) => (
          <li key={heading.id} className="text-sm">
            <a 
              href={`#${heading.id}`} 
              className="flex items-center text-gray-700 hover:text-blue-600" 
              style={{ paddingLeft: `${(heading.level - 2) * 1}rem` }}
              onClick={(e) => handleClick(e, heading.id)}
            >
              <ChevronRight className="w-3 h-3 mr-1.5 flex-shrink-0 text-gray-400" />
              <span className="truncate block overflow-hidden" title={heading.text}>
                {heading.text}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  
  // Set the document title with a placeholder while loading
  useDocumentTitle(post ? post.title : 'Blog Post');

  // Extract headings from HTML content
  const parseHeadings = useCallback((htmlContent: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const headingElements = doc.querySelectorAll('h2, h3, h4, h5, h6');
    
    const tocHeadings: TocHeading[] = [];
    headingElements.forEach((element, index) => {
      // Generate ID if element doesn't have one
      const id = element.id || `heading-${index}`;
      
      // Update the original content to include IDs for scroll targets
      if (!element.id) {
        element.id = id;
      }
      
      const level = parseInt(element.tagName.substring(1));
      tocHeadings.push({
        id,
        text: element.textContent || '',
        level
      });
    });
    
    // Update the content with added IDs
    setPost(prev => 
      prev ? { ...prev, content: doc.body.innerHTML } : null
    );
    
    return tocHeadings;
  }, []);

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
          
          // Extract headings from the content
          if (data.content) {
            const extractedHeadings = parseHeadings(data.content);
            setHeadings(extractedHeadings);
          }
        })
        .catch(error => {
          console.error('Error loading blog post:', error);
          setError(true);
          setLoading(false);
        });
    }
  }, [slug, parseHeadings]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p>Loading blog post...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
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
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Button variant="ghost" asChild>
            <Link to="/blog" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
        </div>
        <article className="relative">
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
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* TOC on mobile - appears first in the order */}
            {headings.length > 0 && (
              <div className="lg:hidden mb-6">
                <TableOfContents headings={headings} />
              </div>
            )}
            
            <div className="lg:w-2/3">
              <div 
                className="prose prose-lg max-w-none" 
                dangerouslySetInnerHTML={{ __html: post.content }}
              ></div>
            </div>
            
            {/* TOC on desktop - appears on the side */}
            {headings.length > 0 && (
              <div className="hidden lg:block lg:w-1/3">
                <div className="lg:sticky lg:top-6">
                  <TableOfContents headings={headings} />
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </Layout>
  );
};

export default BlogPost;
