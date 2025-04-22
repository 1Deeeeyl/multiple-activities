import React from 'react';

type HeroProps = {
  h1: string;
  description: string;
};

export default function Hero({ h1, description }: HeroProps) {
  return (
    <>
      <section className="bg-white p-5 rounded-md  mb-[25px]">
        <h1 className="font-bold text-5xl">{h1}</h1>
        <p className='mt-3'>{description}</p>
      </section>
    </>
  );
}
