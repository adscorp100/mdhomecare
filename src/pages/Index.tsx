import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const Index = () => {
  useDocumentTitle('Home');
  
  return (
    <Layout>
      <div className="relative overflow-hidden">
        {/* Hero image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/assets/hero.webp" 
            alt="Home Healthcare Hero" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-40"></div>
        </div>
        
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-transparent sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-6 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="py-6 text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                  <span className="block">Exceptional Care,</span>
                  <span className="block text-[#0EA5E9]">Right at Home</span>
                </h1>
                <p className="mt-5 text-base text-gray-100 mx-auto sm:text-lg sm:max-w-xl md:mt-5 md:text-xl lg:mx-0">
                  Providing compassionate and professional home care services. We're dedicated to enhancing the quality of life for our clients in the comfort of their own homes.
                </p>
                <div className="mt-8 flex justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Button asChild className="bg-[#0EA5E9] hover:bg-[#0c8bc7]">
                      <Link to="/services">
                        View Our Services
                      </Link>
                    </Button>
                  </div>
                  <div className="ml-3">
                    <Button asChild variant="outline" className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white border-white">
                      <Link to="/blog">
                        Read Our Blog
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
