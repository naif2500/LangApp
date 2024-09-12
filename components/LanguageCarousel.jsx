import React from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import 'flag-icons/css/flag-icons.min.css';

const languages = [
  { name: 'French', code: 'fr' },
  { name: 'German', code: 'de' },
  { name: 'Spanish', code: 'es' },
  { name: 'Portuguese', code: 'pt' },
  { name: 'Bulgarian', code: 'bg' },
  { name: 'Chinese (CN)', code: 'cn' },
  { name: 'Czech', code: 'cz' },
  { name: 'Danish', code: 'dk' },
  { name: 'Dutch', code: 'nl' },
  { name: 'English', code: 'gb' },  
  { name: 'Estonian', code: 'ee' },
  { name: 'Finnish', code: 'fi' },
  { name: 'Greek', code: 'gr' },
  { name: 'Hungarian', code: 'hu' },
  { name: 'Indonesian', code: 'id' },
  { name: 'Italian', code: 'it' },
  { name: 'Japanese', code: 'jp' },
  { name: 'Korean', code: 'kr' },
  { name: 'Latvian', code: 'lv' },
  { name: 'Lithuanian', code: 'lt' },
  { name: 'Polish', code: 'pl' },
  { name: 'Romanian', code: 'ro' },
  { name: 'Russian', code: 'ru' },
  { name: 'Slovak', code: 'sk' },
  { name: 'Slovenian', code: 'si' },
  { name: 'Swedish', code: 'se' },
  { name: 'Turkish', code: 'tr' },
  { name: 'Ukrainian', code: 'ua' },
  { name: 'Vietnamese', code: 'vn' },
  { name: 'Chinese (TW)', code: 'tw' },
  { name: 'Croatian', code: 'hr' },
  { name: 'Malay', code: 'my' },
];

const LanguageCarousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="w-11/12 mx-auto mt-2 mb-20">
      <Slider {...settings}>
        {languages.map((language, index) => (
          <div key={index} className="px-2">
            <div className="bg-white  rounded-lg p-4 flex items-center justify-center space-x-4">
              <span className={`fi fi-${language.code} text-2xl`}></span>
              <p className="text-lg font-semibold">{language.name}</p>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default LanguageCarousel;
