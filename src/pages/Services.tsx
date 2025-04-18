
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { Heart, Home, Clock, UserCheck } from "lucide-react";

const services = [
  {
    title: "Personal Care",
    description: "Assistance with daily activities including bathing, dressing, and grooming.",
    icon: Heart,
  },
  {
    title: "Home Healthcare",
    description: "Professional medical care services provided in the comfort of your home.",
    icon: Home,
  },
  {
    title: "24/7 Care",
    description: "Round-the-clock care and supervision for those who need continuous support.",
    icon: Clock,
  },
  {
    title: "Companion Care",
    description: "Friendly companionship and assistance with daily activities and errands.",
    icon: UserCheck,
  },
];

const Services = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h1>
          <p className="text-xl text-gray-600">Comprehensive home care solutions for your loved ones</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {services.map((service) => (
            <Card key={service.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-[#E5DEFF] rounded-lg">
                    <service.icon className="h-6 w-6 text-[#8B5CF6]" />
                  </div>
                  <CardTitle>{service.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{service.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
