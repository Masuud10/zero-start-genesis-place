import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { testimonials } from "./landingData";

const TestimonialsSection = () => {
  return (
    <section className="py-32 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-6 py-3 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium mb-8">
            <Star className="w-5 h-5 mr-2 fill-current" />
            Trusted by School Leaders Across Kenya
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Success Stories from Our Schools
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear directly from principals, teachers, and administrators who have
            transformed their schools with EduFam's comprehensive management
            system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-4 border-0 shadow-xl"
            >
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600">{testimonial.role}</p>
                    <p className="text-sm text-blue-600 font-medium">
                      {testimonial.school}
                    </p>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>

                <blockquote className="text-gray-700 text-lg leading-relaxed italic">
                  "{testimonial.content}"
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
