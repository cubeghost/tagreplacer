import React, { useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

const CONNECTOR_WIDTH = 16;

let connectorId = 0;
const useConnectorId = () => {
  const idRef = useRef();

  if (!idRef.current) {
    idRef.current = connectorId++;
  }

  return idRef.current;
};

const Connector = ({ startRef, endRef, setDrawRef, side, disabled }) => {
  const ref = useRef();
  const id = useConnectorId();

  const draw = useCallback(() => {
    // console.log("draw");
    const svgElement = ref.current;
    const parentRect = ref.current.parentElement.getBoundingClientRect();
    const startRect = startRef.current.getBoundingClientRect();
    const endRect = endRef.current.getBoundingClientRect();

    const top = startRect.top - parentRect.top;
    const bottom = endRect.top - parentRect.top + endRect.height;
    const height = bottom - top;
    const scale = window.devicePixelRatio;

    svgElement.style.top = `${top}px`;
    svgElement.style.height = `${height}px`;
    svgElement.setAttribute("viewBox", `0 0 ${CONNECTOR_WIDTH} ${height}`);

    if (side === "left") {
      svgElement.style.transform = "translateX(-100%)";
    } else if (side === "right") {
      svgElement.style.transform = `translateX(${startRect.width}px)`;
    }

    const startMiddle = startRect.height / 2;
    const endMiddle = height - endRect.height / 2;
    const closeX = side === "left" ? CONNECTOR_WIDTH : 0;
    const farX = side === "left" ? 1 : CONNECTOR_WIDTH - 1;
    const sign = side === "left" ? 1 : -1;

    const path = `
			M ${closeX} ${startMiddle}
			L ${farX + sign * 3} ${startMiddle}
			Q ${farX} ${startMiddle}, 
			  ${farX} ${startMiddle + 3}
			L ${farX} ${endMiddle - 3}
			Q ${farX} ${endMiddle},
			  ${farX + sign * 3} ${endMiddle}
			L ${closeX} ${endMiddle}
		`;

    svgElement.querySelectorAll("path").forEach((p) => {
      p.setAttribute("d", path);
    });
  }, [side, startRef, endRef]);

  useEffect(() => {
    draw();

    const observer = new ResizeObserver((entries) => {
      draw();
    });

    observer.observe(startRef.current);
    observer.observe(endRef.current);

    return () => observer.disconnect();
  }, [draw]);

  useEffect(() => {
    if (setDrawRef) {
      setDrawRef({ [id]: draw });

      return () => {
        setDrawRef({ [id]: null });
      };
    }
  }, [setDrawRef, draw, id]);

  const pathProps = {
    fill: "none",
    strokeWidth: 1
  };

  return (
    <>
      <svg
        ref={ref}
        viewBox={`0 0 ${CONNECTOR_WIDTH} ${CONNECTOR_WIDTH}`}
        width={CONNECTOR_WIDTH}
        preserveAspectRatio="xMidYMin slice"
        style={{ position: "absolute" }}
        className={`svg-connector ${!disabled && "svg-connector-enabled"}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id={`stroke-${id}`} maskUnits="userSpaceOnUse">
            <path {...pathProps} stroke="#fff" className="mask-path" />
          </mask>
        </defs>
        <g mask={`url(#stroke-${id})`}>
          <path
            {...pathProps}
            stroke="#000"
            strokeDasharray="1 1"
            className="svg-connector-path"
          />
        </g>
      </svg>
    </>
  );
};

// Connector.propTypes = {
//   startRef: ;
//   endRef, setDrawRef, side, disabled
// }

export default React.memo(Connector);
