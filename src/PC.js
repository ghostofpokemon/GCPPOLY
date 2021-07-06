import React, {Component} from 'react';
import Particles from 'react-particles-js';

export class PC extends Component {
  render() {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          display: 'flex',
          height: '100%',
        }}
      >
        <Particles
          params={{
            retina_detect: true,
            particles: {
              number: {
                value: 250,
                density: {
                  enable: true,
                  value_area: 1803.42,
                },
              },
              color: {
                value: '#888',
              },
              shape: {
                type: 'dot',
                stroke: {
                  width: 7,
                  color: '#888',
                },
              },
              move: {
                speed: 0.5,
              },
            },
            line_linked: {
              enable: true,
              distance: 150,
              color: '#ffffff',
              opacity: 0.4,
              width: 8,
            },
          }}
        />
      </div>
    );
  }
}

export default PC;
