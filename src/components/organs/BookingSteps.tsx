import { Text } from '../atoms/Text';
import { Card } from '../molecules/Card';
import { BookingStepsTexts } from '../particles/DataLists';
import CardImage1 from '../../assets/femmej2.jpeg';
import CardImage2 from '../../assets/femmej.jpeg';

const BookingSteps = () => {
  return (
    <section className="w-full h-auto flex lg:flex-row flex-col items-center justify-between lg:px-24 md:px-12 px-6 gap-10 lg:gap-4 my-14">
      {/* Left Side - Steps */}
      <main className="lg:w-1/2 w-full flex flex-col gap-6">
        <Text as="p" className="font-light text-base text-color3/80 tracking-widest uppercase">
          {BookingStepsTexts.firstText}
        </Text>
        <Text as="h2" className="md:text-4xl text-2xl font-medium text-color3 leading-snug">
          {BookingStepsTexts.secondText}
        </Text>

        <div className="flex flex-col gap-8 mt-6">
          {BookingStepsTexts.listOfSteps.map((step, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-color2 flex items-center justify-center text-white font-bold text-xl">
                {index + 1}
              </div>
              <div className="flex-1">
                <Text as="p" className="text-color3 font-light leading-relaxed">
                  {step.text}
                </Text>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Right Side - Images */}
      <main className="lg:w-1/2 w-full flex flex-col gap-6 relative">
        <Card
          cardClass="bg-white shadow-lg rounded-2xl overflow-hidden"
          imageWrapperClass="w-full h-64"
          imageSrc={CardImage1}
          imageAlt="Booking"
          cover="object-cover"
          textWrapperClass="p-5"
        >
          <Text as="h4" className="text-lg font-semibold text-color3 mb-2">
            {BookingStepsTexts.cardOne.name}
          </Text>
          <Text as="p" className="text-sm text-color3/70 mb-1">
            {BookingStepsTexts.cardOne.date}
          </Text>
          <Text as="p" className="text-sm text-color4">
            {BookingStepsTexts.cardOne.people}
          </Text>
        </Card>

        <div className="bg-white shadow-lg rounded-2xl p-6 ml-12">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-full bg-gray-200"></div>
            <div>
              <Text as="p" className="text-sm text-color3/70">
                {BookingStepsTexts.cardTwo.status}
              </Text>
              <Text as="h4" className="text-base font-semibold text-color3">
                {BookingStepsTexts.cardTwo.destination}
              </Text>
            </div>
          </div>
          <Text as="p" className="text-sm text-color4 font-medium">
            {BookingStepsTexts.cardTwo.completion}
          </Text>
          <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
            <div className="w-2/5 h-full bg-color2 rounded-full"></div>
          </div>
        </div>

        <img
          src={CardImage2}
          alt="Traveler"
          className="hidden"
        />
      </main>
    </section>
  );
};

export default BookingSteps;
