import './TemperatureSlider.scss';
import { TweenMax, Linear, Draggable, Elastic, Expo } from 'gsap/all';
import { TimelineMax } from 'gsap/TimelineMax';
import { useEffect } from 'react';

export const TemperatureSlider = ({ handleChange }) => {
  const arweave = window.Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https',
  });

  let temp = 0;
  useEffect(() => {
    let select = function (s) {
        return document.querySelector(s);
      },
      selectAll = function (s) {
        return document.querySelectorAll(s);
      },
      liquid = selectAll('.liquid'),
      label = select('.label'),
      follower = select('.follower'),
      dragger = select('.dragger'),
      dragTip = select('.dragTip'),
      whole = select('.god-box'),
      minDragY = -380,
      liquidId = 0,
      step = Math.abs(minDragY / 100),
      followerVY = 0;

    TweenMax.set('svg', {
      visibility: 'visible',
    });

    TweenMax.set(dragTip, {
      transformOrigin: '20% 50%',
    });

    let tl = new TimelineMax();
    tl.staggerTo(
      liquid,
      0.7,
      {
        x: '-=200',
        ease: Linear.easeNone,
        repeat: -1,
      },
      0.9
    );

    tl.time(100);

    document.addEventListener('touchmove', function (event) {
      event.preventDefault();
    });

    Draggable.create(dragger, {
      type: 'y',
      bounds: { minY: minDragY, maxY: 0 },
      onDrag: onUpdate,
      throwProps: true,
      throwResistance: 2300,
      onThrowUpdate: onUpdate,
      overshootTolerance: 0,
    });
    whole.addEventListener('mouseup', async function () {
      let date = new Date();
      console.log(temp != localStorage.getItem('currentTemp'));
      if (temp != localStorage.getItem('currentTemp')) {
        localStorage.setItem('currentTemp', JSON.parse(temp));
        handleChange({
          date: date.toGMTString(),
          temperature: temp,
        });
        await window.arweaveWallet.connect([
          'ACCESS_ADDRESS',
          'ACCESS_ALL_ADDRESSES',
          'SIGN_TRANSACTION',
        ]);

        const tx = await arweave.createTransaction(
          {
            data: JSON.stringify({
              newTemperatureValue: temp,
              contractAddres: 'x_ylfKSDlwynd5cEmAAsIwCNO4c3iY2mrKujb9xjnbk',
            }),
          },
          'use_wallet'
        );
        await arweave.transactions.sign(tx, 'use_wallet');
        await arweave.transactions.post(tx);
      }
    });

    function onUpdate() {
      liquidId = Math.abs(Math.round(dragger._gsTransform.y / step));
      temp = liquidId;
      label.textContent = liquidId + '°';
      TweenMax.to(liquid, 1.3, {
        y: dragger._gsTransform.y * 1.12,
        ease: Elastic.easeOut.config(1, 0.4),
      });
    }

    TweenMax.to(follower, 1, {
      y: '+=0',
      repeat: -1,
      modifiers: {
        y: function () {
          followerVY +=
            (dragger._gsTransform.y - follower._gsTransform.y) * 0.23;
          followerVY *= 0.69;
          return follower._gsTransform.y + followerVY;
        },
      },
    });

    TweenMax.to(dragTip, 1, {
      rotation: '+=0',
      repeat: -1,
      modifiers: {
        rotation: function (rotation) {
          return rotation - followerVY;
        },
      },
    });

    TweenMax.to(label, 1, {
      y: '+=0',
      repeat: -1,
      modifiers: {
        y: function (y) {
          return y - followerVY * 0.5;
        },
      },
    });

    TweenMax.to(dragger, 1.4, {
      y: minDragY / 2,
      onUpdate: onUpdate,
      ease: Expo.easeInOut,
    });
  }, []);

  return (
    <>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        xmlnsXlink='http://www.w3.org/1999/xlink'
        viewBox='0 50 20 600'
      >
        <defs>
          <linearGradient
            id='liquidGrad'
            x1='557'
            y1='150'
            x2='557'
            y2='546'
            gradientUnits='userSpaceOnUse'
          >
            <stop offset='0' stop-color='#FF0909' />
            <stop offset='0.2' stop-color='#F3481A' />
            <stop offset='0.5' stop-color='#FABA2C' />
            <stop offset='1' stop-color='#00BCF2' />
          </linearGradient>
          <rect
            id='tube'
            x='357'
            y='150'
            width='86'
            height='400'
            rx='43'
            ry='43'
          />
          <clipPath id='liquidMask'>
            <use xlinkHref='#tube' class='liquidMask' />
          </clipPath>
          <clipPath id='tubeMask'>
            <use xlinkHref='#tube' class='liquidMask' />
          </clipPath>
          <path
            id='liquid'
            d='M757,552v490H357V552c50,0,50,20,100,20s50-20,100-20,50,20,100,20S707,552,757,552Z'
          />
          <mask id='gradMask'>
            <use xlinkHref='#liquid' class='liquid' x='0' fill='#FCEFD6' />
            <use
              xlinkHref='#liquid'
              class='liquid'
              x='0'
              fill='#EEE'
              opacity='0.7'
            />
          </mask>
        </defs>

        <g class='whole' transform='translate(0, -40)'>
          <use xlinkHref='#tube' class='tubeBg' fill='#C8D9D3' opacity='0.61' />

          <g class='dragger' transform='translate(-6, 0)'>
            <circle cx='294' cy='540' r='36' fill='#3A3335' />
            <path
              class='dragTip'
              d='M315.5,556.76,299.24,540.5l16.26-16.26,36.26,16.26Z'
              fill='#3A3335'
            />
            <text class='label' x='294' y='551'>
              100
            </text>
          </g>

          <g mask='url(#gradMask)'>
            <use xlinkHref='#tube' fill='url(#liquidGrad)' />
          </g>
          <line
            class='tubeShine'
            x1='371'
            y1='200'
            x2='371'
            y2='443'
            fill='none'
            stroke='#FFF'
            stroke-linecap='round'
            stroke-miterlimit='10'
            stroke-width='8'
            opacity='0.21'
            stroke-dasharray='153 30'
            stroke-dashoffset='-20'
          />
          <g
            class='measurements'
            fill='none'
            stroke='#FCEFD6'
            stroke-width='3'
            stroke-linecap='round'
            opacity='1'
          >
            <line x1='358' y1='196' x2='370' y2='196' />
            <line x1='358' y1='234' x2='370' y2='234' />
            <line x1='358' y1='273' x2='370' y2='273' />
            <line x1='358' y1='311' x2='370' y2='311' />
            <line x1='358' y1='350' x2='370' y2='350' />
            <line x1='358' y1='388' x2='370' y2='388' />
            <line x1='358' y1='426' x2='370' y2='426' />
            <line x1='358' y1='465' x2='370' y2='465' />
            <line x1='358' y1='503' x2='370' y2='503' />
          </g>

          <circle
            class='follower'
            cx='400'
            cy='540'
            r='0'
            fill='#62B6CB'
            fill-opacity='1'
            stroke='#FCEFD6'
            stroke-width='0'
          />
        </g>
      </svg>
    </>
  );
};
