import { Text } from '../atoms/Text';
import { Card } from '../molecules/Card';
import { TopDestinationTexts } from '../particles/DataLists';
import City1 from '../../assets/img6.jpeg';
import City2 from '../../assets/beller.jpeg';
import City3 from '../../assets/duala-limbe.jpeg';
import City4 from '../../assets/yde-bamend.jpeg';
import City5 from '../../assets/img8.jpeg';
import City6 from '../../assets/img8.jpeg';


const TopDestination = () => {
  const cities = [City1, City2, City3, City4, City5, City6];

  return (
    <section id="top-destinations" className="w-full h-auto flex flex-col items-center justify-center relative lg:px-24 md:px-20 px-6 my-14">
      <Text as="p" className="font-light text-base text-color3/80 tracking-widest uppercase">
        {TopDestinationTexts.firstText}
      </Text>
      <Text as="h2" className="md:text-4xl text-2xl font-medium capitalize text-color3">
        {TopDestinationTexts.secondText}
      </Text>

      <div className="w-full h-auto mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {TopDestinationTexts.cards.map((card, index) => (
          <Card
            key={index}
            cardClass="overflow-hidden shadow-md rounded-lg cursor-pointer group hover:shadow-2xl transition-all duration-300"
            imageAlt={card.country}
            imageSrc={cities[index]}
            imageWrapperClass="w-full h-[250px] overflow-hidden"
            cover="group-hover:scale-125 transition duration-500 ease object-cover"
            textWrapperClass="flex flex-col gap-4 w-full px-5 py-5"
          >
            <div className="flex justify-between items-center">
              <Text as="h4" className="text-base font-medium text-color3">
                {card.country}
              </Text>
              <Text as="small" className="text-color3 font-light text-sm">
                {card.price}
              </Text>
            </div>
            <div className="w-full flex gap-4 items-center text-color3">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              <Text as="p" className="text-color3 font-light text-base">
                {card.duration}
              </Text>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default TopDestination;
