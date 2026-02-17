import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Text } from "../atoms/Text"
import axios from 'axios';
import { TestimonialTexts } from "../particles/DataLists"
import Slider from "react-slick";
import { Button } from "../atoms/Button";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { Card } from "../molecules/Card";
import ProfileImg1 from "../../assets/profile1.jpeg"
import ProfileImg2 from "../../assets/profile2.jpeg"
import ProfileImg3 from "../../assets/profile3.jpeg"
import ProfileImg4 from "../../assets/profile4.jpeg"

type ApiComment = {
  id: number;
  content: string;
  rating: number;
  created_at: string;
  user?: { name: string };
  guest_name?: string;
};

const Testimonials = () => {
    const sliderRef = useRef<Slider | null>();
    const [apiTestimonials, setApiTestimonials] = useState<ApiComment[]>([]);

    useEffect(() => {
      const load = async () => {
        try {
          const res = await axios.get('http://localhost:8000/api/comments');
          if (res.data.success) {
            const filtered = (res.data.data as ApiComment[]).filter((c) => (c.rating ?? 0) >= 3);
            setApiTestimonials(filtered.slice(0, 10));
          }
        } catch (e) {
          // silent fail, fallback to static testimonials
        }
      };

      const onUpdated = () => load();

      // initial load
      load();

      // refresh instantly after comment submit
      window.addEventListener('comments:updated', onUpdated);
      return () => window.removeEventListener('comments:updated', onUpdated);
    }, []);

    const testimonialFeed = useMemo(() => {
      if (apiTestimonials.length > 0) {
        return apiTestimonials.map((c) => ({
          text: c.content,
          person: c.user?.name || c.guest_name || 'Guest',
          location: `Rating: ${c.rating}/5`,
        }));
      }
      return TestimonialTexts.feedBacks;
    }, [apiTestimonials]);

    // Function for next button
    const next = () => {
        if (sliderRef.current) {
            sliderRef.current.slickNext();
        }
    };
    // function for previous button
    const previous = () => {
        if (sliderRef.current) {
            sliderRef.current.slickPrev();
        }
    };

    // Slider settings
    const settings = {
        dots: false,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        vertical: true,
        verticalSwiping: true,

    };

    const renderProfileImg = useCallback((element: number) => {
        switch (element) {
            case 0:
                return ProfileImg2;
            case 1:
                return ProfileImg1;
            case 2:
                return ProfileImg3;
            case 3:
                return ProfileImg4;
            default:
                return "";
        }
    }, [])

    return (
        <section className="w-full h-auto flex flex-col items-start justify-center relative lg:px-24 md:px-10 px-6 mt-12 gap-5">
            <main className='w-full grid md:grid-cols-2 lg:gap-0 gap-8 md:gap-5'>
                {/* Text and Steps Container  */}
                <div className='w-full flex flex-col gap-6'>
                    <Text as="p" className="font-light text-base text-color3/80 tracking-widest">
                        {TestimonialTexts.firstText}
                    </Text>
                    <Text as="h1" className="lg:text-5xl md:text-3xl text-4xl text-color3 font-medium">
                        {TestimonialTexts.secondText}
                    </Text>
                </div>
                {/* Testimonial Slides Container  */}
                <div className="w-full lg:h-[400px] flex justify-center gap-4 items-center">
                    <div className="lg:h-[250px] w-[90%]">
                        <Slider ref={(slider) => (sliderRef.current = slider)} {...settings}>
                            {
                                testimonialFeed.map((feedBack, index) => (
                                    <div key={index} className="w-full">
                                        <Card cardClass="bg-white shadow border-[1px] border-color3/10 relative rounded-xl p-4 lg:h-[200px] h-[260px] lg:mb-4 w-full flex gap-4 justify-start" imageAlt={feedBack.person} imageSrc={renderProfileImg(index)} imageWrapperClass="w-20 h-20 rounded-full absolute lg:bottom-4 bottom-3 right-4 overflow-hidden" cover="object-cover object-top" textWrapperClass="flex flex-col justify-center gap-6">
                                            <Text as="q" className="text-[0.84rem] font-light text-color3">
                                                {feedBack.text}
                                            </Text>
                                            <div className="flex flex-col gap-2">
                                                <Text as="h4" className="text-base text-color3 font-medium">
                                                    {feedBack.person}
                                                </Text>
                                                <Text as="p" className="text-sm text-color3 font-light">
                                                    {feedBack.location}
                                                </Text>
                                            </div>
                                        </Card>
                                    </div>
                                ))
                            }
                        </Slider>
                    </div>
                    {/* Controllers  */}
                    <div className="flex flex-col gap-4 pb-5">
                        <Button onClick={previous} id="prev" className="cursor-pointer outline-none border-none bg-color2/30 text-color3 hover:bg-color2 p-2 rounded-full" type="button">
                            <CaretUp size={18} color="currentColor" weight="fill" />
                        </Button>
                        <Button onClick={next} id="next" className="cursor-pointer outline-none border-none bg-color2/30 text-color3 hover:bg-color2 p-2 rounded-full" type="button">
                            <CaretDown size={18} color="currentColor" weight="fill" />
                        </Button>
                    </div>
                </div>
            </main>
        </section>
    )
}

export default Testimonials