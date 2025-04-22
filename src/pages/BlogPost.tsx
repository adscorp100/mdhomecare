import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback, useRef } from "react";
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

// Define Service interface
interface Service {
  title: string;
  slug: string;
  description: string;
  image: string;
  category: string;
  keywords: string[];
}

// Define heading structure for TOC
interface TocHeading {
  id: string;
  text: string;
  level: number;
}

// Helper function to abbreviate heading text
const abbreviateHeadingText = (text: string, maxLength: number = 35): string => {
  if (text.length <= maxLength) return text;
  
  // Try to cut at a word boundary
  const truncated = text.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > maxLength * 0.7) { // Only cut at word if it's not too far back
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  return truncated + '...';
};

const TableOfContents = ({ headings }: { headings: TocHeading[] }) => {
  if (headings.length === 0) return null;
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (!element) return;
    
    window.scrollTo({
      top: element.offsetTop - 80, // Increased offset to account for fixed headers
      behavior: 'smooth'
    });
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-4 w-full">
      <div className="flex items-center gap-2 mb-2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 5H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M3 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M3 19H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <h2 className="text-base font-semibold">Table of Contents</h2>
      </div>
      <ul className="space-y-1.5">
        {headings.map((heading) => {
          const displayText = abbreviateHeadingText(heading.text);
          
          return (
            <li key={heading.id} className="text-sm">
              <a 
                href={`#${heading.id}`} 
                className="flex items-center text-gray-700 hover:text-blue-600" 
                style={{ paddingLeft: `${(heading.level - 2) * 1}rem` }}
                onClick={(e) => handleClick(e, heading.id)}
              >
                <ChevronRight className="w-3 h-3 mr-1.5 flex-shrink-0 text-gray-400" />
                <span className="block overflow-hidden" title={heading.text}>
                  {displayText}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Set the document title with a placeholder while loading
  useDocumentTitle(post ? post.title : 'Blog Post');

  // Fetch all services
  useEffect(() => {
    fetch('/data/services/services.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load services');
        }
        return response.json();
      })
      .then(data => {
        setServices(data);
      })
      .catch(error => {
        console.error('Error loading services:', error);
      });
  }, []);

  // Process content to add service links
  const processContentWithServiceLinks = useCallback((content: string, services: Service[]) => {
    if (!services.length) return content;
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Get all text nodes in the document
    const textWalker = document.createTreeWalker(
      doc.body,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    // Track which keywords have been linked to avoid duplicate links in proximity
    const linkedKeywords = new Set<string>();
    const paragraphsWithLinks = new Set<Node>();
    
    // Store nodes to be processed after walking to avoid modifying during traversal
    const nodesToProcess: Array<{
      node: Text,
      keyword: string,
      service: Service,
      matchIndex: number
    }> = [];
    
    // Check text nodes for keyword matches
    let currentNode: Text | null;
    while ((currentNode = textWalker.nextNode() as Text)) {
      // Skip already processed nodes or nodes in elements we want to exclude (like anchors)
      if (
        currentNode.parentElement?.tagName === 'A' ||
        currentNode.parentElement?.closest('a') ||
        currentNode.parentElement?.classList.contains('no-links')
      ) {
        continue;
      }
      
      const text = currentNode.textContent || '';
      const parentParagraph = currentNode.parentElement?.closest('p, li, td');
      
      // Limit links per paragraph
      if (parentParagraph && paragraphsWithLinks.has(parentParagraph) && 
          parentParagraph.querySelectorAll('a').length >= 2) {
        continue;
      }
      
      // Check each service for matches in this text node
      for (const service of services) {
        // Skip services without keywords
        if (!service.keywords || service.keywords.length === 0) continue;
        
        for (const keyword of service.keywords) {
          // Skip short keywords to avoid too many links
          if (keyword.length < 5) continue;
          
          // Skip already linked keywords
          if (linkedKeywords.has(keyword.toLowerCase())) continue;
          
          // Case insensitive search
          const regex = new RegExp(`\\b${keyword}\\b`, 'i');
          const match = text.match(regex);
          
          if (match && match.index !== undefined) {
            nodesToProcess.push({
              node: currentNode,
              keyword: match[0], // Use matched text to preserve casing
              service,
              matchIndex: match.index
            });
            
            // Add to linked keywords to avoid duplication
            linkedKeywords.add(keyword.toLowerCase());
            
            // Mark paragraph as having links
            if (parentParagraph) {
              paragraphsWithLinks.add(parentParagraph);
            }
            
            // Only use one keyword per service per document to avoid over-linking
            break;
          }
        }
      }
    }
    
    // Process the nodes (in reverse to maintain indices)
    for (let i = nodesToProcess.length - 1; i >= 0; i--) {
      const { node, keyword, service, matchIndex } = nodesToProcess[i];
      
      // Split text node into parts
      const beforeText = node.textContent?.substring(0, matchIndex) || '';
      const matchedText = node.textContent?.substring(matchIndex, matchIndex + keyword.length) || '';
      const afterText = node.textContent?.substring(matchIndex + keyword.length) || '';
      
      // Create new nodes
      const afterNode = document.createTextNode(afterText);
      const linkNode = document.createElement('a');
      linkNode.href = `/services/${service.slug}`;
      linkNode.textContent = matchedText;
      linkNode.className = 'text-blue-600 hover:underline font-medium';
      linkNode.title = service.title.replace('{suburb}', '');
      
      // Replace the original text node with the new nodes
      const parentNode = node.parentNode;
      if (parentNode) {
        node.textContent = beforeText;
        parentNode.insertBefore(afterNode, node.nextSibling);
        parentNode.insertBefore(linkNode, afterNode);
      }
    }
    
    return doc.body.innerHTML;
  }, []);

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
          // Process content with service links if services are loaded
          if (services.length > 0 && data.content) {
            const processedContent = processContentWithServiceLinks(data.content, services);
            data.content = processedContent;
          }
          
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
  }, [slug, parseHeadings, services, processContentWithServiceLinks]);

  // Apply IDs to headings after content is rendered
  useEffect(() => {
    if (contentRef.current && headings.length > 0) {
      const renderedHeadings = contentRef.current.querySelectorAll('h2, h3, h4, h5, h6');
      
      renderedHeadings.forEach((heading, index) => {
        if (index < headings.length) {
          heading.id = headings[index].id;
        }
      });
    }
  }, [headings, post?.content]);

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
                ref={contentRef}
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
