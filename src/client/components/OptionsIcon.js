import React from 'react';
import { animated, useSprings } from '@react-spring/web';
import PropTypes from 'prop-types';

const startPositions = [{ y: 8 }, { y: 11 }, { y: 4 }];
const endPositions = [{ y: 11 }, { y: 4 }, { y: 8 }];

const OptionsIcon = ({ active }) => {
  const positions = useSprings(3, active ? startPositions : endPositions);

  return (
    <svg
      viewBox="0 0 15 15"
      height="15"
      xmlns="http://www.w3.org/2000/svg"
      className="options-icon"
    >
      <defs>
        {positions.map(({ y }, index) => (
          <mask id={`shadow-${index}`} maskUnits="userSpaceOnUse" key={index}>
            <rect x={0} y={0} width={15} height={15} fill="#FFF" />
            <animated.rect
              x={index * 5}
              y={y.to((n) => n - 1)}
              width={5}
              height={1}
              fill="#000"
            />
          </mask>
        ))}
      </defs>
      <g className="foreground">
        {positions.map(({ y }, index) => (
          <g mask={`url(#shadow-${index})`} key={index}>
            <rect x={2 + index * 5} y={0} width={1} height={15} />
            <animated.rect x={index * 5} y={y} width={5} height={1} />
          </g>
        ))}
      </g>
    </svg>
  );
};

OptionsIcon.propTypes = {
  active: PropTypes.bool,
};

export default React.memo(OptionsIcon);
